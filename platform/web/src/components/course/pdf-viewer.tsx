"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

/**
 * Visionneuse PDF intégrée (pdf.js) : même rendu sur tous les navigateurs, mobiles compris.
 * Le fichier est lu sur la même origine que le site : le cookie de session l'autorise.
 */
export default function PdfViewer({ src, filename }: { src: string; filename: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Page précédente" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft />
          </Button>
          <span className="min-w-20 text-center font-mono text-xs">
            {pages ? `${page} / ${pages}` : "…"}
          </span>
          <Button variant="ghost" size="icon-sm" aria-label="Page suivante" disabled={page >= pages} onClick={() => setPage(page + 1)}>
            <ChevronRight />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Réduire" disabled={zoom <= 0.5} onClick={() => setZoom(zoom - 0.25)}>
            <ZoomOut />
          </Button>
          <span className="w-12 text-center font-mono text-xs">{Math.round(zoom * 100)} %</span>
          <Button variant="ghost" size="icon-sm" aria-label="Agrandir" disabled={zoom >= 2} onClick={() => setZoom(zoom + 0.25)}>
            <ZoomIn />
          </Button>
          <a href={src} download={filename} className="ml-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Download className="size-3.5" aria-hidden /> Télécharger
          </a>
        </div>
      </div>
      <div ref={container} className="overflow-auto rounded-xl border bg-muted/30">
        <Document
          file={src}
          onLoadSuccess={({ numPages }) => setPages(numPages)}
          loading={<p className="p-8 text-center text-sm text-muted-foreground">Chargement du PDF…</p>}
          error={<p className="p-8 text-center text-sm text-destructive">Impossible d&apos;afficher ce PDF.</p>}
        >
          <Page pageNumber={page} width={Math.max(280, width) * zoom} className="mx-auto" />
        </Document>
      </div>
    </div>
  );
}
