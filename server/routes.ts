import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertCreatorSchema, internalInsertCreatorSchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";
import { getFirebaseAdmin } from "./firebase-admin";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

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

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.use("/uploads", express.static(uploadsDir));

  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No valid image file provided" });
    }
    const url = `/uploads/${req.file.filename}`;
    return res.json({ url });
  });

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

  app.post(api.creators.list.path, async (req, res) => {
    try {
      const authHeader = req.header("authorization") ?? "";
      const match = authHeader.match(/^Bearer\s+(.+)$/i);
      if (!match) {
        return res
          .status(401)
          .json({ message: "Missing or invalid Authorization header" });
      }

      const idToken = match[1];
      const admin = getFirebaseAdmin();
      const decoded = await admin.auth().verifyIdToken(idToken);

      // Validate input using public schema (excludes firebaseUid and isVerified)
      const parsed = insertCreatorSchema.parse(req.body);

      // Explicitly set firebaseUid from the verified token
      const creator = await storage.createCreator({
        ...parsed,
        firebaseUid: decoded.uid,
      });

      res.status(201).json(creator);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid creator data", errors: err.errors });
      } else {
        console.error("Creator creation error:", err);
        const isAuthError = err instanceof Error && "code" in err && (err as any).code?.startsWith("auth/");
        const message = isAuthError ? "Unauthorized" : "Internal server error";
        res.status(isAuthError ? 401 : 500).json({ message });
      }
    }
  });

  app.get("/api/me/creator", async (req, res) => {
    try {
      const authHeader = req.header("authorization") ?? "";
      const match = authHeader.match(/^Bearer\s+(.+)$/i);
      if (!match) {
        return res
          .status(401)
          .json({ message: "Missing or invalid Authorization header" });
      }

      const idToken = match[1];
      const admin = getFirebaseAdmin();
      const decoded = await admin.auth().verifyIdToken(idToken);
      const creator = await storage.getCreatorByFirebaseUid(decoded.uid);

      if (!creator) {
        return res.status(404).json({ message: "No creator profile found" });
      }

      return res.json(creator);
    } catch (err: unknown) {
      console.error("me/creator error:", err);
      const message = err instanceof Error ? err.message : "Unauthorized";
      return res.status(401).json({ message });
    }
  });

  app.post("/api/auth/sync", async (req, res) => {
    try {
      const authHeader = req.header("authorization") ?? "";
      const match = authHeader.match(/^Bearer\s+(.+)$/i);
      if (!match) {
        return res
          .status(401)
          .json({ message: "Missing or invalid Authorization header" });
      }

      const idToken = match[1];
      const admin = getFirebaseAdmin();
      const decoded = await admin.auth().verifyIdToken(idToken);

      const firebaseUid = decoded.uid;
      const email = decoded.email ?? null;
      const displayName =
        (decoded.name as string | undefined) ??
        (decoded as { display_name?: string }).display_name ??
        null;
      const photoUrl =
        (decoded.picture as string | undefined) ??
        (decoded as { photo_url?: string }).photo_url ??
        null;

      const user = await storage.upsertUserFromFirebase({
        firebaseUid,
        email,
        displayName,
        photoUrl,
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
      console.error("auth/sync error:", err);
      const message = err instanceof Error ? err.message : "Unauthorized";
      return res.status(401).json({ message });
    }
  });

  // --- WebSocket signaling server for WebRTC video calls ---
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const rooms = new Map<string, RoomClient[]>();
  // Performance: Use clientRooms map to provide O(1) lookup for a client's room associations
  // A single client (WebSocket) may be associated with multiple rooms
  const clientRooms = new Map<WebSocket, Set<string>>();

  function getRoomClients(roomId: string): RoomClient[] {
    if (!rooms.has(roomId)) rooms.set(roomId, []);
    return rooms.get(roomId)!;
  }

  function removeClientFromRooms(ws: WebSocket) {
    // Performance: Use clientRooms map for O(1) room lookup instead of iterating over all rooms
    const activeRooms = clientRooms.get(ws);
    if (!activeRooms) return;

    activeRooms.forEach((roomId) => {
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
    ws.on("message", (data) => {
      try {
        const { type, payload } = JSON.parse(data.toString());

        switch (type) {
          case "joinRoom": {
            const { roomId, userId, userName } = payload;
            if (!roomId || !userId) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  payload: { message: "roomId and userId are required" },
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

            // Tracking the room association for O(1) removal
            let activeRooms = clientRooms.get(ws);
            if (!activeRooms) {
              activeRooms = new Set();
              clientRooms.set(ws, activeRooms);
            }
            activeRooms.add(roomId);

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
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    });

    ws.on("close", () => {
      removeClientFromRooms(ws);
    });
  });

  seedDatabase().catch((err) => console.error("Error seeding database:", err));

  return httpServer;
}

// Function to seed database with initial data
export async function seedDatabase() {
  const existingCreators = await storage.getCreators();
  if (existingCreators.length === 0) {
    console.log("Seeding database with initial creators...");

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
}
