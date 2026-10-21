#!/usr/bin/env bash
# Copie les données de la base PostgreSQL locale vers Supabase (même schéma « app » des deux
# côtés), puis compare le nombre de lignes de chaque table.
#
# Prérequis (voir README.md) :
#   1. platform/.env contient DB_URL, DB_USER et DB_PASSWORD du projet Supabase ;
#   2. l'API a démarré une fois sur Supabase : Flyway y a créé le schéma « app » ;
#   3. la base locale tourne : docker compose --profile local up -d postgres
#
# Usage, depuis platform/ :  bash infra/supabase/migrer-donnees.sh
#   (ENV_FILE=autre-fichier pour lire la connexion ailleurs que dans .env)
#
# Rejouable : les tables de Supabase sont vidées puis remplies dans une seule transaction (tout ou
# rien). La base locale n'est que lue. Aucun fichier n'est écrit : les données (dont les empreintes
# de mots de passe) passent directement d'une base à l'autre.
set -euo pipefail
cd "$(dirname "$0")/../.."
export MSYS_NO_PATHCONV=1 # Git Bash sous Windows : ne pas convertir les arguments en chemins
ENV_FILE=${ENV_FILE:-.env}

# Lit une variable de $ENV_FILE sans l'exécuter (un mot de passe peut contenir $, espaces, etc.).
env_value() {
  local line
  line=$(grep -E "^$1=" "$ENV_FILE" 2>/dev/null | tail -n 1 || true)
  line=${line#*=}
  line=${line%$'\r'}
  line=${line#\"} && line=${line%\"}
  line=${line#\'} && line=${line%\'}
  printf '%s' "$line"
}

DB_URL=$(env_value DB_URL)
PGUSER=$(env_value DB_USER)
PGPASSWORD=$(env_value DB_PASSWORD)
SCHEMA=$(env_value DB_SCHEMA)
SCHEMA=${SCHEMA:-app}
export PGUSER PGPASSWORD
[[ $DB_URL == *supabase.com* ]] || { echo "DB_URL ($ENV_FILE) ne pointe pas vers Supabase." >&2; exit 1; }
[[ -n $PGUSER && -n $PGPASSWORD ]] || { echo "DB_USER ou DB_PASSWORD manque dans $ENV_FILE." >&2; exit 1; }
[[ $SCHEMA =~ ^[a-z_][a-z0-9_]*$ ]] || { echo "DB_SCHEMA invalide : $SCHEMA" >&2; exit 1; }
TARGET=${DB_URL#jdbc:} # même adresse pour psql : postgresql://hôte:5432/postgres?sslmode=require

# psql vers Supabase (image officielle, identifiants transmis par variables d'environnement).
supabase() { docker run -i --rm -e PGUSER -e PGPASSWORD postgres:17-alpine psql "$TARGET" -X -v ON_ERROR_STOP=1 "$@"; }
# Commandes dans le conteneur de la base locale.
local_db() { docker compose --profile local exec -T postgres "$@"; }
local_psql() { local_db psql -U cryptoplatform -d cryptoplatform -X -v ON_ERROR_STOP=1 "$@"; }

LAST_MIGRATION="select version from %s.flyway_schema_history where success order by installed_rank desc limit 1"

echo "1/3  Vérification des deux bases"
local_version=$(local_psql -tA -c "$(printf "$LAST_MIGRATION" "$SCHEMA")")
remote_version=$(supabase -tA -c "$(printf "$LAST_MIGRATION" "$SCHEMA")") ||
  { echo "Schéma « $SCHEMA » introuvable sur Supabase : démarrez d'abord l'API (Flyway le crée)." >&2; exit 1; }
[[ $local_version == "$remote_version" ]] ||
  { echo "Schémas différents : base locale en V$local_version, Supabase en V$remote_version." >&2; exit 1; }
echo "     Les deux bases sont en V$remote_version."

tables=$(supabase -tA -c "select string_agg(format('%I.%I', schemaname, tablename), ', ' order by tablename)
  from pg_tables where schemaname = '$SCHEMA' and tablename <> 'flyway_schema_history'")

echo "2/3  Copie des données vers Supabase (une seule transaction)"
{
  # Les contraintes ont déjà été vérifiées par la base d'origine : on les suspend pendant la copie,
  # car certaines références sont circulaires (users ↔ media_assets, threads ↔ posts, messages)
  # et aucun ordre d'insertion ne les satisfait toutes.
  echo "SET session_replication_role = replica;"
  # Vide aussi les données de référence et d'exemple créées au premier démarrage.
  echo "TRUNCATE $tables RESTART IDENTITY CASCADE;"
  # (pg_dump signale ces références circulaires : avertissement attendu, masqué.)
  # transaction_timeout (PostgreSQL 17) est retiré au cas où le projet Supabase serait en 15 ou 16.
  local_db pg_dump -U cryptoplatform -d cryptoplatform --data-only --schema="$SCHEMA" \
    --exclude-table="$SCHEMA.flyway_schema_history" --no-owner --no-privileges \
    2> >(grep -v -E '^pg_dump: (warning|detail|hint):' >&2) |
    sed -e '/^SET transaction_timeout/d'
} | supabase -q --single-transaction -f - >/dev/null # les erreurs restent affichées (stderr)

echo "3/3  Comparaison du nombre de lignes, table par table"
count_rows() {
  cat <<SQL
select table_name || ' ' || (xpath('/row/n/text()',
  query_to_xml(format('select count(*) as n from %I.%I', table_schema, table_name), false, true, '')))[1]::text
from information_schema.tables
where table_schema = '$1' and table_type = 'BASE TABLE' and table_name <> 'flyway_schema_history'
order by table_name;
SQL
}
local_counts=$(local_psql -tA -c "$(count_rows "$SCHEMA")")
remote_counts=$(supabase -tA -c "$(count_rows "$SCHEMA")")
if [[ $local_counts == "$remote_counts" ]]; then
  echo "$remote_counts" | awk '{ rows += $2 } END { printf "     Identiques : %d tables, %d lignes.\n", NR, rows }'
else
  diff <(echo "$local_counts") <(echo "$remote_counts") || true
  echo "Écart entre les deux bases (voir ci-dessus)." >&2
  exit 1
fi
echo "Terminé. Redémarrez l'API : docker compose --profile app up -d api"
