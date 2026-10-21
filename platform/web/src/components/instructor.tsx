import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { cn } from "cn";
import { Avatar } from "@/components/avatar";
import type { Author } from "@/lib/courses";

function profileHref(author: Author) {
  return author.username ? `/formateurs/${author.username}` : null;
}

/** Pastille compacte « photo + nom + titre » (en-tête de leçon, programme). */
export function InstructorChip({ author, className }: { author: Author; className?: string }) {
  const href = profileHref(author);
  const content = (
    <>
      <span className="relative">
        <Avatar name={author.displayName} src={author.avatarUrl} className="size-11 ring-2 ring-card" />
        <span className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
          <BadgeCheck className="size-3" aria-hidden />
        </span>
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">Votre formateur</span>
        <span className="truncate text-sm font-bold text-foreground">{author.displayName}</span>
        {author.headline && <span className="truncate text-xs text-muted-foreground">{author.headline}</span>}
      </span>
    </>
  );
  const classes = cn("flex items-center gap-3 rounded-2xl border bg-card px-3 py-2.5 shadow-soft", className);
  return href ? (
    <Link href={href} className={cn(classes, "transition-colors hover:border-primary/40")}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

/** Carte « Votre formateur » de la colonne latérale (comme « Your Local Expert »). */
export function InstructorCard({ author, title = "Votre formateur", courseCount }: { author: Author; title?: string; courseCount?: number }) {
  const href = profileHref(author);
  return (
    <section className="surface flex flex-col gap-4 p-5" aria-label={title}>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <div className="flex items-center gap-4">
        <span className="relative rounded-full p-0.5 bg-gradient-to-br from-primary to-[oklch(0.7_0.12_205)]">
          <Avatar name={author.displayName} src={author.avatarUrl} className="size-16 ring-2 ring-card" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            {author.displayName}
            <BadgeCheck className="size-4 text-primary" aria-label="formateur vérifié" />
          </span>
          {author.headline && <span className="text-xs leading-5 text-muted-foreground">{author.headline}</span>}
          {courseCount !== undefined && (
            <span className="mt-1 text-xs font-semibold text-primary">
              {courseCount} cours sur la plateforme
            </span>
          )}
        </div>
      </div>
      {author.bio && <p className="line-clamp-5 text-sm leading-6 text-muted-foreground">{author.bio}</p>}
      {href && (
        <Link href={href} className="group inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Voir son profil
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </section>
  );
}
