#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORLDS_DIR="${ROOT_DIR}/config/worlds_local"
OWNER="${PANEL_USER:-vinicius}"

mkdir -p "${WORLDS_DIR}"
chown -R "${OWNER}:${OWNER}" "${WORLDS_DIR}"
chmod -R u+rwX "${WORLDS_DIR}"

if command -v setfacl >/dev/null 2>&1; then
  setfacl -R -m "u:${OWNER}:rwx" "${WORLDS_DIR}" 2>/dev/null || true
  setfacl -R -d -m "u:${OWNER}:rwx" "${WORLDS_DIR}" 2>/dev/null || true
fi

echo "Permissões de ${WORLDS_DIR} ajustadas para ${OWNER}."
