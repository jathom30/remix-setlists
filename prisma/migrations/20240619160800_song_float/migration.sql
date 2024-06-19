/*
  Warnings:

  - You are about to alter the column `length` on the `Song` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Song" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "length" REAL NOT NULL,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "author" TEXT,
    "note" TEXT,
    "keyLetter" TEXT,
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "tempo" INTEGER,
    "position" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bandId" TEXT,
    CONSTRAINT "Song_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Song" ("author", "bandId", "createdAt", "id", "isCover", "isMinor", "keyLetter", "length", "name", "note", "position", "rank", "tempo", "updatedAt") SELECT "author", "bandId", "createdAt", "id", "isCover", "isMinor", "keyLetter", "length", "name", "note", "position", "rank", "tempo", "updatedAt" FROM "Song";
DROP TABLE "Song";
ALTER TABLE "new_Song" RENAME TO "Song";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
