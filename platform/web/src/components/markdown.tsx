import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { AlertTriangle, Info, Lightbulb, OctagonAlert, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import { CopyButton } from "@/components/copy-button";
import { remarkCallouts, type CalloutType } from "@/lib/remark-callouts";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

/** Seules les images envoyées sur la plateforme s'affichent : pas de pixel espion d'un site tiers. */
const PLATFORM_IMAGE = /^\/api\/public\/media\/\d+$/;

const ICONES: Record<CalloutType, LucideIcon> = {
  note: Info,
  tip: Lightbulb,
  important: Sparkles,
  warning: AlertTriangle,
  caution: OctagonAlert,
};

/** Nom affiché dans la barre de titre d'un bloc de code, selon son langage. */
const LANGAGES: Record<string, string> = {
  bash: "bash", sh: "bash", shell: "bash", zsh: "zsh", console: "terminal", powershell: "PowerShell",
  js: "JavaScript", javascript: "JavaScript", ts: "TypeScript", json: "JSON", yaml: "YAML", yml: "YAML",
  ini: "configuration", conf: "configuration", java: "Java", python: "Python", sql: "SQL", text: "texte",
};

type NoeudHast = { type: string; value?: string; tagName?: string; children?: NoeudHast[];
  properties?: { className?: unknown }; data?: { meta?: string | null } };

const texteDe = (noeud?: NoeudHast): string =>
  noeud?.type === "text" ? noeud.value ?? "" : (noeud?.children ?? []).map(texteDe).join("");

const components: Components = {
  // Une image Markdown est rendue dans un paragraphe : uniquement des éléments en ligne (span).
  img: ({ src, alt, title }) => {
    if (typeof src !== "string" || !PLATFORM_IMAGE.test(src)) {
      return <span className="text-sm text-muted-foreground">[image non affichée{alt ? ` : ${alt}` : ""}]</span>;
    }
    return (
      <span className="my-2 flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- image servie par l'API, dimensions inconnues */}
        <img src={src} alt={alt ?? ""} title={title ?? undefined} loading="lazy" decoding="async" className="h-auto max-w-full rounded-lg" />
        {title && <span className="text-center text-sm text-muted-foreground">{title}</span>}
      </span>
    );
  },
  // Encadrés « > [!TIP] Titre » produits par remarkCallouts.
  aside: ({ className, children, ...props }) => {
    const type = (props as Record<string, unknown>)["data-callout"] as CalloutType | undefined;
    if (!type) return <aside className={className}>{children}</aside>;
    const Icone = ICONES[type];
    return (
      <aside className={cn("callout", `callout-${type}`)}>
        <Icone className="callout-icon" aria-hidden />
        <div className="callout-body">{children}</div>
      </aside>
    );
  },
  // Blocs de code en fenêtre de terminal : langage ou titre (```bash title="surveiller.sh"), bouton Copier.
  pre: ({ node, children }) => {
    const code = (node as NoeudHast | undefined)?.children?.find((enfant) => enfant.tagName === "code");
    const classes = Array.isArray(code?.properties?.className) ? code.properties.className.join(" ") : "";
    const langage = /language-([\w-]+)/.exec(classes)?.[1];
    const titre = /title="([^"]+)"/.exec(code?.data?.meta ?? "")?.[1] ?? (langage ? LANGAGES[langage] ?? langage : null);
    return (
      <div className="code-window">
        <div className="code-window-bar">
          <span className="code-window-dots" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          {titre && <span className="code-window-title">{titre}</span>}
          <CopyButton text={texteDe(code).replace(/\n$/, "")} />
        </div>
        <pre>{children}</pre>
      </div>
    );
  },
};

/**
 * Markdown des cours, quiz et (plus tard) du forum : tableaux, formules LaTeX ($…$, $$…$$),
 * blocs de code colorés, encadrés (`> [!TIP] Titre`) et images hébergées par la plateforme
 * (`![description](/api/public/media/12 "légende")`). Le HTML brut éventuellement présent n'est
 * jamais interprété (pas de rehype-raw) et les liens javascript: sont neutralisés : pas de XSS.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("markdown", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath, remarkCallouts]} rehypePlugins={[rehypeKatex, rehypeHighlight]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
