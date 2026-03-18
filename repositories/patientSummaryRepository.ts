import { prisma } from "@/lib/prisma";
import type { PatientSummary } from "@shared-types";
import type { IPatientSummaryRepository } from "../src/domain/repositories";

export function createPatientSummaryRepository(): IPatientSummaryRepository {
  return {
    async create(data) {
      await prisma.patientSummary.create({
        data: { visitId: data.visitId, text: data.text },
      });
    },
    async findByVisitId(visitId) {
      const summary = await prisma.patientSummary.findUnique({
        where: { visitId },
      });
      if (!summary) return null;
      return { text: summary.text };
    },
  };
}
