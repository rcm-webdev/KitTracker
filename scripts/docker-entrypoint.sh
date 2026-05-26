#!/bin/sh
set -e

echo "Running database migrations..."
prisma migrate deploy

echo "Seeding demo data..."
node dist/prisma/seed.js || echo "Seed failed (non-fatal) — server will still start"

echo "Starting server..."
exec node dist/index.js
