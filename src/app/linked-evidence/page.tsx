"use client";

import { Suspense } from "react";
import { LinkedEvidenceViewer } from "@/features/linked-evidence/LinkedEvidenceViewer";

export default function LinkedEvidencePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando…</div>}>
      <LinkedEvidenceViewer />
    </Suspense>
  );
}
