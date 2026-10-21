# Rootwise

Plateforme communautaire de cryptographie : cours, chat temps réel, forum, labo crypto et veille.

| Dossier | Rôle | Stack |
|---|---|---|
| `api/` | API REST + WebSocket | Spring Boot 4.1 · Java 17 · Spring Modulith · Supabase : PostgreSQL (Flyway) et Storage (S3) |
| `web/` | Site et application | Next.js 16 (App Router) · TypeScript · Tailwind 4 · shadcn/ui |
| `compose.yaml` | Conteneurs | `api` et `web` (profil `app`), Mailpit ; PostgreSQL et SeaweedFS locaux pour travailler hors ligne (profil `local`) |
| `infra/supabase/` | Données | Projet Supabase (base + fichiers), connexion, scripts de bascule |

## Démarrage en développement

Prérequis : Docker Desktop, JDK 17+, Maven 3.9+, Node.js 20+, et les accès Supabase (base et
Storage) dans `.env` ([infra/supabase/README.md](infra/supabase/README.md)). Rien n'est stocké en local.

```bash
# 1. Boîte mail de test (Mailpit) ; base et fichiers sont chez Supabase
docker compose up -d

# 2. API sur http://localhost:8080 (migrations Flyway au démarrage ; DEMO_DATA=true crée deux cours d'exemple)
cd api && DEMO_DATA=true mvn spring-boot:run

# 3. Site sur http://localhost:3000
cd web && cp .env.example .env.local && npm install && npm run dev
```

Tout en conteneurs : `docker compose --profile app up -d --build`.

## Tests

```bash
cd api && mvn test     # Testcontainers : nécessite Docker démarré
cd web && npm run lint && npm run build
```

`ModularityTests` échoue si un module utilise le code interne d'un autre ; la documentation des
modules (PlantUML) est générée dans `api/target/spring-modulith-docs`.

## Organisation de l'API

Un package par module métier sous `sn.cryptoplatform` : `auth`, `user`, `course`, `quiz`, `chat`,
`forum`, `blog`, `lab`, `media`, `notification`, `moderation`, plus `shared` (sécurité, erreurs).
Seules les classes du package racine d'un module sont visibles des autres ; les modules
communiquent par événements (table `event_publication`).

Le schéma de la base appartient à Flyway (`api/src/main/resources/db/migration`) ;
Hibernate se contente de le valider (`ddl-auto=validate`).

## Authentification

- **Comptes** : inscription par e-mail avec vérification obligatoire avant la première connexion,
  ou via Google / GitHub (bouton affiché seulement si le fournisseur est configuré).
- **Mots de passe** : Argon2id (19 Mio, 2 itérations), 12 caractères minimum.
- **Sessions** : JWT d'accès de 15 min + jeton de rafraîchissement de 30 jours, tous deux en
  cookies `httpOnly`, `Secure`, `SameSite=Lax`. Le jeton de rafraîchissement change à chaque usage ;
  rejouer un ancien jeton ferme toute la session. Changer de mot de passe ou suspendre un compte
  coupe immédiatement toutes les sessions (claim `ver` comparé à `users.token_version`).
- **CSRF** : double soumission (cookie `XSRF-TOKEN` renvoyé dans l'en-tête `X-XSRF-TOKEN`).
- **Anti-énumération** : réponses identiques que l'adresse existe ou non (inscription,
  connexion, mot de passe oublié) ; les e-mails partent en asynchrone.
- **Limitation** : tentatives de connexion et de réinitialisation limitées (table `rate_limit_counters`).
- **E-mails** : en local, lisibles sur Mailpit (http://localhost:8025). Les jetons sont placés
  après le `#` des liens, jamais transmis au serveur ni journalisés.

Premier administrateur : mettre son adresse dans `ADMIN_EMAILS`, puis s'inscrire et valider l'e-mail.

## E-learning

- **Catalogue public** (`/cours`) : filtres par niveau et par thème, recherche ; rendu serveur (indexable).
- **Leçons** texte (Markdown, formules LaTeX via KaTeX, code coloré), vidéo (MP4/WebM, reprise
  de lecture, terminée à 90 %), PDF (visionneuse pdf.js intégrée) ou **vidéo YouTube** intégrée
  (lecteur `youtube-nocookie`, la vidéo reste hébergée par son auteur). Les leçons vidéo et PDF
  peuvent porter des notes en Markdown affichées sous le support. Les textes peuvent contenir des
  **images** (PNG, JPEG, WebP) hébergées par la plateforme ; celles de sites tiers ne sont pas
  chargées. Les encadrés `> [!NOTE]`, `[!TIP]`, `[!WARNING]`… s'affichent avec une icône et un
  titre, et les blocs de code comme une fenêtre de terminal avec un bouton « Copier ». Aperçu
  gratuit possible par leçon.
- **Formateurs** : photo, titre professionnel et présentation se règlent dans « Mon compte »
  (`PUT /api/me/profile`, `POST /api/me/avatar`) ; ils s'affichent sur chaque carte de cours, la
  présentation du cours et chaque leçon, et sur la page publique `/formateurs/<nom>`.
- **Interface** : thème clair par défaut (marine et sarcelle), thème sombre au choix (mémorisé),
  animations discrètes (bibliothèque `motion`) désactivées si le système demande de réduire les
  animations.
- **Progression** par leçon et par cours ; **quiz** de fin de chapitre corrigés côté serveur
  (tout ou rien par question, corrigés révélés seulement après réussite ou dernier essai).
- **Certificats** délivrés quand toutes les leçons sont terminées et tous les quiz réussis, signés
  en **Ed25519** ; la page publique `/certificats/<numéro>` les vérifie et explique comment le
  refaire avec OpenSSL. Les clés publiques successives sont conservées (`certificate_signing_keys`).
- **Studio** (`/studio`, rôles CREATOR et ADMIN) : cours, chapitres, leçons, envoi de fichiers
  avec progression, liens YouTube (`youtube.com/watch?v=…`, `youtu.be/…`), insertion d'images et
  aperçu du Markdown, quiz, publication.
  Un administrateur peut aussi réattribuer un cours à un autre créateur (champ « Auteur »).
- **Contenu** : 7 cours de cryptographie (hachage, courbes elliptiques, PKI, TLS 1.3,
  post-quantique, et compléments aux deux cours d'exemple) et 8 cours d'administration Linux
  (Bash, head/tail/cat, usermod, DNF, réparation apt/dnf, réseau, supervision, PM2), tirés des
  guides de Ngouye GNING, sont décrits dans [`content/`](content/README.md) et
  s'importent par l'API avec `node content/import.mjs` (voir ce fichier : sources, licences).
  `node content/exporter.mjs` fait l'inverse : il exporte tous les cours publiés en Markdown dans
  le dossier [`cours/`](../cours/README.md) à la racine du dépôt.
- **Fichiers** : stockés dans un bucket S3 (SeaweedFS en local, AWS S3 ou Cloudflare R2 en
  production) et toujours relayés par l'API, qui vérifie l'inscription à chaque requête et gère
  les requêtes partielles (`Range`). Le type réel est contrôlé par signature binaire.
- **Créateurs** : les administrateurs peuvent créer des cours. En attendant l'écran
  d'administration, le rôle CREATOR se donne en base (effet à la prochaine connexion) :
  `INSERT INTO app.user_roles (user_id, role) SELECT id, 'CREATOR' FROM app.users WHERE email = 'prof@exemple.sn';`

## Configuration

| Variable | Défaut (local) | Utilisée par |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/cryptoplatform` | api — Supabase : Session pooler, `?sslmode=require` |
| `DB_USER` / `DB_PASSWORD` | `cryptoplatform` / `cryptoplatform` | api — Supabase : `postgres.<référence>` / mot de passe de la base |
| `DB_SCHEMA` / `DB_POOL_SIZE` | `app` / `10` | api — schéma des tables (jamais `public` chez Supabase) ; `5` sur le plan gratuit |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_FROM` | `localhost` / `1025` (Mailpit) | api |
| `APP_PUBLIC_URL` | `http://localhost:3000` | api (liens des e-mails, retour OAuth) |
| `JWT_SECRET` | vide = clé éphémère | api — **obligatoire en production** : `openssl rand -base64 32` |
| `ADMIN_EMAILS` | vide | api |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | vide | api (retour : `<APP_PUBLIC_URL>/login/oauth2/code/google`) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | vide | api (retour : `<APP_PUBLIC_URL>/login/oauth2/code/github`) |
| `S3_ENDPOINT` / `S3_REGION` / `S3_BUCKET` | `http://localhost:8333` / `us-east-1` / `cryptoplatform-media` | api (endpoint vide = AWS) |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | identifiants de `infra/seaweedfs/s3.json` | api — **à changer en production** |
| `CERT_SIGNING_KEY` | vide = clé éphémère | api — clé Ed25519 PKCS#8 en Base64 : `openssl genpkey -algorithm ed25519 -outform DER \| base64 -w0` |
| `DEMO_DATA` | `false` (`true` dans compose) | api — deux cours d'exemple au premier démarrage |
| `API_URL` | `http://localhost:8080` | web (au build pour le proxy `/api`, à l'exécution côté serveur) |

En production, toutes ces valeurs doivent être fournies par l'environnement, et l'API ne doit être
joignable qu'à travers le proxy (elle se fie à l'en-tête `X-Forwarded-For` pour limiter les tentatives).
