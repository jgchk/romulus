/*
  Warnings:

  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Release` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReleaseIssue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReleaseTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Song` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SongIssue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_typeId_fkey";

-- DropForeignKey
ALTER TABLE "Release" DROP CONSTRAINT "Release_typeId_fkey";

-- DropForeignKey
ALTER TABLE "ReleaseIssue" DROP CONSTRAINT "ReleaseIssue_releaseId_fkey";

-- DropForeignKey
ALTER TABLE "ReleaseTrack" DROP CONSTRAINT "ReleaseTrack_releaseId_fkey";

-- DropForeignKey
ALTER TABLE "ReleaseTrack" DROP CONSTRAINT "ReleaseTrack_songId_fkey";

-- DropForeignKey
ALTER TABLE "SongIssue" DROP CONSTRAINT "SongIssue_songId_fkey";

-- DropTable
DROP TABLE "Item";

-- DropTable
DROP TABLE "ItemType";

-- DropTable
DROP TABLE "Release";

-- DropTable
DROP TABLE "ReleaseIssue";

-- DropTable
DROP TABLE "ReleaseTrack";

-- DropTable
DROP TABLE "Song";

-- DropTable
DROP TABLE "SongIssue";
