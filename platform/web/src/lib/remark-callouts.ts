/**
 * Encadrés dans le Markdown des cours, avec la syntaxe des « alertes » de GitHub et un titre
 * facultatif :
 *
 *   > [!TIP] Bon à savoir
 *   > Le texte de l'encadré, en Markdown.
 *
 * Types : NOTE, TIP, IMPORTANT, WARNING, CAUTION. Le blockquote devient un <aside class="callout">
 * dont le premier paragraphe est le titre (marqué « callout-title »).
 */

type Noeud = {
  type: string;
  value?: string;
  children?: Noeud[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
};

export const CALLOUT_TYPES = ["note", "tip", "important", "warning", "caution"] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];

const TITRES: Record<CalloutType, string> = {
  note: "À noter",
  tip: "Bon à savoir",
  important: "Important",
  warning: "Attention",
  caution: "Danger",
};

const MARQUE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*/;

/** Retire du paragraphe les nœuds de sa première ligne (texte, code, gras…) et les renvoie. */
function premiereLigne(enfants: Noeud[]): Noeud[] {
  const ligne: Noeud[] = [];
  while (enfants.length) {
    const noeud = enfants[0];
    if (noeud.type === "break") {
      enfants.shift();
      break;
    }
    if (noeud.type === "text" && noeud.value?.includes("\n")) {
      const fin = noeud.value.indexOf("\n");
      const avant = noeud.value.slice(0, fin);
      noeud.value = noeud.value.slice(fin + 1);
      if (avant) ligne.push({ type: "text", value: avant });
      if (!noeud.value) enfants.shift();
      break;
    }
    ligne.push(enfants.shift() as Noeud);
  }
  const dernier = ligne.at(-1);
  if (dernier?.type === "text") dernier.value = dernier.value?.trimEnd();
  return ligne.filter((noeud) => noeud.type !== "text" || noeud.value);
}

function transformer(noeud: Noeud) {
  noeud.children?.forEach(transformer);
  if (noeud.type !== "blockquote") return;
  const paragraphe = noeud.children?.[0];
  const texte = paragraphe?.type === "paragraph" ? paragraphe.children?.[0] : undefined;
  const marque = texte?.type === "text" ? MARQUE.exec(texte.value ?? "") : null;
  if (!paragraphe?.children || !texte || !marque) return;

  const type = marque[1].toLowerCase() as CalloutType;
  texte.value = (texte.value ?? "").slice(marque[0].length);
  if (!texte.value) paragraphe.children.shift();
  const titre = premiereLigne(paragraphe.children);
  if (!paragraphe.children.length) noeud.children?.shift();

  noeud.data = { hName: "aside", hProperties: { className: ["callout", `callout-${type}`], dataCallout: type } };
  noeud.children?.unshift({
    type: "paragraph",
    data: { hProperties: { className: ["callout-title"] } },
    children: titre.length ? titre : [{ type: "text", value: TITRES[type] }],
  });
}

export function remarkCallouts() {
  return (arbre: Noeud) => transformer(arbre);
}
