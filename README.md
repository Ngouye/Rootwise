# Rootwise

Plateforme communautaire de cybersécurité : cours de cryptographie et d'administration Linux,
quiz de chapitre et certificats signés (Ed25519) vérifiables par tous. Le chat, le forum, le labo
crypto et le blog sont en préparation.

Cours conçus et enseignés par **Ngouye GNING** (Master 2 TDSI, UCAD).

## Contenu du dépôt

Tout le projet se trouve dans [`platform/`](platform/) :

| Dossier | Rôle |
|---|---|
| [`platform/api`](platform/api) | API REST : Spring Boot 4, Java 17, Spring Modulith |
| [`platform/web`](platform/web) | Site : Next.js 16, TypeScript, Tailwind 4 |
| [`platform/content`](platform/content) | Cours en Markdown, guides PDF et script d'import |
| [`platform/infra`](platform/infra) | Supabase (base de données et fichiers), services locaux pour travailler hors ligne |

## Démarrer

Voir [`platform/README.md`](platform/README.md). Les données (base PostgreSQL et fichiers) sont
hébergées chez Supabase : [`platform/infra/supabase/README.md`](platform/infra/supabase/README.md).

## Historique

L'ancienne application ProjectCryptoJava (projet de Master 2 TDSI : Spring Boot 3, React, MySQL)
a été retirée du dépôt le 10 octobre 2026. Son code reste consultable dans l'historique Git, par
exemple : `git show 456691e:backend/pom.xml`.
