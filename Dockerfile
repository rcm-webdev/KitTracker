# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/
COPY apps/client/package.json apps/client/
COPY apps/e2e/package.json apps/e2e/
COPY packages/shared/package.json packages/shared/

# Install all deps (dev + prod) for build stages
FROM base AS deps
RUN npm ci

# Build the React SPA
FROM deps AS build-client
COPY packages/shared packages/shared
COPY apps/client apps/client
WORKDIR /app/apps/client
RUN npx vite build

# Build the Express server
FROM deps AS build-server
WORKDIR /app
COPY packages/shared packages/shared
COPY apps/server apps/server
WORKDIR /app/apps/server
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
RUN npx prisma generate && \
    npx esbuild src/index.ts \
      --bundle \
      --platform=node \
      --target=node20 \
      --outfile=dist/index.js \
      --external:@prisma/* \
      --external:@prisma/client \
      --external:prisma \
      --external:pg \
      --external:better-auth \
      --external:better-auth/* && \
    npx esbuild prisma/seed.ts \
      --bundle \
      --platform=node \
      --target=node20 \
      --outfile=dist/prisma/seed.js \
      --external:@prisma/* \
      --external:@prisma/client \
      --external:prisma \
      --external:pg \
      --external:better-auth \
      --external:better-auth/*

# Production — Express serves the API and the built React SPA on one port
FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000
ENV PATH="/app/node_modules/.bin:${PATH}"

RUN npm ci --omit=dev --workspace=@kittracker/server

COPY apps/server/prisma apps/server/prisma
COPY apps/server/prisma.config.ts apps/server/
COPY --from=build-server /app/apps/server/dist apps/server/dist
COPY --from=build-server /app/node_modules/.prisma node_modules/.prisma
COPY --from=build-server /app/node_modules/@prisma node_modules/@prisma
# Client build lands inside the server directory so Express can serve it as static files
COPY --from=build-client /app/apps/client/dist apps/server/public
COPY scripts/docker-entrypoint.sh /entrypoint.sh

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chmod +x /entrypoint.sh
USER appuser

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

WORKDIR /app/apps/server
EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
