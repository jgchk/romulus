ALTER TABLE "GenreHistory" ADD COLUMN "nsfw" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Genre" ADD COLUMN "nsfw" boolean DEFAULT false NOT NULL;