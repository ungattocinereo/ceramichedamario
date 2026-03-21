#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOCK_FILE="$REPO_DIR/.deploy.lock"
LOG_FILE="$REPO_DIR/deploy.log"
KEEP_BUILDS=2

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

cleanup_lock() {
  rm -f "$LOCK_FILE"
}

# Prevent parallel deploys
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
  log "ERROR: Another deploy is already running. Exiting."
  exit 1
fi
trap cleanup_lock EXIT

cd "$REPO_DIR"

TIMESTAMP=$(date +%s)
DIST_DIR="dist-$TIMESTAMP"

log "=== Deploy started ==="

log "Fetching latest code..."
git fetch origin main
git reset --hard origin/main

log "Installing dependencies..."
npm ci

log "Building site into $DIST_DIR..."
npx astro build --outDir "$DIST_DIR"

log "Swapping symlink to $DIST_DIR..."
ln -sfn "$DIST_DIR" dist-live.tmp
mv -Tf dist-live.tmp dist-live

log "Cleaning up old builds..."
# List dist-NNNN dirs sorted newest first, skip KEEP_BUILDS, delete the rest
cd "$REPO_DIR"
ls -dt dist-[0-9]* 2>/dev/null | tail -n +$((KEEP_BUILDS + 1)) | while read -r old; do
  log "Removing old build: $old"
  rm -rf "$old"
done

log "=== Deploy finished successfully ==="
