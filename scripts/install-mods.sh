#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGINS_DIR="${ROOT_DIR}/config/bepinex/plugins"
TMP_DIR="${ROOT_DIR}/.mod-cache"

mkdir -p "${PLUGINS_DIR}" "${TMP_DIR}"

declare -A MODS=(
  ["ValheimRcon"]="https://thunderstore.io/package/download/Tristan/ValheimRcon/1.5.1/"
  ["BetterArchery"]="https://gcdn.thunderstore.io/live/repository/packages/ishid4-BetterArchery-1.9.82.zip"
  ["PlantEasily"]="https://gcdn.thunderstore.io/live/repository/packages/Advize-PlantEasily-2.1.1.zip"
  ["AutoRepair"]="https://gcdn.thunderstore.io/live/repository/packages/Tekla-AutoRepair-5.4.1602.zip"
  ["YamlDotNet"]="https://gcdn.thunderstore.io/live/repository/packages/ValheimModding-YamlDotNet-16.3.1.zip"
  ["ExtraSlots"]="https://gcdn.thunderstore.io/live/repository/packages/shudnal-ExtraSlots-1.1.18.zip"
  ["BetterUI"]="https://gcdn.thunderstore.io/live/repository/packages/BetterUI_ForeverMaintained-BetterUI_ForeverMaintained-2.5.9.zip"
  ["ServerSideMap"]="https://gcdn.thunderstore.io/live/repository/packages/Mydayyy-ServerSideMap-1.3.13.zip"
)

install_mod() {
  local name="$1"
  local url="$2"
  local zip_file="${TMP_DIR}/${name}.zip"
  local extract_dir="${TMP_DIR}/${name}"

  echo "==> Instalando ${name}..."
  curl -fsSL "${url}" -o "${zip_file}"
  rm -rf "${extract_dir}"
  mkdir -p "${extract_dir}"
  python3 - "${zip_file}" "${extract_dir}" "${PLUGINS_DIR}" <<'PY'
import sys, zipfile, os
zip_path, extract_dir, plugins_dir = sys.argv[1:4]
os.makedirs(extract_dir, exist_ok=True)
with zipfile.ZipFile(zip_path) as zf:
    for info in zf.infolist():
        if info.filename.endswith(".dll"):
            dll_name = os.path.basename(info.filename.replace("\\", "/"))
            out = os.path.join(plugins_dir, dll_name)
            with open(out, "wb") as f:
                f.write(zf.read(info.filename))
            print(f"    + {dll_name}")
PY
}

echo "Diretório de plugins: ${PLUGINS_DIR}"
for name in "${!MODS[@]}"; do
  install_mod "${name}" "${MODS[$name]}"
done

echo
echo "Mods instalados:"
ls -1 "${PLUGINS_DIR}"/*.dll 2>/dev/null || echo "Nenhum DLL encontrado"
