#!/usr/bin/env bash
# Simple load test against API gateway health + auth login.
# Requires: curl, optional hey (https://github.com/rakyll/hey)
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
EMAIL="${EMAIL:-hr@nexushr.com}"
PASSWORD="${PASSWORD:-NexusHR@2026}"
REQUESTS="${REQUESTS:-200}"
CONCURRENCY="${CONCURRENCY:-20}"

echo "=== NexusHR load test ==="
echo "Target: ${BASE_URL}"
echo "Requests: ${REQUESTS}, Concurrency: ${CONCURRENCY}"
echo

echo "1) Gateway health"
curl -sf "${BASE_URL}/actuator/health" | head -c 200
echo -e "\n"

echo "2) Auth health (via gateway route — direct service if gateway not routing actuator)"
curl -sf "http://localhost:8081/api/v1/auth/health" 2>/dev/null || echo "(auth direct skipped)"
echo

if command -v hey >/dev/null 2>&1; then
  echo "3) hey — GET actuator/health"
  hey -n "${REQUESTS}" -c "${CONCURRENCY}" "${BASE_URL}/actuator/health"

  echo "4) hey — POST login"
  hey -n "$((REQUESTS / 4))" -c "${CONCURRENCY}" -m POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" \
    "http://localhost:8081/api/v1/auth/login"
else
  echo "3) curl loop — ${REQUESTS} health checks (hey not installed)"
  ok=0
  for i in $(seq 1 "${REQUESTS}"); do
    if curl -sf -o /dev/null "${BASE_URL}/actuator/health"; then
      ok=$((ok + 1))
    fi
  done
  echo "Success: ${ok}/${REQUESTS}"
fi

echo
echo "Done. For full k6 scripts, see: https://k6.io/docs/"
