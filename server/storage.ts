import { db } from "./db";
import { creators, type Creator, type InternalInsertCreator } from "@shared/schema";
import { eq, like, or, and } from "drizzle-orm";

export interface IStorage {
  getCreators(search?: string, platform?: string): Promise<Creator[]>;
  getCreator(id: number): Promise<Creator | undefined>;
  createCreator(creator: InternalInsertCreator): Promise<Creator>;
}

export class DatabaseStorage implements IStorage {
  async getCreators(search?: string, platform?: string): Promise<Creator[]> {
    let query = db.select().from(creators);
    const filters = [];
    
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      filters.push(
        or(
          like(creators.displayName, searchLower),
          like(creators.username, searchLower),
          like(creators.bio, searchLower)
        )
      );
    }

    if (platform) {
      filters.push(eq(creators.socialPlatform, platform));
    }

    if (filters.length > 0) {
      query.where(and(...filters));
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
