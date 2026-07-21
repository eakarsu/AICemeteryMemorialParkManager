#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$ROOT/.env" ] || cp "$ROOT/.env.example" "$ROOT/.env"
(cd "$ROOT/server" && npm ci)
(cd "$ROOT/client" && npm ci)
echo 'Dependencies installed. Configure .env, then run scripts/migrate.sh.'
