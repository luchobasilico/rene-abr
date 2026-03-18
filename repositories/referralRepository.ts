import { prisma } from "@/lib/prisma";

export function createReferralRepository() {
  return {
    async create(data: { visitId: string; text: string; specialist?: string }) {
      await prisma.referral.create({
        data: {
          visitId: data.visitId,
          text: data.text,
          specialist: data.specialist,
        },
      });
    },
  };
}
