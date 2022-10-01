/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Band` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Set" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "length" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "setlistId" TEXT NOT NULL,
    CONSTRAINT "Set_setlistId_fkey" FOREIGN KEY ("setlistId") REFERENCES "Setlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Set" ("createdAt", "id", "length", "setlistId", "updatedAt") SELECT "createdAt", "id", "length", "setlistId", "updatedAt" FROM "Set";
DROP TABLE "Set";
ALTER TABLE "new_Set" RENAME TO "Set";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Band_code_key" ON "Band"("code");
