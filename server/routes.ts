import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertCreatorSchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";

interface RoomClient {
  ws: WebSocket;
  userId: string;
  userName: string;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.creators.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const platform = req.query.platform as string | undefined;
    const creators = await storage.getCreators(search, platform);
    res.json(creators);
  });

  app.get(api.creators.get.path, async (req, res) => {
    const creator = await storage.getCreator(Number(req.params.id));
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }
    res.json(creator);
  });

  app.post(api.creators.list.path, async (req, res) => {
    try {
      const parsed = insertCreatorSchema.parse(req.body);
      const creator = await storage.createCreator(parsed);
      res.status(201).json(creator);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid creator data", errors: err.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // --- WebSocket signaling server for WebRTC video calls ---
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const rooms = new Map<string, RoomClient[]>();

  // WebSocket message schemas for validation
  const joinRoomSchema = z.object({
    roomId: z.string().min(1),
    userId: z.string().min(1),
    userName: z.string().optional(),
  });

  const signalingSchema = z.object({
    roomId: z.string().min(1),
  }).passthrough();

  const wsMessageSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("joinRoom"), payload: joinRoomSchema }),
    z.object({ type: z.literal("offer"), payload: signalingSchema }),
    z.object({ type: z.literal("answer"), payload: signalingSchema }),
    z.object({ type: z.literal("iceCandidate"), payload: signalingSchema }),
    z.object({ type: z.literal("leaveRoom"), payload: z.any().optional() }),
  ]);

  function getRoomClients(roomId: string): RoomClient[] {
    if (!rooms.has(roomId)) rooms.set(roomId, []);
    return rooms.get(roomId)!;
  }

  function removeClientFromRooms(ws: WebSocket) {
    for (const [roomId, clients] of rooms.entries()) {
      const idx = clients.findIndex((c) => c.ws === ws);
      if (idx !== -1) {
        const [removed] = clients.splice(idx, 1);
        clients.forEach((c) => {
          if (c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(JSON.stringify({ type: "peerLeft", payload: { userId: removed.userId } }));
          }
        });
        if (clients.length === 0) rooms.delete(roomId);
      }
    }
  }

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      try {
        const rawMessage = JSON.parse(data.toString());
        const validated = wsMessageSchema.safeParse(rawMessage);

        if (!validated.success) {
          ws.send(JSON.stringify({
            type: "error",
            payload: { message: "Invalid message format", errors: validated.error.errors }
          }));
          return;
        }

        const { type, payload } = validated.data;

        switch (type) {
          case "joinRoom": {
            const { roomId, userId, userName } = payload;
            removeClientFromRooms(ws);

            const clients = getRoomClients(roomId);

            if (clients.length >= 2) {
              ws.send(JSON.stringify({ type: "error", payload: { message: "Room is full (max 2 participants)" } }));
              return;
            }

            const existingPeer = clients[0];
            clients.push({ ws, userId, userName: userName || userId });

            if (existingPeer) {
              ws.send(JSON.stringify({
                type: "peerJoined",
                payload: { partnerName: existingPeer.userName, initiator: true },
              }));
              if (existingPeer.ws.readyState === WebSocket.OPEN) {
                existingPeer.ws.send(JSON.stringify({
                  type: "peerJoined",
                  payload: { partnerName: userName || userId, initiator: false },
                }));
              }
            } else {
              ws.send(JSON.stringify({ type: "roomJoined", payload: { roomId } }));
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

  seedDatabase().catch(err => console.error("Error seeding database:", err));
  
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
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        isVerified: true,
        availability: "Mon-Fri, 2PM-6PM EST"
      },
      {
        username: "sarahdesign",
        displayName: "Sarah Chen",
        bio: "Senior Product Designer at BigTech. I do portfolio reviews and career coaching for junior designers.",
        socialHandle: "@designwithsarah",
        socialPlatform: "instagram",
        price: 200,
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        isVerified: true,
        availability: "Weekends only"
      },
      {
        username: "markcrypto",
        displayName: "Mark Johnson",
        bio: "DeFi analyst and crypto educator. Let's talk about the future of finance.",
        socialHandle: "@mark_on_chain",
        socialPlatform: "twitter",
        price: 300,
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        isVerified: false,
        availability: "Tue & Thu, 10AM-2PM PST"
      },
      {
        username: "jessicalifestyle",
        displayName: "Jessica Wu",
        bio: "Lifestyle vlogger and content creator strategy consultant. Grow your audience authentically.",
        socialHandle: "@jesswu",
        socialPlatform: "instagram",
        price: 100,
        imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        isVerified: true,
        availability: "Flexible schedule"
      },
      {
        username: "devdavid",
        displayName: "David Miller",
        bio: "Fullstack developer and open source contributor. Expert in React, Node.js, and Cloud Architecture.",
        socialHandle: "@david_codes",
        socialPlatform: "github",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        isVerified: true,
        availability: "Evenings 6PM-9PM"
      },
      {
        username: "creativeanna",
        displayName: "Anna Smith",
        bio: "Digital artist and illustrator. Offering mentorship and art critiques.",
        socialHandle: "@annadraws",
        socialPlatform: "instagram",
        price: 90,
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        isVerified: false,
        availability: "Mon, Wed, Fri"
      }
    ];

    for (const creator of initialCreators) {
      await storage.createCreator(creator);
    }
    console.log("Database seeded successfully.");
  }
}
