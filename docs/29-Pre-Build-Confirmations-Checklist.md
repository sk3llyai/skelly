# 29 — Pre-Build Confirmations Checklist (before moving to Claude Code)

> **Status:** Working checklist (2026-07-12). Everything to **confirm and freeze in the docs now**, so the Claude Code build starts from a settled spec and we avoid rework. ✅ = already decided (recorded elsewhere) — confirm still true. ❓ = needs the founder's explicit confirmation. ⏭ = deliberately deferred (confirm defer).
> **How to use:** we walk the ❓ items, mark each confirmed, and this becomes the "source of truth" the build follows.

---

## A. Scope of v1
- ❓ **Agree the v1 scope line** (Doc 28 §1 — the "Commercial Bid Engine"; IN/OUT lists).
- ❓ **First client / design partner** — do we have one in mind? Their **deal types shape scope** (e.g. if they're framework-volume, we pull that Doc 26 refinement into v1).
- ⏭ Contract Tracking + ERP, Marketplace, Model Builder, market-intelligence, complex-case refinements — **deferred to v1.x/v2** (confirm).

## B. Core data-model locks (cheapest to fix now)
- ❓ **Phase model** — number of phases, contiguous?, where phase dates live [Doc 10 §4.1 / Doc 17 B.3.1].
- ❓ **Tri-series recognition DEFAULT** — pick the default recognition behaviour + which options are configurable [Doc 10 §4.2].
- ❓ **Core entity spine** — confirm: `Deal, Scenario, EstimateLine, Model(Definition/Instance), Product, Account, Party, Phase, Risk`.
- ⏭ **Contract-lot** as a first-class child of the opportunity — **defer to v2** (v1 = one business case per deal)? [Doc 26 §8].
- ⏭ **Party roles** — v1 = single customer per deal; multi-role (payer≠requester) **deferred** [Doc 14 §4a]?
- ✅ **Multi-tenancy** = `organisation_id` + Postgres RLS. Confirm.
- ✅ **Snapshot-on-use (C1)** convention. Confirm.

## C. Financial / calculation confirmations
- ❓ **v1 model library** — confirm the six: one-time, monthly/annual recurring, consumption, **tiered (absolute-band)**, %-of-metric, **EMV risk**.
- ✅ **CAPEX/OPEX = category default + per-cost override ("Option B").** Confirm.
- ✅ **Tax = Amount × Tax Rate** (no tax models). Confirm.
- ✅ **Deal Score** formula (Doc 19) + **Win-Probability** approach (Doc 23, smart default → history). Confirm.
- ❓ **Win-prob starting default** — the initial default curve/params before history exists (a starting assumption).
- ⏭ **Currency** — v1 = base currency + simple conversion; **full multi-currency/FX deferred**?
- ⏭ **Financial Standards depth** (NPV/discount curves, inflation schedules) — v1 = a few flat defaults; **full engine deferred**?

## D. Lifecycle
- ❓ **v1 lifecycle stages + gates** — confirm which stages ship and the allowed transitions (Qualification → Pipeline → Estimations → Forecast → Simulation → Approval → Outcome → Done).
- ⏭ **Scenario organising layer** (dimensions, bulk/parametric generation) — **deferred**; v1 = basic scenarios + Battle + basic approval-round versioning?

## E. Tech / infrastructure
- ✅ **Stack** (Doc 07): TypeScript, NestJS, Next.js/React, PostgreSQL, Prisma, BullMQ, S3, pgvector, WorkOS, REST+OpenAPI, Docker, Terraform, GitHub Actions, OpenTelemetry/Sentry. Confirm as-is for v1.
- ✅ **Repo** `sk3llyai/skelly`; **domain** `skelly.ai`. Confirm; agree monorepo layout.
- ❓ **Cloud + accounts** — AWS confirmed? Who creates the AWS/WorkOS/etc. accounts + holds billing/secrets (a **human-only** step).
- ❓ **Managed Postgres** choice (RDS vs Aurora vs Neon/Supabase for speed) + **single region** for v1.
- ❓ **Auth** — WorkOS for SSO/enterprise; confirm the v1 role set (RBAC baseline).

## F. Ways of working (founder + Claude)
- ❓ **Build environment** — move active build to **Claude Code on `sk3llyai/skelly`** (recommended); these docs remain the living spec.
- ❓ **Human-only tasks owner** — who runs deploys, creates service accounts, manages secrets/DNS, tests in real environments (things Claude cannot do).
- ❓ **Engineering review** — decision on bringing in an **experienced engineer for review/security** before the system holds a real client's data (see §capability discussion in chat / Doc 28 §8).
- ❓ **Testing/CI bar** — confirm CI gate + engine test coverage expectations from day one.

## G. Product / brand
- ✅ **Name** Skelly. Confirm.
- ❓ **Compliance needs from target clients** (data residency, security questionnaires, SSO) that must shape architecture *now* rather than later.

---

## Immediate use
Confirm the ❓ items (and confirm the ⏭ defers), and we freeze this as the build's source of truth. Anything unresolved here is either (a) locked now, or (b) explicitly marked "decide during build" so it doesn't silently cause rework.
