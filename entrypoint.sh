#!/bin/sh
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[startup] ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "[startup] running Prisma migrations..."
npx prisma migrate deploy

echo "[startup] starting api server..."
exec node -r tsconfig-paths/register dist/src/main.js
