# 32 — v1 Scope Definition (the line we ship to Claude Code)

> **Status:** Proposed v1 scope for confirmation (2026-07-12). This is the **authoritative feature line** for the first client-ready build. Once confirmed, this + Doc 28 (roadmap) + Doc 30 (resolved loose ends) = the build spec.
> **Legend — inclusion:** ✅ **v1-full** · ◐ **v1-lean** (a reduced first cut, expand later) · ⏭ **fast-follow / v2**.
> **Legend — build cost:** 🟢 cheap (assembles existing/simple) · 🟡 medium · 🔴 heavy.
> **Principle:** keep the **deal-level spine full and correct**; be selective on the **heavy new tools**; lean on the fact that much of the platform reuses shared engines.

---

## A. Foundations — all ✅ v1 (non-negotiable)
| Feature | In | Cost |
|---|---|---|
| WorkOS auth / SSO | ✅ | 🟡 |
| Multi-tenancy (`organisation_id` + Postgres RLS) | ✅ | 🟡 |
| RBAC — roles Admin/Manager/Contributor/Viewer | ✅ | 🟢 |
| Audit log · soft-delete · file attachments | ✅ | 🟢 |
| CI/CD · IaC (Terraform) · observability (OTel/Sentry) | ✅ | 🟡 |
| Core data model (Deal, Scenario, EstimateLine, Model, Product, Account, Party, Phase, Risk) | ✅ | 🟡 |

## B. Company setup
| Feature | In | Cost | Note |
|---|---|---|---|
| Taxonomy engine (categories w/ P&L + cash-flow class, CAPEX/OPEX; deal types) | ✅ | 🟡 | |
| Users & roles | ✅ | 🟢 | |
| Financial Standards (flat inflation default, payment terms from Account) | ◐ | 🟢 | full NPV/discount/FX ⏭ |
| Pack **Templates** (company Qualification/Approval pack style) | ◐ | 🟡 | ship default template; custom-per-company authoring can follow |

## C. Calculation engine + Models — the heart, ✅ v1
| Feature | In | Cost |
|---|---|---|
| Tri-series engine (Value / Cash Flow / P&L) | ✅ | 🔴 |
| Timing primitives + Phases | ✅ | 🟡 |
| Adjustments pipeline (inflation, payment terms) | ✅ | 🟡 |
| Model dependency DAG (cycle-safe) | ✅ | 🟡 |
| Core model library — one-time, monthly/annual recurring, consumption, tiered(absolute-band), %-of-metric, EMV risk | ✅ | 🟡 |
| Recognition methods (Point-in-time, Straight-line, Milestone, Custom) | ✅ | 🟡 |
| **Model Builder / formula engine (user-authored models)** | ⏭ | 🔴 | ship core models as config first |

## D. Products
| Feature | In | Cost | Note |
|---|---|---|---|
| Product + cost/revenue estimate lines (Standard Costs/Pricing) | ✅ | 🟡 | |
| Phasing | ✅ | 🟢 | |
| Product dashboard (view-builder) | ✅ | 🟢 | reuses engine |
| Cost→product attribution / shared-cost allocation — **full 4-method** | ✅ | 🟡 | **Upgraded to full (founder, 2026-07-12):** pro-rata by revenue · pro-rata by direct cost · equal · **custom** (manual %; hand-editing any method → custom). Same 4 for revenue attribution. |
| **Solutions — first-class section** (bundle of products) | ✅ | 🟡 | **Upgraded (founder):** own top-level section like Products/Accounts; a Solution = a reusable **bundle of products** with its **own Estimation + Forecast** (reuses the deal engines); becomes a **Standard Solution** prefill source. Mostly assembly of existing engines. |

## E. Accounts
| Feature | In | Cost | Note |
|---|---|---|---|
| Account (customer) + payment terms + currency | ✅ | 🟢 | |
| Account dashboard / performance | ✅ | 🟢 | reuses engine |
| Suppliers in Accounts (Type set) | ◐ | 🟢 | |
| **Multi-party roles** (payer ≠ requester, multiple payers) | ⏭ | 🟡 | v1 = single customer |

## F. Deal / Bid lifecycle — ✅ v1 spine
| Feature | In | Cost | Note |
|---|---|---|---|
| Opportunity list + Deal workspace + lifecycle state machine | ✅ | 🟡 | |
| Qualification — Identification scorecard + Evaluation Criteria + **Deal Score** | ✅ | 🟡 | |
| Qualification **Pack Builder** | ✅ | 🟡 | reuses Marrow + export |
| Pipeline — **Benchmark/Prefill** engine | ◐ | 🟡 | v1 = manual prefill from **standard products, templates, standard solutions, AND similar/historical bids** (find-similar on attributes); only the **AI auto-select-all agent** is ⏭ |
| Estimations — Phasing · Cost · Risk · Tax | ✅ | 🟡 | |
| Forecast — Revenue · P&L · Cash Flow (business case) | ✅ | 🟡 | |
| Simulation — Bid Simulator + **Win Probability** | ✅ | 🟡 | competitor modelling ◐ |
| Approval — pack + rounds + matrix-lite + export | ✅ | 🟡 | |
| Outcome — the 5 sections (win/loss capture) | ✅ | 🟢 | |
| **Comments & Tasks — full** | ✅ | 🟡 | **Upgraded to full (founder, 2026-07-12):** comments + **threads** + @mention, tasks (assign/due/complete), **notifications**, **activity feed**, **reminders**. Establishes a reusable **Notifications/Reminders engine** (also powers deadline reminders). |
| **Deadlines & Timeline** ⭐ | ✅ | 🟡 | Deal **key dates** (RFI due, tender submission, clarifications, presentation, expected award) with **automated deadline reminders**; a **portfolio timeline/calendar** view across all bids. Uses the Notifications/Reminders engine. |
| Done — historical/internal state (retained for reuse) | ✅ | 🟢 | |
| **Contract Tracking + ERP integration** | ⏭ | 🔴 | not finalised; v2 |

## G. Scenarios
| Feature | In | Cost | Note |
|---|---|---|---|
| Scenario copy-on-write + toggle | ✅ | 🟡 | |
| Scenario Battle (compare) | ✅ | 🟢 | |
| Approval-round versioning (snapshots) | ✅ | 🟡 | |
| **Scenario organising layer** (dimensions, parametric/bulk generation) | ⏭ | 🔴 | v2 |
| **Contract-lot partition** | ⏭ | 🟡 | v2 |

## H. Cross-cutting engines
| Feature | In | Cost | Note |
|---|---|---|---|
| **Marrow** (data catalog / semantic layer) | ◐ | 🔴 | v1 = internal catalog powering tables/dashboards/packs/portfolio; full governance depth later. Foundational — must be in. |
| Customisable tables / dashboards (view-builder) | ✅ | 🟡 | |
| **Notifications / Reminders engine** | ✅ | 🟡 | Shared service: in-app (+ email) notifications, activity feeds, task + **deadline reminders**. Powers Comments/Tasks, Deadlines, Approval alerts. |
| Export / render (PDF + basic slides) | ◐ | 🟡 | full multi-format later |
| Onboarding / historical import (CSV) | ◐ | 🟡 | for win-prob cold start |
| AI Gateway / SkellyAI | ◐ | 🟡 | v1 = a few assist features; full agentic ⏭ |

## I. Portfolio Level (Doc 31) — founder: v1-important
| Feature | In | Cost | Note |
|---|---|---|---|
| **Portfolio Dashboard** (live customisable exec dashboards, filters, drill-down, saved layouts, scenario-aware) | ✅ | 🟡 | mostly assembles existing engines → strong v1 include |
| Portfolio aggregation engine (pre-aggregation / materialised views) | ✅ | 🟡 | needed for the dashboard at scale |
| **Companion** (Marrow surfaced — browse/drag/reuse data + AI suggestions) | ◐ | 🔴 | v1 = data browser + drag-in + basic suggestions; full conversational + write-back ⏭ · **decision point** |
| **Analysis Builder** (Excel/pivot BI + Salesforce-style AI report-gen + export) | ◐ | 🔴 | v1 = report/table builder + filters + export; full pivot + AI report-gen ⏭ · **decision point** |
| **Target / Performance** (targets vs forecast vs actual, breakdowns, alerts, initiatives) | ◐ | 🔴 | v1 = core targets + progress vs forecast/actual; alerts/initiatives ⏭ · **decision point** |

## I2. Navigation / app sections — completeness check (2026-07-12)
Confirming *every* top-level section (from the screenshots' sidebar) is accounted for:
| Nav section | In | Note |
|---|---|---|
| Home | ✅ | landing/quick links |
| Opportunities / Bids | ✅ | the deal lifecycle (§F) |
| Products · **Solutions** · Accounts | ✅ | work areas (§D, §3b, §E) |
| Dashboard / **Portfolio** | ✅ | Portfolio Dashboard (§I) |
| **Analysis Builder** | ◐ | §I |
| **Targets & Performance** | ◐ | §I |
| **Reports** | ◐ | saved reports/exports library (shares the Analysis Builder + export engines) |
| **Data Explorer** | ◐ | the Companion/Marrow browse surface (search/inspect any data point) |
| **Approvals** (hub) | ◐ | cross-deal approvals **inbox/queue** for approvers (distinct from the per-deal Approval stage) |
| **Simulations** (hub) | ◐ | per-deal Bid Simulator is ✅ (§F); a cross-deal simulations hub is a lean list in v1 |
| **Integrations** | ◐ | settings page; v1 = the **CSV import** connection live, ERP connectors ⏭ |
| **Deadlines / Timeline** | ✅ | key dates + reminders + portfolio calendar (§F, §H) |
| Settings (Company Parameters) · Help | ✅ / ◐ | admin + help |

## J. Explicitly deferred to v2 (confirm defer)
Marketplace/App Exchange · Model Builder/formula engine · Contract Tracking + ERP · full multi-currency/FX · Financial-Standards depth (NPV/discount curves) · Balance Sheet · scenario organising layer · contract lots · multi-party roles · revenue-share model · billable-entity population · Competitors/public-bid ingest · richer access model · Standard Solutions full detail.

---

## ⭐ Decision points — RESOLVED (founder, 2026-07-12)
1. **Analysis Builder** — ✅ **v1-lean** (table/report builder + export; full pivot + AI report-gen ⏭).
2. **Target/Performance** — ✅ **v1-lean** (core targets + progress vs forecast/actual; alerts + initiatives ⏭).
3. **Companion** — ✅ **v1-lean** (browse + drag + basic AI suggestions; conversational + write-back ⏭).
4. **Benchmark/Prefill** — ✅ **v1-lean** (prefill from standard products/templates; AI auto-select agent ⏭).
5. **Model Builder** — ✅ **DEFERRED** — *but architecture MUST enable it later without rework* (see enablers below).
6. **Contract Tracking / ERP** — ✅ **DEFERRED** — *but architecture MUST enable it later without rework* (see enablers below).

## ⭐⭐ Architectural enablers for the deferred items (MUST be designed into v1)
Founder direction: 5 and 6 are strategically important, so v1 must be built so they slot in later with **no core rework**. These seams are **in v1 scope** even though the user-facing features are not:

**For Model Builder (deferred feature) — build the abstraction now:**
- **Definition-driven engine.** The calc engine evaluates models from a **`ModelDefinition`** (input schema + calculation logic + timing/recognition + adjustments), via a **registry/interpreter** — *never* per-model hardcoded logic. (Already the intent, Doc 10 §4.6.)
- **Core models = seeded definitions.** v1's six models are shipped as **data instances** of the same `ModelDefinition` structure a user would later author — so "user-authored" is just more rows, not a new code path.
- **Reserved seams (not built, but not blocked):** a sandboxed **formula evaluator**, **precedent tracing**, **cycle detection**, and **definition versioning** — the data model + engine interfaces leave clean insertion points for these.

**For Contract Tracking / ERP (deferred feature) — leave the hooks now:**
- **Per-deal project/cost-object code** — a nominatable identifier field on the Deal (the anchor ERP actuals will match on). Present in v1 even if unused.
- **Actuals-alongside-forecast data shape.** The financial model stores the monthly tri-series keyed by **deal · category · phase · month** such that an **`actuals`** series can sit beside the **`forecast`** series later with **no restructuring**.
- **Baseline snapshot** — reuse the scenario-snapshot mechanism (the Award-Price scenario is already a snapshot) as the future variance baseline.
- **Integration ingestion boundary** — the **CSV/onboarding import** engine (in v1) is built behind an **ingestion interface** that ERP connectors later implement — same seam, new source.
- **Stable category taxonomy** — keep categories clean/stable so a future **chart-of-accounts → category mapping** is purely additive.

*These enablers cost little now and save a rewrite later — the whole point of designing the boundary before the extension (Constitution: long-term thinking, modularity; ADR-010).*

## Status: v1 scope LOCKED (2026-07-12)
Deal-level spine ✅ full · Portfolio Dashboard ✅ · heavy portfolio tools + prefill ◐ lean · Model Builder + Contract Tracking ⏭ deferred **with enabling seams in v1**. This doc + Doc 28 + Doc 30 = the build spec. **Next: move to Claude Code on `sk3llyai/skelly`.**
