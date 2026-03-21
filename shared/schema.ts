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
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio").notNull(),
  socialHandle: text("social_handle").notNull(),
  socialPlatform: text("social_platform").notNull(), // 'twitter', 'instagram', 'linkedin'
  price: integer("price").notNull(), // In USD/Crypto equivalent
  imageUrl: text("image_url").notNull(),
  isVerified: boolean("is_verified").default(false),
  availability: text("availability").default("Available for sessions"),
});

// === BASE SCHEMAS ===
// Internal schema used for database operations (includes all fields)
export const internalInsertCreatorSchema = createInsertSchema(creators).omit({
  id: true,
});

// Public schema for API requests and frontend forms (omits isVerified to prevent Mass Assignment)
export const insertCreatorSchema = internalInsertCreatorSchema.omit({
  isVerified: true,
});

// === EXPLICIT API CONTRACT TYPES ===
export type Creator = typeof creators.$inferSelect;
export type InsertCreator = z.infer<typeof internalInsertCreatorSchema>;
export type PublicInsertCreator = z.infer<typeof insertCreatorSchema>;

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
