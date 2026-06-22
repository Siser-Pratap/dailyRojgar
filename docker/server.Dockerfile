# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/

# Install all dependencies (including dev — needed to build TS)
RUN npm ci --workspace=apps/server --workspace=packages/shared-types --workspace=packages/shared-utils

# Copy source
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Build shared packages first, then server
RUN npm run build -w packages/shared-types && \
    npm run build -w packages/shared-utils && \
    npm run build -w apps/server

# ─── Stage 2: Production image ───────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy workspace manifests for production install
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/

# Install production deps only
RUN npm ci --omit=dev --workspace=apps/server --workspace=packages/shared-types --workspace=packages/shared-utils

# Copy built artifacts from builder
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/shared-utils/dist ./packages/shared-utils/dist

RUN mkdir -p /app/apps/server/logs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

USER node

CMD ["node", "apps/server/dist/server.js"]
