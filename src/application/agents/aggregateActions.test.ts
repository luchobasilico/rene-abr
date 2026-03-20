import test from "node:test";
import assert from "node:assert/strict";
import { aggregateExtractedActions } from "./aggregateActions";

test("aggregateExtractedActions arma contrato estable completo", () => {
  const result = aggregateExtractedActions({
    medications: [{ drug: " Ibuprofeno ", dose: "400mg", frequency: "c/8h", route: "VO", duration: "3 días" }],
    studies: [{ type: "lab", description: " Hemograma " }],
    documents: [{ type: "report", title: " Informe ", rationale: " control " }],
    followups: ["  control en 48hs "],
  });

  assert.equal(result.medications[0].drug, "Ibuprofeno");
  assert.equal(result.studies[0].description, "Hemograma");
  assert.equal(result.documents[0].title, "Informe");
  assert.deepEqual(result.followups, ["control en 48hs"]);
});

test("aggregateExtractedActions tolera partes faltantes", () => {
  const result = aggregateExtractedActions({});
  assert.deepEqual(result, {
    medications: [],
    studies: [],
    documents: [],
    followups: [],
  });
});
