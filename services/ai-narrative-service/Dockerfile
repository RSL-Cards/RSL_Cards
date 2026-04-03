# Build from monorepo root:
#   docker build -f services/ai-narrative-service/Dockerfile -t rsl-ai-narrative-service .
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY services/ai-narrative-service/package.json ./services/ai-narrative-service/
RUN pnpm install --frozen-lockfile --filter @rsl/ai-narrative-service --prod

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY services/ai-narrative-service ./services/ai-narrative-service
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @rsl/ai-narrative-service build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
  && apk add --no-cache wget
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/ai-narrative-service/dist ./dist
COPY --from=builder /app/services/ai-narrative-service/package.json ./package.json
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
