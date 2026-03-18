import { prisma } from "@/lib/prisma";
import type { SOAPNote } from "@shared-types";
import type { INoteRepository } from "../src/domain/repositories";

export function createNoteRepository(): INoteRepository {
  return {
    async create(data) {
      await prisma.note.create({
        data: {
          visitId: data.visitId,
          subjective: data.soap.subjective,
          objective: data.soap.objective,
          assessment: data.soap.assessment,
          plan: data.soap.plan,
        },
      });
    },
    async update(data) {
      await prisma.note.update({
        where: { visitId: data.visitId },
        data: {
          subjective: data.soap.subjective,
          objective: data.soap.objective,
          assessment: data.soap.assessment,
          plan: data.soap.plan,
        },
      });
    },
    async findByVisitId(visitId) {
      const note = await prisma.note.findUnique({ where: { visitId } });
      if (!note) return null;
      return {
        subjective: note.subjective,
        objective: note.objective,
        assessment: note.assessment,
        plan: note.plan,
      };
    },
  };
}
