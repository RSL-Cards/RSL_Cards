#!/usr/bin/env bash
set -euo pipefail

PORT=8080
NAME="unified-backend-service"

deadline=$((SECONDS + 60))
all_ok=1

echo "Waiting for $NAME on port $PORT to start..."

while [ $SECONDS -lt $deadline ]; do
  if curl -sf "http://localhost:${PORT}/health" >/dev/null 2>&1; then
    all_ok=0
    break
  fi
  sleep 2
done

printf "%-26s %s\n" "SERVICE" "RESULT"
if [ "$all_ok" -eq 0 ]; then
  printf "%-26s %s\n" "$NAME" "PASS"
  
  # Also verify Nginx gateway routing
  if curl -sf "http://localhost:80/health" >/dev/null 2>&1; then
    printf "%-26s %s\n" "nginx-gateway" "PASS"
    echo "Consolidated backend monorepo is fully HEALTHY and proxying perfectly!"
    exit 0
  else
    printf "%-26s %s\n" "nginx-gateway" "FAIL"
    echo "Backend is healthy but Nginx gateway failed to route traffic."
    exit 1
  fi
else
  printf "%-26s %s\n" "$NAME" "FAIL"
  echo "Backend failed to become healthy within 60 seconds."
  exit 1
fi
