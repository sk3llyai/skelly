# Skelly

**Commercial / financial operating system for bid & tender teams.**

Skelly turns a bid into a structured, auditable business case — modelling cost, revenue, risk and
tax into three monthly series (**Value / Cash Flow / P&L**), across strategy **scenarios**, with
**win-probability** simulation, an iterative **approval** flow, **outcome** capture, and a
**portfolio** intelligence layer that aggregates every deal. Guiding principle: **auditable,
explainable, no black boxes.**

The full specification lives in [`docs/`](./docs) — start with
[`docs/34-START-HERE-Claude-Code-Build-Brief.md`](./docs/34-START-HERE-Claude-Code-Build-Brief.md)
and [`docs/00-INDEX.md`](./docs/00-INDEX.md). The docs are the source of truth.

---

## Monorepo layout

```
skelly/
  apps/
    api/                  NestJS backend (the modular monolith)
    web/                  Next.js / React frontend
    worker/               background jobs (reserved seam — Phase 7+)
  packages/
    domain-contracts/     shared types + validation (single source of truth for data shapes)
    calc-kernel/          the calculation engine (reserved seam — Phase 2)
    ui/                   design system + shared components (reserved seam — Phase 3+)
    config/               shared TypeScript / lint / test configuration
  docs/                   the full spec + decision log
  infra/                  infrastructure as code (grows from the deploy step)
```

## Prerequisites

- **Node 24 LTS** — pinned in [`.node-version`](./.node-version). If you use `fnm` or `nvm`, it is
  selected automatically when you enter this folder.
- **pnpm** (`npm install -g pnpm`).
- **Docker** — for the local Postgres database.

## Getting started

```bash
pnpm install          # install all workspace dependencies
pnpm db:up            # start local Postgres (Docker)
pnpm build            # build all packages
pnpm test             # run all tests
# run an app in watch mode, e.g.:
pnpm --filter @skelly/api start:dev
pnpm --filter @skelly/web dev
```

## Common commands

| Command                             | What it does                            |
| ----------------------------------- | --------------------------------------- |
| `pnpm install`                      | Install all workspace dependencies      |
| `pnpm build`                        | Build every package (topological order) |
| `pnpm typecheck`                    | Type-check every package                |
| `pnpm test`                         | Run every package's tests               |
| `pnpm lint`                         | Lint the whole repo                     |
| `pnpm format` / `pnpm format:check` | Apply / verify formatting               |
| `pnpm db:up` / `pnpm db:down`       | Start / stop the local Postgres         |

## Build status

Progress is tracked in
[`docs/33-v1-Feature-Page-Inventory-and-Build-Tracker.md`](./docs/33-v1-Feature-Page-Inventory-and-Build-Tracker.md).

- **Phase 0 — Setup:** in progress — monorepo scaffold, CI, and the shared-contract seam are in;
  auth + multi-tenancy (RLS) + staging deploy are the remaining Phase 0 work.

---

_Proprietary — all rights reserved._
