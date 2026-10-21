"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/client-api";

/** Inscription gratuite puis ouverture de la première leçon. */
export function EnrollButton({ slug, firstLessonId }: { slug: string; firstLessonId: number | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enroll() {
    setPending(true);
    setError(null);
    try {
      await apiFetch(`/courses/${slug}/enrollment`, { method: "POST" });
      router.push(firstLessonId ? `/cours/${slug}/lecons/${firstLessonId}` : `/cours/${slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" onClick={enroll} disabled={pending} className="h-12 rounded-xl text-sm">
        {pending ? "Inscription…" : "Commencer le cours"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
