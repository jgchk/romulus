-- CreateEnum
CREATE TYPE "GenreOperation" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "GenreHistory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GenreType" NOT NULL DEFAULT 'STYLE',
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "notes" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "akas" TEXT[],
    "parentGenreIds" INTEGER[],
    "childGenreIds" INTEGER[],
    "influencedByGenreIds" INTEGER[],
    "influencesGenreIds" INTEGER[],
    "x" INTEGER,
    "y" INTEGER,
    "treeGenreId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operation" "GenreOperation" NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "GenreHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GenreHistoryToLocation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GenreHistoryToLocation_AB_unique" ON "_GenreHistoryToLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_GenreHistoryToLocation_B_index" ON "_GenreHistoryToLocation"("B");

-- AddForeignKey
ALTER TABLE "GenreHistory" ADD CONSTRAINT "GenreHistory_treeGenreId_fkey" FOREIGN KEY ("treeGenreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenreHistory" ADD CONSTRAINT "GenreHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreHistoryToLocation" ADD CONSTRAINT "_GenreHistoryToLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "GenreHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreHistoryToLocation" ADD CONSTRAINT "_GenreHistoryToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
