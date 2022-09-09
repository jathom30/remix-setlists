/*
  Warnings:

  - Added the required column `bandId` to the `Feel` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Feel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "songId" TEXT,
    "bandId" TEXT NOT NULL,
    CONSTRAINT "Feel_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Feel_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Feel" ("color", "createdAt", "id", "label", "songId", "updatedAt") SELECT "color", "createdAt", "id", "label", "songId", "updatedAt" FROM "Feel";
DROP TABLE "Feel";
ALTER TABLE "new_Feel" RENAME TO "Feel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
