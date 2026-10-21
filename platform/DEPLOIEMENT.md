# Mise en ligne de Rootwise

```
Visiteurs ──► Vercel (site Next.js, Francfort)
                │  /api, /oauth2, /login/oauth2 relayés (même domaine : cookies first-party)
                ▼
              Render (API Spring Boot, Docker, Francfort)
                │
                ▼
              Supabase (PostgreSQL + Storage, Francfort)
```

Vercel n'exécute pas de serveur Java : le site y est hébergé, l'API l'est chez Render. Tout est à
Francfort, à côté de Supabase, pour limiter les allers-retours.

| Service | Rôle | Offre conseillée |
|---|---|---|
| Vercel | Site (`platform/web`) | Hobby (gratuit, usage non commercial) |
| Render | API (`platform/api`, Blueprint [`render.yaml`](../render.yaml)) | `free` pour tester (veille après 15 min), `0.5c-512mb` pour le public |
| Supabase | Base de données et fichiers | déjà en place ([infra/supabase](infra/supabase/README.md)) |
| Brevo | Envoi des e-mails (inscription, mot de passe oublié) | gratuit (300 e-mails par jour) |

Les deux hébergeurs déploient depuis GitHub : chaque `git push` sur la branche principale remet à
jour le site et l'API.

## 1. E-mails : Brevo

1. Créer un compte sur <https://www.brevo.com>.
2. **Senders, domains & dedicated IPs** > **Senders** : ajouter et valider l'adresse d'expédition.
3. **SMTP & API** > **SMTP** : noter l'identifiant (login) et générer une **clé SMTP**.

## 2. API : Render

1. <https://dashboard.render.com> > **New** > **Blueprint**, choisir le dépôt GitHub : Render lit
   `render.yaml` et prépare le service `rootwise-api`.
2. Renseigner les valeurs demandées :

| Variable | Valeur |
|---|---|
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | celles de `platform/.env` |
| `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | celles de `platform/.env` |
| `CERT_SIGNING_KEY` | clé Ed25519 générée pour la production (fichier fourni à part, jamais versionné) |
| `APP_PUBLIC_URL` | provisoirement `https://rootwise.vercel.app`, corrigée à l'étape 4 |
| `MAIL_HOST` | `smtp-relay.brevo.com` |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | login et clé SMTP Brevo |
| `MAIL_FROM` | `Rootwise <adresse validée chez Brevo>` |
| `ADMIN_EMAILS` | adresses promues administrateur (facultatif) |

`JWT_SECRET` est généré par Render. Une fois déployée, l'API répond sur
`https://rootwise-api.onrender.com/actuator/health` (le nom exact est affiché par Render).

## 3. Site : Vercel

1. <https://vercel.com/new>, importer le même dépôt GitHub.
2. **Root Directory** : `platform/web` (Vercel détecte Next.js).
3. **Environment Variables** : `API_URL` = adresse de l'API Render (sans `/` final), pour
   *Production* et *Preview*. Elle sert à la compilation (relais `/api`) et à l'exécution.
4. **Deploy**. `vercel.json` place les fonctions du site à Francfort (`fra1`).

## 4. Finaliser

1. Dans Render, mettre `APP_PUBLIC_URL` à l'adresse définitive du site, puis **Manual Deploy**.
2. Vérifier : accueil, catalogue, connexion, une leçon, l'envoi d'un e-mail (inscription d'un
   compte de test) et, dans le studio, l'envoi d'un PDF de plusieurs mégaoctets.

## Nom de domaine

Ajouter le domaine dans Vercel (**Settings** > **Domains**), puis mettre à jour `APP_PUBLIC_URL` dans
Render. Les connexions Google et GitHub, si elles sont activées, doivent déclarer
`<APP_PUBLIC_URL>/login/oauth2/code/google` (ou `/github`) comme adresse de retour.
