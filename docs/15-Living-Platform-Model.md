# 15 — The Living Platform Model

> **What this is (plain English):** the master catalogue of Skelly's **reusable building blocks** — the pieces that appear again and again across modules, listed once here so we build each *one time* and reuse it everywhere. Think of it as the "box of standard LEGO bricks" that sits above the individual module docs. The module docs say *how each area works*; this doc says *what shared parts they're all made from*.
>
> **Why it matters:** it enforces two Constitution principles in practice — **Principle 7 (reuse before duplication)** and **Principle 4 (single source of truth)** — and keeps Skelly consistent, cheaper to build, and easy for future engineers to understand.
>
> **"Living":** this is updated every time a new module reveals a new reusable piece, or an existing piece gets used somewhere new. Current as of the modules analysed so far (Docs 09–14 + Architecture).
> **Last updated:** 2026-07-06

---

## How to read this
Each building block has: a **plain-English description**, the **modules that use it**, and a **status** (Confirmed = used by 2+ areas already; Emerging = appeared once, likely reused; Planned = designed in architecture, not yet exercised by a module). Source docs in brackets.

---

## A. The big engines (cross-cutting systems)
These are the major shared "machines" the whole platform runs on.

| Building block | What it is (plain English) | Used by | Status |
|---|---|---|---|
| **Calculation Engine** | The machine that turns inputs into financial numbers — producing the three monthly series (Value, Cash Flow, P&L) for every cost/revenue/risk. The heart of Skelly. [Doc 10] | Models, Products (estimates), Deals (forecasting), Scenarios | Confirmed |
| **Formula Engine** | An Excel-style, safe calculator that lets core models be reused as functions and lets users write their own formula "shortcuts". [Doc 10 §4.6] | Model Builder, custom models | Emerging |
| **Taxonomy Engine** | One system for all the customisable dropdown lists (cost categories, deal types, etc.) — build once, add new lists cheaply. [Doc 09] | Company Parameters; every module that uses a dropdown | Confirmed |
| **Scenario System** | "Version control" for financial models — lets a workspace hold multiple what-if versions you toggle between. Every piece of modelling data lives inside a scenario. [Doc 12] | Products, Deals | Confirmed |
| **Scenario Organising Layer** | Makes scenarios scale to complex deals: typed **dimensions/tags** (scope, commercial-model, volume, price-point, lot, round), **matrix/grid** view, **parametric + combinatorial generation** (spin a family by varying a driver, or generate {options}×{models}), and **shared-block propagation** (edit a product once, flow to all scenarios using it → cost-down loop). [Doc 12 A.5.2, Doc 26] | Deals, Scenarios, Approval | Emerging |
| **Commercial/Pricing-Model transform** | Swappable charging structures (CAPEX+OPEX, OPEX-only…) applied to a cost base — splits OTC/MRC, sets margin, applies cash-flow/financing rules. [Doc 26 §1] | Deals, Forecast, Models | Emerging |
| **Contract/Lot structure** | Splits one opportunity into multiple contracts/lots (e.g. CAPEX contract vs OPEX contract), each its own business case, with roll-up + cross-lot economics. [Doc 26 §4] | Deals, Forecast, Approval | Emerging |
| **Cost-Optimisation / Diff workspace** | Tracks cost-reduction iterations and auto-produces the change/optimisation summary (the round-to-round cost diff); AI can suggest reductions. [Doc 26 §1] | Estimations, Scenarios, Approval | Emerging |
| **Workflow / Lifecycle Engine** | The controlled step-by-step process a deal moves through (the 10 bid stages), with rules about what can advance when. [Doc 12, Arch §4.5] | Deal/Bid Engine | Confirmed |
| **Benchmark / Prefill engine** | Pre-fills the 3 scenario stages (Estimations/Forecast/Simulation) from pluggable **sources** — Similar Deals, Standard Solutions, Standard Products (blueprints), Templates & Libraries, Manual — mix-and-match per subsection, with an **Auto-select-all (AI)** agent and a data-coverage metric. (Generalises the old "Blueprint".) [Doc 17 B.2] | Pipeline; Estimations/Forecast/Simulation | Confirmed |
| **Similarity matcher ("find similar deals")** | Ranks historical deals by % match (semantic via pgvector + attribute filters). | Pipeline benchmarking, Identification interactive lists, Competitors | Confirmed [Doc 17 B.2b] |
| **AI Gateway (SkellyAI)** | The single, controlled doorway for all AI help — it suggests and guides, humans decide, and it can swap AI providers without rework. [Arch §8, Doc 11] | SkellyAI assistant, future AI features | Planned |
| **⭐ Marrow — the Data Catalog / Semantic Layer (KEYSTONE)** | **"Marrow"** (official name) = the unified, governed, read-only registry of **every data point across the platform** (fields, charts, tables, text, summaries) — each with source path, type, description, value, permissions. The "pull data from anywhere in Skelly" layer. Powers customisable tables, dashboards, the Pack Builder, reporting, AND AI retrieval. A first-class foundational service. [Doc 17 B.1.5a] | Customisable tables, Dashboards, Pack Builder, Reporting, AI, **Companion**, **Portfolio/Analysis Builder** | Confirmed (keystone) |
| **⭐ Companion (platform-wide) — Marrow's user-facing surface + AI** | The user-facing feature (everywhere in Skelly) to **discover, browse, drag-in, reuse and update** any structured data point, with **AI suggestions** based on context; interactive hub or conversational. = **Marrow + AI Gateway**, surfaced. [Doc 31 §2] | Portfolio Dashboard, Analysis Builder, Pack Builder, everywhere | Emerging (first-class) |
| **Portfolio aggregation + BI engine** | Cross-deal roll-ups (scenario-aware) feeding the **Portfolio Dashboard**, **Analysis Builder** (Excel/pivot + AI report-gen) and **Target/Performance** (targets vs forecast vs actual, alerts). Needs pre-aggregation/materialised views at scale. [Doc 31] | Portfolio Level | Emerging |

## B. Reusable screen components (the UI bricks)
The visual pieces that repeat across the app.

| Building block | What it is (plain English) | Used by | Status |
|---|---|---|---|
| **Workspace shell** | The standard "page frame": top-bar resources (Assumptions, Attachments…) + a sidebar of sections + a scenario selector + comments. | **Products, Accounts, Deals** | Confirmed (3×) |
| **Dashboard / View-Builder** | The customisable dashboard where users build their own charts/tables — with a guided mode and a query mode. | Products, Accounts, Deals, Portfolio | Confirmed |
| **Performance Tracking list** | A filterable list of "all the deals this thing has been part of," with roll-up metrics. | Products, Accounts | Confirmed |
| **Assumptions form** | A validated form of a workspace's core inputs (required fields gate creation). | Products, Accounts, Deals | Confirmed |
| **Managed-List table** | The add/edit/reorder/archive table used for every taxonomy list. | Company Parameters (all taxonomies) | Confirmed |
| **Reference-Data Picker** | The standard dropdown for choosing a category/value, aware of active vs archived. | Every module with a dropdown | Confirmed |
| **Estimate table** | One filterable, groupable (Headers) table for cost **and** revenue lines (mirror images); columns Phase/Description/Category/**Model**/Product/Amount/CAPEX-OPEX/Currency/Total. Each line records **which model generated it** (model runs the timing calcs — no OTC/MRC/MTC columns). | Products/Deals (Standard Costs, Pricing, Estimations Cost) | Confirmed |
| **Excel-style interactive view** | Flexible spreadsheet-style tables (Cash Flow / P&L), viewable AND editable, with time-granularity toggle (annual/quarterly/monthly) and CAPEX/OPEX/category rollups; edits flow back through the calc engine. | Cost/Risk/Revenue Views; Forecast | Confirmed [Doc 17 B.3.2] |
| **Cost Allocation** | Split a cost across the revenues it supports (%/amount) → per-revenue profitability. | Revenue profitability | Emerging [Doc 17 B.4.1] |
| **Shared-cost allocation engine** | Direct vs Shared cost flag; shared costs auto-distribute across products by a method (pro-rata by revenue / by direct cost / equal / custom fixed %) — live, recomputed, order-independent, cycle-safe, snapshot at Approval. Cuts manual splitting. | Product margin; profitability | Emerging [Doc 17 B.4.1a] |
| **Profitability Summary** | Live per-revenue (and roll-up) Gross/Net Profit & Margin, Direct vs Indirect costs, tailorable metrics. | Revenue pricing; dashboards | Emerging [Doc 17 B.4.1] |
| **Commercial Adjustments toolbar** | Deal-shaping revenue levers: discount, free period, ramp up/down, inflation/CPI, caps/floors, min commitment, FX, revenue/profit share, service credits, performance bonus, etc. | Revenue forecasting | Emerging [Doc 17 B.4.1] |
| **Model Creation Wizard** | The step-by-step "Add Cost / Add Revenue" page, generated automatically from a model's definition; shows live results, adjustments, benchmark. | Cost & Revenue creation | Confirmed |
| **Attachments table** | Attach/manage documents on any workspace. | Products, Accounts, Deals | Confirmed |
| **Timeline (Gantt + milestone editor)** | Milestone/deadline model with two views: a reorderable editor and a Gantt visualisation; planned + actual dates. | Bid Engine (Timeline) | Emerging [Doc 17 A.6] |
| **Home "compass"** | Cross-deal landing page: reminders/deadlines/tasks with deep links to specific bids/pages. | Home / Portfolio | Emerging [Doc 17 A.6e] |
| **Taxonomy + "Other" input** | A managed dropdown with a free-text "(Other)" fallback; "Other" entries can later be promoted into the list to keep data clean. | Deal Assumptions (Deal Type, Delivery Model) | Emerging [Doc 17 A.1] |
| **Score slider + scorecard** | 1–10 scoring sliders across dimensions rolling up to a weighted overall score (weights configurable per company). | Identification qualification scorecard | Emerging [Doc 17 B.1] |
| **Interactive List (semantic retrieval)** | Auto-surfaces related records ("same account", "similar solution/scope") via pgvector; tenant-scoped. | Identification; future Competitors | Emerging [Doc 17 B.1] |
| **Field hint (lightbulb)** | Inline examples/prompts for a field; future SkellyAI content suggestions. | Identification text fields | Emerging [Doc 17 B.1] |
| **Document / Pack builder** | Visual builder: ordered sections + design elements (Text/Data/Chart/Table/Image/Divider/Note) bound to Marrow inputs; company templates (set at onboarding); branding; Preview/Share/Download. **Confirmed reused** (Qualification Pack + Approval Pack); template per purpose; future proposals/reports. | Qualification Pack, Approval Pack | Confirmed [Doc 17 B.1.5, B.6] |
| **Comments + Tasks (collaboration) — FULL v1** | **Threads** + @mention, assignable tasks (due/complete), **notifications, activity feed, reminders** on a workspace/pack/deal. | Approval feedback; deal collaboration; everywhere | ✅ v1-full [Docs 32/33, 17 B.6b] |
| **Export / render service** | Turns a built pack into a shareable output in **multiple formats — email summary, slides (PPTX), document (PDF)** — templates per format/level; snapshots values at export. | Pack Builder, Approval Pack; reporting | Emerging [Doc 17 B.1.5, B.6f] |
| **Approval Policy / Matrix** | Company-configurable governance: thresholds by bid value/complexity → required approval **level** (BU / Geo / Corporate / CEO) + **form** (email/call). Routes who must approve. | Approval; Company Parameters | Emerging [Doc 17 B.6f] |
| **Approval workflow (rounds)** | Present → feedback → approve/reject → push-back → **rework spawns a new scenario** → re-present; tracks rounds/status. | Approval | Emerging [Doc 17 B.6f] |

## C. Reusable back-office services (the shared workers)
The behind-the-scenes services that do the work.

| Building block | What it is (plain English) | Used by | Status |
|---|---|---|---|
| **Permission service** (`can()`) | One place that answers "is this user allowed to do this?" for the whole platform. | Everything | Planned (Arch §7) |
| **Organisation / User / Role services** | Manage companies, users, invites, and custom roles. | Company Parameters; all | Confirmed |
| **Taxonomy service** | The single source of truth for all reference lists. | All | Confirmed |
| **Phase service** | Manages the project timeline (Delivery/Operations phases) every calculation attaches to. | Models, Products, Deals | Confirmed |
| **Aggregation service** | Rolls many small numbers up into totals/KPIs (TCV, margin, win rate). | Products, Accounts, Deals, Dashboards | Confirmed |
| **Statement-aggregation engine** | Rolls all line-level P&L/cash-flow series up — grouped by category → statement-line — into standard **P&L & Cash Flow statements**, per scenario, at monthly/quarterly/annual granularity. Derived/read-only. | Forecast (Business Case Output) | Confirmed [Doc 17 B.4.2/3] |
| **Estimations + Forecast engine (multi-level)** | The full Estimations (Phasing/Cost/Risk/Tax) + Forecast (Revenue/P&L/Cash Flow) stack runs at **three levels**: Standard Product, Standard Solution, and Deal — same components. Product/Solution build a "standard business case" that blueprint-prefills a deal (like-for-like). | Products, Solutions, Deals | Confirmed [Doc 11 A2.9] |
| **Company Master Statements** | Portfolio consolidation — every deal's P&L & Cash Flow roll up into a Company-Level Master P&L / Master Cash Flow. | Portfolio finance; Portfolio Dashboard | Emerging [Doc 17 B.4.2/3] |
| **Category→statement classification** | Each category carries a **P&L class** (Revenue/COGS/Contingency/OpEx/Pre-Tax) + **Cash Flow class** (Operations/Investing/Financing), set in Company Parameters. Drives the auto P&L & Cash Flow (subtotals computed by the statement). | Forecast statements; category schema | Confirmed [Docs 09, 17 B.4.2/3] |
| **Valuation calcs** | NPV (discount-rate driven), DSCR, Burn Rate, Cash Runway, Cash Conversion, Months Cash Negative, breakeven. | Cash Flow / valuation summary | Emerging [Doc 17 B.4.3] |
| **Scenario service** | Creates/forks/compares scenarios; tracks the active one. | Products, Deals | Confirmed |
| **Blueprint service** | Copies a product's standard business case into a deal. | Products → Deals | Emerging |
| **Notifications / Reminders + Deadline engine — v1** | Scheduled scan of upcoming **deal key dates** (RFI/tender/clarifications/presentation/award) + task due-dates → **notifications, activity feed, reminders**; feeds Home + a **portfolio timeline/calendar**. The shared notify/remind service. | Deadlines/Timeline, Tasks, Approval alerts, Home | ✅ v1 [Docs 32/33, 17 A.6e] |
| **Competitive simulator** | You-vs-competitors participant table (each a detail page): walk-in/walk-out prices, discount ladder/waterfall, benchmarking vs historical competitor bids → Rank / Win Probability / Confidence. | Bid Simulator | Emerging [Doc 17 B.5] |
| **Sensitivity analysis** | Run best/worst-case simulation tweaks on a selected scenario → sensitivity picture for approvers. | Simulation → Approval | Emerging [Doc 17 B.5.2] |
| **Benchmark service** | Compares a cost/deal to market average / top quartile (anonymised, governed). | Cost/Revenue creation, Deals | Emerging |
| **Currency & Payment-Terms resolver** | Applies the right currency and payment-timing (from the Account / Product) to the numbers. | Models, Products, Accounts, Deals | Emerging |
| **File service** | Secure document storage (upload/download, versioning). | Attachments everywhere | Planned (Arch §8) |
| **Audit service** | Writes the tamper-proof "who did what" logbook. | Everything sensitive | Planned (Arch §6.2) |

## D. Reusable data (the shared information records)
The core "nouns" of Skelly, stored once and referenced everywhere. All carry the company they belong to (`organisation_id`), audit fields, and soft-delete; modelling records also carry a `scenario_id`.

| Record | What it is | Used/referenced by |
|---|---|---|
| **Organisation** | A customer company using Skelly (the "tenant"). | Everything |
| **User / Membership / Role / Permission** | People, their membership of a company, and what they can do. | Access everywhere |
| **Taxonomy item** | One entry in a managed list (a cost category, deal type…). | All modules |
| **Model definition** | A reusable calculation recipe (core or client-built). | Estimates, Forecasting |
| **Estimate line** | One cost or revenue on a deal: phase + category + product + model + amount + currency. | Products, Deals |
| **Phase** | One stretch of the project timeline (start/end/months). | Calculations |
| **Scenario** | One what-if version of a workspace's modelling. | Products, Deals |
| **Product** | A reusable offering (with its standard business case). | Deals, Accounts |
| **Account / Contact** | A customer (and its people); may have a parent account. | Deals |
| **Deal** | A single bid/opportunity moving through the lifecycle. | The Bid Engine (ties everything together) |
| **Attachment / Audit log** | Files, and the permanent action record. | Everywhere |

## E. Reusable calculations (the shared maths)
Individual formulas that exist **once** and are reused (Principle 4).

- **The three series:** Value, Cash Flow, P&L Recognition — the universal output shape of every model. [Doc 10]
- **Timing patterns:** one-time, monthly recurring, annual recurring, consumption, tiered, %-of-a-metric, expected-value (risk). [Doc 10]
- **Adjustments:** inflation/escalation, payment-term shift, discount, CAPEX/depreciation, up-front. [Doc 10]
- **Roll-up metrics:** TCV, Total Revenue, Total Cost, Margin %, Margin-over-time, Win Rate. [Docs 11, 14]
- **Scenario metrics:** Expected Value (Bid Price × Win Probability), Cash Peak (working-capital peak). [Doc 12]
- **Currency conversion** (with snapshotted rates). [Docs 11, 14]
- **Win/Loss Review** — coded fields (machine-learnable) + free-text (AI-mineable) captured at Outcome; publishes to competitor intel, benchmarks, account win-rate, reason/pricing/execution analytics. [Doc 17 B.7] | Emerging
- **Actuals-vs-Forecast variance engine** — month-by-month forecast (Award-Price baseline) vs actuals on Cash Flow + P&L, with **model-aware decomposition** into drivers (volume/rate/mix/timing/scope/FX) + AI-drafted "why". Feeds estimation-accuracy learning → standard costs/benchmarks. [Doc 17 B.8] | Emerging
- **ERP / financials connector + mapping layer** — read-only pull of monthly actuals from Oracle/SAP/NetSuite/Dynamics; chart-of-accounts/WBS ↔ Skelly deal→line mapping; CSV/manual import fallback (reuse onboarding import). [Doc 17 B.8, Docs 24/25] | Emerging

## F. Platform-wide conventions (the shared rules)
Not components, but rules every part of Skelly follows — so the whole thing behaves consistently.

- **Snapshot-on-use:** when a setting feeds a number, the value is captured at that moment, so later edits don't rewrite history. [Decision C1]
- **Archive, never delete** reference data that's been used, so old records stay correct. [Doc 09]
- **One company can never see another's data** (tenant isolation at the database). [Arch §6.1]
- **Everything modelling is scenario-scoped.** [Doc 12]
- **Business rules live in the back office, never the screens.** [Constitution P5]
- **Every important number is explainable** (traceable to inputs + formula + version). [Vision]
- **Payment terms & currency are inherited** (customer → from Account, supplier → from Product), then snapshotted. [Docs 10, 14]
- **Two-layer authorization:** access = **global RBAC permission** AND (for deal-scoped things) **per-deal team membership + Access Level**. The `can()` service checks both. [Doc 17 A.2b; Arch §7]
- **AI-consumable by default:** every feature is built so an AI/agent can use it like a human — structured/typed data, exposed via the governed API, explainable, semantically indexed where useful, permissioned & audited. The structured DB is the AI moat. [Doc 18]
- **UI is swappable without touching functionality:** any screen can be redesigned, re-themed, or A/B tested without changing logic or data. Achieved by keeping business logic in the backend *and* separating "how it looks" (design-system presentational components) from "what it needs" (shared data hooks). [Doc 17 §5; Constitution P3/P5]

---

## G. What this tells us about build order
The most-reused blocks are the ones to build **first and well**, because everything else leans on them:
1. **Foundations:** Organisation/User/Role/Permission, Taxonomy engine, Audit, tenant isolation. *(Used by everything.)*
2. **The Calculation Engine** (tri-series + timing primitives + adjustments + phases). *(The crown jewel.)*
3. **The reusable Workspace shell + Dashboard + Assumptions + Performance Tracking.** *(Used by Products, Accounts, Deals.)*
4. **Scenario system + Aggregation** (design in early — expensive to retrofit).
5. Then the specific modules (Products, Accounts, the Bid Engine) assemble mostly from the above.

This ordering matches the Architecture's evolutionary build order (Doc 06 §14) and is the practical pay-off of all the reuse we've spotted.

*Update this doc whenever a new module adds or reuses a building block.*
