# 28 — Build Roadmap to a Client-Ready v1

> **Status:** Delivery plan (2026-07-12). The staged path from today's design set to a **v1 we can put in front of a first client**. Pairs with the Architecture (Doc 06), Stack (Doc 07), Methodology (Doc 05), and the module specs.
> **Honesty up front:** "exact" dates are impossible to promise — the calendar is dominated by **how many engineers work on this and when they join**. This plan gives the **stages, the effort each takes, milestones, and two resourcing scenarios**. Treat durations as informed estimates, not guarantees. We manage to **milestones**, not a fixed date.

---

## 1. What "v1 for the first client" actually is (the most important section)

**v1 is not the whole vision.** It is the **Commercial Bid Engine**: a team can take a real bid from qualification → an approved, submitted business case → recorded outcome, modelling costs/revenue, scenarios, and win probability along the way. That is Skelly's wedge and it is genuinely compelling on its own.

**IN scope for v1**
- **Foundations:** WorkOS auth/SSO, multi-tenancy (`organisation_id` + Postgres RLS), basic RBAC, audit log, soft-delete, file attachments, CI/CD, one-click deploy.
- **Company Parameters (lean):** taxonomy engine (categories with P&L/cash-flow class + CAPEX/OPEX), users/roles. Minimal Financial Standards (a few defaults).
- **Calculation Engine + core Models (the heart):** tri-series (Value/Cash-Flow/P&L), timing primitives, adjustments (inflation, payment terms), model dependency DAG, and the core model library — one-time, monthly/annual recurring, consumption, **tiered (absolute-band)**, %-of-metric, **EMV risk**. Recognition defaults.
- **Products (lean):** product + cost/revenue estimate lines (Standard Costs/Pricing minimal), Phasing.
- **Accounts (CRM-lite):** customer + payment terms + currency (single-customer; multi party-role deferred unless the first client needs it).
- **Deal / Bid workspace + lifecycle state machine:** Qualification → Pipeline(benchmark-lite) → Estimations → Forecast → Simulation → Approval → Outcome → Done.
- **Estimations:** Phasing, Cost, Risk, Tax.
- **Forecast:** Revenue, P&L, Cash Flow (the business-case output).
- **Scenarios:** copy-on-write, toggle, Scenario Battle compare; basic approval-round versioning.
- **Simulation + Win Probability + Deal Score:** the persistent progressive win model (smart default → history) + basic bid simulator + qualification scoring.
- **Approval:** pack builder (reusing tables/export), rounds, matrix-lite; export to PDF/slides.
- **Outcome:** the 5 sections (win/loss capture).
- **Marrow-lite:** customisable tables/dashboards over deal data (full governance later).
- **Onboarding import (partial):** CSV import of historical deals to seed win-probability (cold-start).

**OUT of v1 (fast-follow v1.x / v2)** — deliberately deferred to stay focused:
- **Contract Tracking + ERP integrations** (founder not finalised; large — Doc 17 B.8).
- **Marketplace / App Exchange** (Doc 25).
- **Public-bid database / market intelligence** auto-ingest (Doc 16).
- **Full Model Builder + formula engine** (user-authored models) — ship core models as config first (Doc 10 §4.6).
- **Scenario organising layer** (dimensions, parametric/bulk generation), **contract-lot partition**, **revenue-share model**, **billable-entity population** (Doc 26 refinements) — unless the first client demands one.
- **Advanced AI agents** — keep AI minimal/assistive in v1 (one or two assist features max).
- **Full multi-currency/FX + Financial Standards depth** (NPV/discount curves) — base currency + simple conversion only.

*Scope is tunable to the first client: if they live or die on (say) framework-volume deals, we pull the relevant Doc 26 refinement forward and push something else back.*

---

## 2. The build principle — layer by layer, NOT lifecycle order

The bid lifecycle (Qualification→Outcome) is the **user's** order. The **build** order is **bottom-up**: foundations → calculation engine → shared engines → modules → polish. Building "Qualification first" would fail — it depends on the calc engine, scenarios, tenancy, taxonomy and Marrow. Each phase ships **tested and secure** (Constitution: testing + security-by-design), and each produces a **demoable increment**.

---

## 3. The phases

| # | Phase | Goal / key deliverables | Effort (eng-weeks) | Demoable at exit |
|---|---|---|---|---|
| **0** | **Pre-build lock & setup** | Settle the few core data-model decisions (§6); scaffold repo, CI/CD, dev + staging envs, WorkOS auth, tenancy(RLS) skeleton, deploy pipeline. | **2–4** | Log in to an empty, multi-tenant, deployed shell. |
| **1** | **Walking skeleton (the spine)** | One deal → one cost line → a forecast number, end to end through every layer. Proves the stack + the calc-engine contract. | **3–5** | Create a deal, add a cost, see a computed forecast. |
| **2** | **Calculation Engine + core Models (the heart)** ⭐ | Full tri-series engine, timing primitives, adjustments, dependency DAG, core model library; heavy unit/property tests + explainability. | **6–10** | Model real costs/revenue/risk and get correct Value/Cash/P&L series. |
| **3** | **Foundational modules** | Company Parameters (taxonomy/users), Products (estimates + phasing), Accounts (CRM-lite). | **4–6** | Set up a company, products, and a customer. |
| **4** | **Deal workspace + Estimations + Forecast** | Bid workspace + lifecycle state machine; Phasing/Cost/Risk/Tax → Revenue/P&L/Cash-Flow business case. | **6–8** | Build a full business case for a real bid. |
| **5** | **Scenarios + Simulation + Win Probability + Deal Score** | Copy-on-write scenarios + Battle; bid simulator; win-prob model; qualification scoring. | **5–7** | Compare strategies and get a win probability + deal score. |
| **6** | **Approval + Outcome + workflow** | Approval pack + rounds + matrix-lite + export (PDF/slides); Outcome capture; lifecycle gates. | **4–6** | Take a bid through approval and record its outcome. |
| **7** | **Marrow-lite + dashboards/reporting** | Data catalog service (internal), customisable tables/dashboards, pack builder reuse. | **3–5** | Build a custom dashboard/report over deal data. |
| **8** | **Hardening + first-client onboarding** | Security review + pen-test prep, RLS/tenant-isolation verification, performance, audit, polish, import the client's historical data. | **4–6** | A secure, tested system loaded with the client's data. |

**Sequential effort total ≈ 37–57 eng-weeks** (midpoint ~46). Cross-cutting work (security, testing, DevOps, docs) runs *inside* every phase, not after.

---

## 4. Two resourcing scenarios (the honest calendar)

- **Lean path — founder + Claude/AI (+ maybe one part-time engineer).** Mostly sequential; AI accelerates code but review/decisions are the bottleneck. **≈ 10–14 months** to a client-ready v1. A **demoable core** (through Phase 4) at **~4–6 months**.
- **Resourced path — 2–3 focused engineers + AI.** Phases 3–7 parallelise (engine vs modules vs UI). **≈ 6–9 months** to client-ready v1. Demoable core at **~3 months**.

**Recommendation:** aim for the resourced path *by Phase 3* — the heart (Phase 2) is best built by a tight group (even 1–2 strong engineers + AI) to protect quality, then widen the team once the engine is proven.

---

## 5. Milestones a first client can see (de-risking by showing progress)

1. **M1 — Walking skeleton (end Ph1):** the spine works. Internal confidence.
2. **M2 — The engine computes (end Ph2):** real financial modelling. *First credible demo.*
3. **M3 — A full business case (end Ph4):** a real bid modelled end to end. **Design-partner-usable slice.**
4. **M4 — Strategy + approval (end Ph6):** scenarios, win prob, approval, outcome — the whole commercial workflow.
5. **M5 — Client-ready v1 (end Ph8):** secure, tested, loaded with the client's data.

**Strong advice:** sign a **design-partner client early** (even now), so the build is validated against real needs and your "first client" relationship is forming *during* the build — not hunted for after it. Their real deals become our test cases.

---

## 6. Pre-build locks (Phase 0 checklist — cheap now, costly to retrofit)
Not everything must be answered, but these touch the core data model:
- **Phase model** — finalise (count, contiguity, where dates live) [Doc 10 §4.1 / Doc 17 B.3.1].
- **Tri-series recognition defaults** — confirm the default + configurable options [Doc 10 §4.2].
- **Contract-lot vs Scenario shape** — is a "lot" a first-class child of the opportunity? [Doc 26 §8].
- **Core entity model** — Deal, Scenario, EstimateLine, Model, Product, Account, Party — confirm the spine.
- **Tenancy/RBAC baseline** — roles for v1 (already: org_id + RLS; confirm role set).
Everything else (scenario organising layer, ERP mapping, marketplace) is deferred and does **not** block Phase 0.

---

## 7. Cross-cutting workstreams (run through every phase)
- **Security-by-design** — tenant isolation, RLS, least privilege, audit; external review before v1 (Doc 13).
- **Testing** — unit/property tests on the engine, integration tests on flows, seeded fixtures; CI gate.
- **DevOps** — CI/CD, IaC (Terraform), staging + prod, observability (OpenTelemetry/Sentry) from Phase 0.
- **Design-partner feedback loop** — demo each milestone; fold learnings back.

---

## 8. Top risks + mitigations
- **Scope creep (biggest).** The 27-doc vision is huge. → Hold the v1 line in §1; log everything else for later (we already do).
- **Calc-engine complexity/correctness.** The heart is intricate. → Build it early (Ph2), test it hardest, keep explainability first-class.
- **Solo pace.** Founder + AI is powerful but decision-bandwidth-limited. → Bring 1–2 engineers by Phase 3; keep decisions crisp via the Decision Log.
- **Environment.** Production build needs a real repo/CI. → Move the build to **Claude Code on `sk3llyai/skelly`**; keep Cowork as the living spec.
- **Enterprise-readiness bar.** Buyers demand security/SSO/audit. → These are in from Phase 0, not bolted on.

---

## 9. Immediate next steps (first 30/60/90 days)
- **Days 0–30:** Phase 0 — pre-build locks (§6), scaffold repo + CI + auth/tenancy on `sk3llyai/skelly`; move active build to Claude Code.
- **Days 30–60:** Phase 1 walking skeleton; begin Phase 2 engine.
- **Days 60–90:** Phase 2 core engine + first credible demo (M2); line up a design-partner client.

## 10. Cross-references
- Architecture + build order — Doc 06 · Stack — Doc 07 · Methodology — Doc 05
- Calc engine/models — Doc 10 · Bid Engine — Doc 17 · Scenarios — Doc 12
- Win prob — Doc 23 · Qualification scoring — Doc 19 · Security — Doc 13
- Complex-case refinements (v2 candidates) — Doc 26 · Decision Log — Doc 08
