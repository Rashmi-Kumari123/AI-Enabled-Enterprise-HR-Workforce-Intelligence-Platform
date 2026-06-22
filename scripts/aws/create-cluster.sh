#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

verify_aws_credentials

if ! command -v eksctl >/dev/null 2>&1; then
  echo "ERROR: eksctl not found. Install: https://eksctl.io/installation/" >&2
  exit 1
fi

if aws eks describe-cluster --name "${EKS_CLUSTER_NAME}" --region "${AWS_REGION}" >/dev/null 2>&1; then
  echo "EKS cluster '${EKS_CLUSTER_NAME}' already exists in ${AWS_REGION}."
  aws eks update-kubeconfig --name "${EKS_CLUSTER_NAME}" --region "${AWS_REGION}"
  exit 0
fi

echo "Creating EKS cluster '${EKS_CLUSTER_NAME}' in ${AWS_REGION}..."
echo "This takes ~15–20 minutes and incurs AWS charges (control plane + nodes)."
echo ""

eksctl create cluster \
  --name "${EKS_CLUSTER_NAME}" \
  --region "${AWS_REGION}" \
  --version 1.31 \
  --nodegroup-name standard \
  --node-type "${EKS_NODE_TYPE:-t3.small}" \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed

aws eks update-kubeconfig --name "${EKS_CLUSTER_NAME}" --region "${AWS_REGION}"

echo ""
echo "Installing metrics-server (required for HPA)..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

echo ""
echo "Cluster ready. Next: ./scripts/aws/deploy-k8s.sh"
