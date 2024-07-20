/*
  Warnings:

  - Added the required column `createdBy` to the `SetlistNote` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SetlistNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "setlistId" TEXT NOT NULL,
    CONSTRAINT "SetlistNote_setlistId_fkey" FOREIGN KEY ("setlistId") REFERENCES "Setlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SetlistNote" ("content", "createdAt", "id", "setlistId", "updatedAt") SELECT "content", "createdAt", "id", "setlistId", "updatedAt" FROM "SetlistNote";
DROP TABLE "SetlistNote";
ALTER TABLE "new_SetlistNote" RENAME TO "SetlistNote";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
