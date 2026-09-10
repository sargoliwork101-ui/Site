#!/usr/bin/env bash
# Rebuild site-upload.zip from a fresh `npm run build`.
# Usage: ./build-upload-zip.sh   (run from the repo root)
#
# IMPORTANT: the old archive is DELETED first. Never `zip` over an existing
# archive — hashed asset filenames (index-*.js, ...) change every build and
# `zip -r` never removes stale entries, so the file would grow forever.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/resume-app"

if [ ! -f dist/index.html ]; then
  echo "dist/ missing — run 'npm run build' first." >&2
  exit 1
fi

STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT

cp -r dist/. "$STAGE"/
cp -r public/api "$STAGE"/api
cp public/.htaccess "$STAGE"/.htaccess

rm -f "$ROOT/site-upload.zip"
cd "$STAGE"
# Exclude legacy .woff (all modern browsers use .woff2; the CSS references
# woff2 first and falls back gracefully where woff is missing).
zip -qr "$ROOT/site-upload.zip" . -x "*.DS_Store" "*.woff"

echo "OK: $(du -h "$ROOT/site-upload.zip" | cut -f1)  $(unzip -l "$ROOT/site-upload.zip" | tail -1)"
