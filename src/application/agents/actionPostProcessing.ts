import type { ExtractedDocument, ExtractedMedication, ExtractedStudy } from "@shared-types";

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isNonEmpty(value: string | undefined): value is string {
  return !!value && value.trim().length > 0;
}

export function postProcessMedications(items: ExtractedMedication[]): ExtractedMedication[] {
  const unique = new Set<string>();
  const out: ExtractedMedication[] = [];
  for (const item of items) {
    if (!isNonEmpty(item.drug)) continue;
    const normalized: ExtractedMedication = {
      drug: item.drug.trim(),
      dose: item.dose?.trim() ?? "",
      frequency: item.frequency?.trim() ?? "",
      route: item.route?.trim() ?? "",
      duration: item.duration?.trim() ?? "",
    };
    const key = normalizeKey(
      `${normalized.drug}|${normalized.dose}|${normalized.frequency}|${normalized.route}|${normalized.duration}`
    );
    if (unique.has(key)) continue;
    unique.add(key);
    out.push(normalized);
  }
  return out;
}

export function postProcessStudies(items: ExtractedStudy[]): ExtractedStudy[] {
  const unique = new Set<string>();
  const out: ExtractedStudy[] = [];
  for (const item of items) {
    if (!isNonEmpty(item.description)) continue;
    const normalized: ExtractedStudy = {
      type: item.type,
      description: item.description.trim(),
    };
    const key = normalizeKey(`${normalized.type}|${normalized.description}`);
    if (unique.has(key)) continue;
    unique.add(key);
    out.push(normalized);
  }
  return out;
}

export function postProcessDocuments(items: ExtractedDocument[]): ExtractedDocument[] {
  const unique = new Set<string>();
  const out: ExtractedDocument[] = [];
  for (const item of items) {
    if (!isNonEmpty(item.title)) continue;
    const normalized: ExtractedDocument = {
      type: item.type,
      title: item.title.trim(),
      rationale: item.rationale?.trim() || undefined,
    };
    const key = normalizeKey(`${normalized.type}|${normalized.title}|${normalized.rationale ?? ""}`);
    if (unique.has(key)) continue;
    unique.add(key);
    out.push(normalized);
  }
  return out;
}

export function postProcessFollowups(items: string[]): string[] {
  const unique = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const normalized = item.trim();
    if (normalized.length < 4) continue;
    const key = normalizeKey(normalized);
    if (unique.has(key)) continue;
    unique.add(key);
    out.push(normalized);
  }
  return out;
}
