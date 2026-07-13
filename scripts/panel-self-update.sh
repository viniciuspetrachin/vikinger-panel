#!/usr/bin/env bash
# Pull GHCR image and recreate the panel container (runs on host via docker.sock).
set -euo pipefail

VERSION="${1:?usage: panel-self-update.sh VERSION PROJECT_ROOT [GHCR_OWNER]}"
ROOT="${2:?usage: panel-self-update.sh VERSION PROJECT_ROOT [GHCR_OWNER]}"
OWNER="${3:-viniciuspetrachin}"

cd "$ROOT"
COMPOSE_FILE="${ROOT}/docker-compose.yml"
IMAGE="ghcr.io/${OWNER}/vikinger-panel:${VERSION}"
LOG_DIR="${ROOT}/panel-data/logs"
mkdir -p "$LOG_DIR"
LOG="${LOG_DIR}/panel-update.log"

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"
}

log "Pulling ${IMAGE}..."
docker pull "$IMAGE"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  log "ERROR: docker-compose.yml not found at ${COMPOSE_FILE}"
  exit 1
fi

TMP="${COMPOSE_FILE}.tmp.$$"
if grep -qE '^\s*image:\s*ghcr\.io/[^/]+/vikinger-panel:' "$COMPOSE_FILE"; then
  sed -E "s|(^[[:space:]]*image:[[:space:]]*)ghcr\.io/[^[:space:]]+/vikinger-panel:[^[:space:]]+|\1${IMAGE}|" \
    "$COMPOSE_FILE" > "$TMP"
  mv "$TMP" "$COMPOSE_FILE"
  log "Updated compose image tag to ${VERSION}"
else
  log "WARN: no ghcr.io/.../vikinger-panel image line found; skipping compose edit"
fi

log "Recreating panel container..."
if command -v docker-compose >/dev/null 2>&1; then
  docker-compose -f "$COMPOSE_FILE" up -d --force-recreate panel
else
  docker compose -f "$COMPOSE_FILE" up -d --force-recreate panel
fi

log "Panel update to v${VERSION} complete."
