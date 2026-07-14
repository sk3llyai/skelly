# 26 — Complex Bid Cases: Stress Test & Scenario/Approval Refinement

> **Status:** Design stress test (2026-07-12). Four founder-provided real-world bid cases run against the whole platform (Products, Models/Templates, Estimations, Forecast, Scenarios, Simulation, Approval) to check they are **viable, efficient, flexible, accurate, robust** — and to refine how Scenarios + Approval work.
> **Source:** Founder — 5 cases (1 product-combination options; 2 framework/volume; 3 RFI→tender; 4 direct-award split contracts; 5 tiered per-payer pricing + revenue-share).
> **Verdict headline:** All 4 are executable on the architecture we've designed. The primitives hold. But "with *ease*" (the founder's bar) requires an **organising layer on top of Scenarios** and **two shapes of Approval**. Most refinements are extensions of existing primitives, not new foundations — which is itself a strong validation of the architecture.

---

## 0. The one insight that ties all four cases together

In every case, the "opportunity" is **not one business case**. It is a **structured set of related business cases** that vary along one or more **axes**:

| Case | Axes the opportunity varies along |
|---|---|
| 1 | **Scope** (5 product combinations) × **Commercial model** (CAPEX+OPEX vs OPEX-only) = 10 |
| 2 | **Volume** (1/5/10/30 units) × **Context** (base / +upsell / +extra support) × **Price point** (budget→walk-out) |
| 3 | **Lifecycle stage** (RFI budgetary → official tender, 10 months apart) |
| 4 | **Contract partition** (CAPEX contract vs OPEX contract) with **combined** economics |
| 5 | **Tiered per-payer pricing** × **many uncertain payers** (sign-up mix) with a **revenue-share** deduction |

So the core refinement is: **treat a Scenario as a point in a multi-dimensional space, not an item in a flat list.** Give scenarios **typed dimensions**, let users **generate** families of them parametrically, keep the **shared building blocks** (products/costs) defined once and composed in, and support **two comparison shapes** — *parallel* (options side-by-side for a decision) and *linear* (rounds of one bid evolving, already designed in Doc 12 A.5.1).

This is the "refinement to how we handle approval and approval rounds" the founder anticipated: **approval rounds (linear lineage) are one shape; option-comparison approval (parallel set) is the other.** Both must be first-class.

---

## 1. Case 1 — Product-combination options × commercial models

**The deal.** Company Y can replace Government X's legacy systems with Products A, B, C. Sales wants 5 scope options presented: A+B+C, A+B, A+C, A, B. Product **C depends on delivery of A** (dependency constraint). Each option needs its own business case (different estimates/risks/prices). Then each option is offered under **2 commercial models**: (a) CAPEX+OPEX (OTC + MRC, deliberately *lower* OTC because the customer can't pay much upfront); (b) OPEX-only (no OTC, *higher* MRC — and Company Y's **cash-flow rules** further inflate MRC → higher TCV). ⇒ up to **10 scenarios**, all needing approval before submission, so **speed is critical**. After the first draft sales says "too high," triggering a **cost-reduction loop**: solution designers re-optimise costs; commercial justifies the changes via a **cost summary table** highlighting the optimisations.
*(Minor note: the brief says "6 options" then lists 5 / "5 business cases" — treated as 5.)*

**How Skelly executes it**
- **Products A/B/C** are defined once (each with its own estimate, cost model, standard pricing) — validates the product-centric model. A **scope option** = a selection of products composed into a deal scenario. Because A's estimate lives on Product A, it is **reused** across every option that includes A — you don't re-estimate A five times.
- **Product dependencies** (C requires A) → we need first-class **product dependency/constraint rules**, used to (i) validate/flag invalid scope combinations and (ii) constrain **phasing** (C's delivery can't precede A's). *(New requirement — capture.)*
- **Commercial model** (CAPEX+OPEX vs OPEX-only) is a **charging-structure transform** applied to the same cost base: split into OTC/MRC, set margins, and apply financing/cash-flow rules. This should be a **reusable, swappable "commercial/pricing model"** — apply model X to scope Y → a scenario. Validates the "Model" abstraction, extended to the **pricing/charging** layer, not just cost.
- **Cash-flow rules inflating MRC** = a company financial policy (cost of carrying deferred payment to hit a return/cash target). Belongs in **Company Parameters / Financial Standards** (currently parked) as a **rule that adjusts pricing to satisfy a cash-flow constraint**. *(Capture.)*
- **10 scenarios fast** → **bulk/combinatorial generation**: define {scope options} × {commercial models}, generate the base-draft grid. This is the difference between "possible" and "with ease."
- **Approval of the set** → the pack presents **multiple options side-by-side** (parallel comparison), not one evolving bid. Refines Approval.
- **Cost-reduction loop** → each optimisation pass is a **round/version** (Doc 12 A.5.1 lineage) and the **cost summary table = the round-to-round cost diff**. The founder's suggested **"cost optimisation tool"** = a workspace that tracks cost iterations, produces the change/optimisation summary automatically, and (AI-ready) can *suggest* reductions. Strong feature; validates the lineage/diff design at the cost level.

**Verdict:** ✅ Executable. Needs: product-dependency rules, commercial/pricing-model as a swappable transform, cash-flow pricing rules, bulk scenario generation, parallel-comparison approval, cost-optimisation/diff workspace.

---

## 2. Case 2 — Framework agreement, volume uncertainty, upsell, negative margin, sensitivity, bid simulation

**The deal.** Formal tender: framework agreement, 3 years, **up to 30 units, min 1**. Evaluation criteria **Price 90% / Unit size 10%**. Submission requires a **pricing table**: CAPEX price (HW) + OPEX price (Support) for the full 30 units. Sales intelligence: the **expected/committed first order is 10 units** (not guaranteed). They also see **upside**: an upsell of +10 units elsewhere, and **support extending beyond the 3-year framework**. That upside justifies pricing the framework **aggressively — CAPEX at negative margin** — recovering via future support + upsell. Requires **thorough sensitivity**: unit scenarios (1/5/10/30) and context scenarios (10 + extra 10; 10 + extra support). At submission, strategy is to **submit at tender budget and discount down to the modelled walk-out**. Plus a **bid simulation**: 3 known competitors with **known historical prices** and unit sizes → ranking.

**How Skelly executes it**
- **Evaluation criteria (Price 90 / Size 10)** → straight into the qualification evaluation table + **Expected Score / win-probability** engine (Doc 19, 23). Validates.
- **Volume as a first-class driver** with **min / max / expected** (1 / 30 / 10). Models must accept **quantity as a parameter** (per-unit economics × quantity). Then **parametric sensitivity generation**: vary the units driver → generate the 1/5/10/30 family automatically rather than rebuilding. *(Key refinement — parametric scenarios.)*
- **Committed vs Expected vs Upside layering.** The pricing decision references a **broader business case than the contracted scope**: committed (10 units) + expected upside (+10) + extended support. Skelly should model these as **layered/probability-weightable** components and show a **combined / risk-adjusted lifetime value** that *justifies* the aggressive headline price. *(Refinement — cross-scenario/portfolio economics.)*
- **Negative margin** on CAPEX must be fully supported (no engine assumption that margin ≥ 0). Validates flexibility; add a test.
- **Multiple price points** (budget/anchor → target → walk-out) modelled on one scenario → strategy of anchoring high and discounting. We have walk-out; **add budget/anchor points** and the discount path. *(Refinement.)*
- **Tender pricing table** as a **configurable submission output** matching the tender's required format (CAPEX/OPEX × 30 units). Ties to the export/render + Pack/Document builder. *(Refinement — output templates.)*
- **Bid simulation with known competitors** → the Bid Simulator must handle **deterministic competitor modelling** (known historical prices + unit sizes → ranking), not only probabilistic win %. Ties to onboarding/historical import + benchmark (Doc 23, 24). Validates + extends.
- **Approval** = multi-scenario/sensitivity **parallel-comparison pack** again.

**Verdict:** ✅ Executable. Needs: quantity-driven models + parametric sensitivity generation, committed/expected/upside layering with combined value, multiple price points + discount path, tender-format output tables, competitor modelling in simulation.

---

## 3. Case 3 — RFI/budgetary → official tender (10 months later)

**The deal.** Government X issues an **RFI** wanting a budgetary technical/commercial proposal, **short deadline**. Requirements are **vague**; risk both ways (too high → not invited to tender; too low → can't deliver later). Commercial builds an initial business case on early assumptions; it needs approval before submission. **Pre-approved solutions/products/submissions** for the budgetary stage would make this far faster. **10 months later** the official tender drops → a **new business case** that uses the **budgetary one as a benchmark/starting point**, then tweaks scope and pricing to the detailed requirements.

**How Skelly executes it**
- **Speed at RFI** → **Standard Costs / Standard Pricing / pre-approved offers (price books)** (Products module) let commercial assemble a fast, defensible budgetary number. *(Validates Standard Costs/Pricing; add the "pre-approved offer / price book" concept explicitly.)*
- **Light approval path** → the **Approval Matrix** (Doc 17 B.6f) must support a **fast-track / pre-approved tier** for early-stage/budgetary submissions (email-level or auto-approved from a price book) vs full approval for binding bids. Validates the configurable matrix; add the fast-track tier.
- **RFI → Tender benchmarking** → the tender business case is **seeded from the prior budgetary case** (clone as starting point) via the **Benchmark/Prefill engine + Similarity matcher** (Doc 17 B.2). This is **deal-from-deal lineage across a 10-month gap** — either a new deal that references the prior, or a stage progression on a long-lived opportunity. *(Refinement — cross-deal benchmarking + a pre-tender RFI stage in the lifecycle.)*
- **Vagueness/risk** → early assumptions captured explicitly with the **Risk register (EMV)** and flagged as low-confidence, so the tender pass knows what to firm up.

**Verdict:** ✅ Executable. Needs: explicit pre-approved offers/price books, fast-track approval tier, deal-from-deal benchmarking across time, an RFI/pre-tender stage in the lifecycle.

---

## 4. Case 4 — Direct award, split CAPEX/OPEX contracts, target price, 0% CAPEX margin

**The deal.** No formal tender; Government X picks Company Y directly with a **target budget**, and wants **two separate contracts**: a **CAPEX contract** (all one-time — HW, delivery, implementation) and an **OPEX contract** (all monthly-recurring — support & maintenance). Two separate business cases. Acceptable to run **0% margin on CAPEX**, recovered in OPEX.

**How Skelly executes it**
- **Contract/lot partition.** One opportunity → **multiple contracts**, each its own business case, with a **combined roll-up** and **cross-contract economics** (0% on CAPEX recovered in OPEX). This is a **different partition** of a deal than "scope options" — it's splitting one agreed scope into **contract lots**. Recurs across cases (framework call-offs in Case 2; options in Case 1). *(Key refinement — a contract/lot structure within a deal, with roll-up + cross-lot margin reasoning.)* Aligns naturally with our CAPEX/OPEX classification — now used as a **contract boundary**, not just a cost tag.
- **Target-price / top-down mode.** Given a target price, work **backwards**: check margin at target, or cost-down to hit it. Adds a **price-led** mode alongside the existing **cost-led** build. *(Refinement — target-price/backward pricing.)*
- **Cross-contract margin** (0% here, recover there) is just the combined view over the two lots — falls out of the roll-up.

**Verdict:** ✅ Executable. Needs: multi-contract/lot deal structure with roll-up + cross-lot economics, target-price/top-down pricing mode.

---

## 4b. Case 5 — Tiered per-payer pricing, many uncertain payers, revenue-share (added 2026-07-12)

**The deal.** Government X wants passenger data for **10 trainlines** in a national station. Company Y provides the data on a **tier-based price** set by each trainline's annual passengers — but **the trainlines pay the fees** (they receive the data / send it to Government X), so the *payers are the trainlines, not the requester*. Pricing table (flat **OTC £50k** per trainline; **MRC scales by passenger band**): 0–100k → 5 lines @ £25k MRC; 100–200k → 1 @ £50k; 200–300k → 3 @ £75k; 300–400k → 1 @ £100k (10 expected). **Not all trainlines are guaranteed** to sign up → model different sign-up scenarios. **Revenue share:** Government X takes **10% of revenue collected** from the trainlines.

**What's genuinely new here (vs Cases 1–4)**
- **Tiered / lookup pricing** — price is a *step function of a driver* (passengers → band → OTC/MRC rate). This is the **"tiered revenue" gap we already flagged in Doc 10** — Case 5 makes it concrete and mandatory. Needs a **tiered/lookup pricing model type** (driver value → rate band), not just a smooth formula.
- **A population of many heterogeneous payers inside one deal** — 10 named billable entities, each with its own attribute (passengers) → tier → OTC+MRC → revenue. Like Case 2's "units" but the entities are **distinct payers with different tiers**, not identical units. Needs a **billable-entity / subscriber-population** concept: N entities, each classified → priced → rolled up.
- **Sign-up mix uncertainty** — which/how many sign up per band is unknown → **parametric mix scenarios** (all 10 / expected 5-1-3-1 / only the small tier / etc.). Directly exercises the parametric-scenario refinement (§6.2).
- **Revenue-share / royalty deduction** — 10% of collected revenue paid to a third party. Needs a **revenue-share model type**: a payout = %(or formula) of associated revenue, hitting P&L (gross vs net) and Cash Flow (payment out) with its own timing. Expressible today via the formula engine (a cost line referencing revenue), but common enough to be first-class.
- **Flexible party roles** — the **payer (trainlines) ≠ the requester (Government X)**, there are **many payers**, and the **revenue-share partner** is the requester. The Accounts/relationship model must let a deal carry **distinct party roles** (requester · payer(s) · revenue-share partner), not assume one customer. *(Accounts refinement, Doc 14.)*

**How Skelly executes it.** Each trainline = a billable entity → passenger attribute picks its tier → tier sets OTC+MRC → tri-series revenue (OTC one-time + MRC×months) → summed across signed entities → **less 10% revenue share** (revenue-linked deduction) → net P&L/cash flow. Sign-up uncertainty handled by **parametric mix scenarios**. Expected mix (5-1-3-1) = base scenario.

**Verdict:** ✅ Executable. Confirms the **tiered-pricing gap** must be built; adds **revenue-share model type**, **billable-entity population**, and **party-role flexibility**. Nothing breaks — again all extensions of existing primitives.

## 5. Per-engine viability verdict (the founder's explicit check)

| Engine | Viable? | Notes |
|---|---|---|
| **Products / Solutions** | ✅ | Define-once-compose-many is exactly what Cases 1–2 need; dependency rules + price books to add. |
| **Models & Templates (tri-series)** | ✅ | Value/Cash-flow/P&L series handle OTC/MRC, negative margin, quantity-driven, deferred support. Add: commercial/pricing-model transform + cash-flow rules as model-level policy. |
| **Estimations (Phasing/Cost/Risk/Tax)** | ✅ | Phasing must honour product dependencies (C after A); Risk EMV carries RFI vagueness. |
| **Forecast (Rev/P&L/Cash Flow)** | ✅ | Produces the business-case output per scenario/lot; cash-flow view is what drives Case 1's MRC inflation and Case 4's recovery logic. |
| **Scenarios** | ✅ *with the organising layer* | Needs typed **dimensions**, **parametric/bulk generation**, **shared-block propagation**. Raw copy-on-write works but is manual at 10–40 scenarios. |
| **Simulation** | ✅ | Add deterministic **competitor modelling** + multiple **price points**/discount path. |
| **Approval** | ✅ *with two shapes* | **Parallel option-comparison** pack (Cases 1–2) alongside **linear rounds** (Doc 12 A.5.1); plus **fast-track tier** (Case 3). |

**Efficiency caveat (honest):** the architecture makes all four *possible* today; it makes them *easy* only once the scenario **organising layer** (dimensions + generation + propagation) and the **two approval shapes** exist. Those are the highest-value refinements because "speed of commercial work is key" appears in three of the four cases.

---

## 6. Consolidated refinements (the build list)

**A. Scenario organising layer (highest priority)**
1. **Typed scenario dimensions/axes** — Scope · Commercial model · Volume/quantity · Price point/strategy · Contract lot · Round(version). Scenarios are tagged and filtered/compared along an axis; a **matrix/grid view** for options.
2. **Parametric / driver-based scenarios** — key drivers (quantity, price point) are variables; generate a family by varying one.
3. **Bulk/combinatorial generation** — {options} × {commercial models} → generated base drafts.
4. **Shared building blocks + controlled propagation** — products/costs defined once, composed into scenarios; edits propagate to all including them (with snapshot control) → powers the cost-down loop.

**B. Approval refinements**
5. **Two approval shapes** — *parallel* option-comparison pack (a set signed off together) **and** *linear* rounds (Doc 12 A.5.1). Both first-class.
6. **Fast-track / pre-approved tier** in the Approval Matrix for RFI/budgetary + price-book submissions.

**C. Deal structure**
7. **Contract/lot partition** — one opportunity → N contracts/lots, each a business case, with roll-up + cross-lot economics.
8. **Committed / expected / upside layering** — probability-weightable, with a combined risk-adjusted lifetime value that justifies aggressive pricing.

**D. Pricing & modelling**
9. **Commercial/pricing-model transform** — swappable charging structures (CAPEX+OPEX, OPEX-only…) applied to a cost base.
10. **Cash-flow pricing rules** — company policies that adjust pricing to hit cash-flow/return constraints (Financial Standards).
11. **Multiple price points + discount path** — budget/anchor → target → walk-out on one scenario.
12. **Target-price / top-down (price-led) mode** — work backward from a target price.
13. **Product dependency/constraint rules** — validate combinations; constrain phasing.

**E'. Pricing & modelling (Case 5 additions)**
18. **Tiered / lookup pricing model** — price as a step-function of a driver (passengers → band → OTC/MRC). *(Confirms the Doc 10 tiered-revenue gap — now mandatory.)*
19. **Revenue-share / royalty model** — payout = %/formula of associated revenue to a third party; hits P&L (gross vs net) + cash flow with its own timing.
20. **Billable-entity / subscriber population** — N heterogeneous payers inside one deal, each attribute → tier → price → roll-up, with sign-up mix uncertainty.
21. **Flexible party roles on a deal** — requester · payer(s) · revenue-share partner distinct (payer ≠ requester; multiple payers). *(Accounts refinement.)*

**E. Outputs & intelligence**
14. **Configurable submission outputs** — tender-format pricing tables via export/render + Pack builder.
15. **Cost-optimisation workspace** — tracks cost iterations, auto-produces the change/optimisation summary (the cost diff), AI-assisted suggestions.
16. **Competitor modelling in simulation** — known historical prices/sizes → deterministic ranking (+ probabilistic).
17. **Deal-from-deal benchmarking** across time + an **RFI/pre-tender stage** in the lifecycle.

---

## 7. What this VALIDATES

- **Product-centric composition** (define once, compose many) is the backbone that makes Cases 1–2 tractable.
- **Tri-series calc engine** already spans OTC/MRC, deferred recognition, negative margin, quantity — no structural change, only added transforms/rules.
- **Scenario copy-on-write + linear-lineage rounds** (Doc 12 A.5.1) is the right base; it needs an *organising layer*, not a redesign.
- **Configurable Approval Matrix** (Doc 17 B.6f) already anticipated per-company processes; it now also spans two *shapes* and a fast-track tier.
- **Benchmark/Prefill, Marrow, AI-readiness, onboarding/historical import** are exactly what Cases 2–3 lean on.

Nothing in the four cases breaks the architecture. Every requirement lands as an **extension of an existing primitive** — the strongest possible signal that the foundations are right.

---

## 8. Open questions (for later)

- **Scenario explosion UX** — with dimensions × generation, a deal could carry 40+ scenarios. How do we keep the workspace legible (matrix view, "active set," archiving losing options)?
- **Propagation vs snapshot boundary** — precisely when does editing a shared product propagate vs fork (deal-wide vs scenario-scoped)? Needs a crisp rule (extends C1 snapshot-on-use).
- **Contract lots vs scope options vs scenarios** — confirm the data model: is a "lot" a first-class child of the opportunity, with scenarios beneath each lot?
- **Combined value governance** — how much unapproved future upside can justify a negative-margin headline? Likely an approval-policy control.
- **Cash-flow rule shape** — parameters of the MRC-inflation/financing rule (discount/cost-of-capital, target cash position).

## 9. Cross-references
- Scenarios & rounds — Doc 12 (esp. A.5.1)
- Bid Engine lifecycle / Approval — Doc 17 (B.3 Estimations, B.4 Forecast, B.5 Simulation, B.6 Approval)
- Cost/Revenue/Product interaction — Doc 21
- Qualification scoring / Win probability — Docs 19, 23
- Onboarding / historical import — Doc 24
- Living Platform Model — Doc 15
- Decision Log / Open Questions — Doc 08
