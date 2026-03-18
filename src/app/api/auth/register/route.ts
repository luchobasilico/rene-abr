import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, contraseña y nombre son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const existing = await prisma.professional.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const professional = await prisma.professional.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        passwordHash,
      },
    });

    return NextResponse.json({
      id: professional.id,
      email: professional.email,
      name: professional.name,
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}
