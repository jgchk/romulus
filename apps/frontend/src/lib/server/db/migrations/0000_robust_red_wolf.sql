-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
DO $$ BEGIN
 CREATE TYPE "GenreOperation" AS ENUM('DELETE', 'UPDATE', 'CREATE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "GenreType" AS ENUM('TREND', 'SCENE', 'STYLE', 'META', 'MOVEMENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "Permission" AS ENUM('EDIT_RELEASES', 'EDIT_ARTISTS', 'MIGRATE_CONTRIBUTORS', 'EDIT_GENRES');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ItemBundle" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Genre" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"shortDescription" text,
	"longDescription" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"notes" text,
	"type" "GenreType" DEFAULT 'STYLE' NOT NULL,
	"relevance" integer DEFAULT 99 NOT NULL,
	"subtitle" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenreHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "GenreType" DEFAULT 'STYLE' NOT NULL,
	"shortDescription" text,
	"longDescription" text,
	"notes" text,
	"parentGenreIds" integer[],
	"influencedByGenreIds" integer[],
	"treeGenreId" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"operation" "GenreOperation" NOT NULL,
	"accountId" integer,
	"subtitle" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Account" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"darkMode" boolean DEFAULT true NOT NULL,
	"permissions" "Permission"[],
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"genreRelevanceFilter" integer DEFAULT 1 NOT NULL,
	"showRelevanceTags" boolean DEFAULT false NOT NULL,
	"showTypeTags" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ItemType" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Artist" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConceptBundle" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Concept" (
	"id" serial PRIMARY KEY NOT NULL,
	"typeId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConceptIssue" (
	"id" serial PRIMARY KEY NOT NULL,
	"conceptId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConceptType" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Item" (
	"id" serial PRIMARY KEY NOT NULL,
	"typeId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Unit" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_ConceptToConceptBundle" (
	"A" integer NOT NULL,
	"B" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_ConceptToUnit" (
	"A" integer NOT NULL,
	"B" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_ItemToItemBundle" (
	"A" integer NOT NULL,
	"B" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_hierarchy" (
	"A" integer NOT NULL,
	"B" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConceptBundleIssue" (
	"id" serial PRIMARY KEY NOT NULL,
	"conceptBundleId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Member" (
	"id" serial PRIMARY KEY NOT NULL,
	"personId" integer NOT NULL,
	"artistId" integer NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Person" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstName" text,
	"middleName" text,
	"lastName" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UnitIssue" (
	"id" serial PRIMARY KEY NOT NULL,
	"unitId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_influence" (
	"A" integer NOT NULL,
	"B" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenreHistoryAka" (
	"genreId" integer NOT NULL,
	"name" text NOT NULL,
	"relevance" integer NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "GenreHistoryAka_pkey" PRIMARY KEY("genreId","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenreAka" (
	"genreId" integer NOT NULL,
	"name" text NOT NULL,
	"relevance" integer NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "GenreAka_pkey" PRIMARY KEY("genreId","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenreRelevanceVote" (
	"genreId" integer NOT NULL,
	"accountId" integer NOT NULL,
	"relevance" integer NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	CONSTRAINT "GenreRelevanceVote_pkey" PRIMARY KEY("genreId","accountId")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Account_username_key" ON "Account" ("username");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_ConceptToConceptBundle_AB_unique" ON "_ConceptToConceptBundle" ("A","B");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_ConceptToConceptBundle_B_index" ON "_ConceptToConceptBundle" ("B");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_ConceptToUnit_AB_unique" ON "_ConceptToUnit" ("A","B");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_ConceptToUnit_B_index" ON "_ConceptToUnit" ("B");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_ItemToItemBundle_AB_unique" ON "_ItemToItemBundle" ("A","B");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_ItemToItemBundle_B_index" ON "_ItemToItemBundle" ("B");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_hierarchy_AB_unique" ON "_hierarchy" ("A","B");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_hierarchy_B_index" ON "_hierarchy" ("B");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_influence_AB_unique" ON "_influence" ("A","B");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_influence_B_index" ON "_influence" ("B");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreHistory" ADD CONSTRAINT "GenreHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Concept" ADD CONSTRAINT "Concept_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."ConceptType"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ConceptIssue" ADD CONSTRAINT "ConceptIssue_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "public"."Concept"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Item" ADD CONSTRAINT "Item_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."ItemType"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ConceptToConceptBundle" ADD CONSTRAINT "_ConceptToConceptBundle_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Concept"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ConceptToConceptBundle" ADD CONSTRAINT "_ConceptToConceptBundle_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ConceptBundle"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ConceptToUnit" ADD CONSTRAINT "_ConceptToUnit_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Concept"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ConceptToUnit" ADD CONSTRAINT "_ConceptToUnit_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Unit"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ItemToItemBundle" ADD CONSTRAINT "_ItemToItemBundle_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Item"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ItemToItemBundle" ADD CONSTRAINT "_ItemToItemBundle_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ItemBundle"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_hierarchy" ADD CONSTRAINT "_hierarchy_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_hierarchy" ADD CONSTRAINT "_hierarchy_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ConceptBundleIssue" ADD CONSTRAINT "ConceptBundleIssue_conceptBundleId_fkey" FOREIGN KEY ("conceptBundleId") REFERENCES "public"."ConceptBundle"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Member" ADD CONSTRAINT "Member_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Member" ADD CONSTRAINT "Member_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UnitIssue" ADD CONSTRAINT "UnitIssue_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_influence" ADD CONSTRAINT "_influence_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_influence" ADD CONSTRAINT "_influence_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreHistoryAka" ADD CONSTRAINT "GenreHistoryAka_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "public"."GenreHistory"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreAka" ADD CONSTRAINT "GenreAka_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreRelevanceVote" ADD CONSTRAINT "GenreRelevanceVote_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreRelevanceVote" ADD CONSTRAINT "GenreRelevanceVote_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

