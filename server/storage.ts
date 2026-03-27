import { db } from "./db";
import {
  creators,
  users,
  bookings,
  type Creator,
  type InsertCreator,
  type UserRow,
  type Booking,
  type BookingWithRequester,
  type BookingWithCreator,
  type EarningsStats,
  type UpdateUserProfile,
} from "@shared/schema";
import { eq, like, or, sql, and, desc, sum, count } from "drizzle-orm";

export interface IStorage {
  getCreators(search?: string, platform?: string): Promise<Creator[]>;
  getCreator(id: number): Promise<Creator | undefined>;
  getCreatorByFirebaseUid(firebaseUid: string): Promise<Creator | undefined>;
  createCreator(creator: InsertCreator): Promise<Creator>;
  updateCreator(id: number, data: Partial<InsertCreator>): Promise<Creator | undefined>;
  upsertUserFromFirebase(input: {
    firebaseUid: string;
    email: string | null;
    displayName: string | null;
    photoUrl: string | null;
  }): Promise<UserRow>;
  getUserByFirebaseUid(firebaseUid: string): Promise<UserRow | undefined>;
  updateUserProfile(firebaseUid: string, data: UpdateUserProfile): Promise<UserRow | undefined>;

  createBooking(
    requesterFirebaseUid: string,
    data: {
      creatorId: number;
      sessionType: string;
      topic: string;
      message?: string;
      price: number;
      scheduledAt?: string;
    },
  ): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsForCreator(creatorId: number): Promise<BookingWithRequester[]>;
  getBookingsForRequester(firebaseUid: string): Promise<BookingWithCreator[]>;
  updateBookingStatus(
    id: number,
    status: string,
    roomId?: string,
  ): Promise<Booking | undefined>;
  getEarningsForCreator(creatorId: number): Promise<EarningsStats>;
  getBookingByRoomId(roomId: string): Promise<Booking | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getCreators(search?: string, platform?: string): Promise<Creator[]> {
    // BOLT OPTIMIZATION: Combine search and platform filters correctly using and().
    // Drizzle's .where() overwrites previous calls, so we must build the full
    // condition set first.
    const conditions = [];

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          like(creators.displayName, searchLower),
          like(creators.username, searchLower),
          like(creators.bio, searchLower),
        ),
      );
    }

    if (platform) {
      conditions.push(eq(creators.socialPlatform, platform));
    }

    let query = db.select().from(creators);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query;
  }

  async getCreator(id: number): Promise<Creator | undefined> {
    const [creator] = await db
      .select()
      .from(creators)
      .where(eq(creators.id, id));
    return creator;
  }

  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    const [creator] = await db
      .insert(creators)
      .values(insertCreator)
      .returning();
    return creator;
  }

  async updateCreator(
    id: number,
    data: Partial<InsertCreator>,
  ): Promise<Creator | undefined> {
    const [creator] = await db
      .update(creators)
      .set(data)
      .where(eq(creators.id, id))
      .returning();
    return creator;
  }

  async getCreatorByFirebaseUid(
    firebaseUid: string,
  ): Promise<Creator | undefined> {
    const [creator] = await db
      .select()
      .from(creators)
      .where(eq(creators.firebaseUid, firebaseUid));
    return creator;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<UserRow | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid));
    return user;
  }

  async updateUserProfile(
    firebaseUid: string,
    data: UpdateUserProfile,
  ): Promise<UserRow | undefined> {
    const updateData: Record<string, unknown> = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.headline !== undefined) updateData.headline = data.headline;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;

    if (Object.keys(updateData).length === 0) return this.getUserByFirebaseUid(firebaseUid);

    const [row] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.firebaseUid, firebaseUid))
      .returning();
    return row;
  }

  async upsertUserFromFirebase(input: {
    firebaseUid: string;
    email: string | null;
    displayName: string | null;
    photoUrl: string | null;
  }): Promise<UserRow> {
    const now = new Date();
    const [row] = await db
      .insert(users)
      .values({
        firebaseUid: input.firebaseUid,
        email: input.email,
        displayName: input.displayName,
        photoUrl: input.photoUrl,
        lastLoginAt: now,
      })
      .onConflictDoUpdate({
        target: users.firebaseUid,
        set: {
          email: sql`excluded.email`,
          displayName: sql`excluded.display_name`,
          photoUrl: sql`excluded.photo_url`,
          lastLoginAt: now,
        },
      })
      .returning();
    return row;
  }

  async createBooking(
    requesterFirebaseUid: string,
    data: {
      creatorId: number;
      sessionType: string;
      topic: string;
      message?: string;
      price: number;
      scheduledAt?: string;
    },
  ): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values({
        requesterFirebaseUid,
        creatorId: data.creatorId,
        sessionType: data.sessionType,
        topic: data.topic,
        message: data.message ?? "",
        price: data.price,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      })
      .returning();
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
    return booking;
  }

  async getBookingByRoomId(roomId: string): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.roomId, roomId));
    return booking;
  }

  async getBookingsForCreator(
    creatorId: number,
  ): Promise<BookingWithRequester[]> {
    const rows = await db
      .select({
        id: bookings.id,
        requesterFirebaseUid: bookings.requesterFirebaseUid,
        creatorId: bookings.creatorId,
        sessionType: bookings.sessionType,
        topic: bookings.topic,
        message: bookings.message,
        price: bookings.price,
        status: bookings.status,
        roomId: bookings.roomId,
        scheduledAt: bookings.scheduledAt,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        requesterDisplayName: users.displayName,
        requesterEmail: users.email,
        requesterPhotoUrl: users.photoUrl,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.requesterFirebaseUid, users.firebaseUid))
      .where(eq(bookings.creatorId, creatorId))
      .orderBy(desc(bookings.createdAt));
    return rows;
  }

  async getBookingsForRequester(
    firebaseUid: string,
  ): Promise<BookingWithCreator[]> {
    const rows = await db
      .select({
        id: bookings.id,
        requesterFirebaseUid: bookings.requesterFirebaseUid,
        creatorId: bookings.creatorId,
        sessionType: bookings.sessionType,
        topic: bookings.topic,
        message: bookings.message,
        price: bookings.price,
        status: bookings.status,
        roomId: bookings.roomId,
        scheduledAt: bookings.scheduledAt,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        creatorDisplayName: creators.displayName,
        creatorUsername: creators.username,
        creatorImageUrl: creators.imageUrl,
      })
      .from(bookings)
      .innerJoin(creators, eq(bookings.creatorId, creators.id))
      .where(eq(bookings.requesterFirebaseUid, firebaseUid))
      .orderBy(desc(bookings.createdAt));
    return rows;
  }

  async updateBookingStatus(
    id: number,
    status: string,
    roomId?: string,
  ): Promise<Booking | undefined> {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };
    if (roomId) updateData.roomId = roomId;

    const [booking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async getEarningsForCreator(creatorId: number): Promise<EarningsStats> {
    // BOLT OPTIMIZATION: Use SQL aggregation (SUM, COUNT, GROUP BY) to calculate
    // earnings and counts directly on the database side. This reduces memory
    // usage and network overhead from O(N) to O(1) relative to number of bookings.
    const stats = await db
      .select({
        status: bookings.status,
        sessionType: bookings.sessionType,
        count: count(),
        totalPrice: sum(bookings.price),
      })
      .from(bookings)
      .where(eq(bookings.creatorId, creatorId))
      .groupBy(bookings.status, bookings.sessionType);

    let totalEarnings = 0;
    let pendingCount = 0;
    let completedCount = 0;
    const typeMap = new Map<string, { total: number; count: number }>();

    for (const row of stats) {
      const rowCount = Number(row.count);
      const rowPrice = Number(row.totalPrice || 0);

      if (row.status === "completed") {
        totalEarnings += rowPrice;
        completedCount += rowCount;

        const existing = typeMap.get(row.sessionType) ?? { total: 0, count: 0 };
        existing.total += rowPrice;
        existing.count += rowCount;
        typeMap.set(row.sessionType, existing);
      } else if (row.status === "pending") {
        pendingCount += rowCount;
      }
    }

    return {
      totalEarnings,
      pendingCount,
      completedCount,
      breakdownByType: Array.from(typeMap.entries()).map(
        ([sessionType, data]) => ({
          sessionType,
          ...data,
        }),
      ),
    };
  }
}

export const storage = new DatabaseStorage();
