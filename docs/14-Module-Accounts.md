# 14 — Module: Accounts (Customers)

> **Status:** ANALYSED. Accounts = the store of a business's customers/accounts. Strong reuse of the Product **Workspace** pattern. Resolves the "where do Customer Payment Terms & Currency come from" question (Docs 10/11). Screenshots illustrative, not final UI.
> **Source:** Founder description + 3 screenshots (Accounts list, Account Dashboard, Account Assumptions).
> **Last updated:** 2026-07-06

---

## 0. Source summary (from screenshots + description)

**Accounts & Customers** — "manage your customer accounts and relationships." A **list page** of accounts + **Add Customer**, then click an account → an **Account Workspace**.
- **List columns:** Customer Name (+ relationship period "2026–Present"), Type/Industry, Status, Account Size, Total Contracts, Contract Value, Win Rate, Primary Contact, Account Owner, Registered Location. (e.g. Capgemini — Customer/IT, Active, 14 contracts, £28.4M, 0% win rate, contact Kirath Matharu, owner Admin User.)
- **Account Workspace:** top-bar resources **Assumptions · Attachments**; sidebar **Dashboard** (fully customisable, same as Products) · **Performance Tracking** (list of all bids this customer has been in). Header shows Status, Type (Customer), Industry, Account Owner, Edit.
- **Account Dashboard cards:** Industry, Annual Revenue, Ownership (Public/Private), **Payment Terms (30 days)**, **Preferred Currency (GBP)**, Status, Account Owner, Total Deals (14), Total Value (£28.4M lifetime), Win Rate (0%), Relationship Since (2026).
- **Account Assumptions (core inputs):** Name\*, Contact\*, Owner\*, Parent Account, Description, Industry, Country. "Manage key assumptions that drive account performance, pricing, and outcomes."

## 1. Understanding — what Accounts is
Accounts is Skelly's **customer/CRM domain**: the master store of every organisation a business sells to. Like Products, an Account is **two things at once**:
1. A **profile / set of standing facts** about the customer (industry, country, ownership, payment terms, preferred currency, primary contact, owner) — reused across every deal with that customer.
2. An **analytics aggregate** — it accumulates the history of all deals with that customer (Total Deals, Total Value, Win Rate, Relationship Since), so the business learns its relationship with each account over time (Vision — knowledge compounds).

## 2. ⭐ Biggest insight — this is the SAME Workspace pattern again (reuse confirmed 3×)
Account uses the identical **Workspace shell** as Products (Doc 11 §2) and Deals (Doc 12 B.1): top-bar *resources* (Assumptions, Attachments) + a sectioned *sidebar* (Dashboard, Performance Tracking) + a customisable dashboard + "Assumptions" = the workspace's core inputs. That's **three** confirmed users of the same shell (Products, Accounts, Deals). This removes all doubt: build **one reusable `Workspace` component + one `Dashboard`/view-builder + one `PerformanceTracking` ("deals this entity is part of") + one `Assumptions` form pattern**, and instantiate them. Do NOT build Accounts as a bespoke area. (Principles 6 & 7.)

## 3. ⭐ Accounts is the SOURCE of Customer Payment Terms & Preferred Currency (resolves Docs 10/11)
The Account Dashboard shows **Payment Terms (30 days)** and **Preferred Currency (GBP)** as account-level facts. This **answers the open question** from Doc 10 (§4.4) / Doc 11 (A2.5): a deal's **Customer Payment Terms** (which shift revenue cash flow) and its **currency** come from the **Account (customer)** attached to the deal. So the flow is: Account holds the defaults → a Deal with that customer inherits them → the revenue models use them (snapshot-on-use, convention C1). (Supplier payment terms will similarly come from Products/Suppliers.) Cross-referenced back into Docs 10 & 11.

## 4. New/notable concepts
- **Parent Account (self-referencing hierarchy).** An account can have a parent account → **account trees** (enterprise groups, subsidiaries, divisions). This is a self-referencing relationship (`parent_account_id` → Account). Enterprise-important (e.g. "Capgemini Group" with regional subsidiaries). *Question:* do metrics roll up the tree (a parent's Total Value = sum of its children's)? Likely yes eventually — flag.
- **Type vs Customer.** The page is "Accounts & **Customers**"; Type = "Customer". Accounts is likely broader than customers (Prospect / Partner / Supplier?). *Confirm the Type set* — and whether Suppliers live here too (relevant because supplier payment terms feed cost models).
- **Primary Contact / Contacts.** A primary contact (name + email) is shown. *Question:* one contact per account now, or a full **Contacts** sub-list (many people per account) later? Recommend modelling Contacts as their own entity from the start (accounts always grow multiple contacts) even if the UI shows just the primary.
- **Ownership (Public/Private), Industry, Country, Account Size, Status, Type** — reference/classification fields. Industry & Type likely **taxonomy** (managed lists, Doc 09); **Country** is standard reference data (a fixed global list, not client-specific); Ownership likely a small fixed set.
- **Relationship Since / period** — first-deal date; drives "Relationship Since" and the "2026–Present" label.

## 4a. ⭐ Flexible PARTY ROLES on a deal (Case 5, 2026-07-12)
Case 5 (Doc 26 §4b) breaks the "one deal = one customer" assumption: Government X **requested** the data and takes a **revenue share**, but the **trainlines are the payers**. So a single opportunity can involve **several parties in distinct roles**:
- **Requester / contracting authority** — who issued the opportunity (Gov X).
- **Payer(s)** — who actually pays the fees; may be **many** and **different from the requester** (the trainlines). Payment terms + currency for revenue come from the **payer(s)**, not necessarily the requester (refines Doc 10 §4.4 / §3 of this doc).
- **Revenue-share / royalty partner** — who receives a share of revenue (Gov X again) — feeds the Revenue-Share model (Doc 10 §4.3).
- (Existing) **Supplier(s)** — source of supplier payment terms for cost models.

**Design implication:** a Deal should carry a **set of party-role links to Accounts** (role, account, + attributes like share % or payment terms), not a single `account_id`. The primary "Customer" stays for the common one-party case, but the model must allow multiple roles. Ties to the **billable-entity population** (Doc 10 §4.4a) — payers may be a *population* of accounts/entities. *(Refinement item #21, Doc 26 §6.)*

## 5. Integration with the rest of Skelly
- **Deals/Bid Engine:** a Deal has a **Customer = an Account** for the common case, but can carry **multiple party-role links** (requester · payer(s) · revenue-share partner · supplier) — see §4a. Account↔Deal remains one-customer-to-many-deals for the primary customer.
- **Revenue models (Doc 10):** Customer Payment Terms + Preferred Currency flow from the Account into the deal's revenue cashflow + currency.
- **Performance Tracking:** aggregates the account's deals (shared with Product Performance — same component, different filter).
- **Taxonomy (Doc 09):** Industry, Type, Ownership (+ Country as reference data).
- **Users:** Account Owner + Contact.
- **Attachments → Files; Dashboard → shared view-builder/semantic layer; Audit.**

## 6. Verification — gaps & questions
1. **Parent Account roll-ups** — do metrics aggregate up the account tree? (§4.)
2. **Type set** — Customer / Prospect / Partner / Supplier? Do **Suppliers** live in Accounts (they'd source *supplier* payment terms for cost models)? (§4.)
3. **Contacts** — single primary vs multi-contact sub-entity (§4).
4. ✅ **Deal↔Account cardinality — RESOLVED by Case 5 (§4a):** a deal carries **multiple party-role links** (requester · payer(s) · revenue-share partner · supplier); payers may be a population and differ from the requester. Remaining: exact schema of the party-role link + which role sources payment terms/currency when payer ≠ requester.
5. **Industry / Type / Ownership** — confirm which are managed taxonomies vs fixed lists; **Country** = standard reference data.
6. **Account Size / Annual Revenue** — entered or derived? Units?
7. **Currency interaction** — if an account's preferred currency differs from the org's base currency, confirm the conversion/snapshot rules (ties to the multi-currency design, Doc 11 A2.5).

## 7. Reusable assets (for the Living Platform Model)
- **`Workspace` shell** — now 3× confirmed (Products, Accounts, Deals). Build once.
- **`Dashboard` / view-builder** — shared (customisable dashboards everywhere).
- **`PerformanceTracking`** — shared "deals this entity is part of" list (Product + Account).
- **`Assumptions` form pattern** — a workspace's validated core-input form.
- **`Account` entity + `AccountService`**; **Contacts**; **account-tree** helper (parent/child).
- **Aggregation service** (shared) — deal roll-ups into account KPIs.
- **Reference data:** Country (standard global list) + Industry/Type/Ownership (taxonomy).
- **Payment-terms & currency resolution** feeding the calc engine.
- **Permissions:** `accounts.view`, `accounts.manage`.

## D. Engineering Specification (draft)
- **`Account`**: `id`, `organisation_id`, `name`, `type` (Customer/Prospect/Partner/Supplier — confirm), `status`, `industry_id`, `country` (reference), `ownership` (Public/Private), `annual_revenue`, `account_size`, `payment_terms_days`, `preferred_currency`, `owner_id` (User), `parent_account_id` (self-ref → Account), `primary_contact_id`, `description`, `relationship_since`, audit, soft-delete. RLS tenant-scoped.
- **`Contact`**: `id`, `account_id`, `name`, `email`, role/title (recommend as its own entity; primary flagged on the account).
- **`Account` ↔ `Deal`**: deals carry `account_id` (the primary customer) **plus a `DealParty` link set** — `{deal_id, account_id, role (requester|payer|revenue_share_partner|supplier), attributes (e.g. share_pct, payment_terms_override)}` — to support payer≠requester, multiple payers, and revenue-share partners (§4a, Case 5). Account KPIs (Total Deals, Value, Win Rate, Relationship Since) **derived** from deals via the aggregation service.
- **Reuse:** render the Account workspace from the shared `Workspace` + `Dashboard` + `PerformanceTracking` + `Assumptions` components.
- **Services:** `AccountService`, `ContactService`, shared `AggregationService`, `PaymentTerms/CurrencyResolver` (feeds calc engine).
- **Testing:** account-tree integrity (no cycles in parent links); tenant isolation; payment-terms/currency resolution into deals; derived-KPI correctness.

## E. Open items
Answers to §6 (esp. Type set incl. Suppliers, Parent-Account roll-ups, Contacts model, Deal↔Account cardinality). Then this spec firms up. Note: **Accounts strengthens the case to now spin up the standalone Living Platform Model doc** — the Workspace shell, Dashboard, PerformanceTracking, Assumptions, and Aggregation are each now used by 2–3 modules.
