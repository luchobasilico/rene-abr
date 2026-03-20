# Discovery: facturación y codificación clínica

## Objetivo

Definir alcance y riesgos para soportar codificación clínica y facturación sin contaminar el MVP asistencial.

## Preguntas clave

- ¿Qué estándar se prioriza primero (CIE-10, SNOMED, nomenclador local)?
- ¿El output es sugerencia editable (HITL) o autocompletado?
- ¿Qué evidencia mínima debe respaldar una sugerencia de código?
- ¿Cómo versionamos reglas de codificación por financiador/cobertura?

## Hipótesis iniciales

1. Debe ser **asistido** (no automático), con validación médica obligatoria.
2. Debe vivir como módulo desacoplado del pipeline clínico central.
3. Requiere trazabilidad de origen (segmentos + bloques SOAP + timestamp).

## Riesgos

- Riesgo regulatorio por sugerencias incorrectas.
- Variabilidad por financiador.
- Sesgo de LLM en codificación no explícita.

## Recomendación de arquitectura

- Crear feature futura `coding-billing` separada.
- Consumir contratos existentes (`SOAPNote`, `ExtractedActions`, `LinkedEvidence`) sin duplicar parsing.
- Exponer recomendaciones como `suggestedCodes[]` con:
  - `code`,
  - `system`,
  - `justification`,
  - `confidence`,
  - `evidenceRefs`.

## Próximos pasos

1. Workshop con facturación + médicos para reglas de aceptación.
2. Definir contrato tipado en `shared-types` (sin integrarlo aún a runtime).
3. Prototipo offline con set curado de consultas anonimizadas.
