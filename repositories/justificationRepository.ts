import { prisma } from "@/lib/prisma";

export function createJustificationRepository() {
  return {
    async create(data: { visitId: string; text: string }) {
      await prisma.justification.create({
        data: { visitId: data.visitId, text: data.text },
      });
    },
  };
}
