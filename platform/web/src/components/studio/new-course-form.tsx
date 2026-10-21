"use client";

import { useRouter } from "next/navigation";
import { FormAlert } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/client-api";
import { LEVEL_LABELS, type Level } from "@/lib/courses";
import { field, useApiForm } from "@/lib/use-api-form";

export const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function NewCourseForm() {
  const router = useRouter();
  const form = useApiForm(async (data) => {
    const created = await apiFetch<{ id: number }>("/studio/courses", {
      method: "POST",
      body: { title: field(data, "title"), summary: field(data, "summary"), level: field(data, "level") },
    });
    router.push(`/studio/cours/${created.id}`);
  });

  return (
    <form onSubmit={form.onSubmit} className="flex flex-col gap-4">
      {form.error && form.error.code !== "VALIDATION_ERROR" && <FormAlert>{form.error.message}</FormAlert>}
      <FormField name="title" label="Titre du cours" required maxLength={150} error={form.fieldErrors.title} />
      <FormField name="summary" label="Résumé (une phrase)" required maxLength={300} error={form.fieldErrors.summary} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="field-level">Niveau</Label>
        <select id="field-level" name="level" className={selectClass} defaultValue="BEGINNER">
          {(Object.keys(LEVEL_LABELS) as Level[]).map((level) => (
            <option key={level} value={level}>
              {LEVEL_LABELS[level]}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={form.pending}>
        {form.pending ? "Création…" : "Créer le brouillon"}
      </Button>
    </form>
  );
}
