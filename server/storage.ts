import { db } from "./db";
import { creators, type Creator, type InternalInsertCreator } from "@shared/schema";
import { eq, like, or } from "drizzle-orm";

export interface IStorage {
  getCreators(search?: string, platform?: string): Promise<Creator[]>;
  getCreator(id: number): Promise<Creator | undefined>;
  createCreator(creator: InternalInsertCreator): Promise<Creator>;
}

export class DatabaseStorage implements IStorage {
  async getCreators(search?: string, platform?: string): Promise<Creator[]> {
    let query = db.select().from(creators);
    
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query.where(
        or(
          like(creators.displayName, searchLower),
          like(creators.username, searchLower),
          like(creators.bio, searchLower)
        )
      );
    }

    if (platform) {
      query.where(eq(creators.socialPlatform, platform));
    }

    return await query;
  }

  async getCreator(id: number): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.id, id));
    return creator;
  }

  async createCreator(insertCreator: InternalInsertCreator): Promise<Creator> {
    const [creator] = await db.insert(creators).values(insertCreator).returning();
    return creator;
  }
}

export const storage = new DatabaseStorage();
