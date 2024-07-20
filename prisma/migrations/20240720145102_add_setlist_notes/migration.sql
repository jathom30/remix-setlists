-- CreateTable
CREATE TABLE "SetlistNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "setlistId" TEXT NOT NULL,
    CONSTRAINT "SetlistNote_setlistId_fkey" FOREIGN KEY ("setlistId") REFERENCES "Setlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_SetlistNoteToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SetlistNoteToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "SetlistNote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SetlistNoteToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_SetlistNoteToUser_AB_unique" ON "_SetlistNoteToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_SetlistNoteToUser_B_index" ON "_SetlistNoteToUser"("B");
