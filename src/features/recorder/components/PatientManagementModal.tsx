import type { RefObject } from "react";
import { Modal } from "@/shared/ui/Modal";
import type { AddPatientOption, PatientModalView, PatientOption } from "../types";

interface PatientManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientModalView: PatientModalView;
  setPatientModalView: (view: PatientModalView) => void;
  addPatientOption: AddPatientOption;
  setAddPatientOption: (option: AddPatientOption) => void;
  patientSearch: string;
  setPatientSearch: (value: string) => void;
  isLoadingPatients: boolean;
  filteredPatients: PatientOption[];
  selectedPatient: PatientOption | null;
  onSelectPatient: (patient: PatientOption) => void;
  newPatientName: string;
  setNewPatientName: (value: string) => void;
  newPatientDocument: string;
  setNewPatientDocument: (value: string) => void;
  newPatientBirthDate: string;
  setNewPatientBirthDate: (value: string) => void;
  newPatientSex: string;
  setNewPatientSex: (value: string) => void;
  newPatientCoverage: string;
  setNewPatientCoverage: (value: string) => void;
  newPatientAffiliateNumber: string;
  setNewPatientAffiliateNumber: (value: string) => void;
  newPatientPlan: string;
  setNewPatientPlan: (value: string) => void;
  newPatientPhone: string;
  setNewPatientPhone: (value: string) => void;
  newPatientEmail: string;
  setNewPatientEmail: (value: string) => void;
  newPatientAddress: string;
  setNewPatientAddress: (value: string) => void;
  invitePhone: string;
  setInvitePhone: (value: string) => void;
  qrRawValue: string;
  setQrRawValue: (value: string) => void;
  qrStatus: string | null;
  videoRef: RefObject<HTMLVideoElement>;
  onParseQrPayload: (raw: string) => void;
  onSendWhatsappInvite: () => void;
  onCreatePatient: () => void;
  isCreatingPatient: boolean;
}

export function PatientManagementModal(props: PatientManagementModalProps) {
  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs border transition ${
      active ? "border-rene-green bg-rene-aqua/50" : "border-gray-200 hover:bg-gray-50"
    }`;

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="Gestión de paciente">
      {props.patientModalView === "choose" && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => props.setPatientModalView("existing")}
            className="w-full text-left px-4 py-3 rounded-xl border border-rene-aquaDark hover:bg-rene-aqua/40 transition"
          >
            Seleccionar paciente existente
          </button>
          <button
            type="button"
            onClick={() => {
              props.setPatientModalView("add");
              props.setAddPatientOption("manual");
            }}
            className="w-full text-left px-4 py-3 rounded-xl border border-rene-aquaDark hover:bg-rene-aqua/40 transition"
          >
            Agregar nuevo paciente
          </button>
        </div>
      )}

      {props.patientModalView === "existing" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => props.setPatientModalView("choose")}
              className="px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50"
            >
              ←
            </button>
            <input
              value={props.patientSearch}
              onChange={(e) => props.setPatientSearch(e.target.value)}
              placeholder="Buscar por nombre o DNI"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark"
            />
          </div>
          <div className="max-h-64 overflow-auto space-y-2">
            {props.isLoadingPatients && <p className="text-sm text-gray-500">Cargando pacientes...</p>}
            {!props.isLoadingPatients && props.filteredPatients.length === 0 && (
              <p className="text-sm text-gray-500">No hay pacientes para mostrar.</p>
            )}
            {props.filteredPatients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => props.onSelectPatient(patient)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                  props.selectedPatient?.id === patient.id
                    ? "border-rene-green bg-rene-aqua/40"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium text-gray-800">{patient.name}</p>
                <p className="text-xs text-gray-500">
                  {patient.document ? `DNI: ${patient.document}` : "Sin DNI"}
                  {patient.coverage ? ` · ${patient.coverage}` : ""}
                  {patient.affiliateNumber ? ` · Afiliado: ${patient.affiliateNumber}` : ""}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {props.patientModalView === "add" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => props.setPatientModalView("choose")}
              className="px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50"
            >
              ←
            </button>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => props.setAddPatientOption("manual")} className={tabClass(props.addPatientOption === "manual")}>
                Manualmente
              </button>
              <button type="button" onClick={() => props.setAddPatientOption("whatsapp")} className={tabClass(props.addPatientOption === "whatsapp")}>
                Invitar por WhatsApp
              </button>
              <button type="button" onClick={() => props.setAddPatientOption("qr")} className={tabClass(props.addPatientOption === "qr")}>
                Escanear QR
              </button>
            </div>
          </div>

          {props.addPatientOption === "manual" && (
            <div className="space-y-3">
              <input value={props.newPatientName} onChange={(e) => props.setNewPatientName(e.target.value)} placeholder="Nombre y apellido *" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark" />
              <input value={props.newPatientDocument} onChange={(e) => props.setNewPatientDocument(e.target.value)} placeholder="DNI *" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark" />
              <input type="date" value={props.newPatientBirthDate} onChange={(e) => props.setNewPatientBirthDate(e.target.value)} placeholder="Fecha de nacimiento *" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark" />
              <input value={props.newPatientSex} onChange={(e) => props.setNewPatientSex(e.target.value)} placeholder="Sexo *" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark" />
              <input value={props.newPatientCoverage} onChange={(e) => props.setNewPatientCoverage(e.target.value)} placeholder="Cobertura de salud *" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark" />
              <input value={props.newPatientAffiliateNumber} onChange={(e) => props.setNewPatientAffiliateNumber(e.target.value)} placeholder="N° de afiliado *" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark" />
              <input value={props.newPatientPlan} onChange={(e) => props.setNewPatientPlan(e.target.value)} placeholder="Plan (opcional)" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark" />
              <input value={props.newPatientPhone} onChange={(e) => props.setNewPatientPhone(e.target.value)} placeholder="WhatsApp *" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark" />
              <input type="email" value={props.newPatientEmail} onChange={(e) => props.setNewPatientEmail(e.target.value)} placeholder="Email *" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark" />
              <input value={props.newPatientAddress} onChange={(e) => props.setNewPatientAddress(e.target.value)} placeholder="Domicilio (opcional)" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark" />
              <button type="button" disabled={props.isCreatingPatient} onClick={props.onCreatePatient} className="w-full px-4 py-2 rounded-lg bg-rene-green text-white font-medium hover:bg-rene-greenDark disabled:bg-gray-400 transition">
                {props.isCreatingPatient ? "Guardando..." : "Guardar paciente"}
              </button>
            </div>
          )}

          {props.addPatientOption === "whatsapp" && (
            <div className="space-y-3">
              <input value={props.invitePhone} onChange={(e) => props.setInvitePhone(e.target.value)} placeholder="Teléfono con código de país" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark" />
              <button type="button" onClick={props.onSendWhatsappInvite} className="w-full px-4 py-2 rounded-lg border border-rene-aquaDark text-gray-700 hover:bg-rene-aqua/40 transition">
                Enviar invitación por WhatsApp
              </button>
              <p className="text-xs text-gray-500">
                Se solicitarán todos los datos del alta (incluye cobertura, afiliado, WhatsApp y email).
              </p>
            </div>
          )}

          {props.addPatientOption === "qr" && (
            <div className="space-y-3">
              <video ref={props.videoRef} className="w-full rounded-lg border border-gray-200 bg-black/70" muted playsInline />
              {props.qrStatus ? <p className="text-xs text-gray-600">{props.qrStatus}</p> : null}
              <textarea
                value={props.qrRawValue}
                onChange={(e) => {
                  props.setQrRawValue(e.target.value);
                  props.onParseQrPayload(e.target.value);
                }}
                rows={3}
                placeholder="Si tenés el contenido del QR, pegalo acá."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rene-aquaDark"
              />
              <p className="text-xs text-gray-500">
                Soporta JSON {"{\"name\":\"...\",\"document\":\"...\",\"birthDate\":\"YYYY-MM-DD\",\"sex\":\"...\",\"coverage\":\"...\",\"affiliateNumber\":\"...\",\"plan\":\"...\",\"phone\":\"...\",\"email\":\"...\",\"address\":\"...\"}"}.
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

