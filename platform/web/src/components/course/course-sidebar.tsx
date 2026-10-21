import Link from "next/link";
import { CheckCircle2, CircleHelp } from "lucide-react";
import { cn } from "cn";
import { LessonIcon } from "@/components/course/lesson-icon";
import { ProgressBar } from "@/components/course/progress-bar";
import type { ChapterView, Progress, QuizStatus } from "@/lib/courses";

type CourseSidebarProps = {
  slug: string;
  title: string;
  chapters: ChapterView[];
  progress: Progress | null;
  quizzes: QuizStatus[];
  currentLessonId?: number;
  currentQuizChapterId?: number;
};

/** Programme du cours avec l'état de chaque leçon et de chaque quiz. */
export function CourseSidebar({ slug, title, chapters, progress, quizzes, currentLessonId, currentQuizChapterId }: CourseSidebarProps) {
  const completed = new Set(progress?.completedLessonIds ?? []);
  const quizByChapter = new Map(quizzes.map((quiz) => [quiz.chapterId, quiz]));

  return (
    <nav aria-label="Programme du cours" className="surface flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-3 border-b pb-4">
        <span className="text-[0.7rem] font-bold tracking-wider text-muted-foreground uppercase">Programme</span>
        <Link href={`/cours/${slug}`} className="text-sm leading-snug font-bold hover:text-primary">
          {title}
        </Link>
        {progress?.enrolled && <ProgressBar value={progress.progressPct} />}
      </div>
      <ol className="flex flex-col gap-5">
        {chapters.map((chapter, index) => {
          const quiz = quizByChapter.get(chapter.id);
          return (
            <li key={chapter.id} className="flex flex-col gap-1">
              <p className="flex items-start gap-2 px-2 text-xs font-bold text-foreground">
                <span className="font-mono text-primary">{String(index + 1).padStart(2, "0")}</span>
                <span>{chapter.title}</span>
              </p>
              <ul className="flex flex-col gap-0.5">
                {chapter.lessons.map((lesson) => {
                  const current = lesson.id === currentLessonId;
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/cours/${slug}/lecons/${lesson.id}`}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-[0.82rem] text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground",
                          current && "bg-primary/10 font-semibold text-primary hover:bg-primary/10 hover:text-primary",
                        )}
                      >
                        {current && <span aria-hidden className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-primary" />}
                        {completed.has(lesson.id) ? (
                          <CheckCircle2 className="size-4 shrink-0 text-primary" aria-label="terminée" />
                        ) : (
                          <LessonIcon type={lesson.type} />
                        )}
                        <span className="line-clamp-2">{lesson.title}</span>
                      </Link>
                    </li>
                  );
                })}
                {quiz && (
                  <li>
                    <Link
                      href={`/cours/${slug}/quiz/${chapter.id}`}
                      aria-current={chapter.id === currentQuizChapterId ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[0.82rem] text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                        chapter.id === currentQuizChapterId && "bg-primary/10 font-semibold text-primary",
                      )}
                    >
                      {quiz.passed ? (
                        <CheckCircle2 className="size-4 shrink-0 text-primary" aria-label="réussi" />
                      ) : (
                        <CircleHelp className="size-4 shrink-0 text-amber-500" aria-hidden />
                      )}
                      <span className="flex-1">Quiz du chapitre</span>
                      {quiz.bestScorePct !== null && <span className="font-mono text-xs">{quiz.bestScorePct} %</span>}
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
