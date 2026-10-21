"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { apiFetch } from "@/lib/client-api";
import { field, useApiForm } from "@/lib/use-api-form";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const form = useApiForm(async (data) => {
    await apiFetch("/auth/password/forgot", { method: "POST", body: { email: field(data, "email") } });
    setSent(true);
  });

  if (sent) {
    return (
      <FormAlert tone="success">
        Si un compte correspond à cette adresse, un lien de réinitialisation vient d&apos;être envoyé.
        Il expire dans 30 minutes.
      </FormAlert>
    );
  }

  return (
    <form onSubmit={form.onSubmit} className="flex flex-col gap-4">
      {form.error && form.error.code !== "VALIDATION_ERROR" && <FormAlert>{form.error.message}</FormAlert>}
      <FormField
        name="email"
        label="Adresse e-mail du compte"
        type="email"
        autoComplete="email"
        required
        error={form.fieldErrors.email}
      />
      <Button type="submit" disabled={form.pending}>
        {form.pending ? "Envoi…" : "Recevoir un lien"}
      </Button>
    </form>
  );
}
