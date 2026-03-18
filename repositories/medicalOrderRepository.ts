import { prisma } from "@/lib/prisma";
import type { MedicalOrder } from "@shared-types";
import type { IMedicalOrderRepository } from "../src/domain/repositories";

export function createMedicalOrderRepository(): IMedicalOrderRepository {
  return {
    async createMany(data) {
      await prisma.medicalOrder.createMany({
        data: data.orders.map((o) => ({
          visitId: data.visitId,
          type: o.type,
          description: o.description,
        })),
      });
    },
    async findByVisitId(visitId) {
      const orders = await prisma.medicalOrder.findMany({
        where: { visitId },
      });
      return orders.map((o) => ({
        type: o.type as MedicalOrder["type"],
        description: o.description,
      }));
    },
  };
}
