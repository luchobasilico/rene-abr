# Política de activación de agentes de acciones (determinística)

## Principio

El orquestador clínico no utiliza decisión blackbox. La activación de cada agente de acciones se define por reglas explícitas sobre texto clínico (transcripción + SOAP).

## Fuente evaluada

- Texto de transcripción concatenado.
- Bloques SOAP relevantes (`assessment`, `objective`, `plan`).

## Reglas de activación

### 1) MedicationAgent

Se activa si se detectan patrones compatibles con prescripción, por ejemplo:

- `indico`, `indicar`, `indicación`
- `receta`, `medicación`
- `dosis`, `cada Xh`, `vo`, `mg`, `comprimido`

Si no se activa: `medications = []`.

### 2) StudiesAgent

Se activa si se detectan patrones de estudios/órdenes:

- `laboratorio`, `hemograma`, `perfil`
- `ecografía`, `radiografía`, `tomografía`, `rmn`, `resonancia`
- `interconsulta`, `derivación`, `orden`

Si no se activa: `studies = []`.

### 3) DocumentsAgent

Se activa si se detectan patrones documentales:

- `certificado`, `licencia`, `reposo`
- `justificación`, `consentimiento`
- `epicrisis`, `informe`, `carta`

Si no se activa: `documents = []`.

### 4) FollowupsAgent

Se activa si se detectan patrones de seguimiento:

- `control`, `seguimiento`, `reevaluar`, `volver`
- `próxima consulta`
- expresiones temporales: `en X días`, `en X semanas`

Si no se activa: `followups = []`.

## Reglas de seguridad

- Sin `patientId`, no se procesa consulta.
- Si falla un agente de acciones, fallback de esa categoría a arreglo vacío.
- SOAP conserva fallback determinístico controlado.

## Referencias de implementación

- `src/application/processMedicalVisit.ts`
- `src/app/api/visits/process/route.ts`
- `docs/architecture/AGENT-MODE-RUNBOOK.md`
