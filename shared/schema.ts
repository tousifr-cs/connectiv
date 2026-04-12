import {
  pgTable,
  uuid,
  text,
  serial,
  boolean,
  timestamp,
  integer,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  headline: text("headline"),
  bio: text("bio").notNull(),
  socialHandle: text("social_handle").notNull(),
  socialPlatform: text("social_platform").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull(),
  isVerified: boolean("is_verified").default(false),
  availability: text("availability").default("Available for sessions"),
  categories: text("categories").default(""),
  location: text("location"),
  timezone: text("timezone"),
  languages: text("languages"),
  website: text("website"),
  responseTime: text("response_time"),
  totalSessions: integer("total_sessions").default(0),
  rating: integer("rating"),
  featured: boolean("featured").default(false),
  videoCallPrice: integer("video_call_price"),
  audioConsultPrice: integer("audio_consult_price"),
  dmBundlePrice: integer("dm_bundle_price"),
  deepDivePrice: integer("deep_dive_price"),
});

// === BASE SCHEMAS ===
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoUrl: text("photo_url"),
  headline: text("headline"),
  bio: text("bio"),
  website: text("website"),
  location: text("location"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  timezone: text("timezone"),
  passwordHash: text("password_hash"), // nullable for Google-only users
  authMethods: text("auth_methods").notNull().default("google"),
  lastAuthProvider: text("last_auth_provider"), // "password" | "google"
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Password signup: OTP sent first; user row is created only after verification. */
export const pendingPasswordSignups = pgTable("pending_password_signups", {
  email: text("email").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  otpHash: text("otp_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
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
  id: uuid("id").primaryKey().defaultRandom(),
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

export const CONNECTION_REQUEST_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "completed",
  "expired",
] as const;
export type ConnectionRequestStatus =
  (typeof CONNECTION_REQUEST_STATUSES)[number];

export const connectionRequests = pgTable("connection_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  requesterFirebaseUid: text("requester_firebase_uid").notNull(),
  profileUrl: text("profile_url").notNull(),
  platform: text("platform").notNull(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  senderName: text("sender_name"),
  senderProfileUrl: text("sender_profile_url"),
  messageText: text("message_text"),
  videoFileName: text("video_file_name"),
  connectionType: text("connection_type").notNull().default("video"),
  duration: integer("duration").notNull().default(30),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// === BASE SCHEMAS ===
export const internalInsertCreatorSchema = createInsertSchema(creators)
  .omit({ id: true })
  .extend({
    categories: z.string().optional().default(""),
    headline: z.string().max(120).nullable().optional(),
    location: z.string().max(100).nullable().optional(),
    timezone: z.string().max(60).nullable().optional(),
    languages: z.string().max(200).nullable().optional(),
    website: z.string().url().nullable().optional().or(z.literal("")),
    responseTime: z.string().max(100).nullable().optional(),
    videoCallPrice: z.number().int().positive().nullable().optional(),
    audioConsultPrice: z.number().int().positive().nullable().optional(),
    dmBundlePrice: z.number().int().positive().nullable().optional(),
    deepDivePrice: z.number().int().positive().nullable().optional(),
  });

export const insertCreatorSchema = internalInsertCreatorSchema.omit({
  isVerified: true,
  firebaseUid: true,
});

export const updateCreatorSchema = insertCreatorSchema.partial();

export const updateUserProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  headline: z.string().max(120).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  timezone: z.string().max(60).nullable().optional(),
  website: z.string().url().nullable().optional().or(z.literal("")),
  photoUrl: z.string().nullable().optional(),
});

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

export const insertConnectionRequestSchema = z.object({
  profileUrl: z.string().min(1).max(500),
  platform: z.string().min(1).max(50),
  isAnonymous: z.boolean().default(false),
  senderName: z.string().max(100).nullable().optional(),
  senderProfileUrl: z.string().max(500).nullable().optional(),
  messageText: z.string().max(500).nullable().optional(),
  videoFileName: z.string().nullable().optional(),
  connectionType: z.enum(["video", "voice", "text"]).default("video"),
  duration: z.union([z.literal(15), z.literal(30), z.literal(60)]).default(30),
  amount: z.number().int().min(0),
});

// === EXPLICIT API CONTRACT TYPES ===
export type Creator = typeof creators.$inferSelect;
export type InsertCreator = z.infer<typeof internalInsertCreatorSchema>;
export type UserRow = typeof users.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type ConnectionRequest = typeof connectionRequests.$inferSelect;
export type InsertConnectionRequest = z.infer<
  typeof insertConnectionRequestSchema
>;

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

export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export interface UserProfileResponse {
  user: UserRow;
  isCreator: boolean;
  creatorId: number | null;
  creatorUsername: string | null;
}
