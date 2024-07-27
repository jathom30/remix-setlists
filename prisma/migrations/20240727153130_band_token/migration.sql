-- CreateTable
CREATE TABLE "BandToken" (
    "hash" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BandToken_bandId_key" ON "BandToken"("bandId");
