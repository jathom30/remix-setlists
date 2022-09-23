/*
  Warnings:

  - Added the required column `bandName` to the `UsersInBands` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UsersInBands" (
    "userId" TEXT NOT NULL,
    "bandName" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    PRIMARY KEY ("userId", "bandId"),
    CONSTRAINT "UsersInBands_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsersInBands_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UsersInBands" ("bandId", "role", "userId") SELECT "bandId", "role", "userId" FROM "UsersInBands";
DROP TABLE "UsersInBands";
ALTER TABLE "new_UsersInBands" RENAME TO "UsersInBands";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
