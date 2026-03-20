import type { ReactNode, SVGProps } from "react";

const base = "w-4 h-4 shrink-0 text-rene-green";

function Svg(props: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={base}
      {...props}
    />
  );
}

export type SidebarIconName =
  | "note"
  | "consultas"
  | "recetas"
  | "documentos"
  | "estudios"
  | "pacientes"
  | "vademecum"
  | "interacciones"
  | "calculadoras"
  | "guias"
  | "agenda"
  | "turno"
  | "horarios"
  | "pagos"
  | "perfil";

export function SidebarMenuIcon({ name }: { name: SidebarIconName }) {
  switch (name) {
    case "note":
      return (
        <Svg>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M12 18v-6M9 15h6" />
        </Svg>
      );
    case "consultas":
      return (
        <Svg>
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </Svg>
      );
    case "recetas":
      return (
        <Svg>
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
          <path d="M9 14h6M12 11v6" />
        </Svg>
      );
    case "documentos":
      return (
        <Svg>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </Svg>
      );
    case "estudios":
      return (
        <Svg>
          <path d="M9 2v6l-4 9a4 4 0 0 0 3.5 5.5h7a4 4 0 0 0 3.5-5.5l-4-9V2" />
          <path d="M7 10h10" />
        </Svg>
      );
    case "pacientes":
      return (
        <Svg>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </Svg>
      );
    case "vademecum":
      return (
        <Svg>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2 0 0 1 4 19.5v-15A2.5 2 0 0 1 6.5 2z" />
        </Svg>
      );
    case "interacciones":
      return (
        <Svg>
          <path d="M8 3L4 7l4 4M16 21l4-4-4-4M4 7h12M20 17H8" />
        </Svg>
      );
    case "calculadoras":
      return (
        <Svg>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 10h8M9 14h1M12 14h1M15 14h1M9 17h1M12 17h1M15 17h1" />
        </Svg>
      );
    case "guias":
      return (
        <Svg>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </Svg>
      );
    case "agenda":
      return (
        <Svg>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </Svg>
      );
    case "turno":
      return (
        <Svg>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18M12 16v-4M12 16h3" />
        </Svg>
      );
    case "horarios":
      return (
        <Svg>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </Svg>
      );
    case "pagos":
      return (
        <Svg>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </Svg>
      );
    case "perfil":
      return (
        <Svg>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </Svg>
      );
    default:
      return (
        <Svg>
          <circle cx="12" cy="12" r="10" />
        </Svg>
      );
  }
}
