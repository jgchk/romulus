CREATE TABLE IF NOT EXISTS "GenreDerivedFrom" (
	"derivedFromId" integer NOT NULL,
	"derivationId" integer NOT NULL,
	CONSTRAINT "GenreDerivedFrom_derivedFromId_derivationId_pk" PRIMARY KEY("derivedFromId","derivationId")
);
--> statement-breakpoint
ALTER TABLE "GenreHistory" ADD COLUMN "derivedFromGenreIds" integer[];--> statement-breakpoint
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
