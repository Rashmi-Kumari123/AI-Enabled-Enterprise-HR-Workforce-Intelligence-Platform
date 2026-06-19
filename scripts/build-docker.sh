#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

IMAGE_PREFIX="${IMAGE_PREFIX:-nexushr}"
TAG="${TAG:-latest}"

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

echo "Building Spring Boot service images (${IMAGE_PREFIX}/*:${TAG})..."
for module in "${SERVICES[@]}"; do
  echo "→ ${module}"
  docker build -f docker/Dockerfile.spring-service \
    --build-arg "SERVICE_MODULE=${module}" \
    -t "${IMAGE_PREFIX}/${module}:${TAG}" \
    .
done

echo "Building frontend image (${IMAGE_PREFIX}/frontend:${TAG})..."
docker build -f frontend/Dockerfile \
  --build-arg VITE_AUTH_API_URL="${VITE_AUTH_API_URL:-http://localhost:8080}" \
  --build-arg VITE_EMPLOYEE_API_URL="${VITE_EMPLOYEE_API_URL:-http://localhost:8080}" \
  --build-arg VITE_ATTENDANCE_API_URL="${VITE_ATTENDANCE_API_URL:-http://localhost:8080}" \
  --build-arg VITE_LEAVE_API_URL="${VITE_LEAVE_API_URL:-http://localhost:8080}" \
  --build-arg VITE_PAYROLL_API_URL="${VITE_PAYROLL_API_URL:-http://localhost:8080}" \
  --build-arg VITE_PERFORMANCE_API_URL="${VITE_PERFORMANCE_API_URL:-http://localhost:8080}" \
  --build-arg VITE_NOTIFICATION_API_URL="${VITE_NOTIFICATION_API_URL:-http://localhost:8080}" \
  --build-arg VITE_AI_INSIGHTS_API_URL="${VITE_AI_INSIGHTS_API_URL:-http://localhost:8080}" \
  -t "${IMAGE_PREFIX}/frontend:${TAG}" \
  frontend

echo "Done. Images:"
docker images | grep "${IMAGE_PREFIX}" | head -20
