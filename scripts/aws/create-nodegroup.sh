#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

verify_aws_credentials

NODE_TYPE="${EKS_NODE_TYPE:-t3.small}"
NODEGROUP_NAME="${EKS_NODEGROUP_NAME:-standard}"

if ! aws eks describe-cluster --name "${EKS_CLUSTER_NAME}" --region "${AWS_REGION}" >/dev/null 2>&1; then
  echo "ERROR: Cluster '${EKS_CLUSTER_NAME}' not found. Run ./scripts/aws/create-cluster.sh first." >&2
  exit 1
fi

if aws eks describe-nodegroup --cluster-name "${EKS_CLUSTER_NAME}" --nodegroup-name "${NODEGROUP_NAME}" --region "${AWS_REGION}" >/dev/null 2>&1; then
  STATUS=$(aws eks describe-nodegroup --cluster-name "${EKS_CLUSTER_NAME}" --nodegroup-name "${NODEGROUP_NAME}" --region "${AWS_REGION}" --query 'nodegroup.status' --output text)
  echo "Node group '${NODEGROUP_NAME}' already exists (status: ${STATUS})."
  exit 0
fi

echo "Creating node group '${NODEGROUP_NAME}' (${NODE_TYPE}) on cluster '${EKS_CLUSTER_NAME}'..."
eksctl create nodegroup \
  --cluster "${EKS_CLUSTER_NAME}" \
  --region "${AWS_REGION}" \
  --name "${NODEGROUP_NAME}" \
  --node-type "${NODE_TYPE}" \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed

aws eks update-kubeconfig --name "${EKS_CLUSTER_NAME}" --region "${AWS_REGION}"
echo "Node group ready. Check: kubectl get nodes"
