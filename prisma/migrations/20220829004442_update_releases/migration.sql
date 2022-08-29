/*
  Warnings:

  - You are about to drop the column `artistIds` on the `IssueHistory` table. All the data in the column will be lost.
  - You are about to drop the `_ArtistToTrack` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ArtistToTrack" DROP CONSTRAINT "_ArtistToTrack_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArtistToTrack" DROP CONSTRAINT "_ArtistToTrack_B_fkey";

-- AlterTable
ALTER TABLE "IssueHistory" DROP COLUMN "artistIds";

-- DropTable
DROP TABLE "_ArtistToTrack";

-- CreateTable
CREATE TABLE "IssueHistoryArtist" (
    "issueHistoryId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "IssueHistoryArtist_pkey" PRIMARY KEY ("issueHistoryId","artistId")
);

-- CreateTable
CREATE TABLE "IssueObject" (
    "issueId" INTEGER NOT NULL,
    "objectId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "IssueObject_pkey" PRIMARY KEY ("issueId","objectId")
);

-- CreateTable
CREATE TABLE "IssueHistoryObject" (
    "issueHistoryId" INTEGER NOT NULL,
    "objectId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "IssueHistoryObject_pkey" PRIMARY KEY ("issueHistoryId","objectId")
);

-- CreateTable
CREATE TABLE "Object" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Object_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectHistory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "objectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operation" "GenreOperation" NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "ObjectHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectTrack" (
    "objectId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ObjectTrack_pkey" PRIMARY KEY ("objectId","trackId")
);

-- CreateTable
CREATE TABLE "ObjectHistoryTrack" (
    "objectHistoryId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ObjectHistoryTrack_pkey" PRIMARY KEY ("objectHistoryId","trackId")
);

-- CreateTable
CREATE TABLE "TrackHistory" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operation" "GenreOperation" NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "TrackHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackArtist" (
    "trackId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TrackArtist_pkey" PRIMARY KEY ("trackId","artistId")
);

-- CreateTable
CREATE TABLE "TrackHistoryArtist" (
    "trackHistoryId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TrackHistoryArtist_pkey" PRIMARY KEY ("trackHistoryId","artistId")
);

-- AddForeignKey
ALTER TABLE "IssueHistoryArtist" ADD CONSTRAINT "IssueHistoryArtist_issueHistoryId_fkey" FOREIGN KEY ("issueHistoryId") REFERENCES "IssueHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueObject" ADD CONSTRAINT "IssueObject_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueObject" ADD CONSTRAINT "IssueObject_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "Object"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueHistoryObject" ADD CONSTRAINT "IssueHistoryObject_issueHistoryId_fkey" FOREIGN KEY ("issueHistoryId") REFERENCES "IssueHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectHistory" ADD CONSTRAINT "ObjectHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectTrack" ADD CONSTRAINT "ObjectTrack_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "Object"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectTrack" ADD CONSTRAINT "ObjectTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectHistoryTrack" ADD CONSTRAINT "ObjectHistoryTrack_objectHistoryId_fkey" FOREIGN KEY ("objectHistoryId") REFERENCES "ObjectHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackHistory" ADD CONSTRAINT "TrackHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackHistoryArtist" ADD CONSTRAINT "TrackHistoryArtist_trackHistoryId_fkey" FOREIGN KEY ("trackHistoryId") REFERENCES "TrackHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
