import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import {
  insertCreatorSchema,
  internalInsertCreatorSchema,
  insertBookingSchema,
  updateBookingStatusSchema,
  updateCreatorSchema,
  updateUserProfileSchema,
} from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";
import { getFirebaseAdmin } from "./firebase-admin";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { nanoid } from "nanoid";

const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    cb(null, allowed.includes(file.mimetype));
  },
});

interface RoomClient {
  ws: WebSocket;
  userId: string;
  userName: string;
}

declare global {
  namespace Express {
    interface Request {
      firebaseUid?: string;
    }
  }
}

async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.header("authorization") ?? "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res
        .status(401)
        .json({ message: "Unauthorized" });
    }
    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.firebaseUid = decoded.uid;
    next();
  } catch (err: unknown) {
    // Return generic message to avoid leaking internal error details
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.use("/uploads", express.static(uploadsDir));

  // --- File upload ---
  app.post("/api/upload", verifyAuth, upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No valid image file provided" });
    }
    const url = `/uploads/${req.file.filename}`;
    return res.json({ url });
  });

  // --- Creators ---
  app.get(api.creators.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const platform = req.query.platform as string | undefined;
    const creators = await storage.getCreators(search, platform);
    res.json(creators);
  });

  app.get(api.creators.get.path, async (req, res) => {
    const creator = await storage.getCreator(Number(req.params.id));
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }
    res.json(creator);
  });

  app.post(api.creators.list.path, verifyAuth, async (req, res) => {
    try {
      // Validate input using public schema (excludes firebaseUid and isVerified)
      const parsed = insertCreatorSchema.parse(req.body);

      // Explicitly set firebaseUid from the verified token
      const creator = await storage.createCreator({
        ...parsed,
        firebaseUid: req.firebaseUid!,
      });

      res.status(201).json(creator);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid creator data", errors: err.errors });
      } else {
        console.error("Creator creation error:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // --- Auth ---
  app.post(api.auth.sync.path, verifyAuth, async (req, res) => {
    try {
      const admin = getFirebaseAdmin();
      // Use req.firebaseUid set by verifyAuth instead of re-verifying
      const userRecord = await admin.auth().getUser(req.firebaseUid!);

      const user = await storage.upsertUserFromFirebase({
        firebaseUid: userRecord.uid,
        email: userRecord.email ?? null,
        displayName: userRecord.displayName ?? null,
        photoUrl: userRecord.photoURL ?? null,
      });

      return res.status(200).json({
        user: {
          id: user.id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          displayName: user.displayName,
          photoUrl: user.photoUrl,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unauthorized";
      return res.status(401).json({ message });
    }
  });

  // --- User profile ---
  app.get("/api/me/profile", verifyAuth, async (req, res) => {
    const user = await storage.getUserByFirebaseUid(req.firebaseUid!);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const creator = await storage.getCreatorByFirebaseUid(req.firebaseUid!);
    return res.json({
      user,
      isCreator: !!creator,
      creatorId: creator?.id ?? null,
      creatorUsername: creator?.username ?? null,
    });
  });

  app.patch("/api/me/profile", verifyAuth, async (req, res) => {
    try {
      const parsed = updateUserProfileSchema.parse(req.body);
      const updated = await storage.updateUserProfile(req.firebaseUid!, parsed);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: err.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- Current user's creator profile ---
  app.get("/api/me/creator", verifyAuth, async (req, res) => {
    const creator = await storage.getCreatorByFirebaseUid(req.firebaseUid!);
    if (!creator) {
      return res.status(404).json({ message: "No creator profile found" });
    }
    return res.json(creator);
  });

  app.patch("/api/me/creator", verifyAuth, async (req, res) => {
    try {
      const creator = await storage.getCreatorByFirebaseUid(req.firebaseUid!);
      if (!creator) {
        return res.status(404).json({ message: "No creator profile found" });
      }
      const parsed = updateCreatorSchema.parse(req.body);
      const updated = await storage.updateCreator(creator.id, parsed);
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: err.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- Bookings ---
  app.post("/api/bookings", verifyAuth, async (req, res) => {
    try {
      const parsed = insertBookingSchema.parse(req.body);
      const creator = await storage.getCreator(parsed.creatorId);
      if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
      }
      const booking = await storage.createBooking(req.firebaseUid!, parsed);
      return res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid booking data", errors: err.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/me/bookings", verifyAuth, async (req, res) => {
    const bookings = await storage.getBookingsForRequester(req.firebaseUid!);
    return res.json(bookings);
  });

  app.get("/api/me/requests", verifyAuth, async (req, res) => {
    const creator = await storage.getCreatorByFirebaseUid(req.firebaseUid!);
    if (!creator) {
      return res.status(404).json({ message: "No creator profile found" });
    }
    const requests = await storage.getBookingsForCreator(creator.id);
    return res.json(requests);
  });

  app.patch("/api/bookings/:id/status", verifyAuth, async (req, res) => {
    try {
      const parsed = updateBookingStatusSchema.parse(req.body);
      const booking = await storage.getBooking(Number(req.params.id));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const creator = await storage.getCreatorByFirebaseUid(req.firebaseUid!);
      if (!creator || creator.id !== booking.creatorId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      let roomId: string | undefined;
      if (
        parsed.status === "accepted" &&
        booking.sessionType === "video_call"
      ) {
        roomId = nanoid(12);
      }

      const updated = await storage.updateBookingStatus(
        booking.id,
        parsed.status,
        roomId,
      );
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid status", errors: err.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/me/earnings", verifyAuth, async (req, res) => {
    const creator = await storage.getCreatorByFirebaseUid(req.firebaseUid!);
    if (!creator) {
      return res.status(404).json({ message: "No creator profile found" });
    }
    const earnings = await storage.getEarningsForCreator(creator.id);
    return res.json(earnings);
  });

  app.get("/api/rooms/:roomId", verifyAuth, async (req, res) => {
    const roomIdParam = req.params.roomId;
    const roomId = Array.isArray(roomIdParam) ? roomIdParam[0] : roomIdParam;
    if (!roomId) {
      return res.status(400).json({ message: "Invalid room id" });
    }
    const booking = await storage.getBookingByRoomId(roomId);

    if (!booking) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isRequester = booking.requesterFirebaseUid === req.firebaseUid;
    const creator = await storage.getCreatorByFirebaseUid(req.firebaseUid!);
    const isCreator = creator && creator.id === booking.creatorId;

    if (!isRequester && !isCreator) {
      return res.status(403).json({ message: "Not authorized for this room" });
    }

    const bookingCreator = await storage.getCreator(booking.creatorId);

    return res.json({
      booking,
      creatorName: bookingCreator?.displayName ?? "Creator",
      role: isCreator ? "creator" : "requester",
    });
  });

  // --- WebSocket signaling server for WebRTC video calls ---
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const rooms = new Map<string, RoomClient[]>();
  // Performance Optimization: Track which rooms each client is in for O(1) cleanup.
  // Using a Set per client ensures robustness if a client is in multiple rooms.
  const clientRooms = new Map<WebSocket, Set<string>>();

  function getRoomClients(roomId: string): RoomClient[] {
    if (!rooms.has(roomId)) rooms.set(roomId, []);
    return rooms.get(roomId)!;
  }

  function removeClientFromRooms(ws: WebSocket) {
    const roomIds = clientRooms.get(ws);
    if (!roomIds) return;

    roomIds.forEach((roomId) => {
      const clients = rooms.get(roomId);
      if (clients) {
        const idx = clients.findIndex((c) => c.ws === ws);
        if (idx !== -1) {
          const [removed] = clients.splice(idx, 1);
          clients.forEach((c) => {
            if (c.ws.readyState === WebSocket.OPEN) {
              c.ws.send(
                JSON.stringify({
                  type: "peerLeft",
                  payload: { userId: removed.userId },
                }),
              );
            }
          });
          if (clients.length === 0) {
            rooms.delete(roomId);
          }
        }
      }
    });
    clientRooms.delete(ws);
  }

  wss.on("connection", (ws) => {
    ws.on("message", async (data) => {
      try {
        const { type, payload } = JSON.parse(data.toString());

        switch (type) {
          case "joinRoom": {
            const { roomId, userId, userName, authToken } = payload;
            if (!roomId || !userId || !authToken) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  payload: { message: "roomId, userId and authToken are required" },
                }),
              );
              return;
            }

            // Verify identity
            let authenticatedUid: string;
            try {
              const admin = getFirebaseAdmin();
              const decoded = await admin.auth().verifyIdToken(authToken);
              authenticatedUid = decoded.uid;
            } catch (err) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  payload: { message: "Authentication failed" },
                }),
              );
              return;
            }

            // Verify authorization for this room
            const booking = await storage.getBookingByRoomId(roomId);
            if (!booking) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  payload: { message: "Room not found" },
                }),
              );
              return;
            }

            const creator = await storage.getCreator(booking.creatorId);
            const isRequester = booking.requesterFirebaseUid === authenticatedUid;
            const isCreator = creator?.firebaseUid === authenticatedUid;

            if (!isRequester && !isCreator) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  payload: { message: "Not authorized for this room" },
                }),
              );
              return;
            }

            // Ensure client is removed from other rooms if application policy is 1 room at a time,
            // or just ensure state consistency. Original code called removeClientFromRooms(ws).
            removeClientFromRooms(ws);

            const clients = getRoomClients(roomId);

            if (clients.length >= 2) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  payload: { message: "Room is full (max 2 participants)" },
                }),
              );
              return;
            }

            const existingPeer = clients[0];
            clients.push({ ws, userId, userName: userName || userId });

            if (!clientRooms.has(ws)) {
              clientRooms.set(ws, new Set());
            }
            clientRooms.get(ws)!.add(roomId);

            if (existingPeer) {
              ws.send(
                JSON.stringify({
                  type: "peerJoined",
                  payload: {
                    partnerName: existingPeer.userName,
                    initiator: true,
                  },
                }),
              );
              if (existingPeer.ws.readyState === WebSocket.OPEN) {
                existingPeer.ws.send(
                  JSON.stringify({
                    type: "peerJoined",
                    payload: {
                      partnerName: userName || userId,
                      initiator: false,
                    },
                  }),
                );
              }
            } else {
              ws.send(
                JSON.stringify({ type: "roomJoined", payload: { roomId } }),
              );
            }
            break;
          }

          case "offer":
          case "answer":
          case "iceCandidate": {
            const { roomId } = payload;
            const clients = getRoomClients(roomId);
            clients.forEach((c) => {
              if (c.ws !== ws && c.ws.readyState === WebSocket.OPEN) {
                c.ws.send(JSON.stringify({ type, payload }));
              }
            });
            break;
          }

          case "leaveRoom": {
            removeClientFromRooms(ws);
            break;
          }
        }
      } catch {
        // malformed WS messages are silently ignored
      }
    });

    ws.on("close", () => {
      removeClientFromRooms(ws);
    });
  });

  seedDatabase().catch(() => {});

  return httpServer;
}

export async function seedDatabase() {
  const existingCreators = await storage.getCreators();
  if (existingCreators.length > 0) return;

  const initialCreators = [
    {
      username: "techguru",
      displayName: "Alex Rivera",
      bio: "Tech reviewer and software engineer. Helping you navigate the world of coding and gadgets.",
      socialHandle: "@arivera_tech",
      socialPlatform: "twitter",
      price: 150,
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      availability: "Mon-Fri, 2PM-6PM EST",
      categories: "Tech,Web Dev,Career Coaching",
      videoCallPrice: 150,
      audioConsultPrice: 275,
      dmBundlePrice: 45,
      deepDivePrice: 500,
    },
    {
      username: "sarahdesign",
      displayName: "Sarah Chen",
      bio: "Senior Product Designer at BigTech. I do portfolio reviews and career coaching for junior designers.",
      socialHandle: "@designwithsarah",
      socialPlatform: "instagram",
      price: 200,
      imageUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      availability: "Weekends only",
      categories: "Design,Career Coaching",
      videoCallPrice: 200,
      audioConsultPrice: 150,
      dmBundlePrice: null,
      deepDivePrice: 400,
    },
    {
      username: "markcrypto",
      displayName: "Mark Johnson",
      bio: "DeFi analyst and crypto educator. Let's talk about the future of finance.",
      socialHandle: "@mark_on_chain",
      socialPlatform: "twitter",
      price: 300,
      imageUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      isVerified: false,
      availability: "Tue & Thu, 10AM-2PM PST",
      categories: "Finance,Crypto",
      videoCallPrice: 300,
      audioConsultPrice: null,
      dmBundlePrice: 75,
      deepDivePrice: 600,
    },
    {
      username: "jessicalifestyle",
      displayName: "Jessica Wu",
      bio: "Lifestyle vlogger and content creator strategy consultant. Grow your audience authentically.",
      socialHandle: "@jesswu",
      socialPlatform: "instagram",
      price: 100,
      imageUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      availability: "Flexible schedule",
      categories: "Content Creation,Marketing",
      videoCallPrice: 100,
      audioConsultPrice: 80,
      dmBundlePrice: 30,
      deepDivePrice: null,
    },
    {
      username: "devdavid",
      displayName: "David Miller",
      bio: "Fullstack developer and open source contributor. Expert in React, Node.js, and Cloud Architecture.",
      socialHandle: "@david_codes",
      socialPlatform: "github",
      price: 120,
      imageUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      availability: "Evenings 6PM-9PM",
      categories: "Tech,Web Dev,AI / ML",
      videoCallPrice: 120,
      audioConsultPrice: 100,
      dmBundlePrice: 40,
      deepDivePrice: 250,
    },
    {
      username: "creativeanna",
      displayName: "Anna Smith",
      bio: "Digital artist and illustrator. Offering mentorship and art critiques.",
      socialHandle: "@annadraws",
      socialPlatform: "instagram",
      price: 90,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      isVerified: false,
      availability: "Mon, Wed, Fri",
      categories: "Design,Content Creation",
      videoCallPrice: 90,
      audioConsultPrice: null,
      dmBundlePrice: 25,
      deepDivePrice: null,
    },
  ];

  for (const creator of initialCreators) {
    const parsed = internalInsertCreatorSchema.parse(creator);
    await storage.createCreator(parsed);
  }
  console.log("Database seeded successfully.");
}
