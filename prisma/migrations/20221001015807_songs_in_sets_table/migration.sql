/*
  Warnings:

  - You are about to drop the `_SetToSong` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_SetToSong";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SongsInSets" (
    "songId" TEXT NOT NULL,
    "setId" TEXT NOT NULL,

    PRIMARY KEY ("songId", "setId"),
    CONSTRAINT "SongsInSets_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SongsInSets_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
