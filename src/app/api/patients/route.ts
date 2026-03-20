import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfessional } from "@/lib/auth";
import { createPatientSchema } from "@/shared/validation/patient";

export async function GET() {
  try {
    const professional = await getCurrentProfessional();
    if (!professional) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const patients = await prisma.patient.findMany({
      where: { professionalId: professional.id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      patients.map((p) => ({
        id: p.id,
        name: p.name,
        birthDate: p.birthDate,
        document: p.document,
        sex: p.sex,
        coverage: p.coverage,
        affiliateNumber: p.affiliateNumber,
        plan: p.plan,
        phone: p.phone,
        email: p.email,
        address: p.address,
      }))
    );
  } catch (err) {
    console.error("GET patients error:", err);
    return NextResponse.json({ error: "Error al obtener pacientes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const professional = await getCurrentProfessional();
    if (!professional) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createPatientSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? "Datos de paciente inválidos" },
        { status: 400 }
      );
    }
    const { name, birthDate, document, sex, coverage, affiliateNumber, plan, phone, email, address } =
      parsed.data;

    const patient = await prisma.patient.create({
      data: {
        name: name.trim(),
        birthDate: birthDate ? new Date(birthDate) : null,
        document: document?.trim() || null,
        sex: sex.trim(),
        coverage: coverage.trim(),
        affiliateNumber: affiliateNumber.trim(),
        plan: plan?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        professionalId: professional.id,
      },
    });

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
    console.error("POST patients error:", err);
    return NextResponse.json({ error: "Error al crear paciente" }, { status: 500 });
  }
}
