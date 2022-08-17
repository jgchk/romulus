-- DropForeignKey
ALTER TABLE "GenreHistoryAka" DROP CONSTRAINT "GenreHistoryAka_genreId_fkey";

-- AddForeignKey
ALTER TABLE "GenreHistoryAka" ADD CONSTRAINT "GenreHistoryAka_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "GenreHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
