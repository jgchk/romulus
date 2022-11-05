/*
  Warnings:

  - You are about to drop the column `name` on the `Genre` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Genre" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Song" DROP COLUMN "title";

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageFamily" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LanguageFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "constructed" BOOLEAN NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageInfluence" (
    "parentId" INTEGER NOT NULL,
    "childId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "LanguageInfluence_pkey" PRIMARY KEY ("parentId","childId")
);

-- CreateTable
CREATE TABLE "Sprachbund" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Sprachbund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SprachbundInfluence" (
    "parentId" INTEGER NOT NULL,
    "childId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "SprachbundInfluence_pkey" PRIMARY KEY ("parentId","childId")
);

-- CreateTable
CREATE TABLE "LangString" (
    "id" SERIAL NOT NULL,
    "languageId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "LangString_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaObject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SchemaObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaField" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "array" BOOLEAN NOT NULL,
    "nullable" BOOLEAN NOT NULL,

    CONSTRAINT "SchemaField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectInstance" (
    "id" SERIAL NOT NULL,
    "schemaObjectId" INTEGER NOT NULL,

    CONSTRAINT "ObjectInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldInstance" (
    "id" SERIAL NOT NULL,
    "schemaFieldId" INTEGER NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "FieldInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LocationToSprachbund" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_LanguageToLanguageFamily" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_name" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_LangStringToSong" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GenreToLangString" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_SchemaFieldToSchemaObject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LocationToSprachbund_AB_unique" ON "_LocationToSprachbund"("A", "B");

-- CreateIndex
CREATE INDEX "_LocationToSprachbund_B_index" ON "_LocationToSprachbund"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LanguageToLanguageFamily_AB_unique" ON "_LanguageToLanguageFamily"("A", "B");

-- CreateIndex
CREATE INDEX "_LanguageToLanguageFamily_B_index" ON "_LanguageToLanguageFamily"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_name_AB_unique" ON "_name"("A", "B");

-- CreateIndex
CREATE INDEX "_name_B_index" ON "_name"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LangStringToSong_AB_unique" ON "_LangStringToSong"("A", "B");

-- CreateIndex
CREATE INDEX "_LangStringToSong_B_index" ON "_LangStringToSong"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GenreToLangString_AB_unique" ON "_GenreToLangString"("A", "B");

-- CreateIndex
CREATE INDEX "_GenreToLangString_B_index" ON "_GenreToLangString"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SchemaFieldToSchemaObject_AB_unique" ON "_SchemaFieldToSchemaObject"("A", "B");

-- CreateIndex
CREATE INDEX "_SchemaFieldToSchemaObject_B_index" ON "_SchemaFieldToSchemaObject"("B");

-- AddForeignKey
ALTER TABLE "LanguageInfluence" ADD CONSTRAINT "LanguageInfluence_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageInfluence" ADD CONSTRAINT "LanguageInfluence_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprachbundInfluence" ADD CONSTRAINT "SprachbundInfluence_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprachbundInfluence" ADD CONSTRAINT "SprachbundInfluence_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Sprachbund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LangString" ADD CONSTRAINT "LangString_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectInstance" ADD CONSTRAINT "ObjectInstance_schemaObjectId_fkey" FOREIGN KEY ("schemaObjectId") REFERENCES "SchemaObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldInstance" ADD CONSTRAINT "FieldInstance_schemaFieldId_fkey" FOREIGN KEY ("schemaFieldId") REFERENCES "SchemaField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToSprachbund" ADD CONSTRAINT "_LocationToSprachbund_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToSprachbund" ADD CONSTRAINT "_LocationToSprachbund_B_fkey" FOREIGN KEY ("B") REFERENCES "Sprachbund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LanguageToLanguageFamily" ADD CONSTRAINT "_LanguageToLanguageFamily_A_fkey" FOREIGN KEY ("A") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LanguageToLanguageFamily" ADD CONSTRAINT "_LanguageToLanguageFamily_B_fkey" FOREIGN KEY ("B") REFERENCES "LanguageFamily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_name" ADD CONSTRAINT "_name_A_fkey" FOREIGN KEY ("A") REFERENCES "LangString"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_name" ADD CONSTRAINT "_name_B_fkey" FOREIGN KEY ("B") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LangStringToSong" ADD CONSTRAINT "_LangStringToSong_A_fkey" FOREIGN KEY ("A") REFERENCES "LangString"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LangStringToSong" ADD CONSTRAINT "_LangStringToSong_B_fkey" FOREIGN KEY ("B") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToLangString" ADD CONSTRAINT "_GenreToLangString_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToLangString" ADD CONSTRAINT "_GenreToLangString_B_fkey" FOREIGN KEY ("B") REFERENCES "LangString"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchemaFieldToSchemaObject" ADD CONSTRAINT "_SchemaFieldToSchemaObject_A_fkey" FOREIGN KEY ("A") REFERENCES "SchemaField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchemaFieldToSchemaObject" ADD CONSTRAINT "_SchemaFieldToSchemaObject_B_fkey" FOREIGN KEY ("B") REFERENCES "SchemaObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
