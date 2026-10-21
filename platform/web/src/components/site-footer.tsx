import Link from "next/link";
import { BadgeCheck, Globe2, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { FooterWordmark } from "@/components/footer-wordmark";
import { siteConfig } from "@/config/site";

const COLUMNS = [
  {
    title: "Apprendre",
    links: [
      { href: "/cours", label: "Tous les cours" },
      { href: "/cours?niveau=BEGINNER", label: "Pour débuter" },
      { href: "/cours?theme=linux", label: "Administration Linux" },
      { href: "/cours?theme=tls", label: "TLS et PKI" },
    ],
  },
  {
    title: "Communauté",
    links: [
      { href: "/labo", label: "Labo crypto" },
      { href: "/forum", label: "Forum" },
      { href: "/chat", label: "Chat" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Mon espace",
    links: [
      { href: "/inscription", label: "Créer un compte" },
      { href: "/connexion", label: "Connexion" },
      { href: "/mes-cours", label: "Mes cours" },
      { href: "/compte", label: "Mon profil" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="surface-navy noise relative mt-24 overflow-hidden text-white">
      <div aria-hidden className="glow-orb top-[-12rem] right-[-8rem] size-[28rem] opacity-40" />
      <div className="container-page relative grid gap-12 py-16 lg:grid-cols-[1.4fr_2fr]">
        <div className="flex max-w-sm flex-col gap-5">
          <BrandLogo inverted />
          <p className="text-sm leading-6 text-white/70">{siteConfig.description}</p>
          <ul className="flex flex-col gap-2 text-sm text-white/80">
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-glow" aria-hidden /> Certificats signés Ed25519, vérifiables par tous
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-glow" aria-hidden /> Aucune publicité, aucun traceur tiers
            </li>
            <li className="flex items-center gap-2">
              <Globe2 className="size-4 text-glow" aria-hidden /> Conçu à Dakar, ouvert au monde entier
            </li>
          </ul>
        </div>
        <nav aria-label="Pied de page" className="grid gap-8 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h2 className="text-xs font-bold tracking-[0.18em] text-white/50 uppercase">{column.title}</h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/80 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <FooterWordmark />
      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name} — communauté ouverte de cybersécurité.</p>
          <p>Cours conçus et enseignés par Ngouye GNING.</p>
        </div>
      </div>
    </footer>
  );
}
