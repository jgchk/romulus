-- DropForeignKey
ALTER TABLE "GenreAka" DROP CONSTRAINT "GenreAka_genreId_fkey";

-- DropForeignKey
ALTER TABLE "GenreHistory" DROP CONSTRAINT "GenreHistory_accountId_fkey";

-- AlterTable
ALTER TABLE "GenreHistory" ALTER COLUMN "accountId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GenreAka" ADD CONSTRAINT "GenreAka_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenreHistory" ADD CONSTRAINT "GenreHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
