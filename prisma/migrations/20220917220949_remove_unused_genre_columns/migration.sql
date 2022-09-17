/*
  Warnings:

  - You are about to drop the column `akas` on the `Genre` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Genre` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Genre` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `Genre` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Genre` table. All the data in the column will be lost.
  - You are about to drop the column `akas` on the `GenreHistory` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `GenreHistory` table. All the data in the column will be lost.
  - You are about to drop the column `relevance` on the `GenreHistory` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `GenreHistory` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `GenreHistory` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `GenreHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Genre" DROP COLUMN "akas",
DROP COLUMN "endDate",
DROP COLUMN "startDate",
DROP COLUMN "x",
DROP COLUMN "y";

-- AlterTable
ALTER TABLE "GenreHistory" DROP COLUMN "akas",
DROP COLUMN "endDate",
DROP COLUMN "relevance",
DROP COLUMN "startDate",
DROP COLUMN "x",
DROP COLUMN "y";
