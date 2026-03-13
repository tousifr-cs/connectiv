import { pgTable, text, serial, boolean, integer } from "drizzle-orm/pg-core";
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
// Public schema for API input - MUST NOT include isVerified to prevent mass assignment
export const insertCreatorSchema = createInsertSchema(creators).omit({
  id: true,
  isVerified: true
});

// Internal schema for database operations that may include isVerified (e.g., seeding)
export const internalInsertCreatorSchema = createInsertSchema(creators).omit({
  id: true
});

// === EXPLICIT API CONTRACT TYPES ===
export type Creator = typeof creators.$inferSelect;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type InternalInsertCreator = z.infer<typeof internalInsertCreatorSchema>;

// Response types
export type CreatorResponse = Creator;
export type CreatorsListResponse = Creator[];

// Query types
export interface CreatorsQueryParams {
  search?: string;
  platform?: string;
}
