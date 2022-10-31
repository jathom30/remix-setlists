-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SongsInSets" (
    "songId" TEXT NOT NULL,
    "positionInSet" INTEGER NOT NULL,
    "setId" TEXT NOT NULL,

    PRIMARY KEY ("songId", "setId"),
    CONSTRAINT "SongsInSets_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SongsInSets_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SongsInSets" ("positionInSet", "setId", "songId") SELECT "positionInSet", "setId", "songId" FROM "SongsInSets";
DROP TABLE "SongsInSets";
ALTER TABLE "new_SongsInSets" RENAME TO "SongsInSets";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
