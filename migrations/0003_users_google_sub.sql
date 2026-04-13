ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_sub" text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_google_sub_unique'
  ) AND to_regclass('public.users_google_sub_unique') IS NULL THEN
    ALTER TABLE "users"
      ADD CONSTRAINT "users_google_sub_unique" UNIQUE("google_sub");
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.users_google_sub_unique') IS NULL THEN
    CREATE UNIQUE INDEX "users_google_sub_unique" ON "users" ("google_sub");
  END IF;
END $$;
