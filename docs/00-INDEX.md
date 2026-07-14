# Skelly — Knowledge Base Index

**Purpose:** This folder is the permanent, authoritative record of Skelly's founding context and engineering decisions. It exists so that no important context lives only inside an AI conversation (Constitution — Principle 14). A fresh session, or any future engineer, can read this folder and understand the company's direction from cold.

**Last updated:** 2026-07-06

---

## How to use this knowledge base

**At the start of any new session working on Skelly**, provide these documents (or attach them to the Skelly project knowledge) so continuity is guaranteed. Read them in order — the numbering is meaningful: governing context first, then decisions, then module specs (added over time).

---

## Document map

### Governing context (the "how we work" layer — provided by the founder, verbatim)
| # | Document | What it is |
|---|----------|------------|
| 01 | `01-Engineering-Partner-Role.md` | The CTO/co-founder role Claude occupies |
| 02 | `02-Engineering-Constitution.md` | The 17 non-negotiable engineering principles |
| 03 | `03-Vision-and-Product-Philosophy.md` | What Skelly is, why it exists, the 10-year ambition |
| 04 | `04-Working-Agreement.md` | How Claude refines the founder's already-designed product |
| 05 | `05-Development-Methodology.md` | The 7-step process every feature follows |

### Engineering decisions (the "what we're building on" layer — produced by the CTO)
| # | Document | What it is |
|---|----------|------------|
| 06 | `06-Technical-Architecture.md` | System architecture blueprint (layers, DDD modular monolith, calc engine, tenancy, security, AI, deployment) + 12 ADRs |
| 07 | `07-Technology-Stack.md` | Concrete technology selections for every layer, with alternatives and rejections |
| 08 | `08-Decision-Log-and-Open-Questions.md` | Running log of decisions made, decisions pending, and next steps |
| 13 | `13-Security-Trust-and-Infrastructure-Simple-Guide.md` | **Plain-English guide** (no coding needed) — how Skelly is built, how security & reliability work, protection from hackers, and the roadmap to enterprise trust (independent review, SOC 2). Founder- and client-friendly. |
| 15 | `15-Living-Platform-Model.md` | **Master catalogue of reusable building blocks** — the shared engines, UI components, services, data, calculations, and conventions used across modules. Enforces reuse (Principles 4 & 7). Updated as new modules appear. |
| 18 | `18-AI-and-Agentic-Readiness.md` | **First-class design principle** — why Skelly's structured DB + AI Gateway + pgvector + explainable calc engine + governed API make it AI- and agent-ready. The "similar historical bids" assistant pattern, agentic guardrails, and the "build every module AI-consumable" rule. |
| 19 | `19-Qualification-Scoring-Model.md` | The Identification Deal Score (0-100) model — 5 dimensions, two-axis Attractiveness×Win-ability matrix, configurable weights, advisory threshold, benchmarking. Built collaboratively with the founder. |
| 20 | `20-Company-Setup-Checklist.md` | Ordered checklist for foundational company accounts (domain skelly.ai, GitHub org sk3llyai, Microsoft 365/email, password manager, 2FA). Operational. |
| 21 | `21-Cost-Revenue-Product-Interaction-Model.md` | **Definitive** model for how cost/revenue/risk/tax lines link to products & revenues: line→product attribution (direct/shared, unified for cost & revenue, 4 methods), cost→revenue allocation, outputs, complex-case validation. |
| 22 | `22-Feasibility-Operating-Cost-and-Scale.md` | **Plain-English** — is Skelly too complex/expensive to run at scale? (No — rich to use ≠ costly to run; the real risks are build effort + AI cost, not scale.) |
| 23 | `23-Win-Probability-Model.md` | Persistent, progressive **win-probability** model — replicate the buyer's weighted scoring → score gaps → probability, blended from a smart default toward calibrated real history; always overridable. Built collaboratively. |
| 24 | `24-Onboarding-and-Historical-Data-Import.md` | First-class **onboarding / historical-bid import** strategy (template + column-mapping + AI extraction + connectors + public-bid auto-fill) → day-one value. |
| 25 | `25-App-Exchange-Marketplace-Strategy.md` | Long-term **marketplace** (Salesforce-AppExchange-style) — third-party modules, rev-share; security is the hard problem; sequence after core. |
| 26 | `26-Complex-Bid-Cases-Stress-Test.md` | **Stress test** of 5 real-world complex deals against the whole platform. Verdict: all executable, architecture holds. Defines the **scenario organising layer** (dimensions/generation/propagation), **two approval shapes** (parallel + linear) + fast-track tier, **contract/lot partition**, **tiered pricing / revenue-share / billable-payer population / party roles**, and a **21-item refinement build-list**. |
| 27 | `27-Scenarios-Versions-and-Approval-Rounds-Plain-Guide.md` | **Plain-English guide** to scenarios vs rounds/versions and the approval loop. Core rule: *Scenarios = the options you choose between (parallel); Rounds = the history of the option you chose (linear).* Includes the tree picture, worked example, and a cheat sheet. |
| 28 | `28-Build-Roadmap-to-v1.md` | **Build roadmap to a client-ready v1.** Defines v1 scope (in/out — the "Commercial Bid Engine"), the layer-by-layer build order, 9 phases with effort estimates, two resourcing scenarios (~6–14 months), milestones, pre-build locks, risks, and 30/60/90 next steps. |
| 29 | `29-Pre-Build-Confirmations-Checklist.md` | **Pre-build confirmations checklist** — everything to freeze in the docs before moving to Claude Code (scope, data-model locks, financial/calc, lifecycle, tech/infra, ways of working). Marked ✅ decided / ❓ needs confirm / ⏭ deferred. |
| 30 | `30-Open-Loose-Ends-Register.md` | **Consolidated register of every open question** across all docs, each with a CTO recommendation, marked [V1] must-resolve / [SOON] / [V2] defer. The walkthrough list we confirm before locking v1 scope. |
| 31 | `31-Module-Portfolio-Level.md` | **Portfolio Level — executive intelligence layer** (Portfolio Dashboard, Companion, Analysis Builder, Target/Performance). The bottom-up payoff that aggregates all deal data; built largely on Marrow + aggregation + view-builder + AI. Founder: **v1-important.** |
| 32 | `32-v1-Scope-Definition.md` | **The authoritative v1 scope line** (LOCKED 2026-07-12). Every feature marked ✅ full / ◐ lean / ⏭ fast-follow + build-cost flag. Includes the **architectural enablers** that keep deferred Model Builder + Contract Tracking/ERP possible without rework. |
| 33 | `33-v1-Feature-Page-Inventory-and-Build-Tracker.md` | **Living progress tracker** — Part 1: every v1 page/feature you'll see (by area, with depth). Part 2: the phase-by-phase build sequence with milestones + a status column. Part 3: what's deliberately deferred. The doc to follow build progress. |
| 34 | `34-START-HERE-Claude-Code-Build-Brief.md` | **The build handoff.** What Skelly is, non-negotiable rules, locked stack/scope, build order, terminology locks, entity spine, doc pointers, and the exact **first task (Phase 0)**. Read first in Claude Code; also seed a root `CLAUDE.md` from it. |

### Module specifications (the "product" layer — added as the founder provides module docs)
| # | Document | What it is |
|---|----------|------------|
| 09 | `09-Module-Company-Parameters.md` | Company Parameters: Org & Users + Taxonomy Management (specified); Financial Standards deferred. Includes ADDENDUM with Portfolio-level structure. |
| 10 | `10-Module-Models-and-Templates.md` | Models & Template Library — the calculation engine's content. Cost/Revenue/Risk/OpEx models analysed; tri-series (Value/Cash/P&L) output, timing primitives, adjustments pipeline, model dependency DAG, hybrid formula engine. Gaps flagged (phases, tax models, tiered revenue, P&L policy). |
| 11 | `11-Module-Products.md` | Products — workspace pattern, **Phasing (resolves calc-engine phase prerequisite)**, dashboard/view-builder (custom-query security flagged), + ADDENDUM 2: Standard Costs & Pricing (the cost/revenue EstimateLine tables), the **Cost/Revenue Creation wizard = the Models engine instantiated** (validates Doc 10), Performance Analysis (deal aggregation). New concepts: Benchmarking, multi-currency, SkellyAI. Only Scenarios detail pending. |

| 12 | `12-Scenarios-and-Deal-Workspace.md` | **Scenarios** (cross-cutting versioning concept — copy-on-write branching, scenario-scoped modelling, Scenario Battle) + **preliminary Deal Workspace / Bid Engine** reveal: the 10-stage bid lifecycle (validates workflow-engine ADR-006), deal resources, Version Control. |
| 14 | `14-Module-Accounts.md` | Accounts (customers) — same reusable Workspace shell (3× confirmed); CRM entity + analytics aggregate; **source of Customer Payment Terms + Preferred Currency** (resolves calc-engine question); Parent-Account hierarchy; Performance Tracking. |
| 16 | `16-Competitors-Market-Intelligence-PRELIMINARY.md` | **Parked** early ideas for Competitors — a UK public-bid intelligence database feeding competitive pricing during Forecasting. CTO input: structured open-data ingestion + AI enrichment, legal notes, benchmark/pgvector/marketplace ties. Revisit after Forecasting. |

| 17 | `17-Module-Bid-Engine.md` | **Skelly Bid Engine** (in progress) — Opportunity List; Part A Deal Resources (Assumptions/Team/Products/Attachments/Scenarios+Battle/Timeline); Part B lifecycle stages: Qualification (Identification scorecard + Pack Builder + gate) and **Pipeline** (Benchmark/Prefill engine). Marrow, UI-swappability, subsection tree. |

*Still to come: Bid Engine stages Simulation, Approval, Outcome, Contract Tracking, Done; Portfolio Dashboard; **Standard Solutions** (first-class entity, built like Standard Products — a bundle/solution); Financial Standards; Company Master P&L/Cash Flow. Competitors parked (Doc 16). (Qualification, Pipeline, Estimations, Forecast now analysed in Doc 17.)*

### Emerging platform map (from the Portfolio Level Resources doc)
- **Core Portfolio Level Resources** (onboarding foundation): **Parameters** (Company Parameters ✅ specified) · **Products** · **Accounts** · **Competitors** · **Models & Templates**
- **Company Parameters** sidebar: Organizations & Users · Taxonomy Management · Cost/Operating-Expense/Risk/Tax/Revenue **Models** (Models = likely calc-model/financial-standard homes)
- **App shell:** Home · Portfolio Dashboard · **Skelly Bid Engine** (the bid workflow) · persistent AI assistant

---

## What Skelly is (one-paragraph orientation)
Skelly is a **commercial operating system for enterprise bid/pursuit teams** — a single intelligent platform that connects people, processes, financial models, historical knowledge and AI so that every commercial decision (which opportunities to pursue, how to price, how to forecast, what risks to weigh) is informed by structured, compounding organisational knowledge rather than scattered spreadsheets. Its defining technical promises are **auditable, explainable financial calculations ("no black boxes")** and **knowledge that compounds over time**. Long-term ambition: become to enterprise commercial teams what Salesforce is to CRM.

## The three decisions that shape everything (see docs 06 & 07)
1. **TypeScript everywhere**, a **modular monolith**, and **managed PostgreSQL** — minimise moving parts today, structured so a team can split it apart tomorrow.
2. **A central calculation engine** where every calculation is registered and every execution stores its inputs, formula version, and outputs — this is what makes Skelly trustworthy with money.
3. **Shared-schema multi-tenancy with Postgres Row-Level Security** on every table from the first migration — the one decision you cannot retrofit.

## Open items requiring the founder's decision (see doc 08)
- Confirm/overrule the core stack, cloud (AWS vs Azure), and auth (WorkOS).
- Choose the starting point: pour foundations first, or a thin vertical feature slice first.
- Provide the first module document (Opportunities or Estimation recommended).
