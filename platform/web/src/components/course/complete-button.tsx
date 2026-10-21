"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/client-api";

/** Pour les leçons texte et PDF (la vidéo se marque terminée seule à 90 %). */
export function CompleteButton({ lessonId, completed }: { lessonId: number; completed: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (completed) {
    return (
      <p className="flex items-center gap-2 text-sm text-primary">
        <CheckCircle2 className="size-4" aria-hidden /> Leçon terminée
      </p>
    );
  }

  async function complete() {
    setPending(true);
    try {
      await apiFetch(`/lessons/${lessonId}/progress`, { method: "PUT", body: { positionSeconds: 0, completed: true } });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button onClick={complete} disabled={pending} size="lg" className="h-11 self-start rounded-xl px-5">
      <CheckCircle2 aria-hidden /> {pending ? "Enregistrement…" : "Marquer comme terminée"}
    </Button>
  );
}
