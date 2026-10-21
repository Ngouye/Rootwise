import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock,
  Eye,
  Infinity as InfinityIcon,
  Layers,
  ListChecks,
  Lock,
} from "lucide-react";
import { LevelBadge } from "@/components/course-card";
import { Parallax } from "@/components/fx/parallax";
import { ScrambleText } from "@/components/fx/scramble-text";
import { SmoothScroll } from "@/components/fx/smooth-scroll";
import { EnrollButton } from "@/components/course/enroll-button";
import { LessonIcon } from "@/components/course/lesson-icon";
import { ProgressBar } from "@/components/course/progress-bar";
import { InstructorCard, InstructorChip } from "@/components/instructor";
import { Markdown } from "@/components/markdown";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { apiGet, getCurrentUser } from "@/lib/api";
import {
  LEVEL_LABELS,
  formatDuration,
  nextLessonId,
  type CourseDetail,
  type CourseSummary,
  type MyCertificate,
  type Progress,
  type PublicQuizInfo,
} from "@/lib/courses";

export async function generateMetadata({ params }: PageProps<"/cours/[slug]">): Promise<Metadata> {
  const detail = await apiGet<CourseDetail>(`/public/courses/${(await params).slug}`);
  return detail ? { title: detail.course.title, description: detail.course.summary } : { title: "Cours introuvable" };
}

export default async function CoursePage({ params }: PageProps<"/cours/[slug]">) {
  const { slug } = await params;
  const detail = await apiGet<CourseDetail>(`/public/courses/${slug}`);
  if (!detail) notFound();

  const { course, chapters } = detail;
  const user = await getCurrentUser();
  const [progress, quizzes, certificate, catalog] = await Promise.all([
    user ? apiGet<Progress>(`/courses/${slug}/progress`) : null,
    apiGet<PublicQuizInfo[]>(`/public/quizzes?courseId=${course.id}`),
    user ? apiGet<MyCertificate>(`/quiz/courses/${course.id}/certificate`) : null,
    apiGet<CourseSummary[]>("/public/courses"),
  ]);
  const quizByChapter = new Map((quizzes ?? []).map((quiz) => [quiz.chapterId, quiz]));
  const completed = new Set(progress?.completedLessonIds ?? []);
  const resumeId = nextLessonId(chapters, progress);
  const enrolled = !!progress?.enrolled;
  const authorCourses = (catalog ?? []).filter((item) => item.author.username && item.author.username === course.author.username).length;
  const freeLessons = chapters.reduce((sum, chapter) => sum + chapter.lessons.filter((lesson) => lesson.freePreview).length, 0);

  const facts = [
    { icon: BarChart3, label: "Niveau", value: LEVEL_LABELS[course.level] },
    { icon: Layers, label: "Chapitres", value: String(course.chapterCount) },
    { icon: BookOpen, label: "Leçons", value: String(course.lessonCount) },
    { icon: Clock, label: "Durée", value: course.durationMinutes > 0 ? formatDuration(course.durationMinutes) : "—" },
  ];

  return (
    <div className="container-page py-8 lg:py-10">
      <SmoothScroll />
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/cours" className="hover:text-foreground">Cours</Link>
        {course.tags[0] && (
          <>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link href={`/cours?theme=${course.tags[0].slug}`} className="hover:text-foreground">{course.tags[0].name}</Link>
          </>
        )}
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="line-clamp-1 font-medium text-foreground">{course.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <Reveal y={16}>
            <div className="relative overflow-hidden rounded-3xl shadow-lift">
              {course.coverUrl ? (
                <Parallax offset={28} className="scale-[1.12]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- image servie par l'API */}
                  <img src={course.coverUrl} alt="" className="aspect-[16/7] w-full object-cover" />
                </Parallax>
              ) : (
                <div className="surface-navy aspect-[16/7] w-full" />
              )}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <LevelBadge level={course.level} className="bg-card/90 backdrop-blur" />
                {freeLessons > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[0.7rem] font-bold text-primary-foreground">
                    <Eye className="size-3" aria-hidden /> {freeLessons} leçons en accès libre
                  </span>
                )}
              </div>
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/cours?theme=${tag.slug}`}
                    className="rounded-full border border-white/25 bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur hover:bg-black/45"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="flex flex-col gap-4">
            <h1 className="heading-display text-3xl sm:text-[2.6rem]">
              <ScrambleText text={course.title} duration={1300} />
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">{course.summary}</p>
            <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="surface flex items-center gap-3 p-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <fact.icon className="size-[1.1rem]" aria-hidden />
                  </span>
                  <div className="flex flex-col">
                    <dt className="text-[0.7rem] font-semibold text-muted-foreground">{fact.label}</dt>
                    <dd className="text-sm font-bold text-foreground">{fact.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <InstructorChip author={course.author} className="w-fit lg:hidden" />
          </Reveal>

          {chapters.length > 1 && (
            <Reveal>
              <section aria-labelledby="objectifs" className="surface p-6">
                <h2 id="objectifs" className="text-lg font-bold">Ce que vous allez apprendre</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {chapters.map((chapter) => (
                    <li key={chapter.id} className="flex gap-2.5 text-sm leading-6">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      <span>{chapter.title}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          {detail.descriptionMd && (
            <Reveal>
              <section aria-labelledby="presentation" className="flex flex-col gap-3">
                <h2 id="presentation" className="text-2xl font-extrabold tracking-tight">À propos de ce cours</h2>
                <Markdown>{detail.descriptionMd}</Markdown>
              </section>
            </Reveal>
          )}

          <section aria-labelledby="programme" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 id="programme" className="text-2xl font-extrabold tracking-tight">Programme</h2>
              <p className="text-sm text-muted-foreground">
                {course.chapterCount} chapitres · {course.lessonCount} leçons
                {course.durationMinutes > 0 && ` · ${formatDuration(course.durationMinutes)}`}
              </p>
            </div>
            <ol className="flex flex-col gap-3">
              {chapters.map((chapter, index) => {
                const quiz = quizByChapter.get(chapter.id);
                const done = chapter.lessons.filter((lesson) => completed.has(lesson.id)).length;
                const minutes = Math.round(chapter.lessons.reduce((sum, lesson) => sum + (lesson.durationSeconds ?? 0), 0) / 60);
                return (
                  <li key={chapter.id}>
                    <details className="group surface overflow-hidden" open={index === 0}>
                      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary font-mono text-sm font-bold text-secondary-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="font-bold text-foreground">{chapter.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {chapter.lessons.length} leçons{minutes > 0 && ` · ${formatDuration(minutes)}`}
                            {enrolled && ` · ${done}/${chapter.lessons.length} terminées`}
                          </span>
                        </span>
                        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" aria-hidden />
                      </summary>
                      <ul className="flex flex-col border-t py-1">
                        {chapter.lessons.map((lesson) => {
                          const accessible = enrolled || (!!user && lesson.freePreview);
                          const label = (
                            <>
                              {completed.has(lesson.id) ? (
                                <CheckCircle2 className="size-4 shrink-0 text-primary" aria-label="terminée" />
                              ) : accessible ? (
                                <LessonIcon type={lesson.type} />
                              ) : (
                                <Lock className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
                              )}
                              <span className="flex-1">{lesson.title}</span>
                              {lesson.freePreview && !enrolled && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-bold text-primary">
                                  <Eye className="size-3" aria-hidden /> Aperçu
                                </span>
                              )}
                              {lesson.durationSeconds ? (
                                <span className="text-xs text-muted-foreground tabular-nums">{Math.ceil(lesson.durationSeconds / 60)} min</span>
                              ) : null}
                            </>
                          );
                          return (
                            <li key={lesson.id}>
                              {accessible ? (
                                <Link
                                  href={`/cours/${slug}/lecons/${lesson.id}`}
                                  className="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors hover:bg-primary/5 hover:text-primary"
                                >
                                  {label}
                                </Link>
                              ) : (
                                <div className="flex items-center gap-3 px-5 py-2.5 text-sm text-muted-foreground">{label}</div>
                              )}
                            </li>
                          );
                        })}
                        {quiz && (
                          <li className="flex items-center gap-3 px-5 py-2.5 text-sm text-muted-foreground">
                            <CircleHelp className="size-4 shrink-0 text-amber-500" aria-hidden />
                            <span className="flex-1 font-medium">Quiz de fin de chapitre</span>
                            <span className="text-xs">{quiz.questionCount} questions</span>
                          </li>
                        )}
                      </ul>
                    </details>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <Reveal delay={0.1}>
            <section className="surface relative flex flex-col gap-5 overflow-hidden p-6 shadow-lift" aria-label="Inscription">
              <div aria-hidden className="glow-orb -top-20 -right-16 size-48 opacity-25" />
              <div className="relative flex flex-col gap-1">
                <span className="text-sm font-semibold text-muted-foreground">Accès au cours</span>
                <span className="text-4xl font-extrabold tracking-tight text-foreground">Gratuit</span>
                <span className="text-xs text-muted-foreground">Leçons, quiz et certificat inclus, sans limite de temps.</span>
              </div>
              <div className="relative flex flex-col gap-3">
                {enrolled && progress ? (
                  <>
                    <ProgressBar value={progress.progressPct} />
                    {resumeId && (
                      <Link href={`/cours/${slug}/lecons/${resumeId}`} className={buttonVariants({ size: "lg", className: "h-12 rounded-xl text-sm" })}>
                        {progress.progressPct > 0 ? "Reprendre le cours" : "Commencer le cours"}
                      </Link>
                    )}
                    {certificate && (
                      <Link href={`/certificats/${certificate.serial}`} className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 rounded-xl" })}>
                        <Award aria-hidden /> Voir mon certificat
                      </Link>
                    )}
                  </>
                ) : user ? (
                  <EnrollButton slug={slug} firstLessonId={resumeId} />
                ) : (
                  <>
                    <Link href={`/inscription?suivant=/cours/${slug}`} className={buttonVariants({ size: "lg", className: "h-12 rounded-xl text-sm" })}>
                      Commencer gratuitement
                    </Link>
                    <Link href={`/connexion?suivant=/cours/${slug}`} className="text-center text-sm font-semibold text-primary hover:underline">
                      J&apos;ai déjà un compte
                    </Link>
                  </>
                )}
              </div>
              <ul className="relative flex flex-col gap-3 border-t pt-5 text-sm">
                <Includes icon={BookOpen}>{course.lessonCount} leçons en {course.chapterCount} chapitres</Includes>
                {course.durationMinutes > 0 && <Includes icon={Clock}>{formatDuration(course.durationMinutes)} de contenu</Includes>}
                <Includes icon={ListChecks}>Quiz à la fin des chapitres</Includes>
                <Includes icon={Award}>Certificat signé (Ed25519), vérifiable par tous</Includes>
                <Includes icon={InfinityIcon}>Accès illimité, à votre rythme</Includes>
              </ul>
            </section>
          </Reveal>
          <Reveal delay={0.2} className="hidden lg:block">
            <InstructorCard author={course.author} courseCount={authorCourses || undefined} />
          </Reveal>
        </aside>
      </div>
    </div>
  );
}

function Includes({ icon: Icon, children }: { icon: typeof Award; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-foreground/85">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden />
      {children}
    </li>
  );
}
