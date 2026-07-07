#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGINS_DIR="${ROOT_DIR}/config/bepinex/plugins"
OWNER="${PANEL_USER:-vinicius}"

mkdir -p "${PLUGINS_DIR}/disabled"
chown -R "${OWNER}:${OWNER}" "${PLUGINS_DIR}"
chmod -R u+rwX,g+rwX "${PLUGINS_DIR}"

if command -v setfacl >/dev/null 2>&1; then
  setfacl -R -m "u:${OWNER}:rwx" "${PLUGINS_DIR}" 2>/dev/null || true
  setfacl -R -d -m "u:${OWNER}:rwx" "${PLUGINS_DIR}" 2>/dev/null || true
fi
