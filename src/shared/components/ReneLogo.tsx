"use client";

import Image from "next/image";

interface ReneLogoProps {
  /** header: barra superior · compact: drawer · full: login/registro */
  variant?: "header" | "compact" | "full";
  /** Alineación del bloque (drawer suele usar start). */
  align?: "center" | "start";
  className?: string;
}

/**
 * Logo oficial RENÉ: wordmark en header (`/public/logo-header.png`), resto en `/public/logo.png`.
 */
export function ReneLogo({ variant = "full", align = "center", className = "" }: ReneLogoProps) {
  const isHeader = variant === "header";
  const isCompact = variant === "compact";

  if (isHeader) {
    return (
      <div
        className={`flex justify-center items-center ${className}`}
        role="img"
        aria-label="RENÉ"
      >
        <Image
          src="/logo-header.png"
          alt="RENÉ"
          width={240}
          height={48}
          priority
          className="h-8 sm:h-9 w-auto max-w-[min(55vw,200px)] object-contain object-center"
        />
      </div>
    );
  }

  const dims = isCompact
    ? { w: 220, h: 110, imgClass: "h-auto w-full max-w-[220px] object-contain", priority: false }
    : { w: 320, h: 160, imgClass: "h-auto w-full max-w-[min(100%,320px)] object-contain", priority: false };

  return (
    <div
      className={`flex flex-col justify-center ${align === "start" ? "items-start" : "items-center"} ${className}`}
      role="img"
      aria-label="RENÉ — La IA al servicio de la Salud"
    >
      <Image
        src="/logo.png"
        alt="RENÉ — La IA al servicio de la Salud"
        width={dims.w}
        height={dims.h}
        priority={dims.priority}
        className={dims.imgClass}
      />
    </div>
  );
}
