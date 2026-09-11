# ═══════════════════════════════════════════════════════════════════
# build-upload-zip.sh — ساخت فایل آماده آپلود (site-upload.zip)
# طرز کار: از روی خروجی تازه dist + پوشه api + htaccess، یه زیپ تمیز می‌سازه؛
# زیپ قبلی رو اول پاک می‌کنه (وگرنه فایل‌های قدیمی بیلد توش می‌مونن) و هرگز
# دیتای ران‌تایم (رمزها، سشن‌ها، بک‌آپ‌ها) رو داخل زیپ نمی‌ذاره.
# استفاده (از ریشه ریپو):  npm run build (داخل resume-app) بعد ./build-upload-zip.sh
# ═══════════════════════════════════════════════════════════════════
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
# dist/ already contains api/ (Vite copies public/*) — remove it first, or
# `cp -r public/api $STAGE/api` nests INTO it and ships a shadow api/api tree
# (whose auth.php would even run setup against its own empty data dir!).
rm -rf "$STAGE"/api
cp -r public/api "$STAGE"/api
cp public/.htaccess "$STAGE"/.htaccess
# Runtime data must NEVER ship (dev leftovers, if any): secrets, sessions,
# server backups and uploaded attachments stay on their own host.
rm -f "$STAGE"/api/data/*.json "$STAGE"/api/data/backups/*.json
rm -rf "$STAGE"/api/data/sessions
find "$STAGE/uploads" -type f ! -name '.htaccess' ! -name 'index.php' -delete

rm -f "$ROOT/site-upload.zip"
cd "$STAGE"
# Exclude legacy .woff (all modern browsers use .woff2; the CSS references
# woff2 first and falls back gracefully where woff is missing).
zip -qr "$ROOT/site-upload.zip" . -x "*.DS_Store" "*.woff"

echo "OK: $(du -h "$ROOT/site-upload.zip" | cut -f1)  $(unzip -l "$ROOT/site-upload.zip" | tail -1)"
