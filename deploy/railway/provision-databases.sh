#!/usr/bin/env bash
# Create all NexusHR databases on a single Railway PostgreSQL instance.
# Usage (from Railway Postgres shell or locally with DATABASE_URL set):
#   export DATABASE_URL="postgresql://user:pass@host:port/railway?sslmode=require"
#   ./deploy/railway/provision-databases.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SQL_FILE="${ROOT}/deploy/railway/init-databases.sql"

if [[ -z "${DATABASE_URL:-}" && -z "${DATABASE_PUBLIC_URL:-}" ]]; then
  echo "ERROR: Set DATABASE_URL or DATABASE_PUBLIC_URL (Railway Postgres plugin)." >&2
  exit 1
fi

URL="${DATABASE_PUBLIC_URL:-${DATABASE_URL}}"

echo "Provisioning NexusHR databases on PostgreSQL..."
psql "$URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
echo "Done. Databases:"
psql "$URL" -Atc "SELECT datname FROM pg_database WHERE datname LIKE 'nexus_%' ORDER BY 1"
