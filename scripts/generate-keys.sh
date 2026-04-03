#!/usr/bin/env bash
set -euo pipefail
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

openssl genrsa -out "$TMPDIR/private.pem" 2048 2>/dev/null
openssl rsa -in "$TMPDIR/private.pem" -pubout -out "$TMPDIR/public.pem" 2>/dev/null

echo "=== JWT_PRIVATE_KEY (single line for .env: replace newlines with \\n or use multiline) ==="
awk 'NR>1{print prev ORS} {prev=$0} END{printf "%s", prev}' "$TMPDIR/private.pem" | sed 's/$/\\n/' | tr -d '\n' || true
echo ""
echo ""
echo "=== Or paste multiline JWT_PRIVATE_KEY ==="
cat "$TMPDIR/private.pem"
echo ""
echo "=== JWT_PUBLIC_KEY ==="
cat "$TMPDIR/public.pem"
echo ""
echo "For .env.development, paste the PEM blocks as single lines with \\n escapes, or use a secrets file."
