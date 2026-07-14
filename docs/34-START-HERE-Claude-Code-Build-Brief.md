# 34 — START HERE: Claude Code Build Brief

> **Purpose:** the first thing to read when the build moves to Claude Code (`sk3llyai/skelly`). Place this + the whole `skelly-docs/` folder in the repo. Suggest also copying the "Ways of working" + "Terminology" + "First task" sections into a root `CLAUDE.md`.
> **Golden rule:** the docs are the spec. When in doubt, follow the **Decision Log (08)**, **v1 Scope (32)**, and **Tracker (33)**. Do not silently deviate — if a decision is missing, ask, decide, and record it in Doc 08.

---

## 1. What Skelly is (one paragraph)
Skelly is an enterprise **commercial/financial operating system for bid & tender teams**. It turns a bid into a structured business case — modelling costs, revenue, risk and tax into three monthly series (Value, Cash Flow, P&L), across strategy **scenarios**, with **win-probability** simulation, an iterative **approval** flow, **outcome** capture, and a **portfolio** intelligence layer that aggregates every deal. Full vision: Doc 03. Never lose sight of the Financial Philosophy: **auditable, explainable, no black boxes.**

## 2. Non-negotiable rules (read first)
- **Engineering Constitution (02)** — 17 principles (long-term, enterprise-first, single source of truth, modularity, security-by-design, testing, DDD, explainability…).
- **Methodology (05)** — explain reasoning + trade-offs before coding; no jumping to code.
- **Security-by-design (13, Arch §7)** — multi-tenancy via `organisation_id` + Postgres RLS from day one; audit; least privilege.
- **Every decision gets recorded** in the Decision Log (08).

## 3. Locked stack & architecture
- **Stack (07):** TypeScript (strict) · Node LTS · **NestJS** (backend) · **Next.js/React** (frontend) · **PostgreSQL + Prisma** · BullMQ · S3 · pgvector · **WorkOS** (auth/SSO) · REST+OpenAPI · Docker · Terraform · GitHub Actions · OpenTelemetry/Sentry.
- **Architecture (06):** modular monolith, layered (Client→API→Domain→Platform/Async→Data), domain modules with CI-enforced boundaries, multi-tenant + RLS, snapshot-on-use (C1), archive-not-delete, audit logging.
- **Managed Postgres:** start Neon/Supabase for speed → RDS/Aurora for prod. **Cloud:** AWS.

## 4. What we're building (v1 scope — LOCKED)
- **Authoritative scope:** Doc **32**. **Page/feature inventory + build tracker:** Doc **33**.
- **In v1:** foundations (auth, tenancy, RBAC, audit); **calculation engine + core models** (the heart); Products; **Solutions** (first-class); Accounts; full **bid lifecycle** (Qualification→Pipeline→Estimations→Forecast→Simulation→Approval→Outcome→Done); **Scenarios** (parallel + approval-round versions) + Battle; full **4-method cost/revenue attribution** (incl. custom); **Comments/Tasks (full)** + **Notifications/Reminders**; **Deadlines/Timeline**; **Portfolio Dashboard** (full) + Companion/Analysis-Builder/Target-Performance (**lean**); Marrow-lite; view-builder; CSV import; export (PDF/slides).
- **Deferred (⏭) but MUST stay enabled by the architecture:** **Model Builder** (user-authored models) and **Contract Tracking + ERP**. Build the seams now (Doc 32 "Architectural enablers"): definition-driven calc engine (`ModelDefinition` registry; core models = seeded definitions); per-deal project/cost-object code; financial data keyed by deal·category·phase·month so an `actuals` series can sit beside `forecast`; ingestion interface behind the CSV import; stable category taxonomy.
- Also deferred: marketplace, scenario organising layer, contract lots, multi-party roles, revenue-share model, full FX/Financial-Standards depth, balance sheet, richer access, full AI agents.

## 5. Build order (bottom-up, NOT lifecycle order) — Doc 28/33
0. **Setup** — repo, CI/CD, envs, WorkOS auth, tenancy(RLS) skeleton, deploy pipeline.
1. **Walking skeleton** — deal → cost → forecast through every layer.
2. **Calculation engine + core models** ⭐ — tri-series, phases, adjustments, dependency DAG, the 6 models; heavy tests + explainability.
3. **Foundational modules** — Company Parameters, Products, Solutions, Accounts.
4. **Deal workspace + Estimations + Forecast** — lifecycle, Qualification + Deal Score, Estimations, Forecast.
5. **Scenarios + Simulation + Win Probability.**
6. **Approval + Outcome + Pack Builders + workflow.**
7. **Marrow + dashboards + Portfolio** (Dashboard full; Companion/Analysis/Target lean) + Notifications/Deadlines.
8. **Hardening + onboarding** — security review, RLS checks, performance, audit, CSV import, first-client data.

Each phase ends **tested, secure, demoable**. Update the **Status column in Doc 33** as you go.

## 6. Terminology locks (do not conflate)
- **Model** = a calculation engine (cost / risk / revenue) *only*.
- **Template** = a **Pack-Builder** layout (Qualification/Approval pack style per company).
- **Phase** = a timeline-period entity models reference for timing.
- **Scenario** = a parallel strategy version; each has a **linear history of approval-round snapshots** (a round snapshot = the *entire* scenario state, not just metrics). "Organising layer" (auto-generate/tag many scenarios) is ⏭ v2.
- **Marrow** = the governed data catalog/semantic layer (backend). **Companion** = Marrow's user-facing surface (+ AI).
- **Tri-series** = the Value / Cash Flow / P&L monthly series every model outputs.

## 7. Core entity spine (confirm/extend in Phase 0)
`Deal, Scenario, EstimateLine, Model(Definition/Instance), Product, Solution, Account, Party, Phase, Risk` — plus `Organisation, User, Role, Category(taxonomy), Task, Comment, Notification, KeyDate`. All tenant-scoped (`organisation_id` + RLS), audited, soft-deleted.

## 8. Key domain references (when building each area)
- Calc engine + models: **10** · Cost/Revenue/Product interaction (+4-method attribution): **21** · Products: **11** · Accounts: **14**
- Bid lifecycle (all stages): **17** · Qualification scoring (Deal Score): **19** · Win probability: **23** · Scenarios: **12** (+ plain guide **27**)
- Portfolio (Dashboard/Companion/Analysis/Targets): **31** · Living Platform Model (reusable engines): **15** · AI: **18**
- Onboarding/import: **24** · Security: **13** · Complex cases (v2 refinements): **26**

## 9. First task (Phase 0) — what to do in the first session
1. **Human-only setup (founder, with step-by-step help):** create AWS + WorkOS accounts; create/confirm `sk3llyai/skelly` repo access; hold secrets. Claude cannot do these.
2. **Scaffold:** monorepo (apps/api NestJS, apps/web Next.js, packages/shared), Prisma + Postgres, Docker, GitHub Actions CI (typecheck+lint+test), env config, one deploy to staging.
3. **Foundations:** WorkOS auth login; `Organisation`/`User`/`Role`; multi-tenancy with **RLS** proven by a test.
4. **Exit demo:** log in to an empty, multi-tenant, deployed shell. Flip Doc 33 Phase 0 → ✅.

## 10. Ways of working in the build
- Small, tested increments; CI green before moving on. The **calc engine gets the heaviest tests** (financial correctness is the product).
- Prefer configuration/data over hardcode (esp. models = definitions).
- **Record decisions** in Doc 08; **update progress** in Doc 33.
- Bring an **experienced engineer for security + correctness review before any real client data** goes in (founder to arrange — Doc 28 §8).

---
*This brief + `skelly-docs/` = everything needed to start. Begin at Phase 0.*
