-- DropForeignKey
ALTER TABLE "GenreRelevanceVote" DROP CONSTRAINT "GenreRelevanceVote_accountId_fkey";

-- DropForeignKey
ALTER TABLE "GenreRelevanceVote" DROP CONSTRAINT "GenreRelevanceVote_genreId_fkey";

-- AddForeignKey
ALTER TABLE "GenreRelevanceVote" ADD CONSTRAINT "GenreRelevanceVote_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenreRelevanceVote" ADD CONSTRAINT "GenreRelevanceVote_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
