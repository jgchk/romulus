/*
  Warnings:

  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GenreHistoryToLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GenreToLocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GenreHistoryToLocation" DROP CONSTRAINT "_GenreHistoryToLocation_A_fkey";

-- DropForeignKey
ALTER TABLE "_GenreHistoryToLocation" DROP CONSTRAINT "_GenreHistoryToLocation_B_fkey";

-- DropForeignKey
ALTER TABLE "_GenreToLocation" DROP CONSTRAINT "_GenreToLocation_A_fkey";

-- DropForeignKey
ALTER TABLE "_GenreToLocation" DROP CONSTRAINT "_GenreToLocation_B_fkey";

-- DropTable
DROP TABLE "Location";

-- DropTable
DROP TABLE "_GenreHistoryToLocation";

-- DropTable
DROP TABLE "_GenreToLocation";
