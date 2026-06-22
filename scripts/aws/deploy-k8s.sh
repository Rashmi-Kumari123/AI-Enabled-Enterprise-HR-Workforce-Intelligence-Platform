#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

verify_aws_credentials

if ! command -v kubectl >/dev/null 2>&1; then
  echo "ERROR: kubectl not found." >&2
  exit 1
fi

if ! aws eks describe-cluster --name "${EKS_CLUSTER_NAME}" --region "${AWS_REGION}" >/dev/null 2>&1; then
  echo "ERROR: EKS cluster '${EKS_CLUSTER_NAME}' not found. Run: ./scripts/aws/create-cluster.sh" >&2
  exit 1
fi

aws eks update-kubeconfig --name "${EKS_CLUSTER_NAME}" --region "${AWS_REGION}"

if [[ ! -f "${ROOT}/k8s/secrets.yaml" ]]; then
  echo "ERROR: k8s/secrets.yaml not found."
  echo "Copy and fill: cp k8s/secrets.example.yaml k8s/secrets.yaml"
  exit 1
fi

registry="$(ecr_registry)"
render_deployments() {
  sed "s|nexushr/|${registry}/${ECR_PREFIX}-|g" "${ROOT}/k8s/deployments.yaml"
}

echo "Applying Kubernetes manifests..."
kubectl apply -f "${ROOT}/k8s/namespace.yaml"
kubectl apply -f "${ROOT}/k8s/configmap.yaml"
kubectl apply -f "${ROOT}/k8s/secrets.yaml"
kubectl apply -f "${ROOT}/k8s/infrastructure.yaml"
echo "Waiting for Postgres + Redis..."
kubectl wait --for=condition=available deployment/postgres -n nexushr --timeout=300s 2>/dev/null || true
kubectl wait --for=condition=available deployment/redis -n nexushr --timeout=120s 2>/dev/null || true

render_deployments | kubectl apply -f -
kubectl apply -f "${ROOT}/k8s/hpa.yaml"
kubectl apply -f "${ROOT}/k8s/ingress.yaml"

echo "Waiting for api-gateway rollout..."
kubectl rollout status deployment/api-gateway -n nexushr --timeout=300s || true

echo ""
echo "Deployments applied. Check status:"
echo "  kubectl get pods -n nexushr"
echo "  kubectl get svc -n nexushr"
echo ""
GATEWAY_URL="$(kubectl get svc api-gateway -n nexushr -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)"
if [[ -n "${GATEWAY_URL}" ]]; then
  echo "API Gateway: http://${GATEWAY_URL}"
  echo "Health:      curl -s http://${GATEWAY_URL}/actuator/health"
fi
