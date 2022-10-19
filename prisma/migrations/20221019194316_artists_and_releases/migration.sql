/*
  Warnings:

  - You are about to drop the column `akas` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `spotifyIds` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the `ArtistHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Issue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IssueArtist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IssueHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IssueHistoryArtist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IssueHistoryObject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IssueObject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Object` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ObjectHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ObjectHistoryTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ObjectTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Release` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReleaseHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Track` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrackArtist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrackHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrackHistoryArtist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ArtistHistory" DROP CONSTRAINT "ArtistHistory_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_releaseId_fkey";

-- DropForeignKey
ALTER TABLE "IssueArtist" DROP CONSTRAINT "IssueArtist_artistId_fkey";

-- DropForeignKey
ALTER TABLE "IssueArtist" DROP CONSTRAINT "IssueArtist_issueId_fkey";

-- DropForeignKey
ALTER TABLE "IssueHistory" DROP CONSTRAINT "IssueHistory_accountId_fkey";

-- DropForeignKey
ALTER TABLE "IssueHistoryArtist" DROP CONSTRAINT "IssueHistoryArtist_issueHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "IssueHistoryObject" DROP CONSTRAINT "IssueHistoryObject_issueHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "IssueObject" DROP CONSTRAINT "IssueObject_issueId_fkey";

-- DropForeignKey
ALTER TABLE "IssueObject" DROP CONSTRAINT "IssueObject_objectId_fkey";

-- DropForeignKey
ALTER TABLE "ObjectHistory" DROP CONSTRAINT "ObjectHistory_accountId_fkey";

-- DropForeignKey
ALTER TABLE "ObjectHistoryTrack" DROP CONSTRAINT "ObjectHistoryTrack_objectHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "ObjectTrack" DROP CONSTRAINT "ObjectTrack_objectId_fkey";

-- DropForeignKey
ALTER TABLE "ObjectTrack" DROP CONSTRAINT "ObjectTrack_trackId_fkey";

-- DropForeignKey
ALTER TABLE "ReleaseHistory" DROP CONSTRAINT "ReleaseHistory_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_issueId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_releaseId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_trackId_fkey";

-- DropForeignKey
ALTER TABLE "TrackArtist" DROP CONSTRAINT "TrackArtist_artistId_fkey";

-- DropForeignKey
ALTER TABLE "TrackArtist" DROP CONSTRAINT "TrackArtist_trackId_fkey";

-- DropForeignKey
ALTER TABLE "TrackHistory" DROP CONSTRAINT "TrackHistory_accountId_fkey";

-- DropForeignKey
ALTER TABLE "TrackHistoryArtist" DROP CONSTRAINT "TrackHistoryArtist_trackHistoryId_fkey";

-- AlterTable
ALTER TABLE "Artist" DROP COLUMN "akas",
DROP COLUMN "createdAt",
DROP COLUMN "spotifyIds",
DROP COLUMN "updatedAt",
ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "ArtistHistory";

-- DropTable
DROP TABLE "Issue";

-- DropTable
DROP TABLE "IssueArtist";

-- DropTable
DROP TABLE "IssueHistory";

-- DropTable
DROP TABLE "IssueHistoryArtist";

-- DropTable
DROP TABLE "IssueHistoryObject";

-- DropTable
DROP TABLE "IssueObject";

-- DropTable
DROP TABLE "Object";

-- DropTable
DROP TABLE "ObjectHistory";

-- DropTable
DROP TABLE "ObjectHistoryTrack";

-- DropTable
DROP TABLE "ObjectTrack";

-- DropTable
DROP TABLE "Release";

-- DropTable
DROP TABLE "ReleaseHistory";

-- DropTable
DROP TABLE "Review";

-- DropTable
DROP TABLE "Track";

-- DropTable
DROP TABLE "TrackArtist";

-- DropTable
DROP TABLE "TrackHistory";

-- DropTable
DROP TABLE "TrackHistoryArtist";

-- CreateTable
CREATE TABLE "Unit" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitIssue" (
    "id" SERIAL NOT NULL,
    "unitId" INTEGER NOT NULL,

    CONSTRAINT "UnitIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ConceptType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concept" (
    "id" SERIAL NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptIssue" (
    "id" SERIAL NOT NULL,
    "conceptId" INTEGER NOT NULL,

    CONSTRAINT "ConceptIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptBundle" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "ConceptBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptBundleIssue" (
    "id" SERIAL NOT NULL,
    "conceptBundleId" INTEGER NOT NULL,

    CONSTRAINT "ConceptBundleIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ItemType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemBundle" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "ItemBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,
    "name" TEXT,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConceptToUnit" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ConceptToConceptBundle" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ItemToItemBundle" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ConceptToUnit_AB_unique" ON "_ConceptToUnit"("A", "B");

-- CreateIndex
CREATE INDEX "_ConceptToUnit_B_index" ON "_ConceptToUnit"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ConceptToConceptBundle_AB_unique" ON "_ConceptToConceptBundle"("A", "B");

-- CreateIndex
CREATE INDEX "_ConceptToConceptBundle_B_index" ON "_ConceptToConceptBundle"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ItemToItemBundle_AB_unique" ON "_ItemToItemBundle"("A", "B");

-- CreateIndex
CREATE INDEX "_ItemToItemBundle_B_index" ON "_ItemToItemBundle"("B");

-- AddForeignKey
ALTER TABLE "UnitIssue" ADD CONSTRAINT "UnitIssue_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concept" ADD CONSTRAINT "Concept_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ConceptType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptIssue" ADD CONSTRAINT "ConceptIssue_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptBundleIssue" ADD CONSTRAINT "ConceptBundleIssue_conceptBundleId_fkey" FOREIGN KEY ("conceptBundleId") REFERENCES "ConceptBundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ItemType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConceptToUnit" ADD CONSTRAINT "_ConceptToUnit_A_fkey" FOREIGN KEY ("A") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConceptToUnit" ADD CONSTRAINT "_ConceptToUnit_B_fkey" FOREIGN KEY ("B") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConceptToConceptBundle" ADD CONSTRAINT "_ConceptToConceptBundle_A_fkey" FOREIGN KEY ("A") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConceptToConceptBundle" ADD CONSTRAINT "_ConceptToConceptBundle_B_fkey" FOREIGN KEY ("B") REFERENCES "ConceptBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToItemBundle" ADD CONSTRAINT "_ItemToItemBundle_A_fkey" FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToItemBundle" ADD CONSTRAINT "_ItemToItemBundle_B_fkey" FOREIGN KEY ("B") REFERENCES "ItemBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
