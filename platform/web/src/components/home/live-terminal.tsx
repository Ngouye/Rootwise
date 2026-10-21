"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotionAfterHydration } from "@/components/motion/use-reduced-motion-after-hydration";

type Session = { command: string; output: string[] };

/** Extraits réels des cours : chaque commande et sa sortie. */
const SESSIONS: Session[] = [
  {
    command: "echo -n test | openssl dgst -sha256",
    output: ["SHA2-256(stdin)= 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"],
  },
  {
    command: "sudo usermod -aG docker alice && id -nG alice",
    output: ["alice sudo editeurs docker"],
  },
  {
    command: "sudo ss -tulpn | head -3",
    output: [
      "Netid State  Local Address:Port   Process",
      "tcp   LISTEN 0.0.0.0:22           users:((\"sshd\",pid=972))",
      "tcp   LISTEN 0.0.0.0:443          users:((\"nginx\",pid=1021))",
    ],
  },
  {
    command: "sudo tail -F /var/log/nginx/access.log",
    output: [
      "203.0.113.45 - - \"GET /api/health HTTP/2\" 200 512",
      "198.51.100.7 - - \"POST /login HTTP/2\" 302 0",
      "tail: '/var/log/nginx/access.log' has been replaced; following new file",
    ],
  },
];

type Line = { kind: "command" | "output"; text: string };

/** Toute la démonstration d'un coup (animations réduites). */
const STATIC_LINES: Line[] = SESSIONS.flatMap((session) => [
  { kind: "command" as const, text: session.command },
  ...session.output.map((text) => ({ kind: "output" as const, text })),
]);

/** Terminal qui tape les commandes des cours, puis affiche leur sortie, en boucle. */
export function LiveTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduced = useReducedMotionAfterHydration();
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    if (reduced || !inView) return;
    let cancelled = false;
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    (async () => {
      let index = 0;
      while (!cancelled) {
        const session = SESSIONS[index % SESSIONS.length];
        for (let i = 1; i <= session.command.length && !cancelled; i++) {
          setTyping(session.command.slice(0, i));
          await wait(28 + Math.random() * 40);
        }
        await wait(260);
        if (cancelled) break;
        setTyping("");
        setLines((current) => [...current, { kind: "command" as const, text: session.command }].slice(-9));
        for (const text of session.output) {
          await wait(140);
          if (cancelled) break;
          setLines((current) => [...current, { kind: "output" as const, text }].slice(-9));
        }
        await wait(1600);
        index++;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inView, reduced]);

  return (
    <div ref={ref} className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] font-mono text-[0.78rem] shadow-lift">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[0.7rem] text-white/40">alice@srv01 — bash</span>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-1 p-4 leading-relaxed" aria-label="Démonstration de commandes" role="log">
        {(reduced ? STATIC_LINES : lines).map((line, index) => (
          <p key={index} className={line.kind === "command" ? "text-white" : "break-all text-[#7dd3c0]/80"}>
            {line.kind === "command" && <span className="text-[#5eead4]">$ </span>}
            {line.text}
          </p>
        ))}
        <p className="text-white">
          <span className="text-[#5eead4]">$ </span>
          {typing}
          <span className="ml-px inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[#5eead4]" aria-hidden />
        </p>
      </div>
    </div>
  );
}
