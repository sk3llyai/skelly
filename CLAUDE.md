# CLAUDE.md — Skelly build guide

This file orients any Claude Code session working on Skelly. **The docs are the spec.** When in
doubt, follow the Build Brief (`docs/34-START-HERE-Claude-Code-Build-Brief.md`), the Decision Log
(`docs/08-...`), the v1 Scope (`docs/32-...`), and the Tracker (`docs/33-...`). Do not silently
deviate — if a decision is missing, ask, decide, and record it in Doc 08.

## What Skelly is

An enterprise commercial/financial operating system for bid & tender teams. It turns a bid into a
structured business case — cost, revenue, risk and tax modelled into three monthly series
(**Value / Cash Flow / P&L**), across strategy **scenarios**, with **win-probability** simulation,
an iterative **approval** flow, **outcome** capture, and a **portfolio** intelligence layer.
Financial philosophy: **auditable, explainable, no black boxes.**

## Non-negotiable rules

- **Engineering Constitution** (`docs/02-...`) — 17 principles.
- **Methodology** (`docs/05-...`) — explain reasoning + trade-offs before coding; no jumping to code.
- **Security-by-design** — multi-tenancy via `organisation_id` + Postgres RLS from day one; audit;
  least privilege.
- **Record every decision** in the Decision Log (Doc 08); **update progress** in the Tracker (Doc 33).

## Terminology locks (do not conflate)

- **Model** = a calculation engine (cost / risk / revenue) _only_.
- **Template** = a Pack-Builder layout (Qualification/Approval pack style per company).
- **Phase** = a timeline-period entity that models reference for timing.
- **Scenario** = a parallel strategy version; each has a linear history of approval-round snapshots
  (a round snapshot = the _entire_ scenario state).
- **Marrow** = the governed data catalog/semantic layer (backend). **Companion** = its user-facing
  surface (+ AI).
- **Tri-series** = the Value / Cash Flow / P&L monthly series every model outputs.

## Core entity spine

`Deal, Scenario, EstimateLine, Model(Definition/Instance), Product, Solution, Account, Party, Phase,
Risk` — plus `Organisation, User, Role, Category(taxonomy), Task, Comment, Notification, KeyDate`.
All tenant-scoped (`organisation_id` + RLS), audited, soft-deleted.

## Build order (bottom-up, NOT lifecycle order)

0. Setup — repo, CI/CD, envs, WorkOS auth, tenancy (RLS) skeleton, deploy pipeline.
1. Walking skeleton — deal → cost → forecast through every layer.
2. Calculation engine + core models (the heart) — heavy tests + explainability.
3. Foundational modules — Company Parameters, Products, Solutions, Accounts.
4. Deal workspace + Estimations + Forecast.
5. Scenarios + Simulation + Win Probability.
6. Approval + Outcome + Pack Builders + workflow.
7. Marrow + dashboards + Portfolio + Notifications/Deadlines.
8. Hardening + onboarding.

Each phase ends **tested, secure, demoable**. The calc engine gets the heaviest tests (financial
correctness is the product). Prefer configuration/data over hardcode (esp. models = definitions).

## Ways of working

- Small, tested increments; **CI green before moving on**.
- Explain trade-offs before coding; this founder is non-technical — explain in plain language and
  make the long-term-correct call when asked.
- Multi-tenancy (`organisation_id` + RLS) is on every table from the first migration — it cannot be
  retrofitted.

## Repo commands

- `pnpm install` · `pnpm build` · `pnpm typecheck` · `pnpm test` · `pnpm lint` · `pnpm format`
- `pnpm db:up` / `pnpm db:down` — local Postgres via Docker.
- Node is pinned to 24 LTS via `.node-version`.

## Layout

- `apps/api` (NestJS) · `apps/web` (Next.js) · `apps/worker` (reserved).
- `packages/domain-contracts` (shared types/validation — SSOT) · `packages/calc-kernel` (reserved,
  Phase 2) · `packages/ui` (reserved) · `packages/config` (shared TS/lint/test config).
- `docs/` (spec) · `infra/` (IaC).
