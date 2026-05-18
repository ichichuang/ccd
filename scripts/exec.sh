#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ "$#" -eq 0 ]]; then
  echo "Usage: scripts/exec.sh <command> [args...]" >&2
  exit 64
fi

exec "$ROOT_DIR/scripts/env.sh" "$@"
