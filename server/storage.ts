import { db } from "./db";
import {
  creators,
  users,
  pendingPasswordSignups,
  bookings,
  connectionRequests,
  type Creator,
  type InsertCreator,
  type UserRow,
  type Booking,
  type BookingWithRequester,
  type BookingWithCreator,
  type EarningsStats,
  type UpdateUserProfile,
  type ConnectionRequest,
  type InsertConnectionRequest,
} from "@shared/schema";
import { eq, like, or, sql, and, desc } from "drizzle-orm";

export interface IStorage {
  getCreators(search?: string, platform?: string): Promise<Creator[]>;
  getCreator(id: number): Promise<Creator | undefined>;
  getCreatorByFirebaseUid(firebaseUid: string): Promise<Creator | undefined>;
  createCreator(creator: InsertCreator): Promise<Creator>;
  updateCreator(
    id: number,
    data: Partial<InsertCreator>,
  ): Promise<Creator | undefined>;
  upsertUserFromFirebase(input: {
    firebaseUid: string;
    email: string | null;
    displayName: string | null;
    photoUrl: string | null;
  }): Promise<UserRow>;
  getUserByFirebaseUid(firebaseUid: string): Promise<UserRow | undefined>;
  getUserByEmail(email: string): Promise<UserRow | undefined>;
  createPasswordUser(input: {
    firebaseUid: string;
    email: string;
    displayName: string | null;
    passwordHash: string;
  }): Promise<UserRow>;
  upsertPendingPasswordSignup(input: {
    email: string;
    passwordHash: string;
    displayName: string | null;
    otpHash: string;
    expiresAt: Date;
  }): Promise<void>;
  getPendingPasswordSignup(email: string): Promise<
    | {
        email: string;
        passwordHash: string;
        displayName: string | null;
        otpHash: string;
        expiresAt: Date;
      }
    | undefined
  >;
  deletePendingPasswordSignup(email: string): Promise<void>;
  updateUserProfile(
    firebaseUid: string,
    data: UpdateUserProfile,
  ): Promise<UserRow | undefined>;

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
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsForCreator(creatorId: number): Promise<BookingWithRequester[]>;
  getBookingsForRequester(firebaseUid: string): Promise<BookingWithCreator[]>;
  updateBookingStatus(
    id: string,
    status: string,
    roomId?: string,
  ): Promise<Booking | undefined>;
  getEarningsForCreator(creatorId: number): Promise<EarningsStats>;
  getBookingByRoomId(roomId: string): Promise<Booking | undefined>;

  createConnectionRequest(
    requesterFirebaseUid: string,
    data: InsertConnectionRequest,
  ): Promise<ConnectionRequest>;
  getConnectionRequestsForUser(
    firebaseUid: string,
  ): Promise<ConnectionRequest[]>;
  getConnectionRequest(id: string): Promise<ConnectionRequest | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string): Promise<UserRow | undefined> {
    const [row] = await db.select().from(users).where(eq(users.email, email));
    return row;
  }

  async createPasswordUser(input: {
    firebaseUid: string;
    email: string;
    displayName: string | null;
    passwordHash: string;
  }): Promise<UserRow> {
    const [row] = await db
      .insert(users)
      .values({
        firebaseUid: input.firebaseUid,
        email: input.email,
        displayName: input.displayName,
        passwordHash: input.passwordHash,
        authMethods: "password",
        lastAuthProvider: "password",
      })
      .onConflictDoUpdate({
        target: users.firebaseUid,
        set: {
          passwordHash: sql`excluded.password_hash`,
          displayName: sql`excluded.display_name`,
        },
      })
      .returning();

    return row;
  }

  async upsertPendingPasswordSignup(input: {
    email: string;
    passwordHash: string;
    displayName: string | null;
    otpHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await db
      .insert(pendingPasswordSignups)
      .values({
        email: input.email,
        passwordHash: input.passwordHash,
        displayName: input.displayName,
        otpHash: input.otpHash,
        expiresAt: input.expiresAt,
      })
      .onConflictDoUpdate({
        target: pendingPasswordSignups.email,
        set: {
          passwordHash: input.passwordHash,
          displayName: input.displayName,
          otpHash: input.otpHash,
          expiresAt: input.expiresAt,
          createdAt: new Date(),
        },
      });
  }

  async getPendingPasswordSignup(
    email: string,
  ): Promise<
    | {
        email: string;
        passwordHash: string;
        displayName: string | null;
        otpHash: string;
        expiresAt: Date;
      }
    | undefined
  > {
    const [row] = await db
      .select()
      .from(pendingPasswordSignups)
      .where(eq(pendingPasswordSignups.email, email));
    return row;
  }

  async deletePendingPasswordSignup(email: string): Promise<void> {
    await db
      .delete(pendingPasswordSignups)
      .where(eq(pendingPasswordSignups.email, email));
  }

  async getCreators(search?: string, platform?: string): Promise<Creator[]> {
    let query = db.select().from(creators);

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query.where(
        or(
          like(creators.displayName, searchLower),
          like(creators.username, searchLower),
          like(creators.bio, searchLower),
        ),
      );
    }

    if (platform) {
      query.where(eq(creators.socialPlatform, platform));
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

  async getUserByFirebaseUid(
    firebaseUid: string,
  ): Promise<UserRow | undefined> {
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
    if (data.displayName !== undefined)
      updateData.displayName = data.displayName;
    if (data.headline !== undefined) updateData.headline = data.headline;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;

    if (Object.keys(updateData).length === 0)
      return this.getUserByFirebaseUid(firebaseUid);

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
        email: input.email ?? `${input.firebaseUid}@noemail.firebase`,
        displayName: input.displayName,
        photoUrl: input.photoUrl,
        lastLoginAt: now,
        authMethods: "google",
        lastAuthProvider: "google",
      })
      .onConflictDoUpdate({
        target: users.firebaseUid,
        set: {
          email: sql`excluded.email`,
          displayName: sql`excluded.display_name`,
          photoUrl: sql`excluded.photo_url`,
          lastLoginAt: now,
          authMethods: sql`CASE WHEN users.password_hash IS NULL THEN excluded.auth_methods ELSE users.auth_methods END`,
          lastAuthProvider: sql`CASE WHEN users.password_hash IS NULL THEN excluded.last_auth_provider ELSE users.last_auth_provider END`,
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

  async getBooking(id: string): Promise<Booking | undefined> {
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
    id: string,
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
    const completed = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.creatorId, creatorId),
          eq(bookings.status, "completed"),
        ),
      );

    const pending = await db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.creatorId, creatorId), eq(bookings.status, "pending")),
      );

    const totalEarnings = completed.reduce((sum, b) => sum + b.price, 0);

    const typeMap = new Map<string, { total: number; count: number }>();
    for (const b of completed) {
      const existing = typeMap.get(b.sessionType) ?? { total: 0, count: 0 };
      existing.total += b.price;
      existing.count += 1;
      typeMap.set(b.sessionType, existing);
    }

    return {
      totalEarnings,
      pendingCount: pending.length,
      completedCount: completed.length,
      breakdownByType: Array.from(typeMap.entries()).map(
        ([sessionType, data]) => ({
          sessionType,
          ...data,
        }),
      ),
    };
  }

  async createConnectionRequest(
    requesterFirebaseUid: string,
    data: InsertConnectionRequest,
  ): Promise<ConnectionRequest> {
    const [row] = await db
      .insert(connectionRequests)
      .values({
        requesterFirebaseUid,
        profileUrl: data.profileUrl,
        platform: data.platform,
        isAnonymous: data.isAnonymous ?? false,
        senderName: data.senderName ?? null,
        senderProfileUrl: data.senderProfileUrl ?? null,
        messageText: data.messageText ?? null,
        videoFileName: data.videoFileName ?? null,
        connectionType: data.connectionType,
        duration: data.duration,
        amount: data.amount,
      })
      .returning();
    return row;
  }

  async getConnectionRequestsForUser(
    firebaseUid: string,
  ): Promise<ConnectionRequest[]> {
    return db
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.requesterFirebaseUid, firebaseUid))
      .orderBy(desc(connectionRequests.createdAt));
  }

  async getConnectionRequest(
    id: string,
  ): Promise<ConnectionRequest | undefined> {
    const [row] = await db
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.id, id));
    return row;
  }
}

export const storage = new DatabaseStorage();
