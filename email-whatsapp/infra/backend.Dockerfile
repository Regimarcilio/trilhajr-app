# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────────────
# MailChat backend — imagem de produção multi-stage
#
# Contexto de build: email-whatsapp/backend
#   docker build -f ../infra/backend.Dockerfile -t mailchat-backend:local .
#
# Decisões:
#   - deps/build separados do runtime; devDependencies não vão para a imagem.
#   - runtime Alpine, usuário dedicado UID/GID 10001, sem shell de login.
#   - `tini` como PID 1 para repasse de sinais/reaping.
#   - HEALTHCHECK usa `fetch` nativo do Node 22 (sem curl/wget extras).
#   - Nenhum segredo é copiado: .env e afins ficam fora via
#     backend.Dockerfile.dockerignore e são injetados em runtime.
# ─────────────────────────────────────────────────────────────────────────────

ARG NODE_IMAGE=node:22-alpine

# ── Dependências completas (build) ──────────────────────────────────────────
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ── Build TypeScript → dist/ ────────────────────────────────────────────────
FROM deps AS build
COPY tsconfig.json tsup.config.ts drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src ./src
RUN npm run build

# ── Dependências de produção (sem devDependencies) ──────────────────────────
FROM ${NODE_IMAGE} AS prod-deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund \
    && npm cache clean --force

# ── Runtime mínimo ──────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS runtime

LABEL org.opencontainers.image.title="mailchat-backend" \
      org.opencontainers.image.description="MailChat API (Hono/Node 22) — produção" \
      org.opencontainers.image.source="https://github.com/Regimarcilio/trilhajr-app" \
      org.opencontainers.image.licenses="UNLICENSED"

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8787 \
    NODE_OPTIONS=--enable-source-maps

# tini: PID 1 para sinais e reaping. Usuário sem privilégios.
RUN apk add --no-cache tini ca-certificates \
    && addgroup -S -g 10001 mailchat \
    && adduser -S -D -H -u 10001 -G mailchat -s /sbin/nologin mailchat

WORKDIR /app

COPY --from=prod-deps --chown=root:root /app/node_modules ./node_modules
COPY --from=build      --chown=root:root /app/dist         ./dist
COPY --from=build      --chown=root:root /app/package.json ./package.json

USER 10001:10001

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:8787/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

STOPSIGNAL SIGTERM
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
