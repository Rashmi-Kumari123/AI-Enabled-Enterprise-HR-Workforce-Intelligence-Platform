#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

verify_aws_credentials

echo "Creating ECR repositories in ${AWS_REGION}..."
for module in "${SERVICES[@]}"; do
  repo="$(ecr_repo_name "${module}")"
  if aws ecr describe-repositories --repository-names "${repo}" --region "${AWS_REGION}" >/dev/null 2>&1; then
    echo "  ✓ ${repo} (exists)"
  else
    aws ecr create-repository \
      --repository-name "${repo}" \
      --image-scanning-configuration scanOnPush=true \
      --encryption-configuration encryptionType=AES256 \
      --region "${AWS_REGION}" >/dev/null
    echo "  + ${repo} (created)"
  fi
done

# Frontend image
frontend_repo="${ECR_PREFIX}-frontend"
if aws ecr describe-repositories --repository-names "${frontend_repo}" --region "${AWS_REGION}" >/dev/null 2>&1; then
  echo "  ✓ ${frontend_repo} (exists)"
else
  aws ecr create-repository \
    --repository-name "${frontend_repo}" \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    --region "${AWS_REGION}" >/dev/null
  echo "  + ${frontend_repo} (created)"
fi

echo ""
echo "ECR registry: $(ecr_registry)"
echo "Next: ./scripts/aws/push-images.sh"
