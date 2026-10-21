"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "cn";
import { FormAlert } from "@/components/auth/form-alert";
import { Markdown } from "@/components/markdown";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/client-api";
import type { AttemptResult, LearnerQuiz } from "@/lib/courses";

type QuizFormProps = {
  quiz: LearnerQuiz;
  courseSlug: string;
};

/** Les explications n'arrivent qu'avec la correction : le Markdown (LaTeX, code) est rendu ici. */
export function QuizForm({ quiz, courseSlug }: QuizFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const attemptsLeft = quiz.maxAttempts === null ? null : quiz.maxAttempts - (result?.attemptsUsed ?? quiz.attemptsUsed);
  const outOfAttempts = attemptsLeft !== null && attemptsLeft <= 0;
  const byQuestion = new Map(result?.results.map((item) => [item.questionId, item]) ?? []);

  function toggle(questionId: number, choiceId: number, single: boolean) {
    if (result) return;
    setSelected((current) => {
      const chosen = current[questionId] ?? [];
      const next = single ? [choiceId] : chosen.includes(choiceId) ? chosen.filter((id) => id !== choiceId) : [...chosen, choiceId];
      return { ...current, [questionId]: next };
    });
  }

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const answers = quiz.questions.map((question) => ({ questionId: question.id, choiceIds: selected[question.id] ?? [] }));
      setResult(await apiFetch<AttemptResult>(`/chapters/${quiz.chapterId}/quiz/attempts`, { method: "POST", body: { answers } }));
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Envoi impossible, réessayez.");
    } finally {
      setPending(false);
    }
  }

  function retry() {
    setResult(null);
    setSelected({});
  }

  const unanswered = quiz.questions.some((question) => !(selected[question.id]?.length));

  return (
    <div className="flex flex-col gap-6">
      {result && (
        <FormAlert tone={result.passed ? "success" : "error"}>
          <strong>{result.scorePct} %</strong> — {result.passed ? "Quiz réussi, bravo !" : `il faut ${quiz.passScorePct} % pour valider le chapitre.`}
          {!result.revealed && !result.passed && " Les corrigés s'afficheront quand vous aurez réussi."}
        </FormAlert>
      )}
      {error && <FormAlert>{error}</FormAlert>}

      <ol className="flex flex-col gap-6">
        {quiz.questions.map((question, index) => {
          const outcome = byQuestion.get(question.id);
          const single = question.kind === "SINGLE";
          return (
            <li key={question.id} className="rounded-xl border p-4 sm:p-5">
              <fieldset className="flex flex-col gap-3" aria-labelledby={`question-${question.id}-prompt`}>
                <div id={`question-${question.id}-prompt`} className="mb-2 flex w-full items-start gap-3">
                  <span className="font-mono text-sm text-muted-foreground">{index + 1}.</span>
                  <Markdown className="flex-1">{question.promptMd}</Markdown>
                  {outcome &&
                    (outcome.correct ? (
                      <CheckCircle2 className="size-5 shrink-0 text-primary" aria-label="bonne réponse" />
                    ) : (
                      <XCircle className="size-5 shrink-0 text-destructive" aria-label="mauvaise réponse" />
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {single ? "Une seule réponse" : "Plusieurs réponses possibles"} · {question.points} pt{question.points > 1 ? "s" : ""}
                </p>
                {question.choices.map((choice) => {
                  const checked = (selected[question.id] ?? []).includes(choice.id);
                  const isRight = outcome?.correctChoiceIds?.includes(choice.id);
                  return (
                    <label
                      key={choice.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                        checked ? "border-primary/60 bg-primary/5" : "hover:bg-muted/50",
                        isRight && "border-primary bg-primary/10",
                        result && "cursor-default",
                      )}
                    >
                      <input
                        type={single ? "radio" : "checkbox"}
                        name={`question-${question.id}`}
                        checked={checked}
                        disabled={!!result}
                        onChange={() => toggle(question.id, choice.id, single)}
                        className="mt-1 accent-[var(--primary)]"
                      />
                      <Markdown className="flex-1 text-sm">{choice.labelMd}</Markdown>
                    </label>
                  );
                })}
                {outcome?.explanationMd && (
                  <Markdown className="rounded-lg bg-muted/50 px-3 py-2 text-sm">{outcome.explanationMd}</Markdown>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        {!result && (
          <Button onClick={submit} disabled={pending || unanswered || outOfAttempts}>
            {pending ? "Correction…" : "Valider mes réponses"}
          </Button>
        )}
        {result && !result.passed && !outOfAttempts && (
          <Button onClick={retry} variant="secondary">
            Réessayer
          </Button>
        )}
        {result?.passed && (
          <Link href={`/cours/${courseSlug}`} className={buttonVariants()}>
            Retour au cours
          </Link>
        )}
        {attemptsLeft !== null && (
          <span className="text-sm text-muted-foreground">
            {outOfAttempts ? "Plus aucune tentative." : `${attemptsLeft} tentative${attemptsLeft > 1 ? "s" : ""} restante${attemptsLeft > 1 ? "s" : ""}.`}
          </span>
        )}
      </div>
    </div>
  );
}
