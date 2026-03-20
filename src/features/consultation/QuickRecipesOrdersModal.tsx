"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { OrderDocumentModal } from "@/features/consultation/OrderDocumentModal";

interface Prescription {
  id: string;
  drug: string;
  dose: string;
  frequency: string;
  route: string;
  duration: string;
}

interface MedicalOrder {
  id: string;
  type: "lab" | "imaging" | "referral";
  description: string;
}

interface OrderListItem {
  id: string;
  kind: "prescription" | "order";
  typeLabel: string;
  label: string;
  content: string;
  prescription?: {
    drug: string;
    dose: string;
    frequency: string;
    route: string;
    duration: string;
  };
  medicalOrder?: {
    type: string;
    description: string;
  };
}

interface QuickRecipesOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function QuickRecipesOrdersModal({ isOpen, onClose }: QuickRecipesOrdersModalProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicalOrders, setMedicalOrders] = useState<MedicalOrder[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalItem, setModalItem] = useState<OrderListItem | null>(null);

  const [rxForm, setRxForm] = useState({
    drug: "",
    dose: "",
    frequency: "",
    route: "",
    duration: "",
  });
  const [orderForm, setOrderForm] = useState({
    type: "lab",
    description: "",
  });

  const items = useMemo<OrderListItem[]>(() => {
    const next: OrderListItem[] = [];
    prescriptions.forEach((p) => {
      next.push({
        id: p.id,
        kind: "prescription",
        typeLabel: "Receta",
        label: p.drug,
        content: `Receta: ${p.drug} ${p.dose} ${p.frequency} ${p.route} - ${p.duration}`,
        prescription: {
          drug: p.drug,
          dose: p.dose,
          frequency: p.frequency,
          route: p.route,
          duration: p.duration,
        },
      });
    });
    medicalOrders.forEach((o) => {
      const typeLabel = o.type === "lab" ? "Laboratorio" : o.type === "imaging" ? "Imagen" : "Derivación";
      next.push({
        id: o.id,
        kind: "order",
        typeLabel,
        label: o.description,
        content: `${typeLabel}\n${o.description}`,
        medicalOrder: {
          type: o.type,
          description: o.description,
        },
      });
    });
    return next;
  }, [medicalOrders, prescriptions]);

  const selectedCount = selectedIds.size;

  const addRecipe = () => {
    if (!rxForm.drug.trim() || !rxForm.dose.trim()) return;
    setPrescriptions((prev) => [...prev, { id: createId(), ...rxForm }]);
    setRxForm({ drug: "", dose: "", frequency: "", route: "", duration: "" });
  };

  const addOrder = () => {
    if (!orderForm.description.trim()) return;
    setMedicalOrders((prev) => [...prev, { id: createId(), ...orderForm }]);
    setOrderForm({ type: "lab", description: "" });
  };

  const removeRecipe = (id: string) => setPrescriptions((prev) => prev.filter((item) => item.id !== id));
  const removeOrder = (id: string) => setMedicalOrders((prev) => prev.filter((item) => item.id !== id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sendWhatsApp = () => {
    const selected = items.filter((i) => selectedIds.has(i.id));
    const text = selected.map((i) => i.content).join("\n\n");
    if (!text) return;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const clearAll = () => {
    setPrescriptions([]);
    setMedicalOrders([]);
    setSelectedIds(new Set());
    setModalItem(null);
    setRxForm({ drug: "", dose: "", frequency: "", route: "", duration: "" });
    setOrderForm({ type: "lab", description: "" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recetas y Órdenes médicas">
      <div className="space-y-4">
        <div className="rounded-lg border border-rene-aquaDark/35 bg-rene-aqua/20 p-3">
          <h4 className="text-sm font-semibold text-rene-greenDark mb-2">Cargar receta</h4>
          <div className="space-y-2">
            <input
              value={rxForm.drug}
              onChange={(e) => setRxForm((p) => ({ ...p, drug: e.target.value }))}
              placeholder="Fármaco"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={rxForm.dose}
                onChange={(e) => setRxForm((p) => ({ ...p, dose: e.target.value }))}
                placeholder="Dosis"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                value={rxForm.frequency}
                onChange={(e) => setRxForm((p) => ({ ...p, frequency: e.target.value }))}
                placeholder="Frecuencia"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                value={rxForm.route}
                onChange={(e) => setRxForm((p) => ({ ...p, route: e.target.value }))}
                placeholder="Vía"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                value={rxForm.duration}
                onChange={(e) => setRxForm((p) => ({ ...p, duration: e.target.value }))}
                placeholder="Duración"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={addRecipe}
              className="w-full rounded-lg bg-rene-green px-3 py-2 text-sm font-medium text-white hover:bg-rene-greenDark"
            >
              Agregar receta
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-rene-aquaDark/35 bg-rene-aqua/20 p-3">
          <h4 className="text-sm font-semibold text-rene-greenDark mb-2">Cargar orden médica</h4>
          <div className="space-y-2">
            <select
              value={orderForm.type}
              onChange={(e) =>
                setOrderForm((p) => ({ ...p, type: e.target.value as MedicalOrder["type"] }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="lab">Laboratorio</option>
              <option value="imaging">Imagenología</option>
              <option value="referral">Derivación</option>
            </select>
            <textarea
              value={orderForm.description}
              onChange={(e) => setOrderForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Descripción de la orden"
              className="min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addOrder}
              className="w-full rounded-lg bg-rene-green px-3 py-2 text-sm font-medium text-white hover:bg-rene-greenDark"
            >
              Agregar orden
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">Sin estudios ni medicación indicada.</p>
        ) : (
          <div className="space-y-3">
            {prescriptions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-rene-greenDark mb-2">Medicación</h4>
                <ul className="space-y-1">
                  {prescriptions.map((p) => {
                    const item = items.find((it) => it.id === p.id);
                    if (!item) return null;
                    return (
                      <OrderRow
                        key={item.id}
                        item={item}
                        selected={selectedIds.has(item.id)}
                        onToggle={() => toggleSelect(item.id)}
                        onClick={() => setModalItem(item)}
                        onRemove={() => removeRecipe(item.id)}
                      />
                    );
                  })}
                </ul>
              </div>
            )}

            {medicalOrders.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-rene-greenDark mb-2">Estudios / Órdenes</h4>
                <ul className="space-y-1">
                  {medicalOrders.map((o) => {
                    const item = items.find((it) => it.id === o.id);
                    if (!item) return null;
                    return (
                      <OrderRow
                        key={item.id}
                        item={item}
                        selected={selectedIds.has(item.id)}
                        onToggle={() => toggleSelect(item.id)}
                        onClick={() => setModalItem(item)}
                        onRemove={() => removeOrder(item.id)}
                      />
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-rene-aquaDark/40">
          <button
            type="button"
            onClick={clearAll}
            disabled={items.length === 0}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={sendWhatsApp}
            disabled={selectedCount === 0}
            className="rounded-lg bg-rene-green px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Enviar por WhatsApp {selectedCount > 0 ? `(${selectedCount})` : ""}
          </button>
        </div>
      </div>

      <OrderDocumentModal
        isOpen={!!modalItem}
        onClose={() => setModalItem(null)}
        type={modalItem?.kind ?? "order"}
        prescription={modalItem?.prescription}
        medicalOrder={modalItem?.medicalOrder}
      />
    </Modal>
  );
}

function OrderRow({
  item,
  selected,
  onToggle,
  onClick,
  onRemove,
}: {
  item: OrderListItem;
  selected: boolean;
  onToggle: () => void;
  onClick: () => void;
  onRemove: () => void;
}) {
  return (
    <li
      onClick={onClick}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-rene-aqua/50 cursor-pointer border border-transparent hover:border-rene-aquaDark/40 transition"
    >
      <span className="flex-1 min-w-0 text-sm">
        <span className="font-medium text-gray-600">{item.typeLabel}:</span>{" "}
        <span className="text-gray-800">{item.label}</span>
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`shrink-0 mt-0.5 w-11 h-6 rounded-full transition flex items-center ${
          selected ? "bg-rene-green justify-end" : "bg-rene-aquaDark/50 justify-start"
        }`}
        role="switch"
        aria-checked={selected}
        aria-label={selected ? "Desmarcar para excluir del envío" : "Marcar para incluir en el envío"}
      >
        <span className="block w-5 h-5 bg-white rounded-full shadow-sm mx-0.5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-xs text-red-600 hover:underline"
        aria-label="Quitar ítem"
      >
        Quitar
      </button>
    </li>
  );
}
