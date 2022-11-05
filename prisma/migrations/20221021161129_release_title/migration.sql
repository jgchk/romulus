/*
  Warnings:

  - Added the required column `title` to the `Release` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Release" ADD COLUMN     "title" TEXT NOT NULL;
