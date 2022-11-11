/*
  Warnings:

  - Added the required column `schemaObjectId` to the `ReleaseType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReleaseType" ADD COLUMN     "schemaObjectId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ReleaseType" ADD CONSTRAINT "ReleaseType_schemaObjectId_fkey" FOREIGN KEY ("schemaObjectId") REFERENCES "SchemaObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
