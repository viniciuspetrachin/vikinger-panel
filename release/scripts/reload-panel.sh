#!/usr/bin/env bash
# Reinicia o painel no pacote de release (sem rebuild — imagem já vem pronta).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

VERSION_FILE="${ROOT}/VERSION"
if [[ ! -f "$VERSION_FILE" ]]; then
  echo "Erro: arquivo VERSION não encontrado em $ROOT" >&2
  exit 1
fi
VERSION="$(tr -d '[:space:]' < "$VERSION_FILE")"

RELOAD_IMAGE=false
for arg in "$@"; do
  case "$arg" in
    --load-image) RELOAD_IMAGE=true ;;
    -h|--help)
      echo "Uso: $0 [--load-image]"
      echo "  --load-image  Recarrega images/vikinger-panel-VERSION.tar antes do restart"
      exit 0
      ;;
    *)
      echo "Opção desconhecida: $arg (use --help)" >&2
      exit 1
      ;;
  esac
done

if $RELOAD_IMAGE; then
  IMAGE_TAR="${ROOT}/images/vikinger-panel-${VERSION}.tar"
  if [[ ! -f "$IMAGE_TAR" ]]; then
    echo "Erro: $IMAGE_TAR não encontrado" >&2
    exit 1
  fi
  echo "==> Recarregando imagem v${VERSION}..."
  docker load -i "$IMAGE_TAR"
fi

echo "==> Reiniciando container do painel..."
docker compose up -d panel

PORT="${PANEL_PORT:-8080}"
if [[ -f .env ]]; then
  val="$(grep -E '^PANEL_PORT=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'")"
  [[ -n "$val" ]] && PORT="$val"
fi

echo ""
echo "Painel reiniciado."
echo "  URL: http://localhost:${PORT}"
echo ""
