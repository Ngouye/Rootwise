# Contenu des cours

Ce dossier décrit les cours de la plateforme sous forme de fichiers (Markdown et JSON) et les
importe **par l'API HTTP**, exactement comme le ferait un administrateur dans le studio.

| Dossier | Cours | Niveau | Leçons |
|---|---|---|---|
| `01-hachage` | Fonctions de hachage, MAC et mots de passe | Débutant | 11 |
| `02-courbes-elliptiques` | Courbes elliptiques : ECDH, ECDSA et Ed25519 | Intermédiaire | 9 |
| `03-pki` | PKI et certificats X.509 | Intermédiaire | 7 |
| `04-tls` | TLS 1.3 : sécuriser les communications | Intermédiaire | 8 |
| `05-post-quantique` | Cryptographie post-quantique | Expert | 12 |
| `10-symetrique-plus-loin` | chapitre ajouté au cours d'exemple *Chiffrement symétrique : de César à AES* | | 5 |
| `11-rsa-plus-loin` | chapitre ajouté au cours d'exemple *RSA et signatures numériques* | | 5 |
| `20-bash-point-exclamation` | Le « ! » de Bash en 15 usages | Intermédiaire | 24 |
| `21-head-tail-cat` | head, tail et cat sous Linux | Débutant | 30 |
| `22-usermod` | La commande usermod : comptes et groupes | Intermédiaire | 30 |
| `23-dnf` | 20 commandes DNF indispensables | Débutant | 31 |
| `24-reparer-apt-dnf` | Réparer apt et dnf après une mise à jour interrompue | Intermédiaire | 29 |
| `25-commandes-reseau` | Les 22 commandes réseau Linux essentielles | Intermédiaire | 33 |
| `26-surveillance-linux` | Surveiller Linux en 24 outils | Intermédiaire | 35 |
| `27-surveillance-pm2` | Surveiller Node.js avec PM2 | Intermédiaire | 22 |

Les dossiers `10-` et `11-` illustrent aussi trois leçons existantes des cours d'exemple (analyse
de fréquences, mode ECB, signature). Chaque chapitre se termine par un quiz. Les textes des leçons sont des contenus originaux ; les
commandes OpenSSL qu'ils contiennent ont été exécutées avec OpenSSL 3.5, et les exemples chiffrés
(courbe jouet, nonce ECDSA réutilisé, RSA malléable) recalculés par programme.

Les dossiers `20-` à `27-` reprennent les **guides pratiques d'administration Linux de Ngouye
GNING** (les PDF illustrés à la racine du dépôt), au nom de son compte `ngouye`. Chaque cours suit le
plan du guide : introduction et synthèse en accès libre, un chapitre par partie (bandeau, vue
d'ensemble, puis une leçon par fiche), une conclusion, les annexes et une dernière leçon qui
propose le guide complet en PDF. Tableaux, encadrés et commandes ont été recomposés en Markdown ;
les figures et illustrations sont celles des guides, extraites des PDF et converties en WebP.

## Importer

La plateforme (API) doit tourner. Avec un compte **administrateur** :

```bash
ADMIN_EMAIL=admin@exemple.sn ADMIN_PASSWORD='…' node content/import.mjs
```

| Variable | Défaut | Rôle |
|---|---|---|
| `API_URL` | `http://localhost:8080` | adresse de l'API |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | (obligatoires) | compte administrateur utilisé pour l'import |
| `AUTHOR` | `equipe` | nom d'utilisateur à qui attribuer les nouveaux cours (créateur ou administrateur) ; s'il n'existe pas, les cours restent au nom de l'administrateur |
| `DRY_RUN` | — | `1` : affiche ce qui changerait, sans rien modifier |

Node.js 18 ou plus suffit : le script n'a aucune dépendance.

- **Idempotent** : cours, chapitres et leçons sont retrouvés par leur **titre**, puis créés ou mis
  à jour. Relancer l'import après une correction ne modifie que ce qui a changé.
- **Rien n'est supprimé** : les leçons ajoutées à la main dans le studio sont conservées. Renommer
  une leçon dans les fichiers en crée une nouvelle ; supprimez l'ancienne dans le studio.
- Les cours `extends` (dossiers `10-` et `11-`) ne font qu'**ajouter des chapitres** aux cours
  d'exemple ; ils sont ignorés si ces cours n'existent pas (`DEMO_DATA=false`).
- Les PDF sont téléchargés depuis leur source officielle (`sources.json`), **vérifiés par
  SHA-256**, puis mis en cache dans `.cache/` (non versionné). Un document modifié à la source
  bloque l'import au lieu de publier un fichier inattendu. Un PDF déjà envoyé n'est pas renvoyé.
- La couverture d'un cours, choisie dans le studio, est conservée.

## Exporter les cours en Markdown

```bash
ADMIN_EMAIL=admin@exemple.sn ADMIN_PASSWORD='…' node content/exporter.mjs
```

Le script lit tous les cours **publiés** sur la plateforme (y compris les leçons créées dans le
studio et celles des cours d'exemple) et régénère le dossier `cours/` à la racine du dépôt :

- `cours/README.md` : sommaire général, parcours conseillé, cartes des cours avec leur couverture ;
- un dossier par cours : page de présentation et programme, une page par leçon (fil d'Ariane,
  navigation précédent / suivant), une page par quiz avec la correction repliable, les images et
  les fiches PDF propres au cours ;
- les vidéos sont des liens vers YouTube et les normes officielles des liens vers leur source.

Les pages utilisent le Markdown de GitHub (encadrés `> [!NOTE]`, formules `$…$`, cases à cocher,
`<details>`) et s'affichent sur GitHub comme dans l'aperçu de VS Code. Le dossier est entièrement
régénéré à chaque export (`SORTIE=…` pour en choisir un autre) : ne le modifiez pas à la main.

## Écrire un cours

`cours/<dossier>/cours.json` :

```json
{
  "title": "Titre du cours",
  "summary": "Résumé affiché dans le catalogue (300 caractères au plus).",
  "level": "BEGINNER",
  "tags": ["hachage"],
  "description": "presentation.md",
  "cover": "images/couverture.webp",
  "chapters": [
    {
      "title": "Titre du chapitre",
      "lessons": [
        { "title": "Leçon texte", "type": "TEXT", "file": "1-1-lecon.md", "minutes": 10, "freePreview": true },
        { "title": "Vidéo", "type": "YOUTUBE", "youtube": "identifiant-de-11-caracteres", "file": "notes.md", "minutes": 12 },
        { "title": "Norme officielle", "type": "PDF", "document": "cle-dans-sources.json", "file": "notes.md" }
      ],
      "quiz": {
        "passScorePct": 70,
        "maxAttempts": null,
        "questions": [
          { "kind": "SINGLE", "promptMd": "Question ?", "explanationMd": "Explication.",
            "choices": [{ "labelMd": "Bonne réponse", "correct": true }, { "labelMd": "Mauvaise", "correct": false }] }
        ]
      }
    }
  ]
}
```

- `level` : `BEGINNER`, `INTERMEDIATE` ou `EXPERT` ; `tags` : `aes`, `rsa`, `ecc`, `hachage`,
  `signature`, `pki`, `tls`, `post-quantique`, `linux`, `bash`, `reseau`, `paquets`,
  `supervision`, `comptes`.
- `author` (facultatif) : nom d'utilisateur de l'auteur du cours ; remplace `AUTHOR` pour ce cours.
- `file` : le contenu Markdown de la leçon (obligatoire pour `TEXT`), ou les **notes** affichées
  sous une vidéo ou un PDF. Formules entre `$…$` ou `$$…$$`, tableaux, blocs de code. Un `$` hors
  formule doit être placé dans du code (`` `$HOME` ``), sinon il est lu comme une formule.
- Une leçon PDF peut aussi pointer vers un fichier local : `"pdf": "chemin/relatif/guide.pdf"` (au
  lieu de `document`, réservé aux PDF de `sources.json`).

Deux extensions du Markdown rendent les leçons plus lisibles :

````markdown
> [!TIP] Titre de l'encadré
> Texte de l'encadré. Types : NOTE, TIP, IMPORTANT, WARNING, CAUTION ; sans titre, un titre par défaut.

```bash title="verifier.sh"
$ commande        # bloc affiché comme une fenêtre de terminal, avec bouton « Copier »
```
````
- `kind` : `SINGLE` (une seule bonne réponse) ou `MULTIPLE` ; `points` vaut 1 par défaut.
- `cover` (facultatif) : image de couverture affichée sur la carte du cours dans le catalogue, au
  format 16:7 (960 × 420 px ou plus). Elle n'est envoyée que si elle a changé ; sans `cover`, la
  couverture choisie dans le studio est conservée. Un cours `extends` peut aussi en déclarer une.

Le studio (`/studio`) permet de faire tout cela à la main : un administrateur ou un créateur y
crée des cours, envoie des vidéos MP4/WebM et des PDF, colle des liens YouTube, insère des images
(bouton « Image » au-dessus de chaque zone de texte, avec un « Aperçu » du rendu) et écrit les quiz.

## Images

Dans le Markdown d'une leçon (ou de la description du cours), une image du dossier `images/` du
cours s'écrit :

```markdown
![Description de l'image, lue par les lecteurs d'écran](images/figure.png "Légende affichée sous l'image")
```

À l'import, chaque image est envoyée sur la plateforme puis référencée par son adresse
(`/api/public/media/…`) ; une image identique déjà publiée (même SHA-256) n'est pas renvoyée.
Formats acceptés : PNG, JPEG ou WebP, 5 Mo au plus. Le site n'affiche que les images hébergées par
la plateforme : une image d'un site tiers n'est pas chargée (pas de pixel espion dans les cours).

Les 20 illustrations des leçons et les 7 couvertures sont **générées par programme** avec
`python content/illustrations/generer.py [nom …]` (bibliothèque standard Python et un navigateur
Chromium pour convertir le SVG en PNG). Leurs données sont calculées, pas dessinées : empreintes
SHA-256 réelles, points de la courbe jouet, probabilités, fréquences des lettres mesurées sur les
textes des cours, et chiffrement AES-128 réel (OpenSSL) pour la démonstration du mode ECB. Pour
modifier une figure, changez sa fonction dans `generer.py`, régénérez-la, puis relancez l'import.
Les illustrations sont en PNG (aplats nets) ; les couvertures en WebP (environ 30 Ko au lieu de
850 Ko en PNG, à cause des dégradés), format choisi par le navigateur d'après l'extension.

## Sources et licences

Les textes des leçons, les quiz et les illustrations sont des créations originales de ce projet.
Les cours `20-` à `27-` et leurs images proviennent des guides de Ngouye GNING, auteur de ce
projet ; chaque guide cite en annexe l'article Tecmint dont il reprend le plan.

### Vidéos YouTube

Les vidéos sont **intégrées** avec le lecteur officiel de YouTube (domaine `youtube-nocookie.com`) :
elles ne sont ni téléchargées ni copiées, restent hébergées par leurs auteurs et comptabilisées
chez eux. Chaque leçon vidéo cite sa chaîne et son titre. Toutes les vidéos ont été vérifiées
comme intégrables (oEmbed) au moment de l'import.

| Chaîne | Vidéo | Cours |
|---|---|---|
| L'informateur | Complément : Fonctions de hachage | Hachage |
| Découvre Bitcoin | Les rouages de SHA256 — chapitre 2.2 [Crypto 301] | Hachage |
| Science4All | Les courbes elliptiques | Courbes elliptiques |
| Centre Henri Lebesgue | Sylvain Duquesne — Signatures électroniques à base de courbes elliptiques | Courbes elliptiques |
| Découvre Bitcoin | Signatures numériques et courbes elliptiques — chapitre 3.1 [Crypto 301] | Courbes elliptiques |
| Techno | Qu'est ce qu'un certificat SSL/TLS ? | PKI |
| Yann Bidon | 2 — Les certificats — Comprendre comment marche le SSL | PKI |
| Cookie connecté | Comprendre le chiffrement SSL / TLS avec des emojis (et le HTTPS) | TLS 1.3 |
| Malt | SSL/TLS pour les nuls — Julien Aubert | TLS 1.3 |
| CNRS | Benjamin Wesolowski, la cryptographie post-quantique | Post-quantique |
| Capitole du Libre | Cryptographie post-quantique : revoyons les bases. | Post-quantique |
| Devoxx France | Cryptographie post-quantique : les fondamentaux du numérique de demain (Willy Malvault) | Post-quantique |
| Exo7Math | Cryptographie — partie 1 : chiffrement de César | Chiffrement symétrique |
| Mickaël Dupont | Le chiffrement symétrique — AES expliqué | Chiffrement symétrique |
| Exo7Math | Cryptographie — parties 5 et 6 : arithmétique pour RSA, chiffrement RSA | RSA |
| String Theory FR | La magie du protocole RSA — CRYPTO #12 | RSA |

Si une vidéo devient indisponible, remplacez son identifiant dans `cours.json` et relancez
l'import (ou modifiez la leçon dans le studio).

### Documents PDF

Seuls des documents dont la licence autorise la rediffusion sont hébergés, **sans modification**,
avec la mention de leur source dans les notes de la leçon. Le détail (URL, date, empreinte
SHA-256) est dans `sources.json`.

| Éditeur | Documents | Licence |
|---|---|---|
| NIST | FIPS 180-4, 186-5, 197, 202, 203, 204, 205 ; SP 800-38D, 800-52 rév. 2, 800-57 partie 1 rév. 5 | œuvres du gouvernement fédéral des États-Unis, non soumises au droit d'auteur (17 U.S.C. § 105) |
| IRTF / RFC Editor | RFC 9106 (Argon2) | © IETF Trust et auteurs ; diffusion intégrale et non modifiée autorisée (IETF Trust Legal Provisions, BCP 78) |
| ANSSI | Recommandations de sécurité relatives à TLS (v1.2, 2020) ; Guide de sélection d'algorithmes cryptographiques (2021) | Licence Ouverte / Open Licence (Etalab) |
| ANSSI | Guide des mécanismes cryptographiques (ANSSI-PG-083, 2026) ; Transition post-quantique de TLS 1.3 (ANSSI-FT-115, 2026) | Licence Ouverte v2.0 (Etalab) |

L'*Avis de l'ANSSI sur la migration vers la cryptographie post-quantique* ne porte pas de mention
de licence : il n'est pas hébergé, seulement cité.
