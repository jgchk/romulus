ALTER TABLE "GenreInfluences" RENAME COLUMN "influencedIdd" TO "influencedId";--> statement-breakpoint
ALTER TABLE "GenreInfluences" RENAME COLUMN "influencerIdd" TO "influencerId";--> statement-breakpoint
ALTER TABLE "GenreInfluences" DROP CONSTRAINT "GenreInfluences_influencedIdd_Genre_id_fk";
--> statement-breakpoint
ALTER TABLE "GenreInfluences" DROP CONSTRAINT "GenreInfluences_influencerIdd_Genre_id_fk";
--> statement-breakpoint
ALTER TABLE "GenreInfluences" DROP CONSTRAINT "GenreInfluences_influencerIdd_influencedIdd_pk";--> statement-breakpoint
ALTER TABLE "GenreInfluences" ADD CONSTRAINT "GenreInfluences_influencerId_influencedId_pk" PRIMARY KEY("influencerId","influencedId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreInfluences" ADD CONSTRAINT "GenreInfluences_influencedId_Genre_id_fk" FOREIGN KEY ("influencedId") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreInfluences" ADD CONSTRAINT "GenreInfluences_influencerId_Genre_id_fk" FOREIGN KEY ("influencerId") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
