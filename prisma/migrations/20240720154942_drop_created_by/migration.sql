/*
  Warnings:

  - You are about to drop the `_SetlistNoteToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `createdBy` on the `SetlistNote` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `SetlistNote` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_SetlistNoteToUser_B_index";

-- DropIndex
DROP INDEX "_SetlistNoteToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_SetlistNoteToUser";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SetlistNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    "setlistId" TEXT NOT NULL,
    CONSTRAINT "SetlistNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SetlistNote_setlistId_fkey" FOREIGN KEY ("setlistId") REFERENCES "Setlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SetlistNote" ("content", "createdAt", "id", "setlistId", "updatedAt") SELECT "content", "createdAt", "id", "setlistId", "updatedAt" FROM "SetlistNote";
DROP TABLE "SetlistNote";
ALTER TABLE "new_SetlistNote" RENAME TO "SetlistNote";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
