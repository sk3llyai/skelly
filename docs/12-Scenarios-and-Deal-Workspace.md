# 12 — Scenarios (cross-cutting) & Deal Workspace / Bid Engine (preliminary)

> **Status:** Scenarios = ANALYSED as a cross-cutting platform concept. Deal Workspace / Bid Engine = PRELIMINARY structural capture from one screenshot (full detail to come). Screenshots illustrative, not final UI.
> **Source:** Founder clarifications + Deal Workspace "Scenarios / Version Control" screenshot (Capgemini Portfolio Management).
> **Last updated:** 2026-07-06

---

# PART A — SCENARIOS (cross-cutting concept)

## A.1 What a Scenario is
A **Scenario is a named version of a workspace's entire modelling dataset** — its phasing, cost estimates, pricing/revenue estimates, and assumptions — that produces its own set of forecast outputs. Users create multiple scenarios and **toggle between them**; there is always a **Base** scenario plus alternatives.

- **At product level:** variants of the product's *standard business case* (e.g. a pricing analyst modelling different pricing/cost strategies for a product).
- **At deal level:** variants of the bid (e.g. "Base / Market Match" vs "Aggressive / High Probability"), compared to choose a winning bid strategy.

Same concept, two levels. This is effectively **"branches" (à la version control) for financial models** — and the deal UI literally calls it **"Version Control."**

## A.2 Why this is an architecture-defining concept — AND its precise scope (✅ refined 2026-07-06)
Scenarios are a **dimension** the modelling data lives inside — but the founder clarified the **exact, narrow scope**, which is a major simplification:

> **Only THREE sections vary per scenario: Estimations, Forecast, and Simulation.** Toggling a scenario swaps *only* these three. **Everything else is shared deal-level:** Assumptions (inputs), Team, Products, Attachments, Timeline, and the other lifecycle stages (Identification, Qualification, Pipeline, Approval, Outcome, Contract Tracking, Done).
>
> **⭐ Refinement (2026-07-06) — Simulation is scenario-*selectable*, not forked.** Unlike Estimations/Forecast (whose data forks per scenario), the **Bid Simulator is one page where the user *selects* a scenario to simulate** (a new scenario does not spawn a blank simulator). Different scenarios feed different forecast-derived inputs (e.g. walk-out prices). Open: whether bid-strategy inputs are shared across scenarios or per-selected-scenario (Doc 17 B.5.0).

**Consequences:**
- The **`scenario_id` dimension attaches only to Estimations/Forecast/Simulation data** (estimate lines, forecast config, simulation config) — NOT to the whole deal. This is far cheaper than forking the entire deal.
- **Derived metrics reflect the active scenario wherever they appear.** TCV, Margin, Cash Peak etc. shown in Assumptions, the Products table, the Opportunity List, or the Scenarios/Version-Control table are **pulled from the active scenario's Forecast** — so they change as you toggle, even though the *inputs* on those pages are shared. (This is the "pull, don't store" model doing the work.)
- Still **scenario-aware from day one** for those three sections (retrofitting even a narrow scenario dimension is painful), but we do NOT scenario-scope the deal-level context.

## A.3 Design recommendation — copy-on-write branching, SCOPED to 3 sections (Principle 15 decision)
**Decision (recommended):** each scenario owns a **full, independent set** of the **Estimations / Forecast / Simulation** data (cost lines, revenue lines, forecast + simulation config), **forked from Base** when created ("copy-on-write"). Outputs are computed per scenario from its own rows. **Deal-level context (Assumptions inputs, Team, Products, Attachments, Timeline, other stages) is NOT forked — it is shared across scenarios** (refined A.2, 2026-07-06).

- **Why:** maximum explainability and reproducibility (Vision — no black boxes). Each scenario is self-contained; you can always answer "what exactly is in this scenario" without reconstructing overlays. Aligns with our snapshot philosophy (C1).
- **Alternative — overlay/diff** (store Base + only the deltas per scenario): more storage-efficient, but harder to explain and reason about, and complicates the calc engine. Rejected as default; revisit only if scenario counts explode storage.
- **Trade-off:** copy-on-write duplicates rows per scenario (more storage, and a change to Base doesn't auto-propagate to forks). Acceptable — storage is cheap, and *not* auto-propagating is arguably correct (a scenario is a deliberate snapshot). We can add an explicit "re-sync from Base" action if needed.
- **Mechanism:** a `scenario_id` on every modelling entity; a `Scenario` record per workspace; "New Scenario" forks the current one; the workspace's **scenario selector** filters everything to the active `scenario_id`.

## A.4 Scenario outputs / metrics (from the deal screenshot)
Each scenario surfaces computed headline metrics: **Bid Price, Margin %, Win Probability, Expected Value, Cash Peak, Risk**, plus a **Strategy** label (e.g. "Market Match", "High Probability") and **Status** (draft…).
- **Expected Value = Bid Price × Win Probability** (screenshot: £100k × 60% = £60k). A reusable calc.
- **Cash Peak** = the peak cumulative cash position (working-capital requirement) across the forecast — a key output of the tri-series Cash Flow aggregation (Doc 10). £637k in the example.
- **Margin %** = (Bid Price − Cost) / Bid Price (Base shows −636.9% because draft costs ≫ £100k price).
- **Win Probability** likely originates upstream (Qualification stage); **Risk** likely from the Risk models/register.
- **Strategy** = a scenario classification (taxonomy candidate).

## A.5 "Scenario Battle" (Scenario Battle Arena)
A **drag-and-drop head-to-head comparison**: the user drags two scenarios from "Available Scenarios" into **Slot A** and **Slot B**; the arena shows their metrics side by side, with **per-metric winner highlighting** (trophy + green for better, red for worse), and an auto **Decision Summary** at the bottom. Clear / Close Arena controls. (Pairwise, 2 slots.)

### A.5a Key point — it reads the SAME metrics as the Scenarios table (single source)
Founder: **"the values shown for each scenario are taken from whatever values the table has."** So the battle is **not** a separate metric definition — it reads the **same customisable columns/metrics** configured on the Version Control table (§A.5 resource, Doc 17 A.5), which are themselves **derived from each scenario's Forecast**. One computation, shown in the table *and* the battle. (Principle 4.) Metrics seen: Margin, Win Probability, Expected Value, Cash Peak, Bid Price (TCV), Risk Rating.

### A.5b CTO flags
- **Winner logic needs a "direction of goodness" per metric.** Some are unambiguous: Margin ↑ better, Cash Peak ↓ better (less working capital), Expected Value ↑ better. But **Bid Price (TCV) is genuinely ambiguous** — higher price = more revenue *but* usually lower win probability, so "higher = winner" isn't always right (the screenshot trophies the higher TCV). *Recommendation:* define direction per metric where it's clear; for ambiguous ones (Bid Price), **show the difference without declaring a winner**, or let the user set the preferred direction. Avoid implying a false "winner".
- **Decision Summary = a natural AI spot.** Today a templated factual summary ("margin difference 636.9%"). Later, **SkellyAI** could narrate the trade-off ("Base is more profitable but needs £637k more working capital…") — augment, not decide. (AI Gateway.)
- **Ties to choosing the bid.** The winner/trophy concept connects to eventually **promoting one scenario as the chosen bid** (relevant at Approval — open question Doc 12 A.7). Confirm whether Battle just informs, or is where a scenario gets selected.

### A.5c Reuse
- A **drag-and-drop comparison component** (2 slots) over scenario metrics.
- Reads the **shared customisable-columns config** + **aggregation/derived metrics** (no new modelling — pure read/compare).
- Per-metric **compare + winner/colour-coding** helper (with direction-of-goodness config).
- Decision Summary (templated → AI-enhanced).

## A.5.1 ⭐ Approval rounds = VERSION HISTORY within a scenario (clarified 2026-07-06)
Scenarios do **two jobs** at **two levels** — this is the clean model:
- **Top-level scenarios = strategy variants** (Base, Aggressive) — genuinely different approaches, compared in **Scenario Battle**.
- **Version history *within* a scenario = approval rounds** — as the chosen bid evolves through the present → feedback → rework → re-present loop (Doc 17 B.6f), Skelly saves a **snapshot per round**. **NOT** new top-level scenarios — you still see *one* "Scenario 1" in the list, carrying a version timeline (Round 1, Round 2, …). Like document/version history (git / Google Docs).

**⭐ What a round snapshot captures — the ENTIRE scenario, not metrics (founder, 2026-07-06):** a rework changes *real inputs* across stages — costs re-cut, phasing shifted, risk re-priced, tax, revenue/P&L/cash-flow, simulator inputs. So each snapshot = a **complete, immutable copy of the whole scenario state across Estimations (Phasing/Cost/Risk/Tax) + Forecast (Revenue/P&L/Cash Flow) + Simulation.** Metrics are just the *output* — capturing metrics alone would be worthless (can't reconstruct or diff the bid). **Qualification is EXCLUDED** — it's locked once the deal is qualified, so it's fixed context, not versioned. (Nuance: the Deal Score's **win-ability** side still moves round-to-round as the numbers change — that's *why* the score is updatable in Approval, B.6c — while the qualification *scorecard inputs* stay locked.)

**Whole scenarios in a LINEAR lineage (not "lighter than a scenario"):** each round IS a full scenario copy; the useful distinction is the *relationship* between copies, not their scope:
- **Parallel alternatives** — Base vs Aggressive: different strategies kept side-by-side; neither supersedes the other.
- **Linear evolution** — Round 1 → 2 → 3: each a full scenario, but each **supersedes** the prior, converging on one approved bid.
Approval rounds are the second kind. Treating them as a lineage (vs N equal top-level scenarios) is what lets the system know Round 3 is **current** and 1–2 are **history**, makes the diff naturally consecutive, prevents pulling a **stale** round back into the simulator, and keeps the picker uncluttered. Each snapshot links to its **feedback/decision** (Approval Round record: presented → feedback → approve/push-back → next round).

**Gives:** version history of the bid through approval; **round-to-round diff** (what changed & how much — extends Scenario Battle into a change-diff); and a governance **audit trail** ("how did it evolve and why").

**Data model:** a scenario has an ordered list of **round snapshots** (version, timestamp, state, linked feedback/decision). Strategy variants stay separate top-level scenarios; rounds are versions inside one. Design for the common case (one scenario iterating through rounds); don't foreclose taking multiple variants into approval. Ties to Deal-Score-updatable-only-in-Approval (Doc 17 B.6c).

## A.5.2 ⭐ Scenario ORGANISING LAYER — a scenario is a point in a space, not a row in a list (added 2026-07-12, Doc 26 stress test)
Four complex real-world cases (Doc 26) showed an opportunity is rarely one business case — it's a **structured set** varying along **axes**: Scope (product combos), Commercial model (CAPEX+OPEX vs OPEX-only), Volume (units), Price point (budget→walk-out), Contract lot (CAPEX vs OPEX contract), Round (version). A flat list breaks down at 10–40 scenarios and kills the "speed is key" requirement. So Scenarios gain an **organising layer**:

- **Typed dimensions/tags** — each scenario carries axis tags (scope, commercial-model, volume, price-point, lot, round). Enables filter, group, **compare along one axis**, and a **matrix/grid view** of options.
- **Parametric / driver-based scenarios** — a key driver (e.g. units, price point) is a *variable*; **generate a family** by varying it (Case 2: 1/5/10/30 units) instead of rebuilding.
- **Bulk/combinatorial generation** — define {scope options} × {commercial models} → Skelly generates the base-draft grid (Case 1: 5×2=10). Turns "possible" into "with ease".
- **Shared building blocks + controlled propagation** — products/costs defined once, composed into scenarios; an edit propagates to every scenario including it (with snapshot control) → powers the **cost-down loop** (Case 1). Precise propagate-vs-fork boundary extends C1 snapshot-on-use (open question, Doc 26 §8).

**Two comparison/approval SHAPES (both first-class):**
1. **Parallel** — a *set of options* presented side-by-side for one decision/sign-off (Cases 1–2). Uses the option **matrix/grid**; approval pack compares them.
2. **Linear** — *rounds of one bid* evolving (A.5.1 lineage). Uses the version timeline; approval tracks rounds.
The founder's anticipated "refinement to approval/approval-rounds" = recognising **both** shapes: rounds are linear; option comparison is parallel.

**Related deal-structure refinement — Contract/Lot partition:** an opportunity can split into **multiple contracts/lots**, each its own business case, with **roll-up + cross-lot economics** (Case 4: 0% CAPEX recovered in OPEX; Case 2: framework call-offs). A "lot" is a candidate first-class child of the opportunity, with scenarios beneath each lot (open question, Doc 26 §8). Distinct from "scope options" (which products) — a lot is a *contract boundary* over an agreed scope.

*Full analysis, per-engine viability verdict, and the 17-item refinement build-list: **Doc 26.***

## A.6 Reusable assets (Scenarios)
- **`Scenario` entity** + `scenario_id` dimension on all modelling entities.
- **Scenario dimension tags** (scope, commercial-model, volume, price-point, lot, round) + matrix/grid view + axis-compare (Doc 26).
- **Scenario generator** — parametric (vary a driver) + combinatorial ({options}×{models}) base-draft generation.
- **Contract/Lot** structure — opportunity → lots → scenarios, with roll-up + cross-lot economics.
- **`ScenarioService`** — create/fork/list/compare; manages the active-scenario context for a workspace.
- **Scenario-aware `CalcEngine` / `AggregationService`** — compute outputs per scenario.
- **Scenario metrics calcs:** Expected Value (Bid Price × Win Prob), Cash Peak, Margin %.
- **Comparison view** ("Scenario Battle") over the view/semantic layer.
- **Permissions:** `scenario.create`, `scenario.manage`, `scenario.compare`.

## A.7 Open questions (Scenarios)
1. Copy-on-write vs overlay — confirm the branching model (A.3).
2. Does a scenario fork *everything* (phasing + costs + pricing + assumptions) or a subset?
3. Can changes to Base propagate to forks, or are scenarios fully independent once created?
4. Is **Strategy** a managed taxonomy? What's the full set of scenario metrics and their exact formulas (esp. Win Probability & Risk sources)?
5. Scenario approval — is one scenario "promoted" to the chosen bid at Approval stage?

---

# PART B — DEAL WORKSPACE / SKELLY BID ENGINE (preliminary)

> First structural glimpse of the deal-level workspace. Captured for context; full analysis when the founder teaches these stages.

## B.1 The Deal is a Workspace (same shell as Product — reuse confirmed)
The deal "Capgemini Portfolio Management" uses the **same workspace pattern** as a Product (Doc 11 §2): top-bar **Deal Resources** + a sectioned sidebar + scenario selector + comments. This confirms the **reusable `Workspace` shell** should serve both Products and Deals.
- **Deal Resources (top bar):** Assumptions · Products · Team · Attachments · Scenarios. *(New vs product: **Products** — a deal contains multiple products [here "Products: 3"], confirming Product↔Deal many-to-many; and **Team** — deal staffing, likely linking to **Bid Roles** from taxonomy.)*

## B.2 ⭐ The 10-stage bid lifecycle — validates the workflow-engine decision (Architecture §4.5)
The sidebar is the **deal lifecycle**, "Stage 5 of 10", with an **"Advance to Simulating"** action and a **Change Stage** control. Stages:
1. Identification → 2. Qualification → 3. Pipeline → 4. Estimations → 5. **Forecasting** (current) → 6. Simulating → 7. Approval → 8. Outcome → 9. Contract Tracking → 10. Done.
(Plus a Dashboard view.)

**This directly validates Architecture ADR-006 (workflows as explicit, configurable state machines).** A deal is a state machine advancing through governed stages, with transitions ("Advance to…") and per-tenant configurability (enterprises will want their own stage names/gates — Vision: structure without rigidity). Each stage maps to domains we've anticipated: Qualification, Estimations (Models/EstimateLines), Forecasting (tri-series aggregation + Scenarios), Simulating (Simulations domain), Approval (Approvals), Outcome (win/loss → feeds Product Performance + Benchmarks), Contract Tracking.

## B.3 How it ties together (the platform coming into focus)
- **Estimations** stage = the Standard Costs/Pricing EstimateLine tables + Model Creation wizard (Doc 11 A2).
- **Forecasting** stage = aggregate the tri-series across estimate lines, per **Scenario**, into deal metrics (Bid Price, Margin, Cash Peak…). This is where the Models engine + Scenarios + the "formula shortcuts" (Doc 10 §4.6) pay off.
- **Blueprint pre-fill** (Doc 11 A2.6) seeds the Estimations/Forecasting workspace from the deal's products' standard business cases.
- **Outcome** feeds back into **Product Performance Analysis** and **Benchmarking** (the compounding-knowledge loop).

## B.4 Preliminary reusable assets / notes
- **`Workspace` shell** reused (Product + Deal).
- **`DealLifecycle`** = configurable state machine (stages, transitions, gates) — the workflow engine.
- **`Deal` ↔ `Product`** many-to-many; **`DealTeam`** (users + Bid Roles).
- Deal-level **Scenarios**, **Assumptions**, **Attachments** reuse the same services as Product.

## B.5 Open items (Deal Engine — for later teaching)
Full detail of each of the 10 stages (esp. Qualification → Win Probability; Simulating; Approval; Outcome; Contract Tracking); the Team/Bid-Roles model; how stage gates/permissions work; and how Forecasting composes scenarios + models into deal-level outputs.
