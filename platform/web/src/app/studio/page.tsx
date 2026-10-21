import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NewCourseForm } from "@/components/studio/new-course-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet, getCurrentUser, isCreator } from "@/lib/api";
import { LEVEL_LABELS, formatDate } from "@/lib/courses";
import type { StudioCourseSummary } from "@/lib/studio";

export const metadata: Metadata = { title: "Studio", robots: { index: false } };

export default async function StudioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?suivant=/studio");
  if (!isCreator(user)) redirect("/");
  const courses = (await apiGet<StudioCourseSummary[]>("/studio/courses")) ?? [];

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_22rem]">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Studio</h1>
        <p className="text-muted-foreground">Créez et publiez vos cours : leçons texte, vidéo ou PDF, et quiz de fin de chapitre.</p>
        {courses.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">Aucun cours pour l&apos;instant.</p>
        ) : (
          <ul className="flex flex-col divide-y rounded-xl border">
            {courses.map((course) => (
              <li key={course.id}>
                <Link href={`/studio/cours/${course.id}`} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-muted/40">
                  <span className="flex-1 font-medium">{course.title}</span>
                  <Badge variant={course.status === "PUBLISHED" ? "default" : "outline"}>
                    {course.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {LEVEL_LABELS[course.level]} · {course.chapterCount} chap. · {course.lessonCount} leçons · modifié le{" "}
                    {formatDate(course.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <aside>
        <Card>
          <CardHeader>
            <CardTitle>Nouveau cours</CardTitle>
          </CardHeader>
          <CardContent>
            <NewCourseForm />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
