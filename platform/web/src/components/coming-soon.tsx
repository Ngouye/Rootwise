import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";

type ComingSoonProps = {
  title: string;
  summary: string;
  step: number;
};

export function ComingSoon({ title, summary, step }: ComingSoonProps) {
  return (
    <section className="container-page flex flex-1 items-center py-16">
      <Reveal className="w-full">
        <div className="surface-navy relative mx-auto flex max-w-3xl flex-col items-center gap-5 overflow-hidden rounded-[2rem] px-6 py-16 text-center text-white shadow-lift">
          <div aria-hidden className="glow-arc animate-spin-slow -top-1/2 left-1/2 aspect-square w-[90%] -translate-x-1/2 opacity-50" />
          <span className="animate-float relative flex size-16 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-[oklch(0.82_0.12_190)]">
            <Sparkles className="size-7" aria-hidden />
          </span>
          <span className="relative rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-xs text-white/70">
            Bientôt disponible · étape {step}
          </span>
          <h1 className="heading-section relative text-white">{title}</h1>
          <p className="relative max-w-lg text-white/75">{summary}</p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <Link href="/cours" className={buttonVariants({ size: "lg", className: "group h-11 rounded-xl bg-[oklch(0.78_0.12_182)] px-5 text-[oklch(0.2_0.045_250)] hover:bg-[oklch(0.84_0.11_182)]" })}>
              En attendant, suivre un cours
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link href="/" className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 rounded-xl border-white/25 bg-white/5 px-5 text-white hover:bg-white/15 hover:text-white" })}>
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
