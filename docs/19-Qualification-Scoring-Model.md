# 19 — Qualification Scoring Model (built collaboratively)

> **Status:** ✅ FINALISED (founder-confirmed 2026-07-06 via visual mockup). Belongs to **Identification** (Doc 17 B.1). Produces the **Deal Score**; ranking/benchmarking of scores happens in **Pipeline**.
> **Last updated:** 2026-07-06
>
> **Confirmed in full:** 5 pillars incl. Competitive Landscape; axis split (Attractiveness = Strategic Alignment + Commercial Opportunity; Win-ability = Customer Relationship + Capability Fit + Competitive Landscape); Deal Score 0–100 via `(weightedAvg − 1)/9 × 100`; equal default weights, configurable per company; quadrants **Pursue / Challenge / Selective / Decline**; advisory threshold default **40**; **no hard veto** (matrix + threshold suffice); provisional score + completeness % when unscored.

---

## 1. Purpose
Turn the Identification sliders into an **objective, comparable Deal Score (0–100)** plus a **two-axis read**, so opportunities are qualified on data, not gut feel — and ranked against each other to prioritise (Vision).

## 2. Confirmed decisions (founder, 2026-07-06)
- **Five scoring dimensions** (incl. a new **Competitive Landscape** score).
- Output **both** a single **Deal Score (0–100)** *and* a **two-axis Attractiveness × Win-ability** read.
- **Advisory, company-set threshold** flags likely no-bids; a human still decides at the gate.
- **Weights configurable per company** (Company Parameters), defaulting to equal.
- Overall score scale is **0–100** (matches the "Deal Score X/100" in the UI).

## 3. The five dimensions (each scored 1–10 via sliders)
| # | Dimension | Captures | Inputs (from Identification) |
|---|-----------|----------|------------------------------|
| 1 | **Strategic Alignment** | Does this fit our strategy? | Score + Sales Strategy |
| 2 | **Commercial Opportunity** | Size/value/attractiveness | Score + Expected TCV/ACV, Revenue Model, Pipeline Impact, Requirements |
| 3 | **Customer Relationship** | Strength of our position with this customer | Score + Incumbent?, Previous opps, Relationship background |
| 4 | **Capability Fit** | Can we deliver? | = **average of** Solution, Delivery Confidence, Resource Availability sliders |
| 5 | **Competitive Landscape** | How we stack up vs competitors | *(new Score)* + Competitors table, Incumbent, Context |

## 4. Two axes (the same 5 dimensions, grouped — no double counting)
- **Attractiveness ("should we want this?")** = Strategic Alignment + Commercial Opportunity.
- **Win-ability ("can we win & deliver?")** = Customer Relationship + Capability Fit + Competitive Landscape.
The matrix plots Attractiveness (y) × Win-ability (x); the single Deal Score is the weighted blend of all five. This exposes the classic trap: *attractive but unwinnable*.

## 5. Proposed computation (awaiting confirmation)
- Each **dimension score** d_i ∈ [1,10]. Capability Fit = mean(Solution, Delivery Confidence, Resource Availability).
- **Deal Score (0–100)** = normalise the weighted average of the five to 0–100:
  `weightedAvg = Σ(d_i × w_i) / Σ(w_i)` (result 1–10) → `DealScore = (weightedAvg − 1) / 9 × 100`.
  *(This true 0–100 normalisation lets a mostly-low/unscored deal read very low, e.g. the mock's "7/100". Alternative: `weightedAvg × 10` = range 10–100 — simpler but never below 10. **Recommend the 0–100 normalisation.**)*
- **Axis scores** computed the same way over each axis's dimensions (for the matrix position).
- **Default weights:** each of the 5 dimensions = 20%; within Capability Fit the 3 sub-scores equal. All editable per company.

## 6. Matrix quadrants (proposed labels)
| | **High Win-ability** | **Low Win-ability** |
|---|---|---|
| **High Attractiveness** | **Pursue** (priority) | **Challenge** (attractive but hard — needs a plan) |
| **Low Attractiveness** | **Selective** (winnable but low value) | **Decline** (likely no-bid) |

## 7. Threshold & completeness (proposed)
- **Advisory threshold:** company-set (suggest default **40/100**) — flags "likely no-bid" at the gate; human decides.
- **Completeness:** if some dimensions are unscored, show the score as **provisional** with a completeness % (don't present a half-scored deal as final).
- **Benchmarking → DEFERRED to Pipeline.** Founder noted benchmarking (ranking opportunities against each other) is a **Pipeline** concept. The Deal Score is *produced* here in Identification; the *ranking/benchmarking of scores across opportunities* is handled in Pipeline. Saved for the Pipeline analysis.

## 8. Notes
- **AI-consumable / future:** SkellyAI could *suggest* dimension scores from the underlying data (human confirms) — augment, not decide (Doc 18). Manual for now.
- **Configurable in Company Parameters:** dimension weights, Capability-Fit sub-weights, threshold, quadrant labels.
- **Explainable (no black boxes):** the Deal Score always shows its dimension breakdown + weights.

## 9. Round-2 decisions — ALL CONFIRMED (2026-07-06)
1. ✅ Axis assignment (§4) — confirmed.
2. ✅ 0–100 normalisation `(avg−1)/9×100` (§5) — confirmed.
3. ✅ Quadrant labels Pursue / Challenge / Selective / Decline (§6) — confirmed.
4. ✅ Default threshold **40** (§7) — confirmed.
5. Benchmarking — **deferred to Pipeline**.
6. ✅ **No hard veto** — matrix + advisory threshold suffice.

## 10. To build later (with implementation)
- Exact **default weights** UI in Company Parameters (weights, sub-weights, threshold, quadrant labels all editable).
- Wire the Deal Score into the Opportunity Snapshot / Marrow as a pullable input.
- SkellyAI score-suggestion (future).
