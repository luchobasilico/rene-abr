-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" DATETIME,
    "document" TEXT
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "signedAt" DATETIME,
    "patientId" TEXT NOT NULL,
    CONSTRAINT "Visit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT NOT NULL,
    "audioUrl" TEXT,
    "audioExpiresAt" DATETIME,
    CONSTRAINT "Transcript_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TranscriptSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transcriptId" TEXT NOT NULL,
    "speaker" TEXT NOT NULL,
    "timestampStart" INTEGER NOT NULL,
    "timestampEnd" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "confidence" REAL,
    "lowConfidence" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "TranscriptSegment_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "Transcript" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT NOT NULL,
    "subjective" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "assessment" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    CONSTRAINT "Note_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT NOT NULL,
    "drug" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    CONSTRAINT "Prescription_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicalOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "MedicalOrder_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "PatientSummary_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "specialist" TEXT,
    CONSTRAINT "Referral_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Justification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "Justification_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LinkedEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "segmentId" TEXT NOT NULL,
    "noteBlockType" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_visitId_key" ON "Transcript"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "Note_visitId_key" ON "Note"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientSummary_visitId_key" ON "PatientSummary"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_visitId_key" ON "Referral"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "Justification_visitId_key" ON "Justification"("visitId");
