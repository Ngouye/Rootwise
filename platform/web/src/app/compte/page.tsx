import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { ProfileForm } from "@/components/profile-form";
import { Reveal } from "@/components/motion/reveal";
import { getCurrentUser, isCreator } from "@/lib/api";

export const metadata: Metadata = { title: "Mon compte" };

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  CREATOR: "Professeur / créateur",
  MODERATOR: "Modérateur",
  MEMBER: "Membre",
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  EXPERT: "Expert",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?suivant=/compte");

  return (
    <div className="container-page max-w-4xl py-12">
      <Reveal className="flex flex-col gap-2">
        <span className="eyebrow w-fit">Mon compte</span>
        <h1 className="heading-display text-4xl">
          Bonjour, <span className="text-accent-gradient">{user.displayName}</span>
        </h1>
        <p className="text-muted-foreground">
          Votre profil public{isCreator(user) && " apparaît sur vos cours et sur chaque leçon"}.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_17rem]">
        <Reveal delay={0.05}>
          <section className="surface p-6 sm:p-8" aria-labelledby="profil">
            <h2 id="profil" className="mb-6 text-lg font-bold">Profil public</h2>
            <ProfileForm
              initial={{ displayName: user.displayName, headline: user.headline, bio: user.bio, avatarUrl: user.avatarUrl }}
            />
          </section>
        </Reveal>
        <Reveal delay={0.1}>
          <section className="surface flex flex-col gap-5 p-6" aria-labelledby="identite">
            <h2 id="identite" className="text-lg font-bold">Identifiants</h2>
            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold text-muted-foreground">Nom d&apos;utilisateur</dt>
                <dd className="font-mono">@{user.username}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold text-muted-foreground">Adresse e-mail</dt>
                <dd className="flex flex-wrap items-center gap-2 break-all">
                  {user.email}
                  {user.emailVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[0.7rem] font-bold text-primary">
                      <BadgeCheck className="size-3" aria-hidden /> vérifiée
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold text-muted-foreground">Rôles</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {user.roles.map((role) => (
                    <span key={role} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                      {ROLE_LABELS[role] ?? role}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold text-muted-foreground">Niveau</dt>
                <dd>{LEVEL_LABELS[user.expertiseLevel] ?? user.expertiseLevel}</dd>
              </div>
            </dl>
            {isCreator(user) && (
              <Link href={`/formateurs/${user.username}`} className="group inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Voir mon profil public
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            )}
          </section>
        </Reveal>
      </div>
    </div>
  );
}
