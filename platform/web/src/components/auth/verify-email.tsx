"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/auth/form-alert";
import { apiFetch } from "@/lib/client-api";
import { useApiForm } from "@/lib/use-api-form";
import { clearHash, useHashToken } from "@/lib/use-hash-token";

/**
 * Activation par un clic explicite plutôt qu'automatiquement au chargement : les antivirus
 * de messagerie qui ouvrent les liens ne consomment pas le jeton à la place du membre.
 */
export function VerifyEmail() {
  const router = useRouter();
  const token = useHashToken();

  const form = useApiForm(async () => {
    await apiFetch("/auth/verify-email", { method: "POST", body: { token } });
    clearHash();
    router.replace("/");
    router.refresh();
  });

  if (!token) {
    return (
      <FormAlert>
        Ce lien est incomplet. Ouvrez directement le lien reçu par e-mail, ou{" "}
        <Link href="/connexion" className="underline">connectez-vous</Link> pour en recevoir un nouveau.
      </FormAlert>
    );
  }

  return (
    <form onSubmit={form.onSubmit} className="flex flex-col gap-4">
      {form.error && (
        <FormAlert>
          {form.error.message}{" "}
          {form.error.code === "INVALID_TOKEN" && (
            <>
              <Link href="/connexion" className="underline">Connectez-vous</Link> pour recevoir un nouveau lien.
            </>
          )}
        </FormAlert>
      )}
      <Button type="submit" disabled={form.pending}>
        {form.pending ? "Activation…" : "Activer mon compte"}
      </Button>
    </form>
  );
}
