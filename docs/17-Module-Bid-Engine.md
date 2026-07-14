# 17 — Module: Skelly Bid Engine

> **Status:** IN PROGRESS. This is the biggest, central module — where a deal moves through its lifecycle. This entry covers the **Opportunity List** (the entry point). The **detailed per-bid workspace + 10 stages** come next (founder uploading). Preliminary deal-workspace notes already in Doc 12 (Part B) will be consolidated here.
> **Source:** Founder description + Opportunity List screenshot.
> **Last updated:** 2026-07-06

---

## 0. Terminology (one entity, three names)
"**Opportunity**", "**Deal**", and "**Bid**" all refer to the **same core entity** in Skelly. The list is the "Opportunity List"; its rows are "Deal ID / Deal Name"; the workspace is the "Bid Engine." Throughout the docs, treat them as one thing: a **Deal**. (Worth standardising one primary term in the code to avoid confusion — recommend `Deal` internally, "Opportunity" in the UI if preferred.)

## 1. The Opportunity List (entry point)
The first screen of the Bid Engine is a **table of all deals**. From here a user clicks a deal → the deal's workspace (the Bid Engine for that deal, detail next).
- **Header/actions:** "14 of 14 opportunities", **Create New Opportunity**, search ("by name, customer, sector, or stage"), filters.
- **Columns (customisable):** Deal ID, Deal Name, **Stage**, **Lifecycle**, Customer, TCV, Probability (with % bar), Margin, Opportunity Owner.
- **Deal ID** is system-generated (e.g. `D-69b9db512de7cb323c57a330`).
- Values are drawn from across the platform: **Customer** ← Account (Doc 14), **TCV/Margin** ← aggregated from the deal's estimates/forecast (Doc 10/11 aggregation), **Probability** ← Qualification, **Owner** ← User.

## 2. Reuse: the customisable table is the same view-builder capability
"Customisable column headers" on this table is the **same customisable-view capability** as the dashboards (Doc 11 §4, Living Platform Model). Users choose which columns/data to show. → reuse the shared **view/column-configuration** mechanism over the governed query layer, not a bespoke table. (Principle 7.)

## 3. New concept — Stage vs Lifecycle (two levels of status)
The list shows **two** status dimensions:
- **Stage** — the detailed position in the 10-step lifecycle (Doc 12 B.2): Identification, Qualification, Pipeline, Estimations, Forecasting, Simulating, Approval, Outcome, Contract Tracking, Done. (Screenshot shows Forecast, Pipeline, Qualification, Approval, Done.)
- **Lifecycle** — a **coarse bucket**: **Live**, **Upcoming**, **Historical**.

**CTO read:** Lifecycle is almost certainly **derived from Stage** (a grouping), not a separate thing a user sets — e.g. early stages (Pipeline/Qualification) = *Upcoming*, active mid stages (Forecast/Approval) = *Live*, finished (Done/Outcome) = *Historical*. Deriving it keeps a single source of truth (Principle 4) — we compute Lifecycle from Stage rather than storing/maintaining both. **Confirm the exact Stage→Lifecycle mapping**, and whether Lifecycle is ever set independently.

## 4. Deal entity (emerging shape)
Pulling together the list + Doc 12 (deal workspace):
- **`Deal`**: `id` (`D-…`), `organisation_id`, `name`, `account_id` (Customer, Doc 14), `sector` (taxonomy — appears in search), `stage` (state-machine position, 10 stages), `lifecycle` (derived from stage), `owner_id` (Opportunity Owner), `probability` (win %), plus derived `tcv`/`margin` from its estimates. Carries **Scenarios, Assumptions, Team, Attachments, Products** (Doc 12 B.1). Audit + soft-delete + tenant-scoped.
- **Relationships:** Deal → Account (customer); Deal ↔ Products (many, via the products in the bid); Deal → Team (users + Bid Roles); Deal has many Scenarios; Deal has many Estimate Lines (cost/revenue).
- **Lifecycle engine:** `stage` is governed by the workflow/state-machine (ADR-006, Doc 12 B.2) — legal transitions only ("Advance to…"), configurable per tenant.

## 5. ⭐ Cross-cutting requirement — UI must be swappable without touching functionality
**Founder mandate (re-emphasised):** the screenshots are *one* design idea; we must be able to plug in a new UI design, or A/B test different designs, **without impacting the software's functionality.** This is now recorded as a **first-class non-functional requirement**, and it's honoured at two levels:

1. **Backend independence (already core):** all business logic, calculations, rules, and validation live in the back office (Constitution P3/P5, Architecture §3). The screens only display data and collect input. So *any* UI change is impossible to break a rule — the rules aren't in the UI.
2. **Frontend design independence (making it explicit):** on the frontend we separate **"what a screen needs" (data + behaviour)** from **"how it looks" (presentation)** — i.e. logic/data lives in reusable hooks/containers and a **design system** of swappable presentational components. This means you can restyle, re-theme, rearrange, or completely redesign a screen (or run two designs side by side to test) **without changing any logic or data flow.** The Opportunity table's *look* is separate from *what a deal is and how its numbers are computed*.

**Consequence for how we build:** we never bake business logic into a component's markup; screens are assembled from the design-system + shared data hooks; and we can keep multiple UI variants behind a simple switch for experimentation. Added to the Living Platform Model conventions.

## 6. Open items
1. **Stage → Lifecycle mapping** (and whether Lifecycle is ever independent). (§3.)
2. **Sector** — confirmed a managed taxonomy? (§4.)
3. Full detail of the **per-bid workspace and each of the 10 stages** — coming next; will be consolidated here (merging Doc 12 Part B).
4. Deal↔Account cardinality (one customer, or partners too — carried from Doc 14).

## 7. Reuse notes (feeds Living Platform Model)
- Opportunity List = the shared **customisable table / view** capability (not bespoke).
- Deal workspace = the shared **Workspace shell** (Products/Accounts/Deals).
- Deal metrics (TCV, Margin, Probability) = shared **aggregation service**.
- Lifecycle/stages = the shared **workflow engine**.
- **New platform convention:** *UI-swappable-without-affecting-functionality* (§5) → added to Doc 15 §F.

---

# PART A — DEAL RESOURCES (the deal-level "Company Parameters")

> The top-bar resources of a Deal workspace — the deal's own configuration layer. Founder's framing: **"the Company Parameters of a bid."** Sections: **Assumptions · Team · Products · Attachments · Scenarios** (+ **Timeline** appears in the top bar too). Same reusable Workspace shell (Doc 12 B.1). Going through one at a time; Assumptions first.

## A.1 Assumptions (deal core inputs)
"This section manages important bid metrics gathered from the different stages within Skelly." So Assumptions is both a **set of core deal inputs** *and* a place where **key metrics from other stages surface**. Two grouped sub-sections:

**Opportunity**
| Field | Type / source |
|---|---|
| Opportunity Name | text |
| TCV | number (see A.1a — target vs computed) |
| Duration (Months) | number → drives the phase timeline |
| Customer Account | select → **Accounts** (Doc 14); selecting this **inherits Payment Terms + Currency** |
| Owner | select → **Users** |
| Sector | select → **taxonomy** (new) |
| Region | select → **taxonomy/reference** (new) |
| Business Unit | select → **taxonomy / org-structure** (new; ties to Constitution P2 "multiple business units") |
| Deal Type | select → **taxonomy** ("Company parameter e.g. New business, retention, upsell" — already in Doc 09 list) |
| Deal Type (Other) | free text — fallback when not in the list |
| Delivery Model | select → **taxonomy** ("e.g. hybrid, remote/offshore" — already in Doc 09 list) |
| Delivery Model (Other) | free text — fallback |

**Commercial Structure**
| Field | Type / source |
|---|---|
| Revenue Model | select → taxonomy/enum (commercial revenue type; confirm vs Models & Templates) |
| Billing Frequency | select → taxonomy/enum (monthly/annual/…) |
| Payment Terms | select → **default from Account, overridable here** (Doc 14) → feeds revenue cashflow (Doc 10) |
| Currency | select → **default from Account, overridable here** → multi-currency (Doc 11 A2.5) |

### A.1a ⭐ Field provenance — Assumptions is a SUMMARY that PULLS, not a data-entry form (✅ clarified 2026-07-06)
Founder confirmed most Assumptions values are **pulled from their authoritative source**, not typed here. This is **Single Source of Truth (Principle 4) in action** — nothing is entered twice. Every field falls into one of three provenance types:

| Provenance | Meaning | Fields |
|---|---|---|
| **Computed pull** (read-only, calculated elsewhere) | Reflects a value computed in another stage; single source lives there | **TCV** ← Forecasting; **Duration** ← Timeline; **Evaluation weightings** ← Identification (buyer criteria, §B.1.1a) — shown in Assumptions as a read-only pull so users see them across stages (no duplication; edit in Identification) |
| **Reference selection** (options pulled from one source; user picks; deal stores the reference) | Dropdown whose options come from an authoritative list | **Customer Account** ← Accounts (Company Parameters); **Owner** ← Users directory; **Business Unit, Deal Type, Delivery Model, Revenue Model, Sector, Region, Billing Frequency** ← Company Parameters taxonomies |
| **Direct input** (genuinely entered on the deal) | Typed by the user for this deal | **Opportunity Name**; **Deal Type (Other)/Delivery Model (Other)** free-text fallbacks; overrides of inherited values (Payment Terms, Currency) |

**Architectural meaning:** the Assumptions screen is a **projection/aggregation view** — it reads from authoritative sources (Forecasting, Timeline, Company Parameters, Accounts, Users) and stores only what's genuinely deal-specific (the chosen references + direct inputs + overrides). This validates the layered design: values flow *up* from their source into this summary. Matches the on-screen note "important bid metrics gathered from the different stages."

**Remaining nuances to confirm:**
- For **computed pulls** (TCV, Duration): are they strictly **read-only** here, or can a user **override** with a flagged manual value? And do they show the **live** current value (always in sync) or a **snapshot** at a point in time (e.g. frozen at Approval)? *(Recommendation: live display during drafting; snapshot at Approval/Outcome for the audit record — consistent with convention C1.)*
- For **reference selections**: the deal stores a **reference (link)** to the source record, and — per convention C1 — **snapshots the derived values** (e.g. the account's payment terms/currency) at point of use, so later edits to the source don't rewrite history. The *link* stays live for reporting; the *derived numbers* are snapshotted.

### A.1b Other observations & CTO flags
- **✅ Confirms taxonomy reuse:** Sector, Region, Business Unit, Deal Type, Delivery Model, Billing Frequency are managed lists (Doc 09 taxonomy engine). Sector, Region, Business Unit are **new taxonomies to add** to the Company Parameters list.
- **⭐ New reusable input pattern — "taxonomy + Other":** a managed dropdown plus a free-text "(Other)" fallback (Deal Type Other, Delivery Model Other). Good UX, but a **data-quality watch-item**: "Other" values fragment reporting over time. *Recommendation:* periodically surface common "Other" entries to an admin to **promote into the taxonomy** (keeps the managed lists clean). Build this as one reusable `TaxonomyWithOther` input.
- **⭐ Account selection = the inheritance trigger:** choosing the Customer Account is what pulls in Payment Terms + Currency defaults (resolving Doc 14's flow), which the user can then override here. Confirms the "inherit from Account → override → snapshot" chain.
- **⭐ CORRECTION (2026-07-06): Assumptions are NOT scenario-scoped.** Only **Estimations, Forecast, Simulation** vary per scenario (Doc 12 A.2). Assumptions **inputs are shared deal-level** across scenarios; the scenario selector on this page is just context. However, the **computed pulls** shown here (TCV, Margin) **reflect the active scenario's Forecast**, so those figures change as you toggle — even though the inputs don't.
- **TCV & Duration — target vs computed (clarify):** here TCV and Duration are *entered*. But TCV is also *computed* bottom-up from Pricing/Forecast, and Duration relates to the phase timeline. Likely: Assumptions holds the **headline/target** figures (top-down), while the modelled figures are computed (bottom-up) — and the "metrics gathered from different stages" line suggests computed values may surface here too. **Confirm:** are these fields manual targets, computed displays, or manual-with-later-override?
- **Duration → Phasing:** Duration (Months) should reconcile with the sum of the deal's phases (Doc 11 Phasing). Confirm the relationship (does Duration drive/limit phases, or is it derived?).

### A.1b Reuse
- Same **Assumptions form pattern** as Products/Accounts (workspace core inputs), here richer and grouped (Opportunity + Commercial Structure). Reuse the grouped-form pattern.
- New: **`TaxonomyWithOther`** input component (added to Living Platform Model).
- **PaymentTerms/Currency resolver** (Account → deal, override, snapshot).

## A.2 Team (Opportunity Team)
"Pull users from Company Parameters and add them to a bid. Assign team members based on their roles such as Commercial Lead or Business Development Manager." **Manually curated, not auto-filled.**
- **Team Table columns:** User (Team Member) · Role · Access Level · Contact. Rows reorderable (drag handles); each row has Edit + delete.
- **+ Add Team Member** → pick from the list of users (the Users directory in Company Parameters — a **reference selection**).
- Example: Admin User (Role: Exec, Access: Full Access, admin@skelly.com); John Doe (Full Access).

### A.2a ✅ Resolves "Bid Roles vs access Roles" (they are DIFFERENT things)
The **Role** here (Commercial Lead, Business Development Manager, Exec) = the **Bid Roles** taxonomy from Company Parameters (Doc 09 addendum). This confirms Bid Roles are a user's **functional role on a specific deal**, and are **distinct from the system access role (RBAC)** that governs global permissions. Two different concepts:
- **Access Role (RBAC, org-level):** what you can generally do in Skelly. [Doc 09]
- **Bid Role (per-deal, functional):** what hat you wear on *this* bid. [here]

### A.2b ⭐ Big insight — Skelly has TWO-LAYER authorization (per-deal membership matters)
The **Access Level** column ("Full Access") is a **per-deal access control**. This means authorization in Skelly is **two layers**, and this is a significant design point:
1. **Global RBAC** — your org role/permissions (can you use the Deals feature at all?). [Arch §7, Doc 09]
2. **Per-deal team membership + Access Level** — can you access *this specific* deal, and at what level (Full Access / Edit / View…)? You're on the deal because you were added to its Team.

So the effective rule becomes: *you can act on a deal if you have the global permission **AND** you're a team member with a sufficient Access Level.* This is **relationship/membership-based access (ReBAC)** layered on RBAC — common and correct for enterprise (like being added to a specific project). **Implication:** the central `can(user, action, resource)` service (Arch §7) must check **deal-team membership + access level**, not just global role. The architecture anticipated this ("can edit bids in *their* business unit" — Arch §7); Team makes it concrete. **Confirm:** does being on the Team *grant* deal access (i.e. non-members can't open the deal), and can high-level admins see all deals regardless?

### A.2c Observations & reuse
- **Access Levels = bespoke, client-configurable bundles of FIXED capabilities (✅ decided 2026-07-06).** Same model as global roles (Doc 09 C4): the underlying **capabilities/atoms** (view deal, edit assumptions, edit pricing, approve…) are **fixed and code-defined** (so the security surface is known & testable — Principle 11); the **Access Levels** (named bundles like Full Access / Commercial Editor / Viewer) are **composed per client at onboarding, with seeded defaults, and editable later** (audited). Clients can freely arrange capabilities into levels but **cannot invent new capabilities** (that's a code/release activity as features are built). *Not set in stone* — configurable and evolvable, safely.
- **Contact** (email) is pulled from the user record (derived).
- **Reuse:** this is a **`MembersTable`** + a **user picker** (`ReferenceDataPicker` over Users) — the same shape as the Company Parameters Users table and a likely reusable "assign people with per-context roles/access" pattern (Deal Team today, could recur elsewhere). Reorderable rows.
- **Manually curated** (contrast Products, which can be blueprint pre-filled) — Team is deliberately human-controlled.

### A.2d Open items (Team)
1. Does Team membership **grant** deal access (non-members blocked), and do admins bypass? (A.2b — security-critical.)
2. Full set of **Access Levels** (Full Access / Edit / View / …?) and what each permits.
3. Default Access Level when a member is added.
4. Is a Bid Role required per member, or optional (John Doe has none)?
## A.3 Products (products/solutions on the bid)
"Assign products/solutions from the master products list and store their financial characteristics to each bid. Each cost/revenue within your bid is assigned to a product you've added here." **Products Table (customisable columns):** Product Name · Business Type · TCV — and users can add columns like **Cost, Product Margin** (more roll-ups).
"This table is **automatically filled** based off what users input in the **Estimations and Forecast** sections. Each Revenue in Forecast has a product assigned, and each revenue accumulation under that product **calculates the TCV** for each row."

### A.3a What this confirms / means
- **Deal ↔ Product is many-to-many** (a bid includes several products; a product appears in many bids) — via a **DealProduct** link. [Confirms Doc 12 B.1 / Doc 11]
- **Every EstimateLine (cost/revenue) is tagged with a Product** (`product_id`) — confirms the "Product" column on the Standard Costs / Pricing tables (Doc 11 A2.1/A2.3). This tagging is what enables product-level roll-ups *and* feeds the master Product's cross-deal Performance analytics (Doc 11).
- **The Products table is an AGGREGATION VIEW, not stored data** — TCV (and Cost, Margin…) per product row = **sum of the estimate lines assigned to that product** in Forecast. Same "pull, don't store twice" pattern as Assumptions (A.1a). Reuses the **AggregationService** + the **customisable-table/view** capability (Living Platform Model).
- **The TCV loop is now complete:** EstimateLine revenues → per-product TCV (here) → deal total TCV (= sum across products) → surfaced in **Assumptions** as the computed TCV pull (A.1a) and on the **Opportunity List** (§1). One number, one source, referenced in three places. Textbook Principle 4.

### A.3b Clarifications (✅ resolved 2026-07-06)
- **✅ No "Add Product" button here — flow resolved.** Products are **not** explicitly added to the bid. Instead, when a user creates a **revenue or cost** (in Estimations/Forecast), they **select the product** from the master Products list (Company Parameters level). This deal Products table then **auto-populates** with those products and rolls up their financials. So it is a **pure read-only aggregation view** — one flow only (tag-on-create → auto-appear), no manual add.
- **✅ "Business Type" = a new managed taxonomy, set per-deal-per-product (2026-07-06).** Values are created in Company Parameters (Doc 09). **Business Type is deal-specific**, not a master-product attribute: the *same* product can be "new business" on one deal and "retention" on another. It is **set in the deal Products page** (a per-product dropdown there), **not** line-by-line in Estimations/Forecast. → Business Type lives on the **`DealProduct`** link (`deal_id + product_id + business_type_id`).
- **Table is therefore "mostly read-only + one editable column":** the financial columns (TCV, Cost, Margin) are **computed/read-only** roll-ups; **Business Type is a user-editable per-row dropdown** set here. So the Products page is an aggregation view *with* a small amount of deal-level product classification input.
- **Relationship to Deal Type (note):** Business Type's example values ("new business", "retention", "upsell") mirror the **Deal Type** taxonomy (Assumptions, A.1). Deal Type = the deal's *overall* nature; Business Type = the nature *per product within* the deal. Likely the same value-set at two granularities — confirm whether they share one taxonomy or stay separate.
- **Blueprint link (still to confirm):** since products enter via cost/revenue tagging, the **Blueprint pre-fill** (Doc 11 A2.6) likely seeds a product's *standard business case* into the deal's Estimations, after which those lines carry the product tag and appear here. Confirm the exact trigger when we reach Estimations/Forecast.

### A.3c Reuse
- **AggregationService** (roll estimate lines up by product).
- **Customisable table / view** capability (add Cost, Margin columns).
- **`DealProduct`** link entity (deal ↔ product) — carries **Business Type** (per-deal-per-product) + any snapshotted financial characteristics; financial columns computed via aggregation.
- **Master-list picker** (`ReferenceDataPicker` over Products).
## A.4 Attachments (documents / uploads)
**Today:** a list of documents/uploads on the deal — a **reuse of the platform file service** (object storage, upload/download, versioning, per-file access; Arch §8). Small, already-available capability.

**Future vision (founder):** introduce AI so Attachments becomes an **ingestion & context layer**, not a dumb file list. Three directions:

1. **AI-assisted data entry (intelligent document processing).** AI reads uploaded docs (tenders, cost spreadsheets, estimation files) and **extracts structured data to pre-fill** estimates/assumptions. **CTO guardrail:** every extracted value carries a **citation to source** ("£800 ← tender.pdf p.4"), and a human **confirms before it commits** (AI proposes, human decides; the calc engine only ever receives confirmed inputs — Vision "no black boxes"). Fits AI Gateway (Arch §8) + calc-engine input schemas.
2. **Framework / RFP analysis (highest-value).** AI parses the tender/framework and auto-generates a **requirements/compliance checklist**, flags deadlines, obligations, SLAs, penalty clauses → surfaces into the **Risk module**. Prevents losing a bid on a missed mandatory requirement.
3. **Connecting teams (strategically expansive).** Ingest files from teams *outside* commercial pricing (e.g. a delivery/estimation team's effort files) to populate the cost tables. Same extraction capability, but conceptually points at **Skelly as a multi-persona collaboration platform** (estimation/delivery/commercial, each with their own view + access). Ties to the parked **"managers get different views"** thread and the **two-layer access** model. *Flag as a real strategic expansion — scope carefully; do not balloon v1.*

### A.4a CTO guardrails & sequencing
- **Human-in-the-loop for any financial value** AI extracts (never auto-write numbers).
- **Document confidentiality:** tenders are often NDA'd → documents respect tenant isolation + per-deal access; the **AI Gateway governs which provider sees content** and what may leave (data governance).
- **Sequencing:** build the **simple file list now**, but design for AI later without rework — rich metadata, documents **linked to the entity they inform** (deal / estimate / cost line), and **pgvector embeddings** for document search/RAG (already in stack, Doc 07). Don't build the AI yet (premature); don't foreclose it either.
- **Document versioning** matters — frameworks get reissued/amended; track versions (file service already supports this).

### A.4b Reuse
- **File service** (Arch §8) — object storage, versioning, presigned URLs, per-file access.
- Future: **AI Gateway** (extraction, RFP analysis), **pgvector** (document search/RAG), links to **Risk** (compliance/requirements) and the calc engine (pre-fill).
- Strategic thread recorded: **multi-persona collaboration** (see also parked "different views").
## A.5 Scenarios — *(covered in Doc 12 Part A; will cross-link)*
## A.6 Timeline (⭐ founder-FINALISED design — preserve)
> **Design status:** the founder has finalised and refined this page and wants the **designs kept** (the Timeline Stages editor + Timeline View Gantt). Treated as the **preferred reference design** for this page. (Still implemented on the swappable architecture — kept by choice, not locked by coupling.)

An **interactive opportunity-progress timeline** defining important bid milestones **externally** (customer-driven: clarification deadline, submission date…) and **internally** (Skelly stage deadlines). Includes timelines first defined in **Identification** (stage 1). Fully customisable / adaptable to best practice.

### A.6a Two toggled views (one dataset)
- **Timeline Stages** — the **editor**: a reorderable table where the user lays out milestones and sets dates. Columns: Stage Name · Description · Type (External/Internal) · Date · **Visible** (toggle) · Actions (edit/delete). Drag to reorder.
- **Timeline View** — the **visualisation**: a **Gantt chart** of the same milestones across a calendar (zoom 1M/3M/6M/1Y/All, a "Today" marker, display filter, navigation).
→ Classic "**one dataset, two views (editor + visualisation)**" pattern — reuse a shared milestone model behind both.

### A.6b Milestones — two categories
- **External Milestones** (customer / external parties, user-addable via **+ Add External Milestone**): Opportunity Identified, Tender Issued, Clarification Deadline, Submission Deadline, Contract Award, Contract Start, Contract End.
- **Internal Workflow** (Skelly stage deadlines — mirror the lifecycle stages): Qualification, Pipeline, Estimation, Forecast, Simulation, Approval, Outcome Tracking.

### A.6c ⭐ Timeline vs Phasing — two different temporal concepts (important)
Skelly now has **two** time structures; keep them distinct:
- **Timeline (this)** = the **bid-process** milestones/deadlines — managing *the pursuit* (when is submission due, when does the internal Forecast stage need finishing).
- **Phasing (Doc 11)** = the **financial delivery/operations phases** the models spread cost/revenue across — *the financial model*.
They **connect**: the Timeline's **Contract Start → Contract End** defines the overall project window, which sets **Duration** and feeds **Phasing** (the phases subdivide that window). So the chain is **Timeline (contract dates) → Duration → Phasing → calc engine**. This **resolves the Duration pull** (A.1a): Duration is pulled from the Timeline's contract dates.

### A.6d ⭐ Planned vs Actual — process intelligence (feeds Outcome)
Each milestone has a **planned date** and (later) an **actual completion date**. Founder intent: actual-completion data **flows into the Outcome stage** to analyse *why* bids were won/lost — e.g. did we miss the submission deadline? did an internal stage (Estimation) take too long? This is **process/cycle-time intelligence** (Vision — continuous improvement, knowledge compounds).
- **Elegant integration:** internal milestones' **actual dates come from the workflow engine** — when a stage transition happens ("Advance to…", Doc 12 B.2), it timestamps that internal milestone (from the audit log). So actuals are captured automatically, not re-entered.
- **Data model:** milestone = `{ name, description, type (External/Internal), planned_date, actual_date?, visible, order, deal_id, [scenario?] }`.

### A.6e ⭐ Reminders + the Home "compass"
The Timeline **auto-drives reminders** based on the **current date vs upcoming deadlines** (internal + external). These feed the **Home page** — described by the founder as the **user's "compass"**: a cross-deal landing page of reminders/deadlines/tasks with **hyperlinks (deep links)** to the specific bid/page. (Matches the early dashboard screenshot: Upcoming Deadlines, Assigned Tasks, etc.)
- **New reusable capability — a Reminder/Deadline engine:** a scheduled/background job (Arch async layer) + the **Notifications** service that scans upcoming milestone dates and raises reminders. Feeds Home + notifications.
- **Home = portfolio-level compass/inbox** (aggregation + deep-linking + notifications) — its own area to analyse later.

### A.6f Open items
1. ✅ **RESOLVED — Timeline is deal-level/shared** across scenarios (internal *and* external), per founder (2026-07-06). **Design for future flexibility** so per-scenario internal-deadline *overrides* are possible later without rework (build the seam, not the feature). Consistent with "only Estimations/Forecast/Simulation vary per scenario."
2. **Identification link:** which timeline milestones/dates are first defined in the Identification stage and flow here (detail when we cover Identification).
3. **Visible toggle** — controls visibility where (Gantt only, or also Home/reminders)?
4. Confirm Duration = derived from Contract Start→Contract End (A.6c).

### A.6g Reuse (→ Living Platform Model)
- **Milestone/Timeline model** (planned + actual dates) behind two views.
- **Gantt view component** (Timeline View) + **reorderable milestone editor** (Timeline Stages).
- **Reminder/Deadline engine** (scheduled job + Notifications) — reusable platform capability.
- **Home "compass"** (cross-deal aggregation + deep-linking).
- **Workflow-engine → milestone actuals** integration (stage transitions timestamp internal milestones).

## A.5 Scenarios (Deal Resource)
Concept in **Doc 12 Part A** (copy-on-write branching, now **scoped to Estimations/Forecast/Simulation only** — A.2 refinement 2026-07-06). This tab = the **Version Control** page:
- Table of scenarios: **Scenario Name** (Base + alternatives), **Strategy** (e.g. Market Match, High Probability), **Status** (Draft…), **TCV**, **Margin %**, **Owner**, **Last Updated**, Actions (view/⋮). **Table View / Card View** toggle. **+ New Scenario** and **Scenario Battle** (explained next). **Pagination.**
- **Customise button** → customisable columns (reuse of the shared customisable-table capability, like the Opportunity List and dashboards).
- **Scenario toggle on the top bar** (the "Aggressive Scenario" selector) lets users switch the active scenario **from anywhere** — efficiency feature; changing it swaps the 3 scenario-varying sections and re-derives displayed metrics.
- Scenario attributes: name, strategy, status, owner, last-updated; metrics (TCV/Margin/…) are **derived from that scenario's Forecast**.
- **Scenario Battle** = drag two scenarios into an arena for a side-by-side, per-metric comparison (winner highlighting + Decision Summary). Reads the **same table metrics**. Full detail in **Doc 12 A.5**.

## Open items (Part A)
1. ✅ **RESOLVED — Assumptions fields are pulled** (computed pulls: TCV←Forecasting, Duration←Timeline; reference selections ← Company Parameters/Accounts/Users). Remaining nuance: read-only vs override, and live-display vs snapshot for computed pulls (A.1a).
2. ✅ **RESOLVED — Duration ← Timeline contract dates.** Duration is derived from the Timeline's Contract Start → Contract End, which also feeds Phasing. Timeline (bid-process milestones) and Phasing (financial delivery/ops phases) are distinct but connected concepts (Doc 17 A.6c).
3. Revenue Model / Billing Frequency: taxonomy vs enum vs link to Models & Templates.
4. New taxonomies to add: **Sector, Region, Business Unit** (+ confirm Business Unit is a simple list vs an org-structure entity).
5. "Metrics gathered from different stages" — which Assumptions fields are auto-populated from other stages?

*Deal Resources complete (Assumptions, Team, Products, Attachments, Scenarios, Timeline).*

---

# PART B — THE BID WORKFLOW (lifecycle stages)

> How a user actually progresses a bid. **Structural clarification (2026-07-06):** the lifecycle **stages contain subsections** (sidebar items with a ">" expand). Confirmed so far:
> - **Qualification** = { **Identification**, **Qualification Pack Builder** }
> - **Estimations** = { **Phasing**, **Cost**, **Risk**, **Tax** }
> - **Forecast** = { **Revenue**, **P&L**, **Cash Flow** } *(prefill screenshot also shows "Balance Sheet" — confirm if a 4th)*
> - **Simulation** = { **Bid Simulator** } — ✅ confirmed a single page (founder 2026-07-06); the earlier prefill screenshot's Competitors/Scenarios/Submission is superseded.
>
> ⚠️ This **revises the earlier flat 10-stage list** (Doc 12 B.2), where Identification appeared as its own top-level item. Current truth: Identification is a **subsection of Qualification**. Reconcile the full stage/subsection tree as we go (some sidebar items are stages, some are subsections). The scenario-varying trio (Estimations/Forecast/Simulation) are stages-with-subsections too.

## B.1 Qualification
Two subsections: **Identification** and **Qualification Pack Builder**.

### B.1.0 ⭐ Qualification is a GATE (bid/no-bid) — validates the workflow engine
**Founder-confirmed (2026-07-06):** **no stage after Qualification is accessible until the bid has been qualified** — i.e. the **Qualification Pack is created, presented to management, and approved by management**. Before that, Pipeline / Estimations / Forecast / etc. are **locked**.
- This is a **conditional stage gate** in the lifecycle → validates **ADR-006** (configurable state-machine with gates, not free navigation). The `stage` state machine must enforce: *can't advance past Qualification until the qualification approval is granted.*
- **Flow:** Identification (score/assess) → build **Qualification Pack** → present to management → **management approval** → Pipeline+ unlock.
- **⭐ Two distinct approval gates in the lifecycle:** (1) **this qualification/bid-no-bid approval** (should we pursue at all?), and (2) the later **Approval stage** (approve the final pricing/bid before submission). Different decisions, different points. Keep them separate.
- **Ties to access/permissions:** "management" = whoever holds the approve-qualification permission (relates to the parked access model + two-layer authz, Doc 17 A.2). Confirm who approves.
- **The Pack is the gate artifact** — the Qualification Pack Builder output is what's presented for the qualify decision, connecting Identification's score → the Pack → the gate.

### B.1.1 Identification — the opportunity-qualification scorecard
**Purpose:** "Manage identified opportunities and assess whether they should be added to your pipeline. Introduce context and key assumptions from tenders/documents/frameworks." Inputs promote **objective opportunity assessment** — qualify deals on **informed data, not gut feel** — and **each opportunity is scored and benchmarked against others** to prioritise winning new business. So Identification is a **structured bid/no-bid qualification scorecard** (a recognised discipline — cf. Shipley/APMP bid-qualification), feeding the decision to promote an opportunity into the **Pipeline**.

**Inputs (by section):**

| Section | Input | Type |
|---|---|---|
| **Tender Background** | Key Information | Text box (with **hint lightbulb**: e.g. Sales Strategy, Climate/Region Profile, Partnership Models) |
| **Bid Assessment → Strategic Alignment** | Score | **Slider 1–10** |
| | Sales Strategy | Text box |
| **Customer Relationship** | Score | Slider 1–10 |
| | Incumbent Supplier | Selection (Y/N) |
| | Previous Opportunities List | **Interactive List** — auto ~5 opportunities from the **same account** |
| | Relationship Background | Text box |
| **Commercial Opportunity** | Score | Slider 1–10 |
| | Expected TCV | Number |
| | Expected ACV | **Calculation** |
| | Expected Revenue Model | Selection |
| | Pipeline Impact | **Calculation** |
| | Commercial Requirements | **Table** (Requirement + Description; bulleted) |
| **Capability Fit** | Solution / Delivery Confidence / Resource Availability | Slider 1–10 (×3) |
| | Previous Opportunities List | **Interactive List** — auto ~5 opportunities with **similar solution/scope** |
| | Existing Solution / Key Business Problem | Text box |
| | Scope Summary | Text box (bullets) |
| **Competitive Landscape** | Competitors | **Table** |
| | Incumbent Supplier | Selection |
| | Context | Text box |
| **Why Can We Win?** | Key Information | Text box (hint lightbulb) |
| **Skelly Timeline** | Key Dates/Deadlines | **Table** → **feeds the Timeline resource** |

### B.1.1a ⭐ Evaluation Criteria table (added 2026-07-06 — was missed; lives in Identification)
The **buyer's tender scoring criteria** — a table the user builds in Identification:
- **Metric** (user-editable — e.g. Price, Technical, Social).
- **Weighting %** (how much the *buyer* weights that metric; **must sum to 100**).
- **Description** (text — the *exact* criteria, so bidders can score themselves accurately). *Example:* a technical criterion "the lower the product length, the higher the technical score" — so a bidder with a very low product length sets their own technical score high.

This defines *how the buyer evaluates bids*, and it **feeds the Bid Simulator** (§B.5): the user scores themselves and each competitor against these criteria → the **Expected Score** (weighted). Reuses the **weighted-scoring** pattern (like the Deal Score, Doc 19) but for *bid evaluation*.

### B.1.2 Key mechanisms & CTO analysis
- **⭐ Weighted scoring model.** Multiple dimensions (Strategic Alignment, Customer Relationship, Commercial Opportunity, Capability Fit) each carry a **1–10 Score**; these roll up to an **overall qualification/priority score** used to **benchmark/rank opportunities** across the portfolio (→ Pipeline prioritisation). **CTO flags:** (a) define how the overall score is computed (weighted average?); (b) **make the weights configurable per company** (Company Parameters) — some clients value Capability Fit over deal size — this is "adapt to the enterprise's process" (Vision). Confirm the weighting model.
- **⭐ Interactive Lists = semantic retrieval from the Skelly DB (knowledge compounds).** Auto-surfaces ~5 relevant past opportunities: **same account** (a filter query) and **similar solution/scope** (**semantic similarity → pgvector**, already in stack). Tenant-scoped (org's own data). This is the compounding-knowledge Vision made concrete, and a natural later tie-in to Competitors/market intelligence (Doc 16).
- **Calculations:** **Expected ACV** (Annual Contract Value — likely Expected TCV ÷ duration-in-years) and **Pipeline Impact** (weighted value contribution to pipeline — likely TCV × win probability, or similar). Reusable calcs; **need exact definitions.**
- **Skelly Timeline table here is the SOURCE of Timeline dates** — confirms "timelines defined in Identification flow into the Timeline resource" (Doc 17 A.6). One source, referenced in the Timeline. Cross-linked.
- **Hint lightbulb** = a reusable **field-hint** component (examples/prompts). Natural future **SkellyAI** enhancement (suggest content from the tender docs).
- **Deal-level (shared), not scenario-varying** — Identification is qualification/context, consistent with "only Estimations/Forecast/Simulation vary per scenario."

### B.1.3 Reuse (→ Living Platform Model)
- **Score slider (1–10)** + **scorecard/weighted-score model** (reused wherever scoring happens).
- **Interactive List / semantic-retrieval** component ("find similar/related records") — pgvector-backed; reusable across the platform.
- **Editable sub-tables** (Commercial Requirements, Competitors, Key Dates) — the managed-row-table pattern.
- **Field-hint (lightbulb)** component.
- **Calc engine** for ACV / Pipeline Impact.

### B.1.4 Open items
1. **Scoring model — to be built COLLABORATIVELY, step by step** (founder, 2026-07-06). Design the overall qualification score + (likely configurable) weights together later. Parked as a dedicated joint design task.
2. ✅ **Expected ACV = TCV ÷ contract duration (years)** (confirmed 2026-07-06). ⏸️ **Pipeline Impact — PARKED (undecided).** Intent: "if we won, how much would it change the (weighted) pipeline value." Candidate formulas discussed: (a) uplift-if-won `TCV × (1 − Win Probability)`; (b) share-of-pipeline `deal value ÷ total open pipeline`. Founder not yet decided — revisit later.
3. **Stage/subsection tree** reconciliation vs the earlier flat 10-stage list (Part B header).
4. Competitors table columns; does it link to the Competitors module (Doc 16)?
5. ✅ **RESOLVED — Qualification GATES the rest of the lifecycle** (see B.1.0): stages after Qualification lock until the Qualification Pack is built, presented, and **management-approved**. (Confirm who "management" is + any score threshold.)

## B.1.5 Qualification Pack Builder
**Purpose:** "Design and automate your own Bid Qualification process. Create customised **presentations, documents, or emails** by interactively pulling desired data points from Deal Assumptions, Identification, or the wider Skelly Database. Use the Skelly Pack Template Structure or design your own sections. Set company templates when onboarding." So it's a **bespoke, data-bound document/presentation builder** for qualification packs.

**Structure:** a pack = ordered **sections**, each holding **elements**. A mock template: Opportunity Snapshot · Opportunity Background · What Are We Selling (Scope) · Why This Bid? (Bid Assessment) · Why Can We Win? · Timeline. Users can **+ Add Section** (edge cases) and **drag to reorder**. Bespoke standard template set at onboarding; each section has core inputs + flexibility to add more.

**Builder UI:** sections list (left, reorderable) · slide thumbnails (middle) · a **canvas/preview** (right) where users place and design elements. Element palette: **Text, Data, Chart, Table, Image, Divider, Note**. Header: **Preview, Share, Download Pack**; desktop/mobile preview, zoom. Branding shown (customer logo, deal ID). "All values are pulled from Skelly sources. Click any card to edit or replace content."

### B.1.5a ⭐⭐ THE KEYSTONE — "MARROW" (the unified Data Catalog / Semantic Layer)
> **Official name: MARROW** (chosen 2026-07-06) — the "pull data from anywhere in Skelly" layer. On-brand (the core inside the skeleton that feeds the whole body).
The "**Add Input to Pack**" modal reveals the most important cross-cutting capability in the whole platform. It lets a user browse **every data point across all stages** and bind it into the pack:
- **Sources:** each Deal Stage exposes its data as discoverable "inputs" — *Dashboard 23, Identification 34, Qualification 28, Pipeline 22, Estimations 56, Forecast 48, Simulation 26, Approval 24, Outcome 16, Contract Tracking 21, Done 12* — **plus the wider Skelly Database (200+ inputs).**
- **Input types:** Fields, **Charts**, **Tables**, **Text**, **Summaries** (Summaries likely AI-generated).
- **Each input has rich metadata:** source path (e.g. "Identification › Tender Overview"), type, description, current value, last-updated, updated-by, live preview.
- **Bindings are live:** "all values pulled from Skelly sources" → the pack reflects current data (single source of truth in document form).

**This is a platform-wide Data Catalog / Semantic Layer**, and it is the **same layer** that powers: the **customisable tables** (Opportunity List, Scenarios, Products — Docs 11/17), the **customisable dashboards / view-builder** (Doc 11 §4), **reporting**, and — critically — **AI retrieval** (Doc 18). I had flagged a "governed query/semantic layer" as *emerging* across several modules; the Pack Builder confirms it as a **keystone engine**. **Recommendation: build this catalog/semantic layer as a first-class foundational service** — every data point across the platform is registered with metadata, typed, permissioned, and bindable. Nearly every "customisable"/"pull from Skelly" feature — and the AI — sits on it.

### B.1.5b The document/presentation builder itself
On top of the catalog sits a **visual document builder** (bind data + free design elements → sections → export). Comparable to a lightweight Canva/Notion/slide-composer with **data binding**. Outputs: presentations/documents/emails via **Preview / Share / Download** → needs an **export/render service** (PDF/PPTX/email). **Templates** (company-level, set at onboarding) = predefined sections + bound inputs, reusable across deals (document analogue of the Blueprint). **Branding** applied (logos, deal ID).

### B.1.5c CTO flags
- **⭐ Sequence: build the Data Catalog/Semantic Layer EARLY; the visual Pack Builder LATER.** The catalog is foundational (tables, dashboards, packs, reporting, AI all need it). The pack builder is one *consumer* — powerful but a large sub-system (visual editor + export). Don't build the editor before the catalog; do make the catalog a priority. (Principle 16 / build-order.)
- **Scenario binding + snapshot-on-export.** Inputs pulled from the scenario-varying sections (Forecast/Simulation) reflect the **active scenario**. For a **shared/downloaded** pack, **snapshot values at export** (the PDF you send a client must be frozen), while the **live builder** shows current. (Convention C1.)
- **"Summaries" input type + AI auto-assembly.** Summaries are a natural **SkellyAI** output. And because everything is catalogued/structured, an **AI agent could auto-generate a qualification pack** from a template ("build the pack for this deal") — a concrete pay-off of the AI-consumable principle (Doc 18). Augment, human reviews/edits.
- **This is ambitious** — flag honestly: real value, but the visual builder + export + templates is a meaningful build. Catalog first, builder as a fast-follow/later.

### B.1.5d Reuse (→ Living Platform Model)
- **⭐ Data Catalog / Semantic Layer** (keystone — shared by tables, dashboards, packs, reporting, AI).
- **Document/Pack builder** (sections + elements + data binding) and **export/render service** (PDF/PPTX/email).
- **Pack templates** (company-level, onboarding; document analogue of Blueprint).
- Reuses the **customisable-view** capability, **charts** (from dashboards), **snapshot-on-export**, **branding**.

### B.1.5e Open items
1. ✅ **CONFIRMED — one shared feature, named "MARROW"** (founder, 2026-07-06) — the "pull data from anywhere in Skelly" catalog/semantic layer behind tables, dashboards, packs, reporting, and AI.
2. Export formats (PDF? PPTX? email?) and where **templates** live (Company Parameters?).
3. Scenario binding + snapshot-on-export confirmation.
4. Are "Summaries" AI-generated? Scope for AI **auto-assembly** of packs.
5. Branding source (bidding company vs customer logo).

## B.2 Pipeline / Benchmark
**Purpose:** the stage where the user **creates the Base scenario** and adds it to the Pipeline, with an optional **interactive benchmarking tool** that **pre-fills** the three scenario-varying stages (Estimations, Forecast, Simulation) using data from similar deals, standard solutions/products, templates, or manual input. "The key is striking a balance between **automating/pre-populating and accuracy**."

### B.2a Create Base scenario (origin of the Base scenario)
Fields: **Scenario name** (e.g. "Base Scenario (Draft)"), **Scenario owner**, **Description** (optional). "This scenario will be used to prefill your Skelly stages via benchmarking." → **This is where a deal's Base scenario is born** (ties to Scenarios, Doc 12); further scenarios (e.g. Aggressive) are forked later. Confirms the Base scenario originates in Pipeline, then gets modelled in Estimations/Forecast/Simulation.

### B.2b ⭐ The Benchmark / Prefill engine (the core of this stage)
For each scenario stage (and each subsection), the user chooses **how to prefill** from one of five **sources**:
1. **Similar Deals** — historical bids matched by similarity (e.g. "24 matches", cards showing **% match**, TCV, year; "Best match" badge). → **semantic + attribute matching** (pgvector, Doc 18; the "similar bids" pattern). Ties to Competitors/market-intelligence (Doc 16).
2. **Standard Solutions** — proven phase/structure from pre-configured solutions. *(New concept — "Solution" vs "Product"; clarify.)*
3. **Standard Products** — delivery models/standards from products = the **product standard business case / Blueprint** (Doc 11 A2.6).
4. **Templates & Libraries** — from the **Models & Templates** library (Doc 10).
5. **Manual Upload / Manual Input** — build from scratch / upload a file.

Key behaviours:
- **Mix-and-match per subsection:** e.g. use **Standard Products** for *Cost* but a **previous bid** for *Risk*. Granular source selection per subsection — maximises accuracy.
- **Auto-select all (AI):** AI picks the best sources and pre-fills everything automatically. ⭐ A headline **agentic** feature — a direct pay-off of the AI-consumable design (Doc 18): Marrow + similarity matching + the calc engine let AI assemble a full base scenario. Human reviews/edits after.
- **Data-coverage metric:** shows how complete the prefill is — e.g. "3 stages selected, **98 data points mapped, 92% avg data coverage**". Great transparency signal.
- **Preview & select:** for each source, preview the matched structure (e.g. a phase-structure preview with a mini-Gantt: Initiation & Mobilisation, Discovery & Design, Build & Configuration…) before applying. Reuses the **Marrow input-preview** UI ("About this input": source, type, description, last-updated, updated-by).
- **Review-after:** "You can review and edit after adding to pipeline." → **prefill is a starting point, not final** — the user refines in Estimations/Forecast/Simulation. This is the automation-vs-accuracy balance, and the AI-augments-human-decides philosophy in action.

### B.2c ⭐ "Benchmark" has TWO meanings — reconcile
- **Benchmark (Pipeline, here):** pre-fill/compare your *estimation inputs* against similar deals & standards. This is the primary Skelly meaning and matches the earlier "benchmarking appears in Pipeline" note.
- **Benchmark (Cost creation, Doc 11 A2.2):** compare a cost to market average / top quartile.
- **Deal-Score ranking (Doc 19):** ranking opportunities by Deal Score — I earlier assumed this was the "Pipeline benchmarking", but Pipeline's benchmarking is *data-prefill*, a different thing. **Open:** does opportunity Deal-Score ranking also live in Pipeline (e.g. a ranked pipeline list), or elsewhere? Confirm.

### B.2d Subsection tree confirmed (the prefill targets)
- **Estimations** = Phasing, Cost, Risk, Tax. *(Benchmark modal/prefill also shows "Resources" and "Assumptions" instead of Tax — the modal is conceptual; the founder-stated subsections are authoritative. Reconcile: are Resources/Assumptions prefill categories vs the Tax subsection?)*
- **Forecast** = Revenue, P&L, Cash Flow *(+ "Balance Sheet" in prefill list — confirm 4th subsection)*.
- **Simulation** = Bid Simulator *(+ Competitors, Scenarios, Submission in prefill list — confirm)*.

### B.2e CTO flags & reuse
- **Generalise "Blueprint" → a Benchmark/Prefill engine** with pluggable **sources** (similar deals, standard solutions, standard products, templates, manual) + a **similarity-matching** service (pgvector + attribute filters) + a **coverage** calculation. (Updates the Living Platform Model — Blueprint was too narrow.)
- **Auto-select-all (AI)** = an agent that composes a base scenario → governed by the AI Gateway, human-reviewed (Doc 18). Strong flagship AI capability.
- **New concept "Standard Solutions"** — clarify vs Standard Products (a Solution may be a bundle/configuration of products; possibly a new portfolio resource).
- **Only the 3 scenario-varying stages are prefilled** — consistent with the scenario scope (Doc 12 A.2). Base scenario prefilled here; other scenarios forked/benchmarked later.
- **Reuse:** Benchmark/Prefill engine, Similarity matcher, source-selection UI, Marrow input-preview, coverage metric, base-scenario creation, mini-Gantt phase preview.

### B.2f Open items
1. Does **Deal-Score ranking** of pipeline opportunities live here (B.2c)?
2. **Standard Solutions** — what is it vs Standard Products (B.2e)?
3. **Forecast: Balance Sheet** a 4th subsection? **Simulation:** Competitors/Scenarios/Submission subsections? (B.2d)
4. Estimations prefill "Resources/Assumptions" vs the "Tax" subsection (B.2d).
5. How does **Auto-select AI** decide "best" source? (Confidence/coverage weighting.)

## B.3 Estimations
"Manage phasing, cost, risk and tax estimations for each bid." **4 subsections: Phasing, Cost, Risk, Tax.** This is a **scenario-varying** stage (Doc 12 A.2) and the place where the **calculation engine (Doc 10)** actually runs — estimate lines are created here and produce the tri-series (Value/Cash/P&L). Doing Phasing first (it's the timeline everything else spreads across), then Cost, Risk, Tax.

### B.3.1 Phasing (✅ confirms & COMPLETES the phase model)
"Assign cost/revenue timing phases to each bid. Each estimate is assigned to a phase created here, enabling detailed financial forecasting." Just a table.
**Phasing Table:** Phase ID · Period · Name · Description · Start Date · End Date · Months. `Phase ID` = auto number; `Months` = End − Start (computed); the rest user-entered. **+ Add Phase** adds a row. Header: "Track and manage all delivery and operations phases **for this scenario**." Search + filter by Period.
Example rows: PHASE-001 · Delivery · "Default" · *"Auto-migrated from flat costs/revenues"* · 2026-03→2027-02 · 12mo; PHASE-002 · Delivery · "Implementation" · 2026-05→2026-12 · 8mo; PHASE-003 · **Operations** · "Skelly Engine" · 2027-01→2031-12 · 60mo.

**What this confirms/resolves:**
- ✅ **Same Phase entity as Products (Doc 11 §3)** — but this is the **deal-level, SCENARIO-SCOPED** phasing ("for this scenario"), part of the scenario-varying Estimations stage. **Resolves product-vs-bid phasing:** the **Product's phasing = the standard/blueprint** (pre-fills via the Benchmark engine, Doc 17 B.2); **Estimations Phasing = the actual, per scenario**.
- ✅ **"Period" = Delivery / Operations classifier** (CONFIRMED) — exactly the reconciliation predicted in Doc 10 §4.1 / Doc 11 §3 / Doc 17 A.6c. `Period` = the standard type (Delivery/Operations); `Name` = the client's custom label (Default, Implementation, Skelly Engine).
- ✅ **Months = End − Start**, computed.
- **Default-phase auto-migration:** a "Default" phase captures **flat (un-phased) costs/revenues** ("Auto-migrated from flat costs/revenues") → ties to the Models' flat-vs-detailed input modes (Doc 10). So even un-phased estimates land on a phase, keeping the timeline complete.
- **This is the temporal backbone the calc engine reads:** every estimate line references a phase; each model spreads its Value/Cash/P&L across that phase's months (Doc 10 tri-series). Phasing → calc engine is now fully specified.

**Reuse:** the **Phase entity + PhaseService** (Living Platform Model) and the **managed table** pattern (search, filter by Period, add/edit rows, auto ID, computed Months). Distinct from the **Timeline** resource (deal-level bid-process deadlines, shared across scenarios — Doc 17 A.6c); Phasing = financial delivery/ops periods, scenario-scoped.

**Open:** does the Timeline's Contract Start→End bound/seed these phases? (Minor — likely the contract window is the outer bound; confirm.)

### B.3.2 Cost — where Models & Templates meet bid-level forecasting
**The bid-level cost estimate table** (scenario-scoped, "for this scenario"). Same shape as Products' Standard Costs (Doc 11 A2) — this is the deal's *actual* costs.
- **Cost Table columns (✅ corrected 2026-07-06):** Cost ID · **Header** (grouping) · Phase · Description · Category · **Model** · Product · Cost Amount · CAPEX/OPEX · Currency · Total Cost · Actions. Filterable/searchable, **Views** button, **+ Add Cost**, **+ Add Header**.
- **No OTC/MRC/MTC columns.** The earlier screenshot's OTC/MRC/MTC is **superseded** — because the **cost models run those calculations internally**, the table instead has a **`Model` column**: for every cost the user specifies **which model generated it** (One-Time Cost, Resource Cost, Monthly Recurring, etc., from Models & Templates). The model then produces the timing/tri-series.
- **Grouping via Headers:** costs group under user-defined headings (e.g. "Delivery"/"Support"); ungrouped = "Unassigned". (Confirms the grouping layer flagged in Doc 11 A2.5.)
- **Product** may be "Unknown Product" (assignment optional/pending).

**Cost Creation Page (two panels)** — opened by +Add Cost or clicking a cost:
- **Left = the model framework** (the 6-step wizard = the 8-part Models & Templates structure: Cost Model → Inputs → Calculation → Timing & Logic → Adjustments → Review). "Sections are based on the Logic created in Models & Templates" → **generated from the `ModelDefinition`** (confirms Doc 10 data-driven models). Different model type ⇒ different page.
- **Right = a "Views" space** (Forecast Impact · Benchmark Costs · Cost Views): live **tri-series** (Monthly P&L, Monthly Cash Flow — 60-day-in-arrears payment terms), **Forecast Summary** (Total Cost after adj, Cash Outflow, P&L avg/peak), **Benchmark** (This Cost vs Market Average vs Top Quartile), and previews. Confirms the calc engine tri-series (Doc 10 §1.1) + adjustments pipeline + SkellyAI helper.

**Cost Views = the RIGHT PANEL, a build-your-own views space (✅ clarified 2026-07-06):**
- The **right panel** of the Cost Creation Page *is* the views space (tabs: Forecast Impact · Benchmark Costs · **Cost Views**). It currently shows **bar charts** (Monthly P&L, Monthly Cash Flow) but the user can switch to **table view** — and, crucially, **build whatever views they want** there. So it's a **customisable view-builder scoped to this cost's data** — reuses **Marrow + the customisable dashboard/view-builder** (Docs 11, 17 B.1.5).
- The Monthly Cost View / Categorized Cost View are **example views** (Excel-style, editable, CAPEX/OPEX/category rollups, annual/qtr/monthly). Editable views feed edits back through the calc engine (single source).

### B.3.2a ⭐ "Business Case Output" (✅ clarified 2026-07-06)
Founder: **the cash flows and P&Ls for each cost line, risk line, and revenue line all flow into the P&L and Cash Flow sections within Forecast.** So the **"Business Case Output" = the deal's Forecast (Cash Flow + P&L)**, built by **aggregating every estimate line's own tri-series**. Each line (cost/risk/revenue) produces its own cash-flow + P&L via its model; Forecast sums them into the deal-level Cash Flow and P&L (the business case). Confirms the flow **EstimateLine tri-series → Forecast Cash Flow/P&L → deal financial picture**. Full detail crystallises in the **Forecast** stage.

### B.3.2b CTO analysis & reuse
- **The Cost Creation wizard = the calc engine made visible** (validated again, Doc 10). Left panel drives inputs from the model definition; right panel shows the calc engine's tri-series live.
- **Cost Views = aggregation over the tri-series**, rolled by **time granularity** (month→quarter→year) and by **category / CAPEX-OPEX**. Reuse: `AggregationService` + a new reusable **Excel-style interactive table** (viewable *and* editable — edits flow back through the calc engine, single source of truth).
- **CAPEX/OPEX split** comes from the cost Category's classification (taxonomy, Doc 09) → drives the CAPEX/OPEX columns in views.
- Confirms **EstimateLine** = Phase + Category + Product + Model + Amount(s) + CAPEX/OPEX + Currency + Header, scenario-scoped, snapshotting model version + rates (Doc 10 §3).
- **Reuse:** EstimateTable (cost & revenue — one component), ModelCreationWizard (dynamic from ModelDefinition), Excel-style interactive table, AggregationService, Benchmark, SkellyAI, Marrow.

### B.3.2c Open items
1. ✅ **RESOLVED — Business Case Output = the Forecast Cash Flow & P&L** (each cost/risk/revenue line's cash flow + P&L flow into Forecast's P&L and Cash Flow sections). Detail at Forecast.
2. ✅ **RESOLVED — no OTC/MRC/MTC**; a `Model` column records which model generated each cost (the model runs the timing calcs).
3. Editable Cost Views — confirm edits recompute through the calc engine (expected).

### B.3.3 Risk — same pattern as Cost, with Risk Models
Structurally **identical to Cost** (B.3.2) — a filterable risk/contingency table (scenario-scoped), each risk = an EstimateLine with its own dedicated modelling page. Just uses **Risk Models** instead of Cost Models.
- **Risk Table columns:** Phase · Description · Category · Product · **Risk Model** · Cost Amount (+ Header grouping, CAPEX/OPEX, Currency by symmetry). **+ Add Risk**.
- **Risk creation page (same two-panel as Cost):** left = the model wizard, now driven by **Risk Models** from Models & Templates (Fixed % Contingency, Risk Register EMV — Doc 10); right = the views space (Forecast Impact tri-series, **Benchmark Risks**). The interactive section (bespoke per model): Required Inputs · Calculation Logic · Phase/Timing Logic · **Cashflow Logic (fix/defer/custom)** · **P&L Recognition Logic (fix/defer/custom)** · Adjustments · Currency · Assumptions · Monthly Cash Flow · Monthly P&L · Benchmark Risks.
- **Risk Views:** Monthly Risk View + Categorized Risk View (Excel-style, editable, CAPEX/OPEX/Total, annual/qtr/monthly) → **flow into the Business Case Output** (deal Cash Flow & P&L), exactly like Cost Views.

**Confirms & resolves:**
- ✅ **Cost / Revenue / Risk symmetry** — all three are **EstimateLines through the same calc engine**, using the **same reusable components** (EstimateTable, ModelCreationWizard, Views), parameterised by line type + model family (Cost/Revenue/Risk Models). Build once, use three times.
- ✅ **Resolves Doc 10 EMV open item — the Risks table IS the "Risk Register."** Each risk row is a register entry; the **Risk Register EMV** model (Expected Value = Probability × Impact) reads these rows. No separate register entity needed.
- **New detail:** risk **Cashflow / P&L Recognition = fix / defer / custom** options (richer than the Models doc's "in line with underlying cost profile"). Update Doc 10 risk models accordingly.
- Risk **Category** is a taxonomy with CAPEX/OPEX (Doc 09). Risks are quantified as **cost/contingency** (Cost Amount) and add to the deal's costs in the Business Case.

**Open:** confirm the risk table carries Header / CAPEX-OPEX / Currency like the cost table (assumed by symmetry).

### B.3.4 Tax — a simple fixed calculation (NO tax models)
Founder-confirmed (2026-07-06): **Tax has no models.** It is **always the same simple calculation: `Tax = Amount × Tax Rate`.** So the Tax subsection is a lightweight table — no model-selection wizard like Cost/Risk. *(Source text "manage risks" = a copy-paste typo; should read "manage taxes".)*
- **Tax Table columns:** Phase · Description · Category · **Amount** · **Tax Rate** · **Tax** (= Amount × Tax Rate, computed). **+ Add Tax**. No Product/Model column (tax isn't model-driven).
- Tax **flows into the Business Case Output** (deal Cash Flow & P&L) — it affects the financial picture like any other line.
- Tax **Category** is a taxonomy with CAPEX/OPEX (Doc 09).

**✅ Resolves the Models & Templates Tax gap (Doc 10 §4.5):** there are **no Tax Models** — tax is a fixed Amount × Tax Rate calc, not a model family.

**✅ This completes Estimations** (Phasing · Cost · Risk · Tax). Cost & Risk share the full estimate-line + model engine; Tax is a simple percentage line; all four flow into the Business Case.

**Open (minor):** where does the taxable `Amount` come from — manual entry, or derived from revenue/profit (the P&L)? (Real tax is often f(profit/revenue); confirm whether Amount is typed or pulled.)

## B.4 Forecast
Subsections: **Revenue · P&L · Cash Flow** — where the **Business Case Output** lives (every estimate line's cash flow + P&L aggregate here).

### B.4.1 Revenue — the estimate-line pattern + Cost Allocation & Profitability
Same estimate-line pattern as Cost/Risk, using **Revenue Models** (Doc 10). Revenue table: Phase · Description · Category · Product · **Revenue Model** · **Revenue Amount** · CAPEX/OPEX Amount · Currency *(source text's "Cost Model/Cost Amount" = typos)*. **+ Add Revenue**; each revenue has a dedicated modelling page (different per model — MRR ≠ One-Time). Interactive section (bespoke per model): Required Inputs, Calculation Logic, Phase/Timing, Cashflow, P&L Recognition, Adjustments, Currency, Assumptions, Monthly Cash Flow, Monthly P&L, **Cost Allocation/Profitability Summary**, Benchmark Revenues. **Templates:** a Revenue Model can use a **Template** (e.g. "Standard SaaS MRR Template") — ties to Templates & Libraries.

**⭐ Cost Allocation (the big new concept):** on a revenue's page, the user **allocates costs from Estimations against that revenue** — partially or fully (e.g. allocate £5,000 of a £50,000 Delivery Team cost; £12,000 of £12,000 Cloud Infra). Shows Total Allocated / unallocated. **This is the revenue↔cost link** that enables **per-revenue and per-product profitability & margin** (and answers "why can Products show margin-by-product" — Doc 17 A.3). See the product-assignment design decision in B.4.1a.

**⭐ Profitability Summary (live):** per-revenue Total Revenue, Allocated Costs, **Gross Profit / Gross Margin, Net Profit / Net Margin**, Direct vs Indirect costs, profit-over-time + annual breakdown donut. Toggleable/tailorable while pricing — "a live, actionable view to create accurate prices." Reusable **Profitability Summary** component.

**⭐ Commercial Adjustments Toolbar** ("how is this revenue commercially modified?"): Discount Period · Free Period · Inflation/CPI · Ramp-Up · Ramp-Down · Customer Payment Terms · Minimum Commitment · Revenue Cap · Revenue Floor · Contract Extension · FX Adjustment · Revenue Share · Profit Share · Service Credits · Performance Bonus. A rich set of commercial deal-shaping levers — **extends the Models & Templates "adjustments"** for revenue (Doc 10 §1.4). Reusable **Commercial Adjustments** library.

**Revenue Views:** Monthly + Categorized (Excel-style, editable, CAPEX/OPEX Revenue/Total, annual/qtr/monthly) → **flow into the Business Case Output** (deal Cash Flow & P&L).

**Reuse/new:** Cost-Allocation mechanism, Profitability Summary, Commercial Adjustments toolbar, model Templates — all reusable. Confirms cost/revenue symmetry + calc-engine-as-wizard.

### B.4.1a ✅ DECISION — product/cost/revenue interaction → see **Doc 21** (definitive, finalised 2026-07-06)
> **UPDATE:** the full model is now finalised in **Doc 21 — Cost/Revenue/Product Interaction Model.** Key change from the notes below: **"revenue = one product" is DROPPED** — revenue attributes to products **exactly like cost** (Direct = one product, or Shared = allocated across many, same four methods). This handles solution/bundle revenue (one revenue covering multiple products). The two-lens separation (product attribution vs cost→revenue allocation) is retained. *(Notes below kept for history.)*

**Two independent lenses:**
- **Cost → Revenue allocation** → revenue-level profitability (the split mechanism already built; a cost can be partially/fully allocated across revenues).
- **Product assignment → user-managed, separate** → product-level margin. The user directly assigns costs (and revenues) to products, independent of the revenue allocation.

**Rationale:** intuitive, flexible, decoupled (product attribution isn't forced to follow cost→revenue), and handles costs not tied to a specific revenue. **Accepted trade-off:** two attributions maintained separately *can* diverge — acceptable, as they answer different questions (chosen: user control over auto-consistency).

**Sub-decision (shared costs) — ✅ RESOLVED (2026-07-06): direct vs shared costs with driver-based auto-allocation.**
- Every cost is **Direct** (one product) or **Shared** (spans products). Direct = simple single assignment.
- A **Shared** cost is tagged once (which products / a solution / "all") + an **allocation method**; Skelly **auto-distributes** it across products (no per-product manual splitting). This is activity-based costing / cost pools.
- **Four methods, no forced default** (user picks per shared cost): **pro-rata by revenue · pro-rata by direct cost · equal split · custom fixed %**.
- **Live & derived:** allocation **recomputes automatically** whenever a revenue/cost line changes → final result is **order-independent** (incomplete data self-corrects as the model fills). This is a calc-engine dependency (Doc 10 §1.3 DAG); all four bases are **cycle-safe** (never allocate by a base that depends on the cost, e.g. gross profit).
- **Graceful handling:** empty base ⇒ show "pending – awaiting data" (optional equal-split fallback), never a misleading figure; the allocated figure is visually flagged as **live/derived** (not user-entered); **snapshot at Approval** so the submitted bid is locked.
- **`custom fixed %` = the stable escape hatch** for users who want a non-moving allocation.
- **✅ Method is freely switchable + manual override (2026-07-06).** The allocation **method is a per-cost setting the user can change any time, in any direction** (custom ↔ by-revenue ↔ by-direct-cost ↔ equal). No allocation is ever *locked*.
  - **Live vs static (not "locked"):** the 3 auto methods are **live** — the split **recomputes automatically** as revenues/costs change. **Custom is static** — the split **holds the values the user set and does not drift on its own**; the user can still edit it whenever, or switch back to an auto method.
  - **Manual override:** editing a share **switches that cost to custom, pre-seeded with the current auto split** (so tweaks are small; shares total 100%). This just means "you've taken manual control of the numbers," and it's fully reversible.
  - **Switching custom → an auto method discards the manual tweaks** (it recalculates fresh from the driver) — the only trade-off of reverting.
  - **Transparency:** manually-adjusted splits are flagged with the original auto value shown (explainable).
  - **Future enhancement:** "pinning" — fix one product's share while the rest auto-allocate live (more powerful, later).
- **Company Parameters:** (proposed) a category can be marked **shared-by-default** (e.g. "Solution Costs") to cut labour — confirm.

**Data model:** cost & revenue lines keep a **Product** field (user-set). Cost lines separately have **cost→revenue allocations** (for profitability). Product margin = Σ(revenues assigned to product) − Σ(costs assigned to product). Revenue profitability = revenue − costs allocated to it.

### B.4.2 & B.4.3 P&L and Cash Flow — ⭐ the Business Case Output (deal financial statements)
**Shared concept:** every cost/risk/tax/revenue line generates a P&L series and a cash-flow series (via its model, across Delivery/Operations phases). P&L and Cash Flow **auto-aggregate all those line series — grouped by category (Company Parameters) — into standard deal-level financial statements** at monthly/quarterly/annual granularity. **This IS the Business Case Output** (confirms B.3.2a). Auto-generated & **derived/read-only** — you edit the underlying lines, not the statement (single source of truth). Columns: an **Overall** total + per-year.

**P&L (income statement):** Revenue (by category) → Total Revenue → **COGS** (by category) + **Contingencies** (from Risk) → Total COGS → Gross Profit / Gross Margin → **Operating Expenses** (S&M, G&A, R&D) → EBITDA / EBITDA Margin → D&A → Operating Profit / Margin → Interest → Pre-Tax Profit / Margin → Post-Tax Profit / Margin. Metrics: Gross / EBITDA / Operating / Pre-Tax / Post-Tax Margin, NPV.

**Cash Flow (cash flow statement):** **Operations** (client inflows; supplier/staff/other/legal outflows; taxes → Operating Cash Flow, Cash Conversion Ratio) → **Investing** (R&D → Investing CF → Free Cash Flow) → **Financing** (Financing CF, DSCR, Net Change in Cash, Closing Cash Balance, Burn Rate, Cash Runway). Plus a **Cash & Valuation Summary** (Months Cash Negative, NPV, NPV %) — deliberately sited with cash flow.

**⭐ Category → statement classification (✅ RESOLVED 2026-07-06):** each category (cost/revenue/risk), when defined in **Company Parameters**, carries **two classifications** that drive the statements: a **P&L class** (Revenue · COGS · Contingency · Operating Expenses · Pre-Tax) and a **Cash Flow class** (Operations · Investing · Financing). The P&L and Cash Flow statements + all metrics **auto-calculate** by rolling every line up per its category's two classes; subtotals (Total COGS, Gross Profit, EBITDA, etc.) are computed by the statement. Category schema now `{code, name, desc, capex_opex?, pnl_class, cashflow_class}` (Doc 09).

**⭐ NEW — Company-Level Master Statements:** each deal's P&L and Cash Flow **roll up into a Company-Level Master P&L / Master Cash Flow** — **portfolio financial consolidation across all deals.** Major concept — the portfolio-level financial view (ties to the Portfolio Dashboard and the "commercial operating system" vision). **Open:** which scenario feeds it (Base/selected? only won deals? probability-weighted pipeline?).

**Valuation & cash metrics:** NPV (needs a **discount rate** — source = Financial Standards / Company Parameters, confirm), NPV %, Burn Rate, Cash Runway, DSCR, Cash Conversion Ratio, Months Cash Negative, breakeven.

**AI analysis (AI Gateway, Doc 18):** P&L — find errors, highlight low-revenue periods; Cash Flow — flag negative-cash months, breakeven point. An analytical assistant over the statements.

**Customizable Views:** personalised P&L / Cash-Flow views (tables/graphs/charts) — Marrow + view-builder.

**Reuse/new:** **statement-aggregation engine** (lines → category → statement structure, per scenario, per granularity), **category→statement mapping**, **Company Master statements**, **valuation calcs** (NPV/DSCR/runway/burn), AI statement analysis, view-builder.

**✅ This completes Forecast** (Revenue · P&L · Cash Flow) and **crystallises the Business Case Output** — the deal's full financial picture that every estimate line feeds.

**Open items:** category→statement mapping config; NPV discount-rate source; which scenario feeds the Master statements; statements are derived/read-only (assumed).

## B.5 Simulation (Bid Simulator) — the competitive strategy layer
Once forecasts are complete, users **model bid strategies** — discounts, walk-in/walk-out prices, and competitor intelligence. One page. Two parts: **Bid Strategy** and **Simulations**.

### B.5.0 ⭐ Scenario is SELECTED here, not forked (refines the scenario model)
Founder-confirmed: the Bid Simulator is **one page** where the user **selects which scenario to simulate** — a new scenario does **not** spawn a blank simulator. Different scenarios feed **different forecasted walk-out prices**, so scenario selection changes the forecast-derived inputs. → **Refines Doc 12 A.2:** Simulation is scenario-*selectable* (consumes a chosen scenario's forecast), not copy-per-scenario data. **Open:** are the bid-strategy inputs (your prices, competitor data) **shared across scenarios** or held per selected scenario? (Likely shared strategy, scenario-specific forecast inputs — confirm.)

### B.5.1 Bid Strategy (you vs competitors)
An interactive, filterable **participant table** — your own company (default, top) **plus competitors** — each participant with a **dedicated modelling page**. **Competitor names prefill from Identification/Qualification.**
- **Simulator table columns:** + Add Competitor · **Rank · Expected Price · Expected Score · Win Probability · Confidence Score.**
  - **Expected Score (✅ clarified):** the user **scores each participant (self + competitors) against the Evaluation Criteria** (Identification, §B.1.1a); the weighted total = Expected Score. (The criteria's Description field tells the user how to score, e.g. low product length → high technical score.)
  - **Confidence Score (✅ clarified):** how **confident the user is in a competitor datapoint** (reliability of the intel entered for that competitor) — not a bid-quality score.
  - **Win Probability:** the evidence-based output (see §B.5.4 — collaborative build).
- **Your company page — Pricing Strategy:**
  - **Walk-In Price table** (customizable rows/cols — e.g. Feature/Description, Unit Price, Units, Total) — the opening/ideal price.
  - **Walk-Out Price table** (customizable) — the floor / lowest acceptable price.
  - Estimated Price · Strategy Notes (text) · **Discount Ladder** · Other Evaluation Scores.
- **Competitor page — Pricing Strategy:** Walk-In · Walk-Out · Estimated Price · **Benchmarking** (competitors' walk-out prices from relevant historical bids — from the **Competitors/market-intelligence** module, Doc 16) / Competitor Notes · **Discount Ladder / Waterfall** · Other Evaluation Scores.
- Both: a **Competitor Overview Ranking Table**.

### B.5.2 Simulations (sensitivity)
- Create **different simulations within a version** — a filterable simulation table to manage forecast scope and **compare options**.
- **Tweaks:** Best Case / Worst Case.
- Simulations **flow into a sensitivity analysis** → **"a picture for approvers"** (feeds the **Approval** stage).

### B.5.3 New concepts & CTO analysis
- **⭐ Competitive bid modelling** — you model not just your bid but **competitors' likely bids** (their walk-in/out, discounting), to estimate your **Rank / Win Probability**. Competitor data prefills from Qualification + **benchmarks against the Competitors historical-bid database** (Doc 16) — a concrete payoff of that module.
- **Walk-in vs walk-out** = opening price vs floor; the **Discount Ladder / Waterfall** is the stepped bridge between them.
- **⭐ Win-Probability / Confidence / Expected Score = a simulation algorithm.** Given your price + competitors' prices + evaluation scores, compute your rank and win probability. **How is this computed?** (price-competitiveness + score model? a formula the user sets? weighting of price vs quality?) — the key open question (see §B.5.4). Connects to the Qualification Win Probability and scenario metrics (Doc 12 A.4).
- **Simulations ≠ Scenarios (distinct what-if layers):** **Scenarios** = full forecast variants (Base/Aggressive; own Estimations/Forecast). **Simulations** = lighter best/worst-case **tweaks** run in the simulator on a *selected* scenario, for **sensitivity analysis**. Keep them separate.
- **Sensitivity analysis → Approval** — Simulation produces the risk/sensitivity picture approvers need.
- **Reuse:** customizable tables (Marrow/view-builder); the **participant pattern** (you + competitors as rows, each with a detail page — like scenarios/products); **Discount Ladder/Waterfall** component; **Benchmarking** (Competitors); **Sensitivity-analysis** engine.

### B.5.4 Open items
1. **Win-Probability algorithm — TO BUILD COLLABORATIVELY.** Evidence-based: combines the **Expected Score** (weighted evaluation, §B.1.1a) + **price competitiveness** + **historical evidence** — internal historical bids (Skelly DB) *and* external historical bids (Competitors/market-intelligence DB, Doc 16). (Expected Score & Confidence Score now clarified — §B.5.1.) Parked as a dedicated joint build (like the Deal Score, Doc 19).
2. Bid-strategy inputs **shared across scenarios vs per selected scenario** (§B.5.0).
3. Relationship **Simulations (best/worst tweaks) → the selected Scenario** — are simulations sub-variants of the scenario's forecast?
4. **Confidence Score** definition (confidence in what — the win probability estimate?).
5. Evaluation scores — link to the tender's evaluation criteria (price vs quality weighting)?

## B.6 Approval — the Approval Pack Builder (sign-off gate)
Very similar to the **Qualification Pack Builder** (Doc 17 B.1.5) — an **Approval Pack Builder**: the same data-bound document/presentation builder, pulling live Skelly data via **Marrow**, to assemble the full bid for **management sign-off.** "Design and automate your approval process; build tailored approval packs using live data from Skelly."
- **Same builder mechanics:** sections (reorderable · + Add Section) → design elements (**Text · Chart · Table · Image · Divider · Note**) bound to Marrow inputs; **Preview / Share / Download Pack**; **Finalize Content**; slide thumbnails; canvas. The **"Add Input to Approval Pack" modal = the same Marrow "Add Input"** (sources across all stages + Wider Skelly Database; Fields/Charts/Tables/Text/Summaries; input preview + "used in this pack").
- **Fuller pack** (the complete bid for approvers): Opportunity Snapshot · Background · What are we selling · Why this Bid · Why can we win · Timeline · **Pricing Assumptions & Strategy · Risks/Contingencies · Cost Estimates · Revenues/Pricing · Cash Flow Statement · Financial Statements · Bid Simulations.** This is the **"picture for approvers"** that Simulation's sensitivity analysis feeds (B.5.2).

### B.6a ⭐ Confirms — the Pack Builder is a REUSABLE component
The Pack Builder (+ Marrow) is now used **twice** — Qualification Pack (bid/no-bid) and Approval Pack (sign-off) — so it's a **general document/pack builder** (likely reused later for proposals/reports too): build once, **template per purpose**. Elevates it in the Living Platform Model.

### B.6b ⭐ Approval = the SECOND formal gate + Manager View & Feedback
Approval is a **sign-off gate**, distinct from the Qualification bid/no-bid gate (the two approval gates flagged in B.1.0). **Manager View & Feedback:** "managers can **review approval packs and add feedback/tasks through the comments feature**." So the review mechanism is **comments + tasks** (a lighter, collaboration-driven flow), not necessarily a heavy multi-step approval workflow. Reuses the platform **Comments + Tasks** collaboration features. **Open:** is there a formal **approve/reject** action + status, or is sign-off feedback-driven via comments? (Confirm — ties to the parked access model: who may approve.)

### B.6c ⭐ Deal Score locked (governance rule)
"**Deal Score (LOCKED)** — locked at the end of Qualification; **can only be updated in Approval.**" So the qualification Deal Score (Doc 19) is a **locked point-in-time record**; **Approval is the one place it can be revised** (e.g. if the deal changed materially since qualification). Founder note: "**same concept for Outcome**" — the Outcome stage also uses this locked-score / pack pattern (heads-up for B.7). Captured as a governance rule.

### B.6d Reuse & CTO notes
- Reuse: **Marrow**, **Pack/Document builder**, **export/share**, **templates** (company approval-pack template set at onboarding).
- New reusable: **Approval workflow** (approvers · status · feedback/rework) — reusable for any sign-off.
- **Scenario:** the pack presents the chosen scenario (workspace shows "Aggressive Scenario"). Likely **Approval is where the final scenario/bid is selected & approved** — resolves the earlier open question (does one scenario get promoted?). Confirm.

### B.6f ⭐ How approval works in practice (founder domain detail, 2026-07-06)
Approval is a **call or email** where the bid team presents to management. Three design implications:

**1. ⭐ Configurable approval matrix (thresholds → level → form).** Companies require different approval **levels by bid value/complexity**, and these differ company-to-company:
- Standard/simple bid → a simple **email** to management.
- Smaller/less complex → **Business Unit** level (email or call).
- Decent size → **Geo** level (usually a call).
- Most complex/high value → **Corporate / CEO** level (call).
→ Skelly needs a **company-configurable Approval Policy/Matrix** (thresholds by value/complexity → required approval level + form). Governance config, set per company (**Company Parameters / onboarding**), driving *who* must approve and *how*. Adapts to each enterprise's process (Vision).

**2. ⭐ Multi-format output (email · slides · pack).** The Approval Pack must render in **different forms** — an **email summary** (for email approvals), a **slide presentation** (for calls, where each stakeholder presents), or a **document pack**. → the **export/render service** must produce **email, slides (PPTX), and document** formats, with **templates per format/level**. (Skelly covers the **commercial/financial** slides only — finances, risks, sensitivity, scenarios, walk-out worst case; delivery/legal/support stakeholders contribute their own slides outside Skelly.)

**3. ⭐ Iterative approval loop (rounds; rework → new scenario).** Present → management gives **feedback** → **approve or not** → may **push back to rework** (e.g. risky pricing, unaccounted costs, wrong cash flow) → **rework creates a NEW SCENARIO** → re-present. Iterate across **rounds** until approved. → the **approval workflow tracks rounds/status**, and **rework spawns a new scenario** (confirms scenarios as the vehicle for approval iterations; ties to Doc 12 + workflow engine ADR-006).

**Purpose (commercial side):** present the finances/risks/sensitivity/scenarios/walk-out so management decides **proceed / improve / reject** based on financial soundness.

### B.6g ⭐ Two approval SHAPES + fast-track tier (Doc 26 stress test, 2026-07-12)
The 4 complex cases (Doc 26) show approval isn't only the linear rework loop above. It takes **two shapes**, both first-class:
- **Linear (rounds)** — one bid refined present→feedback→rework→re-present (B.6f; Doc 12 A.5.1 lineage).
- **Parallel (option comparison)** — a **set of options/scenarios presented side-by-side for one sign-off** (Case 1: 5 scope × 2 commercial models; Case 2: unit/context sensitivity set). The Approval Pack must **compare options** (matrix/grid), not just show one bid. Management may approve one, a subset, or send the set back.
Plus a **fast-track / pre-approved tier** in the Approval Matrix for **RFI/budgetary + price-book submissions** (Case 3) — email-level or auto-approved from a pre-approved offer, vs full approval for binding bids.
→ Approval Matrix gains a **fast-track tier**; Pack Builder gains a **multi-option comparison** mode; both shapes reuse the same feedback/decision/round records.

### B.6e Open items (updated)
1. ✅ **Resolved by B.6f:** there IS approve/reject + feedback + **rounds**; **rework → new scenario**; **who approves = the Approval Matrix** (value/complexity → level) + access model.
2. Exact **Approval Matrix** config shape (thresholds, levels, forms) — Company Parameters spec (later).
3. Does Approval also **promote/lock the finally-approved scenario** as *the* submitted bid? (Confirm.)
4. Deal Score **update mechanics** at Approval (who/why/audit).

## B.7 Outcome — the stage where the LEARNING LOOP closes (founder spec + screenshot, 2026-07-12)

**What it is.** After submission, the deal resolves and the team records *what happened* + runs a structured **win/loss retrospective**. Outcome is the single most strategically important stage for the Vision's "knowledge compounds" promise: it's where **actuals flow back** into win-probability calibration, competitor intelligence, benchmarks/prefill, account performance, and pricing/estimation accuracy. Every other stage *consumes* history; Outcome is where history is *made*.

**Header.** "Viewing Scenario" selector (Base/Worst Case…) + **Comments**; **Create Scenario (Award Price)** + **Save Outcome** actions.

### B.7a The five sections (as specified)
**1. Commercial Outcome** — `Outcome` (Won / Lost / Withdrawn) · `Award Date` · `Submitted Price` · `Awarded Price` · `Final Contract Value` · `Contract Duration` · **Create Scenario (Award Price)** (spins a scenario at the awarded price — models the deal *as won*, and becomes the baseline handed to Contract Tracking).
**2. Competitor Intelligence** — `Winning Competitor` (dropdown from the competitor list — **may be your own company**, i.e. incumbent retention / self-win) · `Competitor Price (est.)` · `Difference vs Our Price` (**auto = Competitor Price − Submitted Price**) · `Confidence` (0–100%) · `Notes` (free text).
**3. Win/Loss Analysis** — `Primary Reason` (dropdown: Price · Technical · Relationship · Incumbent · Delivery · Compliance · Other) · `Supporting Note` · `Buyer Feedback (if available)`.
**4. Pricing Intelligence** — `Pricing Strategy Outcome` (Too Expensive · Competitive · Too Cheap · Unsure) · `What assumptions were wrong?` · `What would you price differently next time?`
**5. Internal Execution** — `Did internal execution negatively impact the bid?` (No · Minor · Moderate · Major) · `What affected execution?` (multi-select: Time pressure · Late scope changes · Delayed approvals · Limited SME engagement · Resource constraints · No significant issues) · `What would you change internally?`

### B.7b Verdict — does it make sense?
✅ **Strong, well-structured win/loss review.** It correctly separates two data types, and Skelly should treat them differently:
- **Structured/coded fields** (Outcome, Primary Reason, Pricing Strategy Outcome, Execution impact/factors, prices) → the **machine-learnable** signals that drive calibration, analytics, dashboards.
- **Free-text fields** (notes, buyer feedback, assumptions, "differently next time") → rich context; **AI-mineable** later (SkellyAI can cluster themes across deals).
- The dropdowns (Primary Reason, Pricing Strategy Outcome, execution factors) should be **managed taxonomies** (Doc 09) so each company tunes them.
- **Wins are learning too** — "Pricing Strategy Outcome = Too Cheap" on a *win* flags money left on the table. Good that the form supports it.

### B.7c Additions considered — founder decision: keep Outcome LEAN (2026-07-12)
I proposed sharpening the learning loop at Outcome (predicted-vs-actual, partial/per-lot outcome, rank, actual eval scores, withdrawn reason, tagged lessons, pre-fill). **Founder decided against loading Outcome with these** — Outcome stays as the 5 specified sections (win/loss facts + retrospective).
- **⭐ Predicted-vs-Actual is RELOCATED to Contract Tracking (B.8)** — and reconceived at a far more powerful granularity: **month-by-month actuals vs forecast on Cash Flow and P&L** (variance analysis), which is where it genuinely earns its keep (FP&A's core job). Win/loss is one data point; delivery is a monthly series.
- Other additions (partial/per-lot outcome, rank, eval scores, withdrawn reason, tagged lessons) are **parked as optional** — revisit only if a concrete need arises. Partial/per-lot outcome may still be needed structurally once contract-lots are built (Doc 26 open question) — flagged, not built.

### B.7d Learning-loop wiring (using ONLY the specified fields — no extra manual entry)
On **Save Outcome**, the coded fields already in the form publish to their consumers (low-cost, no new inputs):
- **Competitor Intelligence (Doc 16)** ← winning competitor + est. price.
- **Benchmark / Prefill (Doc 17 B.2)** ← this deal (won **or** lost) becomes a **similar-deal** data point for future prefill (lost deals count too).
- **Accounts (Doc 14)** ← Final Contract Value + win/loss → account **Win Rate**, value, history.
- **Reason / Pricing / Execution analytics** ← coded dropdowns → "why we win/lose" + process dashboards.
- **Contract Tracking (B.8)** ← the **Award-Price scenario** becomes the **delivery baseline** for actuals-vs-forecast.

### B.7e Open items
1. **Difference vs Our Price** — confirm base = Submitted Price.
2. Partial/per-lot outcome — deferred to when contract-lots are built (Doc 26 open question); not in Outcome now.

## B.8 Contract Tracking — actuals vs forecast, month by month (founder direction, 2026-07-12)

> **Status: NOT finalised.** The founder has *not* fully specced this stage. What's settled here is the **automatable core** — ERP integration providing **actual-vs-forecast** data/analysis — and the **mapping strategy** (B.8b-i). The full page (fields, views, workflow) is deferred until the founder designs it.

**The idea (founder).** Once won, the deal is *delivered over months/years*. Contract Tracking compares the **forecast** (the bid model — the Award-Price scenario baseline) against **actuals** at a **month-by-month** level on **Cash Flow and P&L**, so finance can see whether the deal played out as modelled — and, most importantly, **explain the variance and *why* it occurred.** This is the core job of FP&A / commercial finance, and it extends Skelly past the award into the deal's whole life.

### B.8a Why this is uniquely Skelly's to win — model-aware variance decomposition
Because Skelly holds the **model** (not just numbers — the assumptions and formulas behind every line, via the formula engine's precedent tracing + Marrow), it can **decompose** a variance into its drivers, which a generic BI/ERP report cannot:
- **Volume** (units/sign-ups differed), **Rate** (day-rate/price differed), **Mix**, **Timing/Phasing** (go-live slipped), **Scope/Change orders**, **FX**.
- e.g. "£400k cost overrun = £250k volume (8 units not 10) + £100k rate (day-rate rose) + £50k timing (go-live slipped 1 month)."
Skelly automates the **quantification + decomposition**; the **narrative** stays human but **AI-assisted** (SkellyAI drafts the "why" from the candidate drivers for finance to confirm). This decomposition is the killer feature and the differentiator vs a spreadsheet.

### B.8b Getting the actuals — integration, not manual entry (founder concern)
Manual entry would kill the "streamline/automate" value driver, so:
- **ERP integration (Oracle / SAP / NetSuite / Dynamics…)** via the **integration layer** (Doc 06) + connector/marketplace model (Doc 25) — **read-only pull** of month-by-month actuals (never writes to their ledger → safe + trusted). Per-tenant creds, least privilege.
- **⭐ The hard part is MAPPING, not plumbing.** ERPs record actuals against **GL accounts / cost centres / project(WBS) codes / POs**, not Skelly's deal→scenario→line→product. Needs a **mapping layer**: tag each deal with a **project/WBS code** that flows into the ERP, and map their **chart-of-accounts ↔ Skelly cost/revenue dimensions** so actuals land on the right forecast line. Handle many-to-many (a PO spanning deals, a deal spanning POs). Per-ERP connector + mapping templates; strong **marketplace** candidate.
- **⭐ Don't gate value on integration — manual/CSV import fallback first.** Ship the **variance engine** with a **CSV/spreadsheet actuals import** (reuse the onboarding import engine, Doc 24) → value on day one, even without an ERP hook. ERP connectors are the premium automation layer on top.
- **Reconciliation nuance:** commercial-model timing/recognition/allocations differ from statutory accounting → some variance is real, some is timing/mapping artifact. Aim for **decision-useful** variance, not a statutory close; define reconciliation rules.

### B.8b-i ⭐ Tiered mapping strategy + VERIFIED against the big-four ERPs (2026-07-12)
**Two independent dials, not one:** *time resolution* (monthly/quarterly/annual) and *structural depth* (deal / category / line). **The mapping pain is structural, not temporal** — going quarterly does NOT ease mapping (it just blurs the data); the lever is depth. Pull **monthly** (ERP has it), let finance **choose the report cadence** (quarterly smooths timing noise).

**Depth tiers — build Tier 1, treat Tier 0 as its empty-map state:**
- **Tier 0 (deal level):** match on the deal's **project/cost-object code** → total actual cost/revenue/cash vs forecast total. Near-zero config. Anchor = a per-deal code the customer also stamps in their ERP.
- **⭐ Tier 1 (category level) — the target.** Add a **chart-of-accounts → Skelly-category map** (Labour, Hardware, Subcontractors, Travel…). Built **ONCE per customer** at onboarding (AI-suggested from account names), **reused across every deal**; unmapped → an explicit "Other" bucket. Gives variance **by category**. **Tier 0 = Tier 1 with an empty map** — same pipeline; before mapping, all lands in "Other" (=deal-level); as accounts are mapped, categories light up. So don't build a throwaway Tier 0 or gate go-live on a complete map; the map fills progressively.
- **Tier 2 (line level):** opt-in, high-value deals only.

**Per-deal vs per-customer (key):** the **category map is per customer** (one-time, shared across all their deals); the **project code is per deal**. Multiple deals with the **same buyer** stay separate because each has its **own code** — the buyer is not the key. (Code says *which deal*; map says *which category*.)

**⭐ VERIFIED (web research 2026-07-12) — both concepts are real across the big four:**
- **Chart of accounts / GL accounts = universal** (basis of double-entry) — confirmed Oracle, SAP, NetSuite, Dynamics. The category side is safe.
- **A deal/project dimension exists in all four, under different names:** **Dynamics** — *Project* is a **standard financial dimension**; **SAP** — **WBS elements / internal orders** (Project System cost objects); **Oracle** — **Project Costing** module + COA segments; **NetSuite** — native Department/Class/Location + a **custom "Project" segment**.
- **All four share the same shape:** GL account + configurable **segments/dimensions**. So our design — *"let the customer nominate which dimension identifies a contract and which accounts map to each category"* — is the **native** way to read them, not a workaround. Our mapping layer consumes their existing segment/dimension model.
- **Confidence:** COA = very high (universal). Deal-dimension = high for our target (project-based bidding shops; strongest in SAP/Oracle, standard in Dynamics, often a custom segment in NetSuite). **Residual risk = data discipline** (is every posting consistently coded to the project?), not field existence → mitigated by the "Other/unallocated" bucket + CSV fallback.
- **Sources:** Microsoft Learn (Dynamics financial dimensions); Oracle Project Costing docs; SAP cost-objects/GL (univ. accounting refs); NetSuite custom segments (Houseblend).

**Shared-cost caveat (carries over from bidding):** directly-coded costs map perfectly; genuinely **shared** costs across a buyer's deals (e.g. one account manager on 3 deals, booked to a general cost centre) aren't tagged to one deal → need an **allocation rule** or sit in **"unallocated"**, never force-fitted.

### B.8c Strategic value
- **Closes the full lifecycle** — Skelly owns the deal from opportunity → delivery, becoming the system of record for its whole life.
- **New buyer + stickiness** — reaches **FP&A / commercial finance** (a second buyer beyond bid teams) and drives **monthly** dependence (retention).
- **Real estimation-accuracy learning** — actual costs/revenues vs estimates tell you whether your **estimates/benchmarks were good** → feeds back to sharpen **standard costs + benchmark prefill** for the *next* bid. This is the compounding-knowledge loop, powered by hard actuals (the founder's earlier "learn from past deals" goal, better served here than at Outcome).

### B.8d Open items / to spec when founder shares the screen
1. ✅ **Mapping granularity — RESOLVED (B.8b-i):** build **Tier 1** (category), Tier 0 = its empty-map state, Tier 2 (line) opt-in; map per-customer, code per-deal; verified vs big-four ERPs.
2. **Which ERPs first** (Oracle/SAP likely) + the manual-import MVP scope.
3. **Variance decomposition dimensions** to support at v1 (volume/rate/timing/scope/FX?).
4. **Baseline** — confirm the Award-Price scenario is the fixed baseline; how re-baselining (approved change orders) works.
5. **Reconciliation rules** (timing/recognition differences) + how "actuals" periods lock.
6. **Access** — finance-facing views/permissions.

## B.9 Done — the deal's end state + permanent knowledge (founder, 2026-07-12)
**What it is.** The lifecycle's **final state**, reached when a bid has been **fully delivered and completed** (i.e. the **contract end date** passes). The deal is then reclassified as a **historical / internal bid** — no longer active, but **fully retained**.
**⭐ The point of Done = memory, not archival.** Its content/data stays stored *because it is key to winning future business*: a completed deal feeds **benchmarks/prefill** (Doc 17 B.2 — "similar deals"), **win-probability** history (Doc 23), **standard costs/estimation accuracy** (from Contract Tracking actuals, B.8), **account track record** (Doc 14), and **competitor intelligence** (Doc 16). Done is where a deal stops being *work* and becomes *institutional knowledge* — the compounding-knowledge engine of the Vision.
**Design notes:** Done = a lifecycle status (not deletion — archive-not-delete, Principle/soft-delete); it remains searchable and available to the Similarity matcher + Marrow; retention/permissions per governance. Not yet detailed further by the founder.
