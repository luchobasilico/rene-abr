import test from "node:test";
import assert from "node:assert/strict";
import { buildQbi2RecipeRequest, runMedicationIssuingFlow, validateQbi2RecipeRequest } from "./qbi2MedicationFlow";

test("buildQbi2RecipeRequest construye payload base", () => {
  const payload = buildQbi2RecipeRequest({
    patient: {
      name: "Ana Gomez",
      document: "30111222",
      birthDate: new Date("1990-01-20"),
      sex: "F",
    },
    professional: {
      name: "Juan Perez",
    },
    medications: [
      { drug: "ibuprofeno", dose: "400mg", frequency: "c/8h", route: "VO", duration: "3 dias" },
    ],
    soap: { subjective: "", objective: "", assessment: "", plan: "Control en 72h" },
  });

  assert.equal(payload.paciente.nombre, "Ana");
  assert.equal(payload.paciente.apellido, "Gomez");
  assert.equal(payload.paciente.tipoDoc, "DNI");
  assert.equal(payload.medicamentos.length, 1);
});

test("validateQbi2RecipeRequest detecta faltantes obligatorios", () => {
  const result = validateQbi2RecipeRequest({
    paciente: {
      apellido: "",
      nombre: "",
      tipoDoc: "DNI",
      nroDoc: "",
      fechaNacimiento: "",
      sexo: "F",
    },
    medico: {
      apellido: "",
      nombre: "",
      tipoDoc: "DNI",
      nroDoc: "",
      sexo: "M",
      matricula: { tipo: "MN", numero: "" },
    },
    medicamentos: [],
    clienteAppId: 0,
    lugarAtencion: { nombre: "" },
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "paciente.nombre"));
  assert.ok(result.errors.some((e) => e.path === "medico.matricula.numero"));
});

test("runMedicationIssuingFlow clasifica bloqueo por datos del médico", () => {
  const decision = runMedicationIssuingFlow({
    patient: {
      name: "Ana Gomez",
      document: "30111222",
      birthDate: new Date("1990-01-20"),
      sex: "F",
    },
    professional: {
      name: "Juan Perez",
    },
    medications: [
      { drug: "ibuprofeno", dose: "400mg", frequency: "c/8h", route: "VO", duration: "3 dias" },
    ],
    soap: { subjective: "", objective: "", assessment: "", plan: "Control en 72h" },
  });

  assert.equal(decision.status, "blocked_missing_professional_fields");
});
