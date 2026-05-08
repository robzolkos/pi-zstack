#!/usr/bin/env bash
set -euo pipefail

REPO_REF="${PI_ZSTACK_REF:-main}"
PACKAGES_URL="${PI_ZSTACK_PACKAGES_URL:-https://api.github.com/repos/robzolkos/pi-zstack/contents/packages.txt?ref=$REPO_REF}"

if ! command -v pi >/dev/null 2>&1; then
  echo "Error: pi is not installed or not on PATH" >&2
  exit 1
fi

if command -v curl >/dev/null 2>&1; then
  fetch() { curl -fsSL -H "Accept: application/vnd.github.raw" "$1"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget -qO- "$1"; }
else
  echo "Error: curl or wget is required" >&2
  exit 1
fi

echo "Installing pi-zstack packages..."

fetch "$PACKAGES_URL" | while IFS= read -r line || [[ -n "$line" ]]; do
  # Trim leading/trailing whitespace.
  pkg="${line#"${line%%[![:space:]]*}"}"
  pkg="${pkg%"${pkg##*[![:space:]]}"}"

  # Skip blanks and comments.
  [[ -z "$pkg" || "${pkg:0:1}" == "#" ]] && continue

  printf "  • %s... " "$pkg"

  if output="$(NPM_CONFIG_FUND=false NPM_CONFIG_AUDIT=false pi install "$pkg" 2>&1)"; then
    echo "done"
  else
    echo "failed"
    echo
    echo "$output"
    exit 1
  fi
done

echo "Done."
