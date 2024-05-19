ALTER TABLE "GenreAka" DROP CONSTRAINT "GenreAka_pkey";--> statement-breakpoint
ALTER TABLE "GenreAka" ADD CONSTRAINT "GenreAka_genreId_name_pk" PRIMARY KEY("genreId","name");