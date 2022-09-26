/*
  Warnings:

  - You are about to drop the column `setId` on the `Song` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_SetToSong" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SetToSong_A_fkey" FOREIGN KEY ("A") REFERENCES "Set" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SetToSong_B_fkey" FOREIGN KEY ("B") REFERENCES "Song" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Song" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "keyLetter" TEXT,
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "tempo" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bandId" TEXT,
    CONSTRAINT "Song_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Song" ("bandId", "createdAt", "id", "isCover", "isMinor", "keyLetter", "length", "name", "note", "position", "rank", "tempo", "updatedAt") SELECT "bandId", "createdAt", "id", "isCover", "isMinor", "keyLetter", "length", "name", "note", "position", "rank", "tempo", "updatedAt" FROM "Song";
DROP TABLE "Song";
ALTER TABLE "new_Song" RENAME TO "Song";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_SetToSong_AB_unique" ON "_SetToSong"("A", "B");

-- CreateIndex
CREATE INDEX "_SetToSong_B_index" ON "_SetToSong"("B");
