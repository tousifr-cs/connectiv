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

// === BASE SCHEMAS ===
export const internalInsertCreatorSchema = createInsertSchema(creators)
  .omit({ id: true })
  .extend({
    categories: z.string().optional().default(""),
    videoCallPrice: z.number().int().positive().nullable().optional(),
    audioConsultPrice: z.number().int().positive().nullable().optional(),
    dmBundlePrice: z.number().int().positive().nullable().optional(),
    deepDivePrice: z.number().int().positive().nullable().optional(),
  });

export const insertCreatorSchema = internalInsertCreatorSchema.omit({
  isVerified: true,
  firebaseUid: true,
});

// === EXPLICIT API CONTRACT TYPES ===
export type Creator = typeof creators.$inferSelect;
export type InsertCreator = z.infer<typeof internalInsertCreatorSchema>;

// Response types
export type CreatorResponse = Creator;
export type CreatorsListResponse = Creator[];

// Query types
export interface CreatorsQueryParams {
  search?: string;
  platform?: string;
}

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
export type UserRow = typeof users.$inferSelect;
