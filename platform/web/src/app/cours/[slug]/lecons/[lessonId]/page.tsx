import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, Clock, ListChecks } from "lucide-react";
import { CompleteButton } from "@/components/course/complete-button";
import { CourseSidebar } from "@/components/course/course-sidebar";
import { LessonIcon } from "@/components/course/lesson-icon";
import { PdfLesson } from "@/components/course/pdf-lesson";
import { VideoLesson } from "@/components/course/video-lesson";
import { YouTubeLesson } from "@/components/course/youtube-lesson";
import { ScrambleText } from "@/components/fx/scramble-text";
import { InstructorCard, InstructorChip } from "@/components/instructor";
import { Markdown } from "@/components/markdown";
import { ReadingProgress } from "@/components/motion/reading-progress";
import { Reveal } from "@/components/motion/reveal";
import { apiGet, getCurrentUser } from "@/lib/api";
import { LESSON_TYPE_LABELS, type CourseDetail, type LessonView, type Progress, type QuizStatus } from "@/lib/courses";

export const metadata: Metadata = { robots: { index: false } };

export default async function LessonPage({ params }: PageProps<"/cours/[slug]/lecons/[lessonId]">) {
  const { slug, lessonId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?suivant=/cours/${slug}/lecons/${lessonId}`);

  const lesson = await apiGet<LessonView>(`/lessons/${lessonId}`);
  if (!lesson) redirect(`/cours/${slug}`); // pas inscrit (ou leçon inexistante) : retour à la présentation
  if (lesson.courseSlug !== slug) notFound();

  const [detail, progress, quizzes] = await Promise.all([
    apiGet<CourseDetail>(`/public/courses/${slug}`),
    apiGet<Progress>(`/courses/${slug}/progress`),
    apiGet<QuizStatus[]>(`/quiz/courses/${lesson.courseId}/status`),
  ]);
  const chapterQuiz = (quizzes ?? []).find((quiz) => quiz.chapterId === lesson.chapterId);
  const lastOfChapter = detail?.chapters.find((chapter) => chapter.id === lesson.chapterId)?.lessons.at(-1)?.id === lesson.id;
  const allLessons = detail?.chapters.flatMap((chapter) => chapter.lessons) ?? [];
  const position = allLessons.findIndex((item) => item.id === lesson.id) + 1;
  const titleOf = (id: number | null) => allLessons.find((item) => item.id === id)?.title;
  const author = detail?.course.author;
  const minutes = lesson.durationSeconds ? Math.ceil(lesson.durationSeconds / 60) : null;

  return (
    <>
      <ReadingProgress />
      <div className="container-page grid gap-8 py-8 lg:grid-cols-[19rem_minmax(0,1fr)] xl:gap-12">
        <aside className="order-last lg:order-first lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
          {detail && (
            <CourseSidebar
              slug={slug}
              title={lesson.courseTitle}
              chapters={detail.chapters}
              progress={progress}
              quizzes={quizzes ?? []}
              currentLessonId={lesson.id}
            />
          )}
        </aside>

        <article className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-8">
          <Reveal y={14}>
            <header className="flex flex-col gap-5">
              <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <Link href={`/cours/${slug}`} className="line-clamp-1 hover:text-foreground">{lesson.courseTitle}</Link>
                <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                <span className="line-clamp-1">{lesson.chapterTitle}</span>
              </nav>
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">
                  <LessonIcon type={lesson.type} /> {LESSON_TYPE_LABELS[lesson.type]}
                </span>
                {position > 0 && (
                  <span className="rounded-full border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                    Leçon {position} sur {allLessons.length}
                  </span>
                )}
                {minutes && (
                  <span className="flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden /> {minutes} min
                  </span>
                )}
              </div>
              <h1 className="heading-display text-3xl sm:text-4xl">
                <ScrambleText text={lesson.title} duration={900} />
              </h1>
              {author && <InstructorChip author={author} className="w-fit" />}
              {!lesson.enrolled && (
                <p className="rounded-xl border border-primary/25 bg-primary/8 px-4 py-2.5 text-sm font-medium text-primary">
                  {lesson.freePreview
                    ? "Aperçu gratuit : inscrivez-vous au cours pour suivre votre progression."
                    : "Consultation en tant qu'auteur ou administrateur : la progression n'est pas suivie."}
                </p>
              )}
            </header>
          </Reveal>

          {lesson.type === "TEXT" && lesson.contentMd && <Markdown>{lesson.contentMd}</Markdown>}
          {lesson.type === "VIDEO" && lesson.mediaUrl && (
            <VideoLesson
              lessonId={lesson.id}
              src={lesson.mediaUrl}
              startAt={lesson.positionSeconds}
              completed={lesson.completed}
              track={lesson.enrolled}
            />
          )}
          {lesson.type === "PDF" && lesson.mediaUrl && <PdfLesson src={lesson.mediaUrl} filename={`${lesson.title}.pdf`} />}
          {lesson.type === "YOUTUBE" && lesson.youtubeId && <YouTubeLesson videoId={lesson.youtubeId} title={lesson.title} />}
          {lesson.type !== "TEXT" && lesson.contentMd && (
            <section aria-labelledby="lesson-notes" className="surface flex flex-col gap-3 p-6">
              <h2 id="lesson-notes" className="text-lg font-bold">Notes de la leçon</h2>
              <Markdown>{lesson.contentMd}</Markdown>
            </section>
          )}

          <footer className="flex flex-col gap-6 border-t pt-8">
            {lesson.enrolled && lesson.type !== "VIDEO" && <CompleteButton lessonId={lesson.id} completed={lesson.completed} />}
            {lesson.enrolled && lesson.type === "VIDEO" && lesson.completed && <CompleteButton lessonId={lesson.id} completed />}
            <div className="grid gap-3 sm:grid-cols-2">
              {lesson.previousLessonId ? (
                <NavCard
                  href={`/cours/${slug}/lecons/${lesson.previousLessonId}`}
                  direction="previous"
                  label="Leçon précédente"
                  title={titleOf(lesson.previousLessonId)}
                />
              ) : (
                <span className="hidden sm:block" />
              )}
              {lastOfChapter && chapterQuiz && !chapterQuiz.passed ? (
                <NavCard href={`/cours/${slug}/quiz/${lesson.chapterId}`} direction="next" label="Étape suivante" title="Passer le quiz du chapitre" quiz />
              ) : lesson.nextLessonId ? (
                <NavCard href={`/cours/${slug}/lecons/${lesson.nextLessonId}`} direction="next" label="Leçon suivante" title={titleOf(lesson.nextLessonId)} />
              ) : (
                <NavCard href={`/cours/${slug}`} direction="next" label="Fin du cours" title="Revenir à la présentation du cours" />
              )}
            </div>
            {author && <InstructorCard author={author} title="À propos du formateur" />}
          </footer>
        </article>
      </div>
    </>
  );
}

type NavCardProps = { href: string; direction: "previous" | "next"; label: string; title?: string; quiz?: boolean };

function NavCard({ href, direction, label, title, quiz = false }: NavCardProps) {
  const next = direction === "next";
  return (
    <Link
      href={href}
      className={`group card-lift surface flex items-center gap-4 p-4 ${next ? "sm:flex-row-reverse sm:text-right" : ""} ${
        next ? "border-primary/30 bg-gradient-to-br from-primary/8 to-transparent" : ""
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-500 ${
          next ? "bg-primary text-primary-foreground group-hover:translate-x-1" : "bg-secondary text-secondary-foreground group-hover:-translate-x-1"
        }`}
      >
        {quiz ? <ListChecks className="size-5" aria-hidden /> : next ? <ArrowRight className="size-5" aria-hidden /> : <ArrowLeft className="size-5" aria-hidden />}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <span className="line-clamp-2 text-sm font-bold text-foreground">{title ?? "—"}</span>
      </span>
    </Link>
  );
}
