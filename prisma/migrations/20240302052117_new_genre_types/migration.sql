-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GenreType" ADD VALUE 'PERIOD';
ALTER TYPE "GenreType" ADD VALUE 'CATEGORY';
ALTER TYPE "GenreType" ADD VALUE 'MEDIATYPE';
ALTER TYPE "GenreType" ADD VALUE 'SENSE';
ALTER TYPE "GenreType" ADD VALUE 'OBJECT';
ALTER TYPE "GenreType" ADD VALUE 'TEMPORARY';

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "genreRelevanceFilter" SET DEFAULT 0;
