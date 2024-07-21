-- CreateTable
CREATE TABLE "UsersInSetlistNotes" (
    "userId" TEXT NOT NULL,
    "setlistNoteId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "setlistNoteId"),
    CONSTRAINT "UsersInSetlistNotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UsersInSetlistNotes_setlistNoteId_fkey" FOREIGN KEY ("setlistNoteId") REFERENCES "SetlistNote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
