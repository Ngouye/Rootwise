import { ApiError } from "@/lib/client-api";
import type { LessonType, Level, QuestionKind } from "@/lib/courses";

export type StudioCourseSummary = {
  id: number;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  level: Level;
  updatedAt: string;
  chapterCount: number;
  lessonCount: number;
};

export type StudioLesson = {
  id: number;
  title: string;
  type: LessonType;
  contentMd: string | null;
  mediaId: number | null;
  mediaName: string | null;
  youtubeId: string | null;
  durationSeconds: number | null;
  freePreview: boolean;
};

export type StudioChapter = { id: number; title: string; lessons: StudioLesson[] };

export type StudioCourse = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  descriptionMd: string | null;
  level: Level;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tagSlugs: string[];
  coverMediaId: number | null;
  coverUrl: string | null;
  authorUsername: string | null;
  chapters: StudioChapter[];
  publishProblems: string[];
};

export type StudioChoice = { labelMd: string; correct: boolean };
export type StudioQuestion = { kind: QuestionKind; promptMd: string; explanationMd: string; points: number; choices: StudioChoice[] };
export type StudioQuiz = { passScorePct: number; maxAttempts: number | null; questions: StudioQuestion[] };

export type UploadedMedia = { id: number; kind: "VIDEO" | "PDF" | "IMAGE"; originalName: string; mimeType: string; sizeBytes: number };

/**
 * Envoi d'un fichier au studio avec suivi de progression (XMLHttpRequest : fetch ne sait pas
 * suivre un envoi). Même origine que le site : cookie de session + jeton CSRF.
 */
export function uploadMedia(file: File, kind: UploadedMedia["kind"], onProgress: (pct: number) => void): Promise<UploadedMedia> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    const request = new XMLHttpRequest();
    request.open("POST", "/api/studio/media");
    request.withCredentials = true;
    request.setRequestHeader("X-XSRF-TOKEN", readXsrf());
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round((100 * event.loaded) / event.total));
    request.onload = () => {
      let body: { code?: string; detail?: string } & Partial<UploadedMedia> = {};
      try {
        body = JSON.parse(request.responseText);
      } catch {
        // réponse vide ou non JSON
      }
      if (request.status >= 200 && request.status < 300) resolve(body as UploadedMedia);
      else reject(new ApiError(request.status, body.code ?? "UPLOAD_FAILED", body.detail ?? "Envoi impossible."));
    };
    request.onerror = () => reject(new ApiError(0, "NETWORK", "Connexion interrompue pendant l'envoi."));
    request.send(form);
  });
}

function readXsrf(): string {
  const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith("XSRF-TOKEN="));
  return entry ? decodeURIComponent(entry.slice("XSRF-TOKEN=".length)) : "";
}

/** Durée d'une vidéo locale, lue par le navigateur avant l'envoi. */
export function readVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(video.duration) ? Math.round(video.duration) : null);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    video.src = url;
  });
}

/** Identifiant (11 caractères) d'une vidéo YouTube, même règle que l'API. */
export function youtubeId(urlOrId: string): string | null {
  const value = urlOrId.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;
  const match = value.match(
    /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtube-nocookie\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#/].*)?$/,
  );
  return match ? match[1] : null;
}
