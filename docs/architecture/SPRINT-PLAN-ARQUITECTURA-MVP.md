# Sprint plan de arquitectura (MVP)

Objetivo: ordenar la base tecnica antes de sumar nuevas funciones clinicas.

## Sprint 1 (1 semana): contrato unico y orquestacion

### Entregables

- Contrato `Action Extraction` definido y tipado.
- `processMedicalVisit()` como unico entrypoint del flujo clinico.
- Capa UI consumiendo contrato, sin inferencias duplicadas.

### Tareas

1. Definir tipos compartidos en `shared-types/index.ts`:
   - `ExtractedMedication`
   - `ExtractedStudy`
   - `ExtractedDocument`
   - `ExtractedActions`
2. Crear caso de uso en `src/application/`:
   - `extractClinicalActions.ts`
3. Integrar en `src/application/processMedicalVisit.ts`:
   - transcripcion -> SOAP -> Action Extraction -> prefill (recetas/ordenes/documentos)
4. En `services/ai-orchestrator/`:
   - incluir prompt y parser para salida JSON valida de `ExtractedActions`.
5. En `src/features/consultation/`:
   - reemplazar inferencias locales por consumo del objeto `ExtractedActions`.

### Criterios de aceptacion

- El flujo produce `ExtractedActions` siempre (aunque vacio).
- Recetas/ordenes/documentos no dependen de parseos duplicados en UI.
- No se rompe el flujo actual de dashboard/visita.

---

## Sprint 2 (1 semana): desacople frontend por feature

### Entregables

- Separacion clara entre presentacion y logica en componentes de consulta.
- Estado de consulta reducido a contratos y entidades.

### Tareas

1. Extraer logica de tabs/transformaciones a hooks en:
   - `src/features/consultation/hooks/`
2. Mantener componentes visuales pequenos:
   - `NotesLeftPanel.tsx`
   - `MedicalActionsPanel.tsx`
   - `MedicalDocumentsSection.tsx`
3. Centralizar adaptadores de datos de visita en:
   - `src/features/consultation/adapters/visitAdapters.ts`
4. Revisar `src/shared/store/useConsultationStore.ts`:
   - guardar solo estado necesario.
   - evitar logica de transformacion en store.

### Criterios de aceptacion

- Componentes UI sin logica clinica compleja.
- Cambios de datos de visita impactan en un solo adaptador.
- Menos props acopladas entre panel izquierdo y derecho.

---

## Sprint 3 (1 semana): calidad, trazabilidad y deuda tecnica

### Entregables

- Trazabilidad por etapas del pipeline.
- Cobertura minima de pruebas sobre contratos y transformaciones.
- Backlog formal para diarizacion y facturacion.

### Tareas

1. Agregar telemetria de etapas en backend:
   - start/end/error por etapa de pipeline.
2. Tests minimos:
   - validacion de `ExtractedActions`
   - adaptadores de visita
   - parseo de outputs IA
3. Documentar decisiones pendientes:
   - ADR diarizacion
   - nota de discovery para facturacion/codificacion
4. Limpieza de placeholders de UI:
   - mantener solo los que tengan tarea de backlog asociada.

### Criterios de aceptacion

- Cada visita procesada deja rastro de etapas.
- Contratos criticos con pruebas.
- Pendientes estrategicos documentados y priorizados.

---

## Reglas operativas desde ahora

- No agregar nueva feature clinica sin mapearla a:
  - tipo en `shared-types`
  - paso de application o services
  - consumo UI sin logica duplicada
- Si una pantalla supera responsabilidad unica, dividir por feature/modulo.
- Si una decision afecta arquitectura, documentarla en ADR corto.

## Priorizacion recomendada inmediata

1. Sprint 1 completo.
2. Sprint 2 (tareas 1 y 3).
3. Recién despues, nuevas funciones de analisis clinico avanzadas.
