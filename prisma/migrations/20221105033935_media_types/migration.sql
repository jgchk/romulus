-- DropForeignKey
ALTER TABLE "_hierarchy" DROP CONSTRAINT "_hierarchy_A_fkey";

-- DropForeignKey
ALTER TABLE "_hierarchy" DROP CONSTRAINT "_hierarchy_B_fkey";

-- AlterTable
ALTER TABLE "GenreHistory" ADD COLUMN     "mediaTypeIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CreateTable
CREATE TABLE "MediaType" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "MediaType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sense" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Sense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GenreToMediaType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_core" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_aux" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_MediaTypeToReleaseType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GenreToMediaType_AB_unique" ON "_GenreToMediaType"("A", "B");

-- CreateIndex
CREATE INDEX "_GenreToMediaType_B_index" ON "_GenreToMediaType"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_core_AB_unique" ON "_core"("A", "B");

-- CreateIndex
CREATE INDEX "_core_B_index" ON "_core"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_aux_AB_unique" ON "_aux"("A", "B");

-- CreateIndex
CREATE INDEX "_aux_B_index" ON "_aux"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MediaTypeToReleaseType_AB_unique" ON "_MediaTypeToReleaseType"("A", "B");

-- CreateIndex
CREATE INDEX "_MediaTypeToReleaseType_B_index" ON "_MediaTypeToReleaseType"("B");

-- AddForeignKey
ALTER TABLE "_GenreToMediaType" ADD CONSTRAINT "_GenreToMediaType_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToMediaType" ADD CONSTRAINT "_GenreToMediaType_B_fkey" FOREIGN KEY ("B") REFERENCES "MediaType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_hierarchy" ADD CONSTRAINT "_hierarchy_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_hierarchy" ADD CONSTRAINT "_hierarchy_B_fkey" FOREIGN KEY ("B") REFERENCES "MediaType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_core" ADD CONSTRAINT "_core_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_core" ADD CONSTRAINT "_core_B_fkey" FOREIGN KEY ("B") REFERENCES "Sense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_aux" ADD CONSTRAINT "_aux_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_aux" ADD CONSTRAINT "_aux_B_fkey" FOREIGN KEY ("B") REFERENCES "Sense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaTypeToReleaseType" ADD CONSTRAINT "_MediaTypeToReleaseType_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaTypeToReleaseType" ADD CONSTRAINT "_MediaTypeToReleaseType_B_fkey" FOREIGN KEY ("B") REFERENCES "ReleaseType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
