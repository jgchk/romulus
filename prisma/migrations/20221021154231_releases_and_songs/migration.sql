/*
  Warnings:

  - You are about to drop the `Concept` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConceptBundle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConceptBundleIssue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConceptIssue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConceptType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemBundle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Unit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnitIssue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ConceptToConceptBundle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ConceptToUnit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ItemToItemBundle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Concept" DROP CONSTRAINT "Concept_typeId_fkey";

-- DropForeignKey
ALTER TABLE "ConceptBundleIssue" DROP CONSTRAINT "ConceptBundleIssue_conceptBundleId_fkey";

-- DropForeignKey
ALTER TABLE "ConceptIssue" DROP CONSTRAINT "ConceptIssue_conceptId_fkey";

-- DropForeignKey
ALTER TABLE "UnitIssue" DROP CONSTRAINT "UnitIssue_unitId_fkey";

-- DropForeignKey
ALTER TABLE "_ConceptToConceptBundle" DROP CONSTRAINT "_ConceptToConceptBundle_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConceptToConceptBundle" DROP CONSTRAINT "_ConceptToConceptBundle_B_fkey";

-- DropForeignKey
ALTER TABLE "_ConceptToUnit" DROP CONSTRAINT "_ConceptToUnit_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConceptToUnit" DROP CONSTRAINT "_ConceptToUnit_B_fkey";

-- DropForeignKey
ALTER TABLE "_ItemToItemBundle" DROP CONSTRAINT "_ItemToItemBundle_A_fkey";

-- DropForeignKey
ALTER TABLE "_ItemToItemBundle" DROP CONSTRAINT "_ItemToItemBundle_B_fkey";

-- DropTable
DROP TABLE "Concept";

-- DropTable
DROP TABLE "ConceptBundle";

-- DropTable
DROP TABLE "ConceptBundleIssue";

-- DropTable
DROP TABLE "ConceptIssue";

-- DropTable
DROP TABLE "ConceptType";

-- DropTable
DROP TABLE "ItemBundle";

-- DropTable
DROP TABLE "Unit";

-- DropTable
DROP TABLE "UnitIssue";

-- DropTable
DROP TABLE "_ConceptToConceptBundle";

-- DropTable
DROP TABLE "_ConceptToUnit";

-- DropTable
DROP TABLE "_ItemToItemBundle";

-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongIssue" (
    "id" SERIAL NOT NULL,
    "songId" INTEGER NOT NULL,

    CONSTRAINT "SongIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ReleaseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Release" (
    "id" SERIAL NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseIssue" (
    "id" SERIAL NOT NULL,
    "releaseId" INTEGER NOT NULL,

    CONSTRAINT "ReleaseIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReleaseToSong" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ReleaseToSong_AB_unique" ON "_ReleaseToSong"("A", "B");

-- CreateIndex
CREATE INDEX "_ReleaseToSong_B_index" ON "_ReleaseToSong"("B");

-- AddForeignKey
ALTER TABLE "SongIssue" ADD CONSTRAINT "SongIssue_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ReleaseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseIssue" ADD CONSTRAINT "ReleaseIssue_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReleaseToSong" ADD CONSTRAINT "_ReleaseToSong_A_fkey" FOREIGN KEY ("A") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReleaseToSong" ADD CONSTRAINT "_ReleaseToSong_B_fkey" FOREIGN KEY ("B") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
