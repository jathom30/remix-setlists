/*
  Warnings:

  - You are about to alter the column `tempo` on the `Song` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- AlterTable
ALTER TABLE "Feel" ADD COLUMN "color" TEXT;

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
    "position" TEXT,
    "rank" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "setId" TEXT,
    "bandId" TEXT,
    CONSTRAINT "Song_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Song_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Song" ("bandId", "createdAt", "id", "isCover", "isMinor", "keyLetter", "length", "name", "note", "position", "rank", "setId", "tempo", "updatedAt") SELECT "bandId", "createdAt", "id", coalesce("isCover", false) AS "isCover", coalesce("isMinor", false) AS "isMinor", "keyLetter", "length", "name", "note", "position", "rank", "setId", "tempo", "updatedAt" FROM "Song";
DROP TABLE "Song";
ALTER TABLE "new_Song" RENAME TO "Song";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
