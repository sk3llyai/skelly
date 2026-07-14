# Skelly API container. Build context = repo root:
#   docker build -f apps/api/Dockerfile -t skelly-api .

# ---- base ----
FROM node:24-slim AS base
# openssl + ca-certificates: required by Prisma (engine selection) and TLS to the database.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /repo

# ---- build ----
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @skelly/domain-contracts build \
  && pnpm --filter @skelly/api exec prisma generate \
  && pnpm --filter @skelly/api build

# ---- runtime ----
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
