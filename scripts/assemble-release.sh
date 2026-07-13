#!/usr/bin/env bash
# Monta o pacote ZIP de distribuição (sem código-fonte) para release.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  echo "Uso: $0 VERSION GHCR_OWNER GIT_COMMIT BUILD_DATE IMAGE_TAR [OUTPUT_DIR]" >&2
  exit 1
}

[[ $# -ge 5 ]] || usage

VERSION="$1"
GHCR_OWNER="$2"
GIT_COMMIT="$3"
BUILD_DATE="$4"
IMAGE_TAR="$5"
OUTPUT_DIR="${6:-$ROOT/dist}"

if [[ ! -f "$IMAGE_TAR" ]]; then
  echo "Erro: imagem não encontrada: $IMAGE_TAR" >&2
  exit 1
fi

STAGING="$OUTPUT_DIR/vikinger-panel-$VERSION"
rm -rf "$STAGING"
mkdir -p "$STAGING/images" "$STAGING/scripts" "$STAGING/config" "$STAGING/data" "$STAGING/panel-data"

echo "$VERSION" > "$STAGING/VERSION"

sed \
  -e "s/{{VERSION}}/${VERSION}/g" \
  -e "s/{{GHCR_OWNER}}/${GHCR_OWNER}/g" \
  -e "s/{{GIT_COMMIT}}/${GIT_COMMIT}/g" \
  -e "s/{{BUILD_DATE}}/${BUILD_DATE}/g" \
  "$ROOT/release/docker-compose.yml.template" > "$STAGING/docker-compose.yml"

cp "$ROOT/.env.example" "$STAGING/"
cp "$ROOT/LICENSE" "$STAGING/"
cp "$ROOT/COMMERCIAL-LICENSE.md" "$STAGING/"
cp "$ROOT/release/README-INSTALL.md" "$STAGING/"
cp -r "$ROOT/docs" "$STAGING/"
cp "$ROOT/scripts/fix-plugins-permissions.sh" "$STAGING/scripts/"
cp "$ROOT/scripts/fix-worlds-permissions.sh" "$STAGING/scripts/"
cp "$ROOT/scripts/panel-self-update.sh" "$STAGING/scripts/"
cp "$ROOT/release/scripts/start.sh" "$STAGING/scripts/"
cp "$ROOT/release/scripts/reload-panel.sh" "$STAGING/scripts/"
chmod +x "$STAGING/scripts/"*.sh

cp "$IMAGE_TAR" "$STAGING/images/vikinger-panel-${VERSION}.tar"
touch "$STAGING/config/.gitkeep" "$STAGING/data/.gitkeep" "$STAGING/panel-data/.gitkeep"

ZIP_NAME="vikinger-panel-${VERSION}-dist.zip"
rm -f "$OUTPUT_DIR/$ZIP_NAME"
(
  cd "$OUTPUT_DIR"
  zip -rq "$ZIP_NAME" "vikinger-panel-$VERSION"
)

echo "Pacote criado: $OUTPUT_DIR/$ZIP_NAME"
