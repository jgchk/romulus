/*
  Warnings:

  - Added the required column `name` to the `Sense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sense" ADD COLUMN     "name" TEXT NOT NULL;
