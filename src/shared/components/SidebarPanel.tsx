"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/shared/ui/Modal";
import { SidebarMenuIcon, type SidebarIconName } from "@/shared/components/sidebarIcons";
import { QuickRecipesOrdersModal } from "@/features/consultation/QuickRecipesOrdersModal";

interface SidebarPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onItemClick?: () => void;
}

interface PanelStats {
  consultations_today: number;
  total_patients: number;
}

type MenuTone = "primary" | "ai" | "soft" | "neutral";

interface MenuItem {
  label: string;
  icon: SidebarIconName;
  action: () => void;
}

interface MenuGroup {
  section: string;
  tone: MenuTone;
  items: MenuItem[];
}

const TONE_CARD: Record<MenuTone, string> = {
  primary:
    "border border-rene-aquaDark/35 border-l-[3px] border-l-rene-green bg-white shadow-sm",
  ai: "border border-rene-aquaDark/35 border-l-[3px] border-l-rene-brandDeep bg-white/95 shadow-sm",
  soft: "border border-rene-aquaDark/30 border-l-[3px] border-l-rene-brand bg-white/90",
  neutral: "border border-rene-aquaDark/25 border-l-[3px] border-l-gray-400 bg-white/85",
};

const TONE_DOT: Record<MenuTone, string> = {
  primary: "bg-rene-green",
  ai: "bg-rene-brandDeep",
  soft: "bg-rene-brand",
  neutral: "bg-gray-400",
};

export function SidebarPanel({ isOpen, onClose, onItemClick }: SidebarPanelProps) {
  const router = useRouter();
  const [stats, setStats] = useState<PanelStats>({ consultations_today: 0, total_patients: 0 });
  const [openModal, setOpenModal] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/panel-stats");
      const data = await res.json();
      if (data.success) {
        setStats({
          consultations_today: data.consultations_today ?? 0,
          total_patients: data.total_patients ?? 0,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleItemClick = (action: () => void) => {
    action();
    onItemClick?.();
  };

  const openStubModal = (key: string) => {
    setOpenModal(key);
  };

  const closeModal = () => setOpenModal(null);

  const menuItems: MenuGroup[] = [
    {
      section: "Principal",
      tone: "primary",
      items: [
        {
          label: "Nueva Nota Clínica",
          icon: "note",
          action: () => {
            router.push("/");
            onClose();
          },
        },
        {
          label: "Consultas de hoy",
          icon: "consultas",
          action: () => {
            router.push("/dashboard?today=1");
            onClose();
          },
        },
      ],
    },
    {
      section: "Redactar con IA",
      tone: "ai",
      items: [
        {
          label: "Recetas y Órdenes",
          icon: "recetas",
          action: () => openStubModal("recetas"),
        },
        {
          label: "Documentos médicos",
          icon: "documentos",
          action: () => {
            router.push("/dashboard?today=1&open=documentos");
            onClose();
          },
        },
      ],
    },
    {
      section: "Estudios con IA",
      tone: "ai",
      items: [
        {
          label: "Imágenes, laboratorio, dermatología, cardiológico",
          icon: "estudios",
          action: () => {
            router.push("/dashboard?today=1&open=analisis_ec");
            onClose();
          },
        },
      ],
    },
    {
      section: "Pacientes",
      tone: "soft",
      items: [{ label: "Gestionar pacientes", icon: "pacientes", action: () => openStubModal("pacientes") }],
    },
    {
      section: "Fármacos",
      tone: "soft",
      items: [
        { label: "Vademécum", icon: "vademecum", action: () => openStubModal("vademecum") },
        { label: "Interacciones medicamentosas", icon: "interacciones", action: () => openStubModal("interacciones") },
        { label: "Calculadoras médicas", icon: "calculadoras", action: () => openStubModal("calculadoras") },
      ],
    },
    {
      section: "Guías y Protocolos",
      tone: "neutral",
      items: [{ label: "Ver guías y protocolos", icon: "guias", action: () => openStubModal("guias") }],
    },
    {
      section: "Consultorio",
      tone: "neutral",
      items: [
        { label: "Agenda de hoy", icon: "agenda", action: () => openStubModal("agenda") },
        { label: "Programar nuevo turno", icon: "turno", action: () => openStubModal("turno") },
        { label: "Configurar horarios", icon: "horarios", action: () => openStubModal("horarios") },
        { label: "Gestión de pagos", icon: "pagos", action: () => openStubModal("pagos") },
      ],
    },
  ];

  return (
    <>
      <aside
        className="fixed top-0 left-0 z-40 h-full w-72 flex flex-col shadow-xl border-r border-rene-aquaDark/60"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 40,
          height: "100vh",
          width: "18rem",
          backgroundColor: "#f4fbfc",
          borderRight: "1px solid rgba(207,234,237,0.9)",
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-out",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <div className="px-3 pt-2 pb-3 border-b border-rene-aquaDark/35 shrink-0 bg-gradient-to-b from-white via-white to-rene-brand/10 shadow-[0_1px_0_rgba(207,234,237,0.8)]">
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-white/90"
              aria-label="Cerrar panel"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
          <div className="flex rounded-xl border border-rene-aquaDark/40 bg-white shadow-sm divide-x divide-rene-aquaDark/25 overflow-hidden text-center">
            <div className="flex-1 py-2.5 px-2 min-w-0">
              <p className="text-xs font-medium text-gray-600 leading-tight mb-0.5">Consultas hoy</p>
              <p className="text-2xl font-bold text-rene-greenDark tabular-nums leading-none tracking-tight">
                {stats.consultations_today}
              </p>
            </div>
            <div className="flex-1 py-2.5 px-2 min-w-0">
              <p className="text-xs font-medium text-gray-600 leading-tight mb-0.5">Pacientes</p>
              <p className="text-2xl font-bold text-rene-greenDark tabular-nums leading-none tracking-tight">
                {stats.total_patients}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain py-2 px-2 pb-4 [scrollbar-gutter:stable] space-y-3">
          {menuItems.map((group) => (
            <div key={group.section} className={`rounded-lg p-1.5 ${TONE_CARD[group.tone]}`}>
              <div className="flex items-center gap-2 px-2 pb-1.5 mb-1 border-b border-rene-aquaDark/20">
                <span className={`h-2 w-2 rounded-full shrink-0 ${TONE_DOT[group.tone]}`} aria-hidden />
                <h3 className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  {group.section}
                </h3>
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item.action)}
                      className="group flex w-full gap-2.5 items-start rounded-md px-2 py-2 text-left text-sm text-gray-800 transition-colors hover:bg-rene-brand/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-rene-green/50"
                    >
                      <span className="mt-0.5 opacity-90 group-hover:opacity-100">
                        <SidebarMenuIcon name={item.icon} />
                      </span>
                      <span className="min-w-0 flex-1 leading-snug font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <QuickRecipesOrdersModal isOpen={openModal === "recetas"} onClose={closeModal} />
      <Modal isOpen={openModal === "pacientes"} onClose={closeModal} title="Gestionar pacientes">
        <p className="text-gray-600">Backlog `UI-004`.</p>
      </Modal>
      <Modal isOpen={openModal === "vademecum"} onClose={closeModal} title="Vademécum">
        <p className="text-gray-600">Backlog `UI-005`.</p>
      </Modal>
      <Modal isOpen={openModal === "interacciones"} onClose={closeModal} title="Interacciones medicamentosas">
        <p className="text-gray-600">Backlog `UI-005`.</p>
      </Modal>
      <Modal isOpen={openModal === "calculadoras"} onClose={closeModal} title="Calculadoras médicas">
        <p className="text-gray-600">Backlog `UI-005`.</p>
      </Modal>
      <Modal isOpen={openModal === "guias"} onClose={closeModal} title="Guías y Protocolos">
        <p className="text-gray-600">Backlog `UI-006`.</p>
      </Modal>
      <Modal isOpen={openModal === "agenda"} onClose={closeModal} title="Agenda de hoy">
        <p className="text-gray-600">Backlog `UI-007`.</p>
      </Modal>
      <Modal isOpen={openModal === "turno"} onClose={closeModal} title="Programar nuevo turno">
        <p className="text-gray-600">Backlog `UI-007`.</p>
      </Modal>
      <Modal isOpen={openModal === "horarios"} onClose={closeModal} title="Configurar horarios">
        <p className="text-gray-600">Backlog `UI-007`.</p>
      </Modal>
      <Modal isOpen={openModal === "pagos"} onClose={closeModal} title="Gestión de pagos">
        <p className="text-gray-600">Backlog `UI-007`.</p>
      </Modal>
    </>
  );
}
