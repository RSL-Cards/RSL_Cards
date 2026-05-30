# Build from monorepo root:
#   docker build -f backend/Dockerfile -t rsl-backend .
FROM oven/bun:latest AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY packages ./packages
COPY backend/package.json ./backend/
RUN bun install --frozen-lockfile

FROM oven/bun:latest AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY package.json bun.lock ./
COPY backend ./backend
WORKDIR /app/backend
RUN bun x tsc --noEmit

FROM oven/bun:latest AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd -r appgroup && useradd -r -g appgroup appuser \
  && apt-get update && apt-get install -y --no-install-recommends wget ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/backend ./backend
WORKDIR /app/backend
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
CMD ["bun", "run", "start"]
