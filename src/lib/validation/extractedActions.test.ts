import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeExtractedActions } from "@shared-types";

test("sanitizeExtractedActions normaliza valores y filtra tipos inválidos", () => {
  const result = sanitizeExtractedActions({
    medications: [
      { drug: " Ibuprofeno ", dose: 400 as unknown as string, frequency: "cada 8h", route: "VO", duration: "5 días" },
    ],
    studies: [
      { type: "lab", description: " Hemograma " },
      { type: "otro" as "lab", description: "no válido" },
    ],
    documents: [
      { type: "report", title: " Informe clínico ", rationale: " respaldo " },
      { type: "x" as "report", title: "descartar" },
    ],
    followups: ["  control en 72hs ", "", 123 as unknown as string],
  });

  assert.equal(result.medications.length, 1);
  assert.equal(result.medications[0].drug, "Ibuprofeno");
  assert.equal(result.medications[0].dose, "");
  assert.equal(result.studies.length, 1);
  assert.equal(result.studies[0].type, "lab");
  assert.equal(result.studies[0].description, "Hemograma");
  assert.equal(result.documents.length, 1);
  assert.equal(result.documents[0].type, "report");
  assert.equal(result.documents[0].title, "Informe clínico");
  assert.equal(result.documents[0].rationale, "respaldo");
  assert.deepEqual(result.followups, ["control en 72hs"]);
});

test("sanitizeExtractedActions devuelve estructura vacía estable", () => {
  const result = sanitizeExtractedActions(undefined);
  assert.deepEqual(result, {
    medications: [],
    studies: [],
    documents: [],
    followups: [],
  });
});
