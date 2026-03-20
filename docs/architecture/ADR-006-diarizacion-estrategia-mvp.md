# ADR-006: estrategia de diarización para MVP

## Estado

Propuesto

## Contexto

El pipeline actual procesa audio clínico y genera SOAP + acciones clínicas sin diarización robusta por speaker.
Esto limita:

- precisión en evidencia enlazada por rol clínico,
- separación médico/paciente en casos con solapamientos,
- base para analítica clínica por turno de habla.

## Decisión

Para MVP se adopta una estrategia incremental:

1. Mantener speaker tagging actual (`medico`/`paciente`) proveniente del ASR.
2. No bloquear flujo clínico por ausencia de diarización fina.
3. Incorporar una etapa opcional posterior `diarize_and_align` detrás de feature flag.
4. Exponer trazas de etapa (`start/end/error`) para medir costo/beneficio real antes de hacerla obligatoria.

## Consecuencias

### Positivas

- No se frena entrega clínica actual.
- Permite medir impacto real sobre calidad y latencia.
- Reduce riesgo de regresión en MVP.

### Negativas

- Persisten errores de asignación de speaker en casos difíciles.
- Linked evidence sigue siendo heurística en parte.

## Plan posterior

- Definir dataset de evaluación de diarización clínica (mínimo 30 consultas reales anonimizadas).
- Medir WDER/DER y latencia por proveedor.
- Promover `diarize_and_align` a etapa estable si mejora calidad sin degradar UX.
