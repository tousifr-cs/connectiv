import {
  pgTable,
  uuid,
  text,
  serial,
  boolean,
  timestamp,
  integer,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const pros = pgTable("pros", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  headline: text("headline"),
  bio: text("bio").notNull(),
  socialHandle: text("social_handle").notNull(),
  socialPlatform: text("social_platform").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull(),
  isVerified: boolean("is_verified").default(false),
  availability: text("availability").default("Available for sessions"),
  categories: text("categories").default(""),
  location: text("location"),
  timezone: text("timezone"),
  languages: text("languages"),
  website: text("website"),
  responseTime: text("response_time"),
  totalSessions: integer("total_sessions").default(0),
  rating: integer("rating"),
  featured: boolean("featured").default(false),
  videoCallPrice: integer("video_call_price"),
  audioConsultPrice: integer("audio_consult_price"),
  dmBundlePrice: integer("dm_bundle_price"),
  deepDivePrice: integer("deep_dive_price"),
});

/** Application roles stored in Postgres (not in Firebase). */
export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// === BASE SCHEMAS ===
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  googleSub: text("google_sub").unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoUrl: text("photo_url"),
  headline: text("headline"),
  bio: text("bio"),
  website: text("website"),
  location: text("location"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  timezone: text("timezone"),
  passwordHash: text("password_hash"), // nullable for Google-only users
  authMethods: text("auth_methods").notNull().default("google"),
  lastAuthProvider: text("last_auth_provider"), // "password" | "google"
  /** `admin` grants access to `/api/admin/*`. Managed only via DB or admin APIs, never from client profile sync. */
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Password signup: OTP sent first; user row is created only after verification. */
export const pendingPasswordSignups = pgTable("pending_password_signups", {
  email: text("email").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  otpHash: text("otp_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const SESSION_TYPES = [
  "video_call",
  "audio_consult",
  "dm_bundle",
  "deep_dive",
] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export const BOOKING_STATUSES = [
  "booking_created",
  "payment_pending",
  "payment_received",
  "session_completed",
  "payout_pending",
  "payout_sent",
  "payout_failed",
  "refunded",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PRO_RESPONSE_STATUSES = [
  "pending",
  "accepted",
  "declined",
] as const;
export type ProResponseStatus = (typeof PRO_RESPONSE_STATUSES)[number];

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  requesterUserId: uuid("requester_user_id").notNull(),
  requesterFirebaseUid: text("requester_firebase_uid").notNull(),
  proId: integer("pro_id").notNull(),
  sessionType: text("session_type").notNull(),
  topic: text("topic").notNull(),
  message: text("message").default(""),
  price: integer("price").notNull(),
  grossAmount: integer("gross_amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  platformFeePercent: integer("platform_fee_percent").notNull().default(15),
  platformFeeAmount: integer("platform_fee_amount").notNull(),
  proPayoutAmount: integer("pro_payout_amount").notNull(),
  paymentProvider: text("payment_provider").notNull().default("payoneer_manual"),
  paymentRequestLink: text("payment_request_link"),
  paymentRequestId: text("payment_request_id"),
  paymentReceivedAt: timestamp("payment_received_at", { withTimezone: true }),
  payoutReferenceId: text("payout_reference_id"),
  payoutSentAt: timestamp("payout_sent_at", { withTimezone: true }),
  notes: text("notes"),
  status: text("status").notNull().default("payment_pending"),
  proResponseStatus: text("pro_response_status").notNull().default("pending"),
  statusChangedBy: text("status_changed_by"),
  statusChangedAt: timestamp("status_changed_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  roomId: text("room_id"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const RECORDING_STATUSES = [
  "requested",
  "recording",
  "processing",
  "ready",
  "failed",
] as const;
export type RecordingStatus = (typeof RECORDING_STATUSES)[number];

export const roomRecordings = pgTable("room_recordings", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: text("room_id").notNull(),
  bookingId: uuid("booking_id").notNull(),
  requestedByFirebaseUid: text("requested_by_firebase_uid").notNull(),
  status: text("status").notNull().default("requested"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  storageUrl: text("storage_url"),
  provider: text("provider").notNull().default("jibri"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const CONNECTION_REQUEST_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "completed",
  "expired",
] as const;
export type ConnectionRequestStatus =
  (typeof CONNECTION_REQUEST_STATUSES)[number];

export const connectionRequests = pgTable("connection_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  requesterFirebaseUid: text("requester_firebase_uid").notNull(),
  profileUrl: text("profile_url").notNull(),
  platform: text("platform").notNull(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  senderName: text("sender_name"),
  senderProfileUrl: text("sender_profile_url"),
  messageText: text("message_text"),
  videoFileName: text("video_file_name"),
  connectionType: text("connection_type").notNull().default("video"),
  duration: integer("duration").notNull().default(30),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const JOB_STATUSES = [
  "draft",
  "open",
  "closed",
  "filled",
  "cancelled",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_BUDGET_TYPES = ["fixed", "hourly"] as const;
export type JobBudgetType = (typeof JOB_BUDGET_TYPES)[number];

export const PROPOSAL_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  posterUserId: uuid("poster_user_id").notNull(),
  posterFirebaseUid: text("poster_firebase_uid").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  skills: text("skills").default(""),
  budgetAmount: integer("budget_amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  budgetType: text("budget_type").notNull().default("fixed"),
  status: text("status").notNull().default("open"),
  deadline: timestamp("deadline", { withTimezone: true }),
  acceptedProposalId: uuid("accepted_proposal_id"),
  bookingId: uuid("booking_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const jobProposals = pgTable("job_proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull(),
  proId: integer("pro_id").notNull(),
  proFirebaseUid: text("pro_firebase_uid").notNull(),
  coverLetter: text("cover_letter").notNull(),
  proposedAmount: integer("proposed_amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// === BASE SCHEMAS ===
export const internalInsertProSchema = createInsertSchema(pros)
  .omit({ id: true })
  .extend({
    categories: z.string().optional().default(""),
    headline: z.string().max(120).nullable().optional(),
    location: z.string().max(100).nullable().optional(),
    timezone: z.string().max(60).nullable().optional(),
    languages: z.string().max(200).nullable().optional(),
    website: z.string().url().nullable().optional().or(z.literal("")),
    responseTime: z.string().max(100).nullable().optional(),
    videoCallPrice: z.number().int().positive().nullable().optional(),
    audioConsultPrice: z.number().int().positive().nullable().optional(),
    dmBundlePrice: z.number().int().positive().nullable().optional(),
    deepDivePrice: z.number().int().positive().nullable().optional(),
  });

export const insertProSchema = internalInsertProSchema.omit({
  isVerified: true,
  firebaseUid: true,
});

export const updateProSchema = insertProSchema.partial();

// Backward-compat aliases during creator->pro migration
export const creators = pros;
export const internalInsertCreatorSchema = internalInsertProSchema;
export const insertCreatorSchema = insertProSchema;
export const updateCreatorSchema = updateProSchema;

/** Admin-only fields on `pros`. */
export const adminUpdateProSchema = z.object({
  isVerified: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export const adminSetUserRoleSchema = z.object({
  role: z.enum(USER_ROLES),
});

/** Body for first (and only automatic) self-promotion to admin when no admin exists yet. */
export const adminRegisterSchema = z.object({
  secret: z.string().min(16, "Secret must be at least 16 characters."),
});

/** @deprecated Use `adminRegisterSchema` — same shape. */
export const adminBootstrapSchema = adminRegisterSchema;

export const updateUserProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  headline: z.string().max(120).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  timezone: z.string().max(60).nullable().optional(),
  website: z.string().url().nullable().optional().or(z.literal("")),
  photoUrl: z.string().nullable().optional(),
});

export const insertBookingSchema = z.object({
  proId: z.number().int().positive(),
  sessionType: z.enum(SESSION_TYPES),
  topic: z.string().min(1).max(500),
  message: z.string().max(2000).optional().default(""),
  price: z.number().int().positive(),
  currency: z.string().trim().min(3).max(10).optional().default("USD"),
  scheduledAt: z.string().datetime().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
});

export const attachBookingPaymentLinkSchema = z.object({
  paymentRequestLink: z.string().url(),
  paymentRequestId: z.string().max(120).optional(),
  notes: z.string().max(1000).optional(),
});

export const markBookingPaidSchema = z.object({
  paymentRequestId: z.string().max(120).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateBookingProResponseSchema = z.object({
  proResponseStatus: z.enum(PRO_RESPONSE_STATUSES),
});

export const completeBookingSessionSchema = z.object({
  notes: z.string().max(1000).optional(),
});

export const updateBookingPayoutSchema = z.object({
  status: z.enum(["payout_pending", "payout_sent", "payout_failed"]),
  payoutReferenceId: z.string().max(120).optional(),
  notes: z.string().max(1000).optional(),
});

export const refundBookingSchema = z.object({
  refunded: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});

export const cancelBookingSchema = z.object({
  notes: z.string().max(1000).optional(),
});

export const insertConnectionRequestSchema = z.object({
  profileUrl: z.string().min(1).max(500),
  platform: z.string().min(1).max(50),
  isAnonymous: z.boolean().default(false),
  senderName: z.string().max(100).nullable().optional(),
  senderProfileUrl: z.string().max(500).nullable().optional(),
  messageText: z.string().max(500).nullable().optional(),
  videoFileName: z.string().nullable().optional(),
  connectionType: z.enum(["video", "voice", "text"]).default("video"),
  duration: z.union([z.literal(15), z.literal(30), z.literal(60)]).default(30),
  amount: z.number().int().min(0),
});

export const insertJobSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  category: z.string().max(80).optional(),
  skills: z.string().max(500).optional().default(""),
  budgetAmount: z.number().int().positive(),
  currency: z.string().trim().min(3).max(10).default("USD"),
  budgetType: z.enum(JOB_BUDGET_TYPES).default("fixed"),
  deadline: z.string().datetime().optional(),
});

export const updateJobSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  category: z.string().max(80).nullable().optional(),
  skills: z.string().max(500).optional(),
  budgetAmount: z.number().int().positive().optional(),
  currency: z.string().trim().min(3).max(10).optional(),
  budgetType: z.enum(JOB_BUDGET_TYPES).optional(),
  status: z.enum(JOB_STATUSES).optional(),
  deadline: z.string().datetime().nullable().optional(),
});

export const insertJobProposalSchema = z.object({
  coverLetter: z.string().min(20).max(3000),
  proposedAmount: z.number().int().positive(),
  currency: z.string().trim().min(3).max(10).optional(),
});

export const updateJobProposalStatusSchema = z.object({
  status: z.enum(["rejected", "withdrawn"]),
});

export const createRoomRecordingSchema = z.object({
  action: z.enum(["start", "stop"]),
});

export const updateRoomRecordingSchema = z.object({
  status: z.enum(RECORDING_STATUSES).optional(),
  storageUrl: z.string().url().nullable().optional(),
  failureReason: z.string().max(500).nullable().optional(),
});

// === EXPLICIT API CONTRACT TYPES ===
export type Pro = typeof pros.$inferSelect;
export type InsertPro = z.infer<typeof internalInsertProSchema>;
export type Creator = Pro;
export type InsertCreator = InsertPro;
export type UserRow = typeof users.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type ConnectionRequest = typeof connectionRequests.$inferSelect;
export type InsertConnectionRequest = z.infer<
  typeof insertConnectionRequestSchema
>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type UpdateJob = z.infer<typeof updateJobSchema>;
export type JobProposal = typeof jobProposals.$inferSelect;
export type InsertJobProposal = z.infer<typeof insertJobProposalSchema>;

export interface JobWithPoster extends Job {
  posterDisplayName: string | null;
  posterPhotoUrl: string | null;
  proposalCount: number;
}

export interface JobProposalWithPro extends JobProposal {
  proDisplayName: string;
  proUsername: string;
  proImageUrl: string;
  proHeadline: string | null;
}
export type RoomRecording = typeof roomRecordings.$inferSelect;
export type CreateRoomRecordingInput = z.infer<typeof createRoomRecordingSchema>;
export type UpdateRoomRecordingInput = z.infer<typeof updateRoomRecordingSchema>;

export type ProResponse = Pro;
export type ProsListResponse = Pro[];

export interface ProsQueryParams {
  search?: string;
  platform?: string;
}

export interface BookingWithRequester extends Booking {
  requesterDisplayName: string | null;
  requesterEmail: string | null;
  requesterPhotoUrl: string | null;
  proDisplayName: string | null;
}

export interface BookingWithPro extends Booking {
  proDisplayName: string;
  proUsername: string;
  proImageUrl: string;
}
export type BookingWithCreator = BookingWithPro;

export interface BookingLedgerEntry extends Booking {
  requesterDisplayName: string | null;
  requesterEmail: string | null;
  proDisplayName: string | null;
  proUsername: string | null;
}

export interface EarningsStats {
  totalEarnings: number;
  pendingCount: number;
  completedCount: number;
  breakdownByType: { sessionType: string; total: number; count: number }[];
}

export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type AdminUpdatePro = z.infer<typeof adminUpdateProSchema>;
export type AdminSetUserRole = z.infer<typeof adminSetUserRoleSchema>;

export interface UserProfileResponse {
  user: UserRow;
  isPro: boolean;
  proId: number | null;
  proUsername: string | null;
}
