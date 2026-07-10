#!/usr/bin/env bash
# Garante o stack de desenvolvimento (panel + assets + valheim) rodando com hot-reload.
# Idempotente — seguro chamar no boot ou via systemd.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

FILES=(-f docker-compose.yml -f docker-compose.dev.yml)

echo "==> Vikinger Panel — modo dev (auto-reload)"
docker compose "${FILES[@]}" up -d --build panel assets valheim

PORT="${PANEL_PORT:-8080}"
if [[ -f .env ]]; then
  val="$(grep -E '^PANEL_PORT=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'")"
  [[ -n "$val" ]] && PORT="$val"
fi

# Aguarda HTTP responder
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo ""
echo "Dev stack ativo:"
echo "  Painel:   http://localhost:${PORT}"
echo "  Backend:  uvicorn --reload (panel/*.py)"
echo "  Frontend: npm run watch (panel/frontend/** -> F5)"
echo ""
docker compose "${FILES[@]}" ps panel assets valheim
