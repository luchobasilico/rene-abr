import type { TranscriptSegment, ProcessVisitResponse } from "@shared-types";
import { processAudio } from "@services/audio-processing";
import { generateClinicalOutputs } from "@services/ai-orchestrator";
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

export async function processMedicalVisit(
  audioBuffer: Buffer,
  professionalId: string,
  patientId?: string
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

  const segments: TranscriptSegment[] = await processAudio(audioBuffer);

  const {
    soap,
    prescriptions,
    orders,
    patientSummary,
    evidencias,
    referral,
    justification,
  } = await generateClinicalOutputs(segments);

  await transcriptRepo.create({
    visitId: visit.id,
    segments,
  });

  await noteRepo.create({ visitId: visit.id, soap });
  await prescriptionRepo.createMany({ visitId: visit.id, prescriptions });
  await orderRepo.createMany({ visitId: visit.id, orders });
  await summaryRepo.create({ visitId: visit.id, text: patientSummary.text });
  if (referral) {
    await referralRepo.create({
      visitId: visit.id,
      text: referral.text,
      specialist: referral.specialist,
    });
  }
  if (justification) {
    await justificationRepo.create({
      visitId: visit.id,
      text: justification.text,
    });
  }

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
