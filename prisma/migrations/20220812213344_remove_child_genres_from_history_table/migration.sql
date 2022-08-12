/*
  Warnings:

  - You are about to drop the column `childGenreIds` on the `GenreHistory` table. All the data in the column will be lost.
  - You are about to drop the column `influencesGenreIds` on the `GenreHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GenreHistory" DROP COLUMN "childGenreIds",
DROP COLUMN "influencesGenreIds";
