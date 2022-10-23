/*
  Warnings:

  - You are about to drop the `_SetToSong` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `updatedBy` on the `Setlist` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "_SetToSong_B_index";

-- DropIndex
DROP INDEX "_SetToSong_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_SetToSong";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SongsInSets" (
    "songId" TEXT NOT NULL,
    "positionInSet" INTEGER NOT NULL,
    "setId" TEXT NOT NULL,

    PRIMARY KEY ("songId", "setId"),
    CONSTRAINT "SongsInSets_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SongsInSets_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UsersInBands" (
    "userId" TEXT NOT NULL,
    "bandName" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    PRIMARY KEY ("userId", "bandId"),
    CONSTRAINT "UsersInBands_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsersInBands_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UsersInBands" ("bandId", "bandName", "role", "userId") SELECT "bandId", "bandName", "role", "userId" FROM "UsersInBands";
DROP TABLE "UsersInBands";
ALTER TABLE "new_UsersInBands" RENAME TO "UsersInBands";
CREATE TABLE "new_Feel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "songId" TEXT,
    "bandId" TEXT NOT NULL,
    CONSTRAINT "Feel_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Feel_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Feel" ("bandId", "color", "createdAt", "id", "label", "songId", "updatedAt") SELECT "bandId", "color", "createdAt", "id", "label", "songId", "updatedAt" FROM "Feel";
DROP TABLE "Feel";
ALTER TABLE "new_Feel" RENAME TO "Feel";
CREATE TABLE "new_Setlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bandId" TEXT NOT NULL,
    CONSTRAINT "Setlist_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Setlist" ("bandId", "createdAt", "id", "name", "updatedAt") SELECT "bandId", "createdAt", "id", "name", "updatedAt" FROM "Setlist";
DROP TABLE "Setlist";
ALTER TABLE "new_Setlist" RENAME TO "Setlist";
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
    CONSTRAINT "Song_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Song" ("bandId", "createdAt", "id", "isCover", "isMinor", "keyLetter", "length", "name", "note", "position", "rank", "tempo", "updatedAt") SELECT "bandId", "createdAt", "id", "isCover", "isMinor", "keyLetter", "length", "name", "note", "position", "rank", "tempo", "updatedAt" FROM "Song";
DROP TABLE "Song";
ALTER TABLE "new_Song" RENAME TO "Song";
CREATE TABLE "new_BandIcon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bandId" TEXT NOT NULL,
    CONSTRAINT "BandIcon_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BandIcon" ("backgroundColor", "bandId", "createdAt", "id", "path", "textColor", "updatedAt") SELECT "backgroundColor", "bandId", "createdAt", "id", "path", "textColor", "updatedAt" FROM "BandIcon";
DROP TABLE "BandIcon";
ALTER TABLE "new_BandIcon" RENAME TO "BandIcon";
CREATE UNIQUE INDEX "BandIcon_bandId_key" ON "BandIcon"("bandId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
