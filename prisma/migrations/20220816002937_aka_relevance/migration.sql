-- CreateTable
CREATE TABLE "GenreAka" (
    "genreId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "relevance" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "GenreAka_pkey" PRIMARY KEY ("genreId","name")
);

-- CreateTable
CREATE TABLE "GenreHistoryAka" (
    "genreId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "relevance" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "GenreHistoryAka_pkey" PRIMARY KEY ("genreId","name")
);

-- AddForeignKey
ALTER TABLE "GenreAka" ADD CONSTRAINT "GenreAka_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenreHistoryAka" ADD CONSTRAINT "GenreHistoryAka_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "GenreHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
