#!/bin/zsh
# Publish the latest hardware resume as the site's CV, then have Claude
# update the page text to match whatever changed in the resume.
# Usage: ./update-cv.sh   (run from anywhere)
set -e
SRC="$HOME/Documents/Internships/Resumes/Hardware/Greenberg_Benjamin_Resume.pdf"
SITE="${0:A:h}"
DEST="$SITE/cv/Benjamin_Greenberg_CV.pdf"
LAST="$SITE/.git/resume-last-synced.txt"   # inside .git, so never published

[[ -f "$SRC" ]] || { echo "No resume at $SRC"; exit 1; }

# Refuse to publish a phone number
if pdftotext "$SRC" - | grep -qE '[0-9]{3}[-. )]+[0-9]{3}[-. ]+[0-9]{4}'; then
  echo "The resume contains what looks like a phone number. Remove it and rerun."; exit 1
fi

cd "$SITE"
git pull -q --rebase origin main

# 1. Publish the PDF, titled for the browser tab
python3 - "$SRC" "$DEST" <<'PY'
import sys, pypdf
r = pypdf.PdfReader(sys.argv[1]); w = pypdf.PdfWriter(clone_from=r)
w.add_metadata({"/Title": "Benjamin Greenberg Resume", "/Author": "Benjamin Greenberg"})
with open(sys.argv[2], "wb") as f: w.write(f)
PY
if git diff --quiet -- cv/; then
  echo "CV PDF already up to date."
else
  git add cv/Benjamin_Greenberg_CV.pdf
  git commit -qm "Update CV"
  git push -q origin main
  echo "CV pushed."
fi

# 2. Sync the page text with what changed in the resume
NEW="$(mktemp)"; pdftotext -layout "$SRC" "$NEW"
if [[ -f "$LAST" ]] && cmp -s "$NEW" "$LAST"; then
  echo "Resume text unchanged since last sync; page left as is."; rm -f "$NEW"; exit 0
fi

CLAUDE="$(command -v claude || true)"
[[ -z "$CLAUDE" && -x "$HOME/.local/bin/claude" ]] && CLAUDE="$HOME/.local/bin/claude"
[[ -z "$CLAUDE" && -x "$HOME/.claude/local/claude" ]] && CLAUDE="$HOME/.claude/local/claude"
if [[ -z "$CLAUDE" ]]; then
  echo "Claude Code CLI not installed, so the page text was not synced. Ask Claude to sync the site to the resume."
  rm -f "$NEW"; exit 0
fi

DIFF="$( [[ -f "$LAST" ]] && diff "$LAST" "$NEW" || echo '(no previous copy; compare the whole resume to the page)' )"
echo "Syncing page text with the resume..."
ECC_GATEGUARD=off "$CLAUDE" -p --permission-mode acceptEdits \
  --allowedTools "Read" "Edit" "Bash(git diff:*)" "Bash(git add index.html)" "Bash(git commit:*)" "Bash(git push:*)" <<PROMPT
You maintain Benjamin Greenberg's portfolio site in this folder (index.html). His resume was just updated.
Update index.html so its text matches the resume. Rules:
- Only change wording, numbers, dates, and facts that the resume changed. Keep the page's structure, styling, links, photos, and sections.
- Never add claims, numbers, or achievements that aren't in the resume.
- Keep things Ben added on purpose even if the resume lacks them or words them differently: "Professor Towles' Biomechanics Lab", the HINT-Blimp and vaccination paper entries, Google Scholar, the F1TENTH link.
- PINNED, never change or remove these, whatever the resume says: the Clubs entry "180 Degrees Consulting, Consultant" (spelled exactly that way) and the "Linear Algebra" coursework chip. Anything marked with an HTML comment "pinned: keep on resume sync" is also off limits.
- MakerWorld stays off the site. No phone number. No em dashes.
- If nothing on the page needs to change, change nothing.
When done, if index.html changed: git add index.html, commit with a short message (no co-author trailer), and git push.
Finish with a one-line summary of what you changed.

Changes in the resume text (diff old -> new):
$DIFF

Full new resume text:
$(cat "$NEW")
PROMPT

cp "$NEW" "$LAST"; rm -f "$NEW"
echo "Done. https://bengreenberg07.github.io updates in about a minute."
