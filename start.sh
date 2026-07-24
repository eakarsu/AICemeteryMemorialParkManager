#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$ROOT/.env" ] || { echo 'Missing .env; copy .env.example and configure it.' >&2; exit 1; }
[ -d "$ROOT/server/node_modules" ] && [ -d "$ROOT/client/node_modules" ] || { echo 'Dependencies absent; run scripts/bootstrap.sh.' >&2; exit 1; }
set -a; . "$ROOT/.env"; set +a
node --env-file="$ROOT/.env" "$ROOT/server/scripts/prepare-runtime.js"
(cd "$ROOT/server" && npm start) & BACKEND_PID=$!
(cd "$ROOT/client" && BROWSER=none PORT="${FRONTEND_PORT:-3000}" REACT_APP_API_URL="http://127.0.0.1:${BACKEND_PORT:-3001}/api" npm start) & FRONTEND_PID=$!
cleanup(){ kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true; wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
wait "$BACKEND_PID" "$FRONTEND_PID"
