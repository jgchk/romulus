-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('EDIT_GENRES');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "permissions" "Permission"[];
