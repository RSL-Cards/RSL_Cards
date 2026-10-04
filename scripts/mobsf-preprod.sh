#!/usr/bin/env bash
# Pre-production mobile security gate for dealer-app (MobSF / mobsfscan).
# Usage:
#   bash scripts/mobsf-preprod.sh              # source SAST via mobsfscan
#   bash scripts/mobsf-preprod.sh --ui         # also start MobSF web UI on :8000
#   bash scripts/mobsf-preprod.sh --ipa PATH   # upload IPA to running MobSF (needs MOBSF_API_KEY)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/apps/dealer-app"
OUT="$ROOT/reports/mobsf"
IMAGE_SCAN="opensecurity/mobsfscan:latest"
IMAGE_UI="opensecurity/mobile-security-framework-mobsf:latest"
MOBSF_URL="${MOBSF_URL:-http://127.0.0.1:8000}"
MOBSF_USER="${MOBSF_USER:-mobsf}"
MOBSF_PASS="${MOBSF_PASS:-mobsf}"

mkdir -p "$OUT"

START_UI=0
IPA_PATH=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --ui) START_UI=1; shift ;;
    --ipa) IPA_PATH="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,8p' "$0"
      exit 0
      ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

echo "==> Pulling mobsfscan image (if needed)"
docker pull "$IMAGE_SCAN" >/dev/null

echo "==> Running mobsfscan SAST on apps/dealer-app/{app,src}"
docker run --rm \
  -v "$APP/app:/app:ro" \
  -v "$APP/src:/src:ro" \
  -v "$OUT:/out" \
  "$IMAGE_SCAN" \
  --json --no-fail -o /out/mobsfscan-dealer-app.json \
  /app /src

REPORT="$OUT/mobsfscan-dealer-app.json"
if [[ -f "$REPORT" ]]; then
  python3 - <<'PY' "$REPORT" "$OUT/mobsfscan-summary.txt"
import json, sys
from pathlib import Path
data = json.loads(Path(sys.argv[1]).read_text() or "{}")
results = data.get("results") or {}
lines = [
    f"mobsfscan version: {data.get('mobsfscan_version')}",
    f"errors: {data.get('errors')}",
    f"finding groups: {len(results)}",
]
for rule, payload in results.items():
    lines.append(f"- {rule}: {payload}")
Path(sys.argv[2]).write_text("\n".join(lines) + "\n")
print("\n".join(lines))
PY
  echo "==> Report: $REPORT"
else
  echo "WARN: no JSON report written" >&2
fi

if [[ "$START_UI" -eq 1 ]]; then
  if ! docker ps --format '{{.Names}}' | grep -q '^rsl-mobsf$'; then
    echo "==> Starting MobSF UI on $MOBSF_URL (container rsl-mobsf)"
    docker pull "$IMAGE_UI" >/dev/null
    docker rm -f rsl-mobsf >/dev/null 2>&1 || true
    docker run -d --name rsl-mobsf -p 8000:8000 "$IMAGE_UI" >/dev/null
    echo "    Login: $MOBSF_USER / $MOBSF_PASS"
    for i in $(seq 1 60); do
      code=$(curl -s -o /dev/null -w "%{http_code}" "$MOBSF_URL/" || true)
      if [[ "$code" != "000" ]]; then
        echo "    MobSF is up: $MOBSF_URL (HTTP $code)"
        break
      fi
      sleep 2
    done
  else
    echo "==> MobSF UI already running (rsl-mobsf) → $MOBSF_URL"
  fi
fi

if [[ -n "$IPA_PATH" ]]; then
  if [[ ! -f "$IPA_PATH" ]]; then
    echo "ERROR: IPA not found: $IPA_PATH" >&2
    exit 1
  fi
  if [[ -z "${MOBSF_API_KEY:-}" ]]; then
    echo "ERROR: set MOBSF_API_KEY from MobSF UI (docker logs rsl-mobsf | rg 'REST API Key')." >&2
    echo "       Or upload manually at $MOBSF_URL" >&2
    exit 1
  fi
  echo "==> Uploading IPA to MobSF API: $IPA_PATH"
  curl -s -F "file=@${IPA_PATH}" \
    -H "Authorization: ${MOBSF_API_KEY}" \
    "$MOBSF_URL/api/v1/upload" | tee "$OUT/mobsf-upload.json"
  echo
  HASH=$(python3 -c "import json;print(json.load(open('$OUT/mobsf-upload.json')).get('hash',''))")
  if [[ -n "$HASH" ]]; then
    curl -s -X POST -H "Authorization: ${MOBSF_API_KEY}" \
      --data "hash=${HASH}" \
      "$MOBSF_URL/api/v1/scan" | tee "$OUT/mobsf-scan-ipa.json"
    echo
    curl -s -H "Authorization: ${MOBSF_API_KEY}" \
      --data "hash=${HASH}" \
      "$MOBSF_URL/api/v1/report_json" > "$OUT/mobsf-ipa-report.json" || true
    echo "==> IPA report: $OUT/mobsf-ipa-report.json"
  fi
fi

echo
echo "Done. Review $OUT before App Store submit."
echo "Binary IPA scan still required after: eas build --platform ios --profile production"
exit 0
