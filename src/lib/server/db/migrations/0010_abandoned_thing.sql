ALTER TABLE "Account" ALTER COLUMN "createdAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "Account" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "GenreHistory" ALTER COLUMN "createdAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "GenreRelevanceVote" ALTER COLUMN "createdAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "GenreRelevanceVote" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "Genre" ALTER COLUMN "createdAt" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "Genre" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp (3);