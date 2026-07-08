#!/usr/bin/env bash
set -euo pipefail

ROOT="${VALHEIM_PANEL_ROOT:-/home/vinicius/vikinger-panel}"
PANEL_UID="${PANEL_UID:-1000}"
PANEL_GID="${PANEL_GID:-1000}"
DOCKER_GID="${DOCKER_GID:-999}"

# ── Grupo docker (acesso ao docker.sock — GID deve bater com o host) ─────────
if getent group "${DOCKER_GID}" >/dev/null 2>&1; then
  DOCKER_GROUP="$(getent group "${DOCKER_GID}" | cut -d: -f1)"
elif getent group docker >/dev/null 2>&1; then
  groupmod -o -g "${DOCKER_GID}" docker 2>/dev/null || true
  DOCKER_GROUP="docker"
else
  groupadd -g "${DOCKER_GID}" docker 2>/dev/null || groupadd docker 2>/dev/null || true
  DOCKER_GROUP="docker"
fi
if id panel >/dev/null 2>&1; then
  usermod -aG "${DOCKER_GROUP}" panel 2>/dev/null || true
fi

# ── Diretórios internos legados (/app/data, /app/logs) ───────────────────────
mkdir -p /app/data/world_fwl_backups /app/data/world_fwl_staging /app/logs
chown -R "${PANEL_UID}:${PANEL_GID}" /app/data /app/logs 2>/dev/null || true
chmod -R u+rwX,g+rwX /app/data /app/logs 2>/dev/null || true

# ── Dados persistentes do painel no volume do projeto ────────────────────────
PANEL_DATA="${ROOT}/panel-data"
mkdir -p \
  "${PANEL_DATA}/world_fwl_backups" \
  "${PANEL_DATA}/world_fwl_staging" \
  "${PANEL_DATA}/logs" \
  "${ROOT}/config" \
  "${ROOT}/data" 2>/dev/null || true

chown -R "${PANEL_UID}:${PANEL_GID}" "${PANEL_DATA}" 2>/dev/null || true
chmod -R u+rwX,g+rwX "${PANEL_DATA}" 2>/dev/null || true

# Migra backups legados de /app/data → panel-data (primeira subida após upgrade)
LEGACY_BACKUP="/app/data/world_fwl_backups"
if [[ -d "${LEGACY_BACKUP}" ]] && [[ -n "$(ls -A "${LEGACY_BACKUP}" 2>/dev/null || true)" ]]; then
  cp -an "${LEGACY_BACKUP}/." "${PANEL_DATA}/world_fwl_backups/" 2>/dev/null || true
  chown -R "${PANEL_UID}:${PANEL_GID}" "${PANEL_DATA}/world_fwl_backups" 2>/dev/null || true
fi

# Docker CLI: evita "permission denied" em /root/.docker/config.json após setpriv
PANEL_HOME="/home/panel"
mkdir -p "${PANEL_HOME}/.docker"
if [[ ! -f "${PANEL_HOME}/.docker/config.json" ]]; then
  echo "{}" > "${PANEL_HOME}/.docker/config.json"
fi
chown -R "${PANEL_UID}:${PANEL_GID}" "${PANEL_HOME}/.docker" 2>/dev/null || true

exec setpriv --reuid="${PANEL_UID}" --regid="${PANEL_GID}" --groups="${PANEL_GID},${DOCKER_GID}" -- \
  env HOME="${PANEL_HOME}" DOCKER_CONFIG="${PANEL_HOME}/.docker" USER=panel LOGNAME=panel "$@"
