import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Award } from "lucide-react";
import { CourseCard } from "@/components/course-card";
import { ProgressBar } from "@/components/course/progress-bar";
import { buttonVariants } from "@/components/ui/button";
import { apiGet, getCurrentUser } from "@/lib/api";
import { formatDate, type MyCertificate, type MyCourse } from "@/lib/courses";

export const metadata: Metadata = { title: "Mes cours" };

export default async function MyCoursesPage() {
  if (!(await getCurrentUser())) redirect("/connexion?suivant=/mes-cours");
  const [courses, certificates] = await Promise.all([
    apiGet<MyCourse[]>("/me/courses"),
    apiGet<MyCertificate[]>("/me/certificates"),
  ]);
  const certificateByCourse = new Map((certificates ?? []).map((certificate) => [certificate.courseId, certificate]));

  return (
    <div className="container-page py-12">
      <div className="flex flex-col gap-2">
        <span className="eyebrow w-fit">Mon espace</span>
        <h1 className="heading-display text-4xl">
          Mes <span className="text-accent-gradient">cours</span>
        </h1>
        <p className="text-muted-foreground">Reprenez là où vous vous étiez arrêté et retrouvez vos certificats.</p>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="surface mt-10 flex flex-col items-center gap-4 px-6 py-16 text-center text-muted-foreground">
          <p className="font-semibold text-foreground">Vous n&apos;êtes inscrit à aucun cours pour l&apos;instant.</p>
          <Link href="/cours" className={buttonVariants({ size: "lg", className: "h-11 rounded-xl px-5" })}>
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cours suivis">
          {courses.map((item) => {
            const certificate = certificateByCourse.get(item.course.id);
            return (
              <CourseCard
                key={item.course.slug}
                course={item.course}
                footer={
                  <div className="flex flex-col gap-3">
                    <ProgressBar value={item.progressPct} label={`Progression : ${item.course.title}`} />
                    {certificate ? (
                      <Link href={`/certificats/${certificate.serial}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        <Award aria-hidden /> Certificat du {formatDate(certificate.issuedAt)}
                      </Link>
                    ) : (
                      <Link
                        href={item.lastLessonId ? `/cours/${item.course.slug}/lecons/${item.lastLessonId}` : `/cours/${item.course.slug}`}
                        className={buttonVariants({ size: "sm" })}
                      >
                        {item.progressPct > 0 ? "Reprendre" : "Commencer"}
                      </Link>
                    )}
                  </div>
                }
              />
            );
          })}
        </section>
      )}
    </div>
  );
}
