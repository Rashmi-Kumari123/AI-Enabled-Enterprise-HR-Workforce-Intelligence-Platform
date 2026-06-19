#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

verify_aws_credentials
require_docker
ecr_login

cd "${ROOT}"

echo "Building and pushing Spring Boot images (tag: ${IMAGE_TAG})..."
for module in "${SERVICES[@]}"; do
  uri="$(ecr_image_uri "${module}")"
  echo "→ ${module} → ${uri}"
  docker build -f docker/Dockerfile.spring-service \
    --build-arg "SERVICE_MODULE=${module}" \
    -t "${uri}" \
    .
  docker push "${uri}"
done

frontend_uri="$(ecr_registry)/${ECR_PREFIX}-frontend:${IMAGE_TAG}"
echo "→ frontend → ${frontend_uri}"
docker build -f frontend/Dockerfile \
  --build-arg VITE_AUTH_API_URL="${VITE_AUTH_API_URL:-http://localhost:8080}" \
  --build-arg VITE_EMPLOYEE_API_URL="${VITE_EMPLOYEE_API_URL:-http://localhost:8080}" \
  --build-arg VITE_ATTENDANCE_API_URL="${VITE_ATTENDANCE_API_URL:-http://localhost:8080}" \
  --build-arg VITE_LEAVE_API_URL="${VITE_LEAVE_API_URL:-http://localhost:8080}" \
  --build-arg VITE_PAYROLL_API_URL="${VITE_PAYROLL_API_URL:-http://localhost:8080}" \
  --build-arg VITE_PERFORMANCE_API_URL="${VITE_PERFORMANCE_API_URL:-http://localhost:8080}" \
  --build-arg VITE_NOTIFICATION_API_URL="${VITE_NOTIFICATION_API_URL:-http://localhost:8080}" \
  --build-arg VITE_AI_INSIGHTS_API_URL="${VITE_AI_INSIGHTS_API_URL:-http://localhost:8080}" \
  -t "${frontend_uri}" \
  frontend
docker push "${frontend_uri}"

echo ""
echo "All images pushed to ECR."
echo "Next: ./scripts/aws/deploy-k8s.sh"
