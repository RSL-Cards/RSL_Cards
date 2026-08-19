# Build from monorepo root:
#   docker build -f backend/Dockerfile -t rsl-backend .
FROM oven/bun:latest
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd -r appgroup && useradd -r -g appgroup appuser \
  && apt-get update && apt-get install -y --no-install-recommends wget ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json bun.lock ./
COPY packages ./packages
COPY backend ./backend
RUN bun install
WORKDIR /app/backend
RUN bun x tsc --noEmit

USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
CMD ["bun", "run", "start"]
