#!/usr/bin/env bash
# Create all NexusHR databases on a PostgreSQL instance (RDS or local).
#
# Usage:
#   export DATABASE_URL="postgresql://user:pass@host:5432/postgres?sslmode=require"
#   ./scripts/postgres/provision-databases.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SQL_FILE="${ROOT}/scripts/postgres/init-databases-idempotent.sql"

if [[ -z "${DATABASE_URL:-}" && -z "${PGHOST:-}" ]]; then
  echo "ERROR: Set DATABASE_URL or PGHOST/PGUSER/PGPASSWORD." >&2
  exit 1
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
  psql "${DATABASE_URL}" -f "${SQL_FILE}"
else
  psql -h "${PGHOST}" -U "${PGUSER:-postgres}" -d postgres -f "${SQL_FILE}"
fi

echo "Databases provisioned."
