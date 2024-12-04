ALTER TABLE "GenreHistory" DROP CONSTRAINT "GenreHistory_accountId_fkey";
--> statement-breakpoint
ALTER TABLE "Concept" DROP CONSTRAINT "Concept_typeId_fkey";
--> statement-breakpoint
ALTER TABLE "ConceptIssue" DROP CONSTRAINT "ConceptIssue_conceptId_fkey";
--> statement-breakpoint
ALTER TABLE "Item" DROP CONSTRAINT "Item_typeId_fkey";
--> statement-breakpoint
ALTER TABLE "_ConceptToConceptBundle" DROP CONSTRAINT "_ConceptToConceptBundle_A_fkey";
--> statement-breakpoint
ALTER TABLE "_ConceptToConceptBundle" DROP CONSTRAINT "_ConceptToConceptBundle_B_fkey";
--> statement-breakpoint
ALTER TABLE "_ConceptToUnit" DROP CONSTRAINT "_ConceptToUnit_A_fkey";
--> statement-breakpoint
ALTER TABLE "_ConceptToUnit" DROP CONSTRAINT "_ConceptToUnit_B_fkey";
--> statement-breakpoint
ALTER TABLE "_ItemToItemBundle" DROP CONSTRAINT "_ItemToItemBundle_A_fkey";
--> statement-breakpoint
ALTER TABLE "_ItemToItemBundle" DROP CONSTRAINT "_ItemToItemBundle_B_fkey";
--> statement-breakpoint
ALTER TABLE "_hierarchy" DROP CONSTRAINT "_hierarchy_A_fkey";
--> statement-breakpoint
ALTER TABLE "_hierarchy" DROP CONSTRAINT "_hierarchy_B_fkey";
--> statement-breakpoint
ALTER TABLE "ConceptBundleIssue" DROP CONSTRAINT "ConceptBundleIssue_conceptBundleId_fkey";
--> statement-breakpoint
ALTER TABLE "Member" DROP CONSTRAINT "Member_artistId_fkey";
--> statement-breakpoint
ALTER TABLE "Member" DROP CONSTRAINT "Member_personId_fkey";
--> statement-breakpoint
ALTER TABLE "UnitIssue" DROP CONSTRAINT "UnitIssue_unitId_fkey";
--> statement-breakpoint
ALTER TABLE "_influence" DROP CONSTRAINT "_influence_A_fkey";
--> statement-breakpoint
ALTER TABLE "_influence" DROP CONSTRAINT "_influence_B_fkey";
--> statement-breakpoint
ALTER TABLE "GenreHistoryAka" DROP CONSTRAINT "GenreHistoryAka_genreId_fkey";
--> statement-breakpoint
ALTER TABLE "GenreAka" DROP CONSTRAINT "GenreAka_genreId_fkey";
--> statement-breakpoint
ALTER TABLE "GenreRelevanceVote" DROP CONSTRAINT "GenreRelevanceVote_accountId_fkey";
--> statement-breakpoint
ALTER TABLE "GenreRelevanceVote" DROP CONSTRAINT "GenreRelevanceVote_genreId_fkey";
--> statement-breakpoint
ALTER TABLE "Genre" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "GenreHistory" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Account" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Account" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "GenreRelevanceVote" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreHistory" ADD CONSTRAINT "GenreHistory_accountId_Account_id_fk" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Concept" ADD CONSTRAINT "Concept_typeId_ConceptType_id_fk" FOREIGN KEY ("typeId") REFERENCES "ConceptType"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ConceptIssue" ADD CONSTRAINT "ConceptIssue_conceptId_Concept_id_fk" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Item" ADD CONSTRAINT "Item_typeId_ItemType_id_fk" FOREIGN KEY ("typeId") REFERENCES "ItemType"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ConceptToConceptBundle" ADD CONSTRAINT "_ConceptToConceptBundle_A_Concept_id_fk" FOREIGN KEY ("A") REFERENCES "Concept"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ConceptToConceptBundle" ADD CONSTRAINT "_ConceptToConceptBundle_B_ConceptBundle_id_fk" FOREIGN KEY ("B") REFERENCES "ConceptBundle"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ConceptToUnit" ADD CONSTRAINT "_ConceptToUnit_A_Concept_id_fk" FOREIGN KEY ("A") REFERENCES "Concept"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ConceptToUnit" ADD CONSTRAINT "_ConceptToUnit_B_Unit_id_fk" FOREIGN KEY ("B") REFERENCES "Unit"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ItemToItemBundle" ADD CONSTRAINT "_ItemToItemBundle_A_Item_id_fk" FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ItemToItemBundle" ADD CONSTRAINT "_ItemToItemBundle_B_ItemBundle_id_fk" FOREIGN KEY ("B") REFERENCES "ItemBundle"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_hierarchy" ADD CONSTRAINT "_hierarchy_A_Genre_id_fk" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_hierarchy" ADD CONSTRAINT "_hierarchy_B_Genre_id_fk" FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ConceptBundleIssue" ADD CONSTRAINT "ConceptBundleIssue_conceptBundleId_ConceptBundle_id_fk" FOREIGN KEY ("conceptBundleId") REFERENCES "ConceptBundle"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Member" ADD CONSTRAINT "Member_personId_Person_id_fk" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Member" ADD CONSTRAINT "Member_artistId_Artist_id_fk" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UnitIssue" ADD CONSTRAINT "UnitIssue_unitId_Unit_id_fk" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_influence" ADD CONSTRAINT "_influence_A_Genre_id_fk" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_influence" ADD CONSTRAINT "_influence_B_Genre_id_fk" FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreHistoryAka" ADD CONSTRAINT "GenreHistoryAka_genreId_GenreHistory_id_fk" FOREIGN KEY ("genreId") REFERENCES "GenreHistory"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreAka" ADD CONSTRAINT "GenreAka_genreId_Genre_id_fk" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreRelevanceVote" ADD CONSTRAINT "GenreRelevanceVote_genreId_Genre_id_fk" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreRelevanceVote" ADD CONSTRAINT "GenreRelevanceVote_accountId_Account_id_fk" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
