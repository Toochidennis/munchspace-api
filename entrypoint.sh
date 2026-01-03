#!/bin/sh
set -euo pipefail

echo "[startup] running Prisma migrations..."
npx prisma migrate deploy

echo "[startup] starting api server..."
exec node -r tsconfig-paths/register dist/src/main.js
