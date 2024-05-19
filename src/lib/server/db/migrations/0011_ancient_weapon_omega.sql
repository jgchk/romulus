ALTER TABLE "GenreInfluences" RENAME COLUMN "influencerId" TO "influencedIdd";--> statement-breakpoint
ALTER TABLE "GenreInfluences" RENAME COLUMN "influencedId" TO "influencerIdd";--> statement-breakpoint
ALTER TABLE "GenreInfluences" DROP CONSTRAINT "GenreInfluences_influencerId_Genre_id_fk";
--> statement-breakpoint
ALTER TABLE "GenreInfluences" DROP CONSTRAINT "GenreInfluences_influencedId_Genre_id_fk";
--> statement-breakpoint
ALTER TABLE "GenreInfluences" DROP CONSTRAINT "GenreInfluences_influencerId_influencedId_pk";--> statement-breakpoint
ALTER TABLE "GenreInfluences" ADD CONSTRAINT "GenreInfluences_influencerIdd_influencedIdd_pk" PRIMARY KEY("influencerIdd","influencedIdd");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreInfluences" ADD CONSTRAINT "GenreInfluences_influencedIdd_Genre_id_fk" FOREIGN KEY ("influencedIdd") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreInfluences" ADD CONSTRAINT "GenreInfluences_influencerIdd_Genre_id_fk" FOREIGN KEY ("influencerIdd") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
