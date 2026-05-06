CREATE TABLE "room_recordings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "room_id" text NOT NULL,
  "booking_id" uuid NOT NULL,
  "requested_by_firebase_uid" text NOT NULL,
  "status" text DEFAULT 'requested' NOT NULL,
  "started_at" timestamp with time zone,
  "ended_at" timestamp with time zone,
  "storage_url" text,
  "provider" text DEFAULT 'jibri' NOT NULL,
  "failure_reason" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
