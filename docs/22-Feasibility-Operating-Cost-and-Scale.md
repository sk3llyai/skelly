# Skelly — Feasibility, Operating Cost & Scale
### A plain-English answer to "is this too complex to run at scale?"

**Who this is for:** you (the founder). Written to answer an honest concern — Skelly does a *lot*, so is it too complex or expensive to run as enterprise software for hundreds of customers? Short answer: **no.** Here's why, including the real risks (which are different from the ones people fear).

**Last updated:** 2026-07-06

---

## 1. The distinction that matters: complex to *use* ≠ expensive to *run*
Skelly is rich in **what it does**. That is *not* the same as being costly to **operate**. What makes software expensive to run is **heavy computation** (video, AI training), **massive scale** (millions of simultaneous users), or **enormous data**. Skelly has none of these in an extreme form.

Under the hood, Skelly mostly: takes typed-in numbers → does **arithmetic** (spreads figures across months, sums them, computes margins) → shows reports. A spreadsheet does that instantly. Even a very complex deal is *thousands* of small calculations, not the *millions of heavy* ones that cost real money. Its resource profile is **favourable**.

## 2. Why hundreds of customers is fine
- **Low concurrency:** it's a B2B tool for commercial teams — hundreds/thousands of professionals, not millions of consumers at once.
- **Light maths:** arithmetic, not AI/simulation-heavy compute.
- **Modest, structured data:** PostgreSQL comfortably handles billions of rows; hundreds of customers × hundreds of deals is well within range.
- **Perspective:** tools *far* more complex than Skelly (Salesforce, big financial-modelling suites) run profitably at huge scale. Skelly's complexity is normal for enterprise SaaS.

## 3. What actually costs money (and what to watch)
- **Managed database + app hosting:** modest and **predictable** — grows gradually with usage, not in sudden jumps. A few hundred £/month goes a long way.
- **⚠️ AI = the one genuinely variable cost.** SkellyAI features and things like the historical-data win-probability call out to AI models that charge **per use**. This is the cost to keep an eye on — but it's **governed** by the AI Gateway (controls how much AI runs; AI is for suggestions/analysis, not every keystroke). Manageable, but the lever to watch.

## 4. The honest risks (none of them is "too expensive to run")
1. **Effort / timeline** — it's a big, ambitious system; the real risk is that it's *a lot to build* (especially solo), not that you can't run it. **Mitigation:** build incrementally — ship a focused core first, grow. It does NOT all need to exist to launch.
2. **Scope discipline** — resist building everything before shipping anything; sequence ruthlessly, get a useful version live early.
3. **AI cost governance** — monitor AI usage as it grows.
4. **Careful calc-engine engineering** — the many auto-recalculating numbers must stay fast on big deals (caching, recompute-only-what-changed). Very solvable; needs doing well.

## 5. Why the complexity is manageable (not hand-waving)
Most of Skelly's richness is **data & configuration, not code.** Models, formulas, categories, allocations, scenarios — users *configure* these; they're stored as data and run through a **small set of reusable engines** (calc engine, taxonomy engine, workspace shell, statement aggregator). So the **codebase stays comparatively lean** even though the **capability is vast**.

The complexity is **"wide but shallow"** — many configurations of a few engines — which is far easier to run and maintain than **"deep"** complexity (hundreds of bespoke, hard-coded features). This is the whole payoff of the reuse discipline (the Living Platform Model, Doc 15).

## 6. Bottom line
**Functionally rich, operationally feasible, cost-efficient at hundreds of customers.** The real work is *building* it (time + discipline) and *governing AI cost* — not *running* it or *scaling* it. Enterprise software this capable is built and run profitably all the time; Skelly is designed (single source of truth, reusable engines, managed infrastructure) precisely so it stays lean to operate as it grows.
