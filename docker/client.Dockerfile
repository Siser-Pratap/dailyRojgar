# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/client/package.json ./apps/client/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/

RUN npm ci --workspace=apps/client --workspace=packages/shared-types --workspace=packages/shared-utils

COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/client/ ./apps/client/

RUN npm run build -w packages/shared-types && \
    npm run build -w packages/shared-utils && \
    npm run build -w apps/client

# ─── Stage 2: Serve with nginx ───────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
