# ADR-005: MVP deterministico y Action Extraction explicito

- Estado: Aprobado
- Fecha: 2026-03-20
- Contexto: El producto necesita escalar funcionalidades clinicas sin mezclar logica de negocio en UI ni dispersar decisiones del flujo en multiples modulos.

## Decision

Se adopta como regla principal del MVP:

1. El flujo clinico se orquesta de forma deterministica desde `src/application/processMedicalVisit.ts`.
2. Se incorpora un paso explicito de `Action Extraction` antes de generar artefactos clinicos secundarios.
3. La UI no infiere acciones clinicas de forma distribuida; consume resultados estructurados.
4. El medico mantiene validacion final sobre toda accion clinica sensible (HITL).

## Contrato intermedio

`Action Extraction` debe devolver una estructura tipada (con fallback vacio):

- `medications[]`
- `studies[]`
- `documents[]`
- `followups[]` (opcional en MVP, recomendado para evolucion)

Este contrato se considera fuente de verdad para:

- Prefill de recetas
- Prefill de ordenes
- Prefill/listado de documentos

## Alcance MVP (si / no)

### Si en MVP

- Orquestacion deterministica
- Action Extraction explicito
- Validacion estructurada de salida LLM
- Trazabilidad por etapa del pipeline

### No en MVP

- LangGraph como runtime principal (evaluar Fase 2)
- Kubernetes / infraestructura enterprise (evaluar Fase 2)
- Agente completo de codificacion/facturacion (backlog)

## Pendiente de definicion formal

### Diarizacion (TBD)

Queda abierta decision con tres opciones:

- A: incluir en MVP
- B: postergar a Fase 2
- C: decidir segun resultado de pilotos

La decision se documenta en ADR separado antes de implementar cambios de pipeline.

## Consecuencias

- Menor acoplamiento entre frontend y reglas clinicas.
- Menor duplicacion entre modulos de recetas/ordenes/documentos.
- Mejor testabilidad por contratos intermedios.
- Menor riesgo de regresiones al agregar features nuevas.
