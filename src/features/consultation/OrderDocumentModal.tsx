"use client";

import { Modal } from "@/shared/ui/Modal";

interface Prescription {
  drug: string;
  dose: string;
  frequency: string;
  route: string;
  duration: string;
}

interface MedicalOrder {
  type: string;
  description: string;
}

interface OrderDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "prescription" | "order";
  prescription?: Prescription;
  medicalOrder?: MedicalOrder;
}

function getTypeLabel(type: string): string {
  return type === "lab" ? "Orden de laboratorio" : type === "imaging" ? "Orden de estudios por imágenes" : "Orden de derivación";
}

export function OrderDocumentModal({
  isOpen,
  onClose,
  type,
  prescription,
  medicalOrder,
}: OrderDocumentModalProps) {
  const title = type === "prescription" ? "Receta médica" : medicalOrder ? getTypeLabel(medicalOrder.type) : "Orden";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {type === "prescription" && prescription && (
        <div className="text-sm space-y-4">
          <div className="border-b border-gray-200 pb-2">
            <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">Receta médica</h4>
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Fármaco:</span>
              <span className="font-medium">{prescription.drug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Dosis:</span>
              <span>{prescription.dose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Frecuencia:</span>
              <span>{prescription.frequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vía:</span>
              <span>{prescription.route}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duración:</span>
              <span>{prescription.duration}</span>
            </div>
          </div>
        </div>
      )}
      {type === "order" && medicalOrder && (
        <div className="text-sm space-y-4">
          <div className="border-b border-gray-200 pb-2">
            <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {getTypeLabel(medicalOrder.type)}
            </h4>
          </div>
          <div className="whitespace-pre-wrap">{medicalOrder.description}</div>
        </div>
      )}
    </Modal>
  );
}
