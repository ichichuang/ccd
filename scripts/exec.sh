#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ "$#" -eq 0 ]]; then
  echo "Usage: scripts/exec.sh <command> [args...]" >&2
  exit 64
fi

COMMAND_LABEL="${CCD_EXEC_LABEL:-$*}"
COMMAND_CONTEXT="${CCD_EXEC_CONTEXT:-command}"
COMMAND_HINT="${CCD_EXEC_HINT:-}"

set +e
"$ROOT_DIR/scripts/env.sh" "$@"
STATUS="$?"
set -e

if [[ "$STATUS" -ne 0 ]]; then
  {
    echo
    echo "[FAIL] ${COMMAND_CONTEXT}: ${COMMAND_LABEL}"
    echo "[FAIL] exit code: ${STATUS}"
    if [[ -n "$COMMAND_HINT" ]]; then
      echo "[NEXT] ${COMMAND_HINT}"
    fi
  } >&2
fi

exit "$STATUS"
