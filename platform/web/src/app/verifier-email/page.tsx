import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmail } from "@/components/auth/verify-email";

export const metadata: Metadata = { title: "Activer mon compte", robots: { index: false } };

export default function VerifyEmailPage() {
  return (
    <AuthCard title="Activer mon compte" description="Confirmez votre adresse e-mail pour terminer l'inscription.">
      <VerifyEmail />
    </AuthCard>
  );
}
