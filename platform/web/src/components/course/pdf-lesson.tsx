"use client";

import dynamic from "next/dynamic";

/** pdf.js ne fonctionne que dans le navigateur : chargement différé, sans rendu serveur. */
const PdfViewer = dynamic(() => import("@/components/course/pdf-viewer"), {
  ssr: false,
  loading: () => <p className="p-8 text-center text-sm text-muted-foreground">Chargement de la visionneuse…</p>,
});

export function PdfLesson({ src, filename }: { src: string; filename: string }) {
  return <PdfViewer src={src} filename={filename} />;
}
