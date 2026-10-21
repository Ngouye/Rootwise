#!/usr/bin/env bash
# Copie les fichiers (images, PDF, vidéos) du stockage local SeaweedFS vers Supabase Storage, puis
# vérifie chaque fichier arrivé contre l'empreinte SHA-256 enregistrée dans la table media_assets.
#
# Prérequis (voir README.md) :
#   1. platform/.env contient la connexion à la base Supabase (DB_*) et à Supabase Storage
#      (S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY) ;
#   2. SeaweedFS tourne : docker compose --profile local up -d seaweedfs
#
# Usage, depuis platform/ :  bash infra/supabase/migrer-fichiers.sh
#
# Seuls les fichiers référencés en base sont copiés (pas les orphelins). Rejouable : un fichier déjà
# présent avec la même taille n'est pas renvoyé. La vérification télécharge les fichiers dans un
# dossier en mémoire du conteneur (tmpfs) : rien n'est écrit sur le disque de la machine.
set -euo pipefail
cd "$(dirname "$0")/../.."
export MSYS_NO_PATHCONV=1 # Git Bash sous Windows : ne pas convertir les arguments en chemins
ENV_FILE=${ENV_FILE:-.env}
RCLONE_IMAGE=rclone/rclone:1.71

# Lit une variable de $ENV_FILE sans l'exécuter (un secret peut contenir $, espaces, etc.).
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
BUCKET=$(env_value S3_BUCKET)
BUCKET=${BUCKET:-cryptoplatform-media}
S3_ENDPOINT=$(env_value S3_ENDPOINT)
S3_REGION=$(env_value S3_REGION)
S3_ACCESS_KEY=$(env_value S3_ACCESS_KEY)
S3_SECRET_KEY=$(env_value S3_SECRET_KEY)
export PGUSER PGPASSWORD
[[ $DB_URL == *supabase.com* ]] || { echo "DB_URL ($ENV_FILE) ne pointe pas vers Supabase." >&2; exit 1; }
[[ $S3_ENDPOINT == *supabase.co* ]] || { echo "S3_ENDPOINT ($ENV_FILE) ne pointe pas vers Supabase Storage." >&2; exit 1; }
[[ -n $S3_ACCESS_KEY && -n $S3_SECRET_KEY && -n $S3_REGION ]] ||
  { echo "S3_ACCESS_KEY, S3_SECRET_KEY ou S3_REGION manque dans $ENV_FILE." >&2; exit 1; }
[[ $SCHEMA =~ ^[a-z_][a-z0-9_]*$ ]] || { echo "DB_SCHEMA invalide : $SCHEMA" >&2; exit 1; }

supabase_sql() { docker run -i --rm -e PGUSER -e PGPASSWORD postgres:17-alpine psql "${DB_URL#jdbc:}" -X -v ON_ERROR_STOP=1 -tA "$@"; }

# Deux emplacements rclone décrits par variables d'environnement (aucun fichier de configuration) :
# « local » = SeaweedFS (identifiants de développement d'infra/seaweedfs/s3.json), « supabase ».
export RCLONE_CONFIG_LOCAL_TYPE=s3 RCLONE_CONFIG_LOCAL_PROVIDER=SeaweedFS RCLONE_CONFIG_LOCAL_REGION=us-east-1
export RCLONE_CONFIG_LOCAL_ENDPOINT=http://seaweedfs:8333
export RCLONE_CONFIG_LOCAL_ACCESS_KEY_ID=cryptoplatform RCLONE_CONFIG_LOCAL_SECRET_ACCESS_KEY=cryptoplatform-dev-secret
export RCLONE_CONFIG_SUPABASE_TYPE=s3 RCLONE_CONFIG_SUPABASE_PROVIDER=Other RCLONE_CONFIG_SUPABASE_FORCE_PATH_STYLE=true
export RCLONE_CONFIG_SUPABASE_ENDPOINT="$S3_ENDPOINT" RCLONE_CONFIG_SUPABASE_REGION="$S3_REGION"
export RCLONE_CONFIG_SUPABASE_ACCESS_KEY_ID="$S3_ACCESS_KEY" RCLONE_CONFIG_SUPABASE_SECRET_ACCESS_KEY="$S3_SECRET_KEY"
rclone_env=()
for name in $(compgen -e | grep '^RCLONE_CONFIG_'); do rclone_env+=(-e "$name"); done
# Les secrets passent par l'environnement du conteneur, jamais par la ligne de commande.
rclone_run() { docker run -i --rm --network cryptoplatform_default "${rclone_env[@]}" "$@"; }

echo "1/3  Liste des fichiers référencés en base"
keys=$(supabase_sql -c "select storage_key from $SCHEMA.media_assets order by storage_key")
expected=$(supabase_sql -c "select storage_key || ' ' || encode(sha256, 'hex') from $SCHEMA.media_assets order by storage_key")
total=$(supabase_sql -c "select count(*) || ' fichiers, ' || pg_size_pretty(sum(size_bytes)) from $SCHEMA.media_assets")
echo "     $total"

echo "2/3  Copie SeaweedFS → Supabase Storage (bucket « $BUCKET »)"
# --metadata conserve le type MIME (aperçus du tableau de bord) ; l'intégrité est contrôlée à
# l'étape 3 par SHA-256, d'où --ignore-checksum (les ETag diffèrent d'un service S3 à l'autre).
printf '%s\n' "$keys" | rclone_run "$RCLONE_IMAGE" copy "local:$BUCKET" "supabase:$BUCKET" \
  --files-from-raw - --metadata --size-only --ignore-checksum --s3-no-check-bucket \
  --transfers 8 --stats 0 --log-level ERROR

echo "3/3  Vérification : téléchargement depuis Supabase et contrôle SHA-256 de chaque fichier"
actual=$(printf '%s\n' "$keys" | rclone_run --tmpfs /verif:size=2g --entrypoint sh "$RCLONE_IMAGE" -c "
  rclone copy 'supabase:$BUCKET' /verif --files-from-raw - --s3-no-check-bucket --log-level ERROR &&
  cd /verif && find . -type f | sed 's|^\./||' | sort | while read -r key; do
    echo \"\$key \$(sha256sum \"\$key\" | cut -d' ' -f1)\"
  done")
if [[ $actual == "$expected" ]]; then
  echo "     Identiques : $(printf '%s\n' "$actual" | wc -l | tr -d ' ') fichiers, empreintes SHA-256 conformes."
else
  diff <(printf '%s\n' "$expected") <(printf '%s\n' "$actual") | head -20 || true
  echo "Écart entre la base et Supabase Storage (voir ci-dessus : < attendu, > obtenu)." >&2
  exit 1
fi
echo "Terminé. Redémarrez l'API : docker compose up -d api"
