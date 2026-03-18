-- CreateTable
CREATE TABLE "Professional" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- Insert default professional for existing data (password: migracion123)
INSERT INTO "Professional" ("id", "createdAt", "updatedAt", "email", "name", "passwordHash") 
VALUES ('default-professional', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'migracion@escribamedico.local', 'Profesional Migración', '$2b$10$Q/iB77pVK6VewoDnOAOjauVdjeTtxoTZZTyJwBJJqZ/bFMmOo9tmC');

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" DATETIME,
    "document" TEXT,
    "professionalId" TEXT NOT NULL,
    CONSTRAINT "Patient_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("id", "createdAt", "updatedAt", "name", "birthDate", "document", "professionalId") 
SELECT "id", "createdAt", "updatedAt", "name", "birthDate", "document", 'default-professional' FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE TABLE "new_Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "signedAt" DATETIME,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    CONSTRAINT "Visit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Visit_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Visit" ("id", "createdAt", "updatedAt", "signedAt", "patientId", "professionalId") 
SELECT "id", "createdAt", "updatedAt", "signedAt", "patientId", 'default-professional' FROM "Visit";
DROP TABLE "Visit";
ALTER TABLE "new_Visit" RENAME TO "Visit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Professional_email_key" ON "Professional"("email");
