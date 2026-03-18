import { prisma } from "@/lib/prisma";
import type { Prescription } from "@shared-types";
import type { IPrescriptionRepository } from "../src/domain/repositories";

export function createPrescriptionRepository(): IPrescriptionRepository {
  return {
    async createMany(data) {
      await prisma.prescription.createMany({
        data: data.prescriptions.map((p) => ({
          visitId: data.visitId,
          drug: p.drug,
          dose: p.dose,
          frequency: p.frequency,
          route: p.route,
          duration: p.duration,
        })),
      });
    },
    async findByVisitId(visitId) {
      const prescriptions = await prisma.prescription.findMany({
        where: { visitId },
      });
      return prescriptions.map((p) => ({
        drug: p.drug,
        dose: p.dose,
        frequency: p.frequency,
        route: p.route,
        duration: p.duration,
      }));
    },
  };
}
