import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfessional } from "@/lib/auth";

export async function GET() {
  try {
    const professional = await getCurrentProfessional();
    if (!professional) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const visits = await prisma.visit.findMany({
      where: { professionalId: professional.id },
      orderBy: { createdAt: "desc" },
      include: {
        patient: true,
      },
    });
    return NextResponse.json(
      visits.map((v) => ({
        id: v.id,
        patientId: v.patientId,
        patientName: v.patient.name,
        createdAt: v.createdAt,
        signedAt: v.signedAt,
      }))
    );
  } catch (err) {
    console.error("GET visits error:", err);
    return NextResponse.json(
      { error: "Error al obtener consultas" },
      { status: 500 }
    );
  }
}
