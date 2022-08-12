/*
  Warnings:

  - You are about to drop the `_AccountToGenre` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AccountToGenre" DROP CONSTRAINT "_AccountToGenre_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccountToGenre" DROP CONSTRAINT "_AccountToGenre_B_fkey";

-- DropTable
DROP TABLE "_AccountToGenre";
