#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REQUIRE_MISE="${CCD_RUNTIME_REQUIRE_MISE:-0}"

unset -f node 2>/dev/null || true
unset -f pnpm 2>/dev/null || true

if command -v mise >/dev/null 2>&1; then
  eval "$(MISE_OVERRIDE_TOOL_VERSIONS_FILENAMES=none command mise activate bash)"
elif [[ "$REQUIRE_MISE" == "1" ]]; then
  echo "[FAIL] mise is required but not available on PATH" >&2
  exit 1
fi

if command -v node >/dev/null 2>&1 && command -v corepack >/dev/null 2>&1; then
  command corepack enable >/dev/null 2>&1 || true
fi

if ! command -v pnpm >/dev/null 2>&1 && command -v corepack >/dev/null 2>&1; then
  export PATH="$ROOT_DIR/node_modules/.bin:$PATH"
fi

hash -r 2>/dev/null || true

if ! command -v node >/dev/null 2>&1; then
  echo "[FAIL] node binary not found" >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "[FAIL] pnpm binary not found" >&2
  exit 1
fi

if [[ "$#" -gt 0 ]]; then
  exec "$@"
fi

echo "[OK] node: $(command node -v) ($(command -v node))"
echo "[OK] pnpm: $(command pnpm -v) ($(command -v pnpm))"
