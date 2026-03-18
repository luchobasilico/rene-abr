import { prisma } from "@/lib/prisma";
import type { IPatientRepository, PatientEntity } from "../src/domain/repositories";

export function createPatientRepository(): IPatientRepository {
  return {
    async create(data) {
      const patient = await prisma.patient.create({
        data: {
          name: data.name,
          birthDate: data.birthDate,
          document: data.document,
          professionalId: data.professionalId,
        },
      });
      return {
        id: patient.id,
        name: patient.name,
        birthDate: patient.birthDate ?? undefined,
        document: patient.document ?? undefined,
      };
    },
    async findById(id) {
      const patient = await prisma.patient.findUnique({ where: { id } });
      if (!patient) return null;
      return {
        id: patient.id,
        name: patient.name,
        birthDate: patient.birthDate ?? undefined,
        document: patient.document ?? undefined,
      };
    },
  };
}
