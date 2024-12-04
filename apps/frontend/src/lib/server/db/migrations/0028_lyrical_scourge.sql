CREATE TABLE IF NOT EXISTS "ReleaseIssueArtist" (
	"release_issue_id" integer NOT NULL,
	"artist_id" integer NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "ReleaseIssueArtist_release_issue_id_artist_id_pk" PRIMARY KEY("release_issue_id","artist_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ReleaseIssueTrack" (
	"release_issue_id" integer NOT NULL,
	"track_id" integer NOT NULL,
	"order" integer NOT NULL,
	"title" text,
	"duration_ms" integer,
	CONSTRAINT "ReleaseIssueTrack_release_issue_id_track_id_pk" PRIMARY KEY("release_issue_id","track_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ReleaseIssue" (
	"id" serial PRIMARY KEY NOT NULL,
	"release_id" integer NOT NULL,
	"title" text NOT NULL,
	"art" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReleaseIssueArtist" ADD CONSTRAINT "ReleaseIssueArtist_release_issue_id_ReleaseIssue_id_fk" FOREIGN KEY ("release_issue_id") REFERENCES "public"."ReleaseIssue"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReleaseIssueArtist" ADD CONSTRAINT "ReleaseIssueArtist_artist_id_Artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."Artist"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReleaseIssueTrack" ADD CONSTRAINT "ReleaseIssueTrack_release_issue_id_ReleaseIssue_id_fk" FOREIGN KEY ("release_issue_id") REFERENCES "public"."ReleaseIssue"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReleaseIssueTrack" ADD CONSTRAINT "ReleaseIssueTrack_track_id_Track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."Track"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReleaseIssue" ADD CONSTRAINT "ReleaseIssue_release_id_Release_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."Release"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
