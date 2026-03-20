import type { ExtractedActions, ExtractedDocument, ExtractedMedication, ExtractedStudy } from "@shared-types";
import { sanitizeExtractedActions } from "@shared-types";

interface AggregateActionParts {
  medications?: ExtractedMedication[];
  studies?: ExtractedStudy[];
  documents?: ExtractedDocument[];
  followups?: string[];
}

export function aggregateExtractedActions(parts: AggregateActionParts): ExtractedActions {
  return sanitizeExtractedActions({
    medications: parts.medications ?? [],
    studies: parts.studies ?? [],
    documents: parts.documents ?? [],
    followups: parts.followups ?? [],
  });
}
