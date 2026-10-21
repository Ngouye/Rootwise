import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { cn } from "cn";
import { siteConfig } from "@/config/site";

/** Logo : pictogramme bouclier, nom et signature, comme l'en-tête « Haven & Co. ». */
export function BrandLogo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label={`${siteConfig.name} — accueil`}>
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.42_0.08_220)] text-primary-foreground shadow-soft transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
        <ShieldCheck className="size-5" aria-hidden />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("text-[0.95rem] font-extrabold tracking-tight", inverted ? "text-white" : "text-foreground")}>
          {siteConfig.name}
        </span>
        <span className={cn("mt-1 text-[0.68rem] font-medium", inverted ? "text-white/60" : "text-muted-foreground")}>
          {siteConfig.tagline}
        </span>
      </span>
    </Link>
  );
}
