# 11 — Module: Products

> **Status:** ANALYSED — all sidebar sections covered (Dashboard, Phasing, Standard Costs, Pricing, Performance Analysis) + Assumptions/Attachments. Only the **Scenarios** resource detail remains pending. Screenshots are illustrative examples, not final UI. See ADDENDUM 2 for Standard Costs / Pricing / Performance.
> **Source:** Founder screenshots (Products section). Key content transcribed in §0.
> **Last updated:** 2026-07-06

---

## 0. Source summary (from screenshots)

**Products** is a Portfolio Level Resource. A **Product Table** manages/creates products:
- **Core columns:** Name, Category. **"Customizable" columns:** Average Price, Deployments, Margin Profile, Owner, TCV. Rows e.g. Product A (Software), Product B (Hardware).
- **+ Add Product** opens a blank **product infrastructure (workspace)**; clicking an existing product opens the same workspace with saved data.

**Product workspace** has:
- **Top-bar resources:** Assumptions · Attachments · Scenarios
- **Sidebar sections:** Dashboard · Phasing · Standard Costs · Pricing · Performance Tracking

**Assumptions** (opens first on +Add Product): core product inputs — Name\*, Category\*, Owner\* (required), Description, Industry (all String). Required inputs must be filled or the product isn't created / table not updated.

**Attachments:** a table to attach relevant documents/files.

**Dashboard:** customizable; KPI cards (TCV £14.4M, Avg Margin 67%, Total Revenue £10.2M, Total Cost £4.2M), Revenue-vs-Cost chart (cumulative over time), Margin-over-time chart, Key Metrics (Deployments, Average Price, Win Rate, Margin Profile, Last Updated), a **"Viewing Scenario: Base"** selector, Comments. Users build **bespoke charts/tables/graphs** via a **view-builder with two pathways**: (1) a **guided workflow** (Add Product Chart modal: chart type [KPI, Table, Metric Grid, Bar, Stacked Bar, Line, Area, Pie, Scatter], Data Source [e.g. Product Deals], Dimension, Value, Second Value, Aggregation, Group By, Sort, Direction, Limit, Advanced calculations, live Preview); (2) a **custom query with "full access to the Skelly database."**

**Phasing:** "Assign cost/revenue timing phases to each bid. Each product estimate is assigned to a phase created in this section, allowing detailed financial forecasting." **Product Phasing Table:** Phase ID (auto number), Period, Name, Description, Start Date, End Date, Months (auto = End − Start). **+ Add Phase** adds a row.

---

## 1. Understanding — what Products is

A **Product** is a reusable commercial offering (e.g. a software or hardware solution) that the organisation sells across many deals. It is **two things at once**:
1. A **template / standard** — it carries reusable phasing, standard costs, and pricing that a bid can inherit when this product is included in a deal (feeds estimates).
2. An **analytics aggregate** — it accumulates performance across all the deals it appears in (Win Rate, Avg Price, TCV, Total Revenue/Cost, Margin), so the organisation *learns* from history. This is the Vision's "knowledge compounds" made concrete at the product level.

This dual nature is the key to understanding Products: **inputs flow down** (product standards seed bids) and **results flow up** (deal outcomes aggregate back into product analytics).

## 2. The most important structural insight — the "workspace" is a reusable pattern
The product infrastructure (a top bar of *resources* + a sidebar of *sections* + *Scenarios* + *Assumptions* + *Attachments* + a customizable *Dashboard*) is the **same shape as the whole app** and almost certainly the **same shape a Deal/Bid will have**. This is a fractal/recursive pattern. We should build a reusable **"Workspace" shell** (tabbed resources, sectioned sidebar, scenario selector, comments, attachments, dashboard) once, and instantiate it for Products, Deals, and possibly Accounts. This is a major Principle 6/7 reuse opportunity — do **not** build the product workspace as a bespoke page.

## 3. ⭐ Phasing — resolves the calc-engine phase prerequisite (cross-ref Doc 10 §4.1)
This is the **Phase model** the calculation engine needs. A phase = `Phase ID` (auto), `Period`, `Name`, `Description`, `Start Date`, `End Date`, `Months` (computed = End − Start). Phases form the **temporal backbone** that model timing/cashflow/P&L logic attaches to.

**Two things to reconcile (important):**
- **"Period" almost certainly classifies the phase type** (e.g. *Delivery* vs *Operations*) — which reconciles the Models doc's references to a "Delivery Phase" and "Operations Phase" with this doc's *user-created, freely-named* phases. So: `Period` = the standard classification (Delivery/Operations/…); `Name` = the client's specific label. **Confirm.**
- **Product-level vs Bid-level phasing.** The table is a **Product** Phasing Table, but the text says phases are assigned "to each **bid**" and "each product **estimate** is assigned to a phase." So which owns the phase timeline — the product (a standard/default) or the deal (the actual project dates)? **Most likely:** a product defines *standard/default phasing* that a deal **inherits and then adjusts** to real dates (snapshot-on-use per convention C1). **Confirm the relationship** — it determines whether the calc engine reads phases from the product, the deal, or an inherited copy.

**Impact:** with phases now defined, Doc 10's timing logic can be specified. `Months` (computed) gives each phase its length in the monthly grid; models spread Value/Cash/P&L across the relevant phase's months.

## 4. Customizable Dashboard / View-Builder — powerful, needs guardrails
This is effectively an **embedded BI / self-serve analytics tool**, with a guided chart-builder and a raw-query mode. It's a strong feature and a recurring one (dashboards appear at product, deal, and portfolio level).

**⚠️ Security flag (CTO — Principle 11):** "custom query with **full access to the Skelly database**" cannot mean literal raw SQL against the multi-tenant database. That would be a critical tenant-isolation and data-exfiltration risk (a user could read other organisations' data, or run a query that takes the database down). It **must** be a **governed query layer**: read-only, automatically tenant-scoped (RLS + a semantic layer), over *that organisation's own data only*, with resource limits. "Full access" = full access to **their** data through a safe interface — not to the raw database. This is the dashboard analogue of the formula-engine safeguards, and I'd treat it as a first-class design constraint.

**Reuse insight:** the view-builder is another **"builder"** (like the Model/Formula builder). Both are power-user composition tools over a **semantic layer** of Skelly's data. There may be a shared foundation: a governed, tenant-scoped **query/semantic layer** that both the dashboard builder and reporting sit on. Worth designing once.

## 5. Scenarios — ✅ CLARIFIED (2026-07-06) — see Doc 12 for full treatment
Founder: a **Scenario is a version of the phasing / cost / pricing tables (the whole workspace's modelling data)** that a user can toggle through. Example: a product pricing analyst building different scenarios for the standard business case of their product. Scenarios exist at **both product and deal level** (same concept). Confirmed as a major cross-cutting concept → design the engine **scenario-aware from the start** (every modelling entity scenario-scoped; outputs computed per scenario). Full analysis now in **Doc 12 — Scenarios & Deal Workspace**.

## 6. Assumptions & Attachments
- **Assumptions = the product's core defining inputs** (Name, Category, Owner, Description, Industry), with required-field validation gating creation. Note the naming: "Assumptions" is Skelly's term for a workspace's core inputs/config (it will likely mean the same at deal level). Category presumably references a taxonomy (Product Category — another managed list? confirm).
- **Attachments** → maps directly to **object storage** (Architecture §8): file table with presigned up/download, versioning, per-file permissions. Reuses the platform file service.

## 7. Product Table — core vs derived columns
The "Customizable" columns (Average Price, Deployments, Margin Profile, TCV) are **mostly derived/aggregated** from the product's underlying data (TCV, Margin, Revenue/Cost come from the dashboard aggregation; Win Rate/Deployments from associated deals) — not hand-typed. So the Product Table is partly an **aggregation view**. Confirm which columns are entered vs computed; the computed ones reuse the **aggregation service**.

## 8. Verification — gaps & questions
1. **Phasing ownership** — product-level standard vs deal-level actual, and the inheritance rule (§3). *(High — affects calc engine.)*
2. **"Period"** — is it the Delivery/Operations (phase-type) classifier? Fixed list or taxonomy? (§3.)
3. **Custom-query "full DB access"** — confirm it's a governed, read-only, tenant-scoped query layer, not raw SQL (§4). *(Security-critical.)*
4. **Scenarios** — how do they work; is every estimate/assumption scenario-scoped? (§5, pending.)
5. **Product↔Deal relationship** — a product is included in many deals; deals drive the product's aggregated analytics (Win Rate, Product Deals data source). Confirm the linkage model.
6. **Product Category / Industry** — taxonomy-managed lists or free text?
7. **Product Table derived vs entered columns** (§7).
8. **Dashboard scope** — is the view-builder Products-specific or the same platform component used everywhere (recommended)?
9. **"Deployments," "Win Rate," "Margin Profile"** — definitions/sources (Margin Profile looked like a value "Standard" — a taxonomy?).

## 9. Reusable assets identified (for the Living Platform Model)
- **`Workspace` shell** (top-bar resources + sidebar sections + scenario selector + comments + attachments + dashboard) — reused by Products, Deals, possibly Accounts. *Biggest reuse in this module.*
- **`Phase` entity + PhaseService** — the temporal backbone consumed by the calc engine (Doc 10). Months = computed.
- **`ViewBuilder` / Dashboard component** — guided + query modes over a **governed semantic/query layer**; reused platform-wide (product/deal/portfolio dashboards + reporting).
- **`ScenarioService`** — scenario dimension applied across estimates/outputs (design early).
- **`AggregationService`** (shared with Doc 10) — rolls estimate/deal data into product KPIs.
- **File/Attachments service** (Architecture §8) — object storage.
- **Assumptions pattern** — a workspace's validated core-input form (reused at deal level).
- **Reusable calcs:** TCV, Total Revenue/Cost, Avg Margin, Margin-over-time, Win Rate.
- **Reusable permissions:** `products.view`, `products.manage`, `product.dashboard.manage`, and a **query/permission guard** for the custom-query layer.

## 10. Integration with the rest of Skelly
Taxonomy (Product Category, Margin Profile) · Users (Owner) · Attachments→Files · **Phasing→Calc Engine (Doc 10)** · Standard Costs/Pricing (pending) → seed bid estimates via Models · **Deals/Bid Engine** (a product is included in deals; deals feed product analytics) · Scenarios (cross-cutting) · Reporting (shared view-builder/semantic layer) · Comments/collaboration.

## D. Engineering Specification (draft — partial, pending remaining sections)
- **`Product`** entity: `id`, `organisation_id`, `name`, `category_id`, `owner_id`, `description`, `industry`, audit, soft-delete. "Assumptions" = these core inputs (required-field validation gates creation).
- **`ProductPhase`**: `id`, `product_id` (or deal-scoped — pending §3), `period` (Delivery/Operations classifier), `name`, `description`, `start_date`, `end_date`, `months` (computed). Ordered timeline; consumed by the calc engine.
- **`Attachment`**: object-storage-backed file records (reuse platform file service).
- **`DashboardView` / `ViewDefinition`**: saved chart/table definitions (type, data source, dimension, value(s), aggregation, group/sort/limit, advanced calcs) resolved through the **governed query layer**.
- **`Scenario`** (pending): scenario dimension on estimates/outputs.
- **Services:** `ProductService`, `PhaseService`, `ViewBuilderService` (+ governed `QueryService`/semantic layer), `AggregationService`, `ScenarioService`, file service.
- **Security:** custom-query layer is read-only, tenant-scoped, resource-limited (§4). Standard RBAC + RLS everywhere.
- **Testing:** phase `months` computation; aggregation KPIs vs known data; **tenant-isolation tests on the custom-query layer** (critical); scenario correctness (when specced).
- **Reuse mandate:** build the **Workspace shell** and **ViewBuilder** as shared components, not product-specific pages.

## E. Open items
Pending founder: **Scenarios** detail; and answers to §8 (esp. phasing ownership, Period classifier, and the custom-query security model) + Addendum-2 questions.

---

# ADDENDUM 2 — Standard Costs, Pricing & Performance Analysis (2026-07-06)

## A2.1 Standard Costs — the bid cost-estimate table (= EstimateLine table)
"Interactive, filterable cost table for each bid where users manage estimates; each cost has its own dedicated modelling page. Costs can be grouped under user-defined headings (e.g. Delivery or Support Costs)."
**Standard Cost Table columns:** Phase · Description · Category · Product · Model · Cost Amount · CAPEX/OPEX · Currency. **+ Add Cost → Cost Creation Page.**

**This directly confirms Doc 10's `EstimateLine` entity.** Each row = a model instance linking: `Phase` (from Phasing §3) + `Category` (cost taxonomy) + `Product` + `Model` (a `ModelDefinition`) + `Amount` + `CAPEX/OPEX` + `Currency`. The dual reference to **Product and Model** on every cost line is important — a cost is attributed to a product and calculated by a model.

## A2.2 ⭐ Cost Creation Page = the Models engine, instantiated (major architecture validation)
The "Add Cost" wizard *is* the visual instantiation of a `ModelDefinition`, and it validates nearly every decision in Doc 10:
- **6-step wizard = the 8-part model structure:** Cost Model → Inputs → Calculation → Timing & Logic → Adjustments → Review. (Confirms the common model interface.)
- **Form is model-driven:** "if you select a Monthly Recurring Cost Model it has a different page to a One-Time Cost Model… sections are based on the Logic created in Models & Templates." → the input form/sections are **generated dynamically from the ModelDefinition** (confirms data-driven definitions + inputSchema, Doc 10 §4.6/§D).
- **Right panel = the tri-series output, live:** Monthly **P&L Breakdown** (straight-line across Build Phase), Monthly **Cash Flow Breakdown** ("payments 60 days in arrears" = payment-term shift), **Forecast Summary** (Total Cost after adj, Total Cash Outflow, P&L avg/peak). → confirms **Value/Cash/P&L tri-series** (Doc 10 §1.1).
- **Adjustments applied live as a pipeline:** Inflation (Annual 3%, from Year 2), Contingency (10%), Escalation, Risk Uplift → Base £160,000 + Adjustments £4,800 = £164,800. → confirms **adjustments-as-composable-pipeline** (Doc 10 §1.4).
- **✅ Resolves Doc 10 Resource Cost units gap:** worked example shows Quantity (2) × **Day Rate** (£800) × **Duration in Days** (100) × Allocation (100%) = £160,000 Base; Total Effort = Quantity × Duration = 200 Days. Duration is in **days**, rate is a **day rate**.
- **New — Benchmark Comparison:** This Cost £164,800 vs Market Average £150,000 (+9.9%) vs Top Quartile £130,000 (+26.8%). → a **Benchmarking** capability (see A2.5).
- **New — "Open SkellyAI":** contextual AI assistant on the page → the **AI Gateway** (Architecture §8); proposes/guides, human decides.

## A2.3 Pricing — the bid revenue-estimate table (mirror of Standard Costs)
Same structure for revenue: Phase · Description · Category · Product · Model · Revenue Amount · CAPEX/OPEX · Currency. Founder: "the same concept applies for the cost table." → **confirms cost/revenue symmetry** (Doc 10 §1.2): build **one** EstimateTable + one Creation-Wizard component, parameterised by direction (cost vs revenue) and counterparty (supplier vs customer terms).
- Revenue Breakdown screenshot shows type columns **OTR / MRR / MTR** + Total Revenue + inline add-row + TOTALS. (OTR = One-Time Revenue, MRR = Monthly Recurring Revenue; **MTR = confirm** — likely Monthly Transaction/Term Revenue.)

**Add Revenue page (One Time Revenue) — the revenue mirror of the Cost Creation wizard, and it resolves two Doc 10 gaps:**
- Identical 6-step wizard (Revenue Model → Inputs → Calculation → Timing & Logic → Adjustments → Review) with a live tri-series right panel (Monthly P&L Recognition, Monthly Cash Flow, Forecast Summary, Benchmark Comparison). Confirms cost/revenue symmetry at the *creation-wizard* level too — one component, parameterised.
- Inputs: Revenue Amount £300,000, **Currency £GBP**, Expected Period (**Single Month / Custom Period**), Start/End Month. **Milestones toggle** with Description / Expected Month / **Allocation %** / Amount, and a **"Total Allocation 100.00%" validation** (Contract Signature 50% Jan-27 £150k, HW Delivery 16.67% Apr-27 £50k, Go-live 33.33% Jun-27 £100k). → ✅ **confirms milestones drive cashflow + must sum to 100%** (Doc 10 §4.3).
- **P&L Recognition (default shown):** "recognised in expected month if in Operations, or **first month of Operations if in Delivery**" → full £300k as a single spike in Jan-27 (first month of ops). This is the *default* recognition; the "deferred across operations / CAPEX-asset" variant remains the configurable alternative (Doc 10 §4.2). **Cash Flow** follows the milestone schedule + Customer Payment Terms (30 Days).
- Adjustments panel: CAPEX Asset, Up-Front Cost, Inflation/Escalation (3% Annual), Customer Payment Terms (30 Days). Confirms the adjustments pipeline for revenue.

## A2.4 Performance Analysis — deal aggregation (Product learns from deals)
"Interactive, filterable performance table including each bid this product is part of." **Deal-by-Deal Price Tracking:** Deal ID · Deal Name · Customer · Bid Date · Price · Cost · Margin · Status · Delivery Period (e.g. DEAL-001 Capgemini Portfolio Management, £675k cost, Active Bid, Mar 2026–Dec 2031).
→ **Confirms the Product = analytics-aggregate insight (§1).** This table is the source of the dashboard's Win Rate / Avg Price / Margin KPIs. The **Product↔Deal relationship is many-to-many** (a product appears in many deals; a deal contains many products). This is the "knowledge compounds" loop: deal outcomes flow up into product performance.

## A2.5 New concepts introduced (flagged)
1. **Benchmarking** — compare a cost/deal to Market Average / Top Quartile. **Where does benchmark data come from?** (Portfolio-level benchmark datasets; likely anonymised cross-client aggregates + historical deals.) **Governance/privacy flag:** cross-client benchmarks require careful anonymisation and consent — a real data-governance design point, not just a feature. Likely its own **Benchmarking domain**.
2. **Multi-currency** — a `Currency` column on every cost/revenue. Requires a **base/reporting currency, FX rates (source? Financial Standards?), and snapshotted rates** for auditability (a £/$ forecast must be reproducible). Enterprise requirement — **flag early**, as retrofitting currency is painful.
3. **SkellyAI contextual assistant** — AI Gateway, page-level guidance.
4. **User-defined grouping headings** for costs/revenues (Delivery/Support) — presentational grouping layer over estimate lines.
5. **OTR/MRR/MTR** revenue-type breakdown.

## A2.6 Product "Standard Business Case" → Bid pre-fill via Blueprint (✅ RESOLVED 2026-07-06)
Founder confirmed: a product's Standard Costs / Pricing / Phasing together form the product's **"standard business case."** A **Benchmark/Blueprint feature** will let users **pre-fill an entire bid forecasting workspace with the standard business cases of the products in that deal.** So: the **Product holds the reusable standard business case (blueprint); a Deal pre-fills/instantiates from it** and then adjusts to the specific opportunity (copy-on-pre-fill, snapshot per convention C1). This resolves the product-vs-bid relationship — products are **blueprints**, deals are **instances**. New reusable capability: **`BlueprintService`** (pre-fill a deal workspace from selected products' standard business cases).
- **MTR = Monthly Transaction Revenue** (✅ confirmed).

## A2.9 ⭐ REVISED Product & Solution structure (2026-07-06 — supersedes earlier sidebar)
- **Standard Solution = Standard Product + multiple products.** Built identically to a Product; the only difference is an extra **Assumptions** field to **add multiple products** (from the Products list) that make up the solution (a bundle). Reuses all Product machinery.
- **Revised sidebar for BOTH Product and Solution** (supersedes Doc 11's earlier Dashboard/Phasing/Standard Costs/Pricing/Performance): **Dashboard · Estimations (Phasing, Cost, Risk, Tax) · Forecast (Revenue, P&L, Cash Flow) · Performance Tracking.** Mirrors the **bid workflow** — a product/solution's "standard business case" is a **bid-style Estimations + Forecast**. (Standard Costs → Estimations→Cost; Pricing → Forecast→Revenue; + Risk/Tax/P&L/Cash Flow.)
- **⭐ Unification / reuse:** the **same Estimations + Forecast engine** runs at **product/solution level** (build the standard case) AND **deal level** (the bid). This is *why* blueprint pre-fill is clean — it's like-for-like structure. Build the engine once, reuse in three places.
- **Shared-cost logic by level:** **Standard Products = NO cross-product shared-cost logic** (single product — costs are direct). **Solutions = YES** (multiple products → a solution cost shared across them). **Deals = YES**. **Cost→revenue allocation** (per-revenue profitability) applies at **all** levels.

## A2.7 Reusable assets (add to Living Platform Model)
- **`EstimateTable`** — one filterable/groupable/inline-add/totals table for **both** cost and revenue.
- **`ModelCreationWizard`** — dynamic wizard generated from a `ModelDefinition` (cost & revenue); renders inputs, live tri-series, adjustments, benchmark, SkellyAI.
- **`BenchmarkService`** + benchmark datasets (governed, anonymised).
- **`CurrencyService`** — base currency, FX conversion, snapshotted rates.
- **`AggregationService`** (shared) — deal roll-ups into product performance/KPIs.
- **SkellyAI contextual assistant** (AI Gateway).

## A2.8 Updated open questions (Products)
1. **Standard (product) vs actual (bid)** cost/revenue inheritance rule (A2.6). *(High.)*
2. **Benchmark data source + privacy/anonymisation model** (A2.5). *(Governance-sensitive.)*
3. **Multi-currency:** base currency, FX source, snapshot policy (A2.5). *(Design early.)*
4. **MTR** definition (A2.3).
5. **Grouping headings** — free-form per bid, or a taxonomy? (A2.1.)
6. (Carried) Phasing ownership; `Period` = Delivery/Operations classifier; custom-query security model; Scenarios detail.
