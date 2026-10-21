import { Activity, Hash, KeyRound, Lock, Network, ShieldCheck, SquareTerminal, Terminal, type LucideIcon } from "lucide-react";

const INNER: LucideIcon[] = [Lock, KeyRound, Hash];
const OUTER: LucideIcon[] = [Terminal, Network, Activity, SquareTerminal];

/** Bouclier central et thèmes en orbite (deux anneaux tournant en sens inverse). */
export function Orbit() {
  return (
    <div aria-hidden className="relative mx-auto flex aspect-square w-full max-w-[17rem] items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-dashed border-primary/25" />
      <div className="absolute inset-[22%] rounded-full border border-primary/20" />
      <Ring icons={OUTER} className="animate-orbit" radius={50} />
      <Ring icons={INNER} className="animate-orbit-reverse" radius={28} />
      <span className="animate-pulse-ring relative flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.42_0.08_220)] text-primary-foreground shadow-lift">
        <ShieldCheck className="size-9" />
      </span>
    </div>
  );
}

function Ring({ icons, className, radius }: { icons: LucideIcon[]; className: string; radius: number }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {icons.map((Icon, index) => {
        const angle = (index / icons.length) * Math.PI * 2;
        return (
          <span
            key={index}
            className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border bg-card text-primary shadow-soft"
            style={{ left: `${50 + radius * Math.cos(angle)}%`, top: `${50 + radius * Math.sin(angle)}%` }}
          >
            {/* L'icône tourne en sens inverse de l'anneau pour rester droite. */}
            <span className={`flex ${className === "animate-orbit" ? "animate-orbit-reverse" : "animate-orbit"}`}>
              <Icon className="size-5" />
            </span>
          </span>
        );
      })}
    </div>
  );
}
