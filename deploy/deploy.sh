#!/usr/bin/env bash
# Despliegue del front VTC en el VPS. Ejecutar EN EL VPS dentro del repo:
#
#   cd /srv/AndesDVtc && ./deploy/deploy.sh
#
# Compila y publica el build standalone en /srv/vtc-app, luego reinicia el
# servicio. No toca nginx.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="/srv/vtc-app"

cd "$REPO_DIR"

echo "==> Trayendo ultimos cambios"
git pull --ff-only

echo "==> Instalando dependencias"
npm ci

echo "==> Compilando"
# NEXT_PUBLIC_API_URL debe existir AQUI: next la incrusta en el bundle del
# navegador durante el build. Se toma de .env.production (ver pasos).
npm run build

echo "==> Publicando en $APP_DIR"
sudo mkdir -p "$APP_DIR"
# El build standalone no copia public/ ni .next/static: hay que hacerlo a mano.
sudo rsync -a --delete "$REPO_DIR/.next/standalone/" "$APP_DIR/"
sudo rsync -a --delete "$REPO_DIR/public/"           "$APP_DIR/public/"
sudo rsync -a --delete "$REPO_DIR/.next/static/"     "$APP_DIR/.next/static/"
sudo chown -R andes:andes "$APP_DIR"

echo "==> Reiniciando servicio"
sudo systemctl restart vtc
sleep 2
sudo systemctl is-active --quiet vtc && echo "==> Listo: https://vtc.andesmp.site" || {
  echo "!! El servicio no arranco. Log:"; sudo journalctl -u vtc -n 30 --no-pager; exit 1;
}
