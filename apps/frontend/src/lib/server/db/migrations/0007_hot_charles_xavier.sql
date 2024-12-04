ALTER TABLE "_hierarchy" RENAME TO "GenreParents";--> statement-breakpoint
ALTER TABLE "GenreParents" RENAME COLUMN "A" TO "parentId";--> statement-breakpoint
ALTER TABLE "GenreParents" RENAME COLUMN "B" TO "childId";--> statement-breakpoint
ALTER TABLE "GenreParents" DROP CONSTRAINT "_hierarchy_A_Genre_id_fk";
--> statement-breakpoint
ALTER TABLE "GenreParents" DROP CONSTRAINT "_hierarchy_B_Genre_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "_hierarchy_AB_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "_hierarchy_B_index";--> statement-breakpoint
ALTER TABLE "GenreParents" ADD CONSTRAINT "GenreParents_parentId_childId_pk" PRIMARY KEY("parentId","childId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreParents" ADD CONSTRAINT "GenreParents_parentId_Genre_id_fk" FOREIGN KEY ("parentId") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreParents" ADD CONSTRAINT "GenreParents_childId_Genre_id_fk" FOREIGN KEY ("childId") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
