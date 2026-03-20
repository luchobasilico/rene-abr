import type { TranscriptSegment, ProcessVisitResponse } from "@shared-types";
import { processAudio } from "@services/audio-processing";
import {
  buildLinkedEvidence,
  generateSOAPBlock,
  generateJustification,
  generateMedicalOrders,
  generatePatientSummary,
  generatePrescriptions,
  generateReferral,
  hasUsableClinicalTranscript,
} from "@services/ai-orchestrator";
import {
  createPatientRepository,
  createVisitRepository,
  createTranscriptRepository,
  createNoteRepository,
  createPrescriptionRepository,
  createMedicalOrderRepository,
  createPatientSummaryRepository,
  createReferralRepository,
  createJustificationRepository,
} from "@repositories";

interface ProcessProgressEvent {
  stage: "visit_created" | "transcribing" | "generating" | "saving" | "completed";
  visitId?: string;
  transcript?: TranscriptSegment[];
  soap?: ProcessVisitResponse["soap"];
  soapBlock?: "subjective" | "objective" | "assessment" | "plan";
  recipes?: ProcessVisitResponse["recetas"];
  orders?: ProcessVisitResponse["ordenes"];
  patientSummary?: ProcessVisitResponse["resumen_paciente"];
  referral?: ProcessVisitResponse["referral"];
  justification?: ProcessVisitResponse["justification"];
}

export async function processMedicalVisit(
  audioBuffer: Buffer,
  professionalId: string,
  patientId?: string,
  onProgress?: (event: ProcessProgressEvent) => void
): Promise<ProcessVisitResponse> {
  const patientRepo = createPatientRepository();
  const visitRepo = createVisitRepository();
  const transcriptRepo = createTranscriptRepository();
  const noteRepo = createNoteRepository();
  const prescriptionRepo = createPrescriptionRepository();
  const orderRepo = createMedicalOrderRepository();
  const summaryRepo = createPatientSummaryRepository();
  const referralRepo = createReferralRepository();
  const justificationRepo = createJustificationRepository();

  let pid = patientId;
  if (!pid) {
    const patient = await patientRepo.create({
      name: "Paciente",
      birthDate: undefined,
      document: undefined,
      professionalId,
    });
    pid = patient.id;
  }

  const visit = await visitRepo.create({ patientId: pid, professionalId });
  onProgress?.({ stage: "visit_created", visitId: visit.id });

  onProgress?.({ stage: "transcribing", visitId: visit.id });
  const segments: TranscriptSegment[] = await processAudio(audioBuffer);

  // Transcripción al cliente de inmediato; no esperar a Prisma para empezar la nota clínica.
  onProgress?.({ stage: "transcribing", visitId: visit.id, transcript: segments });
  onProgress?.({ stage: "generating", visitId: visit.id });

  const soapBlocks: Array<"subjective" | "objective" | "assessment" | "plan"> = [
    "subjective",
    "objective",
    "assessment",
    "plan",
  ];

  const saveTranscriptPromise = transcriptRepo.create({
    visitId: visit.id,
    segments,
  });

  const unusableTranscript = !hasUsableClinicalTranscript(segments);

  if (unusableTranscript) {
    const soap: ProcessVisitResponse["soap"] = {
      subjective:
        "No se detectó habla clínica utilizable en la grabación (silencio, audio insuficiente o transcripción vacía). No se generó contenido inferido.",
      objective: "",
      assessment: "",
      plan: "Repetir la grabación con el micrófono activo o verificar el dispositivo de audio.",
    };

    await saveTranscriptPromise;
    await noteRepo.create({ visitId: visit.id, soap });

    for (const block of soapBlocks) {
      onProgress?.({ stage: "saving", visitId: visit.id, soap, soapBlock: block });
    }

    await prescriptionRepo.createMany({ visitId: visit.id, prescriptions: [] });
    onProgress?.({ stage: "saving", visitId: visit.id, recipes: [] });
    await orderRepo.createMany({ visitId: visit.id, orders: [] });
    onProgress?.({ stage: "saving", visitId: visit.id, orders: [] });
    await summaryRepo.create({
      visitId: visit.id,
      text: "No se generó resumen: no hubo transcripción utilizable.",
    });
    onProgress?.({
      stage: "saving",
      visitId: visit.id,
      patientSummary: { text: "No se generó resumen: no hubo transcripción utilizable." },
    });

    const evidencias = buildLinkedEvidence(soap, segments);
    onProgress?.({ stage: "completed", visitId: visit.id });

    return {
      visitId: visit.id,
      soap,
      recetas: [],
      ordenes: [],
      resumen_paciente: { text: "No se generó resumen: no hubo transcripción utilizable." },
      evidencias,
      referral: undefined,
      justification: undefined,
    };
  }

  const soap: ProcessVisitResponse["soap"] = {
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  };

  let noteCreated = false;
  for (let i = 0; i < soapBlocks.length; i++) {
    const block = soapBlocks[i];
    const text =
      i === 0
        ? (
            await Promise.all([
              saveTranscriptPromise,
              generateSOAPBlock(segments, block, soap),
            ])
          )[1]
        : await generateSOAPBlock(segments, block, soap);
    soap[block] = text;
    if (!noteCreated) {
      await noteRepo.create({ visitId: visit.id, soap });
      noteCreated = true;
    } else {
      await noteRepo.update({ visitId: visit.id, soap });
    }
    onProgress?.({ stage: "saving", visitId: visit.id, soap, soapBlock: block });
  }

  const prescriptions = await generatePrescriptions(segments);
  await prescriptionRepo.createMany({ visitId: visit.id, prescriptions });
  onProgress?.({ stage: "saving", visitId: visit.id, recipes: prescriptions });

  const orders = await generateMedicalOrders(segments);
  await orderRepo.createMany({ visitId: visit.id, orders });
  onProgress?.({ stage: "saving", visitId: visit.id, orders });

  const patientSummary = await generatePatientSummary(segments, soap);
  await summaryRepo.create({ visitId: visit.id, text: patientSummary.text });
  onProgress?.({ stage: "saving", visitId: visit.id, patientSummary });

  const referral = await generateReferral(segments, soap);
  if (referral?.text?.trim()) {
    await referralRepo.create({
      visitId: visit.id,
      text: referral.text,
      specialist: referral.specialist,
    });
    onProgress?.({ stage: "saving", visitId: visit.id, referral });
  }

  const justification = await generateJustification(segments, soap);
  if (justification?.text?.trim()) {
    await justificationRepo.create({
      visitId: visit.id,
      text: justification.text,
    });
    onProgress?.({ stage: "saving", visitId: visit.id, justification });
  }

  const evidencias = buildLinkedEvidence(soap, segments);
  onProgress?.({ stage: "completed", visitId: visit.id });

  return {
    visitId: visit.id,
    soap,
    recetas: prescriptions,
    ordenes: orders,
    resumen_paciente: patientSummary,
    evidencias,
    referral,
    justification,
  };
}
