#!/usr/bin/env bash
set -euo pipefail

PORTS=(3001 3002 3003 3004 3005 3006 3007 3008 3009 3010)
NAMES=("auth-service" "user-service" "inventory-service" "transaction-service" "listing-service" "card-db-service" "ai-narrative-service" "notification-service" "analytics-service" "admin-service")

deadline=$((SECONDS + 60))
all_ok=1

while [ $SECONDS -lt $deadline ]; do
  ok=0
  for i in "${!PORTS[@]}"; do
    p="${PORTS[$i]}"
    if curl -sf "http://localhost:${p}/health" >/dev/null 2>&1; then
      ok=$((ok + 1))
    fi
  done
  if [ "$ok" -eq 10 ]; then
    all_ok=0
    break
  fi
  sleep 2
done

printf "%-26s %s\n" "SERVICE" "RESULT"
healthy=0
for i in "${!PORTS[@]}"; do
  name="${NAMES[$i]}"
  p="${PORTS[$i]}"
  if out=$(curl -sf "http://localhost:${p}/health" 2>/dev/null); then
    printf "%-26s %s\n" "$name" "PASS"
    healthy=$((healthy + 1))
  else
    printf "%-26s %s\n" "$name" "FAIL"
  fi
done

echo "$healthy/10 services healthy"
if [ "$healthy" -eq 10 ]; then
  exit 0
fi
exit 1
