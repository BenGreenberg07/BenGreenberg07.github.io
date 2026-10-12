#!/bin/zsh
# Publish the latest hardware resume as the site's CV.
# Usage: ./update-cv.sh   (run from anywhere)
set -e
SRC="$HOME/Documents/Internships/Resumes/Hardware/Greenberg_Benjamin_Resume.pdf"
SITE="${0:A:h}"
DEST="$SITE/cv/Benjamin_Greenberg_CV.pdf"

[[ -f "$SRC" ]] || { echo "No resume at $SRC"; exit 1; }

# Refuse to publish a phone number
if pdftotext "$SRC" - | grep -qE '[0-9]{3}[-. )]+[0-9]{3}[-. ]+[0-9]{4}'; then
  echo "The resume contains what looks like a phone number. Remove it and rerun."; exit 1
fi

# Copy and set the title shown in the browser tab
python3 - "$SRC" "$DEST" <<'PY'
import sys, pypdf
r = pypdf.PdfReader(sys.argv[1]); w = pypdf.PdfWriter(clone_from=r)
w.add_metadata({"/Title": "Benjamin Greenberg Resume", "/Author": "Benjamin Greenberg"})
with open(sys.argv[2], "wb") as f: w.write(f)
PY

cd "$SITE"
if git diff --quiet -- cv/; then echo "CV already up to date."; exit 0; fi
git add cv/Benjamin_Greenberg_CV.pdf
git commit -qm "Update CV"
git push -q origin main
echo "Pushed. Live at https://bengreenberg07.github.io/cv/Benjamin_Greenberg_CV.pdf in about a minute."
