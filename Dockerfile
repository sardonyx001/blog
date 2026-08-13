# syntax=docker/dockerfile:1
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# BuildKit cache mounts persist across `docker compose build` runs on this
# host (unlike a normal COPY layer, which only survives if nothing upstream
# changed) — the pnpm content-addressable store means most packages are
# already downloaded even when the lockfile shifts a little, and the
# Next.js cache below turns most deploys into incremental rebuilds instead
# of from-scratch ones.
RUN --mount=type=cache,id=blog-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=cache,id=blog-next-cache,target=/app/.next/cache \
    pnpm build

# Standalone runtime — the posts/ content collection is read straight off
# disk at request time (fs.readdirSync in lib/posts.ts), not bundled by
# webpack, so it has to be copied into the final image explicitly alongside
# the standalone server output. OG-image fonts live in public/fonts/ (not
# node_modules) for the same reason — see lib/og-fonts.ts.
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/posts ./posts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
