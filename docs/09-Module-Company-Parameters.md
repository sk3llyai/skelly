# 09 — Module: Company Parameters

> **Status:** SPECIFIED (Financial Standards deferred). Organization & Users + Taxonomy Management are analysed and have a complete Engineering Specification (§D). All blocking questions resolved by the founder (2026-07-06). Financial Standards / Operating Expenses is deferred to a later analysis. No code yet (onboarding phase).
> **Source of truth:** Founder's product design (verbatim capture in §0). CTO analysis follows the 15-point onboarding framework.
> **Last updated:** 2026-07-06

---

## 0. Source document (as provided, verbatim)

**Company Parameters** — company parameters feed into other areas of Skelly, e.g. at the bid level in forecasting.

**Organization & Users**
- Create User Profiles to allow personalised access to Skelly depending on roles or functions.
- Sections:
  - Users (Table) — + Add User; fields: Name, Email, Password, Role

**Taxonomy Management**
- Customise and manage categories, dropdowns, classifications, bands, and tags that live within the Skelly workflow. Includes assigning financial categories and deal classifications so businesses can tailor taxonomy to what users are used to.
- Sections:
  - Cost Categories (Table) — + Add Category; fields: Description, CAPEX/OPEX
  - Revenue Categories (Table) — + Add Category; fields: Description, CAPEX/OPEX, Reporting Group
  - Risk Categories (Table) — + Add Category; fields: Description, Classification (Dropdown)
  - Deal Type (Table) — + Add Type; fields: Description
  - *Note: "Locate every taxonomy or dropdown input users will design."*

**Financial Standards / Operating Expenses**
- "Define standard…" **[DOCUMENT TRUNCATED HERE — awaiting remainder]**

---

## 1. What this module is (my understanding)

**Company Parameters is Skelly's organisation-level configuration domain.** It is where an organisation, once, defines the reference data and standards that every downstream transactional area (opportunities, bids, estimation, forecasting, risk, reporting) then *consumes*. It is the embodiment of the Vision's "enter once, reuse everywhere / knowledge compounds" and "adapt to each enterprise's process" philosophies: each customer tailors Skelly's vocabulary (cost categories, revenue categories, risk categories, deal types) and financial standards to how *they* already work.

Three distinct concerns live inside it:

1. **Organization & Users** — identity and access: who is in this organisation and what role they hold.
2. **Taxonomy Management** — the customisable classification lists (categories, dropdowns, bands, tags) that give the platform its per-tenant vocabulary.
3. **Financial Standards / Operating Expenses** — organisation-wide financial defaults (e.g. standard operating-expense assumptions) that seed financial models. *(Detail pending — truncated.)*

The founder's own framing is the key architectural signal: these parameters **"feed into other areas… at the bid level in forecasting."** So Company Parameters is not a standalone feature — it is a *provider of defaults and reference data* to the rest of the platform. That relationship (are they live references or seeded snapshots?) is the single most important design question here, addressed in §C.

## 2. Where it fits in the wider platform

Mapping to the Architecture Blueprint (doc 06):

- **Organization & Users** → the `organisations` and `users-and-access` platform/domain modules. These are already #6 in the foundational build order — Company Parameters is, correctly, foundational.
- **Taxonomy Management** → a new cross-cutting **`taxonomy` (reference-data) service**. This is consumed by nearly every business domain, so it belongs in the platform/shared layer, exposed via a clean interface (Architecture §4.2).
- **Financial Standards** → an organisation-scoped **`financial-standards`** configuration area, consumed by `estimation`, `costs`, `forecasting`.

**Direction of dependency:** business domains depend on Company Parameters, never the reverse. Taxonomy and standards know nothing about bids; bids read taxonomy and standards. This keeps the reference domain stable and reusable (Principle 6).

## 3. Ambiguities identified (need founder confirmation)

1. **Defaults vs. live references (THE critical one).** When a company parameter feeds a bid/forecast, does the bid (a) always read the *current* company value, or (b) *snapshot* the value at the moment it's used, so later edits to the parameter don't silently change historical bids? For an auditable, "no black box" financial platform, (b) is almost always correct — but it must be confirmed, because it shapes the entire data model. *(See §C1 — highest priority.)*
2. **"Password" as a user field.** The Users table lists Password. Per our security architecture (ADR-012, no homegrown login), Skelly should **not** store passwords — identity is delegated to an auth provider (WorkOS), and users are onboarded via *invitation*, not by an admin typing their password. Recommend replacing "Password" with an invite/status flow. *(See §D — improvement, needs approval.)*
3. **What are the Roles?** "Role" drives the whole permission model. Which roles exist (Admin, Manager, Contributor, Viewer…)? Are they fixed or customisable per organisation?
4. **CAPEX/OPEX** — is this a fixed two-value classification (Capital vs Operating) or itself a managed dropdown? (Assumed fixed enum.)
5. **Risk "Classification" dropdown** — what are its values, and is that list itself user-managed (i.e. a taxonomy within a taxonomy)?
6. **Revenue "Reporting Group"** — free text, or a managed list? If managed, it's *another taxonomy* and should reuse the same machinery.
7. **Deal Type** — confirmed consumed by Opportunities/Bids for deal classification? What attributes beyond Description (e.g. does deal type drive workflow variation)?
8. **Uniqueness & identity of categories** — are categories identified by Description (a name) or by a stable code? Names change; codes shouldn't. Important for referencing from history (§4).

## 4. Missing edge cases (engineering-critical)

- **Reference-data lifecycle — the big one.** What happens when a category is **renamed** or **deleted** while historical bids reference it? A hard delete would corrupt or orphan historical financials — unacceptable for an auditable platform. Required behaviour: categories are **archived, not deleted**, once referenced; and historical records must continue to resolve to the value as it was. This interacts directly with the defaults-vs-snapshot question (§C1).
- **Display order** of dropdown values (users expect to order their categories, not alphabetical only).
- **Active/inactive toggle** — retire a category from *new* use while keeping it valid on old records.
- **Default selection** — can a category be marked the default for new records?
- **Duplicate prevention** — reject duplicate category descriptions within an org (and decide: case-sensitive?).
- **Bulk import** — enterprises will not hand-add 200 cost categories; they'll want CSV import. (Can be phase 2, but the data model should not preclude it.)
- **User edge cases:** email uniqueness; deactivating vs deleting a user who authored historical records (must soft-deactivate, never hard-delete — they still "own" last year's bid); can one user belong to multiple organisations (enterprise groups)?; re-inviting; role changes and their audit trail.
- **Empty states** — a brand-new organisation has no taxonomy; downstream modules must handle "no categories defined yet" gracefully, and we should consider seeding a sensible default taxonomy set on org creation.
- **Permission to manage parameters** — who can edit taxonomy/standards? This is powerful, org-wide config; it must be an admin-level, audited action.

## 5. Engineering challenges

1. **Generic-vs-specific taxonomy design** (see §6/§7) — balancing one reusable taxonomy engine against four lists with *different* attributes. Getting this abstraction right is the central engineering decision of this module.
2. **Referential integrity across time** — keeping historical financials correct when reference data changes. Solved by archive-not-delete + snapshot-on-use (pending §C1).
3. **Tenant isolation** — every entity here is org-scoped; this module is where `organisation_id` + Row-Level Security (ADR-007) gets established as the pattern for the whole platform.
4. **Change auditing** — taxonomy and financial standards feed money; changes to them must be captured in the append-only audit log (Architecture §6.2) so a forecast shift can be explained.
5. **Downstream propagation semantics** — defining, once, the rule for how config changes do/don't ripple into existing records (this becomes a platform-wide convention, so it's worth getting explicitly right here).

## 6. Suggested improvements (require founder approval before changing the spec)

- **IMP-1 — Replace "Password" with an invitation + delegated-auth flow.** Admin adds a user by Name + Email + Role; the system sends an invite; the user sets their own credentials via the auth provider (or SSO). *Why:* eliminates password-handling liability, matches enterprise expectations, aligns with ADR-012. *Trade-off:* slightly more moving parts than a password field (needs an invite/email step) — but this is table stakes for enterprise.
- **IMP-2 — Model all four taxonomies on one shared foundation** (a common "managed reference list" core) with per-type attribute extensions, rather than four unrelated tables. *Why:* Principle 7 (reuse) — one UI component, one service, one API pattern, one audit path for all of them; adding the *next* taxonomy (there will be many — the doc says "locate every taxonomy") becomes trivial. *Trade-off:* a shared abstraction is slightly more work to design up front and must not be over-generalised (Principle 16). Detailed in §7.
- **IMP-3 — Treat "Reporting Group" and Risk "Classification" as managed taxonomies too**, if they're meant to be user-configurable — reusing the same machinery instead of bespoke fields.
- **IMP-4 — Introduce stable codes for categories** (in addition to the human-editable Description) so downstream records reference something that survives a rename.
- **IMP-5 — Seed a default taxonomy set** on organisation creation, so a new tenant isn't staring at empty tables (better onboarding UX, Vision — UX Philosophy).

## 7. Reusable assets identified

This is module #1, so it *establishes* patterns. The standout is that **Taxonomy Management is a reusable subsystem, not four features.**

### 7a. Reusable UI components
- **`ManagedListTable`** — the add-row / inline-edit / archive / reorder table used identically by Cost Categories, Revenue Categories, Risk Categories, Deal Types, and every future taxonomy. Configurable columns per type.
- **`ReferenceDataPicker`** — the dropdown/select control that every *downstream* module uses to pick a category. One component, tenant-aware, respects active/archived state. Built once here, reused platform-wide.
- **`UserTable` / `RoleSelector`** — reusable within access management.

### 7b. Reusable backend services
- **`TaxonomyService`** — CRUD + lifecycle (create, edit, archive, reorder, prevent-delete-if-referenced) for *typed* reference lists. The single source of truth for all classification data (Principle 4).
- **`OrganisationService`** — org profile + settings.
- **`UserAccessService`** — users, invitations, roles, activation/deactivation.
- **`FinancialStandardsService`** — org financial defaults *(scope pending truncated section)*.

### 7c. Reusable database entities
- **`Organisation`** — the tenant root; every other entity references it.
- **`User`** and **`Membership`** (user ↔ organisation ↔ role) — modelling membership separately from user cleanly supports "one user, multiple orgs" later.
- **`TaxonomyType`** and **`TaxonomyItem`** — the shared reference-data backbone (with per-type attribute columns or a typed-attribute extension). `CAPEX/OPEX` as a fixed enum.
- **`FinancialStandard`** *(pending)*.
- All carry `organisation_id`, audit fields, and soft-delete/`archived_at` (Architecture §6.2).

### 7d. Reusable APIs
- A **consistent taxonomy CRUD API shape** (`GET/POST/PATCH …/taxonomies/{type}/items`) reused for every taxonomy type — one documented pattern, many types. Establishes the REST conventions (doc 07) for the whole platform.
- Access-management API (users, invites, roles).

### 7e. Reusable calculations
- None *produced* here (this is configuration), but this module *supplies inputs* to calculations: CAPEX/OPEX classification drives financial aggregation; financial standards seed estimation/forecasting formulas. Worth noting so the calc engine (Architecture §4.4) treats these as versioned inputs.

### 7f. Reusable permissions
- Establishes the first permissions: **`organisation.manage`**, **`users.manage`**, **`taxonomy.manage`**, **`financial-standards.manage`** — all admin-tier, all audited. Sets the RBAC pattern (Architecture §7) the rest of the platform follows.

## 8. Integration with the rest of Skelly

- **Opportunities / Bids** consume **Deal Type** (classification) and the taxonomy pickers.
- **Estimation / Costs** consume **Cost Categories**, **CAPEX/OPEX**, and **Financial Standards**.
- **Revenue / Forecasting** consume **Revenue Categories**, **Reporting Group**, and **Financial Standards** — this is the founder's stated "feeds forecasting at bid level" link.
- **Risk** consumes **Risk Categories** + **Classification**.
- **Reporting** groups and aggregates by these categories and CAPEX/OPEX — so the taxonomy is also the backbone of reporting dimensions.
- **Audit** records every change to these parameters.
- The **defaults/snapshot rule** (§C1) governs *how* every one of these integrations behaves over time.

---

## C. DECISIONS & OPEN QUESTIONS

### Resolved (founder-confirmed 2026-07-06)
- **✅ C1 — Snapshot at time of use.** Company parameters feeding a bid/forecast are **snapshotted** at the moment of use; later edits to a parameter do **not** alter historical bids. This is the auditable, "no black boxes" behaviour and now governs the data model for this module *and* the platform-wide convention for how config feeds transactions. Reference data is therefore **archive-not-delete**, and downstream records store a resolved snapshot (value + which version/code it came from) rather than only a live foreign key.
- **✅ C3 — Invite + delegated auth (IMP-1 approved).** No stored passwords. Admin adds Name + Email + Role; system sends an invitation; user sets credentials via the auth provider / SSO. The "Password" field is removed from the data model.

- **✅ C4 — Roles are per-organisation customisable.** Roles are defined by each company at onboarding and must be flexible. This means **custom RBAC**: *permissions* are a fixed system catalogue (atoms); *roles* are org-scoped, editable bundles of those permissions. Skelly seeds sensible default roles (Admin, Manager, Contributor, Viewer) on org creation, which the org can edit, extend, or replace. (Design in §D.)
- **✅ C5 — Risk Classification and Reporting Group are user-managed taxonomies.** Both are managed reference lists, reusing the same taxonomy machinery. (Founder confirmed Classification; Reporting Group treated the same by the same logic — flag if that's wrong.)
- **✅ C6 — Stable codes approved (IMP-4).** Every taxonomy item has a stable `code` alongside its editable `description`. Downstream references and snapshots use `code`, so a rename never breaks history.
- **✅ C7 — Deal Type is a user-defined managed list.** Users define their own deal types (managed taxonomy, description + code); no extra attributes for now.

### Deferred
- **Financial Standards / Operating Expenses** — deferred by founder decision (2026-07-06). Not in scope for this spec; to be added later as its own analysis. This module's spec covers **Organization & Users** and **Taxonomy Management** only.

### Design note — custom roles (CTO flag)
Per-org custom roles are the right enterprise call, but worth naming the trade-off: they're more work than fixed roles and put real power in customers' hands. We contain the risk by making *permissions* the fixed, code-defined atoms (so the system's security surface is fully known and testable, Principle 12) and letting orgs only *compose* them into roles — they can't invent new capabilities, only bundle existing ones. Seeding good defaults means most customers never touch it.

## D. Engineering Specification

**Scope:** Organization & Users + Taxonomy Management. (Financial Standards deferred.)
**Status:** Ready for implementation planning. No code yet (per onboarding phase).

### D.1 Domains & modules touched
- `organisations` (domain) — the tenant root and org profile.
- `users-and-access` (domain) — users, memberships, roles, permissions, invitations.
- `taxonomy` (platform/shared service) — the reusable managed-reference-list engine.
- `audit` (platform) — records all changes here.
All three sit behind clean module interfaces; downstream domains consume `taxonomy` and `users-and-access` only through those interfaces (Architecture §4.2).

### D.2 Data entities (fields illustrative; all carry `organisation_id`, `created_at/by`, `updated_at/by`, and soft-delete/`archived_at` unless noted)

**Organisation** — `id`, `name`, `slug`, `status`, settings. The tenant root; RLS anchor for every other table (ADR-007).

**User** — `id`, `name`, `email` (unique), `auth_provider_id` (link to WorkOS identity), `status` (`invited` | `active` | `deactivated`). **No password column** (C3). A `User` is global; org membership is separate.

**Membership** — `id`, `user_id`, `organisation_id`, `role_id`, `status`. Separating membership from user cleanly supports one user in multiple orgs later. RLS-scoped by org.

**Invitation** — `id`, `email`, `organisation_id`, `role_id`, `token`, `status`, `expires_at`. Drives the invite flow (C3).

**Role** — `id`, `organisation_id` (org-scoped, custom per C4), `name`, `description`, `is_system_default` (seeded defaults are editable/removable).

**Permission** — `key` (e.g. `taxonomy.manage`), `description`. **System-defined, NOT org-scoped, NOT user-editable** — the fixed catalogue of capabilities.

**RolePermission** — `role_id`, `permission_key`. The composable bundle (C4 design note).

**Taxonomy items — shared "ManagedList" base** (common to every taxonomy): `id`, `organisation_id`, `code` (stable, C6), `description` (editable), `display_order`, `is_active`, `archived_at`, audit fields. Uniqueness: `(organisation_id, code)` and `(organisation_id, description)` while active.

Typed taxonomy tables built on that base:
- **CostCategory** — + `capex_opex` (enum: `CAPEX` | `OPEX`, fixed — not user-managed; confirm).
- **RevenueCategory** — + `capex_opex` (enum), + `reporting_group_id` → **ReportingGroup**.
- **ReportingGroup** — managed list (C5). Base only.
- **RiskClassification** — managed list (C5). Base only.
- **RiskCategory** — + `classification_id` → **RiskClassification**.
- **DealType** — managed list (C7). Base only.

*Design decision (taxonomy modelling):* **typed per-type tables sharing a common base**, rather than one polymorphic JSONB table. *Why:* financial reference data deserves real referential integrity and typed columns — and two taxonomies (Revenue→ReportingGroup, RiskCategory→RiskClassification) are genuine foreign keys, which a JSONB blob can't enforce (Principles 4, 9). *Reuse is preserved at the code layer*, not by collapsing the schema: a generic `TaxonomyService<T>` and a generic `ManagedListTable` UI provide shared behaviour over typed tables. *Trade-off:* adding a brand-new taxonomy needs a small migration — acceptable and explicit, and far safer than an untyped bag. *Alternative (polymorphic + JSONB):* faster to add types, but sacrifices integrity/typing — rejected for financial data.

### D.3 Snapshot mechanism (platform-wide convention, per C1)
When a downstream record (e.g. a bid cost line) uses a taxonomy item, it stores **both**:
- a **soft reference** — `taxonomy_item_id` (for live reporting/roll-ups and traceability), and
- an **immutable snapshot** — `code` + `description` + relevant attributes **as-of** the moment of use.
So historical records are self-contained and explainable even after the taxonomy is edited or archived (no black boxes). Taxonomy items are **archived, never hard-deleted**, once referenced. This pattern is defined here and reused everywhere config feeds transactions.

### D.4 Services & key interfaces
- **`TaxonomyService`** — `list(type, {includeArchived})`, `create`, `update`, `archive`, `reorder`, `resolveSnapshot(type, code)`; enforces uniqueness, archive-not-delete, and referential checks (can't archive a ReportingGroup still used by an active RevenueCategory). Single source of truth for all reference data.
- **`OrganisationService`** — org CRUD/settings; **seeds default roles + a starter taxonomy set on creation** (IMP-5).
- **`UserAccessService`** — invite, accept-invite, activate/deactivate, assign role, list members.
- **`RoleService`** — create/edit org roles, assign permissions from the fixed catalogue.
- **`PermissionService`** — the central `can(user, org, permission, resource?)` check every module calls (Architecture §7).

### D.5 API (REST + OpenAPI, doc 07). Consistent taxonomy pattern reused per type:
- `GET/POST /v1/orgs/{orgId}/taxonomies/{type}/items`, `PATCH/DELETE …/items/{id}` (DELETE = archive).
- `POST …/items/{id}:reorder`.
- Access: `GET/POST /v1/orgs/{orgId}/members`, `POST …/invitations`, `POST /v1/invitations/{token}:accept`, `PATCH …/members/{id}` (role/status).
- Roles: `GET/POST/PATCH /v1/orgs/{orgId}/roles`, `GET /v1/permissions` (the fixed catalogue).
All endpoints authenticated, org-scoped (RLS), authorised via `PermissionService`, validated by shared Zod schemas.

### D.6 Permissions introduced (the fixed atoms)
`organisation.manage`, `users.manage`, `users.invite`, `roles.manage`, `taxonomy.view`, `taxonomy.manage`. (Financial-standards permissions deferred with that section.) These seed the platform's permission catalogue.

### D.7 Reusable UI components
`ManagedListTable` (all taxonomies), `ReferenceDataPicker` (all downstream dropdowns), `MembersTable`, `RoleEditor` (permission-bundle checklist), `InviteUserDialog`.

### D.8 Testing strategy (Principle 12)
Unit: taxonomy uniqueness, archive-not-delete, snapshot resolution, `can()` permission checks, role→permission composition. Integration: invite→accept→membership flow; RLS tenant-isolation tests (critical — assert org A cannot read org B's taxonomy); referential guard (archiving a referenced ReportingGroup is blocked). These are security- and money-adjacent, so they get full coverage.

### D.9 Documentation deliverables
Module README (purpose, entities, extension points — how to add a new taxonomy in <1 hour), the snapshot convention written up as a platform pattern, and ADRs for the taxonomy-modelling and custom-roles decisions.

### D.10 Future improvements (Step 7)
Bulk CSV import of taxonomies; taxonomy item merge (consolidate duplicates while preserving history); role templates shareable across orgs; SCIM auto-provisioning of users; per-taxonomy validation rules. All additive on this foundation.

---
*Reusable-asset inventory (§7) to be promoted into a standalone Living Platform Model doc when module #2 arrives.*

---

# ADDENDUM — "PORTFOLIO LEVEL RESOURCES" document (2026-07-06)

> **Source:** Founder-uploaded `PORTFOLIO LEVEL RESOURCES.docx` (text + 3 embedded UI screenshots). The founder noted the screenshots are **rough examples**, not final UI, and that UI will be experimented with. Screenshots are therefore treated as *directional*, the doc text as *primary*, and the original first prompt as *superseded where they conflict*.

## A. Newly revealed structure

### A.1 Portfolio Level Resources (the parent level, new)
Company Parameters sits inside a top-level **"Core Portfolio Level Resources"** area alongside sibling resources, shown in the top navigation:
- **Parameters** (= Company Parameters, this module)
- **Products**
- **Accounts**
- **Competitors**
- **Models & Templates**

These "are tailored during client onboarding and act as the foundation for the Skelly system to function." Products, Accounts, Competitors, and Models & Templates are **named but not yet detailed** — future modules.

App-level chrome (from screenshots): left rail = *Home · Portfolio Dashboard · Skelly Bid Engine*; the **Skelly Bid Engine** is where the bid workflow lives; a **Portfolio Dashboard** aggregates deals/tasks/mentions; a persistent **AI assistant** bar sits at the bottom.

### A.2 Company Parameters sidebar (confirmed sections)
`Organizations & Users` · `Taxonomy Management` · `Cost Models` · `Operating Expense Models` · `Risk Models` · `Tax Models` · `Revenue Models`.

The five **"…Models"** sections are named but undetailed. **CTO read:** these are almost certainly where calculation models / financial standards live — they connect to the deferred *Financial Standards / Operating Expenses* section and to the **calculation engine** (Architecture §4.4). Held as placeholders pending detail. This also suggests "Operating Expenses" appears twice with different meaning: as a *taxonomy* (Operating Expenses Categories) and as a *model* (Operating Expense Models) — worth keeping distinct.

## B. Revised taxonomy set (supersedes the earlier list)

Taxonomy Management contains these managed tables. All share the reusable ManagedList base (code, name/description, order, active, archive, audit — §D.2). CAPEX/OPEX applies only to the first four:

| Taxonomy table | Name | Description | CAPEX/OPEX | Notes |
|---|---|---|---|---|
| Cost Categories | ✓ | ✓ | ✓ | screenshot also shows Allocation Method, % TCV, Status (directional) |
| Risk Categories | ✓ | ✓ | ✓ | CAPEX/OPEX now applies (was "Classification" in first prompt) |
| Tax Categories | ✓ | ✓ | ✓ | new |
| Revenue Categories | ✓ | ✓ | ✓ | CAPEX/OPEX now applies (was "Reporting Group" in first prompt) |
| Operating Expenses Categories | ✓ | ✓ | — | new |
| Delivery Model Categories | ✓ | ✓ | — | new |
| Deal Type Categories | ✓ | ✓ | — | (matches earlier "Deal Type") |
| Bid Roles | ✓ | ✓ | — | new; likely links to user roles/resourcing at bid level |
| *Merge & Split Bands* | ? | ? | — | screenshot-only ("bands"); confirm |
| *Deal Classification Tags* | ? | ? | — | screenshot-only ("tags"); confirm |
| Sector | ✓ | ✓ | — | added — Bid Assumptions dropdown (Doc 17 A.1) |
| Region | ✓ | ✓ | — | added — Bid Assumptions dropdown (Doc 17 A.1) |
| Business Unit | ✓ | ✓ | — | added — Bid Assumptions dropdown (confirm: simple list vs org-structure entity) |
| Billing Frequency | ✓ | ✓ | — | added — Commercial Structure dropdown (Doc 17 A.1) |
| **Business Type** | ✓ | ✓ | — | **added 2026-07-06 (founder request)** — dropdown created in Parameters; **set per-deal-per-product** in the deal Products page (on the `DealProduct` link), NOT a master-product attribute (same product can be "new business" on one deal, "retention" on another). Values mirror Deal Type; confirm shared vs separate taxonomy. (Doc 17 A.3) |

> **Note (2026-07-06):** taxonomies discovered while analysing the Bid Engine (Sector, Region, Business Unit, Billing Frequency, **Business Type**) all belong here in Company Parameters → Taxonomy Management, using the same reusable taxonomy engine (§D.2). Business Type was explicitly requested by the founder as a user-creatable dropdown that appears in the deal-resources Products page.

> **⭐ Note (2026-07-06) — categories carry statement classifications (drives the auto P&L & Cash Flow).** In addition to name/description/code and **CAPEX/OPEX**, each **Cost / Revenue / Risk category** must also be assigned two classifications when defined:
> - **P&L classification:** Revenue · COGS · Contingency · Operating Expenses · Pre-Tax (the Forecast P&L then auto-computes subtotals: Total COGS, Total COGS & Contingency, Gross Profit, EBITDA, Operating Profit, Pre/Post-Tax).
> - **Cash Flow classification:** Cash Flow from Operations · Investing · Financing.
> The Forecast P&L and Cash Flow statements (and all their metrics/margins) **auto-calculate** by rolling each line up according to its category's two classifications (Doc 17 B.4.2/3). So category schema = `{ code, name, description, capex_opex?, pnl_class, cashflow_class }`.
> **CAPEX/OPEX (✅ confirmed Option B, 2026-07-06):** a fixed two-value attribute. The **category carries the default**; a **cost line inherits it and can override per-line** (handles mixed categories like "Infrastructure" — owned=CAPEX vs cloud=OPEX — without splitting categories). Single default source (category) + a visible, deliberate per-cost exception.

**Engineering impact:** this makes the *reusable taxonomy engine* decision unambiguously correct — there are now ~8–10 taxonomy types. The `capex_opex` column becomes an **optional typed attribute present on a subset** of taxonomies, which the "typed per-type tables on a shared base" model (§D.2) handles cleanly. Adding "bands" and "tags" confirms the engine must support not just categories but also band-type and tag-type lists.

## C. Discrepancies to reconcile (flagged, not silently resolved)

| # | Conflict | Sources | CTO's interim assumption |
|---|---|---|---|
| R1 | "5 management tables" vs 8 listed vs 6 in screenshot | doc text vs doc list vs screenshot | Use the doc's **list** (8), ignore the "5"; confirm final set |
| R2 | Risk had "Classification (dropdown)"; now has CAPEX/OPEX | first prompt vs new doc | New doc wins: Risk = CAPEX/OPEX; "Classification" dropped unless confirmed |
| R3 | Revenue had "Reporting Group"; now has CAPEX/OPEX | first prompt vs new doc | New doc wins: Revenue = CAPEX/OPEX; "Reporting Group" dropped unless confirmed |
| R4 | Users: doc says Name/Email/Password/Role; screenshot shows Grade, Team, Region, Seniority | doc vs screenshot | Treat extra fields as **candidate** attributes; confirm which are real |
| R5 | Cost table extra columns (Allocation Method, % TCV, Status) | screenshot only | Status = the active/archived flag (already planned). Allocation Method & % TCV likely belong to **Cost *Models*** (calculation), not the category taxonomy — confirm |
| R6 | "Password" field reappears in new doc | doc vs confirmed decision C3 | Decision C3 stands: invite + delegated auth, no stored password |

## D-ADD. Screenshot observations (directional only)
- **Users table** (screenshot 3): columns Grade · Role · Team · Region · Seniority · Status, with a **Team filter** and search. Suggests a richer user/HR-style profile and a **Teams** concept — relevant to Bid Roles and resourcing. If Teams are real, they're likely another org entity (and possibly another portfolio resource).
- **Taxonomy view** (screenshot 2): tabbed navigation across taxonomy types; inline Status pill; row-level edit/delete (delete = archive per our rule).
- **Dashboard** (screenshot 1): metric cards (Assigned/Urgent Tasks, Unread Mentions, Awaiting Review, Upcoming Deadlines), a "My Deals" table, Tasks, and Comments & Mentions — informs later Portfolio Dashboard and collaboration modules.

## E-ADD. Updated open questions (supersede/extend §C)
1. **Confirm the definitive taxonomy list** (R1) — is it the 8 in the doc, plus Bands and Tags from the screenshot? Any others?
2. **Confirm R2/R3** — are Risk "Classification" and Revenue "Reporting Group" intentionally dropped in favour of CAPEX/OPEX?
3. **User attributes** (R4) — are Grade, Team, Region, Seniority real fields? Is **Team** a first-class entity?
4. **Cost Models vs Cost Categories** (R5) — do Allocation Method / % TCV belong to the *Models* sections rather than the category taxonomy? (This starts to define the Models sections.)
5. **Bid Roles** — how do these relate to user *Roles* (RBAC)? Same concept, or bid-level resourcing roles distinct from access roles?
6. The five **Models** sections — detail to come; confirmed as the likely home of financial-standard/calculation logic.

## F-ADD. Spec deltas (applied)
- **Taxonomy engine:** `capex_opex` is an optional attribute on Cost/Risk/Tax/Revenue category tables; engine supports category/band/tag list types.
- **Navigation:** Company Parameters is a child of a **Portfolio Resources** area; add `Products`, `Accounts`, `Competitors`, `Models & Templates` as sibling modules to the platform map (stubs).
- **Models sections:** added as placeholders under Company Parameters, tentatively the home of calculation models (link to calc engine + deferred Financial Standards).
- **User model:** flagged for possible extension (Grade/Team/Region/Seniority + Teams) pending R4.
- Screenshots preserved at `outputs/_portfolio_extract/` (image1–3) for reference.

*This addendum keeps §D's core spec valid; it widens scope (more taxonomies, Models placeholders, portfolio parent) and lists the reconciliations needed before those additions are finalised.*
