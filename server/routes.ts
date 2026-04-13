import crypto from "crypto";
import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import {
  insertProSchema,
  internalInsertProSchema,
  insertBookingSchema,
  updateBookingStatusSchema,
  updateProSchema,
  updateUserProfileSchema,
  insertConnectionRequestSchema,
  adminUpdateProSchema,
  adminSetUserRoleSchema,
  adminRegisterSchema,
} from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { nanoid } from "nanoid";
import {
  generateSixDigitOtp,
  hashOtp,
  sendSignupOtpEmail,
} from "./email";

/** Simple hourly resend cap per email (in-memory; reset on process restart). */
const signupOtpResendWindow = new Map<
  string,
  { count: number; windowStart: number }
>();
const SIGNUP_OTP_RESEND_MAX_PER_HOUR = 5;
const SIGNUP_OTP_RESEND_WINDOW_MS = 60 * 60 * 1000;

function allowSignupOtpResend(email: string): boolean {
  const now = Date.now();
  const key = email.toLowerCase();
  let entry = signupOtpResendWindow.get(key);
  if (!entry || now - entry.windowStart > SIGNUP_OTP_RESEND_WINDOW_MS) {
    entry = { count: 0, windowStart: now };
    signupOtpResendWindow.set(key, entry);
  }
  if (entry.count >= SIGNUP_OTP_RESEND_MAX_PER_HOUR) return false;
  entry.count += 1;
  return true;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

async function issueSignupOtp(
  email: string,
  passwordHash: string,
  displayName: string | null,
): Promise<void> {
  const code = generateSixDigitOtp();
  const otpHash = hashOtp(email, code);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await storage.upsertPendingPasswordSignup({
    email,
    passwordHash,
    displayName,
    otpHash,
    expiresAt,
  });
  await sendSignupOtpEmail(email, code);
}

async function resendSignupOtp(email: string): Promise<void> {
  const pending = await storage.getPendingPasswordSignup(email);
  if (!pending) {
    throw new Error("No pending signup for this email.");
  }
  const code = generateSixDigitOtp();
  const otpHash = hashOtp(email, code);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await storage.upsertPendingPasswordSignup({
    email,
    passwordHash: pending.passwordHash,
    displayName: pending.displayName,
    otpHash,
    expiresAt,
  });
  await sendSignupOtpEmail(email, code);
}

const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    cb(null, allowed.includes(file.mimetype));
  },
});

interface RoomClient {
  ws: WebSocket;
  userId: string;
  userName: string;
}

declare global {
  namespace Express {
    interface Request {
      firebaseUid?: string;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
    oauthState?: string;
  }
}

async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionUserId = req.session?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUserById(sessionUserId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.firebaseUid = user.firebaseUid;
    next();
  } catch (err: unknown) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

/** Admin = `users.role === 'admin'` in Postgres (see migration + admin APIs). */
async function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.firebaseUid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUserByFirebaseUid(req.firebaseUid);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch (err) {
    next(err);
  }
}

function appBaseUrl(req: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, "");
  return `${req.protocol}://${req.get("host")}`;
}

function googleRedirectUri(req: Request): string {
  return (
    process.env.GOOGLE_REDIRECT_URI ||
    `${appBaseUrl(req)}/api/auth/google/callback`
  );
}

async function establishSession(req: Request, userId: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = userId;
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.use("/uploads", express.static(uploadsDir));

  // --- File upload ---
  app.post("/api/upload", verifyAuth, upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No valid image file provided" });
    }
    const url = `/uploads/${req.file.filename}`;
    return res.json({ url });
  });

  // --- Pros (public directory + onboarding) ---
  app.get(api.pros.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const platform = req.query.platform as string | undefined;
    const list = await storage.getPros(search, platform);
    res.json(list);
  });

  app.get(api.pros.get.path, async (req, res) => {
    const pro = await storage.getPro(Number(req.params.id));
    if (!pro) {
      return res.status(404).json({ message: "Pro not found" });
    }
    res.json(pro);
  });

  app.post(api.pros.list.path, verifyAuth, async (req, res) => {
    try {
      const parsed = insertProSchema.parse(req.body);

      const pro = await storage.createPro({
        ...parsed,
        firebaseUid: req.firebaseUid!,
      });

      res.status(201).json(pro);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid pro profile data", errors: err.errors });
      } else {
        console.error("Pro profile creation error:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // --- Admin: verification & featuring ---
  app.patch("/api/admin/pros/:id", verifyAuth, verifyAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id < 1) {
        return res.status(400).json({ message: "Invalid pro id" });
      }
      const parsed = adminUpdateProSchema.parse(req.body);
      const existing = await storage.getPro(id);
      if (!existing) {
        return res.status(404).json({ message: "Pro not found" });
      }
      const updated = await storage.adminUpdatePro(id, parsed);
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: err.errors });
      }
      console.error("adminUpdatePro:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  /**
   * First admin registration (only when zero admins exist).
   *
   * Security model:
   * - Requires a valid Firebase session (you must already have a normal user account).
   * - Requires `body.secret` to match `ADMIN_REGISTER_SECRET` (or legacy `ADMIN_BOOTSTRAP_SECRET`).
   * - Returns 409 once any admin exists — additional admins use `PATCH /api/admin/users/:userId/role`.
   *
   * This endpoint is intentionally NOT linked from the public app. Anyone can discover the URL,
   * but they still need the long random secret + a logged-in user + empty admin table.
   * Prefer removing the env secret after the first admin is created, or use SQL-only promotion instead.
   */
  async function postFirstAdminRegister(req: Request, res: Response) {
    try {
      const expected =
        process.env.ADMIN_REGISTER_SECRET ?? process.env.ADMIN_BOOTSTRAP_SECRET;
      if (!expected) {
        return res.status(503).json({
          message:
            "First-admin registration is not configured (set ADMIN_REGISTER_SECRET), or promote via SQL.",
        });
      }
      const parsed = adminRegisterSchema.parse(req.body);
      if (parsed.secret !== expected) {
        return res.status(403).json({ message: "Invalid secret" });
      }
      const adminCount = await storage.countAdmins();
      if (adminCount > 0) {
        return res.status(409).json({
          message: "An admin account already exists. Use the admin role API instead.",
        });
      }
      const me = await storage.getUserByFirebaseUid(req.firebaseUid!);
      if (!me) {
        return res.status(404).json({ message: "User not found" });
      }
      const updated = await storage.setUserRoleByUserId(me.id, "admin");
      return res.status(200).json({ user: updated });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: err.errors });
      }
      console.error("admin register:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  app.post("/api/admin/register", verifyAuth, postFirstAdminRegister);
  /** @deprecated Alias of POST /api/admin/register */
  app.post("/api/admin/bootstrap", verifyAuth, postFirstAdminRegister);

  /** Change another user's role (admin only). Cannot remove the last admin. */
  app.patch(
    "/api/admin/users/:userId/role",
    verifyAuth,
    verifyAdmin,
    async (req, res) => {
      try {
        const userId = req.params.userId;
        const id = Array.isArray(userId) ? userId[0] : userId;
        if (!id || typeof id !== "string") {
          return res.status(400).json({ message: "Invalid user id" });
        }
        const parsed = adminSetUserRoleSchema.parse(req.body);
        const target = await storage.getUserById(id);
        if (!target) {
          return res.status(404).json({ message: "User not found" });
        }
        if (parsed.role === "user" && target.role === "admin") {
          const admins = await storage.countAdmins();
          if (admins <= 1) {
            return res.status(400).json({
              message: "Cannot remove the last admin.",
            });
          }
        }
        const updated = await storage.setUserRoleByUserId(id, parsed.role);
        return res.json({ user: updated });
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res
            .status(400)
            .json({ message: "Invalid data", errors: err.errors });
        }
        console.error("adminSetUserRole:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  app.get(
    "/api/admin/connection-requests",
    verifyAuth,
    verifyAdmin,
    async (_req, res) => {
      try {
        const rows = await storage.getAllConnectionRequests();
        return res.json(rows);
      } catch (err) {
        console.error("admin list connection requests:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  // --- Auth ---
  app.post(api.auth.sync.path, verifyAuth, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        user: {
          id: user.id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          displayName: user.displayName,
          photoUrl: user.photoUrl,
          role: user.role,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unauthorized";
      return res.status(401).json({ message });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.json({
      user: {
        id: user.id,
        uid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoUrl,
        role: user.role,
      },
    });
  });

  app.post("/api/auth/logout", async (req, res) => {
    await new Promise<void>((resolve) =>
      req.session.destroy(() => resolve()),
    );
    res.clearCookie("connectiv.sid");
    return res.status(204).send();
  });

  app.get("/api/auth/google", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res
        .status(503)
        .json({ message: "GOOGLE_CLIENT_ID is not configured" });
    }
    const state = crypto.randomBytes(16).toString("hex");
    req.session.oauthState = state;
    const redirectUri = googleRedirectUri(req);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
      access_type: "offline",
    });
    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    );
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    try {
      const code = String(req.query.code ?? "");
      const state = String(req.query.state ?? "");
      if (!code || !state || state !== req.session.oauthState) {
        return res.status(400).json({ message: "Invalid OAuth callback state." });
      }
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return res.status(503).json({ message: "Google OAuth is not configured." });
      }
      const redirectUri = googleRedirectUri(req);
      const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      if (!tokenResp.ok) {
        return res.status(401).json({ message: "Google token exchange failed." });
      }
      const tokenJson = (await tokenResp.json()) as {
        access_token?: string;
      };
      if (!tokenJson.access_token) {
        return res.status(401).json({ message: "Missing Google access token." });
      }
      const userInfoResp = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenJson.access_token}` },
        },
      );
      if (!userInfoResp.ok) {
        return res.status(401).json({ message: "Failed to fetch Google profile." });
      }
      const profile = (await userInfoResp.json()) as {
        sub?: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
        picture?: string;
      };
      if (!profile.sub || !profile.email || !profile.email_verified) {
        return res.status(400).json({ message: "Google account is missing a verified email." });
      }

      const user = await storage.upsertUserFromGoogle({
        googleSub: profile.sub,
        email: profile.email.toLowerCase(),
        displayName: profile.name ?? null,
        photoUrl: profile.picture ?? null,
      });
      await establishSession(req, user.id);
      req.session.oauthState = undefined;
      return res.redirect("/dashboard");
    } catch (err) {
      console.error("google callback error:", err);
      return res.status(500).json({ message: "Could not sign in with Google." });
    }
  });

  // --- Auth (password + provider-aware) ---

  app.post("/api/auth/provider-hint", async (req, res) => {
    try {
      const body = z
        .object({
          email: z
            .string()
            .email()
            .transform((e) => e.toLowerCase()),
        })
        .parse(req.body);

      const user = await storage.getUserByEmail(body.email);

      if (!user) {
        return res.json({ provider: "unknown" as const });
      }

      // Convention: passwordHash === null => Google-only
      if (!user.passwordHash) {
        return res.json({ provider: "google" as const });
      }

      return res.json({ provider: "password" as const });
    } catch {
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/password/signup", async (req, res) => {
    try {
      const body = passwordSignupSchema.parse(req.body);

      const existing = await storage.getUserByEmail(body.email);
      if (existing) {
        if (existing.passwordHash) {
          return res.status(409).json({
            code: "EMAIL_ALREADY_IN_USE",
            message: "An account with this email already exists.",
          });
        }
        return providerMismatch(res, "google");
      }

      const passwordHash = await hashPassword(body.password);

      try {
        await issueSignupOtp(body.email, passwordHash, body.displayName);
      } catch (emailErr) {
        console.error("Failed to send signup OTP email:", emailErr);
        return res.status(503).json({
          message:
            "Could not send verification email. Check SMTP settings or try again later.",
        });
      }

      return res.status(200).json({ pendingVerification: true });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return jsonValidationError(res, err);
      }
      console.error("password/signup error:", err);
      return res.status(400).json({ message: "Signup failed" });
    }
  });

  const passwordSignupCompleteSchema = z.object({
    email: z
      .string()
      .email()
      .transform((e) => e.toLowerCase()),
    code: z
      .string()
      .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
  });

  app.post("/api/auth/password/signup/complete", async (req, res) => {
    try {
      const body = passwordSignupCompleteSchema.parse(req.body);

      const existing = await storage.getUserByEmail(body.email);
      if (existing) {
        return res.status(409).json({
          code: "EMAIL_ALREADY_IN_USE",
          message: "An account with this email already exists.",
        });
      }

      const pending = await storage.getPendingPasswordSignup(body.email);
      if (!pending || pending.expiresAt < new Date()) {
        return res.status(400).json({
          message: "Code expired or missing. Start signup again or request a new code.",
        });
      }

      const expected = hashOtp(body.email, body.code);
      if (!timingSafeEqualHex(expected, pending.otpHash)) {
        return res.status(401).json({ message: "Invalid verification code." });
      }

      await storage.createPasswordUser({
        firebaseUid: crypto.randomUUID(),
        email: body.email,
        displayName: pending.displayName,
        passwordHash: pending.passwordHash,
      });

      await storage.deletePendingPasswordSignup(body.email);
      const createdUser = await storage.getUserByEmail(body.email);
      if (!createdUser) {
        return res.status(500).json({ message: "User creation failed" });
      }
      await establishSession(req, createdUser.id);
      return res.status(200).json({ ok: true });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return jsonValidationError(res, err);
      }
      console.error("password/signup/complete error:", err);
      return res.status(400).json({ message: "Could not complete signup" });
    }
  });

  app.post("/api/auth/password/signup/resend", async (req, res) => {
    try {
      const body = z
        .object({
          email: z
            .string()
            .email()
            .transform((e) => e.toLowerCase()),
        })
        .parse(req.body);

      const pending = await storage.getPendingPasswordSignup(body.email);
      if (!pending) {
        return res.status(400).json({
          message: "No pending signup for this email. Start over from the signup form.",
        });
      }
      if (!allowSignupOtpResend(body.email)) {
        return res.status(429).json({
          message: "Too many resend attempts. Try again in about an hour.",
        });
      }
      try {
        await resendSignupOtp(body.email);
      } catch (emailErr) {
        console.error("Failed to resend signup OTP:", emailErr);
        return res.status(503).json({
          message: "Could not send email. Check SMTP configuration.",
        });
      }
      return res.json({ ok: true });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return jsonValidationError(res, err);
      }
      console.error("password/signup/resend error:", err);
      return res.status(500).json({ message: "Could not resend code" });
    }
  });

  app.post("/api/auth/password/login", async (req, res) => {
    try {
      const body = passwordLoginSchema.parse(req.body);

      const user = await storage.getUserByEmail(body.email);

      // If we don't have a row, don’t leak info.
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Provider-aware mismatch:
      // Google-only accounts => passwordHash is null
      if (!user.passwordHash) {
        return providerMismatch(res, "google");
      }

      const ok = await verifyPassword(body.password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      await establishSession(req, user.id);
      return res.status(200).json({ ok: true });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return jsonValidationError(res, err);
      }
      console.error("password/login error:", err);
      return res.status(400).json({ message: "Login failed" });
    }
  });

  // --- User profile ---
  app.get("/api/me/profile", verifyAuth, async (req, res) => {
    const user = await storage.getUserByFirebaseUid(req.firebaseUid!);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const pro = await storage.getProByFirebaseUid(req.firebaseUid!);
    return res.json({
      user,
      isPro: !!pro,
      proId: pro?.id ?? null,
      proUsername: pro?.username ?? null,
    });
  });

  app.patch("/api/me/profile", verifyAuth, async (req, res) => {
    try {
      const parsed = updateUserProfileSchema.parse(req.body);
      const updated = await storage.updateUserProfile(req.firebaseUid!, parsed);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: err.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- Current user's pro profile ---
  app.get("/api/me/pro", verifyAuth, async (req, res) => {
    const pro = await storage.getProByFirebaseUid(req.firebaseUid!);
    if (!pro) {
      return res.status(404).json({ message: "No pro profile found" });
    }
    return res.json(pro);
  });

  app.patch("/api/me/pro", verifyAuth, async (req, res) => {
    try {
      const pro = await storage.getProByFirebaseUid(req.firebaseUid!);
      if (!pro) {
        return res.status(404).json({ message: "No pro profile found" });
      }
      const parsed = updateProSchema.parse(req.body);
      const updated = await storage.updatePro(pro.id, parsed);
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: err.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- Bookings ---
  app.post("/api/bookings", verifyAuth, async (req, res) => {
    try {
      const parsed = insertBookingSchema.parse(req.body);
      const pro = await storage.getPro(parsed.proId);
      if (!pro) {
        return res.status(404).json({ message: "Pro not found" });
      }
      const booking = await storage.createBooking(req.firebaseUid!, parsed);
      return res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid booking data", errors: err.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/me/bookings", verifyAuth, async (req, res) => {
    const bookings = await storage.getBookingsForRequester(req.firebaseUid!);
    return res.json(bookings);
  });

  app.get("/api/me/requests", verifyAuth, async (req, res) => {
    const pro = await storage.getProByFirebaseUid(req.firebaseUid!);
    if (!pro) {
      return res.status(404).json({ message: "No pro profile found" });
    }
    const requests = await storage.getBookingsForPro(pro.id);
    return res.json(requests);
  });

  app.patch("/api/bookings/:id/status", verifyAuth, async (req, res) => {
    try {
      const parsed = updateBookingStatusSchema.parse(req.body);
      const idParam = req.params.id;
      const bookingId = Array.isArray(idParam) ? idParam[0] : idParam;
      if (!bookingId)
        return res.status(400).json({ message: "Invalid booking id" });

      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const pro = await storage.getProByFirebaseUid(req.firebaseUid!);
      if (!pro || pro.id !== booking.proId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      let roomId: string | undefined;
      if (
        parsed.status === "accepted" &&
        booking.sessionType === "video_call"
      ) {
        roomId = nanoid(12);
      }

      const updated = await storage.updateBookingStatus(
        booking.id,
        parsed.status,
        roomId,
      );
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid status", errors: err.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/me/earnings", verifyAuth, async (req, res) => {
    const pro = await storage.getProByFirebaseUid(req.firebaseUid!);
    if (!pro) {
      return res.status(404).json({ message: "No pro profile found" });
    }
    const earnings = await storage.getEarningsForPro(pro.id);
    return res.json(earnings);
  });

  // --- Connection Requests ---
  app.post("/api/connection-requests", verifyAuth, async (req, res) => {
    try {
      const parsed = insertConnectionRequestSchema.parse(req.body);
      const request = await storage.createConnectionRequest(
        req.firebaseUid!,
        parsed,
      );
      return res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid request data", errors: err.errors });
      }
      console.error("Connection request error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/me/connection-requests", verifyAuth, async (req, res) => {
    const requests = await storage.getConnectionRequestsForUser(
      req.firebaseUid!,
    );
    return res.json(requests);
  });

  app.get("/api/rooms/:roomId", verifyAuth, async (req, res) => {
    const roomIdParam = req.params.roomId;
    const roomId = Array.isArray(roomIdParam) ? roomIdParam[0] : roomIdParam;
    if (!roomId) {
      return res.status(400).json({ message: "Invalid room id" });
    }
    const booking = await storage.getBookingByRoomId(roomId);

    if (!booking) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isRequester = booking.requesterFirebaseUid === req.firebaseUid;
    const proUser = await storage.getProByFirebaseUid(req.firebaseUid!);
    const isPro = proUser && proUser.id === booking.proId;

    if (!isRequester && !isPro) {
      return res.status(403).json({ message: "Not authorized for this room" });
    }

    const bookingPro = await storage.getPro(booking.proId);

    return res.json({
      booking,
      proName: bookingPro?.displayName ?? "Pro",
      role: isPro ? "pro" : "requester",
    });
  });

  // --- WebSocket signaling server for WebRTC video calls ---
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const rooms = new Map<string, RoomClient[]>();
  // Performance Optimization: Track which rooms each client is in for O(1) cleanup.
  // Using a Set per client ensures robustness if a client is in multiple rooms.
  const clientRooms = new Map<WebSocket, Set<string>>();

  function getRoomClients(roomId: string): RoomClient[] {
    if (!rooms.has(roomId)) rooms.set(roomId, []);
    return rooms.get(roomId)!;
  }

  function removeClientFromRooms(ws: WebSocket) {
    const roomIds = clientRooms.get(ws);
    if (!roomIds) return;

    roomIds.forEach((roomId) => {
      const clients = rooms.get(roomId);
      if (clients) {
        const idx = clients.findIndex((c) => c.ws === ws);
        if (idx !== -1) {
          const [removed] = clients.splice(idx, 1);
          clients.forEach((c) => {
            if (c.ws.readyState === WebSocket.OPEN) {
              c.ws.send(
                JSON.stringify({
                  type: "peerLeft",
                  payload: { userId: removed.userId },
                }),
              );
            }
          });
          if (clients.length === 0) {
            rooms.delete(roomId);
          }
        }
      }
    });
    clientRooms.delete(ws);
  }

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      try {
        const { type, payload } = JSON.parse(data.toString());

        switch (type) {
          case "joinRoom": {
            const { roomId, userId, userName } = payload;
            if (!roomId || !userId) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  payload: { message: "roomId and userId are required" },
                }),
              );
              return;
            }

            // Ensure client is removed from other rooms if application policy is 1 room at a time,
            // or just ensure state consistency. Original code called removeClientFromRooms(ws).
            removeClientFromRooms(ws);

            const clients = getRoomClients(roomId);

            if (clients.length >= 2) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  payload: { message: "Room is full (max 2 participants)" },
                }),
              );
              return;
            }

            const existingPeer = clients[0];
            clients.push({ ws, userId, userName: userName || userId });

            if (!clientRooms.has(ws)) {
              clientRooms.set(ws, new Set());
            }
            clientRooms.get(ws)!.add(roomId);

            if (existingPeer) {
              ws.send(
                JSON.stringify({
                  type: "peerJoined",
                  payload: {
                    partnerName: existingPeer.userName,
                    initiator: true,
                  },
                }),
              );
              if (existingPeer.ws.readyState === WebSocket.OPEN) {
                existingPeer.ws.send(
                  JSON.stringify({
                    type: "peerJoined",
                    payload: {
                      partnerName: userName || userId,
                      initiator: false,
                    },
                  }),
                );
              }
            } else {
              ws.send(
                JSON.stringify({ type: "roomJoined", payload: { roomId } }),
              );
            }
            break;
          }

          case "offer":
          case "answer":
          case "iceCandidate": {
            const { roomId } = payload;
            const clients = getRoomClients(roomId);
            clients.forEach((c) => {
              if (c.ws !== ws && c.ws.readyState === WebSocket.OPEN) {
                c.ws.send(JSON.stringify({ type, payload }));
              }
            });
            break;
          }

          case "leaveRoom": {
            removeClientFromRooms(ws);
            break;
          }
        }
      } catch {
        // malformed WS messages are silently ignored
      }
    });

    ws.on("close", () => {
      removeClientFromRooms(ws);
    });
  });

  seedDatabase().catch(() => {});

  return httpServer;
}

export async function seedDatabase() {
  const existing = await storage.getPros();
  if (existing.length > 0) return;

  const initialPros = [
    {
      username: "techguru",
      displayName: "Alex Rivera",
      bio: "Tech reviewer and software engineer. Helping you navigate the world of coding and gadgets.",
      socialHandle: "@arivera_tech",
      socialPlatform: "twitter",
      price: 150,
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      availability: "Mon-Fri, 2PM-6PM EST",
      categories: "Tech,Web Dev,Career Coaching",
      videoCallPrice: 150,
      audioConsultPrice: 275,
      dmBundlePrice: 45,
      deepDivePrice: 500,
    },
    {
      username: "sarahdesign",
      displayName: "Sarah Chen",
      bio: "Senior Product Designer at BigTech. I do portfolio reviews and career coaching for junior designers.",
      socialHandle: "@designwithsarah",
      socialPlatform: "instagram",
      price: 200,
      imageUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      availability: "Weekends only",
      categories: "Design,Career Coaching",
      videoCallPrice: 200,
      audioConsultPrice: 150,
      dmBundlePrice: null,
      deepDivePrice: 400,
    },
    {
      username: "markcrypto",
      displayName: "Mark Johnson",
      bio: "DeFi analyst and crypto educator. Let's talk about the future of finance.",
      socialHandle: "@mark_on_chain",
      socialPlatform: "twitter",
      price: 300,
      imageUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      isVerified: false,
      availability: "Tue & Thu, 10AM-2PM PST",
      categories: "Finance,Crypto",
      videoCallPrice: 300,
      audioConsultPrice: null,
      dmBundlePrice: 75,
      deepDivePrice: 600,
    },
    {
      username: "jessicalifestyle",
      displayName: "Jessica Wu",
      bio: "Lifestyle vlogger and content creator strategy consultant. Grow your audience authentically.",
      socialHandle: "@jesswu",
      socialPlatform: "instagram",
      price: 100,
      imageUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      availability: "Flexible schedule",
      categories: "Content Creation,Marketing",
      videoCallPrice: 100,
      audioConsultPrice: 80,
      dmBundlePrice: 30,
      deepDivePrice: null,
    },
    {
      username: "devdavid",
      displayName: "David Miller",
      bio: "Fullstack developer and open source contributor. Expert in React, Node.js, and Cloud Architecture.",
      socialHandle: "@david_codes",
      socialPlatform: "github",
      price: 120,
      imageUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      availability: "Evenings 6PM-9PM",
      categories: "Tech,Web Dev,AI / ML",
      videoCallPrice: 120,
      audioConsultPrice: 100,
      dmBundlePrice: 40,
      deepDivePrice: 250,
    },
    {
      username: "creativeanna",
      displayName: "Anna Smith",
      bio: "Digital artist and illustrator. Offering mentorship and art critiques.",
      socialHandle: "@annadraws",
      socialPlatform: "instagram",
      price: 90,
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      isVerified: false,
      availability: "Mon, Wed, Fri",
      categories: "Design,Content Creation",
      videoCallPrice: 90,
      audioConsultPrice: null,
      dmBundlePrice: 25,
      deepDivePrice: null,
    },
  ];

  for (const row of initialPros) {
    const parsed = internalInsertProSchema.parse(row);
    await storage.createPro(parsed);
  }
  console.log("Database seeded successfully.");
}

const passwordSignupSchema = z.object({
  email: z
    .string()
    .email()
    .transform((e) => e.toLowerCase()),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  displayName: z.string().min(1).max(100),
});

const passwordLoginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((e) => e.toLowerCase()),
  password: z.string().min(1, { message: "Password is required." }),
});

const PASSWORD_HASH_VERSION = "v1";
const SCRYPT_KEYLEN = 64;
const SCRYPT_SALT_BYTES = 16;
const SCRYPT_N = 1 << 13;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

function randomBase64(bytes: number) {
  return crypto.randomBytes(bytes).toString("base64");
}

async function scryptPromise(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      SCRYPT_KEYLEN,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
      (err, derivedKey) => {
        if (err) return reject(err);
        resolve(derivedKey);
      },
    );
  });
}

async function hashPassword(raw: string): Promise<string> {
  const saltB64 = randomBase64(SCRYPT_SALT_BYTES);
  const derivedKey = await scryptPromise(raw, saltB64);
  const hashB64 = derivedKey.toString("base64");
  return `${PASSWORD_HASH_VERSION}$${saltB64}$${hashB64}`;
}

async function verifyPassword(raw: string, stored: string): Promise<boolean> {
  const [version, saltB64, hashB64] = stored.split("$");
  if (version !== PASSWORD_HASH_VERSION || !saltB64 || !hashB64) return false;

  const derivedKey = await scryptPromise(raw, saltB64);
  const computedB64 = derivedKey.toString("base64");

  // timing-safe compare
  return crypto.timingSafeEqual(Buffer.from(computedB64), Buffer.from(hashB64));
}

function providerMismatch(res: any, provider: "google" | "password") {
  return res.status(409).json({
    code: "PROVIDER_MISMATCH",
    provider,
    message:
      provider === "google"
        ? "This account uses Google sign-in."
        : "This account uses email/password sign-in.",
  });
}

function jsonValidationError(res: Response, err: z.ZodError) {
  const first = err.issues[0];
  const message = first?.message ?? "Invalid request";

  return res.status(400).json({
    code: "VALIDATION_ERROR",
    message,
    errors: err.issues.map((issue) => ({
      path: issue.path.map(String).join(".") || "root",
      message: issue.message,
    })),
  });
}
