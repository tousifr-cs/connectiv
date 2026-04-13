ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_sub" text;
ALTER TABLE "users" ADD CONSTRAINT IF NOT EXISTS "users_google_sub_unique" UNIQUE("google_sub");
