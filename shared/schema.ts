import {
  pgTable,
  text,
  serial,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio").notNull(),
  socialHandle: text("social_handle").notNull(),
  socialPlatform: text("social_platform").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull(),
  isVerified: boolean("is_verified").default(false),
  availability: text("availability").default("Available for sessions"),
  categories: text("categories").default(""),
  videoCallPrice: integer("video_call_price"),
  audioConsultPrice: integer("audio_consult_price"),
  dmBundlePrice: integer("dm_bundle_price"),
  deepDivePrice: integer("deep_dive_price"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").unique(),
  displayName: text("display_name"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const SESSION_TYPES = [
  "video_call",
  "audio_consult",
  "dm_bundle",
  "deep_dive",
] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export const BOOKING_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  requesterFirebaseUid: text("requester_firebase_uid").notNull(),
  creatorId: integer("creator_id").notNull(),
  sessionType: text("session_type").notNull(),
  topic: text("topic").notNull(),
  message: text("message").default(""),
  price: integer("price").notNull(),
  status: text("status").notNull().default("pending"),
  roomId: text("room_id"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// === BASE SCHEMAS ===
export const insertCreatorSchema = createInsertSchema(creators)
  .omit({ id: true })
  .extend({
    categories: z.string().optional().default(""),
    videoCallPrice: z.number().int().positive().nullable().optional(),
    audioConsultPrice: z.number().int().positive().nullable().optional(),
    dmBundlePrice: z.number().int().positive().nullable().optional(),
    deepDivePrice: z.number().int().positive().nullable().optional(),
  });

export const updateCreatorSchema = insertCreatorSchema.partial();

export const insertBookingSchema = z.object({
  creatorId: z.number().int().positive(),
  sessionType: z.enum(SESSION_TYPES),
  topic: z.string().min(1).max(500),
  message: z.string().max(2000).optional().default(""),
  price: z.number().int().positive(),
  scheduledAt: z.string().datetime().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["accepted", "declined", "completed", "cancelled"]),
});

// === EXPLICIT API CONTRACT TYPES ===
export type Creator = typeof creators.$inferSelect;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type UserRow = typeof users.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type CreatorResponse = Creator;
export type CreatorsListResponse = Creator[];

export interface CreatorsQueryParams {
  search?: string;
  platform?: string;
}

export interface BookingWithRequester extends Booking {
  requesterDisplayName: string | null;
  requesterEmail: string | null;
  requesterPhotoUrl: string | null;
}

export interface BookingWithCreator extends Booking {
  creatorDisplayName: string;
  creatorUsername: string;
  creatorImageUrl: string;
}

export interface EarningsStats {
  totalEarnings: number;
  pendingCount: number;
  completedCount: number;
  breakdownByType: { sessionType: string; total: number; count: number }[];
}
