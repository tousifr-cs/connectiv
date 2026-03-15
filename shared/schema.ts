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
export const internalInsertCreatorSchema = createInsertSchema(creators).omit({ id: true });
export const insertCreatorSchema = internalInsertCreatorSchema.omit({ isVerified: true });

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
