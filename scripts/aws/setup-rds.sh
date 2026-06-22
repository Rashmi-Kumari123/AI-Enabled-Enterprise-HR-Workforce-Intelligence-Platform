#!/usr/bin/env bash
# Optional: create RDS PostgreSQL for production (costs ~$15+/month).
# In-cluster Postgres (k8s/infrastructure.yaml) is used by default for EKS demo.
#
# Usage:
#   export RDS_PASSWORD='your-secure-password'
#   ./scripts/aws/setup-rds.sh
#
# Then set in k8s/configmap or per-deployment env:
#   DB_URL=jdbc:postgresql://<rds-endpoint>:5432/nexus_auth_db?sslmode=require

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

verify_aws_credentials

RDS_ID="${RDS_INSTANCE_ID:-nexushr-postgres}"
RDS_PASSWORD="${RDS_PASSWORD:-}"
DB_CLASS="${RDS_INSTANCE_CLASS:-db.t3.micro}"

if [[ -z "${RDS_PASSWORD}" ]]; then
  echo "ERROR: Set RDS_PASSWORD before running." >&2
  exit 1
fi

if aws rds describe-db-instances --db-instance-identifier "${RDS_ID}" --region "${AWS_REGION}" >/dev/null 2>&1; then
  ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier "${RDS_ID}" --region "${AWS_REGION}" \
    --query 'DBInstances[0].Endpoint.Address' --output text)
  echo "RDS instance '${RDS_ID}' already exists: ${ENDPOINT}"
else
  echo "Creating RDS PostgreSQL ${RDS_ID} (${DB_CLASS})..."
  aws rds create-db-instance \
    --db-instance-identifier "${RDS_ID}" \
    --db-instance-class "${DB_CLASS}" \
    --engine postgres \
    --engine-version 16.4 \
    --master-username postgres \
    --master-user-password "${RDS_PASSWORD}" \
    --allocated-storage 20 \
    --storage-type gp3 \
    --backup-retention-period 1 \
    --no-publicly-accessible \
    --region "${AWS_REGION}"

  echo "Waiting for RDS to become available (~5–10 min)..."
  aws rds wait db-instance-available --db-instance-identifier "${RDS_ID}" --region "${AWS_REGION}"
  ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier "${RDS_ID}" --region "${AWS_REGION}" \
    --query 'DBInstances[0].Endpoint.Address' --output text)
fi

echo ""
echo "RDS endpoint: ${ENDPOINT}"
echo "Provision databases:"
echo "  export DATABASE_URL=\"postgresql://postgres:PASSWORD@${ENDPOINT}:5432/postgres?sslmode=require\""
echo "  ./scripts/postgres/provision-databases.sh"
echo ""
echo "Update k8s deployment DB_URL values to use ${ENDPOINT} instead of postgres:5432"
