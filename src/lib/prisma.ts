import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const dbUrl =
  process.env.DATABASE_URL ||
  `file:${path.join(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/")}`;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: dbUrl } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
