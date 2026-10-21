import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { FormAlert } from "@/components/auth/form-alert";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { getAuthProviders, getCurrentUser } from "@/lib/api";
import { safeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Connexion" };

/** Messages des retours d'erreur du parcours OAuth (paramètre ?erreur=). */
const OAUTH_ERRORS: Record<string, string> = {
  oauth: "La connexion avec le fournisseur a échoué. Réessayez.",
  "email-non-verifie": "Ce compte Google ou GitHub ne fournit pas d'adresse e-mail vérifiée.",
  "compte-suspendu": "Ce compte est suspendu.",
};

export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  const { suivant, erreur } = await searchParams;
  const next = safeRedirect(suivant);
  if (await getCurrentUser()) redirect(next);

  const providers = await getAuthProviders();
  const oauthError = typeof erreur === "string" ? OAUTH_ERRORS[erreur] : undefined;

  return (
    <AuthCard
      title="Connexion"
      description="Heureux de vous revoir."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-foreground underline-offset-4 hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      {oauthError && <FormAlert>{oauthError}</FormAlert>}
      <OAuthButtons providers={providers} />
      <LoginForm next={next} />
    </AuthCard>
  );
}
