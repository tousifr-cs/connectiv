import crypto from "crypto";
import { db } from "./db";
import {
  pros,
  users,
  pendingPasswordSignups,
  bookings,
  roomRecordings,
  connectionRequests,
  jobs,
  jobProposals,
  type Pro,
  type InsertPro,
  type UserRow,
  type Booking,
  type BookingWithRequester,
  type BookingWithPro,
  type BookingLedgerEntry,
  type EarningsStats,
  type UpdateUserProfile,
  type AdminUpdatePro,
  type ConnectionRequest,
  type InsertConnectionRequest,
  type UserRole,
  type RoomRecording,
  type RecordingStatus,
  type BookingStatus,
  type Job,
  type InsertJob,
  type JobProposal,
  type InsertJobProposal,
  type JobWithPoster,
  type JobProposalWithPro,
  type UpdateJob,
} from "@shared/schema";
import {
  eq,
  like,
  or,
  sql,
  and,
  desc,
  count,
  ne,
  getTableColumns,
} from "drizzle-orm";

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
      currency?: string;
      scheduledAt?: string;
    },
  ): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingForAdmin(id: string): Promise<BookingLedgerEntry | undefined>;
  getBookingsForPro(proId: number): Promise<BookingWithRequester[]>;
  getBookingsForRequester(firebaseUid: string): Promise<BookingWithPro[]>;
  updateBookingStatus(
    id: string,
    status: BookingStatus,
    actor: string,
    roomId?: string,
  ): Promise<Booking | undefined>;
  attachBookingPaymentLink(
    id: string,
    data: {
      paymentRequestLink: string;
      paymentRequestId?: string;
      notes?: string;
    },
  ): Promise<Booking | undefined>;
  markBookingPaid(
    id: string,
    data: { paymentRequestId?: string; notes?: string },
  ): Promise<Booking | undefined>;
  updateBookingProResponse(
    id: string,
    proResponseStatus: string,
    roomId?: string,
  ): Promise<Booking | undefined>;
  completeBookingSession(
    id: string,
    notes?: string,
  ): Promise<Booking | undefined>;
  updateBookingPayout(
    id: string,
    data: {
      status: "payout_pending" | "payout_sent" | "payout_failed";
      payoutReferenceId?: string;
      notes?: string;
    },
  ): Promise<Booking | undefined>;
  refundBooking(id: string, notes?: string): Promise<Booking | undefined>;
  cancelBooking(id: string, notes?: string): Promise<Booking | undefined>;
  getAdminBookings(): Promise<BookingLedgerEntry[]>;
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

  createJob(posterFirebaseUid: string, data: InsertJob): Promise<Job>;
  getJob(id: string): Promise<Job | undefined>;
  getJobWithPoster(id: string): Promise<JobWithPoster | undefined>;
  listJobs(filters?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<JobWithPoster[]>;
  getJobsForPoster(firebaseUid: string): Promise<JobWithPoster[]>;
  updateJob(
    id: string,
    posterFirebaseUid: string,
    data: UpdateJob,
  ): Promise<Job | undefined>;

  createJobProposal(
    jobId: string,
    proFirebaseUid: string,
    data: InsertJobProposal,
  ): Promise<JobProposal>;
  getJobProposal(id: string): Promise<JobProposal | undefined>;
  getProposalsForJob(jobId: string): Promise<JobProposalWithPro[]>;
  getProposalsForPro(proId: number): Promise<
    (JobProposal & { jobTitle: string; jobStatus: string })[]
  >;
  getProposalForProOnJob(
    jobId: string,
    proId: number,
  ): Promise<JobProposal | undefined>;
  rejectJobProposal(
    jobId: string,
    proposalId: string,
    posterFirebaseUid: string,
  ): Promise<JobProposal | undefined>;
  withdrawJobProposal(
    proposalId: string,
    proFirebaseUid: string,
  ): Promise<JobProposal | undefined>;
  acceptJobProposal(
    jobId: string,
    proposalId: string,
    posterFirebaseUid: string,
  ): Promise<{ job: Job; booking: Booking }>;
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
      currency?: string;
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
        currency: data.currency ?? "USD",
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

  async getBookingForAdmin(id: string): Promise<BookingLedgerEntry | undefined> {
    const [row] = await db
      .select({
        id: bookings.id,
        requesterUserId: bookings.requesterUserId,
        requesterFirebaseUid: bookings.requesterFirebaseUid,
        proId: bookings.proId,
        sessionType: bookings.sessionType,
        topic: bookings.topic,
        message: bookings.message,
        price: bookings.price,
        grossAmount: bookings.grossAmount,
        currency: bookings.currency,
        platformFeePercent: bookings.platformFeePercent,
        platformFeeAmount: bookings.platformFeeAmount,
        proPayoutAmount: bookings.proPayoutAmount,
        paymentProvider: bookings.paymentProvider,
        paymentRequestLink: bookings.paymentRequestLink,
        paymentRequestId: bookings.paymentRequestId,
        paymentReceivedAt: bookings.paymentReceivedAt,
        payoutReferenceId: bookings.payoutReferenceId,
        payoutSentAt: bookings.payoutSentAt,
        notes: bookings.notes,
        status: bookings.status,
        proResponseStatus: bookings.proResponseStatus,
        statusChangedBy: bookings.statusChangedBy,
        statusChangedAt: bookings.statusChangedAt,
        roomId: bookings.roomId,
        scheduledAt: bookings.scheduledAt,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        requesterDisplayName: users.displayName,
        requesterEmail: users.email,
        proDisplayName: pros.displayName,
        proUsername: pros.username,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.requesterUserId, users.id))
      .leftJoin(pros, eq(bookings.proId, pros.id))
      .where(eq(bookings.id, id));
    return row;
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
    status: BookingStatus,
    actor: string,
    roomId?: string,
  ): Promise<Booking | undefined> {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
      statusChangedAt: new Date(),
      statusChangedBy: actor,
    };
    if (roomId) updateData.roomId = roomId;

    const [booking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async attachBookingPaymentLink(
    id: string,
    data: {
      paymentRequestLink: string;
      paymentRequestId?: string;
      notes?: string;
    },
  ): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({
        paymentRequestLink: data.paymentRequestLink,
        paymentRequestId: data.paymentRequestId ?? null,
        notes: data.notes ?? null,
        statusChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async markBookingPaid(
    id: string,
    data: { paymentRequestId?: string; notes?: string },
  ): Promise<Booking | undefined> {
    const existing = await this.getBooking(id);
    if (!existing) return undefined;

    const [booking] = await db
      .update(bookings)
      .set({
        status: "payment_received",
        paymentReceivedAt: new Date(),
        paymentRequestId: data.paymentRequestId ?? existing.paymentRequestId,
        notes: data.notes ?? existing.notes,
        statusChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async updateBookingProResponse(
    id: string,
    proResponseStatus: string,
    roomId?: string,
  ): Promise<Booking | undefined> {
    const updateData: Record<string, unknown> = {
      proResponseStatus,
      statusChangedAt: new Date(),
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

  async completeBookingSession(
    id: string,
    notes?: string,
  ): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({
        status: "session_completed",
        notes: notes ?? null,
        statusChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async updateBookingPayout(
    id: string,
    data: {
      status: "payout_pending" | "payout_sent" | "payout_failed";
      payoutReferenceId?: string;
      notes?: string;
    },
  ): Promise<Booking | undefined> {
    const updateData: Record<string, unknown> = {
      status: data.status,
      notes: data.notes ?? null,
      statusChangedAt: new Date(),
      updatedAt: new Date(),
    };
    if (data.payoutReferenceId) {
      updateData.payoutReferenceId = data.payoutReferenceId;
    }
    if (data.status === "payout_sent") {
      updateData.payoutSentAt = new Date();
    }

    const [booking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async refundBooking(
    id: string,
    notes?: string,
  ): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({
        status: "refunded",
        notes: notes ?? null,
        statusChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async cancelBooking(
    id: string,
    notes?: string,
  ): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({
        status: "cancelled",
        notes: notes ?? null,
        statusChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async getAdminBookings(): Promise<BookingLedgerEntry[]> {
    const rows = await db
      .select({
        ...getTableColumns(bookings),
        requesterDisplayName: users.displayName,
        requesterEmail: users.email,
        proDisplayName: pros.displayName,
        proUsername: pros.username,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.requesterFirebaseUid, users.firebaseUid))
      .leftJoin(pros, eq(bookings.proId, pros.id))
      .orderBy(desc(bookings.createdAt));
    return rows as BookingLedgerEntry[];
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
      .where(
        and(eq(bookings.proId, proId), eq(bookings.status, "payment_pending")),
      );

    const totalEarnings = completed.reduce((sum, b) => sum + b.proPayoutAmount, 0);

    const typeMap = new Map<string, { total: number; count: number }>();
    for (const b of completed) {
      const existing = typeMap.get(b.sessionType) ?? { total: 0, count: 0 };
      existing.total += b.proPayoutAmount;
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

  async createJob(posterFirebaseUid: string, data: InsertJob): Promise<Job> {
    const poster = await this.getUserByFirebaseUid(posterFirebaseUid);
    if (!poster) {
      throw new Error("Poster user not found");
    }

    const [job] = await db
      .insert(jobs)
      .values({
        posterUserId: poster.id,
        posterFirebaseUid,
        title: data.title,
        description: data.description,
        category: data.category ?? null,
        skills: data.skills ?? "",
        budgetAmount: data.budgetAmount,
        currency: data.currency ?? "USD",
        budgetType: data.budgetType ?? "fixed",
        status: "open",
        deadline: data.deadline ? new Date(data.deadline) : null,
      })
      .returning();
    return job;
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobWithPoster(id: string): Promise<JobWithPoster | undefined> {
    const [row] = await db
      .select({
        ...getTableColumns(jobs),
        posterDisplayName: users.displayName,
        posterPhotoUrl: users.photoUrl,
        proposalCount: sql<number>`COALESCE((
          SELECT COUNT(*)::int FROM job_proposals
          WHERE job_proposals.job_id = ${jobs.id}
            AND job_proposals.status = 'pending'
        ), 0)`.mapWith(Number),
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.posterFirebaseUid, users.firebaseUid))
      .where(eq(jobs.id, id));

    return row as JobWithPoster | undefined;
  }

  async listJobs(filters?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<JobWithPoster[]> {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(jobs.status, filters.status));
    } else {
      conditions.push(eq(jobs.status, "open"));
    }
    if (filters?.category) {
      conditions.push(eq(jobs.category, filters.category));
    }
    if (filters?.search) {
      const term = `%${filters.search}%`;
      conditions.push(
        or(
          like(jobs.title, term),
          like(jobs.description, term),
          like(jobs.skills, term),
        )!,
      );
    }

    const rows = await db
      .select({
        ...getTableColumns(jobs),
        posterDisplayName: users.displayName,
        posterPhotoUrl: users.photoUrl,
        proposalCount: sql<number>`COALESCE((
          SELECT COUNT(*)::int FROM job_proposals
          WHERE job_proposals.job_id = ${jobs.id}
            AND job_proposals.status = 'pending'
        ), 0)`.mapWith(Number),
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.posterFirebaseUid, users.firebaseUid))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(jobs.createdAt));

    return rows as JobWithPoster[];
  }

  async getJobsForPoster(firebaseUid: string): Promise<JobWithPoster[]> {
    const rows = await db
      .select({
        ...getTableColumns(jobs),
        posterDisplayName: users.displayName,
        posterPhotoUrl: users.photoUrl,
        proposalCount: sql<number>`COALESCE((
          SELECT COUNT(*)::int FROM job_proposals
          WHERE job_proposals.job_id = ${jobs.id}
            AND job_proposals.status = 'pending'
        ), 0)`.mapWith(Number),
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.posterFirebaseUid, users.firebaseUid))
      .where(eq(jobs.posterFirebaseUid, firebaseUid))
      .orderBy(desc(jobs.createdAt));

    return rows as JobWithPoster[];
  }

  async updateJob(
    id: string,
    posterFirebaseUid: string,
    data: UpdateJob,
  ): Promise<Job | undefined> {
    const existing = await this.getJob(id);
    if (!existing || existing.posterFirebaseUid !== posterFirebaseUid) {
      return undefined;
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.skills !== undefined) updateData.skills = data.skills;
    if (data.budgetAmount !== undefined) updateData.budgetAmount = data.budgetAmount;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.budgetType !== undefined) updateData.budgetType = data.budgetType;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    }

    const [job] = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, id))
      .returning();
    return job;
  }

  async createJobProposal(
    jobId: string,
    proFirebaseUid: string,
    data: InsertJobProposal,
  ): Promise<JobProposal> {
    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    if (job.status !== "open") {
      throw new Error("Job is not accepting proposals");
    }
    if (job.posterFirebaseUid === proFirebaseUid) {
      throw new Error("You cannot apply to your own job");
    }

    const pro = await this.getProByFirebaseUid(proFirebaseUid);
    if (!pro) {
      throw new Error("Pro profile required to apply");
    }

    const existing = await this.getProposalForProOnJob(jobId, pro.id);
    if (existing && existing.status === "pending") {
      throw new Error("You already have a pending proposal on this job");
    }

    const [proposal] = await db
      .insert(jobProposals)
      .values({
        jobId,
        proId: pro.id,
        proFirebaseUid,
        coverLetter: data.coverLetter,
        proposedAmount: data.proposedAmount,
        currency: data.currency ?? job.currency,
      })
      .returning();
    return proposal;
  }

  async getJobProposal(id: string): Promise<JobProposal | undefined> {
    const [row] = await db
      .select()
      .from(jobProposals)
      .where(eq(jobProposals.id, id));
    return row;
  }

  async getProposalsForJob(jobId: string): Promise<JobProposalWithPro[]> {
    const rows = await db
      .select({
        ...getTableColumns(jobProposals),
        proDisplayName: pros.displayName,
        proUsername: pros.username,
        proImageUrl: pros.imageUrl,
        proHeadline: pros.headline,
      })
      .from(jobProposals)
      .innerJoin(pros, eq(jobProposals.proId, pros.id))
      .where(eq(jobProposals.jobId, jobId))
      .orderBy(desc(jobProposals.createdAt));
    return rows as JobProposalWithPro[];
  }

  async getProposalsForPro(proId: number): Promise<
    (JobProposal & { jobTitle: string; jobStatus: string })[]
  > {
    const rows = await db
      .select({
        ...getTableColumns(jobProposals),
        jobTitle: jobs.title,
        jobStatus: jobs.status,
      })
      .from(jobProposals)
      .innerJoin(jobs, eq(jobProposals.jobId, jobs.id))
      .where(eq(jobProposals.proId, proId))
      .orderBy(desc(jobProposals.createdAt));
    return rows;
  }

  async getProposalForProOnJob(
    jobId: string,
    proId: number,
  ): Promise<JobProposal | undefined> {
    const [row] = await db
      .select()
      .from(jobProposals)
      .where(and(eq(jobProposals.jobId, jobId), eq(jobProposals.proId, proId)))
      .orderBy(desc(jobProposals.createdAt))
      .limit(1);
    return row;
  }

  async rejectJobProposal(
    jobId: string,
    proposalId: string,
    posterFirebaseUid: string,
  ): Promise<JobProposal | undefined> {
    const job = await this.getJob(jobId);
    if (!job || job.posterFirebaseUid !== posterFirebaseUid) {
      return undefined;
    }

    const [proposal] = await db
      .update(jobProposals)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(
        and(
          eq(jobProposals.id, proposalId),
          eq(jobProposals.jobId, jobId),
          eq(jobProposals.status, "pending"),
        ),
      )
      .returning();
    return proposal;
  }

  async withdrawJobProposal(
    proposalId: string,
    proFirebaseUid: string,
  ): Promise<JobProposal | undefined> {
    const [proposal] = await db
      .update(jobProposals)
      .set({ status: "withdrawn", updatedAt: new Date() })
      .where(
        and(
          eq(jobProposals.id, proposalId),
          eq(jobProposals.proFirebaseUid, proFirebaseUid),
          eq(jobProposals.status, "pending"),
        ),
      )
      .returning();
    return proposal;
  }

  async acceptJobProposal(
    jobId: string,
    proposalId: string,
    posterFirebaseUid: string,
  ): Promise<{ job: Job; booking: Booking }> {
    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    if (job.posterFirebaseUid !== posterFirebaseUid) {
      throw new Error("Not authorized");
    }
    if (job.status !== "open") {
      throw new Error("Job is not open");
    }

    const proposal = await this.getJobProposal(proposalId);
    if (!proposal || proposal.jobId !== jobId) {
      throw new Error("Proposal not found");
    }
    if (proposal.status !== "pending") {
      throw new Error("Proposal is not pending");
    }

    const booking = await this.createBooking(posterFirebaseUid, {
      proId: proposal.proId,
      sessionType: "video_call",
      topic: job.title,
      message: proposal.coverLetter,
      price: proposal.proposedAmount,
      currency: proposal.currency,
    });

    const [updatedJob] = await db
      .update(jobs)
      .set({
        status: "filled",
        acceptedProposalId: proposalId,
        bookingId: booking.id,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning();

    await db
      .update(jobProposals)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(jobProposals.id, proposalId));

    await db
      .update(jobProposals)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(
        and(
          eq(jobProposals.jobId, jobId),
          ne(jobProposals.id, proposalId),
          eq(jobProposals.status, "pending"),
        ),
      );

    return { job: updatedJob, booking };
  }
}

export const storage = new DatabaseStorage();
