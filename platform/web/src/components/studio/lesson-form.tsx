"use client";

import { useState } from "react";
import { FormAlert } from "@/components/auth/form-alert";
import { MarkdownField } from "@/components/studio/markdown-field";
import { selectClass } from "@/components/studio/new-course-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/client-api";
import { LESSON_TYPE_LABELS, type LessonType } from "@/lib/courses";
import { readVideoDuration, uploadMedia, youtubeId, type StudioLesson } from "@/lib/studio";

export type LessonDraft = Omit<StudioLesson, "id" | "mediaName" | "youtubeId"> & { youtubeUrl: string | null };

type LessonFormProps = {
  initial?: StudioLesson;
  onSubmit: (draft: LessonDraft) => Promise<void>;
  onCancel: () => void;
};

const hasFile = (type: LessonType) => type === "VIDEO" || type === "PDF";

export function LessonForm({ initial, onSubmit, onCancel }: LessonFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<LessonType>(initial?.type ?? "TEXT");
  const [contentMd, setContentMd] = useState(initial?.contentMd ?? "");
  const [media, setMedia] = useState<{ id: number; name: string } | null>(
    initial?.mediaId ? { id: initial.mediaId, name: initial.mediaName ?? "fichier" } : null,
  );
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeId ? `https://www.youtube.com/watch?v=${initial.youtubeId}` : "");
  const [minutes, setMinutes] = useState(initial?.durationSeconds ? String(Math.round(initial.durationSeconds / 60)) : "");
  const [freePreview, setFreePreview] = useState(initial?.freePreview ?? false);
  const [upload, setUpload] = useState<number | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const videoId = youtubeId(youtubeUrl);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      if (type === "VIDEO") {
        const seconds = await readVideoDuration(file);
        if (seconds) setMinutes(String(Math.max(1, Math.round(seconds / 60))));
      }
      setUpload(0);
      const uploaded = await uploadMedia(file, type === "VIDEO" ? "VIDEO" : "PDF", setUpload);
      setMedia({ id: uploaded.id, name: uploaded.originalName });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Envoi impossible.");
    } finally {
      setUpload(null);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onSubmit({
        title,
        type,
        // Pour une vidéo ou un PDF, le Markdown sert de notes affichées sous le support.
        contentMd: contentMd.trim() ? contentMd : null,
        mediaId: hasFile(type) ? (media?.id ?? null) : null,
        youtubeUrl: type === "YOUTUBE" ? youtubeUrl : null,
        durationSeconds: minutes ? Number(minutes) * 60 : null,
        freePreview,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Enregistrement impossible.");
    } finally {
      setPending(false);
    }
  }

  const accept = type === "VIDEO" ? "video/mp4,video/webm" : "application/pdf";
  const ready = { TEXT: contentMd.trim() !== "", YOUTUBE: videoId !== null, VIDEO: media !== null, PDF: media !== null }[type];

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
      {error && <FormAlert>{error}</FormAlert>}
      <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lesson-title">Titre de la leçon</Label>
          <Input id="lesson-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={200} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lesson-type">Type</Label>
          <select
            id="lesson-type"
            className={selectClass}
            value={type}
            onChange={(event) => {
              setType(event.target.value as LessonType);
              setMedia(null);
            }}
          >
            {(Object.keys(LESSON_TYPE_LABELS) as LessonType[]).map((value) => (
              <option key={value} value={value}>
                {LESSON_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasFile(type) && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lesson-file">{type === "VIDEO" ? "Vidéo (MP4 ou WebM, 1 Go max.)" : "Document PDF (50 Mo max.)"}</Label>
          <Input id="lesson-file" type="file" accept={accept} onChange={(event) => onFile(event.target.files?.[0])} disabled={upload !== null} />
          {upload !== null && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={upload} aria-label="Envoi du fichier">
              <div className="h-full bg-primary transition-[width]" style={{ width: `${upload}%` }} />
            </div>
          )}
          {media && <p className="text-xs text-primary">Fichier prêt : {media.name}</p>}
        </div>
      )}

      {type === "YOUTUBE" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lesson-youtube">Lien de la vidéo YouTube</Label>
          <Input
            id="lesson-youtube"
            type="url"
            inputMode="url"
            placeholder="https://www.youtube.com/watch?v=…"
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            required
          />
          <p className={videoId ? "text-xs text-primary" : "text-xs text-muted-foreground"}>
            {videoId
              ? `Vidéo reconnue (${videoId}). Elle reste hébergée par YouTube : elle est intégrée, pas copiée.`
              : "Formats acceptés : youtube.com/watch?v=…, youtu.be/…, youtube.com/embed/…"}
          </p>
        </div>
      )}

      <MarkdownField
        id="lesson-content"
        label={
          type === "TEXT"
            ? "Contenu (Markdown : **gras**, `code`, blocs ```java, formules $a^2$, images)"
            : "Notes sous le support (Markdown, facultatif) : résumé, points clés, crédits"
        }
        value={contentMd}
        onChange={setContentMd}
        rows={type === "TEXT" ? 12 : 5}
        required={type === "TEXT"}
        onUploadingChange={setImageUploading}
      />

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex w-32 flex-col gap-1.5">
          <Label htmlFor="lesson-minutes">Durée (min)</Label>
          <Input id="lesson-minutes" type="number" min={0} max={600} value={minutes} onChange={(event) => setMinutes(event.target.value)} />
        </div>
        <label className="flex items-center gap-2 pb-1.5 text-sm">
          <input type="checkbox" checked={freePreview} onChange={(event) => setFreePreview(event.target.checked)} className="accent-[var(--primary)]" />
          Aperçu gratuit (visible sans inscription)
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending || upload !== null || imageUploading || !ready}>
          {pending ? "Enregistrement…" : "Enregistrer la leçon"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
