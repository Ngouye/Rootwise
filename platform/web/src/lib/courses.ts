/** Types des réponses de l'API cours / quiz / certificats, partagés serveur et navigateur. */

export type Level = "BEGINNER" | "INTERMEDIATE" | "EXPERT";
export type LessonType = "TEXT" | "VIDEO" | "PDF" | "YOUTUBE";

export const LEVEL_LABELS: Record<Level, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  EXPERT: "Expert",
};

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  TEXT: "Texte",
  VIDEO: "Vidéo",
  PDF: "PDF",
  YOUTUBE: "Vidéo YouTube",
};

export type Tag = { slug: string; name: string };

/** Formateur (auteur d'un cours) tel que le voit un visiteur. */
export type Author = {
  username: string | null;
  displayName: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

export type CourseSummary = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  level: Level;
  tags: Tag[];
  authorName: string;
  author: Author;
  coverUrl: string | null;
  chapterCount: number;
  lessonCount: number;
  durationMinutes: number;
};

export type LessonSummary = {
  id: number;
  title: string;
  type: LessonType;
  durationSeconds: number | null;
  freePreview: boolean;
};

export type ChapterView = { id: number; title: string; lessons: LessonSummary[] };

export type CourseDetail = {
  course: CourseSummary;
  descriptionMd: string | null;
  publishedAt: string;
  chapters: ChapterView[];
};

export type Progress = {
  enrolled: boolean;
  progressPct: number;
  lastLessonId: number | null;
  completedLessonIds: number[];
  completedAt: string | null;
};

export type LessonView = {
  id: number;
  title: string;
  type: LessonType;
  contentMd: string | null;
  mediaUrl: string | null;
  youtubeId: string | null;
  durationSeconds: number | null;
  freePreview: boolean;
  chapterId: number;
  chapterTitle: string;
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  enrolled: boolean;
  positionSeconds: number;
  completed: boolean;
  previousLessonId: number | null;
  nextLessonId: number | null;
};

export type MyCourse = {
  course: CourseSummary;
  progressPct: number;
  lastLessonId: number | null;
  enrolledAt: string;
  completedAt: string | null;
};

export type QuizStatus = {
  chapterId: number;
  questionCount: number;
  passed: boolean;
  bestScorePct: number | null;
  attemptsUsed: number;
  maxAttempts: number | null;
};

export type PublicQuizInfo = { chapterId: number; questionCount: number };

export type QuestionKind = "SINGLE" | "MULTIPLE";

export type LearnerQuiz = {
  quizId: number;
  chapterId: number;
  chapterTitle: string;
  courseId: number;
  passScorePct: number;
  maxAttempts: number | null;
  attemptsUsed: number;
  bestScorePct: number | null;
  passed: boolean;
  questions: { id: number; kind: QuestionKind; promptMd: string; points: number; choices: { id: number; labelMd: string }[] }[];
};

export type AttemptResult = {
  scorePct: number;
  passed: boolean;
  attemptsUsed: number;
  maxAttempts: number | null;
  revealed: boolean;
  results: { questionId: number; correct: boolean; correctChoiceIds: number[] | null; explanationMd: string | null }[];
};

export type MyCertificate = { serial: string; courseId: number; courseTitle: string; issuedAt: string };

export type CertificateView = {
  serial: string;
  payload: Record<string, string>;
  canonicalPayload: string;
  signatureBase64: string;
  algorithm: string;
  keyId: string;
  publicKeyPem: string | null;
  valid: boolean;
  issuedAt: string;
};

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest}` : `${hours} h`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(iso));
}

/** Formateur le plus présent dans une liste de cours (mis en avant sur l'accueil). */
export function mainAuthor(courses: CourseSummary[]): Author | null {
  const counts = new Map<string, { author: Author; count: number }>();
  for (const course of courses) {
    const key = course.author.username ?? course.author.displayName;
    const entry = counts.get(key) ?? { author: course.author, count: 0 };
    entry.count += 1;
    counts.set(key, entry);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)[0]?.author ?? null;
}

/** Première leçon non terminée (ou la première du cours). */
export function nextLessonId(chapters: ChapterView[], progress: Progress | null): number | null {
  const all = chapters.flatMap((chapter) => chapter.lessons.map((lesson) => lesson.id));
  if (progress?.lastLessonId && all.includes(progress.lastLessonId)) return progress.lastLessonId;
  const done = new Set(progress?.completedLessonIds ?? []);
  return all.find((id) => !done.has(id)) ?? all[0] ?? null;
}
