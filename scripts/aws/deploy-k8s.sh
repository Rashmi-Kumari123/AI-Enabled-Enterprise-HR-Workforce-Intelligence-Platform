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

echo "Applying Kubernetes manifests..."
kubectl apply -f "${ROOT}/k8s/namespace.yaml"
kubectl apply -f "${ROOT}/k8s/configmap.yaml"
kubectl apply -f "${ROOT}/k8s/secrets.yaml"
kubectl apply -f "${ROOT}/k8s/deployments.yaml"
kubectl apply -f "${ROOT}/k8s/hpa.yaml"
kubectl apply -f "${ROOT}/k8s/ingress.yaml"

echo "Updating deployment images to ECR..."
registry="$(ecr_registry)"

kubectl set image deployment/auth-service \
  auth-service="${registry}/${ECR_PREFIX}-auth-service:${IMAGE_TAG}" \
  -n nexushr
kubectl set image deployment/employee-service \
  employee-service="${registry}/${ECR_PREFIX}-employee-service:${IMAGE_TAG}" \
  -n nexushr
kubectl set image deployment/api-gateway \
  api-gateway="${registry}/${ECR_PREFIX}-api-gateway:${IMAGE_TAG}" \
  -n nexushr
kubectl set image deployment/notification-service \
  notification-service="${registry}/${ECR_PREFIX}-notification-service:${IMAGE_TAG}" \
  -n nexushr
kubectl set image deployment/frontend \
  frontend="${registry}/${ECR_PREFIX}-frontend:${IMAGE_TAG}" \
  -n nexushr

echo "Waiting for api-gateway rollout..."
kubectl rollout status deployment/api-gateway -n nexushr --timeout=300s

echo ""
echo "Deployments applied. Check status:"
echo "  kubectl get pods -n nexushr"
echo "  kubectl get svc -n nexushr"
echo ""
echo "Get load balancer URL:"
echo "  kubectl get svc api-gateway -n nexushr"
