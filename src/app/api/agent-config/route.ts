import { NextResponse } from "next/server";
import { getCurrentProfessional } from "@/lib/auth";
import { getAgentConfig } from "@/application/agentConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const professional = await getCurrentProfessional();
    if (!professional) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      config: getAgentConfig(),
    });
  } catch (err) {
    console.error("GET agent-config error:", err);
    return NextResponse.json(
      { success: false, error: "Error al obtener configuración de agentes" },
      { status: 500 }
    );
  }
}
