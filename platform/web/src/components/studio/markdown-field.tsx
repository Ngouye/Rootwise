"use client";

import { useRef, useState } from "react";
import { Eye, ImagePlus, Pencil } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/client-api";
import { uploadMedia } from "@/lib/studio";

type MarkdownFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  /** Prévient le formulaire parent qu'un envoi d'image est en cours (pour bloquer l'enregistrement). */
  onUploadingChange?: (uploading: boolean) => void;
};

/**
 * Zone de saisie Markdown du studio : insertion d'images (envoyées sur la plateforme puis
 * référencées à l'endroit du curseur) et aperçu du rendu final, formules et images comprises.
 */
export function MarkdownField({ id, label, value, onChange, rows = 8, required, onUploadingChange }: MarkdownFieldProps) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(false);
  const [upload, setUpload] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function insertImage(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUpload(0);
    onUploadingChange?.(true);
    try {
      const image = await uploadMedia(file, "IMAGE", setUpload);
      const description = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/[[\]]/g, "").trim();
      insertBlock(`![${description || "image"}](/api/public/media/${image.id})`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Envoi impossible.");
    } finally {
      setUpload(null);
      onUploadingChange?.(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  /** L'image forme son propre paragraphe, à l'endroit du curseur (ou à la fin). */
  function insertBlock(block: string) {
    const start = textarea.current?.selectionStart ?? value.length;
    const end = textarea.current?.selectionEnd ?? value.length;
    const before = value.slice(0, start).replace(/\s+$/, "");
    const after = value.slice(end).replace(/^\s+/, "");
    onChange([before, block, after].filter(Boolean).join("\n\n"));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => fileInput.current?.click()} disabled={upload !== null}>
            <ImagePlus aria-hidden /> {upload === null ? "Image" : `Envoi… ${upload} %`}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setPreview(!preview)} aria-pressed={preview}>
            {preview ? <Pencil aria-hidden /> : <Eye aria-hidden />} {preview ? "Modifier" : "Aperçu"}
          </Button>
        </div>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-label="Image à insérer"
        onChange={(event) => insertImage(event.target.files?.[0])}
      />
      {preview ? (
        <div className="min-h-32 rounded-lg border p-4">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-muted-foreground">Rien à afficher.</p>}
        </div>
      ) : (
        <Textarea
          ref={textarea}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          className="font-mono text-sm"
          required={required}
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Images PNG, JPEG ou WebP (5 Mo max.), insérées à l&apos;emplacement du curseur. Syntaxe :{" "}
        <code className="font-mono">![description](adresse &quot;légende facultative&quot;)</code> ; la description est lue
        par les lecteurs d&apos;écran.
      </p>
    </div>
  );
}
