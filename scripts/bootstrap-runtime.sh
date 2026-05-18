#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ "$#" -gt 0 ]]; then
  exec "$ROOT_DIR/scripts/env.sh" "$@"
fi

exec "$ROOT_DIR/scripts/env.sh" node "$ROOT_DIR/scripts/env-doctor.mjs"
