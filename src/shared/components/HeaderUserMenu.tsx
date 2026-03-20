"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Modal } from "@/shared/ui/Modal";

export function HeaderUserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [prefsModal, setPrefsModal] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const initial = (session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "U").toUpperCase();
  const name = session?.user?.name ?? "Usuario";
  const email = session?.user?.email ?? "";

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <>
      <div className="relative flex justify-end min-w-0" ref={wrapRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 max-w-[min(100%,14rem)] sm:max-w-[18rem] rounded-lg pl-1 pr-2 py-1 text-left hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rene-green/60"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Menú de cuenta"
        >
          <span className="w-8 h-8 rounded-full bg-rene-green flex items-center justify-center text-white text-sm font-semibold shrink-0 ring-2 ring-white shadow-sm">
            {initial}
          </span>
          <span className="hidden sm:flex min-w-0 flex-col text-left">
            <span className="text-sm font-semibold text-gray-900 truncate leading-tight">{name}</span>
            {email ? (
              <span className="text-xs text-gray-500 truncate leading-tight">{email}</span>
            ) : null}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-[60] mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2.5 text-left text-sm text-gray-800 hover:bg-rene-aqua/60"
              onClick={() => {
                setOpen(false);
                setProfileModal(true);
              }}
            >
              Mi perfil
            </button>
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2.5 text-left text-sm text-gray-800 hover:bg-rene-aqua/60"
              onClick={() => {
                setOpen(false);
                setPrefsModal(true);
              }}
            >
              Preferencias de cuenta
            </button>
            <div className="my-1 border-t border-gray-100" />
            <a
              role="menuitem"
              href="/api/auth/signout?callbackUrl=/login"
              className="block w-full px-3 py-2.5 text-left text-sm text-gray-800 hover:bg-rene-aqua/60"
              onClick={() => setOpen(false)}
            >
              Cerrar sesión
            </a>
          </div>
        ) : null}
      </div>

      <Modal isOpen={profileModal} onClose={() => setProfileModal(false)} title="Mi perfil">
        <p className="text-sm text-gray-600">
          Aquí podrás editar tus datos profesionales, matrícula y firma digital.{" "}
          <span className="text-gray-500">(Backlog `UI-008`)</span>
        </p>
      </Modal>
      <Modal isOpen={prefsModal} onClose={() => setPrefsModal(false)} title="Preferencias de cuenta">
        <p className="text-sm text-gray-600">
          Notificaciones, idioma y privacidad.{" "}
          <span className="text-gray-500">(Backlog `UI-008`)</span>
        </p>
      </Modal>
    </>
  );
}
