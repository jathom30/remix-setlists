-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Band" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isUnlimited" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Band" ("code", "createdAt", "id", "name", "updatedAt") SELECT "code", "createdAt", "id", "name", "updatedAt" FROM "Band";
DROP TABLE "Band";
ALTER TABLE "new_Band" RENAME TO "Band";
CREATE UNIQUE INDEX "Band_code_key" ON "Band"("code");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
