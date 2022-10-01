/*
  Warnings:

  - You are about to drop the `SongsInSets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `length` on the `Set` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SongsInSets";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_SetToSong" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SetToSong_A_fkey" FOREIGN KEY ("A") REFERENCES "Set" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SetToSong_B_fkey" FOREIGN KEY ("B") REFERENCES "Song" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Set" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "setlistId" TEXT NOT NULL,
    CONSTRAINT "Set_setlistId_fkey" FOREIGN KEY ("setlistId") REFERENCES "Setlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Set" ("createdAt", "id", "setlistId", "updatedAt") SELECT "createdAt", "id", "setlistId", "updatedAt" FROM "Set";
DROP TABLE "Set";
ALTER TABLE "new_Set" RENAME TO "Set";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_SetToSong_AB_unique" ON "_SetToSong"("A", "B");

-- CreateIndex
CREATE INDEX "_SetToSong_B_index" ON "_SetToSong"("B");
