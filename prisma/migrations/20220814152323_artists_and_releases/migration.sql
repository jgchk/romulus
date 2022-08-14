/*
  Warnings:

  - You are about to drop the column `releaseDate` on the `Release` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Release` table. All the data in the column will be lost.
  - You are about to drop the `ReleaseRating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReleaseReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrackRating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrackReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ArtistToRelease` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Artist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Release` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Permission" ADD VALUE 'EDIT_ARTISTS';
ALTER TYPE "Permission" ADD VALUE 'EDIT_RELEASES';

-- DropForeignKey
ALTER TABLE "ReleaseRating" DROP CONSTRAINT "ReleaseRating_accountId_fkey";

-- DropForeignKey
ALTER TABLE "ReleaseRating" DROP CONSTRAINT "ReleaseRating_releaseId_fkey";

-- DropForeignKey
ALTER TABLE "ReleaseReview" DROP CONSTRAINT "ReleaseReview_accountId_fkey";

-- DropForeignKey
ALTER TABLE "ReleaseReview" DROP CONSTRAINT "ReleaseReview_releaseId_fkey";

-- DropForeignKey
ALTER TABLE "TrackRating" DROP CONSTRAINT "TrackRating_accountId_fkey";

-- DropForeignKey
ALTER TABLE "TrackRating" DROP CONSTRAINT "TrackRating_trackId_fkey";

-- DropForeignKey
ALTER TABLE "TrackReview" DROP CONSTRAINT "TrackReview_accountId_fkey";

-- DropForeignKey
ALTER TABLE "TrackReview" DROP CONSTRAINT "TrackReview_trackId_fkey";

-- DropForeignKey
ALTER TABLE "_ArtistToRelease" DROP CONSTRAINT "_ArtistToRelease_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArtistToRelease" DROP CONSTRAINT "_ArtistToRelease_B_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "akas" TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "spotifyIds" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Release" DROP COLUMN "releaseDate",
DROP COLUMN "title",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "ReleaseRating";

-- DropTable
DROP TABLE "ReleaseReview";

-- DropTable
DROP TABLE "TrackRating";

-- DropTable
DROP TABLE "TrackReview";

-- DropTable
DROP TABLE "_ArtistToRelease";

-- CreateTable
CREATE TABLE "ArtistHistory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "akas" TEXT[],
    "spotifyIds" TEXT[],
    "artistId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operation" "GenreOperation" NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "ArtistHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseHistory" (
    "id" SERIAL NOT NULL,
    "releaseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operation" "GenreOperation" NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "ReleaseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "releaseDate" TEXT,
    "spotifyId" TEXT,
    "releaseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueArtist" (
    "issueId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "IssueArtist_pkey" PRIMARY KEY ("issueId","artistId")
);

-- CreateTable
CREATE TABLE "IssueHistory" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artistIds" INTEGER[],
    "releaseDate" TEXT,
    "spotifyId" TEXT,
    "issueId" INTEGER NOT NULL,
    "releaseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operation" "GenreOperation" NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "IssueHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER,
    "review" INTEGER,
    "accountId" INTEGER NOT NULL,
    "releaseId" INTEGER,
    "issueId" INTEGER,
    "trackId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArtistHistory" ADD CONSTRAINT "ArtistHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseHistory" ADD CONSTRAINT "ReleaseHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueArtist" ADD CONSTRAINT "IssueArtist_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueArtist" ADD CONSTRAINT "IssueArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueHistory" ADD CONSTRAINT "IssueHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;
