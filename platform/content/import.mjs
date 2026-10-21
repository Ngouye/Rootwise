#!/usr/bin/env node
/**
 * Importe les cours de content/cours/ dans la plateforme, uniquement par l'API HTTP publique
 * (exactement comme le studio) : aucun accès direct à la base.
 *
 *   ADMIN_EMAIL=admin@exemple.sn ADMIN_PASSWORD=... node content/import.mjs
 *
 * Variables : API_URL (http://localhost:8080), ADMIN_EMAIL, ADMIN_PASSWORD,
 * AUTHOR (nom d'utilisateur auteur des nouveaux cours, « equipe » par défaut ; un cours peut en
 * désigner un autre avec `"author"` dans cours.json), DRY_RUN=1.
 *
 * Idempotent : cours, chapitres et leçons sont retrouvés par leur titre, puis créés ou mis à
 * jour ; rien n'est jamais supprimé (les ajouts faits à la main dans le studio sont conservés).
 * Les PDF sont téléchargés depuis leur source officielle, vérifiés par SHA-256, et mis en cache.
 * Les images référencées dans le Markdown (`![description](images/figure.png "légende")`) sont
 * envoyées sur la plateforme, une seule fois : une image identique déjà publiée est réutilisée.
 * Il en va de même pour la couverture du cours (`"cover"` dans cours.json).
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ApiError, createSession } from "./session.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const CACHE = join(ROOT, ".cache");
const API = (process.env.API_URL ?? "http://localhost:8080").replace(/\/$/, "");
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const AUTHOR = process.env.AUTHOR ?? "equipe";
const DRY_RUN = process.env.DRY_RUN === "1";

const stats = { courses: 0, chapters: 0, created: 0, updated: 0, unchanged: 0, uploads: 0, quizzes: 0, skipped: 0 };

const { call, login } = createSession({ api: API, email: EMAIL, password: PASSWORD });

// ---------------------------------------------------------------- documents PDF (sources officielles)

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

async function documentFile(key, sources) {
  const source = sources[key];
  if (!source) throw new Error(`Document inconnu dans sources.json : ${key}`);
  const path = join(CACHE, source.file);
  if (!existsSync(path)) {
    console.log(`  ↓ téléchargement ${source.url}`);
    const response = await fetch(source.url, { headers: { "user-agent": "rootwise-content-import" } });
    if (!response.ok) throw new Error(`${source.url} : HTTP ${response.status}`);
    await mkdir(CACHE, { recursive: true });
    await writeFile(path, Buffer.from(await response.arrayBuffer()));
  }
  const buffer = await readFile(path);
  if (sha256(buffer) !== source.sha256) {
    throw new Error(`${source.file} : empreinte SHA-256 inattendue (document modifié à la source ?). Supprimez le cache et vérifiez sources.json.`);
  }
  return { name: source.file, buffer };
}

async function upload(buffer, name, type, kind) {
  const form = new FormData();
  form.append("file", new Blob([buffer], { type }), name);
  form.append("kind", kind);
  stats.uploads++;
  return (await call("POST", "/studio/media", form)).id;
}

const uploadPdf = (document) => upload(document.buffer, document.name, "application/pdf", "PDF");

// ---------------------------------------------------------------- images des leçons

/** `![description](images/figure.png "légende")` : fichier du dossier images/ du cours. */
// Seule la cible est remplacée : la description peut contenir des crochets imbriqués.
const LOCAL_IMAGE = /\]\((images\/[^)\s]+)((?:\s+"[^"]*")?)\)/g;
const IMAGE_TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
const servedImages = new Map(); // identifiant de média -> SHA-256 du fichier servi par la plateforme

/** Images déjà publiées dans un texte, indexées par empreinte : une image identique n'est jamais renvoyée. */
async function servedHash(id) {
  if (!servedImages.has(id)) {
    const response = await fetch(`${API}/api/public/media/${id}`);
    servedImages.set(id, response.ok ? sha256(Buffer.from(await response.arrayBuffer())) : null);
  }
  return servedImages.get(id);
}

async function publishedImages(markdown) {
  const known = new Map();
  for (const [, id] of (markdown ?? "").matchAll(/\/api\/public\/media\/(\d+)/g)) {
    const hash = await servedHash(id);
    if (hash) known.set(hash, id);
  }
  return known;
}

/** Couverture du catalogue (`"cover": "images/couverture.webp"`) : envoyée seulement si elle a changé. */
async function coverMediaId(definition, view) {
  if (!definition.cover) return view.coverMediaId;
  const type = IMAGE_TYPES[extname(definition.cover).toLowerCase()];
  if (!type) throw new Error(`${definition.cover} : format d'image non accepté (PNG, JPEG ou WebP).`);
  const buffer = await readFile(join(definition.dir, definition.cover));
  const hash = sha256(buffer);
  if (view.coverMediaId && (await servedHash(String(view.coverMediaId))) === hash) return view.coverMediaId;
  if (DRY_RUN) return 0;
  const id = await upload(buffer, `${basename(definition.dir)}-${basename(definition.cover)}`, type, "IMAGE");
  servedImages.set(String(id), hash);
  return id;
}

/** Remplace les chemins locaux par l'adresse des images sur la plateforme, en les envoyant au besoin. */
async function withImages(markdown, dir, publishedMarkdown) {
  if (!markdown?.includes("](images/")) return markdown;
  const known = await publishedImages(publishedMarkdown);
  let result = markdown;
  for (const [reference, path, caption] of markdown.matchAll(LOCAL_IMAGE)) {
    const type = IMAGE_TYPES[extname(path).toLowerCase()];
    if (!type) throw new Error(`${path} : format d'image non accepté (PNG, JPEG ou WebP).`);
    const buffer = await readFile(join(dir, path));
    const hash = sha256(buffer);
    let id = known.get(hash);
    if (!id) {
      id = DRY_RUN ? "0" : String(await upload(buffer, basename(path), type, "IMAGE"));
      known.set(hash, id);
      servedImages.set(id, hash);
    }
    // Remplacement par fonction : rien n'est interprété dans le texte de remplacement.
    result = result.replace(reference, () => `](/api/public/media/${id}${caption})`);
  }
  return result;
}

// ---------------------------------------------------------------- synchronisation

async function readCourse(dir) {
  const definition = JSON.parse(await readFile(join(dir, "cours.json"), "utf8"));
  const text = async (file) => (file ? (await readFile(join(dir, file), "utf8")).trim() : null);
  definition.dir = dir;
  definition.descriptionMd = await text(definition.description);
  for (const chapter of definition.chapters) {
    for (const lesson of chapter.lessons) {
      lesson.contentMd = await text(lesson.file);
      lesson.dir = dir;
    }
  }
  return definition;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function quizOf(view) {
  return {
    passScorePct: view.passScorePct,
    maxAttempts: view.maxAttempts ?? null,
    questions: view.questions.map((question) => ({
      kind: question.kind,
      promptMd: question.promptMd,
      explanationMd: question.explanationMd ?? null,
      points: question.points,
      choices: question.choices.map((choice) => ({ labelMd: choice.labelMd, correct: choice.correct })),
    })),
  };
}

/** Identifiant du PDF à lier : on réutilise celui déjà envoyé si c'est le même fichier. */
/** PDF d'une leçon : document officiel (`"document"`, voir sources.json) ou fichier local (`"pdf"`). */
async function pdfMediaId(existing, lesson, sources) {
  const document = lesson.pdf
    ? { name: basename(lesson.pdf), buffer: await readFile(join(lesson.dir, lesson.pdf)) }
    : await documentFile(lesson.document, sources);
  if (existing?.mediaName === document.name) return existing.mediaId;
  return DRY_RUN ? -1 : uploadPdf(document);
}

async function syncLesson(chapterView, lesson, sources) {
  const existing = chapterView.lessons.find((candidate) => candidate.title === lesson.title);
  const body = {
    title: lesson.title,
    type: lesson.type,
    contentMd: await withImages(lesson.contentMd, lesson.dir, existing?.contentMd),
    mediaId: lesson.type === "PDF" ? await pdfMediaId(existing, lesson, sources) : null,
    youtubeUrl: lesson.type === "YOUTUBE" ? `https://www.youtube.com/watch?v=${lesson.youtube}` : null,
    durationSeconds: lesson.minutes ? lesson.minutes * 60 : null,
    freePreview: lesson.freePreview ?? false,
  };

  if (!existing) {
    stats.created++;
    console.log(`    + ${lesson.title}`);
    return DRY_RUN ? null : call("POST", `/studio/chapters/${chapterView.id}/lessons`, body);
  }
  const fields = (lessonLike) => [lessonLike.type, lessonLike.contentMd, lessonLike.mediaId, lessonLike.youtubeId,
    lessonLike.durationSeconds, lessonLike.freePreview];
  if (same(fields(existing), fields({ ...body, youtubeId: lesson.youtube ?? null }))) {
    stats.unchanged++;
    return null;
  }
  stats.updated++;
  console.log(`    ~ ${lesson.title}`);
  return DRY_RUN ? null : call("PUT", `/studio/lessons/${existing.id}`, body);
}

async function syncQuiz(chapterId, quiz) {
  const wanted = quizOf({ ...quiz, questions: quiz.questions.map((question) => ({ points: 1, ...question })) });
  let current = null;
  try {
    current = quizOf(await call("GET", `/studio/chapters/${chapterId}/quiz`));
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  }
  if (same(current, wanted)) return;
  stats.quizzes++;
  console.log(`    ? quiz (${wanted.questions.length} questions)`);
  if (!DRY_RUN) await call("PUT", `/studio/chapters/${chapterId}/quiz`, wanted);
}

const byName = (a, b) => a.localeCompare(b);

/**
 * Titre, résumé, description, niveau, thèmes, auteur et couverture. Un cours « extends » (cours
 * d'exemple) garde sa présentation : seule sa couverture peut changer. Sans `cover` dans
 * cours.json, la couverture choisie dans le studio est conservée.
 */
async function syncPresentation(definition, id, view) {
  const current = { title: view.title, summary: view.summary, descriptionMd: view.descriptionMd, level: view.level,
    tagSlugs: [...view.tagSlugs].sort(byName), coverMediaId: view.coverMediaId };
  const details = definition.extends ? { ...current } : {
    title: definition.title,
    summary: definition.summary,
    descriptionMd: await withImages(definition.descriptionMd, definition.dir, view.descriptionMd),
    level: definition.level,
    tagSlugs: [...definition.tags].sort(byName),
  };
  details.coverMediaId = await coverMediaId(definition, view);
  const auteur = definition.author ?? AUTHOR;
  const authorChange = !definition.extends && view.authorUsername !== auteur;
  if (same(current, details) && !authorChange) return view;

  console.log("    ~ présentation");
  if (DRY_RUN) return view;
  try {
    return await call("PUT", `/studio/courses/${id}`, { ...details, authorUsername: authorChange ? auteur : null });
  } catch (error) {
    if (!(error instanceof ApiError && error.code === "INVALID_AUTHOR")) throw error;
    console.log(`    ! auteur « ${auteur} » introuvable : le cours reste à votre nom.`);
    return call("PUT", `/studio/courses/${id}`, details);
  }
}

async function syncChapter(courseId, view, chapter, sources) {
  let chapterView = view.chapters.find((candidate) => candidate.title === chapter.title);
  if (chapterView) {
    console.log(`  = chapitre ${chapter.title}`);
  } else {
    console.log(`  + chapitre ${chapter.title}`);
    if (DRY_RUN) return view;
    view = await call("POST", `/studio/courses/${courseId}/chapters`, { title: chapter.title });
    chapterView = view.chapters.at(-1);
  }
  stats.chapters++;
  for (const lesson of chapter.lessons) {
    const updated = await syncLesson(chapterView, lesson, sources);
    if (updated) {
      view = updated;
      chapterView = view.chapters.find((candidate) => candidate.id === chapterView.id);
    }
  }
  if (chapter.quiz) await syncQuiz(chapterView.id, chapter.quiz);
  return view;
}

async function syncCourse(definition, summaries, sources) {
  const summary = summaries.find((candidate) => candidate.title === definition.title);
  if (definition.extends && !summary) {
    console.log(`• ${definition.title} : cours absent (données de démonstration désactivées ?), ignoré.`);
    stats.skipped++;
    return;
  }
  console.log(`• ${definition.title}`);
  stats.courses++;
  if (DRY_RUN && !summary) {
    console.log("    (nouveau cours)");
    return;
  }

  const id = summary?.id ?? (await call("POST", "/studio/courses", {
    title: definition.title, summary: definition.summary, level: definition.level,
  })).id;
  let view = await call("GET", `/studio/courses/${id}`);
  view = await syncPresentation(definition, id, view);
  for (const chapter of definition.chapters) view = await syncChapter(id, view, chapter, sources);

  if (!definition.extends && view.status !== "PUBLISHED" && !DRY_RUN) {
    if (view.publishProblems.length) throw new Error(`Publication impossible : ${view.publishProblems.join(" ")}`);
    await call("POST", `/studio/courses/${id}/publish`);
    console.log("    ✓ publié");
  }
}

async function main() {
  const sources = JSON.parse(await readFile(join(ROOT, "sources.json"), "utf8")).documents;
  const dirs = (await readdir(join(ROOT, "cours"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && existsSync(join(ROOT, "cours", entry.name, "cours.json")))
    .map((entry) => join(ROOT, "cours", entry.name))
    .sort(byName);
  const definitions = await Promise.all(dirs.map(readCourse));

  const me = await login();
  console.log(`Connecté à ${API} en tant que ${me.username}${DRY_RUN ? " (simulation, rien n'est modifié)" : ""}.\n`);
  const summaries = await call("GET", "/studio/courses");
  for (const definition of definitions) await syncCourse(definition, summaries, sources);

  console.log(`\n${stats.courses} cours, ${stats.chapters} chapitres : ${stats.created} leçons créées, ${stats.updated} mises à jour, `
    + `${stats.unchanged} inchangées, ${stats.uploads} fichiers envoyés, ${stats.quizzes} quiz écrits, ${stats.skipped} cours ignorés.`);
}

try {
  await main();
} catch (error) {
  console.error(`\nÉchec : ${error.message}`);
  process.exit(1);
}
