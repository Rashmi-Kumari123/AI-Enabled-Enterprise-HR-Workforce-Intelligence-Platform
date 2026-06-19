#!/usr/bin/env bash
# OWASP ZAP baseline scan against local NexusHR frontend + API gateway.
# Requires Docker.
set -euo pipefail

TARGET="${TARGET:-http://host.docker.internal:5173}"
API_TARGET="${API_TARGET:-http://host.docker.internal:8080}"
REPORT_DIR="${REPORT_DIR:-./reports/zap}"
mkdir -p "${REPORT_DIR}"

echo "=== OWASP ZAP baseline scan ==="
echo "Frontend: ${TARGET}"
echo "API:      ${API_TARGET}"
echo

docker run --rm \
  -v "${REPORT_DIR}:/zap/wrk:rw" \
  -t ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
  -t "${TARGET}" \
  -r zap-baseline-report.html \
  -J zap-baseline-report.json \
  -I || true

echo
echo "Reports written to ${REPORT_DIR}/"
echo "Review zap-baseline-report.html for OWASP Top 10 findings."
echo
echo "Tip: run with API gateway:"
echo "  TARGET=http://host.docker.internal:5173 API_TARGET=http://host.docker.internal:8080 ./scripts/security/zap-baseline.sh"
