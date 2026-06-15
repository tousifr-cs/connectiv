CREATE TABLE IF NOT EXISTS "jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "poster_user_id" uuid NOT NULL,
  "poster_firebase_uid" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "category" text,
  "skills" text DEFAULT '',
  "budget_amount" integer NOT NULL,
  "currency" text NOT NULL DEFAULT 'USD',
  "budget_type" text NOT NULL DEFAULT 'fixed',
  "status" text NOT NULL DEFAULT 'open',
  "deadline" timestamp with time zone,
  "accepted_proposal_id" uuid,
  "booking_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "job_proposals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "job_id" uuid NOT NULL,
  "pro_id" integer NOT NULL,
  "pro_firebase_uid" text NOT NULL,
  "cover_letter" text NOT NULL,
  "proposed_amount" integer NOT NULL,
  "currency" text NOT NULL DEFAULT 'USD',
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "jobs_status_idx" ON "jobs" ("status");
CREATE INDEX IF NOT EXISTS "jobs_poster_firebase_uid_idx" ON "jobs" ("poster_firebase_uid");
CREATE INDEX IF NOT EXISTS "job_proposals_job_id_idx" ON "job_proposals" ("job_id");
CREATE INDEX IF NOT EXISTS "job_proposals_pro_id_idx" ON "job_proposals" ("pro_id");
