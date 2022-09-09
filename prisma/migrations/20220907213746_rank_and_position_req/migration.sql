/*
  Warnings:

  - Made the column `position` on table `Song` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rank` on table `Song` required. This step will fail if there are existing NULL values in that column.

*/
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
    "setId" TEXT,
    "bandId" TEXT,
    CONSTRAINT "Song_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Song_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Song" ("bandId", "createdAt", "id", "isCover", "isMinor", "keyLetter", "length", "name", "note", "position", "rank", "setId", "tempo", "updatedAt") SELECT "bandId", "createdAt", "id", "isCover", "isMinor", "keyLetter", "length", "name", "note", "position", "rank", "setId", "tempo", "updatedAt" FROM "Song";
DROP TABLE "Song";
ALTER TABLE "new_Song" RENAME TO "Song";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
