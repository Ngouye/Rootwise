"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { apiFetch } from "@/lib/client-api";
import { field, useApiForm } from "@/lib/use-api-form";

export function RegisterForm() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const form = useApiForm(async (data) => {
    const email = field(data, "email");
    await apiFetch("/auth/register", {
      method: "POST",
      body: {
        displayName: field(data, "displayName"),
        username: field(data, "username"),
        email,
        password: field(data, "password"),
      },
    });
    setRegisteredEmail(email);
  });

  if (registeredEmail) {
    return (
      <FormAlert tone="success">
        Presque terminé ! Un lien de confirmation vient d&apos;être envoyé à <strong>{registeredEmail}</strong>.
        Ouvrez-le pour activer votre compte (pensez aux courriers indésirables).
      </FormAlert>
    );
  }

  return (
    <form onSubmit={form.onSubmit} className="flex flex-col gap-4">
      {form.error && form.error.code !== "VALIDATION_ERROR" && <FormAlert>{form.error.message}</FormAlert>}

      <FormField
        name="displayName"
        label="Nom affiché"
        autoComplete="name"
        required
        minLength={2}
        maxLength={50}
        error={form.fieldErrors.displayName}
      />
      <FormField
        name="username"
        label="Nom d'utilisateur"
        autoComplete="username"
        required
        pattern="[a-zA-Z0-9_.\-]{3,30}"
        hint="Public. 3 à 30 caractères : lettres, chiffres, . - _"
        error={form.error?.code === "USERNAME_TAKEN" ? form.error.message : form.fieldErrors.username}
      />
      <FormField
        name="email"
        label="Adresse e-mail"
        type="email"
        autoComplete="email"
        required
        error={form.fieldErrors.email}
      />
      <FormField
        name="password"
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        required
        minLength={12}
        maxLength={128}
        hint="12 caractères minimum. Une phrase de passe est idéale."
        error={form.fieldErrors.password}
      />

      <Button type="submit" disabled={form.pending}>
        {form.pending ? "Création du compte…" : "Créer mon compte"}
      </Button>
    </form>
  );
}
