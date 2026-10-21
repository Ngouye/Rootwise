import { buttonVariants } from "@/components/ui/button";

const LABELS: Record<string, string> = {
  google: "Continuer avec Google",
  github: "Continuer avec GitHub",
};

/**
 * Liens vers le parcours OAuth de l'API (navigation complète, pas un appel fetch) :
 * seuls les fournisseurs configurés côté serveur sont affichés.
 */
export function OAuthButtons({ providers }: { providers: string[] }) {
  const available = providers.filter((provider) => provider in LABELS);
  if (available.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {available.map((provider) => (
        <a
          key={provider}
          href={`/oauth2/authorization/${provider}`}
          className={buttonVariants({ variant: "outline", className: "w-full" })}
        >
          {LABELS[provider]}
        </a>
      ))}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou par e-mail
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
