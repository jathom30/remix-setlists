-- CreateTable
CREATE TABLE "BandIcon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bandId" TEXT NOT NULL,
    CONSTRAINT "BandIcon_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BandIcon_bandId_key" ON "BandIcon"("bandId");
