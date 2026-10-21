"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { ApiError, apiFetch } from "@/lib/client-api";
import { field, useApiForm } from "@/lib/use-api-form";
import { clearHash, useHashToken } from "@/lib/use-hash-token";

export function ResetPasswordForm() {
  const token = useHashToken();
  const [done, setDone] = useState(false);

  const form = useApiForm(async (data) => {
    const password = field(data, "password");
    if (password !== field(data, "confirmation")) {
      throw new ApiError(400, "VALIDATION_ERROR", "Les deux mots de passe diffèrent.", {
        confirmation: "Les deux mots de passe diffèrent.",
      });
    }
    await apiFetch("/auth/password/reset", { method: "POST", body: { token, password } });
    clearHash();
    setDone(true);
  });

  if (done) {
    return (
      <FormAlert tone="success">
        Mot de passe modifié. Toutes vos sessions ont été fermées :{" "}
        <Link href="/connexion" className="underline">connectez-vous</Link> avec le nouveau.
      </FormAlert>
    );
  }
  if (!token) {
    return (
      <FormAlert>
        Ce lien est incomplet.{" "}
        <Link href="/mot-de-passe-oublie" className="underline">Demandez un nouveau lien</Link>.
      </FormAlert>
    );
  }

  return (
    <form onSubmit={form.onSubmit} className="flex flex-col gap-4">
      {form.error && form.error.code !== "VALIDATION_ERROR" && (
        <FormAlert>
          {form.error.message}{" "}
          {form.error.code === "INVALID_TOKEN" && (
            <Link href="/mot-de-passe-oublie" className="underline">Demander un nouveau lien</Link>
          )}
        </FormAlert>
      )}
      <FormField
        name="password"
        label="Nouveau mot de passe"
        type="password"
        autoComplete="new-password"
        required
        minLength={12}
        maxLength={128}
        hint="12 caractères minimum."
        error={form.fieldErrors.password}
      />
      <FormField
        name="confirmation"
        label="Confirmation"
        type="password"
        autoComplete="new-password"
        required
        error={form.fieldErrors.confirmation}
      />
      <Button type="submit" disabled={form.pending}>
        {form.pending ? "Enregistrement…" : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
