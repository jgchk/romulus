-- CreateTable
CREATE TABLE "_influence" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_influence_AB_unique" ON "_influence"("A", "B");

-- CreateIndex
CREATE INDEX "_influence_B_index" ON "_influence"("B");

-- AddForeignKey
ALTER TABLE "_influence" ADD CONSTRAINT "_influence_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_influence" ADD CONSTRAINT "_influence_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;
