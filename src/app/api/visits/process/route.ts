import { NextResponse } from "next/server";
import { processMedicalVisit } from "@/application/processMedicalVisit";
import { getCurrentProfessional } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const professional = await getCurrentProfessional();
    if (!professional) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json(
        { error: "Se requiere archivo de audio" },
        { status: 400 }
      );
    }

    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await processMedicalVisit(buffer, professional.id);

    return NextResponse.json(result);
  } catch (err) {
    console.error("processMedicalVisit error:", err);
    let message = err instanceof Error ? err.message : "Error al procesar consulta";
    if (message.toLowerCase().includes("upload failed")) {
      message = "Error al subir el audio. Probá de nuevo en unos segundos. Si persiste, verificá que la grabación tenga al menos 10 segundos.";
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
