import type { ReactNode } from "react";
import { Award, BookOpenCheck, ShieldCheck, Terminal } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

type AuthCardProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

const BENEFITS = [
  { icon: BookOpenCheck, text: "Des cours structurés, du premier pas au cas réel" },
  { icon: Terminal, text: "Des commandes testées dans un vrai terminal" },
  { icon: Award, text: "Un certificat signé Ed25519, vérifiable par tous" },
  { icon: ShieldCheck, text: "Gratuit, sans publicité ni traceur tiers" },
];

/** Mise en page commune des écrans d'authentification : formulaire et panneau de bienvenue. */
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="container-page flex flex-1 items-center py-10 lg:py-16">
      <div className="surface mx-auto grid w-full max-w-5xl overflow-hidden shadow-lift lg:grid-cols-[1fr_1.05fr]">
        <Reveal y={16} className="flex flex-col justify-center gap-6 p-6 sm:p-10">
          <div className="flex flex-col gap-2">
            <h1 className="heading-display text-3xl">{title}</h1>
            {description && <div className="text-sm text-muted-foreground">{description}</div>}
          </div>
          <div className="flex flex-col gap-4">{children}</div>
          {footer && <div className="text-sm text-muted-foreground">{footer}</div>}
        </Reveal>
        <div className="surface-navy relative hidden flex-col justify-between gap-10 overflow-hidden p-10 text-white lg:flex">
          <div aria-hidden className="glow-arc animate-spin-slow -right-[62%] -bottom-[62%] aspect-square w-[100%] opacity-35" />
          <div className="relative flex flex-col gap-4">
            <span className="w-fit rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-[oklch(0.85_0.1_190)]">
              Communauté ouverte
            </span>
            <p className="heading-section text-white">
              Apprenez la cybersécurité <span className="text-[oklch(0.82_0.12_190)]">à votre rythme.</span>
            </p>
          </div>
          <ul className="relative flex flex-col gap-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit.text} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-[oklch(0.82_0.12_190)]">
                  <benefit.icon className="size-5" aria-hidden />
                </span>
                {benefit.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
