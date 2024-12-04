ALTER TABLE "_influence" RENAME TO "GenreInfluences";--> statement-breakpoint
ALTER TABLE "GenreInfluences" RENAME COLUMN "A" TO "influencerId";--> statement-breakpoint
ALTER TABLE "GenreInfluences" RENAME COLUMN "B" TO "influencedId";--> statement-breakpoint
ALTER TABLE "GenreInfluences" DROP CONSTRAINT "_influence_A_Genre_id_fk";
--> statement-breakpoint
ALTER TABLE "GenreInfluences" DROP CONSTRAINT "_influence_B_Genre_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "_influence_AB_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "_influence_B_index";--> statement-breakpoint
ALTER TABLE "GenreInfluences" ADD CONSTRAINT "GenreInfluences_influencerId_influencedId_pk" PRIMARY KEY("influencerId","influencedId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreInfluences" ADD CONSTRAINT "GenreInfluences_influencerId_Genre_id_fk" FOREIGN KEY ("influencerId") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreInfluences" ADD CONSTRAINT "GenreInfluences_influencedId_Genre_id_fk" FOREIGN KEY ("influencedId") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
