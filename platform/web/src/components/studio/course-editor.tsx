"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, CircleHelp, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "cn";
import { FormAlert } from "@/components/auth/form-alert";
import { LessonIcon } from "@/components/course/lesson-icon";
import { LessonForm, type LessonDraft } from "@/components/studio/lesson-form";
import { MarkdownField } from "@/components/studio/markdown-field";
import { selectClass } from "@/components/studio/new-course-form";
import { QuizEditor } from "@/components/studio/quiz-editor";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiFetch } from "@/lib/client-api";
import { LEVEL_LABELS, type Level, type Tag } from "@/lib/courses";
import { uploadMedia, type StudioChapter, type StudioCourse } from "@/lib/studio";

export function CourseEditor({ initial, tags, admin }: { initial: StudioCourse; tags: Tag[]; admin: boolean }) {
  const router = useRouter();
  const [course, setCourse] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  /** Chaque modification renvoie le cours complet : l'écran reste toujours à jour. */
  async function mutate(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown) {
    setError(null);
    try {
      setCourse(await apiFetch<StudioCourse>(`/studio${path}`, { method, body }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action impossible.");
      throw err;
    }
  }
  const quiet = (promise: Promise<unknown>) => promise.catch(() => undefined);

  async function deleteCourse() {
    if (!confirm("Supprimer définitivement ce brouillon ?")) return;
    try {
      await apiFetch(`/studio/courses/${course.id}`, { method: "DELETE" });
      router.push("/studio");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Suppression impossible.");
    }
  }

  const published = course.status === "PUBLISHED";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center gap-3">
        <Link href="/studio" className="text-sm text-muted-foreground hover:text-foreground">
          ← Studio
        </Link>
        <h1 className="w-full text-2xl font-semibold tracking-tight sm:w-auto sm:flex-1">{course.title}</h1>
        <Badge variant={published ? "default" : "outline"}>{published ? "Publié" : "Brouillon"}</Badge>
        {published ? (
          <>
            <Link href={`/cours/${course.slug}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <ExternalLink aria-hidden /> Voir
            </Link>
            <Button size="sm" variant="secondary" onClick={() => quiet(mutate(`/courses/${course.id}/unpublish`, "POST"))}>
              Dépublier
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" disabled={course.publishProblems.length > 0} onClick={() => quiet(mutate(`/courses/${course.id}/publish`, "POST"))}>
              Publier
            </Button>
            <Button size="sm" variant="destructive" onClick={deleteCourse}>
              Supprimer
            </Button>
          </>
        )}
      </header>

      {error && <FormAlert>{error}</FormAlert>}
      {!published && course.publishProblems.length > 0 && (
        <FormAlert>
          Avant de publier : {course.publishProblems.join(" ")}
        </FormAlert>
      )}

      <CourseInfo course={course} tags={tags} admin={admin} onSave={(body) => mutate(`/courses/${course.id}`, "PUT", body)} />

      <section className="flex flex-col gap-4" aria-labelledby="chapitres">
        <h2 id="chapitres" className="text-xl font-semibold">Chapitres</h2>
        {course.chapters.map((chapter, index) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            first={index === 0}
            last={index === course.chapters.length - 1}
            mutate={mutate}
          />
        ))}
        <AddChapter onAdd={(title) => mutate(`/courses/${course.id}/chapters`, "POST", { title })} />
      </section>
    </div>
  );
}

type CourseInfoProps = { course: StudioCourse; tags: Tag[]; admin: boolean; onSave: (body: unknown) => Promise<void> };

function CourseInfo({ course, tags, admin, onSave }: CourseInfoProps) {
  const [title, setTitle] = useState(course.title);
  const [summary, setSummary] = useState(course.summary);
  const [description, setDescription] = useState(course.descriptionMd ?? "");
  const [level, setLevel] = useState<Level>(course.level);
  const [selected, setSelected] = useState<string[]>(course.tagSlugs);
  const [cover, setCover] = useState<{ id: number | null; url: string | null }>({ id: course.coverMediaId, url: course.coverUrl });
  const [author, setAuthor] = useState(course.authorUsername ?? "");
  const [uploading, setUploading] = useState<number | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onCover(file: File | undefined) {
    if (!file) return;
    setUploading(0);
    try {
      const media = await uploadMedia(file, "IMAGE", setUploading);
      setCover({ id: media.id, url: URL.createObjectURL(file) });
    } finally {
      setUploading(null);
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setSaved(false);
    try {
      await onSave({
        title,
        summary,
        descriptionMd: description,
        level,
        tagSlugs: selected,
        coverMediaId: cover.id,
        // Seul un administrateur peut réattribuer un cours ; l'API refuse ce champ aux créateurs.
        authorUsername: admin && author.trim() && author.trim() !== course.authorUsername ? author.trim() : null,
      });
      setSaved(true);
    } catch {
      // erreur affichée par l'éditeur
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Présentation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="grid gap-4 md:grid-cols-[1fr_16rem]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="course-title">Titre</Label>
              <Input id="course-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={150} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="course-summary">Résumé</Label>
              <Input id="course-summary" value={summary} onChange={(event) => setSummary(event.target.value)} required maxLength={300} />
            </div>
            <MarkdownField
              id="course-description"
              label="Description (Markdown)"
              value={description}
              onChange={setDescription}
              rows={6}
              onUploadingChange={setImageUploading}
            />
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium">Thèmes</legend>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = selected.includes(tag.slug);
                  return (
                    <label
                      key={tag.slug}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1 text-xs",
                        active ? "border-primary/60 bg-primary/10 text-primary" : "text-muted-foreground",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={active}
                        onChange={() => setSelected(active ? selected.filter((slug) => slug !== tag.slug) : [...selected, tag.slug])}
                      />
                      {tag.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="course-level">Niveau</Label>
              <select id="course-level" className={selectClass} value={level} onChange={(event) => setLevel(event.target.value as Level)}>
                {(Object.keys(LEVEL_LABELS) as Level[]).map((value) => (
                  <option key={value} value={value}>
                    {LEVEL_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            {admin && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="course-author">Auteur (nom d&apos;utilisateur)</Label>
                <Input id="course-author" value={author} onChange={(event) => setAuthor(event.target.value)} maxLength={40} />
                <p className="text-xs text-muted-foreground">Doit être un créateur ou un administrateur.</p>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="course-cover">Image de couverture</Label>
              {cover.url && (
                // eslint-disable-next-line @next/next/no-img-element -- aperçu local ou image servie par l'API
                <img src={cover.url} alt="" className="aspect-[16/7] w-full rounded-lg border object-cover" />
              )}
              <Input id="course-cover" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onCover(event.target.files?.[0])} />
              {uploading !== null && <p className="text-xs text-muted-foreground">Envoi… {uploading} %</p>}
              {cover.id && (
                <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => setCover({ id: null, url: null })}>
                  Retirer l&apos;image
                </Button>
              )}
            </div>
            <Button type="submit" disabled={pending || uploading !== null || imageUploading} className="mt-auto">
              {pending ? "Enregistrement…" : "Enregistrer"}
            </Button>
            {saved && <p className="text-xs text-primary">Présentation enregistrée.</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type Mutate = (path: string, method: "POST" | "PUT" | "DELETE", body?: unknown) => Promise<void>;

function ChapterCard({ chapter, first, last, mutate }: { chapter: StudioChapter; first: boolean; last: boolean; mutate: Mutate }) {
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(chapter.title);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const quiet = (promise: Promise<unknown>) => promise.catch(() => undefined);

  const lessonBody = (draft: LessonDraft) => draft;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center gap-2">
        {renaming ? (
          <form
            className="flex flex-1 gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              quiet(mutate(`/chapters/${chapter.id}`, "PUT", { title }).then(() => setRenaming(false)));
            }}
          >
            <Input aria-label="Titre du chapitre" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={150} />
            <Button type="submit" size="sm">OK</Button>
          </form>
        ) : (
          <CardTitle className="flex-1">{chapter.title}</CardTitle>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Renommer le chapitre" onClick={() => setRenaming(!renaming)}>
          <Pencil />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Monter le chapitre" disabled={first} onClick={() => quiet(mutate(`/chapters/${chapter.id}/move`, "POST", { direction: "UP" }))}>
          <ArrowUp />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Descendre le chapitre" disabled={last} onClick={() => quiet(mutate(`/chapters/${chapter.id}/move`, "POST", { direction: "DOWN" }))}>
          <ArrowDown />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Supprimer le chapitre"
          onClick={() => confirm(`Supprimer le chapitre « ${chapter.title} » et ses leçons ?`) && quiet(mutate(`/chapters/${chapter.id}`, "DELETE"))}
        >
          <Trash2 />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <ul className="flex flex-col divide-y rounded-lg border">
          {chapter.lessons.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">Aucune leçon.</li>}
          {chapter.lessons.map((lesson, index) =>
            editing === lesson.id ? (
              <li key={lesson.id} className="p-2">
                <LessonForm
                  initial={lesson}
                  onCancel={() => setEditing(null)}
                  onSubmit={(draft) => mutate(`/lessons/${lesson.id}`, "PUT", lessonBody(draft)).then(() => setEditing(null))}
                />
              </li>
            ) : (
              <li key={lesson.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                <LessonIcon type={lesson.type} />
                <span className="flex-1">{lesson.title}</span>
                {lesson.freePreview && <Badge variant="outline">Aperçu</Badge>}
                {lesson.durationSeconds ? <span className="text-xs text-muted-foreground">{Math.round(lesson.durationSeconds / 60)} min</span> : null}
                <Button variant="ghost" size="icon-xs" aria-label={`Modifier ${lesson.title}`} onClick={() => setEditing(lesson.id)}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon-xs" aria-label={`Monter ${lesson.title}`} disabled={index === 0} onClick={() => quiet(mutate(`/lessons/${lesson.id}/move`, "POST", { direction: "UP" }))}>
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Descendre ${lesson.title}`}
                  disabled={index === chapter.lessons.length - 1}
                  onClick={() => quiet(mutate(`/lessons/${lesson.id}/move`, "POST", { direction: "DOWN" }))}
                >
                  <ArrowDown />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Supprimer ${lesson.title}`}
                  onClick={() => confirm(`Supprimer la leçon « ${lesson.title} » ?`) && quiet(mutate(`/lessons/${lesson.id}`, "DELETE"))}
                >
                  <Trash2 />
                </Button>
              </li>
            ),
          )}
        </ul>
        {editing === "new" ? (
          <LessonForm
            onCancel={() => setEditing(null)}
            onSubmit={(draft) => mutate(`/chapters/${chapter.id}/lessons`, "POST", lessonBody(draft)).then(() => setEditing(null))}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing("new")}>
              <Plus aria-hidden /> Leçon
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuizOpen(!quizOpen)}>
              <CircleHelp aria-hidden /> Quiz du chapitre
            </Button>
          </div>
        )}
        {quizOpen && <QuizEditor chapterId={chapter.id} onClose={() => setQuizOpen(false)} />}
      </CardContent>
    </Card>
  );
}

function AddChapter({ onAdd }: { onAdd: (title: string) => Promise<void> }) {
  const [title, setTitle] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onAdd(title).then(() => setTitle("")).catch(() => undefined);
      }}
    >
      <Input aria-label="Titre du nouveau chapitre" placeholder="Titre du nouveau chapitre" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={150} />
      <Button type="submit" variant="secondary">
        <Plus aria-hidden /> Chapitre
      </Button>
    </form>
  );
}
