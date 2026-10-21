"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { apiFetch } from "@/lib/client-api";
import { field, useApiForm } from "@/lib/use-api-form";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const [resent, setResent] = useState(false);

  const form = useApiForm(async (data) => {
    await apiFetch("/auth/login", {
      method: "POST",
      body: { email: field(data, "email"), password: field(data, "password") },
    });
    router.replace(next);
    router.refresh();
  });

  async function resendVerification() {
    await apiFetch("/auth/verify-email/resend", {
      method: "POST",
      body: { email: emailRef.current?.value ?? "" },
    }).catch(() => undefined);
    setResent(true);
  }

  return (
    <form onSubmit={form.onSubmit} className="flex flex-col gap-4">
      {form.error && (
        <FormAlert>
          {form.error.message}
          {form.error.code === "EMAIL_NOT_VERIFIED" && !resent && (
            <Button type="button" variant="link" className="h-auto p-0" onClick={resendVerification}>
              Renvoyer l&apos;e-mail de confirmation
            </Button>
          )}
        </FormAlert>
      )}
      {resent && <FormAlert tone="success">Si le compte existe et n&apos;est pas encore activé, un nouveau lien vient d&apos;être envoyé.</FormAlert>}

      <FormField
        ref={emailRef}
        name="email"
        label="Adresse e-mail"
        type="email"
        autoComplete="email"
        required
        error={form.fieldErrors.email}
      />
      <div className="flex flex-col gap-1.5">
        <FormField
          name="password"
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          error={form.fieldErrors.password}
        />
        <Link href="/mot-de-passe-oublie" className="self-end text-xs text-muted-foreground hover:text-foreground">
          Mot de passe oublié ?
        </Link>
      </div>

      <Button type="submit" disabled={form.pending}>
        {form.pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
