#!/usr/bin/env bash
# Rebuild e reinício do container do painel após mudanças em panel/.
#
# O painel serve arquivos de /app/static/ DENTRO da imagem Docker.
# F5 no navegador não basta — é preciso reconstruir a imagem.
#
# Uso:
#   ./scripts/reload-panel.sh              # rebuild + restart
#   ./scripts/reload-panel.sh --tests      # idem + pytest unit/e2e
#   ./scripts/reload-panel.sh --skip-build # só reinicia (sem rebuild da imagem)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RUN_TESTS=false
SKIP_BUILD=false

for arg in "$@"; do
  case "$arg" in
    --tests) RUN_TESTS=true ;;
    --skip-build) SKIP_BUILD=true ;;
    -h|--help)
      echo "Uso: $0 [--tests] [--skip-build]"
      echo "  --tests       Roda pytest unit + e2e antes do deploy"
      echo "  --skip-build  Apenas docker compose up -d panel (sem rebuild)"
      exit 0
      ;;
    *)
      echo "Opção desconhecida: $arg (use --help)" >&2
      exit 1
      ;;
  esac
done

if [[ ! -f docker-compose.yml ]]; then
  echo "Erro: docker-compose.yml não encontrado em $ROOT" >&2
  exit 1
fi

if $RUN_TESTS; then
  echo "==> Testes (unit + e2e)..."
  if [[ ! -x panel/.venv/bin/pytest ]]; then
    echo "Erro: panel/.venv/bin/pytest não encontrado. Rode: cd panel && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt" >&2
    exit 1
  fi
  (cd panel && .venv/bin/pytest tests/unit -q)
  (cd panel && .venv/bin/pytest tests/e2e -q)
fi

if $SKIP_BUILD; then
  echo "==> Reiniciando container (sem rebuild)..."
  docker compose up -d panel
else
  echo "==> Rebuild da imagem do painel (frontend + backend embarcados)..."
  docker compose build panel
  echo "==> Recriando container..."
  docker compose up -d panel
fi

PORT="${PANEL_PORT:-8080}"
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  val="$(grep -E '^PANEL_PORT=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'")"
  [[ -n "$val" ]] && PORT="$val"
fi

echo ""
echo "Painel atualizado."
echo "  URL:  http://localhost:${PORT}"
echo "  Dica: Ctrl+Shift+R no navegador se a UI ainda parecer antiga (cache)."
echo ""
