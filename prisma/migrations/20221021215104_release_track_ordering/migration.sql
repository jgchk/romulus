/*
  Warnings:

  - You are about to drop the `_ReleaseToSong` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ReleaseToSong" DROP CONSTRAINT "_ReleaseToSong_A_fkey";

-- DropForeignKey
ALTER TABLE "_ReleaseToSong" DROP CONSTRAINT "_ReleaseToSong_B_fkey";

-- DropTable
DROP TABLE "_ReleaseToSong";

-- CreateTable
CREATE TABLE "ReleaseTrack" (
    "id" SERIAL NOT NULL,
    "releaseId" INTEGER NOT NULL,
    "songId" INTEGER NOT NULL,
    "orderNum" INTEGER NOT NULL,
    "displayNum" TEXT NOT NULL,

    CONSTRAINT "ReleaseTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseTrack_releaseId_songId_key" ON "ReleaseTrack"("releaseId", "songId");

-- AddForeignKey
ALTER TABLE "ReleaseTrack" ADD CONSTRAINT "ReleaseTrack_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseTrack" ADD CONSTRAINT "ReleaseTrack_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
