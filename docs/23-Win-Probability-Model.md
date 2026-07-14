# 23 — Win Probability Model (built collaboratively)

> **Status:** ✅ MODEL DECIDED (built step-by-step with the founder). Framing, foundation, and both mature-model methods confirmed (§2, §4, §5). Win probability is a **persistent, deal-wide metric** shown on the Opportunity List, Identification, Scenarios and Simulation. (Implementation-tuning of the exact default curve happens at build time.)
> **Last updated:** 2026-07-06

---

## 1. Purpose
A **persistent, evidence-based win probability** — always present, credible, explainable (no black box), and getting sharper as the deal develops and as Skelly accumulates real bid outcomes.

## 2. ✅ Framing — one number, progressive method (confirmed 2026-07-06)
- **One win probability** = a **single source of truth**, shown everywhere it appears (Opportunity List, Identification, Scenarios, Simulation). Same number, one place.
- **The *method* upgrades as inputs firm up** — the system uses the **most sophisticated method whose inputs currently exist:**
  - **Baseline (from day one):** a **historical base rate** for similar deals (similar sector/size/customer, from internal + external bid history) and/or the **win-ability read** from the qualification scorecard (Doc 19). Rough but present.
  - **Mature (Simulation):** the **full competitive model** (§4) once you've scored yourself + competitors against the evaluation criteria and have prices — this *replaces* the rough estimate (better inputs).
- **Always manually overridable** (sales judgement) — a manual value is respected and flagged.
- **Confidence grows** with the method's maturity (rough prior → evidence-based) — shown so the number is never *falsely* precise.

## 3. Why this is credible (not a made-up %)
In a tender the **buyer picks the highest total score**, where total score = **price + quality**, weighted by the buyer's **published weightings** (captured in the Identification Evaluation Criteria table, Doc 17 B.1.1a). So the mature model **replicates the buyer's own scoring**, then converts score gaps into probability, **calibrated to how similar real bids turned out**. Transparent + evidence-based.

## 4. The mature model — 4 layers (Simulation)
1. **Score each bid like the buyer would.** For you + each competitor:
   `Total Score = (Price Score × price weighting) + Σ(quality criterion score × its weighting)`
   — quality scores = the Expected Scores set against the evaluation criteria; **Price Score = §5 sub-decision.**
2. **Score gaps → win probability.** Bigger lead over the field → higher probability; tight race → nearer 50/50 (a curve over score gaps — **§5 sub-decision**).
3. **Calibrate to history.** Map score-gaps → actual win rates using internal + external historical bids ("when N points ahead, we won X%"). Default curve early; evidence-based as data accumulates (compounding knowledge).
4. **Confidence adjustment.** Low confidence in a competitor's price/score (the Confidence Score) → wider uncertainty band around the probability, not false precision.

## 5. ✅ Mature-model decisions (confirmed 2026-07-06)
1. **Price → score:** ✅ **Score price the way the buyer does** — use the buyer's stated price-scoring formula (from the Evaluation Criteria Description) when known; else default to **relative** (lowest price = max points, others scaled).
2. **Score-gap → probability:** ✅ **Smart default now, blended with real history over time.**
   - **Gradual blend, not a hard switch** ("credibility weighting"): weight on the built-in default starts at ~100% (no/few bids) and slides toward the client's **actual win/loss history** as more **relevant, similar** bids accumulate. Small samples are trusted only lightly (a 2-of-3 record ≠ 67% reliable); large relevant samples dominate.
   - "Relevant" = prioritise past bids **similar** to the current one (sector, size, type) — semantic/attribute match (pgvector + filters).
   - **Day-one context depends on historical-bid import at onboarding** (Doc 24) — otherwise a new client has no history to blend.

## 6. Reuse / build notes
- Reuses the **weighted-scoring** pattern (Deal Score, Doc 19) for the bid-score step.
- Uses the **historical bid data** (internal Skelly DB + external Competitors DB, Doc 16) — a concrete payoff of the AI-consumable/structured-data design (Doc 18).
- **AI angle:** SkellyAI can *explain* the probability ("you're ahead on quality but 8% expensive") and, later, learn the calibration curve — augment, human decides.
- Persistent metric → lives on the Deal, recomputed as inputs change (calc-engine dependency).
