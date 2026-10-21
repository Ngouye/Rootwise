import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CourseSidebar } from "@/components/course/course-sidebar";
import { QuizForm } from "@/components/course/quiz-form";
import { FormAlert } from "@/components/auth/form-alert";
import { apiGet, getCurrentUser } from "@/lib/api";
import type { CourseDetail, LearnerQuiz, Progress, QuizStatus } from "@/lib/courses";

export const metadata: Metadata = { title: "Quiz", robots: { index: false } };

export default async function QuizPage({ params }: PageProps<"/cours/[slug]/quiz/[chapterId]">) {
  const { slug, chapterId } = await params;
  if (!(await getCurrentUser())) redirect(`/connexion?suivant=/cours/${slug}/quiz/${chapterId}`);

  const quiz = await apiGet<LearnerQuiz>(`/chapters/${chapterId}/quiz`);
  if (!quiz) redirect(`/cours/${slug}`);

  const [detail, progress, quizzes] = await Promise.all([
    apiGet<CourseDetail>(`/public/courses/${slug}`),
    apiGet<Progress>(`/courses/${slug}/progress`),
    apiGet<QuizStatus[]>(`/quiz/courses/${quiz.courseId}/status`),
  ]);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[18rem_1fr]">
      <aside className="order-last lg:order-first lg:sticky lg:top-20 lg:self-start">
        {detail && (
          <CourseSidebar
            slug={slug}
            title={detail.course.title}
            chapters={detail.chapters}
            progress={progress}
            quizzes={quizzes ?? []}
            currentQuizChapterId={quiz.chapterId}
          />
        )}
      </aside>
      <section className="flex min-w-0 flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Quiz — {quiz.chapterTitle}</p>
          <h1 className="text-2xl font-semibold tracking-tight">Validez vos acquis</h1>
          <p className="text-sm text-muted-foreground">
            Seuil de réussite : {quiz.passScorePct} %.{quiz.bestScorePct !== null && ` Meilleur score : ${quiz.bestScorePct} %.`}
          </p>
        </header>
        {quiz.passed && <FormAlert tone="success">Vous avez déjà réussi ce quiz. Vous pouvez le repasser pour vous entraîner.</FormAlert>}
        <QuizForm quiz={quiz} courseSlug={slug} />
      </section>
    </div>
  );
}
