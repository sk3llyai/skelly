# 31 — Module: Portfolio Level (Executive Intelligence Layer)

> **Status:** Module capture from founder screenshots + description (2026-07-12). The **bottom-up payoff** of Skelly: every data point generated at deal level rolls up into an executive/BI layer for portfolio-wide analysis. **Founder: this is super important for v1** (it's what turns thousands of bid data points into strategic insight, and it's what leadership buys).
> **Screenshots:** Portfolio Overview dashboard · Analysis Builder · Target/Performance. Illustrative, not final UI.

---

## 0. ⭐ The big architectural insight — Portfolio Level is a READ/BI layer over what we already built
The entire Portfolio Level is **assembled largely from engines we already designed**, pointed at *cross-deal* data:
- **Marrow** (Data Catalog / Semantic Layer, Doc 17 B.1.5a) — the governed registry of every data point. **Companion is Marrow's user-facing surface.**
- **Aggregation service** (roll-ups across deals, Doc 15) — the cross-deal maths.
- **Customisable view-builder / dashboards** (already reused in Products & Accounts, Doc 11/14) — the widget/dashboard engine.
- **AI Gateway / SkellyAI** (Doc 18) — Companion's intelligence + AI report summaries.
- **Export/render service** (Doc 15) — export outputs externally.

**Consequence:** the Portfolio layer is more v1-feasible than "defer" implied — it **validates and monetises Marrow** (this is *why* Marrow is the keystone). The Portfolio Dashboard is mostly assembly of existing engines; the heavier *new* builds are the Analysis Builder, Target/Performance, robust cross-deal aggregation at scale, and Companion's AI depth.

---

## 1. Portfolio Dashboard — the executive intelligence layer
Live view across **every bid, qualification, forecast, approval, outcome and contract**. Not static reports — **fully customisable dashboards** built from data at individual-bid, group-of-bids, or whole-database level.
- **User-built KPIs, charts, tables, visualisations** — pick the data, apply **filters**: stage, sector, region, account, bid owner, qualification score, risk rating, contract value, time period, **any custom company field**.
- **Live** — every widget auto-updates as opportunities change.
- **Interactive drill-down** — from a high-level portfolio metric into the underlying opportunities.
- **Saved layouts per team/purpose** — Executive, Finance, Sales, Delivery, Regional.
- **Scenario-aware** — the dashboard runs on a **selected scenario** (screenshot: "Scenario: Base Case"). *This resolves the earlier open question "which scenario feeds portfolio/Company-Master statements" → a selectable portfolio scenario, default Base Case.*
- **Observed content:** KPI cards (Portfolio TCV, Max Cash Exposure, Active Bids, Avg Win Probability, Expected Value); **Income Statement Summary** + **Cash Flow Summary** (portfolio-aggregated P&L + cash); Revenue vs Cost by Deal; Pipeline by Stage; TCV by Region; Win Probability Distribution; Expected Value by Risk Rating; Sector Mix by TCV.
- **Reuse:** view-builder + aggregation + Marrow + scenario selector + Companion. Mostly assembly. **Strong v1 candidate.**

## 2. Companion — platform-wide (Marrow + AI, surfaced to the user)
A **platform-wide** feature living throughout Skelly; gives users direct access to **every structured input** across their bids + the wider Skelly database.
- **Discover + reuse data:** search, browse, and **drag data points directly into dashboards/analyses** — no manual report recreation. e.g. drag a prior bid's TCV, qualification scores from similar opportunities, historical margins for a customer, revenue forecasts from completed projects.
- **Retrieve AND update** data where appropriate (⚠️ write-back needs **permissions + audit** governance).
- **Intelligent suggestions** — recommends the most relevant data points based on the current dashboard, filters, similar bids/accounts, history.
- **Two modes:** an **interactive input hub** (drag/drop) **or** a **conversational interface**.
- **⭐ Architectural framing:** **Marrow = the governed backend registry; Companion = its front-end** (+ AI Gateway). Elevate **Companion to a first-class platform feature** — the user-facing name for "pull/reuse any Skelly data, guided by AI."

## 3. Analysis Builder — portfolio BI / reporting workspace
An **Excel-style analysis creator** over **all opportunities + the wider Skelly database**: flexible reports, tables, **pivots**, charts.
- **Direct datapoint access** across sources (Data Panel mirrors Marrow: Opportunities, Qualification, Financials, Costs, Revenues, Risks, Contracts, Outcomes, Custom Fields), drawing relevant connections; **sheets/tabs**, filters, group, sort, pivot, row limit.
- **Salesforce-style report generator with AI** — "**Build a table summarising all opportunities for Product X in Q1 in region Y**" → generated table + charts.
- **AI aspect** — report **summary** + **drivers/connections** from the Skelly-database context (e.g. "deals with >60% win prob have 2.1× higher expected value"; "opportunities with margin >30% have £1.8M higher EV"; "3 opportunities worth £2.0M are in qualification with low win prob").
- **Export** outputs externally.
- **Reuse:** Marrow (field catalog), AI Gateway (NL→query + summary + driver detection), table/pivot engine, export/render, Companion (guided prompts/hints/context). **Heavier new build** (pivot/BI engine + NL query + AI insights).

## 4. Target / Performance — portfolio performance-management hub
Define, monitor and **optimise commercial targets**, connecting portfolio analytics to strategy.
- **Targets:** Win Rate, TCV, Expected Value, Gross Margin, Pipeline Coverage (×), Cash Peak, Qualification Quality, New Logos Won — set at company level (e.g. FY 2026).
- **Continuous measurement** from live data across every opportunity; **Target vs Forecast vs Actual**; progress %, status (On Track / At Risk / Above Target), variance vs target.
- **Break down by** region, sector, account, product, bid team, or any custom dimension.
- **Target creator**; **Alerts** (e.g. "Gross Margin 2pp below target"); **Initiatives & Actions impacting targets** (owner, impact, status, expected impact); AI **key drivers** + insights summary.
- **Reuse:** aggregation + dashboard engine + AI (drivers/insights) + alerts + export. **New:** a **Target entity + tracking logic + alerts engine + initiatives**.

---

## 5. Why this matters for v1 (founder's argument — and it's sound)
Portfolio Level is the **bottom-up payoff**: all the structured data captured at deal level only becomes *strategic* when it aggregates. It's also the layer **leadership buys**. I earlier under-weighted it by marking "Portfolio Dashboard" as defer; corrected. **Granularity for the v1-scope decision** (they are not all equal cost):
- **Portfolio Dashboard** — mostly existing engines → **strong v1 include**.
- **Companion (v1 cut)** — Marrow surfaced as a **data browser + drag-in** with basic AI suggestions; full agentic/conversational depth later.
- **Analysis Builder** — bigger (pivot/BI + NL query + AI). v1 could ship a **lean report/table builder**, full Excel-style + AI report-gen as fast-follow.
- **Target/Performance** — a **new module**; could be v1-lean (a few core targets + progress) or deferred slightly.

## 6. Open questions
1. **Portfolio scenario** — confirm default = Base Case, user-selectable (resolves earlier open Q on which scenario feeds Company-Master/portfolio statements).
2. **Companion write-back governance** — permissions + audit for updating data via Companion.
3. **Cross-deal aggregation at scale** — hundreds of deals × scenarios × months → needs **pre-aggregation / materialised views** for live performance.
4. **Portfolio-level statements** — how Income-Statement/Cash-Flow summaries roll up across deals + scenarios (ties to Company Master statements, Doc 15).
5. **v1 depth per sub-feature** (see §5) — decide at scope-setting.

## 7. Cross-references
- Marrow / Data Catalog — Doc 17 B.1.5a · AI & Agentic — Doc 18 · Living Platform Model — Doc 15
- Dashboards/view-builder — Docs 11, 14 · Roadmap/scope — Docs 28, 30 · Decision Log — Doc 08
