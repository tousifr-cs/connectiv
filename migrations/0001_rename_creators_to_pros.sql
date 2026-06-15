-- Rename legacy `creators` table to `pros` and align `bookings.creator_id` → `pro_id`.
-- Safe to run once on databases that still use the old names.

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'creators'
  ) THEN
    ALTER TABLE "creators" RENAME TO "pros";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public' AND table_name = 'pros'
      AND constraint_name = 'creators_firebase_uid_unique'
  ) THEN
    ALTER TABLE "pros" RENAME CONSTRAINT "creators_firebase_uid_unique" TO "pros_firebase_uid_unique";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public' AND table_name = 'pros'
      AND constraint_name = 'creators_username_unique'
  ) THEN
    ALTER TABLE "pros" RENAME CONSTRAINT "creators_username_unique" TO "pros_username_unique";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'creator_id'
  ) THEN
    ALTER TABLE "bookings" RENAME COLUMN "creator_id" TO "pro_id";
  END IF;
END $$;
