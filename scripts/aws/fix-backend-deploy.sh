#!/usr/bin/env bash
# One-shot fix: apply infra + DB config, stabilize replicas on t3.small, rebuild frontend with gateway URL.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

verify_aws_credentials
require_docker

aws eks update-kubeconfig --name "${EKS_CLUSTER_NAME}" --region "${AWS_REGION}"

if [[ ! -f "${ROOT}/k8s/secrets.yaml" ]]; then
  echo "ERROR: k8s/secrets.yaml not found. Run: cp k8s/secrets.example.yaml k8s/secrets.yaml"
  exit 1
fi

registry="$(ecr_registry)"

echo "=== 1/5 Apply config, secrets, Postgres + Redis ==="
kubectl apply -f "${ROOT}/k8s/namespace.yaml"
kubectl apply -f "${ROOT}/k8s/configmap.yaml"
kubectl apply -f "${ROOT}/k8s/secrets.yaml"
kubectl apply -f "${ROOT}/k8s/infrastructure.yaml"
kubectl wait --for=condition=available deployment/postgres -n nexushr --timeout=300s
kubectl wait --for=condition=available deployment/redis -n nexushr --timeout=120s

echo "=== 2/5 Apply deployments (ECR images) + HPA (min 1) ==="
sed "s|nexushr/|${registry}/${ECR_PREFIX}-|g" "${ROOT}/k8s/deployments.yaml" | kubectl apply -f -
kubectl apply -f "${ROOT}/k8s/hpa.yaml"

echo "=== 3/5 Clean stale pods (wrong image tags / duplicate replicas) ==="
kubectl delete pod -n nexushr \
  $(kubectl get pods -n nexushr --no-headers 2>/dev/null \
    | awk '$3 ~ /^(ErrImagePull|ImagePullBackOff|Error)$/ {print $1}') \
  --ignore-not-found 2>/dev/null || true

for d in auth-service employee-service api-gateway notification-service frontend; do
  kubectl scale deployment/"${d}" --replicas=1 -n nexushr
done

echo "=== 4/5 Wait for backend health ==="
kubectl rollout status deployment/auth-service -n nexushr --timeout=360s || true
kubectl rollout status deployment/employee-service -n nexushr --timeout=360s || true
kubectl rollout status deployment/notification-service -n nexushr --timeout=360s || true
kubectl rollout status deployment/api-gateway -n nexushr --timeout=360s || true

GATEWAY_HOST="$(kubectl get svc api-gateway -n nexushr -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')"
GATEWAY_URL="http://${GATEWAY_HOST}"
FRONTEND_HOST="$(kubectl get svc frontend -n nexushr -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')"
FRONTEND_URL="http://${FRONTEND_HOST}"

echo "Gateway:  ${GATEWAY_URL}"
echo "Frontend: ${FRONTEND_URL}"

echo "=== 5/5 Rebuild + push frontend (API URLs → gateway) ==="
ecr_login
frontend_uri="${registry}/${ECR_PREFIX}-frontend:${IMAGE_TAG}"
docker build -f "${ROOT}/frontend/Dockerfile" \
  --build-arg "VITE_AUTH_API_URL=${GATEWAY_URL}" \
  --build-arg "VITE_EMPLOYEE_API_URL=${GATEWAY_URL}" \
  --build-arg "VITE_ATTENDANCE_API_URL=${GATEWAY_URL}" \
  --build-arg "VITE_LEAVE_API_URL=${GATEWAY_URL}" \
  --build-arg "VITE_PAYROLL_API_URL=${GATEWAY_URL}" \
  --build-arg "VITE_PERFORMANCE_API_URL=${GATEWAY_URL}" \
  --build-arg "VITE_NOTIFICATION_API_URL=${GATEWAY_URL}" \
  --build-arg "VITE_AI_INSIGHTS_API_URL=${GATEWAY_URL}" \
  -t "${frontend_uri}" \
  "${ROOT}/frontend"
docker push "${frontend_uri}"

kubectl set image deployment/frontend \
  frontend="${frontend_uri}" -n nexushr
kubectl rollout restart deployment/api-gateway -n nexushr
kubectl rollout status deployment/frontend -n nexushr --timeout=180s
kubectl rollout status deployment/api-gateway -n nexushr --timeout=180s

echo ""
echo "Done. Verify:"
echo "  curl -s ${GATEWAY_URL}/actuator/health"
echo "  curl -s ${GATEWAY_URL}/api/v1/auth/health"
echo ""
echo "Open frontend: ${FRONTEND_URL}"
echo "Demo login:    hr@nexushr.com / NexusHR@2026"
