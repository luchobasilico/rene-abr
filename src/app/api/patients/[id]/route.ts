import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfessional } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const professional = await getCurrentProfessional();
    if (!professional) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const patient = await prisma.patient.findFirst({
      where: { id, professionalId: professional.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: patient.id,
      name: patient.name,
      birthDate: patient.birthDate,
      document: patient.document,
      sex: patient.sex,
      coverage: patient.coverage,
      affiliateNumber: patient.affiliateNumber,
      plan: patient.plan,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
    });
  } catch (err) {
    console.error("GET patient error:", err);
    return NextResponse.json({ error: "Error al obtener paciente" }, { status: 500 });
  }
}
