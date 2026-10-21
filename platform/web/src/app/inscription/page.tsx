import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { RegisterForm } from "@/components/auth/register-form";
import { getAuthProviders, getCurrentUser } from "@/lib/api";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");
  const providers = await getAuthProviders();

  return (
    <AuthCard
      title="Créer un compte"
      description="Rejoignez la communauté : cours, labo, forum et chat."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="text-foreground underline-offset-4 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <OAuthButtons providers={providers} />
      <RegisterForm />
    </AuthCard>
  );
}
