# 30 — Open Loose Ends Register (consolidated, for confirmation)

> **Status:** Consolidated register (2026-07-12). Every open question still outstanding across the docs, pulled into one place so we can confirm them before locking v1 scope + moving to Claude Code. Each has a **CTO recommendation**. Marked: **[V1]** must-resolve for the build · **[SOON]** product behaviour, resolve shortly · **[V2]** safe to defer.
> **How to use:** approve each recommendation or overrule it; confirmed answers get written back into the relevant doc + the Decision Log.

---

## Part 1 — Must-resolve for the v1 build [V1]
*(These touch the core data model / calculation engine — cheapest to lock now.)*

1. **Phase model** [Doc 10 §4.1]. *Recommend:* a deal has an ordered, **contiguous** set of **user-defined phases** (default two: **Delivery → Operations**, count configurable); each phase has start/end dates from a project start + durations, editable; models reference a phase for timing.
2. **Recognition default** [Doc 10 §4.2]. *Recommend:* default = recognise in the item's expected month if in **Operations**, or the **first month of Operations** if in Delivery; configurable alternatives = Straight-line, Milestone, Point-in-time, Custom.
3. **Consumption model** [Doc 10 §4.3]. *Recommend:* volume **compounds year-over-year** by a configurable annual growth rate; "number of transactions" entered **per year**, spread monthly. (Confirm.)
4. **Milestones** [Doc 10 §4.3]. *Recommend:* milestones drive the **cashflow distribution** and **must sum to 100%** (validation). (Confirm — already seen on Add-Revenue page.)
5. **Inflation / Payment Terms / Discount Period** [Doc 10 §4.4]. *Recommend:* defaults live in **Financial Standards** (+ per-model override), **snapshot-on-use**; v1 = a **flat inflation default** + **payment terms from the Account**; discount period optional.
6. **Templates vs Models — ✅ RESOLVED by founder (2026-07-12).** A **Model = a calculation engine (cost/risk/revenue) only**; a **Template = a Pack-Builder template** (a company's preferred style/structure/order for their Qualification or Approval pack, set at onboarding); a **Phase = a timeline-period entity** models reference for timing. Three distinct concepts — do not conflate. (Corrected Doc 10 §4.4.)
7. **Core entity spine.** *Recommend confirm:* `Deal, Scenario, EstimateLine, Model(Definition/Instance), Product, Account, Party, Phase, Risk`.
8. **v1 model library.** *Recommend confirm the six:* one-time, monthly/annual recurring, consumption, tiered (absolute-band), %-of-metric, EMV risk.
9. **Win-probability starting default** [Doc 23]. *Recommend:* neutral curve — parity ≈ 50%, scaled by weighted score gap, capped 5–95%; blend toward history with credibility weighting as deals close. Tune later.
10. **v1 lifecycle stages + gates.** *Recommend:* Qualification → Pipeline → Estimations → Forecast → Simulation → Approval → Outcome → Done, with advance-gates at Qualification and Approval.

## Core stack/infra confirmations (from Doc 08 §B / Doc 29) [V1]
11. **Stack** — TS + Node + NestJS + React/Next + Postgres/Prisma. *Recommend proceed.*
12. **Cloud** — **AWS** default (revisit if buyers are Microsoft shops). *Recommend AWS.*
13. **Auth** — **WorkOS**; v1 roles Admin/Manager/Contributor/Viewer. *Recommend proceed.*
14. **Managed Postgres** — start on Neon/Supabase for speed, path to RDS/Aurora for prod. *Recommend.*
15. **Build start** — foundations + walking skeleton + engine first (layer-by-layer). *Recommend.*

---

## Part 2 — Product behaviour, resolve soon [SOON]
*(Not blocking the foundations, but needed before the relevant module is built.)*

16. **Accounts** [Doc 14 §6]. *Recommend:* Suppliers **do** live in Accounts (Type = Customer/Prospect/Partner/Supplier); **multi-contact** sub-entity; parent-account **roll-ups yes**; currency **snapshot per C1**.
17. **Scenario Battle** [Doc 12 §A.5b]. *Recommend:* **direction-of-goodness configured per metric**; ambiguous ones (Bid Price) show difference without a "winner"; Battle **informs**, the bid is **selected at Approval**.
18. **Approval** [Doc 17 §B.6e]. *Recommend:* Approval **locks the approved scenario** as the submitted bid; Deal-Score **win-ability updates** from latest numbers with audit; Approval-Matrix config lives in Company Parameters.
19. **Outcome** [Doc 17 §B.7e]. *Recommend:* "Difference vs Our Price" base = **Submitted Price**.
20. **Pipeline Impact formula** [Doc 17 §B.1.4]. *Recommend:* **uplift-if-won = TCV × (1 − Win Prob)** on a weighted pipeline. (Parked — confirm or keep parked.)

---

## Part 3 — Safe to defer to v2 (confirm defer) [V2]
*(Logged, not lost. None block v1.)*

21. **Contract-lot** as first-class child of the opportunity [Doc 26 §8] — defer (v1 = one business case per deal).
22. **Multi-party roles** (payer ≠ requester) [Doc 14 §4a] — defer (v1 = single customer).
23. **Scenario organising layer** — dimensions, parametric/bulk generation, shared-block propagation [Doc 12 A.5.2] — defer (v1 = basic scenarios + Battle + rounds).
24. **Revenue-share model** + **billable-entity population** + **tiered marginal option** [Doc 10 §4.3, Doc 26] — defer.
25. **Contract Tracking + ERP mapping** [Doc 17 B.8] — defer (founder not finalised).
26. **Financial Standards depth** — NPV/discount curves, inflation schedules, **multi-currency/FX** — defer (v1 minimal).
27. **Balance Sheet** — undecided — defer.
28. **Portfolio Level** (Dashboard, Companion, Analysis Builder, Target/Performance) — ⭐ **UPGRADED toward V1 by founder (2026-07-12), Doc 31.** It's the bottom-up payoff of deal data + what leadership buys, and mostly assembles engines we already have (Marrow, aggregation, view-builder, AI Gateway). **Portfolio Dashboard = strong v1 include; Companion (lean) v1; Analysis Builder + Target/Performance = decide depth at scope-setting.** Portfolio scenario = Base Case default, selectable (resolves the old Company-Master scenario question).
29. **Richer access model** — bespoke access levels, manager-specific views, approver routing — defer (v1 = 4 roles).
30. **Competitors module** auto-ingest / public-bid database [Doc 16] — defer.
31. **Model Builder + formula engine** (user-authored models) [Doc 10 §4.6] — defer (v1 = core models as config).
32. **Standard Solutions** full detail — defer.
33. **Propagation-vs-snapshot boundary** [Doc 26 §8] — only bites once shared-block propagation is built (deferred) → revisit with the organising layer.

---

## After confirmation
Once Parts 1–3 are confirmed, we (a) write the answers back into the relevant docs + Decision Log, then (b) **lock the exact v1 scope** (Doc 28 §1 refined), then (c) move the build to Claude Code.
