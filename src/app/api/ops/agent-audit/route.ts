import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfessional } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const professional = await getCurrentProfessional();
    if (!professional) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limitRaw = Number.parseInt(url.searchParams.get("limit") ?? "80", 10);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 250) : 80;
    const agent = url.searchParams.get("agent")?.trim();
    const activatedParam = url.searchParams.get("activated");
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");

    const allowedAgents = new Set(["soap", "medication", "studies", "documents", "followups"]);
    const agentFilter = agent && allowedAgents.has(agent) ? agent : undefined;
    const activatedFilter =
      activatedParam === "true" ? true : activatedParam === "false" ? false : undefined;
    const fromDate = fromParam ? new Date(fromParam) : undefined;
    const toDate = toParam ? new Date(toParam) : undefined;

    const createdAtFilter: { gte?: Date; lte?: Date } = {};
    if (fromDate && !Number.isNaN(fromDate.getTime())) createdAtFilter.gte = fromDate;
    if (toDate && !Number.isNaN(toDate.getTime())) {
      // Include full selected day up to 23:59:59.999 in local time equivalent.
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      createdAtFilter.lte = end;
    }

    const rows = await prisma.agentDecision.findMany({
      where: {
        ...(agentFilter ? { agentKey: agentFilter } : {}),
        ...(activatedFilter !== undefined ? { activated: activatedFilter } : {}),
        ...(Object.keys(createdAtFilter).length ? { createdAt: createdAtFilter } : {}),
        visit: {
          professionalId: professional.id,
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        visit: {
          select: {
            id: true,
            createdAt: true,
            patient: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      rows: rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        visitId: r.visitId,
        patientId: r.visit.patient.id,
        patientName: r.visit.patient.name,
        visitCreatedAt: r.visit.createdAt,
        agentKey: r.agentKey,
        activated: r.activated,
        reason: r.reason,
        matchedPattern: r.matchedPattern ?? undefined,
        source: r.source,
      })),
    });
  } catch (err) {
    console.error("GET ops/agent-audit error:", err);
    return NextResponse.json({ success: false, error: "Error al obtener auditoría" }, { status: 500 });
  }
}
