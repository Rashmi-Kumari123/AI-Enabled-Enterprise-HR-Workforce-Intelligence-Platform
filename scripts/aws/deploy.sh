#!/usr/bin/env bash
# NexusHR — deploy to AWS (ECR + EKS) via CLI.
#
# Prerequisites:
#   aws configure          # one-time; never commit keys
#   docker                 # for image build
#   kubectl, eksctl        # for EKS
#
# Usage:
#   ./scripts/aws/deploy.sh ecr          # create ECR repos
#   ./scripts/aws/deploy.sh push         # build & push images
#   ./scripts/aws/deploy.sh cluster      # create EKS cluster (slow, costs $)
#   ./scripts/aws/deploy.sh k8s          # apply k8s manifests + ECR images
#   ./scripts/aws/deploy.sh all          # ecr → push → k8s (cluster must exist)
#
# Environment (optional):
#   AWS_REGION=ap-south-1
#   EKS_CLUSTER_NAME=nexushr-prod
#   IMAGE_TAG=latest

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

step="${1:-help}"

case "${step}" in
  ecr)
    exec "${SCRIPT_DIR}/setup-ecr.sh"
    ;;
  push)
    exec "${SCRIPT_DIR}/push-images.sh"
    ;;
  cluster)
    exec "${SCRIPT_DIR}/create-cluster.sh"
    ;;
  k8s)
    exec "${SCRIPT_DIR}/deploy-k8s.sh"
    ;;
  all)
    "${SCRIPT_DIR}/setup-ecr.sh"
    "${SCRIPT_DIR}/push-images.sh"
    "${SCRIPT_DIR}/deploy-k8s.sh"
    ;;
  help|*)
    sed -n '2,20p' "$0"
    ;;
esac
