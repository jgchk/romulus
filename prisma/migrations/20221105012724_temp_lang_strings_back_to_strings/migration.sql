/*
  Warnings:

  - You are about to drop the `_GenreToLangString` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LangStringToSong` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Genre` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_GenreToLangString" DROP CONSTRAINT "_GenreToLangString_A_fkey";

-- DropForeignKey
ALTER TABLE "_GenreToLangString" DROP CONSTRAINT "_GenreToLangString_B_fkey";

-- DropForeignKey
ALTER TABLE "_LangStringToSong" DROP CONSTRAINT "_LangStringToSong_A_fkey";

-- DropForeignKey
ALTER TABLE "_LangStringToSong" DROP CONSTRAINT "_LangStringToSong_B_fkey";

-- AlterTable
ALTER TABLE "Genre" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "title" TEXT NOT NULL;

-- DropTable
DROP TABLE "_GenreToLangString";

-- DropTable
DROP TABLE "_LangStringToSong";
