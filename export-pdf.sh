#!/bin/zsh
# Render the portfolio site to a letter-size PDF for applications.
# Usage: ./export-pdf.sh [output.pdf]
set -e
SITE="${0:A:h}"
OUT="${1:-$HOME/Documents/Internships/Greenberg_Benjamin_Portfolio_Site.pdf}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT=8899

python3 -m http.server $PORT --bind 127.0.0.1 --directory "$SITE" >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
until curl -s -o /dev/null "http://127.0.0.1:$PORT/"; do sleep 0.2; done

TMP="$(mktemp -d)"
"$CHROME" --headless=new --disable-gpu --no-first-run --user-data-dir="$TMP" \
  --no-pdf-header-footer --virtual-time-budget=15000 --run-all-compositor-stages-before-draw \
  --print-to-pdf="$OUT" "http://127.0.0.1:$PORT/?print" 2>/dev/null
rm -rf "$TMP"

python3 - "$OUT" <<'PY'
import sys, pypdf
r = pypdf.PdfReader(sys.argv[1]); w = pypdf.PdfWriter(clone_from=r)
w.add_metadata({"/Title": "Benjamin Greenberg Portfolio", "/Author": "Benjamin Greenberg"})
with open(sys.argv[1], "wb") as f: w.write(f)
print(f"Saved {sys.argv[1]} ({len(r.pages)} pages)")
PY
