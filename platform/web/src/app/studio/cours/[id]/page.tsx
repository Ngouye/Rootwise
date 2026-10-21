import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CourseEditor } from "@/components/studio/course-editor";
import { apiGet, getCurrentUser, isAdmin, isCreator } from "@/lib/api";
import type { Tag } from "@/lib/courses";
import type { StudioCourse } from "@/lib/studio";

export const metadata: Metadata = { title: "Édition du cours", robots: { index: false } };

export default async function EditCoursePage({ params }: PageProps<"/studio/cours/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?suivant=/studio/cours/${id}`);
  if (!isCreator(user)) redirect("/");

  const [course, tags] = await Promise.all([apiGet<StudioCourse>(`/studio/courses/${id}`), apiGet<Tag[]>("/public/tags")]);
  if (!course) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <CourseEditor initial={course} tags={tags ?? []} admin={isAdmin(user)} />
    </div>
  );
}
