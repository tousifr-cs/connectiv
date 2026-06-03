import crypto from "crypto";
import { db } from "./db";
import {
  pros,
  users,
  pendingPasswordSignups,
  bookings,
  roomRecordings,
  connectionRequests,
  type Pro,
  type InsertPro,
  type UserRow,
  type Booking,
  type BookingWithRequester,
  type BookingWithPro,
  type EarningsStats,
  type UpdateUserProfile,
  type AdminUpdatePro,
  type ConnectionRequest,
  type InsertConnectionRequest,
  type UserRole,
  type RoomRecording,
  type RecordingStatus,
} from "@shared/schema";
import { eq, like, or, sql, and, desc, count, getTableColumns } from "drizzle-orm";

export interface IStorage {
  getPros(search?: string, platform?: string): Promise<Pro[]>;
  getPro(id: number): Promise<Pro | undefined>;
  getProByFirebaseUid(firebaseUid: string): Promise<Pro | undefined>;
  createPro(pro: InsertPro): Promise<Pro>;
  updatePro(
    id: number,
    data: Partial<InsertPro>,
  ): Promise<Pro | undefined>;
  adminUpdatePro(id: number, data: AdminUpdatePro): Promise<Pro | undefined>;
  upsertUserFromFirebase(input: {
    firebaseUid: string;
    email: string | null;
    displayName: string | null;
    photoUrl: string | null;
  }): Promise<UserRow>;
  getUserByFirebaseUid(firebaseUid: string): Promise<UserRow | undefined>;
  getUserByEmail(email: string): Promise<UserRow | undefined>;
  getUserByGoogleSub(googleSub: string): Promise<UserRow | undefined>;
  upsertUserFromGoogle(input: {
    googleSub: string;
    email: string;
    displayName: string | null;
    photoUrl: string | null;
  }): Promise<UserRow>;
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
      proId: number;
      sessionType: string;
      topic: string;
      message?: string;
      price: number;
      scheduledAt?: string;
    },
  ): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsForPro(proId: number): Promise<BookingWithRequester[]>;
  getBookingsForRequester(firebaseUid: string): Promise<BookingWithPro[]>;
  updateBookingStatus(
    id: string,
    status: string,
    roomId?: string,
  ): Promise<Booking | undefined>;
  getEarningsForPro(proId: number): Promise<EarningsStats>;
  getBookingByRoomId(roomId: string): Promise<Booking | undefined>;
  createRoomRecording(input: {
    roomId: string;
    bookingId: string;
    requestedByFirebaseUid: string;
    status: RecordingStatus;
    startedAt?: Date | null;
    endedAt?: Date | null;
  }): Promise<RoomRecording>;
  getRoomRecordingsByRoomId(roomId: string): Promise<RoomRecording[]>;
  getRoomRecordingById(id: string): Promise<RoomRecording | undefined>;
  updateRoomRecording(
    id: string,
    data: {
      status?: RecordingStatus;
      storageUrl?: string | null;
      failureReason?: string | null;
      endedAt?: Date | null;
    },
  ): Promise<RoomRecording | undefined>;

  createConnectionRequest(
    requesterFirebaseUid: string,
    data: InsertConnectionRequest,
  ): Promise<ConnectionRequest>;
  getConnectionRequestsForUser(
    firebaseUid: string,
  ): Promise<ConnectionRequest[]>;
  getConnectionRequest(id: string): Promise<ConnectionRequest | undefined>;

  getUserById(id: string): Promise<UserRow | undefined>;
  countAdmins(): Promise<number>;
  setUserRoleByUserId(
    userId: string,
    role: UserRole,
  ): Promise<UserRow | undefined>;
  getAllConnectionRequests(): Promise<ConnectionRequest[]>;
  listUsersForAdmin(): Promise<
    Pick<UserRow, "id" | "email" | "displayName" | "role" | "createdAt">[]
  >;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string): Promise<UserRow | undefined> {
    const [row] = await db.select().from(users).where(eq(users.email, email));
    return row;
  }

  async getUserByGoogleSub(googleSub: string): Promise<UserRow | undefined> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.googleSub, googleSub));
    return row;
  }

  async upsertUserFromGoogle(input: {
    googleSub: string;
    email: string;
    displayName: string | null;
    photoUrl: string | null;
  }): Promise<UserRow> {
    const now = new Date();
    const [row] = await db
      .insert(users)
      .values({
        firebaseUid: crypto.randomUUID(),
        googleSub: input.googleSub,
        email: input.email,
        displayName: input.displayName,
        photoUrl: input.photoUrl,
        authMethods: "google",
        lastAuthProvider: "google",
        lastLoginAt: now,
        role: "user",
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          googleSub: input.googleSub,
          displayName: sql`COALESCE(excluded.display_name, users.display_name)`,
          photoUrl: sql`COALESCE(excluded.photo_url, users.photo_url)`,
          authMethods: sql`CASE WHEN users.password_hash IS NULL THEN 'google' ELSE users.auth_methods END`,
          lastAuthProvider: "google",
          lastLoginAt: now,
        },
      })
      .returning();
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
        role: "user",
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

  async getPros(search?: string, platform?: string): Promise<Pro[]> {
    const conditions = [];
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          like(pros.displayName, searchLower),
          like(pros.username, searchLower),
          like(pros.bio, searchLower),
        )!,
      );
    }
    if (platform) {
      conditions.push(eq(pros.socialPlatform, platform));
    }
    if (conditions.length === 0) {
      return db.select().from(pros);
    }
    const whereExpr =
      conditions.length === 1 ? conditions[0] : and(...conditions);
    return db.select().from(pros).where(whereExpr);
  }

  async getPro(id: number): Promise<Pro | undefined> {
    const [row] = await db.select().from(pros).where(eq(pros.id, id));
    return row;
  }

  async createPro(insertPro: InsertPro): Promise<Pro> {
    const [row] = await db.insert(pros).values(insertPro).returning();
    return row;
  }

  async updatePro(
    id: number,
    data: Partial<InsertPro>,
  ): Promise<Pro | undefined> {
    const [row] = await db
      .update(pros)
      .set(data)
      .where(eq(pros.id, id))
      .returning();
    return row;
  }

  async adminUpdatePro(
    id: number,
    data: AdminUpdatePro,
  ): Promise<Pro | undefined> {
    const patch: Record<string, unknown> = {};
    if (data.isVerified !== undefined) patch.isVerified = data.isVerified;
    if (data.featured !== undefined) patch.featured = data.featured;
    if (Object.keys(patch).length === 0) return this.getPro(id);
    const [row] = await db
      .update(pros)
      .set(patch)
      .where(eq(pros.id, id))
      .returning();
    return row;
  }

  async getProByFirebaseUid(firebaseUid: string): Promise<Pro | undefined> {
    const [row] = await db
      .select()
      .from(pros)
      .where(eq(pros.firebaseUid, firebaseUid));
    return row;
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
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
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
      proId: number;
      sessionType: string;
      topic: string;
      message?: string;
      price: number;
      scheduledAt?: string;
    },
  ): Promise<Booking> {
    const requester = await this.getUserByFirebaseUid(requesterFirebaseUid);
    if (!requester) {
      throw new Error("Requester user not found");
    }
    const grossAmount = data.price;
    const platformFeePercent = 15;
    const platformFeeAmount = Math.round(
      grossAmount * (platformFeePercent / 100),
    );
    const proPayoutAmount = grossAmount - platformFeeAmount;

    const [booking] = await db
      .insert(bookings)
      .values({
        requesterUserId: requester.id,
        requesterFirebaseUid,
        proId: data.proId,
        sessionType: data.sessionType,
        topic: data.topic,
        message: data.message ?? "",
        price: data.price,
        grossAmount,
        platformFeePercent,
        platformFeeAmount,
        proPayoutAmount,
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

  async createRoomRecording(input: {
    roomId: string;
    bookingId: string;
    requestedByFirebaseUid: string;
    status: RecordingStatus;
    startedAt?: Date | null;
    endedAt?: Date | null;
  }): Promise<RoomRecording> {
    const [row] = await db
      .insert(roomRecordings)
      .values({
        roomId: input.roomId,
        bookingId: input.bookingId,
        requestedByFirebaseUid: input.requestedByFirebaseUid,
        status: input.status,
        startedAt: input.startedAt ?? null,
        endedAt: input.endedAt ?? null,
      })
      .returning();
    return row;
  }

  async getRoomRecordingsByRoomId(roomId: string): Promise<RoomRecording[]> {
    return db
      .select()
      .from(roomRecordings)
      .where(eq(roomRecordings.roomId, roomId))
      .orderBy(desc(roomRecordings.createdAt));
  }

  async getRoomRecordingById(id: string): Promise<RoomRecording | undefined> {
    const [row] = await db
      .select()
      .from(roomRecordings)
      .where(eq(roomRecordings.id, id));
    return row;
  }

  async updateRoomRecording(
    id: string,
    data: {
      status?: RecordingStatus;
      storageUrl?: string | null;
      failureReason?: string | null;
      endedAt?: Date | null;
    },
  ): Promise<RoomRecording | undefined> {
    const [row] = await db
      .update(roomRecordings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(roomRecordings.id, id))
      .returning();
    return row;
  }

  async getBookingsForPro(proId: number): Promise<BookingWithRequester[]> {
    const rows = await db
      .select({
        ...getTableColumns(bookings),
        requesterDisplayName: users.displayName,
        requesterEmail: users.email,
        requesterPhotoUrl: users.photoUrl,
        proDisplayName: pros.displayName,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.requesterFirebaseUid, users.firebaseUid))
      .leftJoin(pros, eq(bookings.proId, pros.id))
      .where(eq(bookings.proId, proId))
      .orderBy(desc(bookings.createdAt));
    return rows as BookingWithRequester[];
  }

  async getBookingsForRequester(
    firebaseUid: string,
  ): Promise<BookingWithPro[]> {
    const rows = await db
      .select({
        ...getTableColumns(bookings),
        proDisplayName: pros.displayName,
        proUsername: pros.username,
        proImageUrl: pros.imageUrl,
      })
      .from(bookings)
      .innerJoin(pros, eq(bookings.proId, pros.id))
      .where(eq(bookings.requesterFirebaseUid, firebaseUid))
      .orderBy(desc(bookings.createdAt));
    return rows as BookingWithPro[];
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

  async getEarningsForPro(proId: number): Promise<EarningsStats> {
    const completed = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.proId, proId),
          eq(bookings.status, "session_completed"),
        ),
      );

    const pending = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.proId, proId), eq(bookings.status, "pending")));

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

  async getUserById(id: string): Promise<UserRow | undefined> {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row;
  }

  async countAdmins(): Promise<number> {
    const [row] = await db
      .select({ n: count() })
      .from(users)
      .where(eq(users.role, "admin"));
    return Number(row?.n ?? 0);
  }

  async setUserRoleByUserId(
    userId: string,
    role: UserRole,
  ): Promise<UserRow | undefined> {
    const [row] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    return row;
  }

  async getAllConnectionRequests(): Promise<ConnectionRequest[]> {
    return db
      .select()
      .from(connectionRequests)
      .orderBy(desc(connectionRequests.createdAt));
  }

  async listUsersForAdmin(): Promise<
    Pick<UserRow, "id" | "email" | "displayName" | "role" | "createdAt">[]
  > {
    return db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  }
}

export const storage = new DatabaseStorage();
