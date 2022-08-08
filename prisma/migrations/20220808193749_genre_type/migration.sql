-- CreateEnum
CREATE TYPE "GenreType" AS ENUM ('MOVEMENT', 'META', 'STYLE', 'SCENE', 'TREND');

-- AlterTable
ALTER TABLE "Genre" ADD COLUMN     "type" "GenreType" NOT NULL DEFAULT 'STYLE';
