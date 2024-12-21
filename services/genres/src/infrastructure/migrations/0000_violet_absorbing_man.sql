CREATE TYPE "public"."GenreOperation" AS ENUM('DELETE', 'UPDATE', 'CREATE');--> statement-breakpoint
CREATE TYPE "public"."GenreType" AS ENUM('TREND', 'SCENE', 'STYLE', 'META', 'MOVEMENT');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenreAka" (
	"genreId" integer NOT NULL,
	"name" text NOT NULL,
	"relevance" integer NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "GenreAka_genreId_name_pk" PRIMARY KEY("genreId","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenreDerivedFrom" (
	"derivedFromId" integer NOT NULL,
	"derivationId" integer NOT NULL,
	CONSTRAINT "GenreDerivedFrom_derivedFromId_derivationId_pk" PRIMARY KEY("derivedFromId","derivationId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenreHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "GenreType" DEFAULT 'STYLE' NOT NULL,
	"shortDescription" text,
	"longDescription" text,
	"nsfw" boolean DEFAULT false NOT NULL,
	"notes" text,
	"parentGenreIds" integer[],
	"derivedFromGenreIds" integer[],
	"influencedByGenreIds" integer[],
	"treeGenreId" integer NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"operation" "GenreOperation" NOT NULL,
	"accountId" integer,
	"subtitle" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenreHistoryAka" (
	"genreId" integer NOT NULL,
	"name" text NOT NULL,
	"relevance" integer NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "GenreHistoryAka_genreId_name_pk" PRIMARY KEY("genreId","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenreInfluences" (
	"influencedId" integer NOT NULL,
	"influencerId" integer NOT NULL,
	CONSTRAINT "GenreInfluences_influencerId_influencedId_pk" PRIMARY KEY("influencerId","influencedId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenreParents" (
	"parentId" integer NOT NULL,
	"childId" integer NOT NULL,
	CONSTRAINT "GenreParents_parentId_childId_pk" PRIMARY KEY("parentId","childId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GenreRelevanceVote" (
	"genreId" integer NOT NULL,
	"accountId" integer NOT NULL,
	"relevance" integer NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	CONSTRAINT "GenreRelevanceVote_genreId_accountId_pk" PRIMARY KEY("genreId","accountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Genre" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subtitle" text,
	"type" "GenreType" DEFAULT 'STYLE' NOT NULL,
	"relevance" integer DEFAULT 99 NOT NULL,
	"nsfw" boolean DEFAULT false NOT NULL,
	"shortDescription" text,
	"longDescription" text,
	"notes" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreAka" ADD CONSTRAINT "GenreAka_genreId_Genre_id_fk" FOREIGN KEY ("genreId") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreDerivedFrom" ADD CONSTRAINT "GenreDerivedFrom_derivedFromId_Genre_id_fk" FOREIGN KEY ("derivedFromId") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreDerivedFrom" ADD CONSTRAINT "GenreDerivedFrom_derivationId_Genre_id_fk" FOREIGN KEY ("derivationId") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreHistoryAka" ADD CONSTRAINT "GenreHistoryAka_genreId_GenreHistory_id_fk" FOREIGN KEY ("genreId") REFERENCES "public"."GenreHistory"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreInfluences" ADD CONSTRAINT "GenreInfluences_influencedId_Genre_id_fk" FOREIGN KEY ("influencedId") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreInfluences" ADD CONSTRAINT "GenreInfluences_influencerId_Genre_id_fk" FOREIGN KEY ("influencerId") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreParents" ADD CONSTRAINT "GenreParents_parentId_Genre_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreParents" ADD CONSTRAINT "GenreParents_childId_Genre_id_fk" FOREIGN KEY ("childId") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GenreRelevanceVote" ADD CONSTRAINT "GenreRelevanceVote_genreId_Genre_id_fk" FOREIGN KEY ("genreId") REFERENCES "public"."Genre"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
