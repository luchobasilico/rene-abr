# QBI2 Readiness Checklist (pre-integración)

Estado actual: **preparado para integrar**, sin emisión real activa.

## 1) Acuerdo y acceso

- [ ] Contrato/comercial QBI2 firmado.
- [ ] Ambiente habilitado (sandbox/staging/prod).
- [ ] `Bearer token` entregado.
- [ ] `clienteAppId` asignado.

## 2) Configuración técnica

- [ ] Definir variables:
  - `QBI2_ISSUE_ENABLED=false` (mantener en false hasta validación final)
  - `QBI2_BASE_URL`
  - `QBI2_BEARER_TOKEN`
  - `QBI2_CLIENTE_APP_ID`
  - `QBI2_LUGAR_ATENCION`
  - `QBI2_TIMEOUT_MS`
- [ ] Verificar conectividad y timeout operativo.

## 3) Datos obligatorios QBI2

- [ ] Paciente completo: apellido, nombre, tipoDoc, nroDoc, fechaNacimiento, sexo.
- [ ] Médico completo: apellido, nombre, tipoDoc, nroDoc, sexo.
- [ ] Matrícula completa: tipo (`MP`/`MN`), número y provincia si `MP`.
- [ ] Medicamentos con `regNo` o fallback acordado.

## 4) Reglas de seguridad clínica

- [ ] Sin campos obligatorios -> bloquear emisión.
- [ ] Trazabilidad de bloqueo por campo faltante.
- [ ] HITL: validación médica previa a emitir receta.
- [ ] Registro de payload/respuesta para auditoría interna (sin exponer en UI clínica).

## 5) Pruebas antes de activar

- [ ] Casos felices: receta simple y múltiple.
- [ ] Casos de rechazo por validación QBI2.
- [ ] Timeouts y reintentos.
- [ ] Prueba de rollback (sin emisión cuando `QBI2_ISSUE_ENABLED=false`).

## 6) Activación gradual

- [ ] Activar primero en staging.
- [ ] Monitorear errores de integración y latencia.
- [ ] Activar en producción por cohortes.
- [ ] Revisar métricas la primera semana.

---

Referencia funcional QBI2:
[Generar Receta - QBI2](https://innovamed.atlassian.net/wiki/spaces/DQBI2/pages/2086174790/Generar+Receta#Obligatorios)
