#!/usr/bin/env bash
# Instala serviço systemd user para subir o dev stack no login/boot.
# Requer linger habilitado para sobreviver sem sessão gráfica (pede sudo uma vez).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_NAME="$(whoami)"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
UNIT_FILE="$UNIT_DIR/vikinger-panel-dev.service"

mkdir -p "$UNIT_DIR"

cat > "$UNIT_FILE" <<EOF
[Unit]
Description=Vikinger Panel dev stack (docker compose + hot-reload)
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$ROOT
ExecStartPre=/usr/bin/docker info
ExecStart=$ROOT/scripts/dev-up.sh
ExecStop=/usr/bin/docker compose -f docker-compose.yml -f docker-compose.dev.yml stop panel assets
TimeoutStartSec=600

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable vikinger-panel-dev.service
systemctl --user restart vikinger-panel-dev.service

echo ""
echo "Serviço instalado: vikinger-panel-dev.service"
echo "  status: systemctl --user status vikinger-panel-dev"
echo "  logs:   journalctl --user -u vikinger-panel-dev -f"
echo ""

if [[ "$(loginctl show-user "$USER_NAME" -p Linger --value 2>/dev/null || echo no)" != "yes" ]]; then
  echo "Habilitando linger (stack sobe no boot, mesmo sem login)..."
  if sudo loginctl enable-linger "$USER_NAME"; then
    echo "Linger ativado para $USER_NAME."
  else
    echo "AVISO: não foi possível ativar linger. O stack sobe ao login do usuário." >&2
  fi
fi

systemctl --user status vikinger-panel-dev.service --no-pager || true
