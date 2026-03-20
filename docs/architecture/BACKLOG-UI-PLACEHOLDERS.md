# Backlog de placeholders UI

Este backlog registra placeholders permitidos en MVP, con referencia explícita para evitar texto "En desarrollo" sin trazabilidad.

## Priorización sugerida

| ID | Prioridad | Motivo |
| --- | --- | --- |
| UI-001 | P1 | Impacto clínico directo en flujo actual de consulta |
| UI-003 | P1 | Completa el loop de documentación clínica asistida |
| UI-008 | P1 | Habilita configuración profesional mínima |
| UI-004 | P2 | Mejora operación, pero ya existe flujo alternativo |
| UI-005 | P2 | Alto valor, depende de fuentes y reglas externas |
| UI-002 | P2 | Requiere madurez adicional de evidencias/alertas |
| UI-006 | P3 | Contenido útil pero no bloqueante del MVP |
| UI-007 | P3 | Alcance administrativo fuera del núcleo clínico |

## UI-001 - Análisis de estudios con IA

- **Ubicación:** tab `Análisis de EC` (accesible desde `SidebarPanel`).
- **Objetivo:** análisis estructurado de estudios complementarios con sugerencias asistidas.
- **Dependencias:** `ADR-006` diarización + trazabilidad de pipeline.

## UI-002 - Análisis clínico consolidado

- **Ubicación:** tab `Análisis clínico`.
- **Objetivo:** interpretación clínica consolidada, alertas y hallazgos.
- **Dependencias:** `ExtractedActions` estable + evidencia enlazada madura.

## UI-003 - Generación de documentos asistida

- **Ubicación:** `MedicalDocumentsSection` modal de documento.
- **Objetivo:** generar certificados/informes administrativos desde SOAP + transcripción.
- **Dependencias:** orquestador IA para documentos + validación médica (HITL).

## UI-004 - Gestión de pacientes en sidebar

- **Ubicación:** `SidebarPanel` modal `pacientes`.
- **Objetivo:** alta/edición/listado desde sidebar (acceso rápido).
- **Dependencias:** reuso de flujos actuales de `patients`.

## UI-005 - Módulo de fármacos

- **Ubicación:** `SidebarPanel` modales `vademecum`, `interacciones`, `calculadoras`.
- **Objetivo:** consulta de fármacos, chequeo de interacciones y utilidades clínicas.
- **Dependencias:** fuente validada de medicamentos + reglas de interacción.

## UI-006 - Guías y protocolos

- **Ubicación:** `SidebarPanel` modal `guias`.
- **Objetivo:** acceso rápido a guías clínicas y protocolos institucionales.
- **Dependencias:** repositorio/versionado de contenidos.

## UI-007 - Operación del consultorio

- **Ubicación:** `SidebarPanel` modales `agenda`, `turno`, `horarios`, `pagos`.
- **Objetivo:** agenda, turnos, disponibilidad y pagos.
- **Dependencias:** definición de alcance administrativo (fuera de MVP clínico).

## UI-008 - Perfil y preferencias de cuenta

- **Ubicación:** `HeaderUserMenu` modales `Mi perfil` y `Preferencias`.
- **Objetivo:** datos profesionales, matrícula, firma digital, notificaciones e idioma.
- **Dependencias:** modelo de usuario profesional extendido.
