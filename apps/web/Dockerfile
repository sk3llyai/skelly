# Skelly web container. Build context = repo root:
#   docker build -f apps/web/Dockerfile -t skelly-web .
# NEXT_PUBLIC_API_URL is a build-time value (baked into the client bundle):
#   docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com -t skelly-web .

# ---- base ----
FROM node:24-slim AS base
RUN corepack enable
WORKDIR /repo

# ---- build ----
FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @skelly/domain-contracts build \
  && pnpm --filter @skelly/web build

# ---- runtime ----
FROM node:24-slim AS runtime
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app
# Next.js standalone server (monorepo layout) + static assets it doesn't bundle.
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
