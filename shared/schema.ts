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
export const insertCreatorSchema = createInsertSchema(creators, {
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  displayName: z.string().min(2).max(50),
  bio: z.string().min(1).max(500),
  socialHandle: z.string().min(1).max(50),
  socialPlatform: z.string().min(1).max(20),
  price: z.number().int().min(1).max(1000000),
  imageUrl: z.string().url(),
  availability: z.string().max(100).nullable().optional(),
}).omit({
  id: true,
  isVerified: true
});

// Internal schema includes isVerified for seeding and admin operations
export const internalInsertCreatorSchema = createInsertSchema(creators).omit({ id: true });

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
