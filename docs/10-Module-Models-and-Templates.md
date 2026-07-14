# 10 — Module: Models & Template Library

> **Status:** ANALYSED — gaps flagged, Engineering Specification drafted. This is the **calculation engine's content layer** and the most important module in Skelly (Vision — Financial Philosophy: auditable, explainable, no black boxes). Founder explicitly requested gap-finding.
> **Source of truth:** Founder's product doc (captured/summarised in §0). Screenshots pending.
> **Last updated:** 2026-07-06

---

## 0. Source summary
A **Models & Template Library** of reusable financial models (Cost, Revenue, Risk, Operating Expense, Tax) applied to **estimates within bids**. Each model manages the *formulas and inputs* behind a calculation. Every model shares a common 8-part structure:

1. **Model Information** (Name, Description)
2. **Required Inputs** (model-specific)
3. **Calculation Logic** (how the total value is computed)
4. **Phase/Timing Logic** (which project phase/period it attaches to)
5. **Cashflow Logic** (when cash actually moves)
6. **P&L Recognition Logic** (when it hits the income statement)
7. **Adjustments** (cross-cutting modifiers)
8. **Example Use Case**

Models provided: **Cost** (One Time, Resource, Monthly Recurring, Annual Recurring, Consumption); **Revenue** (One Time, Monthly Recurring, Annual Recurring, Consumption, Tier Based, Profit Split/Revenue Share [empty]); **Risk** (Fixed % Contingency, Risk Register EMV); **Operating Expenses** (Percentage-Based Cost). **Tax models: none provided.**

---

## 1. Understanding — what this module really is

This is Skelly's **financial calculation engine, expressed as a library of model definitions.** Each model is a self-contained, reusable recipe that converts a small set of user inputs into three monthly time-series:

- a **Value** series (the economic total, by period),
- a **Cash Flow** series (when money moves — Value shifted by payment terms),
- a **P&L Recognition** series (when it's recognised in the income statement — per accrual/matching accounting).

The genius of the 8-part common structure is that **every model is an instance of one interface.** That is exactly the shape our Architecture calls for (§4.4 calculation engine): a registered calculation with a typed input schema, a pure calc function, and — here refined — *three* projection functions (timing→value, cashflow, P&L) plus a composable adjustments pipeline. Get this abstraction right and every future model is "implement the interface," not "invent a subsystem."

> **⭐ Canonical recognition methods (standardised 2026-07-06 — supersedes scattered "fix/defer/custom/straight line" wording throughout this doc).** One vocabulary for both **P&L recognition** and **cash timing**, everywhere: **Point in Time** (single period), **Straight Line** (even spread over a period/phase; later start = deferral), **Milestone** (per allocations, sum to 100%), **Custom** (any user-defined schedule). Depreciation is not a preset — it's Straight-Line-over-asset-life (+ CAPEX class); complex schedules → custom model. Ownership-transfer toggle changes only the *default* pick. See Doc 21 §2.4. *(Older terms below map onto these.)*

### 1.1 The single most important structural insight — three separate series
Skelly correctly separates **Value ≠ Cash ≠ P&L**. A cost can have its economic value, be *paid* on different timing (payment terms), and be *recognised* on yet different timing (deferred over a phase). This tri-series model is sophisticated, correct accounting, and it must be the engine's canonical output. **Canonical time unit = the month;** annual/one-off items expand to a monthly vector.

### 1.2 Second insight — Cost and Revenue models are the same engine
One Time / Monthly Recurring / Annual Recurring / Consumption appear **identically** in both Cost and Revenue, differing only by (a) direction (outflow vs inflow) and (b) counterparty payment terms (Supplier vs Customer). These should **not** be built twice. They are one set of **timing primitives** parameterised by direction + counterparty. Reusability win (Principle 7).

### 1.3 Third insight — Models form a dependency graph (DAG)
Some models are **derived from other models' aggregated outputs**:
- Operating Expense "Percentage-Based Cost" = % of **Revenue / Total Costs / Labour / Gross Profit**.
- Risk "Fixed % Contingency" = % of a **Cost Base**.
- Risk "EMV" sits alongside costs.

So the engine cannot compute models in arbitrary order — it must resolve a **dependency graph**, compute base models first, then derived ones, and **detect cycles** (e.g. OpEx as % of Gross Profit, where Gross Profit depends on OpEx). This is a major engineering requirement, addressed in §D.

### 1.4 Fourth insight — Adjustments are a composable pipeline, not per-model code
The recurring adjustments — **Inflation/Escalation, Payment Terms, CAPEX Asset, Up-Front Cost, Discount Period** — are cross-cutting transforms applied on top of a base series. They should be a **shared library of pipeline stages** applied uniformly, not re-implemented per model. E.g. "shift cash series by N months" (payment terms) and "compound a rate across periods" (inflation) are each written once.

## 2. Where it fits in the platform
- **Portfolio level:** the Model Library lives under Company Parameters (the five "…Models" sidebar sections) and/or "Models & Templates" portfolio resource — it is **reference/definition data** tailored at onboarding.
- **Bid level (Skelly Bid Engine):** a user builds an **estimate** by instantiating models with concrete inputs. Each estimate line = *(chosen model definition) + (inputs) + (taxonomy category assignment)*.
- **Taxonomy link:** each modelled amount is classified by a Cost/Revenue/Risk/Tax **Category** (CAPEX/OPEX). The **category** classifies; the **model** calculates.
- **Forecasting/Reporting:** aggregate the three series across all estimate lines → the bid's cost/revenue/cashflow/P&L profile. This is the "company parameters feed forecasting at bid level" link.
- **Financial Standards (deferred):** almost certainly the home of **default rates** models inherit — inflation, escalation, standard payment terms, discount rules. Models reference these defaults (snapshot-on-use, per platform convention C1).

## 3. Two entities hiding in one word: Definition vs Instance
Critical modelling distinction the doc blurs:
- **ModelDefinition** (portfolio/library): the reusable formula + input schema + logic + version. Governed here.
- **ModelInstance / EstimateLine** (bid): concrete inputs + resolved outputs, snapshotting the *definition version* and any referenced standard rates used, so a historical estimate is perfectly reproducible and explainable (Architecture §4.4; snapshot convention C1).

The calc engine runs a Definition against an Instance's inputs to produce the three series, and persists inputs + version + outputs.

---

## 4. VERIFICATION — gaps, ambiguities & inconsistencies (as requested)

### 4.1 Foundational gap — "Phases" (✅ FULLY RESOLVED — Estimations/Phasing, Doc 17 B.3.1)
**Resolved 2026-07-06:** Phases live in **Estimations → Phasing** (scenario-scoped), table = Phase ID (auto) · **Period (Delivery/Operations, confirmed)** · Name · Description · Start · End · Months (=End−Start). `Period` classifies the phase type; `Name` is the client's label. A "Default" phase auto-captures flat/un-phased estimates. Product phasing = the blueprint/standard that pre-fills this. Each estimate line references a phase; models spread Value/Cash/P&L across the phase's months. **Original analysis below (now satisfied):**

Every model's timing depends on **Delivery Phase** and **Operations Phase** (start, end, duration), but *this* doc never defined them. **The Products module's Phasing section (Doc 11 §3) supplies the Phase entity:** `Phase ID`, `Period`, `Name`, `Description`, `Start Date`, `End Date`, `Months` (computed). Phases are **user-created and freely named**, and `Period` likely classifies phase *type* (Delivery/Operations) — reconciling this doc's fixed "Delivery/Operations" references with user-defined phases. **Still to confirm (Doc 11 §3):** whether phasing is owned at **product** level (a standard/default) or **deal** level (actual dates), and the inheritance rule. Once confirmed, all timing/cashflow/P&L logic here can be fully specified against the phase timeline.

### 4.2 The delivery-cost → operations-P&L policy (the concept you flagged)
A clear pattern runs through the examples: **costs/revenues incurred in Delivery are recognised in P&L across Operations**, not when incurred (HW bought Jan-27 → P&L in Operations; delivery labour → P&L over 5-yr operations). This is a **capitalise-and-match** accounting policy. It's defensible, but:
- It's a **significant accounting choice that varies by client** — some expense delivery costs as incurred; some capitalise and amortise; some defer to a single point. Your own note asks exactly this ("Do you defer one-time costs over delivery/operations or assign them to a single month?").
- The One-Time Cost text is **internally inconsistent**: it says both "deferred across Operations" *and* "fixed to the First Month of Operations," and the example uses the single-month treatment ($100k all in May-27). These are different answers.
- The **"CAPEX Asset" adjustment** implies depreciation over operations, which contradicts dumping $100k into a single month.

**Recommendation:** make P&L recognition a **configurable accounting policy** (per client, per category, with a sensible default), with explicit options: (a) recognise when incurred; (b) defer to first month of Operations; (c) straight-line across Operations; (d) capitalise as CAPEX asset and depreciate over an asset life. This is a first-class decision, not a footnote — it directly determines reported profit. **Needs a clear rule per case.**

### 4.3 Model-by-model findings

**One Time Cost / One Time Revenue** — ✅ *clarified by the Add Revenue page (Doc 11 A2.3):*
- Milestones **do** drive the **cashflow distribution**: the Add Revenue screenshot shows milestones (Contract Signature 50% Jan-27, HW Delivery 16.67% Apr-27, Go-live 33.33% Jun-27) distributing cash across those months, with a **"Total Allocation 100.00%" validation** — confirming the sum-to-100% rule I recommended. Value = amount; cashflow = milestone allocations (+ payment terms).
- **P&L default now shown:** "recognised in expected month if in Operations, or **first month of Operations if in Delivery**" — the Add Revenue page recognises the full £300k as a single spike in the first month of operations (Jan-27). This is the *default*; the original doc's "deferred across Operations / CAPEX-asset" variant remains the configurable alternative (§4.2).

**Resource Cost** — ✅ *units resolved by the Add Cost page (Doc 11 A2.2):*
- Worked example on the Cost Creation Page: Quantity (2) × **Day Rate** (£800) × **Duration in Days** (100) × Allocation (100%) = £160,000 Base; **Total Effort = Quantity × Duration = 200 Days**. So **Duration is in days, Rate is a day rate, Allocation replaces "Utilisation %".** Gap closed.
- "Cost Amount **or** Detailed Allocation" — two input modes (flat vs built-up); the calc logic covers the built-up mode. Specify the flat mode too.

**Monthly Recurring Cost/Revenue** — clean. Minor: "Expected Period (Full Phase or custom months)" needs the phase model (§4.1).

**Annual Recurring Cost/Revenue** — clean and the ARR example is correct ($120k/yr, billed Jan, $10k/mo P&L). Confirm "Expected Period" here is in **years**.

**Consumption Cost/Revenue**
- Formula "Cost per Transaction × (Number of Transactions × Growth Rate)" is **ambiguous on compounding**: growth is described as "custom rate for each year," but the formula applies it once. **Clarify:** does volume compound year-over-year (Year n = base × ∏ growth)? Is "Number of Transactions" per month or per year?
- Consumption **Cost** example is **blank**. Consumption **Revenue** example is fine.

**Tier Based Revenue** — richest model, several real gaps:
- **Marginal vs absolute tiers?** Table 0–5m→$50k, 5m–10m→$100k. If an entity is 7m, is revenue $100k (whole volume at its tier) or $50k + a marginal portion? Standard tiered-pricing ambiguity — **must be specified.**
- **Above the top tier:** entities are 45m and 32m, but the tier table stops at 10m. What price applies beyond the highest tier? Also the **scale mismatch** (tiers in single-digit millions, entities in tens of millions) suggests the example is illustrative only.
- **Example is wrong** — the Tier Based "Example Use Case" is a copy-paste of the Consumption Revenue API-calls example and doesn't illustrate tiers. Replace.
- Is the tier price a **flat amount per entity** (as the table implies) or a **rate per unit**? The table's "Revenue Amount" reads as a flat charge per band — confirm.
- ⭐ **RESOLVED / concretised by Case 5 (Doc 26 §4b, 2026-07-12):** the required behaviour is a **lookup (absolute) tier** — a driver value (e.g. passengers per trainline) selects **one band**, and that band sets a **flat charge per entity** that can itself be **OTC (one-time) + MRC (recurring)** (Case 5: flat £50k OTC + a per-band MRC £25k/£50k/£75k/£100k). So the tiered model must support: (a) driver→band **lookup**, (b) **flat-per-entity** charge with **separate OTC and MRC** components, (c) bands defined to cover the expected range (out-of-range handling = config). Marginal-tier behaviour remains a configurable option for other deals, but **absolute-band lookup is the mandatory baseline.**
- ⭐ **Applied across a population (Case 5):** the tiered model is typically run over a **population of billable entities**, each classified into its band → priced → **rolled up**, with **sign-up uncertainty** handled by **parametric mix scenarios** (Doc 12 A.5.2, Doc 26 §6). See "billable-entity population" note in §4.4a.

**Profit Split / Revenue Share** — ⭐ **DEFINED by Case 5 (Doc 26 §4b, 2026-07-12).** A **revenue-share / royalty** payout to a third party. Definition:
- **Inputs:** share **rate** (%, or a formula) · the **revenue base** it applies to (which revenue lines/products) · the **recipient party** (a role on the deal — often the requester; see Doc 14 party roles) · **timing** (default: follows collection of the underlying revenue).
- **Effect:** a **revenue-linked deduction** — reduces **net** revenue in the P&L (gross vs net both visible) and creates a **cash payment out** in the Cash Flow series at its timing. Recognition follows the underlying revenue it shares.
- **Example (Case 5):** Government X takes **10% of revenue collected** from the trainlines → Company Y keeps 90%, pays 10% out.
- Expressible today via the formula engine (a cost line = %×revenue), but promoted to a **first-class model type** so users don't hand-build it.

**Fixed Percentage Contingency (Risk)** — clean, but depends on a **"Cost Base"** selection (which costs?) → dependency-graph item (§1.3). Define how the cost base is selected (all costs, a category, a phase).

**Risk Register EMV** — clean (EV = Probability × Impact; Total = Σ). Its **Example Use Case is wrong** (reuses the "10% contingency" example — replace). ✅ **RESOLVED (Doc 17 B.3.3): the bid-level Risks table IS the "Risk Register"** — each risk row is a register entry the EMV model reads (Probability × Impact). Also note: risk **Cashflow / P&L Recognition** support **fix / defer / custom** options (not only "in line with underlying cost profile").

**Percentage-Based Cost (OpEx)** — clean, but the **"Custom Financial Metric" (Revenue/Total Costs/Labour/Gross Profit)** is the clearest dependency-graph case (§1.3), and **Gross Profit as a base risks a cycle** (GP depends on costs incl. OpEx). Must define allowed bases and cycle handling.

### 4.4a ⭐ Billable-entity population (Case 5, 2026-07-12)
Some deals bill **many entities**, not one customer — Case 5's 10 trainlines, each with its own attribute (passengers) → tier → price. So a deal can carry a **population of billable entities**, where each entity is: (a) an attribute value → (b) classified into a tier/band → (c) priced (flat OTC + per-band MRC) → (d) **summed** into deal revenue. **Sign-up is uncertain**, so the population is **scenario-varied** (which/how many entities per band commit) via parametric mix scenarios (Doc 12 A.5.2). The **payers** here are the entities, which may **differ from the deal's requester** — see Doc 14 party roles. Relates to Case 2's "units" but entities are **heterogeneous** (different tiers), not identical. Data-model home to confirm (candidate: a per-deal entity list feeding a tiered revenue model). *(Refinement item #20, Doc 26 §6.)*

### 4.4 Cross-cutting undefined terms (need definition)
- **Inflation / Escalation** — global? per-model? per-year custom? Where is the rate set? (Likely **Financial Standards** defaults, snapshot-on-use.)
- **Payment Terms** — cashflow shift of N months. ✅ *Source confirmed (Doc 14):* **Customer** payment terms come from the **Account** (customer) on the deal; **Supplier** terms from Products/Suppliers. Inherited into the deal, snapshot-on-use.
- **Discount Period** (recurring revenue) — undefined.
- **CAPEX Asset / Up-Front Cost** adjustments — need precise behaviour (esp. CAPEX depreciation profile — ties to §4.2).
- **"Templates" — ⭐ DEFINED by founder (2026-07-12): a Template is a PACK-BUILDER template, NOT a bundle of models.** It captures a company's preferred **style / structure / order** for their **Qualification Pack** or **Approval Pack**, incorporated at onboarding so packs match how that company works (Doc 17 B.1 / B.6). **Terminology lock:** a **Model** = a calculation engine (cost/risk/revenue) *only*; a **Template** = a pack layout/structure; a **Phase** = a timeline period entity that models reference for timing. These three are distinct — do not conflate. *(This corrects the earlier "bundle of models" guess. The module's "& Templates" naming refers to pack templates, to be reconciled — models and pack-templates may not belong in the same module.)*

### 4.5 Missing sections
- **Tax Models** — ✅ **RESOLVED (Doc 17 B.3.4): there are NO tax models.** Tax is always a simple fixed calc `Tax = Amount × Tax Rate`, not a model family. No gap here.
- **Operating Expenses** — only one model; likely more (fixed OpEx, headcount-based?).
- Several **Example Use Cases** blank or copy-pasted (Consumption Cost, Tier Based, EMV).

### 4.6 Scope — model authoring (✅ RESOLVED 2026-07-06)
**Decision:** Clients do **not** edit the core models' formulas. Instead, if a client needs a different model, they **create a new model by following the standard model architecture** (the 8-part structure). Core/system models are simply **pre-built instances of the same authoring framework** clients use.

**Architectural implication (significant):** `ModelDefinition` is **data authored through a Model Builder**, not only code shipped by us. The engine must therefore expose, as a *guided builder*, the same building blocks our core models are made of:
- an **input-schema builder** (define Required Inputs + types/validation),
- a **calculation-logic selector** — client composes from the library of **calculation patterns/primitives** (one-time, monthly/annual recurring, consumption, %-of-metric, tiered, EMV…) + parameters + references to other models/metrics,
- **timing / cashflow / P&L strategy** selection (from the standard options, incl. the configurable recognition policy §4.2),
- **adjustments** selection (from the shared pipeline),
- name/description/example.

**Expressiveness (✅ RESOLVED 2026-07-06): HYBRID — a formula engine.** Users can (a) **reference existing core models** and (b) write **free-form formula entry** to compose calculation logic. Founder's framing: the Model Builder is a way for users to create **"shortcuts" for forecasting**, analogous to **Excel functions** — efficient, accurate, reusable building blocks. (Full significance emerges when we reach Forecasting.)

**Why this is compatible with "no black boxes" (important reframe):** an Excel-style formula is *transparent* — you can see the formula, trace precedents, and inspect intermediate values. So a **formula engine done the Excel way preserves Principle 9**, unlike arbitrary hidden code. The two authoring modes unify cleanly: **core models are exposed as callable functions in the formula language** (a core model is `ONETIMECOST(...)` the way `SUM(...)` is built-in). "Reference core models" and "free-form" become one mechanism.

**The five non-negotiables to make this Excel-grade, not dangerous:**
1. **Sandboxed expression engine, never raw code exec.** A proper formula parser/evaluator — deterministic, pure, no system/IO access, bounded execution (no hangs). **Not `eval()`.** (Principle 11 hard line; also a stack decision — use a mature safe expression-evaluation approach, not a hand-rolled language.)
2. **Precedent tracing** (Excel "trace precedents"): store the parsed AST; expose every reference and intermediate value → preserves explainability for user-authored maths.
3. **Cycle detection** on the formula/model dependency graph (Excel circular-ref warning) — extends §1.3.
4. **Versioning + snapshot**: formulas are versioned; each estimate line snapshots formula + inputs + result → reproducible history.
5. **Formula editor UX**: autocomplete, function catalogue/help, live validation/error highlighting. The Excel value is as much the editor as the engine.

**Honest trade-off (Principle 15/16):** a hybrid formula engine is **more powerful and matches the Vision**, but it is a **bigger, higher-risk build** than a composable picker — parser, evaluator, function library, dependency/precedent tracker, validation, sandbox, and editor UI, all held to financial-grade testing. **Recommended sequencing:** (1) build & prove the **core models** with primitives exposed **as functions**; (2) layer the **formula engine** that calls them; (3) ship the **Model Builder UI**. Same destination, staged so untested financial maths never reaches production. Core and client models run through one framework (dogfooding).

---

## 5. Engineering challenges
1. **Phase model prerequisite** (§4.1) — must exist before any timing logic.
2. **Dependency-graph resolution + cycle detection** (§1.3) — the engine must topologically order models and reject/΅break cycles (esp. Gross-Profit-based OpEx).
3. **Tri-series projection** to a monthly grid, with phase-relative periods, for every model.
4. **Adjustments pipeline** composed deterministically and in a defined order (e.g. inflation before payment-term shift?), documented and tested.
5. **Reproducibility** — snapshot definition version + referenced standard rates on each estimate line (Architecture §4.4).
6. **Accounting-policy configurability** (§4.2) without turning into spaghetti — policy as data, applied by the recognition function.
7. **Explainability UI** — every output number must be traceable to inputs, formula, version, and adjustments (no black boxes).

## 6. Suggested improvements (require approval before changing spec)
- **IMP-M1** — Model the engine output explicitly as **three monthly series (Value, Cash, P&L)** as the universal contract.
- **IMP-M2** — Build **timing primitives** (OneTime, MonthlyRecurring, AnnualRecurring, Consumption) once, parameterised by direction + counterparty; Cost/Revenue models compose them.
- **IMP-M3** — Make **P&L recognition a configurable accounting policy** with a documented default (§4.2).
- **IMP-M4** — Make **Adjustments** a shared, ordered pipeline of composable stages.
- **IMP-M5** — Treat model **dependencies as an explicit DAG** with topological execution + cycle detection.
- **IMP-M6** — Separate **ModelDefinition (versioned library)** from **EstimateLine instance**, snapshotting version + rates used.
- **IMP-M7** — Source shared rates (inflation, payment terms, discounts) from **Financial Standards**, inherited with override at instance, snapshotted.

## 7. Reusable assets identified (feeds the Living Platform Model)
- **Calc engine kernel** (Architecture §4.4) — registration, input schema (Zod), tri-series execution, versioning, persisted executions.
- **Timing primitives library** (IMP-M2).
- **Adjustments pipeline library** (IMP-M4): inflation/escalation, payment-term shift, discount, CAPEX/depreciation, up-front.
- **Phase service** (bid-level project timeline) — consumed by every model.
- **Dependency resolver** (topological sort + cycle detection).
- **Financial Standards service** (rate defaults) — shared inputs.
- **Aggregation service** — roll estimate lines up to bid cost/revenue/cashflow/P&L (reused by Forecasting & Reporting).
- **Reusable calculations:** EV = P×Impact; % base; compounding growth; tier lookup; annualise↔monthly.
- **Reusable permissions:** `models.view`, `models.manage` (edit library definitions — powerful, audited), `estimate.edit`.
- **Reusable UI:** Model detail view (the 8-part layout), input forms per model, the tri-series/phasing visualiser, tier-table editor, explainability drill-down.

## 8. Integration with the rest of Skelly
Taxonomy (category classification, CAPEX/OPEX) · Financial Standards (default rates) · Risk module (EMV ← Risk Register) · Accounts (customer payment terms) · Products/Suppliers (supplier terms) · Skelly Bid Engine → Estimates (instantiation) · Forecasting & Reporting (aggregated series) · Audit (definition changes). The tri-series output is the common currency all of these consume.

---

## D. Engineering Specification (draft — pending gap answers)

**Maps directly onto the Architecture's calculation engine (§4.4).**

- **`ModelDefinition`** (library, versioned, **data-driven & client-authorable** per §4.6): `id`, `organisation_id` (null = system/core model, else client-authored), `type` (Cost/Revenue/Risk/OpEx/Tax), `key`, `name`, `description`, `inputSchema`, `calculationPattern` + params, `timingStrategy`, `cashflowStrategy`, `recognitionStrategy`, `allowedAdjustments`, `dependencies`, `version`, `is_system`. Core models ship as system definitions; clients create new definitions via the **Model Builder** using the same fields. **Calculation logic is stored as a parsed formula (AST) referencing built-in functions, core models, and other metrics** (hybrid formula engine, §4.6). All versioned; estimate lines snapshot the definition version + formula used.

- **`FormulaEngine`** (new core component): sandboxed parser + evaluator; a **function catalogue** where core models/primitives and financial functions (inflation, NPV, tier lookup, EMV…) are registered as callable functions; deterministic, bounded, side-effect-free; produces the tri-series output + a **precedent/explanation trace**. Never `eval()`. Underpins both core and client-authored models.
- **`EstimateLine`** (bid instance): `id`, `estimate_id`, `model_definition_key` + `version` (snapshot), `category_id` (taxonomy) + category snapshot, `inputs` (JSON validated by schema), `resolved_series` (Value/Cash/P&L monthly), `applied_adjustments` + rate snapshots, audit. Reproducible & explainable.
- **`Phase`** (deal/estimate timeline): ordered phases (Delivery, Operations, …) with start/duration; the temporal backbone all models read. **(Prerequisite — §4.1.)**
- **Engine services:** `CalcEngine` (run definition→tri-series), `AdjustmentPipeline`, `DependencyResolver` (DAG + cycle detection), `AggregationService`, `FinancialStandardsService`.
- **Output contract:** every model returns `{ value[], cashflow[], pnl[] }` on a monthly grid, plus an **explanation trace** (inputs, formula, version, adjustment steps).
- **Testing (Principle 12 — mandatory here above all):** golden-master tests for each model against the doc's worked examples; property tests (allocations sum to 100%; series total = value); cycle-detection tests; policy tests for each P&L recognition option; snapshot-reproducibility tests.
- **APIs:** `GET /v1/models`, `GET /v1/models/{key}`; estimate-line CRUD under a bid; `POST …/estimate:recalculate`; `GET …/estimate-line/{id}/explain`.
- **Docs:** each model documented with inputs, the three logics, adjustments, worked example, and version history (the doc's 8-part structure IS the documentation template).

## E. Consolidated open questions for the founder
1. **Phases** — how many, contiguous?, and where are their dates defined? (Blocking — §4.1.)
2. **P&L recognition policy** — pick the default and the configurable options for delivery-incurred costs/revenues (§4.2). Resolve the One-Time Cost inconsistency.
3. ✅ **Tiered revenue — largely RESOLVED by Case 5 (§4.3, Doc 26 §4b):** baseline = **absolute-band lookup** (driver→one band) with a **flat-per-entity** charge that can carry **OTC + MRC**; run over a **population of entities** (§4.4a); marginal tiers remain an option; out-of-range = config.
4. **Consumption** — does volume compound year-over-year? transactions per month or year? (§4.3.)
5. **Milestones** — confirm they drive cashflow phasing + must sum to 100% (§4.3).
6. **Resource Cost units** — Duration in days or months; utilisation base (§4.3).
7. **Inflation/Escalation, Payment Terms, Discount Period** — where are defaults set (Financial Standards?) and at what granularity (§4.4).
8. **Templates** — what is a Template vs a Model (§4.4)?
9. **Tax Models** ✅ (no tax models) and **Profit Split/Revenue Share** ✅ **DEFINED by Case 5** (§4.3: rate × revenue base → recipient party, revenue-linked deduction, timing follows collection).
10. ✅ **Model authoring — RESOLVED (hybrid formula engine):** clients create new models via the 8-part architecture using a **formula engine** — reference core models (exposed as functions) **and** free-form formulas ("Excel-functions-as-forecasting-shortcuts"). Core models = pre-built instances. Requires sandboxed engine, precedent tracing, cycle detection, versioning, formula editor. Sequenced: core models → formula engine → Model Builder UI. (§4.6.)
11. **Risk EMV** — does it read from a bid-level Risk Register entity (§4.3)?

*Reusable-asset inventory to be promoted into the standalone Living Platform Model doc (module #2 now reached — will spin it up next).*
