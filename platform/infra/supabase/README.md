# Données : tout chez Supabase

Aucune donnée n'est stockée sur la machine qui fait tourner l'API :

- **Base PostgreSQL Supabase** : comptes, cours, leçons, progression, certificats, et même les
  compteurs anti-abus (table `rate_limit_counters`, qui remplace Redis) ;
- **Supabase Storage** : images, PDF et vidéos, dans le bucket privé `cryptoplatform-media`,
  utilisé par son interface compatible S3.

L'authentification reste celle de l'API Spring (Argon2id, JWT, OAuth) : les services Auth et
l'API de données (PostgREST) de Supabase ne sont pas utilisés.

## Choix techniques

| Choix | Raison |
|---|---|
| Schéma dédié **`app`** (pas `public`) | Supabase publie automatiquement le schéma `public` par son API de données (PostgREST), avec une clé publique : la table `users` (empreintes de mots de passe) y serait exposée. Le schéma `app` n'est ni publié ni accessible aux rôles `anon` et `authenticated`. |
| Connexion par le **Session pooler** (`aws-*.pooler.supabase.com:5432`) | La connexion directe (`db.<ref>.supabase.co`) n'existe qu'en IPv6, absent de Docker Desktop sous Windows et de nombreux hébergeurs. Le mode *transaction* (port 6543) est exclu : il perd le `search_path` et les requêtes préparées entre deux transactions. |
| `sslmode=require` | Trafic chiffré entre l'API et Supabase. |
| `DB_POOL_SIZE=5` | Le pooler du plan gratuit accepte une quinzaine de sessions : on en laisse pour l'éditeur SQL et les outils. |
| Flyway inchangé | Les migrations créent le schéma au premier démarrage, comme avec PostgreSQL local. |
| Fichiers dans **Supabase Storage**, pas dans des tables | PostgreSQL n'est pas fait pour les fichiers : ils gonfleraient la base (500 Mo sur le plan gratuit, contre 1 Go de Storage) et chaque téléchargement occuperait une des rares connexions de l'API. |
| Bucket **privé**, sans politique d'accès | Personne ne lit un fichier directement : l'API le relaie après avoir vérifié les droits (inscription au cours, etc.). Seules les clés S3 du serveur y ont accès. |
| `STORAGE_MAX_VIDEO=50MB` | Le plan gratuit refuse les fichiers de plus de 50 Mo : l'API l'annonce clairement à l'envoi. |
| Compteurs anti-abus en table `UNLOGGED` | Données jetables, écritures rapides ; chaque opération est validée hors de la transaction de l'appelant, pour qu'un échec de connexion reste compté. |

Les tests (`mvn test`) n'utilisent jamais Supabase : ils démarrent un PostgreSQL jetable
(Testcontainers) avec la même configuration de schéma, et un stockage de fichiers en mémoire.

## 1. Créer le projet Supabase

1. Sur <https://supabase.com/dashboard>, **New project** :
   - **Name** : `cryptoplatform` ;
   - **Database Password** : **Generate a password**, puis copiez-le ;
   - **Region** : **West EU (Paris)**, la plus proche de Dakar et de l'Afrique de l'Ouest.
2. Facultatif mais recommandé : dans les réglages du projet, section **Data API**, désactivez
   l'API de données (elle ne sert pas ; tout passe par l'API Spring).

## 2. Renseigner la connexion

Bouton **Connect** (en haut du tableau de bord), onglet **Connection String**, type **JDBC**,
méthode **Session pooler**. L'adresse affichée ressemble à :

```
jdbc:postgresql://aws-0-eu-west-3.pooler.supabase.com:5432/postgres?user=postgres.abcdefghijklmnop&password=[YOUR-PASSWORD]
```

Reportez-la dans `platform/.env` (jamais versionné), **en séparant l'utilisateur et le mot de passe** :

```dotenv
DB_URL=jdbc:postgresql://aws-0-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require
DB_USER=postgres.abcdefghijklmnop
DB_PASSWORD=le-mot-de-passe-de-la-base
DB_POOL_SIZE=5
DEMO_DATA=false
```

## 3. Clés de Supabase Storage

Dans le tableau de bord : **Storage**, puis **S3** (réglages de connexion S3), **New access key**
(description : `cryptoplatform-api`). Le secret n'est affiché qu'une fois. Dans `platform/.env` :

```dotenv
S3_ENDPOINT=https://<référence>.storage.supabase.co/storage/v1/s3
S3_REGION=eu-central-1
S3_ACCESS_KEY=l-identifiant-de-la-cle
S3_SECRET_KEY='le-secret-de-la-cle'
STORAGE_MAX_VIDEO=50MB
```

Le bucket privé `cryptoplatform-media` (50 Mo par fichier au plus) se crée en SQL :

```sql
insert into storage.buckets (id, name, public, file_size_limit)
values ('cryptoplatform-media', 'cryptoplatform-media', false, 52428800);
```

## 4. Bascule depuis les services locaux (une seule fois)

Depuis `platform/` :

```bash
docker compose --profile app up -d --build api       # Flyway crée le schéma « app » sur Supabase
docker compose --profile local up -d postgres seaweedfs   # anciens services locaux, seulement lus
bash infra/supabase/migrer-donnees.sh                # base : copie + comparaison table par table
bash infra/supabase/migrer-fichiers.sh               # fichiers : copie + contrôle SHA-256
docker compose up -d api web                         # la plateforme tourne sur Supabase
docker compose --profile local stop                  # les volumes locaux restent en sauvegarde
```

`migrer-donnees.sh` vérifie que les deux bases sont à la même version de migration, vide les
tables de Supabase, copie toutes les données dans **une seule transaction** (tout ou rien), puis
compare le nombre de lignes de chaque table. `migrer-fichiers.sh` copie les seuls fichiers
référencés en base, puis les retélécharge depuis Supabase et compare leur SHA-256 à celui
enregistré à l'envoi. Les deux scripts sont rejouables et n'écrivent aucun fichier sur le disque.

## Au quotidien

- **Requêtes SQL** dans l'éditeur de Supabase : préfixez les tables par le schéma, par exemple
  `select username, email from app.users;`.
- **Nouvelle migration** : ajoutez la version suivante (`V9__….sql`) dans `api/src/main/resources/db/migration`,
  Flyway l'applique sur Supabase au démarrage suivant de l'API.
- **Plan gratuit** : le projet est mis en pause après une semaine sans activité. Pour une
  plateforme ouverte au public, passez au plan Pro (sauvegardes quotidiennes, pas de pause).
- **Fichiers** : visibles avec aperçu dans l'onglet **Storage** du tableau de bord (bucket
  `cryptoplatform-media`) ; les noms sont des identifiants, la table `app.media_assets` donne
  le nom d'origine de chacun.
- **Hors ligne** : videz `DB_URL`, `S3_ENDPOINT`, `S3_ACCESS_KEY` et `S3_SECRET_KEY` dans `.env`
  et ajoutez `--profile local` pour retrouver PostgreSQL et SeaweedFS locaux.
