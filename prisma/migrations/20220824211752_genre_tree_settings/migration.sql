-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "showRelevanceTags" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showTypeTags" BOOLEAN NOT NULL DEFAULT true;
