import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Mot de passe oublié"
      description="Indiquez l'adresse de votre compte : nous vous enverrons un lien pour en choisir un nouveau."
      footer={
        <Link href="/connexion" className="text-foreground underline-offset-4 hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
