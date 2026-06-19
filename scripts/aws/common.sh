#!/usr/bin/env bash
# Shared helpers for NexusHR AWS CLI deployment.
# Credentials: run `aws configure` or export AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.
# Never commit access keys to this repository.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export AWS_REGION="${AWS_REGION:-ap-south-1}"
export EKS_CLUSTER_NAME="${EKS_CLUSTER_NAME:-nexushr-prod}"
export IMAGE_TAG="${IMAGE_TAG:-latest}"
export ECR_PREFIX="${ECR_PREFIX:-nexushr}"

SERVICES=(
  api-gateway
  auth-service
  employee-service
  attendance-service
  leave-service
  payroll-service
  performance-service
  ai-insights-service
  notification-service
)

K8S_SERVICES=(
  api-gateway
  auth-service
  employee-service
  notification-service
  frontend
)

require_aws_cli() {
  if ! command -v aws >/dev/null 2>&1; then
    echo "ERROR: AWS CLI not found. Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html" >&2
    exit 1
  fi
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: Docker not found." >&2
    exit 1
  fi
}

aws_account_id() {
  aws sts get-caller-identity --query Account --output text
}

ecr_registry() {
  echo "$(aws_account_id).dkr.ecr.${AWS_REGION}.amazonaws.com"
}

ecr_repo_name() {
  local module="$1"
  echo "${ECR_PREFIX}-${module}"
}

ecr_image_uri() {
  local module="$1"
  echo "$(ecr_registry)/$(ecr_repo_name "${module}"):${IMAGE_TAG}"
}

verify_aws_credentials() {
  require_aws_cli
  if ! aws sts get-caller-identity >/dev/null 2>&1; then
    cat >&2 <<'EOF'
ERROR: AWS credentials are not configured.

Run once on your machine (do NOT commit these values):
  aws configure
    AWS Access Key ID:     <your key>
    AWS Secret Access Key: <your secret>
    Default region:        ap-south-1
    Default output:        json

Or export for the current shell:
  export AWS_ACCESS_KEY_ID=...
  export AWS_SECRET_ACCESS_KEY=...
  export AWS_REGION=ap-south-1
EOF
    exit 1
  fi
  echo "AWS account: $(aws_account_id) · region: ${AWS_REGION}"
}

ecr_login() {
  verify_aws_credentials
  aws ecr get-login-password --region "${AWS_REGION}" \
    | docker login --username AWS --password-stdin "$(ecr_registry)"
}
