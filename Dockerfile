# syntax=docker/dockerfile:1.7
# Multi-stage build for the Platinum Kitchen Next.js app.
# Produces a slim runtime image based on Next.js standalone output.

ARG NODE_VERSION=22-alpine

# ---- deps ---------------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# pnpm via corepack (matches the version pinned in package.json's packageManager
# field when set; otherwise the latest 9.x from corepack).
RUN corepack enable

# Copy only manifests so this layer caches across source changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

# ---- builder ------------------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Don't ship telemetry events from CI builds.
ENV NEXT_TELEMETRY_DISABLED=1

# next.config.ts has output: "standalone" so this produces .next/standalone.
RUN pnpm build

# ---- runner -------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Drop root.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Static assets must be copied alongside the standalone server because
# next.config.ts's standalone output does NOT include public/ or .next/static.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js is emitted by Next.js standalone build at the root of the copied
# standalone directory. It reads PORT/HOSTNAME from env.
CMD ["node", "server.js"]
