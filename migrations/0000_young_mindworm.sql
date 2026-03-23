CREATE TABLE "creators" (
	"id" serial PRIMARY KEY NOT NULL,
	"firebase_uid" text,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"bio" text NOT NULL,
	"social_handle" text NOT NULL,
	"social_platform" text NOT NULL,
	"price" integer NOT NULL,
	"image_url" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"availability" text DEFAULT 'Available for sessions',
	CONSTRAINT "creators_firebase_uid_unique" UNIQUE("firebase_uid"),
	CONSTRAINT "creators_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"firebase_uid" text NOT NULL,
	"email" text,
	"display_name" text,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_firebase_uid_unique" UNIQUE("firebase_uid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
