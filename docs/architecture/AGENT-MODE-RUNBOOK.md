# Runbook de Agent Mode

## Modelo operativo

El orquestador clínico se ejecuta en modo determinístico con reglas explícitas de activación por agente.
No se habilitan modos dinámicos/blackbox para preservar trazabilidad clínica.

## Parámetros sugeridos por agente

| Agente | Timeout ms | Retries |
| --- | ---: | ---: |
| SOAP | 40000 | 1 |
| Medication | 25000 | 1 |
| Studies | 25000 | 1 |
| Documents | 25000 | 1 |
| Followups | 20000 | 1 |

## Variables de entorno

```env
AGENT_SOAP_TIMEOUT_MS=40000
AGENT_SOAP_RETRIES=1
AGENT_MEDICATION_TIMEOUT_MS=25000
AGENT_MEDICATION_RETRIES=1
AGENT_STUDIES_TIMEOUT_MS=25000
AGENT_STUDIES_RETRIES=1
AGENT_DOCUMENTS_TIMEOUT_MS=25000
AGENT_DOCUMENTS_RETRIES=1
AGENT_FOLLOWUPS_TIMEOUT_MS=20000
AGENT_FOLLOWUPS_RETRIES=1
```

## Reglas de activación determinística

- Si se detectan patrones de prescripción, se ejecuta `MedicationAgent`.
- Si se detectan patrones de estudios/órdenes, se ejecuta `StudiesAgent`.
- Si se detectan patrones documentales, se ejecuta `DocumentsAgent`.
- Si se detectan patrones de seguimiento/control, se ejecuta `FollowupsAgent`.

Detalle formal de reglas: `docs/architecture/ACTION-AGENT-RULES.md`.
