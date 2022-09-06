/*
  Warnings:

  - You are about to drop the `MembersInBands` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MembersInBands";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_BandToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BandToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Band" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BandToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_BandToUser_AB_unique" ON "_BandToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_BandToUser_B_index" ON "_BandToUser"("B");
