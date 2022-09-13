-- CreateTable
CREATE TABLE "GenreRelevanceVote" (
    "genreId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "relevance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenreRelevanceVote_pkey" PRIMARY KEY ("genreId","accountId")
);

-- AddForeignKey
ALTER TABLE "GenreRelevanceVote" ADD CONSTRAINT "GenreRelevanceVote_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenreRelevanceVote" ADD CONSTRAINT "GenreRelevanceVote_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
