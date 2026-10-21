#!/usr/bin/env node
/**
 * Exporte tous les cours publiés de la plateforme en Markdown, dans le dossier cours/ à la racine
 * du dépôt : un sommaire général, une page par cours, un fichier par leçon, les quiz avec leur
 * correction repliable, les images et les couvertures. Lisible sur GitHub et dans VS Code.
 *
 *   ADMIN_EMAIL=admin@exemple.sn ADMIN_PASSWORD=... node content/exporter.mjs
 *
 * Variables : API_URL (http://localhost:8080), ADMIN_EMAIL, ADMIN_PASSWORD (un compte
 * administrateur voit toutes les leçons et les réponses des quiz), SORTIE (dossier de destination).
 *
 * Le dossier de destination est entièrement régénéré : ne modifiez pas ces fichiers à la main,
 * modifiez les cours (studio ou content/) puis relancez l'export.
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ApiError, createSession } from "./session.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SORTIE = resolve(process.env.SORTIE ?? join(ROOT, "..", "..", "cours"));
const { call, download, login } = createSession({
  api: process.env.API_URL ?? "http://localhost:8080",
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
});

const MARQUE = "<!-- Généré par platform/content/exporter.mjs depuis la plateforme : ne pas modifier à la main. -->";

/** Ordre pédagogique conseillé ; les autres cours publiés suivent, dans l'ordre du catalogue. */
const PARCOURS = [
  "chiffrement-symetrique-de-cesar-a-aes",
  "fonctions-de-hachage-mac-et-mots-de-passe",
  "rsa-et-signatures-numeriques",
  "courbes-elliptiques-ecdh-ecdsa-et-ed25519",
  "pki-et-certificats-x-509",
  "tls-1-3-securiser-les-communications",
  "cryptographie-post-quantique",
];
const NIVEAUX = {
  BEGINNER: { nom: "Débutant", couleur: "34d399" },
  INTERMEDIATE: { nom: "Intermédiaire", couleur: "fbbf24" },
  EXPERT: { nom: "Expert", couleur: "a78bfa" },
};
const FORMATS = {
  TEXT: { icone: "📄", nom: "Leçon" },
  YOUTUBE: { icone: "🎬", nom: "Vidéo" },
  VIDEO: { icone: "🎞️", nom: "Vidéo" },
  PDF: { icone: "📑", nom: "Document PDF" },
};

// ---------------------------------------------------------------- petits outils

const deuxChiffres = (n) => String(n).padStart(2, "0");
// NFKD : les accents deviennent des diacritiques à retirer, et « y² », « F₁₇ » deviennent « y2 », « F17 ».
const slug = (texte) => texte.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/(^-)|(-$)/g, "").slice(0, 60).replace(/-$/, "");
const duree = (minutes) => (minutes >= 60 ? `${Math.floor(minutes / 60)} h ${deuxChiffres(minutes % 60)}` : `${minutes} min`);
const minutesDe = (secondes) => (secondes ? Math.max(1, Math.round(secondes / 60)) : null);
const attribut = (texte) => texte.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

/** Badge shields.io (texte de remplacement lisible si l'image ne se charge pas). */
function badge(etiquette, valeur, couleur) {
  const encoder = (texte) => encodeURIComponent(texte.replaceAll("-", "--").replaceAll("_", "__"));
  return `<img alt="${attribut(`${etiquette} : ${valeur}`)}" src="https://img.shields.io/badge/${encoder(etiquette)}-${encoder(valeur)}-${couleur}?style=for-the-badge&labelColor=121816">`;
}

const fichiers = new Map(); // chemin à écrire -> contenu (texte ou Buffer)
const ecrire = (chemin, contenu) => fichiers.set(chemin, contenu);

// ---------------------------------------------------------------- Markdown des leçons

/** Télécharge les images de la plateforme et les range dans le dossier images/ du cours. */
async function imagesLocales(markdown, cours) {
  const motif = /!\[([^\]]*)\]\(\/api\/public\/media\/(\d+)(?:\s+"([^"]*)")?\)/g;
  let resultat = markdown;
  for (const [reference, description, id, legende] of markdown.matchAll(motif)) {
    const chemin = await imageDuCours(cours, id);
    const seule = new RegExp(`^${reference.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m").test(markdown);
    const remplacement = seule
      ? `<p align="center"><img src="${chemin}" alt="${attribut(description)}" width="100%"></p>`
        + (legende ? `\n<p align="center"><sub><i>${legende}</i></sub></p>` : "")
      : `![${description}](${chemin}${legende ? ` "${legende}"` : ""})`;
    resultat = resultat.replace(reference, () => remplacement);
  }
  return resultat;
}

async function imageDuCours(cours, id) {
  if (cours.images.has(id)) return cours.images.get(id);
  const image = await download(`/public/media/${id}`);
  let chemin = `images/${slugFichier(image.name ?? `image-${id}.png`)}`;
  if ([...cours.images.values()].includes(chemin)) chemin = `images/${id}-${chemin.slice("images/".length)}`;
  ecrire(join(cours.dossier, chemin), image.buffer);
  cours.images.set(id, chemin);
  return chemin;
}

function slugFichier(nom) {
  const extension = extname(nom).toLowerCase();
  return `${slug(nom.slice(0, nom.length - extension.length)) || "fichier"}${extension}`;
}

/** Encadrés GitHub (`> [!IMPORTANT]`, `> [!WARNING]`) pour les citations « À retenir » et « ⚠️ ». */
function encadres(markdown) {
  const lignes = markdown.split("\n");
  let code = false;
  return lignes.map((ligne, i) => {
    if (/^\s*```/.test(ligne)) code = !code;
    const debutCitation = !code && ligne.startsWith(">") && !(lignes[i - 1] ?? "").startsWith(">");
    if (!debutCitation) return ligne;
    if (/^>\s*\*\*À retenir\*\*/.test(ligne)) return `> [!IMPORTANT]\n${ligne}`;
    if (/^>\s*⚠️/.test(ligne)) return `> [!WARNING]\n${ligne.replace(/⚠️\s*/, "")}`;
    return ligne;
  }).join("\n");
}

const adapter = async (markdown, cours) => (markdown ? encadres(await imagesLocales(markdown.trim(), cours)) : "");

async function corpsLecon(lecon, cours, sources) {
  const notes = await adapter(lecon.contentMd, cours);
  if (lecon.type === "YOUTUBE") {
    const lien = `https://www.youtube.com/watch?v=${lecon.youtubeId}`;
    return [
      `<p align="center"><a href="${lien}"><img src="https://img.youtube.com/vi/${lecon.youtubeId}/hqdefault.jpg" `
        + `alt="${attribut(`Regarder « ${lecon.title} » sur YouTube`)}" width="80%"></a></p>`,
      `<p align="center"><sub>▶️ Cliquez sur l'image pour regarder la vidéo sur YouTube, où elle reste hébergée par son auteur.</sub></p>`,
      notes,
    ].filter(Boolean).join("\n\n");
  }
  if (lecon.type === "PDF") {
    const source = Object.values(sources).find((document) => document.file === lecon.mediaName);
    let encadre;
    if (source) {
      encadre = `> [!NOTE]\n> 📑 **Document officiel** : [${source.title}](${source.url})\n> \n> ${source.publisher} · ${source.license}`;
    } else {
      const fichier = await download(`/lessons/${lecon.id}/media`);
      const chemin = `documents/${slugFichier(fichier.name ?? lecon.mediaName ?? `document-${lecon.id}.pdf`)}`;
      ecrire(join(cours.dossier, chemin), fichier.buffer);
      encadre = `> [!NOTE]\n> 📥 **Document** : [${lecon.title} (PDF)](${chemin})`;
    }
    return [encadre, notes].filter(Boolean).join("\n\n");
  }
  if (lecon.type === "VIDEO") {
    return ["> [!NOTE]\n> 🎞️ Cette vidéo est hébergée sur la plateforme : regardez-la dans le cours en ligne.", notes]
      .filter(Boolean).join("\n\n");
  }
  return notes;
}

// ---------------------------------------------------------------- pages

function navigation(precedent, suivant, cours) {
  const lien = (etape, sens) => {
    if (etape) return sens < 0 ? `[⬅️ ${etape.titre}](${etape.fichier})` : `[${etape.titre} ➡️](${etape.fichier})`;
    return sens < 0 ? " " : "[🏁 Cours terminé : tous les cours](../README.md)";
  };
  return ["| Précédent | Sommaire | Suivant |", "|:---|:---:|---:|",
    `| ${lien(precedent, -1)} | [📚 ${cours.titre}](README.md) | ${lien(suivant, 1)} |`].join("\n");
}

function filAriane(cours, chapitre) {
  return `[🏠 Tous les cours](../README.md) › [${cours.titre}](README.md) › **${chapitre}**`;
}

function pageQuiz(quiz, chapitre, cours) {
  const questions = quiz.questions.map((question, i) => {
    const bonnes = question.choices.filter((choix) => choix.correct).map((choix) => choix.labelMd);
    return [
      `### Question ${i + 1}${question.kind === "MULTIPLE" ? " · plusieurs réponses possibles" : ""}`,
      question.promptMd.trim(),
      question.choices.map((choix) => `- [ ] ${choix.labelMd}`).join("\n"),
      "<details>\n<summary><b>Voir la correction</b></summary>",
      `✅ **${bonnes.length > 1 ? "Bonnes réponses" : "Bonne réponse"}** : ${bonnes.join(" · ")}`,
      question.explanationMd ? `💡 ${question.explanationMd.trim()}` : "",
      "</details>",
    ].filter(Boolean).join("\n\n");
  });
  return [
    `# 🧠 Quiz — ${chapitre}`,
    `\`${quiz.questions.length} questions\` · \`🎯 réussite à ${quiz.passScorePct} %\` · `
      + `\`${quiz.maxAttempts ? `${quiz.maxAttempts} essai${quiz.maxAttempts > 1 ? "s" : ""}` : "essais illimités"}\``,
    "> [!TIP]\n> Répondez d'abord de tête, puis dépliez la correction. Sur la plateforme, ce quiz est corrigé "
      + "automatiquement et compte pour le certificat de fin de cours.",
    "---",
    questions.join("\n\n---\n\n"),
  ].join("\n\n");
}

async function exporterCours(resume, numero, sources) {
  const vue = await call("GET", `/studio/courses/${resume.id}`);
  const cours = {
    titre: vue.title, dossier: join(SORTIE, `${deuxChiffres(numero)}-${vue.slug}`),
    nomDossier: `${deuxChiffres(numero)}-${vue.slug}`, images: new Map(),
  };

  // Étapes du cours (leçons puis quiz de chaque chapitre), pour la navigation précédent / suivant.
  const etapes = [];
  const quizParChapitre = new Map();
  let total = 0;
  for (const [c, chapitre] of vue.chapters.entries()) {
    chapitre.lessons.forEach((lecon, l) => {
      total++;
      etapes.push({ type: "lecon", lecon, chapitre, titre: lecon.title, fichier: `${deuxChiffres(c + 1)}-${deuxChiffres(l + 1)}-${slug(lecon.title)}.md` });
    });
    try {
      const quiz = await call("GET", `/studio/chapters/${chapitre.id}/quiz`);
      quizParChapitre.set(chapitre.id, quiz);
      etapes.push({ type: "quiz", quiz, chapitre, titre: `Quiz : ${chapitre.title}`, fichier: `${deuxChiffres(c + 1)}-quiz-${slug(chapitre.title)}.md` });
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) throw error;
    }
  }

  let rang = 0;
  for (const [i, etape] of etapes.entries()) {
    const entete = [MARQUE, filAriane(cours, etape.chapitre.title)];
    let contenu;
    if (etape.type === "lecon") {
      rang++;
      const { lecon } = etape;
      const format = FORMATS[lecon.type];
      const meta = [`\`${format.icone} ${format.nom}\``];
      if (minutesDe(lecon.durationSeconds)) meta.push(`\`⏱ ${duree(minutesDe(lecon.durationSeconds))}\``);
      meta.push(`\`Leçon ${rang} / ${total}\``);
      if (lecon.freePreview) meta.push("`🆓 aperçu gratuit`");
      contenu = [`# ${lecon.title}`, meta.join(" · "), "---", await corpsLecon(lecon, cours, sources)].join("\n\n");
    } else {
      contenu = pageQuiz(etape.quiz, etape.chapitre.title, cours);
    }
    ecrire(join(cours.dossier, etape.fichier),
      [...entete, contenu, "---", navigation(etapes[i - 1], etapes[i + 1], cours)].join("\n\n") + "\n");
  }

  // Page du cours
  let couverture = null;
  if (resume.coverUrl) {
    const image = await download(resume.coverUrl.replace(/^\/api/, ""));
    couverture = `couverture${extname(image.name ?? "") || ".webp"}`;
    ecrire(join(cours.dossier, couverture), image.buffer);
  }
  const niveau = NIVEAUX[vue.level];
  const nbQuiz = quizParChapitre.size;
  const programme = vue.chapters.map((chapitre, c) => {
    const lignes = etapes.filter((etape) => etape.chapitre.id === chapitre.id).map((etape) => {
      if (etape.type === "quiz") return `| 🧠 | [Quiz du chapitre](${etape.fichier}) | Quiz | ${etape.quiz.questions.length} questions |`;
      const { lecon } = etape;
      const minutes = minutesDe(lecon.durationSeconds);
      return `| ${FORMATS[lecon.type].icone} | [${lecon.title}](${etape.fichier})${lecon.freePreview ? " 🆓" : ""} | ${FORMATS[lecon.type].nom} | ${minutes ? duree(minutes) : "—"} |`;
    });
    return [`### Chapitre ${c + 1} · ${chapitre.title}`, "| | Contenu | Format | Durée |\n|:-:|:--|:--|--:|\n" + lignes.join("\n")].join("\n\n");
  });
  const page = [
    MARQUE,
    "[🏠 Tous les cours](../README.md)",
    couverture ? `<p align="center"><img src="${couverture}" alt="" width="100%"></p>` : "",
    `<h1 align="center">${vue.title}</h1>`,
    `<p align="center">\n  ${badge("niveau", niveau.nom, niveau.couleur)}\n  ${badge("leçons", String(resume.lessonCount), "60a5fa")}\n  `
      + `${badge("durée", duree(resume.durationMinutes), "34d399")}\n  ${badge("quiz", String(nbQuiz), "f87171")}\n</p>`,
    `<p align="center"><i>${vue.summary}</i></p>`,
    "---",
    await adapter(vue.descriptionMd, cours),
    "## 🗺️ Programme",
    programme.join("\n\n"),
    "## 🎓 Certificat",
    "> [!NOTE]\n> Sur la plateforme, terminer toutes les leçons et réussir tous les quiz délivre un **certificat "
      + "signé en Ed25519**, vérifiable par tous avec OpenSSL.",
    `<sub>Cours proposé par ${resume.authorName} · thèmes : ${resume.tags.map((tag) => tag.name).join(", ")}</sub>`,
  ].filter(Boolean).join("\n\n");
  ecrire(join(cours.dossier, "README.md"), page + "\n");

  return { resume, vue, cours, couverture, niveau, nbQuiz };
}

function sommaire(exports) {
  const lecons = exports.reduce((somme, e) => somme + e.resume.lessonCount, 0);
  const quiz = exports.reduce((somme, e) => somme + e.nbQuiz, 0);
  const minutes = exports.reduce((somme, e) => somme + e.resume.durationMinutes, 0);
  const cellules = exports.map((e, i) => [
    '<td width="50%" valign="top">',
    "",
    e.couverture ? `<a href="${e.cours.nomDossier}/README.md"><img src="${e.cours.nomDossier}/${e.couverture}" alt="" width="100%"></a>` : "",
    "",
    `### ${i + 1} · [${e.vue.title}](${e.cours.nomDossier}/README.md)`,
    "",
    `\`${e.niveau.nom}\` · 📖 ${e.resume.lessonCount} leçons · 🧠 ${e.nbQuiz} quiz · ⏱ ${duree(e.resume.durationMinutes)}`,
    "",
    e.vue.summary,
    "",
    "</td>",
  ].join("\n"));
  const rangees = [];
  for (let i = 0; i < cellules.length; i += 2) {
    rangees.push(`<tr>\n${cellules[i]}\n${cellules[i + 1] ?? '<td width="50%"></td>'}\n</tr>`);
  }
  // Parcours en liens HTML plutôt qu'en diagramme Mermaid, que l'aperçu intégré de VS Code n'affiche pas.
  const numeros = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];
  const parcours = exports.map((e, i) => `<a href="${e.cours.nomDossier}/README.md"><b>${numeros[i] ?? i + 1} `
    + `${e.vue.title.split(" : ")[0]}</b></a>`).join(" &nbsp;→&nbsp; ");
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return [
    MARQUE,
    '<div align="center">',
    "# 🔐 Cours de cryptographie",
    "### De César au post-quantique, en français",
    `${badge("cours", String(exports.length), "34d399")}\n${badge("leçons", String(lecons), "60a5fa")}\n`
      + `${badge("quiz", String(quiz), "f87171")}\n${badge("durée", duree(minutes), "fbbf24")}\n${badge("langue", "français", "a78bfa")}`,
    "</div>",
    "> [!TIP]\n> Ces pages sont l'export Markdown des cours de la plateforme **Rootwise** : leçons, formules "
      + "mathématiques, schémas, vidéos, normes officielles et quiz corrigés. Elles s'affichent sur GitHub et dans "
      + "VS Code (<kbd>Ctrl</kbd> + <kbd>Maj</kbd> + <kbd>V</kbd>).",
    "## 🧭 Parcours conseillé",
    `<p align="center">${parcours}</p>`,
    "<p align=\"center\"><sub>Chaque cours peut se suivre seul ; cet ordre est conseillé si vous débutez.</sub></p>",
    "## 📚 Les cours",
    `<table>\n${rangees.join("\n")}\n</table>`,
    "## 🔣 Légende",
    "| Icône | Contenu |\n|:-:|:--|\n| 📄 | Leçon écrite : explications, formules, code, schémas |\n"
      + "| 🎬 | Vidéo YouTube (hébergée par son auteur ; un clic ouvre YouTube) |\n"
      + "| 📑 | Document PDF : norme officielle (NIST, RFC, ANSSI) avec un guide de lecture, ou fiche du cours |\n"
      + "| 🧠 | Quiz de fin de chapitre, correction repliable |\n| 🆓 | Leçon en aperçu gratuit sur la plateforme |",
    "## ⚖️ Sources et licences",
    "- **Textes, quiz, schémas et couvertures** : créations originales du projet.\n"
      + "- **Vidéos** : intégrées depuis YouTube, jamais copiées ; chaque leçon cite sa chaîne et son titre.\n"
      + "- **Documents officiels** : liens vers leurs sources (NIST, RFC Editor, ANSSI), avec leur licence.",
    `<sub>Généré le ${date} depuis la plateforme par <code>platform/content/exporter.mjs</code>. Pour modifier un cours, `
      + "passez par le studio ou par <code>platform/content/</code>, puis relancez l'export.</sub>",
  ].join("\n\n") + "\n";
}

async function main() {
  const sources = JSON.parse(await readFile(join(ROOT, "sources.json"), "utf8")).documents;
  if (existsSync(SORTIE)) {
    const index = join(SORTIE, "README.md");
    if (!existsSync(index) || !(await readFile(index, "utf8")).startsWith(MARQUE)) {
      throw new Error(`${SORTIE} existe et n'a pas été produit par cet export : choisissez un autre dossier (SORTIE=…).`);
    }
  }
  const me = await login();
  console.log(`Connecté en tant que ${me.username}.`);
  const catalogue = await call("GET", "/public/courses");
  const ordonnes = [
    ...PARCOURS.map((cle) => catalogue.find((cours) => cours.slug === cle)).filter(Boolean),
    ...catalogue.filter((cours) => !PARCOURS.includes(cours.slug)),
  ];
  const exports = [];
  for (const [i, resume] of ordonnes.entries()) {
    exports.push(await exporterCours(resume, i + 1, sources));
    console.log(`• ${resume.title}`);
  }
  ecrire(join(SORTIE, "README.md"), sommaire(exports));

  // On vide le dossier plutôt que de le supprimer : sous Windows, un éditeur qui l'a ouvert le verrouille.
  await mkdir(SORTIE, { recursive: true });
  for (const entree of await readdir(SORTIE)) await rm(join(SORTIE, entree), { recursive: true, force: true });
  for (const [chemin, contenu] of fichiers) {
    await mkdir(dirname(chemin), { recursive: true });
    await writeFile(chemin, contenu);
  }
  console.log(`\n${fichiers.size} fichiers écrits dans ${SORTIE}`);
}

try {
  await main();
} catch (error) {
  console.error(`\nÉchec : ${error.message}`);
  process.exit(1);
}
