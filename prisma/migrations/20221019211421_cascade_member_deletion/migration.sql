-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_artistId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_personId_fkey";

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
