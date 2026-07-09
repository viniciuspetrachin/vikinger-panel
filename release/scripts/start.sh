#!/usr/bin/env bash
# Primeira subida do Vikinger Panel (pacote de release, sem build local).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

VERSION_FILE="${ROOT}/VERSION"
if [[ ! -f "$VERSION_FILE" ]]; then
  echo "Erro: arquivo VERSION não encontrado em $ROOT" >&2
  exit 1
fi
VERSION="$(tr -d '[:space:]' < "$VERSION_FILE")"

IMAGE_TAR="${ROOT}/images/vikinger-panel-${VERSION}.tar"
if [[ ! -f "$IMAGE_TAR" ]]; then
  echo "Erro: imagem não encontrada: $IMAGE_TAR" >&2
  echo "Alternativa: docker pull ghcr.io/$(grep 'ghcr.io/' docker-compose.yml | head -1 | sed -E 's|.*ghcr.io/([^:]+):.*|\1|'):${VERSION}" >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "==> Criando .env a partir de .env.example..."
  cp .env.example .env
  echo ""
  echo "IMPORTANTE: edite o arquivo .env antes de continuar:"
  echo "  - HOST_PROJECT_DIR (caminho ABSOLUTO desta pasta)"
  echo "  - DOCKER_GID (getent group docker | cut -d: -f3)"
  echo "  - SERVER_NAME, WORLD_NAME, SERVER_PASS"
  echo ""
  read -r -p "Pressione Enter após editar o .env (ou Ctrl+C para cancelar)..."
fi

echo "==> Carregando imagem Docker v${VERSION}..."
docker load -i "$IMAGE_TAR"

GHCR_IMAGE="$(grep -E '^\s+image:\s+ghcr\.io/' docker-compose.yml | head -1 | awk '{print $2}')"
if [[ -n "$GHCR_IMAGE" ]]; then
  docker tag "$GHCR_IMAGE" "vikinger-panel:${VERSION}" 2>/dev/null || true
  docker tag "$GHCR_IMAGE" "vikinger-panel:latest" 2>/dev/null || true
fi

echo "==> Subindo servidores (Valheim + painel)..."
docker compose up -d

PORT="${PANEL_PORT:-8080}"
if [[ -f .env ]]; then
  val="$(grep -E '^PANEL_PORT=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'")"
  [[ -n "$val" ]] && PORT="$val"
fi

echo ""
echo "Vikinger Panel iniciado."
echo "  URL: http://localhost:${PORT}"
echo "  Na primeira subida o Valheim pode levar vários minutos para baixar o jogo."
echo ""
