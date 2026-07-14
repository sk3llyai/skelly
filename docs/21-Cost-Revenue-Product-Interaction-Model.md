# 21 — Cost / Revenue / Product Interaction Model (definitive)

> **Status:** ✅ FINALISED (built collaboratively with the founder, 2026-07-06). The single reference for how cost, revenue, risk and tax lines link to products, to revenues, and to each other. **Supersedes** the earlier partial decision that "revenue = one product" (Doc 17 B.4.1a) — revenue now works exactly like cost.
> **Last updated:** 2026-07-06

---

## 1. Entities
- **Line** — a cost / revenue / risk / tax estimate line. Every line carries: **Category** (→ CAPEX/OPEX + P&L class + Cash-Flow class), **Phase** (timing), **Model** (the calc that generates its monthly Value/Cash/P&L series), **Currency**, Amount, optional **Header** (grouping), and lives in a **Scenario**.
- **Product** — a single offering (has a standard business case: Estimations + Forecast).
- **Solution** — a **bundle of multiple products** (built like a Product + a multi-product field in Assumptions).
- **Deal** — contains products/solutions; its Estimations & Forecast are scenario-varying.

## 2. The three links (this is the whole model)

### 2.1 Line → Product attribution — the product-margin lens (SAME for costs AND revenues)
Every **cost and revenue** line is attributed to product(s), one of two ways:
- **Direct** → exactly one product (the simple case).
- **Shared** → **allocated across multiple products** by a method.

**Allocation methods (identical set for cost & revenue — consistency locked):** pro-rata by revenue · pro-rata by direct cost · equal split · **custom fixed %**. **No forced default; all available; custom always present.**
- **Live/derived:** the three auto methods **recompute automatically** as data changes → **order-independent** (incomplete data self-corrects). A calc-engine dependency (Doc 10 DAG).
- **Cycle-safe:** an allocation base **excludes the line being allocated** (e.g. a shared revenue split "by revenue" uses each product's *other* revenue) → no circular references.
- **Manual override:** editing a share switches that line to **custom, pre-seeded with the current auto split** (small tweaks; totals 100%); flagged "manually adjusted" with the original shown; **fully reversible** (switch back to an auto method; reverting discards manual tweaks).
- **Snapshot at Approval** so the submitted bid is locked.
- **By level:** at **Product** level (one product) everything is Direct. **Shared applies at Solution & Deal level** (multiple products).

### 2.2 Cost → Revenue allocation — the revenue-profitability lens
A **cost** can be allocated (fully or split) across one or more **revenue** lines → per-revenue profitability. This is **independent** of product attribution (§2.1).

### 2.3 Revenue → Product
Handled by §2.1 (Direct or Shared). **The old "revenue = one product" rule is dropped** — a revenue for a solution/bundle is simply a **Shared revenue** allocated across its products.

### 2.4 ✅ Per-product-share recognition (2026-07-06) — recognition follows each product's phase
When a shared revenue (or cost) is allocated across products, **each product's *share* carries its own timing & P&L/cash recognition** — it is **not** one recognition rule for the whole line. Rule:
- **Default:** a share recognises over **its product's operations phase**. Because products can go live at different times, a later-go-live product's share **automatically defers** until its phase begins.
- **Override:** any share can use a **custom** cash/P&L recognition profile (fix / defer / custom) for special cases (e.g. deferred-then-spread).
- This uses the existing per-line recognition capability (Doc 10 / Doc 17 B.3.3), now applied **per allocated share**.
This single rule is what lets Skelly model divergent recognition across products within one combined revenue stream (see the worked example, §5.1).

**✅ Recognition is USER-CONTROLLED, not auto-determined (decision 2026-07-06).** Revenue-recognition timing is complex and judgment-heavy (IFRS 15 / ASC 606 — recognise when *control transfers*: **ownership transfers to customer → point-in-time**; **company retains & supports → over-time**). Skelly does **not** try to auto-derive the treatment — the **user chooses** it (via fix/defer/custom per share). The recognition **mechanics are already fully covered** by that existing capability. **✅ Canonical recognition methods (standardised 2026-07-06) — one vocabulary used everywhere, for P&L recognition AND cash timing, identical whether or not ownership transfers:**
1. **Point in Time** — recognise fully in one chosen period *(was: fix / single month / first month of ops / when incurred)*.
2. **Straight Line** — recognise evenly across a chosen period/phase; a later start = deferral *(was: defer / deferred across / straight line)*.
3. **Milestone** — recognise per user-defined milestones (allocations sum to 100%).
4. **Custom** — any user-defined monthly schedule.
*(Depreciation dropped as a named preset — it's just **Straight Line over the asset life** + CAPEX classification; fancier schedules → the custom model builder. No capability lost.)*
These are **friendly labels on the existing fix/defer/custom capability, not new machinery.** The ownership-transfer toggle only changes the **default pick**, never the names.
- **The ONLY new element = a single "ownership transferred?" toggle** on the product/solution (transfers vs retained). It is a lightweight **nudge + context**, not a new mechanism: (1) **pre-selects a sensible recognition default** (transferred → point-in-time; retained → over-time), and (2) **documents the rationale** for explainability/audit. Also a meaningful business fact beyond recognition (IP, support obligations, who carries the asset).
- **Store the chosen treatment + rationale** (no black boxes).
- **Future:** SkellyAI may *suggest* a treatment from the ownership flag + contract; human confirms (augment, Doc 18).

## 3. Outputs (what the links produce)
- **Product margin** = Σ(revenue attributed to the product) − Σ(cost attributed to the product), using each line's direct or allocated share.
- **Revenue profitability** = revenue − costs allocated to it (§2.2).
- **Deal P&L & Cash Flow (Business Case Output)** = all lines aggregated by **Category → statement class** (Doc 17 B.4).
- **Product / Solution Performance** = margins aggregated across all deals the product/solution appears in.

## 4. Two independent lenses (locked)
Product attribution (§2.1) and cost→revenue allocation (§2.2) are **deliberately separate** and *can* legitimately differ — they answer different questions ("how did each product do?" vs "is this revenue line profitable?"). Chosen: flexibility + user control over automatic reconciliation.

## 5. Complex cases — validated against the model
| Case | How the model handles it |
|---|---|
| **Solution revenue: 1 revenue line covers 2+ products** (buyer pays for a solution) | Shared revenue, allocated across the products (§2.1). Each product gets its revenue share → per-product margin works. |
| Shared platform cost across several products | Shared cost, auto-allocated (§2.1). |
| One cost supports 2 revenue lines | Cost→revenue split (§2.2). |
| A cost both shared across products AND split across revenues | Both lenses apply, independently. |
| Bid-wide overhead tied to no single product/revenue | Allocated by a driver across all, flagged **Indirect**. |
| A product sold across many deals | Per-deal margin; portfolio-level Performance aggregates across deals. |

## 5.1 Worked example — "Government B" (validates the model against a hard case)
**Scenario:** Company A sells a **solution** (Product A + Product B) to Government B. Product B needs Product A live for ~3 months first, plus 3 months of confirmed revenue → **Product A goes live ~11 months before Product B**. Cost split: **A = 1%, B = 99%**. Revenue is a **combined usage-based** stream for the whole solution ($1 per 15M users/yr). Recognition: A's revenue recognised across the whole 10-yr contract; **B's 99% must defer for the first 11 months then spread over the remaining term.**

**How the model handles it:**
- **Costs:** A's costs (1%) Direct→Product A in A's phases; B's costs (99%) Direct→Product B in B's phases (start ~month 11). Staggered delivery = **Phasing** (§Doc 17 B.3.1). ✓
- **Revenue:** one **Consumption Revenue** line (combined cash), **Shared** across A (1%) / B (99%) (§2.1). ✓
- **Recognition (§2.4):** A's 1% share recognises over A's operations phase (full contract); **B's 99% share recognises over B's operations phase (starts month 11) → auto-defers the first 11 months and spreads over the rest.** ✓
- **Cash vs P&L:** B's cash collected from the start (combined usage) while P&L defers → the **tri-series (Value ≠ Cash ≠ P&L)** represents "collected but not yet recognised" natively. ✓
- **Result:** early-year P&L reflects only A's 1% (plus deferred B), then B's recognition kicks in from month 11 — exactly the intended behaviour, all configurable, no bespoke code.

**Open item surfaced:** the deferred B revenue is a **deferred-revenue balance** (cash held, not yet profit) — a balance-sheet concept. The tri-series captures cash & P&L separately, but a **light "deferred revenue" / balance-sheet view** may be worth surfacing for complex deals (re-raises the earlier Balance-Sheet question — Doc 17 B.4). Flagged, not yet built.

## 6. By level (summary)
| | Product-level attribution | Cost→revenue allocation |
|---|---|---|
| **Standard Product** (1 product) | All **Direct** | Available |
| **Standard Solution** (many products) | Direct **+ Shared** (allocation) — for costs *and* revenues | Available |
| **Deal** (products/solutions) | Direct **+ Shared** — for costs *and* revenues | Available |

## 7. Data-model implications
- Cost & revenue lines each have: `category_id`, `phase_id`, `model` (+ version), `currency`, `amount`, `header?`, `scenario_id`, and a **product attribution** = either `product_id` (direct) or a set of **allocation rows** `{product_id, method|percent}` (shared).
- Cost lines additionally have **revenue-allocation rows** `{revenue_line_id, amount|percent}` (§2.2).
- All allocations are **live/derived** (recomputed) unless custom/overridden; snapshotted at Approval.

*This is the definitive interaction model. Any future change to how cost/revenue/product link is an amendment to this doc.*
