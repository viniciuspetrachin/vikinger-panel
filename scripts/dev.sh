#!/usr/bin/env bash
# Sobe o Vikinger Panel em modo DESENVOLVIMENTO com hot-reload.
#
#   panel  -> uvicorn --reload + panel/ montado (editar .py recarrega sozinho)
#   assets -> watcher Tailwind + esbuild (editar frontend/** regenera os bundles)
#
# Editar arquivos em panel/** reflete no navegador com F5, SEM rebuild da imagem.
#
# Uso:
#   ./scripts/dev.sh              # sobe e segue os logs de panel + assets
#   ./scripts/dev.sh --no-logs    # sobe em background e retorna ao shell

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

FILES=(-f docker-compose.yml -f docker-compose.dev.yml)
FOLLOW=true

for arg in "$@"; do
  case "$arg" in
    --no-logs) FOLLOW=false ;;
    -h|--help)
      echo "Uso: $0 [--no-logs]"
      exit 0
      ;;
    *)
      echo "Opcao desconhecida: $arg (use --help)" >&2
      exit 1
      ;;
  esac
done

echo "==> Subindo containers em modo dev (build da imagem se necessario)..."
docker compose "${FILES[@]}" up -d --build

PORT="${PANEL_PORT:-8080}"
if [[ -f .env ]]; then
  val="$(grep -E '^PANEL_PORT=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'")"
  [[ -n "$val" ]] && PORT="$val"
fi

echo ""
echo "Modo dev ativo:"
echo "  Painel:   http://localhost:${PORT}"
echo "  Backend:  uvicorn --reload (edite panel/*.py -> recarrega)"
echo "  Frontend: watcher Tailwind + esbuild (edite panel/frontend/** -> F5)"
echo ""

if $FOLLOW; then
  echo "Seguindo logs (Ctrl+C sai; os containers continuam rodando)..."
  docker compose "${FILES[@]}" logs -f panel assets
else
  echo "Logs: docker compose ${FILES[*]} logs -f panel assets"
fi
