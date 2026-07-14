# 33 — v1 Feature & Page Inventory + Build Sequence (Progress Tracker)

> **Status:** Living tracker (2026-07-12). **Part 1** = every page/feature you'll see in v1 (so you know what we're building). **Part 2** = the order we build it, with a status column to track progress. **Part 3** = what's intentionally *not* in v1.
> **Depth:** ✅ full · ◐ lean (first cut, expands later). **Status key:** ⬜ not started · 🟨 in progress · ✅ done. Update the Status column as we build.
> **Source of truth:** scope = Doc 32 · build order/effort = Doc 28 · open items resolved = Doc 30.

---

# PART 1 — What you'll see in v1 (page & feature inventory)

## 1. App shell & access
| Page / feature | Depth | What it is |
|---|---|---|
| Login / SSO | ✅ | WorkOS sign-in (enterprise SSO ready) |
| Global navigation shell | ✅ | Sidebar + top bar; the frame every module lives in |
| Home / landing | ◐ | Simple landing (quick links, recent deals) |
| User & role management | ✅ | Invite users; roles Admin/Manager/Contributor/Viewer |

## 2. Company setup (admin)
| Page / feature | Depth | What it is |
|---|---|---|
| Company Parameters — Org & Users | ✅ | Company profile, users, roles |
| Taxonomy management | ✅ | Categories (with P&L + cash-flow class, CAPEX/OPEX), deal types, and other managed lists |
| Financial Standards | ◐ | Flat inflation default; payment terms sourced from Account |
| Pack Templates | ◐ | A default Qualification/Approval pack layout; company-specific styling follows |

## 3. Products
| Page / feature | Depth | What it is |
|---|---|---|
| Products list | ✅ | All products |
| Product workspace — Cost/Revenue table (estimate lines) | ✅ | Build a product's standard costs & revenues via the model engine |
| Product — Phasing | ✅ | Timeline phases for the product |
| Product — Assumptions · Attachments | ✅ | Notes/assumptions + files |
| Product — Dashboard | ✅ | Customisable view over the product |
| Standard Costs / Standard Pricing | ✅ | Reusable priced building blocks |
| Cost→product attribution / shared-cost split — **full 4-method** | ✅ | pro-rata by revenue · pro-rata by direct cost · equal · **custom** (manual %); same 4 for revenue |

## 3b. Solutions (first-class section — bundle of products)
| Page / feature | Depth | What it is |
|---|---|---|
| Solutions list | ✅ | All reusable product bundles (own section, like Products/Accounts) |
| Solution workspace — Estimation + Forecast | ✅ | A bundle of products with its own aggregated estimation/forecast (reuses the deal engines) |
| Solution → deal prefill (Standard Solution) | ✅ | A saved Solution can prefill a real deal |

## 4. Accounts (CRM-lite)
| Page / feature | Depth | What it is |
|---|---|---|
| Accounts list | ✅ | All customers/accounts |
| Account workspace — Dashboard | ✅ | Customisable view of the account |
| Account — Performance Tracking | ✅ | All bids with this account (win rate, value) |
| Account — Assumptions · Attachments | ✅ | Notes + files |
| Payment terms & currency | ✅ | Source of customer terms/currency for deals |

## 5. Models (calculation engine content)
| Page / feature | Depth | What it is |
|---|---|---|
| Model library (view) | ✅ | The core calculation models available (one-time, recurring, consumption, tiered, %-of-metric, EMV risk) |
| *(Model Builder — user-authored models)* | ⏭ | **Not in v1**, but the engine is built to allow it later |

## 6. Bid Engine — the deal lifecycle (the core)
| Page / feature | Depth | What it is |
|---|---|---|
| Opportunity list | ✅ | Entry point — all opportunities/bids |
| Deal workspace shell + lifecycle bar | ✅ | The container a deal moves through |
| **Qualification** — Identification scorecard + Evaluation Criteria + **Deal Score** | ✅ | Decide pursue/decline; the qualification scoring |
| **Qualification Pack Builder** | ✅ | Assemble the qualification pack |
| **Pipeline** — Benchmark / Prefill | ◐ | Manual prefill from standard products, templates, standard solutions, **and similar/historical bids**; only the AI auto-select-all agent is later |
| **Estimations** — Phasing · Cost · Risk · Tax | ✅ | Build the cost/risk/tax base |
| **Forecast** — Revenue · P&L · Cash Flow | ✅ | The business-case output (tri-series) |
| **Simulation** — Bid Simulator + **Win Probability** | ✅ | Test prices; win-probability model (competitor modelling lean) |
| **Approval** — Approval Pack Builder + rounds + matrix-lite | ✅ | Present, get feedback, rework rounds, approve |
| **Outcome** — 5 sections (win/loss capture) | ✅ | Record result + retrospective |
| **Done** — historical/internal deal | ✅ | Completed deal, retained for reuse |
| Comments & Tasks — **full** | ✅ | Comments + threads + @mention, tasks (assign/due/complete), notifications, activity feed, reminders |
| **Deal key dates & deadline reminders** | ✅ | RFI/tender/clarification/presentation/award dates on a deal, with automated reminders |

## 7. Scenarios (within a deal)
| Page / feature | Depth | What it is |
|---|---|---|
| Scenario management (create/copy/toggle) | ✅ | Parallel scenarios (Base, Aggressive…) |
| Approval-round versioning | ✅ | Each scenario's linear history of approval-round snapshots |
| Scenario Battle (compare) | ✅ | Head-to-head metric comparison |
| *(Organising layer — auto-generate/tag/grid many scenarios)* | ⏭ | **Not in v1** |

## 8. Portfolio Level (executive layer)
| Page / feature | Depth | What it is |
|---|---|---|
| **Portfolio Dashboard** | ✅ | Live, customisable exec dashboards across all deals; filters, drill-down, saved team layouts, scenario-aware |
| **Companion** (platform-wide) | ◐ | Browse/drag/reuse any Skelly data + basic AI suggestions (conversational + write-back later) |
| **Analysis Builder** | ◐ | Build reports/tables across all opportunities + export (full pivot + AI report-gen later) |
| **Target / Performance** | ◐ | Company targets vs forecast/actual + progress (alerts + initiatives later) |

## 9. Cross-cutting
| Page / feature | Depth | What it is |
|---|---|---|
| Marrow (data catalog) | ◐ | The internal layer powering tables/dashboards/packs/portfolio (full governance later) |
| **Notifications / Reminders engine** | ✅ | In-app + email notifications, activity feeds, task + deadline reminders |
| **Portfolio Timeline / Calendar** | ✅ | Key dates across all bids in a calendar/timeline view |
| Customisable tables / dashboards | ✅ | The reusable view-builder used everywhere |
| Export (PDF + basic slides) | ◐ | Export packs/reports |
| Onboarding / historical import (CSV) | ◐ | Import past deals to seed win-probability |
| SkellyAI assist | ◐ | A few assist features (full agentic later) |

---

# PART 2 — Build sequence & progress tracker

Built **bottom-up** (foundations → engine → modules → portfolio → hardening), not in lifecycle order. Each phase ends with something demoable. *(Durations: Doc 28. Calendar depends on pace; we track by phase/milestone.)*

| Phase | What we build | Milestone / demo | Status |
|---|---|---|---|
| **0 — Setup** | Repo scaffold, CI/CD, dev+staging envs, WorkOS auth, tenancy (RLS) skeleton, deploy pipeline | Log in to an empty deployed shell | 🟨 scaffold + CI + shared-contract seam done (green locally); auth/RLS/deploy remain |
| **1 — Walking skeleton** | One deal → one cost → a forecast number, through every layer | Create a deal, add a cost, see a computed number | ⬜ |
| **2 — Calculation engine + core models** ⭐ | Tri-series engine, phases, adjustments, dependency DAG, the 6 models, recognition; heavy tests | Model real costs/revenue/risk → correct Value/Cash/P&L | ⬜ |
| **3 — Foundational modules** | Company Parameters (taxonomy/users), Products (+phasing), Accounts | Set up a company, products, a customer | ⬜ |
| **4 — Deal workspace + Estimations + Forecast** | Opportunity list, deal shell + lifecycle, Qualification + Deal Score, Estimations, Forecast | Build a full business case for a real bid | ⬜ |
| **5 — Scenarios + Simulation + Win Prob** | Copy-on-write scenarios + Battle, bid simulator, win probability | Compare strategies + get a win probability | ⬜ |
| **6 — Approval + Outcome + Pack Builders** | Qualification/Approval pack builders, approval rounds + matrix-lite, Outcome, Done | Take a bid through approval → record outcome | ⬜ |
| **7 — Marrow + dashboards + Portfolio** | Marrow-lite, view-builder, Portfolio Dashboard, Companion-lean, Analysis Builder-lean, Target/Performance-lean, export | Build a portfolio dashboard + a cross-deal report | ⬜ |
| **8 — Hardening + onboarding** | Security review, RLS/tenant-isolation checks, performance, audit, CSV import, load first-client data | Secure, tested system with real data | ⬜ |

**Milestone map:** M1 skeleton (Ph1) · M2 engine computes (Ph2 — first credible demo) · M3 full business case (Ph4 — design-partner-usable) · M4 full commercial workflow (Ph6) · M5 client-ready v1 (Ph8).

---

# PART 3 — Deliberately NOT in v1 (fast-follow / v2)
Model Builder (user-authored models) · Contract Tracking + ERP integration *(both with enabling seams built into v1)* · Marketplace/App Exchange · scenario organising layer · contract-lot partition · multi-party roles · revenue-share model · billable-entity population · full multi-currency/FX · Financial-Standards depth (NPV/discount) · Balance Sheet · Competitors/public-bid ingest · richer access model · full Companion/Analysis-Builder/Target-Performance depth · full AI agents.

*Everything here is logged in the docs and slots on top of v1 without a rewrite.*

---

## How to use this tracker
As we build in Claude Code, we flip each phase's **Status** ⬜→🟨→✅ and check off features. This doc stays the single place to see "what's in v1" and "where we are."
