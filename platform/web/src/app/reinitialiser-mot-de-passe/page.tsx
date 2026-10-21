import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Nouveau mot de passe" description="Choisissez un nouveau mot de passe pour votre compte.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
