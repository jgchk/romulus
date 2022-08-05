-- CreateTable
CREATE TABLE "Artist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Release" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "releaseDate" TEXT,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseRating" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "releaseId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "ReleaseRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackRating" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "TrackRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseReview" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "releaseId" INTEGER NOT NULL,
    "title" TEXT,
    "text" TEXT NOT NULL,

    CONSTRAINT "ReleaseReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackReview" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "title" TEXT,
    "text" TEXT NOT NULL,

    CONSTRAINT "TrackReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "x" INTEGER,
    "y" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArtistToRelease" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ArtistToTrack" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccountToGenre" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GenreToLocation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_hierarchy" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Location_city_region_country_key" ON "Location"("city", "region", "country");

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistToRelease_AB_unique" ON "_ArtistToRelease"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistToRelease_B_index" ON "_ArtistToRelease"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistToTrack_AB_unique" ON "_ArtistToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistToTrack_B_index" ON "_ArtistToTrack"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccountToGenre_AB_unique" ON "_AccountToGenre"("A", "B");

-- CreateIndex
CREATE INDEX "_AccountToGenre_B_index" ON "_AccountToGenre"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GenreToLocation_AB_unique" ON "_GenreToLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_GenreToLocation_B_index" ON "_GenreToLocation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_hierarchy_AB_unique" ON "_hierarchy"("A", "B");

-- CreateIndex
CREATE INDEX "_hierarchy_B_index" ON "_hierarchy"("B");

-- AddForeignKey
ALTER TABLE "ReleaseRating" ADD CONSTRAINT "ReleaseRating_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseRating" ADD CONSTRAINT "ReleaseRating_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackRating" ADD CONSTRAINT "TrackRating_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackRating" ADD CONSTRAINT "TrackRating_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseReview" ADD CONSTRAINT "ReleaseReview_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseReview" ADD CONSTRAINT "ReleaseReview_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackReview" ADD CONSTRAINT "TrackReview_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackReview" ADD CONSTRAINT "TrackReview_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToRelease" ADD CONSTRAINT "_ArtistToRelease_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToRelease" ADD CONSTRAINT "_ArtistToRelease_B_fkey" FOREIGN KEY ("B") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToTrack" ADD CONSTRAINT "_ArtistToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToTrack" ADD CONSTRAINT "_ArtistToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToGenre" ADD CONSTRAINT "_AccountToGenre_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToGenre" ADD CONSTRAINT "_AccountToGenre_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToLocation" ADD CONSTRAINT "_GenreToLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToLocation" ADD CONSTRAINT "_GenreToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_hierarchy" ADD CONSTRAINT "_hierarchy_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_hierarchy" ADD CONSTRAINT "_hierarchy_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;
