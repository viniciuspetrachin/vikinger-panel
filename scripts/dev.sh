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
#
# Para subir automaticamente no boot:
#   ./scripts/install-dev-service.sh

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
      echo ""
      echo "  --no-logs   Sobe o stack e retorna (sem seguir logs)"
      echo ""
      echo "Boot automatico: ./scripts/install-dev-service.sh"
      exit 0
      ;;
    *)
      echo "Opcao desconhecida: $arg (use --help)" >&2
      exit 1
      ;;
  esac
done

"$ROOT/scripts/dev-up.sh"

if $FOLLOW; then
  echo "Seguindo logs (Ctrl+C sai; os containers continuam rodando)..."
  docker compose "${FILES[@]}" logs -f panel assets
else
  echo "Logs: docker compose ${FILES[*]} logs -f panel assets"
fi
