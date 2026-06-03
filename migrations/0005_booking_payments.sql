ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "requester_user_id" uuid;

UPDATE "bookings" b
SET "requester_user_id" = u."id"
FROM "users" u
WHERE b."requester_user_id" IS NULL
  AND b."requester_firebase_uid" = u."firebase_uid";

ALTER TABLE "bookings"
  ALTER COLUMN "requester_user_id" SET NOT NULL;

ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "gross_amount" integer;

UPDATE "bookings"
SET "gross_amount" = "price"
WHERE "gross_amount" IS NULL;

ALTER TABLE "bookings"
  ALTER COLUMN "gross_amount" SET NOT NULL;

ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "currency" text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS "platform_fee_percent" integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS "platform_fee_amount" integer,
  ADD COLUMN IF NOT EXISTS "pro_payout_amount" integer,
  ADD COLUMN IF NOT EXISTS "payment_provider" text NOT NULL DEFAULT 'payoneer_manual',
  ADD COLUMN IF NOT EXISTS "payment_request_link" text,
  ADD COLUMN IF NOT EXISTS "payment_request_id" text,
  ADD COLUMN IF NOT EXISTS "payment_received_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "payout_reference_id" text,
  ADD COLUMN IF NOT EXISTS "payout_sent_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "notes" text,
  ADD COLUMN IF NOT EXISTS "pro_response_status" text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "status_changed_by" text,
  ADD COLUMN IF NOT EXISTS "status_changed_at" timestamp with time zone NOT NULL DEFAULT now();

UPDATE "bookings"
SET
  "platform_fee_amount" = COALESCE("platform_fee_amount", CAST(ROUND("gross_amount" * 0.15) AS integer)),
  "pro_payout_amount" = COALESCE("pro_payout_amount", "gross_amount" - CAST(ROUND("gross_amount" * 0.15) AS integer))
WHERE "platform_fee_amount" IS NULL
   OR "pro_payout_amount" IS NULL;

ALTER TABLE "bookings"
  ALTER COLUMN "platform_fee_amount" SET NOT NULL;

ALTER TABLE "bookings"
  ALTER COLUMN "pro_payout_amount" SET NOT NULL;

ALTER TABLE "bookings"
  ALTER COLUMN "status" SET DEFAULT 'payment_pending';

UPDATE "bookings"
SET "status" = CASE
  WHEN "status" = 'pending' THEN 'payment_pending'
  WHEN "status" = 'accepted' THEN 'payment_received'
  WHEN "status" = 'completed' THEN 'session_completed'
  WHEN "status" = 'declined' THEN 'cancelled'
  ELSE "status"
END
WHERE "status" IN ('pending', 'accepted', 'completed', 'declined');

UPDATE "bookings"
SET "pro_response_status" = CASE
  WHEN "status" = 'payment_received' AND "room_id" IS NOT NULL THEN 'accepted'
  WHEN "status" = 'cancelled' THEN 'declined'
  ELSE "pro_response_status"
END;
