CREATE TABLE IF NOT EXISTS "Artist" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ReleaseArtist" (
	"release_id" integer NOT NULL,
	"artist_id" integer NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "ReleaseArtist_release_id_artist_id_pk" PRIMARY KEY("release_id","artist_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ReleaseIssue" (
	"id" serial PRIMARY KEY NOT NULL,
	"release_id" integer NOT NULL,
	"format" text NOT NULL,
	"label" text NOT NULL,
	"catno" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ReleaseTrack" (
	"release_id" integer NOT NULL,
	"track_id" integer NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "ReleaseTrack_release_id_track_id_pk" PRIMARY KEY("release_id","track_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Release" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"release_date" text NOT NULL,
	"art" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TrackArtist" (
	"track_id" integer NOT NULL,
	"artist_id" integer NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "TrackArtist_track_id_artist_id_pk" PRIMARY KEY("track_id","artist_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TrackIssue" (
	"id" serial PRIMARY KEY NOT NULL,
	"track_id" integer NOT NULL,
	"release_issue_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Track" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReleaseArtist" ADD CONSTRAINT "ReleaseArtist_release_id_Release_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."Release"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReleaseArtist" ADD CONSTRAINT "ReleaseArtist_artist_id_Artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."Artist"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReleaseIssue" ADD CONSTRAINT "ReleaseIssue_release_id_Release_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."Release"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReleaseTrack" ADD CONSTRAINT "ReleaseTrack_release_id_Release_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."Release"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReleaseTrack" ADD CONSTRAINT "ReleaseTrack_track_id_Track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."Track"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_track_id_Track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."Track"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_artist_id_Artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."Artist"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TrackIssue" ADD CONSTRAINT "TrackIssue_track_id_Track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."Track"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TrackIssue" ADD CONSTRAINT "TrackIssue_release_issue_id_ReleaseIssue_id_fk" FOREIGN KEY ("release_issue_id") REFERENCES "public"."ReleaseIssue"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
