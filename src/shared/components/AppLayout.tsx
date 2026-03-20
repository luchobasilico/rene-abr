"use client";

import { useState, useEffect } from "react";
import { SidebarPanel } from "./SidebarPanel";
import { ReneLogo } from "./ReneLogo";
import { HeaderUserMenu } from "./HeaderUserMenu";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      const desktop = window.innerWidth >= 1024;
      setIsMobile(mobile);
      setIsDesktop(desktop);
      setPanelOpen(desktop);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const togglePanel = () => setPanelOpen((o) => !o);
  const closePanel = () => setPanelOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-rene-aqua" style={{ minHeight: "100vh" }}>
      {/* Header fijo */}
      <header
        className="fixed top-0 left-0 right-0 z-50 grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2 sm:px-4 shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur-sm"
        style={{
          height: "3.5rem",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="flex justify-start min-w-[2.75rem]">
          <button
            type="button"
            onClick={togglePanel}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg touch-manipulation"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center min-w-0 pointer-events-none [&>*]:pointer-events-auto">
          <ReneLogo variant="header" />
        </div>

        <div className="flex justify-end min-w-0">
          <HeaderUserMenu />
        </div>
      </header>

      {/* Panel lateral - sin overlay para evitar bloqueo de clics */}
      <SidebarPanel
        isOpen={panelOpen}
        onClose={closePanel}
        onItemClick={isMobile ? closePanel : undefined}
      />

      {/* Contenido principal */}
      <main
        className="flex-1 min-w-0 flex flex-col pt-14"
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          paddingTop: "3.5rem",
          paddingLeft: panelOpen && isDesktop ? "18rem" : 0,
          transition: "padding-left 0.3s ease",
        }}
      >
        {children}
      </main>
    </div>
  );
}
