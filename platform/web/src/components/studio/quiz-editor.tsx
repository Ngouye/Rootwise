"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FormAlert } from "@/components/auth/form-alert";
import { selectClass } from "@/components/studio/new-course-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch } from "@/lib/client-api";
import type { StudioQuestion, StudioQuiz } from "@/lib/studio";

const emptyQuestion = (): StudioQuestion => ({
  kind: "SINGLE",
  promptMd: "",
  explanationMd: "",
  points: 1,
  choices: [
    { labelMd: "", correct: true },
    { labelMd: "", correct: false },
  ],
});

/** Quiz de fin de chapitre : chargé à l'ouverture, enregistré d'un bloc (les réussites passées restent acquises). */
export function QuizEditor({ chapterId, onClose }: { chapterId: number; onClose: () => void }) {
  const [quiz, setQuiz] = useState<StudioQuiz | null>(null);
  const [exists, setExists] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    apiFetch<StudioQuiz>(`/studio/chapters/${chapterId}/quiz`)
      .then((loaded) => {
        setQuiz({ ...loaded, questions: loaded.questions.map((q) => ({ ...q, explanationMd: q.explanationMd ?? "" })) });
        setExists(true);
      })
      .catch(() => setQuiz({ passScorePct: 70, maxAttempts: null, questions: [emptyQuestion()] }));
  }, [chapterId]);

  if (!quiz) return <p className="text-sm text-muted-foreground">Chargement du quiz…</p>;

  const update = (change: (draft: StudioQuiz) => void) => {
    const next = structuredClone(quiz);
    change(next);
    setQuiz(next);
  };

  async function save() {
    setPending(true);
    setMessage(null);
    try {
      await apiFetch(`/studio/chapters/${chapterId}/quiz`, { method: "PUT", body: quiz });
      setExists(true);
      setMessage({ tone: "success", text: "Quiz enregistré." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof ApiError ? err.message : "Enregistrement impossible." });
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    await apiFetch(`/studio/chapters/${chapterId}/quiz`, { method: "DELETE" });
    onClose();
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4">
      {message && <FormAlert tone={message.tone}>{message.text}</FormAlert>}
      <div className="flex flex-wrap gap-4">
        <div className="flex w-40 flex-col gap-1.5">
          <Label htmlFor={`pass-${chapterId}`}>Seuil de réussite (%)</Label>
          <Input
            id={`pass-${chapterId}`}
            type="number"
            min={1}
            max={100}
            value={quiz.passScorePct}
            onChange={(event) => update((draft) => void (draft.passScorePct = Number(event.target.value)))}
          />
        </div>
        <div className="flex w-48 flex-col gap-1.5">
          <Label htmlFor={`attempts-${chapterId}`}>Tentatives (vide = illimité)</Label>
          <Input
            id={`attempts-${chapterId}`}
            type="number"
            min={1}
            max={20}
            value={quiz.maxAttempts ?? ""}
            onChange={(event) => update((draft) => void (draft.maxAttempts = event.target.value ? Number(event.target.value) : null))}
          />
        </div>
      </div>

      <ol className="flex flex-col gap-4">
        {quiz.questions.map((question, qIndex) => (
          <li key={qIndex} className="flex flex-col gap-3 rounded-lg border bg-background p-3">
            <div className="flex flex-wrap items-end gap-3">
              <span className="font-mono text-sm text-muted-foreground">Q{qIndex + 1}</span>
              <select
                aria-label="Type de question"
                className={`${selectClass} w-56`}
                value={question.kind}
                onChange={(event) =>
                  update((draft) => {
                    const target = draft.questions[qIndex];
                    target.kind = event.target.value as StudioQuestion["kind"];
                    if (target.kind === "SINGLE") {
                      const first = target.choices.findIndex((choice) => choice.correct);
                      target.choices.forEach((choice, index) => (choice.correct = index === Math.max(0, first)));
                    }
                  })
                }
              >
                <option value="SINGLE">Une seule bonne réponse</option>
                <option value="MULTIPLE">Plusieurs bonnes réponses</option>
              </select>
              <Input
                aria-label="Points"
                type="number"
                min={1}
                max={10}
                className="w-20"
                value={question.points}
                onChange={(event) => update((draft) => void (draft.questions[qIndex].points = Number(event.target.value)))}
              />
              <span className="text-xs text-muted-foreground">points</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="ml-auto"
                aria-label={`Supprimer la question ${qIndex + 1}`}
                disabled={quiz.questions.length === 1}
                onClick={() => update((draft) => void draft.questions.splice(qIndex, 1))}
              >
                <Trash2 />
              </Button>
            </div>
            <Textarea
              aria-label="Énoncé"
              placeholder="Énoncé (Markdown et LaTeX acceptés)"
              rows={2}
              value={question.promptMd}
              onChange={(event) => update((draft) => void (draft.questions[qIndex].promptMd = event.target.value))}
            />
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-xs text-muted-foreground">Choix (cochez la ou les bonnes réponses)</legend>
              {question.choices.map((choice, cIndex) => (
                <div key={cIndex} className="flex items-center gap-2">
                  <input
                    type={question.kind === "SINGLE" ? "radio" : "checkbox"}
                    name={`correct-${chapterId}-${qIndex}`}
                    aria-label={`Choix ${cIndex + 1} correct`}
                    checked={choice.correct}
                    className="accent-[var(--primary)]"
                    onChange={(event) =>
                      update((draft) => {
                        const choices = draft.questions[qIndex].choices;
                        if (question.kind === "SINGLE") choices.forEach((item, index) => (item.correct = index === cIndex));
                        else choices[cIndex].correct = event.target.checked;
                      })
                    }
                  />
                  <Input
                    aria-label={`Texte du choix ${cIndex + 1}`}
                    value={choice.labelMd}
                    onChange={(event) => update((draft) => void (draft.questions[qIndex].choices[cIndex].labelMd = event.target.value))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Supprimer le choix ${cIndex + 1}`}
                    disabled={question.choices.length <= 2}
                    onClick={() => update((draft) => void draft.questions[qIndex].choices.splice(cIndex, 1))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              {question.choices.length < 8 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="self-start"
                  onClick={() => update((draft) => void draft.questions[qIndex].choices.push({ labelMd: "", correct: false }))}
                >
                  <Plus aria-hidden /> Ajouter un choix
                </Button>
              )}
            </fieldset>
            <Textarea
              aria-label="Explication"
              placeholder="Explication affichée après correction (facultatif)"
              rows={2}
              value={question.explanationMd}
              onChange={(event) => update((draft) => void (draft.questions[qIndex].explanationMd = event.target.value))}
            />
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => update((draft) => void draft.questions.push(emptyQuestion()))}>
          <Plus aria-hidden /> Question
        </Button>
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer le quiz"}
        </Button>
        {exists && (
          <Button type="button" variant="destructive" onClick={remove}>
            Supprimer le quiz
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
}
