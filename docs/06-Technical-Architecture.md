# Skelly — Technical Architecture Blueprint

**Status:** Draft v1.0 — foundational architecture
**Author:** CTO (with founder Raoul)
**Date:** 2026-07-06
**Audience:** The founding engineer(s), and every engineer who joins later.

> This document is the technical foundation for every future engineering decision in Skelly. It does **not** contain application code and it does **not** design individual database tables. It defines the *shape* of the system: the layers, the boundaries, the rules, and the reasoning behind them. Where a decision is made, the alternatives and trade-offs are stated so a future architect can judge whether the decision still holds.

---

## 0. How to read this document

Every significant decision in this blueprint follows the same structure required by Constitution Principle 15:

- **Decision** — what we're doing.
- **Why** — the reasoning.
- **Alternatives** — what else we considered.
- **Trade-offs** — what this costs us.
- **Long-term implication** — what it means in ten years.

If a future request conflicts with a decision here, we don't silently break it — we open an ADR (Architecture Decision Record), explain the change, and supersede the old decision explicitly.

---

## 1. The forces shaping this architecture

Good architecture is the resolution of competing forces. Before any diagram, here are the forces specific to Skelly, drawn from your Vision and Constitution:

1. **Trust with money.** Skelly produces financial numbers people bet contracts on. Every calculation must be *auditable, replayable, and explainable* (Vision — Financial Philosophy). This is the single most defining technical constraint and it drives more decisions than anything else.
2. **Knowledge compounds.** Data entered once must improve every future decision. This makes the *data model* the crown jewel, not the UI.
3. **Multi-tenant enterprise.** Thousands of organisations, strict isolation, per-tenant customisation. Isolation and configurability must be designed in from table one.
4. **Extensible platform, eventually.** A future marketplace where third parties extend Skelly *without touching the core*. We must not build anything that makes a stable public boundary impossible later.
5. **A team that doesn't exist yet.** Today it's you + AI. In two years it may be a dozen engineers. The architecture must be *simple enough for one person to hold in their head today* and *modular enough to be split across teams tomorrow*.
6. **AI as a first-class citizen, not a bolt-on.** AI augments decisions but never owns them, and must be swappable across providers.

Everything below is the resolution of these six forces.

---

## 2. The three decisions that shape everything else

I'm putting the three biggest decisions up front, because every later section assumes them. Each is a recommendation you can overrule — but I'd defend all three hard.

### 2.1 Decision — One language: TypeScript everywhere

**Decision.** TypeScript for the backend, the frontend, and shared libraries.

**Why.**
- **One language to learn deeply, not two.** You're the primary builder and still growing as an engineer. Mastering one language end-to-end beats being mediocre in two.
- **Shared code is real code.** Validation rules, type definitions, and even calculation logic can be written *once* and imported by both backend and frontend. That directly serves Principle 4 (single source of truth) and Principle 7 (reuse before duplication) in a way a Python-backend/TS-frontend split simply cannot.
- **Largest talent pool on earth.** When you hire, TypeScript engineers are the most abundant and cheapest to onboard. That matters for Principle 14 (future engineers).
- **Types are documentation that can't rot.** A strongly-typed domain model is self-describing — it enforces Principle 8 (readability) and Principle 10 (docs) mechanically.

**Alternatives.**
- **Python backend + React frontend.** Python's edge is data science / ML. But Skelly's AI strategy (Section 8) is *orchestration of AI providers*, not training models — you don't need Python's ML ecosystem in the request path. Cost: two languages, no shared code, more context-switching for a solo founder.
- **A statically-typed heavyweight (Java/C#/Go).** Excellent at scale and raw performance, but slower to build in early, smaller hireable-junior pool, and you lose frontend code-sharing. These shine when you already have a large team; they tax a solo founder.

**Trade-offs.** TypeScript's type system is not as sound as a "real" compiled language — you must run it in `strict` mode and treat type errors as build failures, or the safety evaporates. We accept that discipline cost.

**Long-term implication.** If, years from now, one domain (say heavy simulation) needs raw compute, we can extract *that one service* into Go/Rust behind our API boundary without rewriting the platform. The monolith boundary (2.2) makes that a surgical operation, not open-heart surgery.

### 2.2 Decision — A Modular Monolith, not microservices (yet)

**Decision.** One deployable backend application, internally divided into strict business-domain modules with enforced boundaries. **Not** microservices.

**Why.**
- **Microservices solve an organisational problem you don't have.** Their real benefit is letting many teams deploy independently. You have one builder. Adopting microservices now buys you distributed-systems pain (network failures, eventual consistency, distributed transactions, 12 things to deploy) to solve a problem that won't exist for years.
- **A modular monolith gets you 90% of the modularity with 10% of the operational cost.** If module boundaries are enforced in code (Section 4), you get the *maintainability* benefit of separation without the *operational* cost of distribution.
- **It's the industry-correct starting point.** Shopify, GitHub, and Stripe all ran enormous businesses on well-structured monoliths. "Monolith first, extract services when a boundary proves it needs independent scaling or ownership" (Martin Fowler's "MonolithFirst") is mainstream best practice, not a compromise.

**Alternatives.**
- **Microservices from day one.** Correct for a 50-engineer org; actively harmful for a solo founder. Rejected.
- **Serverless functions everywhere.** Great for spiky, simple workloads. But Skelly has rich shared domain logic and a calculation engine that benefits from being co-located and transactional. Functions would fragment the domain model and make Principle 4 harder. We *will* use serverless selectively for integrations and async jobs (Section 10), just not as the core architecture.

**Trade-offs.** A monolith scales *vertically* first (bigger box) and can become a deployment bottleneck if boundaries rot. We mitigate with enforced module boundaries and a build order that keeps modules genuinely decoupled.

**Long-term implication.** The whole architecture is designed so that "extract a module into its own service" is a *planned, low-drama operation*. Each domain module talks to others only through explicit interfaces and events — never by reaching into another module's tables. The day the Simulation domain needs its own compute cluster, we lift it out along a boundary that already exists.

### 2.3 Decision — Managed infrastructure, PostgreSQL as the backbone

**Decision.** Managed PostgreSQL as the primary datastore. Managed application hosting. Buy operational undifferentiated heavy lifting rather than run it yourself.

**Why.**
- **PostgreSQL is the correct default database for Skelly** and it isn't close. It's relational (Skelly's data is deeply relational — opportunities, bids, costs, approvals all reference each other), transactional (financial integrity is non-negotiable), and it has enterprise-grade features you'll need: row-level security (for tenant isolation), JSONB (for per-tenant custom fields), strong indexing, and mature auditing patterns. One database that does all this well beats a zoo of specialised stores you have to operate.
- **Managed hosting means you build product, not plumbing.** As a solo founder, every hour spent patching servers or configuring load balancers is an hour not spent on Skelly. Managed Postgres gives you automated backups, point-in-time recovery, failover, and patching — enterprise-grade durability you could not operate alone.

**Alternatives.**
- **A NoSQL document store (e.g. MongoDB) as primary.** Tempting for "flexible schema," but it pushes relational integrity and transactional guarantees *into your application code* — exactly where financial correctness is hardest to guarantee. For a system whose core promise is auditable money, this is the wrong default. Rejected as primary; may appear later for specific non-transactional workloads.
- **Raw cloud (self-managed VMs on AWS/GCP/Azure).** Maximum control and the "enterprise" look, but a serious DevOps burden for one person. We keep this as the *destination* — the architecture stays cloud-portable — but we don't pay its operational tax on day one.

**Trade-offs.** Managed services cost more per unit of compute and can create mild vendor lock-in. We mitigate lock-in by keeping the app cloud-agnostic (standard Postgres, containerised app, infrastructure-as-code) so migrating hosts later is a weekend, not a quarter.

**Long-term implication.** "Managed now, portable always." We get enterprise durability immediately and retain the option to move to raw cloud when scale economics or an enterprise customer's compliance requirements justify the ops investment.

---

## 3. Overall system architecture — the layers

Skelly is organised as a set of horizontal layers, each with one responsibility, communicating only with adjacent layers. This is a classic *layered + domain-driven* architecture.

```
┌──────────────────────────────────────────────────────────────┐
│  CLIENT LAYER                                                  │
│  Web app (browser). Dumb about business rules. Displays        │
│  data, collects input, calls the API. (Principle 5)            │
└───────────────▲──────────────────────────────────────────────┘
                │  HTTPS / typed API contract
┌───────────────┴──────────────────────────────────────────────┐
│  API / INTERFACE LAYER                                         │
│  Authentication, authorisation, input validation, rate         │
│  limiting, request/response shaping. The ONLY door in.         │
│  Thin: it translates HTTP <-> domain calls. No business logic. │
└───────────────▲──────────────────────────────────────────────┘
                │  in-process calls (typed)
┌───────────────┴──────────────────────────────────────────────┐
│  DOMAIN LAYER  (the heart — where the business lives)          │
│  One module per business capability: Opportunities, Bids,      │
│  Estimation, Forecasting, Costs, Risks, Approvals, etc.        │
│  Contains ALL business rules, calculations, workflows.         │
│  Modules talk to each other only via interfaces + events.      │
└───────────────▲───────────────────────────▲──────────────────┘
                │                            │  domain events
┌───────────────┴───────────┐   ┌────────────┴──────────────────┐
│  PLATFORM / SHARED LAYER   │   │  ASYNC LAYER                  │
│  Cross-cutting services:   │   │  Background jobs, event        │
│  auth, permissions, audit, │   │  handlers, scheduled work,     │
│  calc engine kernel, AI    │   │  integrations, notifications.  │
│  gateway, notifications.   │   │  (queue-driven)                │
└───────────────▲───────────┘   └────────────▲──────────────────┘
                │                            │
┌───────────────┴────────────────────────────┴──────────────────┐
│  DATA LAYER                                                    │
│  PostgreSQL (system of record) + object storage (documents) + │
│  cache. Accessed only through the domain layer's repositories. │
└──────────────────────────────────────────────────────────────┘
```

**The one rule that makes this work: dependencies point inward and downward.** The client depends on the API; the API depends on the domain; the domain depends on the data layer through abstractions. **Nothing ever points the other way.** The domain layer does not know HTTP exists. This is what makes business logic testable in isolation (Principle 12) and reusable across a future public API, AI agents, or a mobile app (Principle 5).

**Why layered rather than something more exotic (hexagonal/clean architecture in full).** Full hexagonal architecture (ports and adapters everywhere) is powerful but ceremony-heavy for a solo founder. We take its *one essential idea* — the domain depends on abstractions, not on infrastructure — and skip the rest until a real need appears. This is Principle 16 applied honestly: buy the safety we need, not the pattern collection we don't.

---

## 4. Backend architecture — organised around business domains

This is where the Constitution's Principle 13 (Domain-Driven Design) becomes concrete.

### 4.1 The module is the unit of the backend

The backend is a set of **domain modules**, each representing one business capability from your domain list. A first cut:

`organisations` · `users-and-access` · `opportunities` · `qualification` · `bids` · `benchmarking` · `estimation` · `costs` · `revenue` · `forecasting` · `risks` · `simulations` · `approvals` · `reporting` · `ai`

Plus **platform modules** that are cross-cutting infrastructure, not business domains:

`auth` · `permissions` · `audit` · `calc-engine` · `notifications` · `integrations` · `files`

**Every module has the same internal shape** (Principle — consistency):

```
modules/estimation/
  domain/            ← entities, value objects, business rules. Pure. No DB, no HTTP.
  services/          ← use-cases / application services (orchestrate the domain)
  repositories/      ← data access interfaces + Postgres implementations
  calculations/      ← this domain's calculation definitions (registered with calc-engine)
  events/            ← events this module emits + handlers it subscribes to
  api/               ← the HTTP routes/handlers for this domain (thin adapters)
  permissions/       ← what actions exist and who may perform them
  __tests__/         ← unit + integration tests for this domain
  README.md          ← purpose, rules, extension points (Principle 10)
```

**Why every module looks identical.** When a new engineer opens *any* module, they already know where everything is. Consistency is a compounding asset (Principle 14). It also means our code review, our tests, and eventually our tooling can assume this shape.

### 4.2 The boundary rule — modules are islands with bridges

**Decision.** A module may **never** import another module's `domain/` or `repositories/` directly, and may **never** query another module's tables. Cross-module interaction happens two ways only:

1. **Synchronously, through a published interface** — Module A calls a small, explicit `EstimationService` interface exposed by the Estimation module. It gets a typed result. It knows nothing about how Estimation stores data.
2. **Asynchronously, through domain events** — when something happens ("BidSubmitted", "EstimateApproved"), the module emits an event. Other modules subscribe. The emitter doesn't know or care who's listening.

**Why.** This is the seam along which the monolith later splits into services (Decision 2.2). If modules reach into each other's guts, that seam fuses shut and you're back to a big ball of mud. Enforcing it *now*, while there's one developer, is nearly free. Enforcing it *later*, across a team and a million lines, is a migration project.

**How we enforce it (not just hope for it).** A lint rule / dependency-cruiser check in CI that fails the build if `modules/bids` imports from `modules/estimation/domain`. Boundaries that aren't mechanically enforced are boundaries that erode the first time someone's in a hurry. (Principle 12 spirit applied to architecture.)

### 4.3 Where business logic lives — and where it must never live

Following Principle 5 rigorously:

- **Business rules, calculations, validation, and permission logic live in the domain layer. Full stop.**
- The **API layer** validates *shape* ("is this a number, is this field present") but delegates *meaning* ("is this a valid bid margin for this org") to the domain.
- The **frontend** may *mirror* validation for fast user feedback, but the backend is authoritative and re-validates everything. The frontend's copy is a UX nicety; the backend's copy is the law. (This is the correct reading of "single source of truth" — the client can have a *cache* of a rule for responsiveness, but never the *authority*.)

### 4.4 The calculation engine — Skelly's crown jewel

Your Vision says no financial result may ever be a black box. That is not a UI feature; it's an architectural mandate, and it deserves a dedicated subsystem. I'm flagging this as **the most important thing we will build**, and I want it designed deliberately rather than emerging accidentally from scattered code.

**Decision.** A central **calculation engine**: calculations are *defined declaratively and registered*, executed through one kernel, and every execution persists its inputs, the calculation version, and its outputs.

**Why this shape.**
- **Explainability comes for free.** If every number is produced by a registered calculation that recorded its inputs and version, then "explain this number" is a data lookup, not archaeology. You can show a user *exactly* which inputs and which formula produced £2.3M of forecast cost.
- **Reproducibility / audit.** Because inputs + version + output are stored, you can replay any historical calculation and get the same answer — even after the formula has since changed. This is what makes Skelly trustworthy with money (Vision — Financial Philosophy) and is often a hard compliance requirement for enterprise finance.
- **Single source of truth for math.** A margin calculation exists in exactly one place and is reused by Estimation, Forecasting, Reporting, and AI. No domain re-implements it. (Principle 4.)
- **Testability.** A registered, pure calculation is trivially unit-testable in isolation — which Principle 12 makes mandatory for financial logic.

**Alternatives considered.**
- **Just write calculations as normal service methods.** Faster today. But explainability and replay then have to be retrofitted onto every calculation individually, and they never will be consistently. This is precisely the "quick solution twice" that Principle 16 warns against. Rejected.
- **A full rules engine / DSL (e.g. a spreadsheet-like formula language users author).** Powerful and possibly a *future* marketplace feature — but building a language now is over-engineering for a product with a defined set of calculations. We design the engine so a user-facing formula layer *could* sit on top later, without building that layer yet.

**Trade-off.** Persisting every calculation execution costs storage and a little write latency. For financial trustworthiness this is a bargain, and we can tier old calculation records to cheap storage over time.

**Long-term implication.** The calc engine becomes a platform asset. AI (Section 8) proposes inputs; the engine computes and explains; the human approves. Marketplace partners (future) could publish calculation libraries into it. It's a foundation, not a feature.

### 4.5 The workflow engine — because bids are processes, not forms

Bids move through stages: qualify → estimate → price → risk → approve → submit. Your Vision explicitly frames Skelly as *one continuous commercial workflow*, and enterprises each want their *own* variation of it.

**Decision.** Model workflows as **explicit, configurable state machines** owned by the domain, not as implicit status fields scattered through the code.

**Why.** A `status` string that any part of the code can set leads to illegal transitions ("submitted" without "approved"), untraceable history, and per-customer branching logic smeared everywhere. An explicit state machine gives you: legal transitions only, an audit trail of who moved what when, and — critically — *per-tenant configuration* of the stages (Vision — Enterprise Philosophy: structure without rigidity). It also gives approvals, notifications, and AI clean hooks to attach to ("on entering stage X, do Y").

**Trade-off / caution.** Workflow engines are a classic over-engineering trap — teams build a Turing-complete process language nobody asked for. We build the *minimum*: configurable stages, guarded transitions, and transition events. We resist generalising until real customer variation demands it. I'll hold the line on this one even if it's tempting.

### 4.6 Async work, events, and jobs

- **Domain events** (in-process today) are how modules react to each other without coupling. "EstimateApproved" → Forecasting recalculates, Notifications alerts the owner, Audit records it. The emitter knows none of these listeners.
- **Background jobs** handle anything slow or retryable: sending email, running a large simulation, syncing an integration, generating a report. These run on a **queue** so a slow job never blocks a user request and failures can be retried safely.
- **Why a queue and not just "do it in the request".** Enterprise reliability. If generating a 200-page report takes 40 seconds, the user shouldn't stare at a spinner and a timeout. If an ERP sync fails, it must retry, not vanish. The queue is how we honour "enterprise-grade" for real.

---

## 5. Frontend architecture

The frontend's job, per Principle 5, is narrow and disciplined: **display information, collect input, enforce nothing that matters.** But "narrow" doesn't mean "unstructured" — an enterprise UI with dashboards, complex forms, and large tables needs real architecture.

### 5.1 Structure — feature modules mirroring the backend domains

**Decision.** Organise the frontend by **feature/domain**, not by technical type. `features/estimation/`, `features/bids/`, `features/forecasting/` — each containing that feature's screens, components, hooks, and API bindings. Shared, generic UI (buttons, tables, modals) lives in a `shared/ui` library.

**Why.** A "by-type" layout (`/components`, `/pages`, `/hooks` each with hundreds of unrelated files) doesn't scale past a small app — to change Estimation you touch five distant folders. A "by-feature" layout keeps everything for a capability together, mirrors the backend so engineers can reason across the stack, and lets a future team own a feature end-to-end. (Principle 13 applied to the client.)

### 5.2 The key frontend decisions

- **Component model:** a modern component framework (React is the default recommendation — largest ecosystem, largest hiring pool, best AI tooling; consistency with the "one big community" logic of TypeScript). Alternative: a batteries-included framework (e.g. Angular) — more opinionated, smaller pool. React's flexibility + our own enforced structure is the better fit.
- **State management — the single most abused thing in frontends.** Rule: **distinguish server state from UI state.** Data that lives on the backend (opportunities, estimates) is *server state* — managed by a data-fetching/caching library that treats the backend as the source of truth (fetch, cache, invalidate). Only genuinely client-side concerns (is this modal open, which tab is active) are *UI state* in a lightweight store. Most "state management hell" comes from copying server data into a client store and then fighting to keep it in sync. We refuse to do that — it would also violate Principle 4.
- **Forms:** Skelly is form-heavy (estimation inputs, cost breakdowns). Standardise on one form library + schema-based validation, where the validation schema is **shared with the backend** (the TypeScript-everywhere payoff). One schema, enforced on both sides, defined once.
- **Tables & dashboards:** these are core to Skelly and are performance-sensitive at enterprise data volumes. Standardise on one high-quality data-grid and one charting library, wrapped in *our own* components so we can swap the vendor later without touching every screen. (Anti-lock-in, Principle 6.)
- **Auth & permissions in the UI:** the frontend *reflects* permissions (hide the button the user can't use) but the backend *enforces* them (reject the action regardless of the UI). Client-side permission checks are UX; server-side checks are security. Never confuse the two.

### 5.3 Design-system discipline

Because the Vision demands a clean, consistent, professional UI, we build a small **design system** early: tokens (colour, spacing, type), primitives (button, input, table, modal), and patterns (form layout, page shell). Every screen is assembled from these. This is what makes a product built by one person over years still *feel* like one coherent product — and it's a gift to every future engineer.

---

## 6. Database architecture — philosophy, not tables

Per your instruction, this is the *strategy*, not the schema.

### 6.1 Multi-tenancy — the decision that touches every table

**Decision.** **Shared database, shared schema, row-level tenant isolation.** Every business table carries an `organisation_id`, and PostgreSQL **Row-Level Security (RLS)** enforces that every query is automatically scoped to the current tenant — at the *database* level, not just in application code.

**Why.**
- **Isolation you can't forget to write.** The catastrophic multi-tenant bug is "one customer sees another's data" because a developer forgot a `WHERE organisation_id = ?`. RLS makes the database itself refuse to return other tenants' rows *even if the application query is wrong*. It's defence-in-depth for the highest-severity risk in a B2B SaaS. (Principle 11 — security designed in.)
- **Operationally simple at thousands of tenants.** One schema to migrate, one database to back up. The alternatives don't scale operationally for a solo team.

**Alternatives.**
- **Database-per-tenant** (or schema-per-tenant). Strongest isolation, and some enterprise/compliance deals may *demand* it. But running thousands of databases/migrations is an ops nightmare for a small team. **Our stance:** default to shared+RLS; keep the door open to offer *dedicated database* as a premium tier for specific enterprise customers who require it. The domain layer is written to not care which it is.
- **Isolation only in application code (no RLS).** Fastest to build, one forgotten clause from disaster. Rejected as the *sole* control; app-level scoping + RLS together is the answer.

**Trade-off.** RLS adds a little query overhead and some setup complexity. For the isolation guarantee, it's non-negotiable spend.

**Long-term implication.** This is a genuine "decide once" decision — retrofitting tenancy is one of the most painful migrations in SaaS. Getting `organisation_id` + RLS onto every table from the first migration is the highest-leverage thing we do in the data layer.

### 6.2 The other database principles

- **Auditing is built-in, not bolted-on.** Every business table records `created_at`, `updated_at`, `created_by`, `updated_by`. Sensitive domains (money, permissions, approvals) additionally write to an **append-only audit log** — an immutable record of who changed what, when, and from what to what. This serves Principle 9 (explainability), Principle 11 (audit logging), and enterprise compliance. The append-only log is separate from the "current state" tables so it can never be edited.
- **Soft deletes by default for business data.** Records are marked deleted (`deleted_at`), not physically removed, because (a) enterprises expect undo and recovery, (b) referential history must survive — a deleted user still authored last year's bid, and (c) knowledge compounding (Vision) means we rarely truly throw data away. Hard deletion is a deliberate, audited, GDPR-driven operation, not the default path.
- **History is a first-class concern.** Because Skelly's value is learning from the past, key entities need *temporal* history — not just "what is the estimate now" but "what was it at each version." We design versioning into the entities that need it (estimates, bids, forecasts) rather than pretending the present is all that matters. The calc engine's execution log (4.4) is part of this same instinct.
- **Migrations are code, reviewed and versioned.** Schema changes go through migration files in version control, applied automatically and identically to every environment. No one ever hand-edits a production schema. This is basic professional hygiene and it's how a team avoids "works on my machine" schema drift.
- **Indexing strategy: deliberate, measured, tenant-aware.** We index for the queries we actually run (starting with `organisation_id` on everything, since every query is tenant-scoped), and we add indexes in response to *measured* slow queries, not guesses. Premature indexing is its own tech debt (write cost, storage). We'll treat query performance as something we monitor and tune, not something we sprinkle blindly.
- **The database is the system of record; caches and search indexes are derivatives.** Anything we put in a cache or a search engine is a *copy* that can be rebuilt from Postgres. Postgres is the single source of truth (Principle 4); everything else is a performance convenience that must be reconstructable.

---

## 7. Security architecture — designed in from line one

Principle 11 says security is designed, not added. Here's the design.

- **Authentication.** Delegate identity to a dedicated, battle-tested mechanism rather than hand-rolling password crypto. Enterprises will demand **SSO (SAML/OIDC)** and **SCIM** provisioning — so we choose an auth approach that can grow into those rather than a homegrown login we'd have to rip out. Sessions/tokens are short-lived and refreshable. *We never store passwords ourselves if we can avoid holding that liability.*
- **Authorisation — RBAC now, with room for more.** Role-Based Access Control (roles → permissions → actions) is the right starting model for enterprise: Admin, Manager, Contributor, Viewer, etc., configurable per organisation. We design the permission *check* as a single centralised service (`can(user, action, resource)`) so authorisation logic lives in exactly one place (Principle 4) and every domain calls it the same way. We keep the model open to **attribute/relationship-based** rules later (e.g. "can edit bids in *their* business unit") without redesigning — because large enterprises always need that eventually.
- **Tenant isolation.** Covered in 6.1 — RLS at the database plus scoping in the app. This is a *security* control, not just a data-modelling one.
- **Encryption.** In transit (TLS everywhere, no exceptions) and at rest (managed database + storage encryption). Particularly sensitive fields can be additionally encrypted at the application level.
- **Secrets management.** No secret ever lives in code or in the repository. Secrets come from a managed secrets store / environment injection, rotated periodically. This is table stakes and a common breach cause; we get it right from the first commit.
- **API security.** Every request authenticated and authorised at the API layer; input validated (shape) and re-validated (meaning) in the domain; rate limiting to blunt abuse and protect tenants from each other; output encoding to prevent injection. The API layer is the *single controlled door* (Section 3) precisely so these controls live in one place.
- **Audit logging.** The append-only log from 6.2 is a security asset too — it answers "who did this?" during an incident. Security-relevant events (logins, permission changes, data exports) are logged deliberately.
- **Secure defaults & least privilege.** New users get the *least* access by default. New features are private by default. Every default leans safe; opening access is a deliberate act. This is the cheapest security posture to maintain over a decade.

**A note on standards.** Designing to a recognised framework (OWASP for app security; the SOC 2 control families as a north star for process) from early on means enterprise security reviews later are a *documentation exercise*, not a *re-engineering project*. We won't pursue certification prematurely, but we'll build as if we will — because enterprise deals will require it and retrofitting controls is brutal.

---

## 8. AI architecture — first-class, but never in charge

Your Vision is precise here: AI augments, humans decide, everything explainable, multiple providers over time. That maps to one clear architectural rule.

**Decision.** All AI access goes through a single internal **AI Gateway** service. No domain module ever calls an AI provider (OpenAI, Anthropic, etc.) directly. Domains express *intent* ("draft a bid summary from these inputs," "suggest risks for this opportunity"); the gateway handles provider choice, prompting, retries, cost tracking, and safety.

**Why.**
- **Provider independence (Vision requirement).** When the best/cheapest model changes — and it will, constantly — we change it in *one* place. No domain is coupled to a vendor. (Principle 6, Principle 4.)
- **AI stays decoupled from business logic.** The domain owns the *rules*; AI only *proposes*. An AI suggestion becomes real only when it flows back through the normal domain path (validation, permissions, the calc engine, human approval). AI can never silently write an authoritative financial number — it can only *suggest inputs a human confirms*. This is how we honour "final decisions remain human" and "no black boxes" simultaneously.
- **Explainability & governance in one place.** Prompts, model versions, inputs, and outputs are logged at the gateway. When someone asks "why did the AI suggest this," we have the record. Cost controls, rate limits, and data-privacy rules (what tenant data may be sent to which provider) are enforced centrally — critical for enterprise trust.

**Alternatives.** Letting each domain call AI directly is faster to prototype and a nightmare to govern — vendor lock-in scattered everywhere, no central cost/safety control, no consistent explainability. Rejected on Principle 11 and Principle 6 grounds.

**Long-term implication.** The gateway is where "AI agents" (Vision) will eventually live — agents are just orchestrated sequences of gateway calls that *propose* actions the domain and a human then authorise. Building the gateway boundary now means the agent future is an extension, not a rebuild. RAG over the organisation's compounding knowledge base (Vision — Data Philosophy) also plugs in here.

---

## 9. Integration architecture — the outside world

Skelly must connect to ERP, CRM, spreadsheets, document storage, and eventually a marketplace. Integrations are *dangerous* if done casually — they're where external instability, security holes, and coupling leak in.

**Decision.** All external systems connect through a dedicated **integration layer** with a common adapter pattern: each external system gets an *adapter* that translates between the outside system's shape and Skelly's domain events/interfaces. The core domain never speaks a vendor's API dialect.

**Why.**
- **The core stays clean.** Salesforce's data model is Salesforce's problem; its adapter translates it into Skelly's concepts. Swap CRMs and you write a new adapter, not surgery on the domain. (Principle 6.)
- **Failure is contained.** External systems are unreliable. Integrations run through the async/queue layer (Section 4.6) so a down ERP retries gracefully instead of breaking a user's request.
- **Security boundary.** All inbound integration traffic is authenticated, validated, and rate-limited like any other API caller — external systems are *untrusted* by default.

**The marketplace, foreshadowed.** The public-facing side of this layer is the same boundary a future marketplace uses: a **stable, versioned public API** plus a **webhook/event system** so third parties can react to Skelly events and extend it *without touching core code* (Vision — Marketplace). We don't build the marketplace now. We *do* make one rule now that keeps it possible: treat our own frontend as just another API client. If our own UI can only do what the public API allows, then the public API is automatically capable enough for partners — and we'll have dogfooded it for years before anyone external touches it. This single discipline is what makes the marketplace vision reachable instead of aspirational.

---

## 10. Development architecture — repo, packages, shared libraries

**Decision.** A single **monorepo** containing the backend, the frontend, and shared packages.

**Structure (illustrative):**

```
skelly/
  apps/
    api/            ← the modular-monolith backend
    web/            ← the frontend application
    worker/         ← background job / event processor (same codebase, different entrypoint)
  packages/
    domain-contracts/   ← shared types + validation schemas (the SSOT for shapes)
    calc-kernel/        ← the calculation engine core
    ui/                 ← the design system + shared components
    config/             ← shared lint, TS, test configuration
  docs/                 ← architecture, ADRs, per-domain design docs
  infra/                ← infrastructure-as-code
```

**Why a monorepo.**
- **Shared code without publishing hell.** `domain-contracts` (types + validation) is imported by both `api` and `web` directly. This is the mechanism that makes "single source of truth" *real* across the stack — change a validation rule once, both sides get it, the build breaks if anything's inconsistent. (Principle 4, Principle 7.)
- **Atomic cross-cutting changes.** A change that touches the API and the frontend is *one* commit, reviewed together, never out of sync.
- **One consistent toolchain.** One lint config, one test setup, one TypeScript config — enforcing consistency (Principle 14) mechanically across everything.

**Alternatives.** Multiple repos (polyrepo) suit large orgs with independently-versioned services and separate teams — real overhead (cross-repo version coordination, duplicated tooling) that buys a solo founder nothing. We can split later if a piece genuinely needs independent versioning; the monorepo doesn't prevent that.

**Trade-off.** Monorepos need good tooling to stay fast as they grow (selective builds/tests so you're not rebuilding everything on every change). That tooling is mature and worth adopting once the repo warrants it.

---

## 11. Deployment architecture

Designed for enterprise expectations, sized for a solo operator today.

- **Environments:** at least three — `development` (local), `staging` (production-like, for pre-release verification), `production`. Enterprises will eventually want a demo/sandbox too. Environments are *identical in shape*, differing only in scale and secrets — so "it worked in staging" actually means something.
- **CI/CD:** every push runs the pipeline — lint, type-check, unit + integration tests, security scan, module-boundary check (4.2), build. Nothing reaches production without passing. Deployment to staging is automatic; production is a deliberate promotion. This is Principle 12 made operational: confidence comes from the pipeline, not from hoping.
- **Infrastructure as code.** All infrastructure defined in version-controlled config, not clicked together in a console. Reproducible, reviewable, disaster-recoverable. No "someone configured that server by hand two years ago and we're afraid to touch it."
- **Application packaging:** containerised, so it runs identically on your laptop, in staging, in production, and on whatever cloud we move to. This is our anti-lock-in insurance (Decision 2.3).
- **Scaling:** vertically first (the monolith on a bigger box — simplest, and sufficient for a long time), then horizontally (multiple stateless app instances behind a load balancer) once traffic justifies it. The app is designed **stateless** (no session state on the server) precisely so horizontal scaling is trivial when we need it. The database scales via managed read-replicas for read-heavy reporting workloads.
- **Monitoring & logging:** structured, centralised logs; error tracking; performance/uptime monitoring; alerting. You cannot operate enterprise software you can't see. This goes in early, cheaply, and grows.
- **Backups & disaster recovery:** automated database backups with point-in-time recovery (a managed-Postgres gift), tested restores (a backup you've never restored is a rumour, not a backup), and a documented recovery procedure. Enterprises will ask for RPO/RTO commitments; managed infra lets us make credible ones early.

---

## 12. Architecture Decision Record — summary

| # | Decision | Chosen | Main alternative | Primary reason |
|---|----------|--------|------------------|----------------|
| ADR-001 | Language | TypeScript everywhere | Python + JS split | One language, shared code, biggest hiring pool |
| ADR-002 | Backend topology | Modular monolith | Microservices | Microservices solve a team-scale problem we don't have yet |
| ADR-003 | Primary datastore | Managed PostgreSQL | NoSQL / self-managed | Relational, transactional, RLS, JSONB — trust with money |
| ADR-004 | Module boundaries | Interfaces + events, CI-enforced | Free-for-all imports | Preserves the seam for future service extraction |
| ADR-005 | Calculations | Central calc engine, executions persisted | Ad-hoc service methods | Explainability & replay are built-in, not retrofitted |
| ADR-006 | Workflows | Explicit configurable state machines | Status fields | Legal transitions, audit trail, per-tenant config |
| ADR-007 | Multi-tenancy | Shared schema + Postgres RLS | DB-per-tenant / app-only | Isolation the DB enforces; ops-simple at scale |
| ADR-008 | Deletes | Soft-delete by default | Hard delete | Recovery, referential history, knowledge compounding |
| ADR-009 | AI | Central AI Gateway | Direct provider calls per domain | Provider independence, governance, explainability |
| ADR-010 | Integrations | Adapter pattern + async | Direct coupling | Contains failure, keeps core clean, marketplace-ready |
| ADR-011 | Repository | Monorepo | Polyrepo | Real shared code, atomic changes, one toolchain |
| ADR-012 | Auth | Delegated, SSO/SCIM-ready | Homegrown login | Don't hold password liability; enterprise-ready |

Each of these will get its own full ADR file in `/docs/adr/` as we implement it, recording the decision, context, and consequences so future engineers inherit the *reasoning*, not just the result.

---

## 13. Technical-debt watchlist — the risks I'm tracking

Per Principle 17, here are the places this architecture could accrue debt, so we watch them deliberately:

1. **Module boundary erosion.** The #1 risk. If the CI boundary check isn't in place *before* modules multiply, "just import it directly" wins under deadline pressure and the modular monolith quietly becomes a big ball of mud. *Mitigation: enforce boundaries mechanically from the first two modules.*
2. **Calc-engine scope creep vs. under-build.** Two opposite failure modes: building a user-facing formula language too early (over-engineering), or writing calculations as ad-hoc methods and losing explainability (under-building). *Mitigation: build the minimal registered-calculation kernel first; resist the DSL until a real need appears.*
3. **Tenancy retrofit.** If `organisation_id` + RLS isn't on tables from the first migration, adding it later is agonising. *Mitigation: bake it into the very first schema; make it impossible to create a business table without it.*
4. **Frontend server-state duplication.** Copying backend data into a client store and hand-syncing it is the classic frontend debt and violates Principle 4. *Mitigation: enforce the server-state/UI-state split from the first screen.*
5. **Workflow engine over-generalisation.** *Mitigation: build the minimum; add configurability only when a real customer's process demands it.*
6. **Auth rework.** Choosing a login mechanism that can't grow into SSO/SCIM means ripping out identity later — one of the worst retrofits. *Mitigation: pick an SSO-capable approach now even though we won't enable it day one.*
7. **Monorepo build times.** Not a problem now; becomes one silently. *Mitigation: adopt selective build/test tooling before it hurts, not after.*

---

## 14. Evolutionary build order — what we build first

Architecture is a plan, not a big-bang construction project. We build the *load-bearing foundations* first, then domains on top. Proposed order (each item is a future full-methodology feature, not a rush job):

**Foundation (must come first — everything sits on these):**
1. Monorepo + toolchain + CI skeleton (consistency baseline).
2. Data layer + first migration with tenancy (`organisation_id` + RLS) baked in.
3. `auth` + `permissions` + `audit` platform modules (security designed in, Principle 11).
4. The module template + boundary-enforcement in CI (so every domain after this is born correctly).
5. The `calc-engine` kernel (the crown jewel, before any domain that does math).

**First domains (prove the pattern end-to-end):**
6. `organisations` + `users-and-access` (the tenancy + identity backbone).
7. `opportunities` (the entry point of the commercial workflow — a natural first vertical slice).
8. One calculation-heavy domain (likely `estimation`) to exercise the calc engine for real.

**Then:** layer on the remaining domains (`bids`, `forecasting`, `costs`, `risks`, `approvals`, `reporting`), each following the seven-step methodology, each reusing the foundations, each strengthening the platform.

**Deferred until there's a real need (and that's correct, not lazy):** microservice extraction, the marketplace/public partner API, database-per-tenant premium tier, AI agents, advanced ABAC permissions. The architecture *makes room* for all of these; we don't *build* them until a customer or scale reality asks for them. That restraint is Principle 16, not a compromise of it.

---

## 15. What I need from you next

This blueprint is deliberately the *skeleton*. To turn any part of it into real, spec'd, tested code, the next inputs are your **module documents** — the workflows, calculations, inputs/outputs, and business rules you've already designed. The natural place to start, given the build order above, is either **Opportunities** (the workflow entry point) or **Estimation** (to pressure-test the calc engine). Send whichever module doc you'd like to run through the seven-step methodology first, and we'll produce a dev-ready engineering specification for it.

Two things I'd ask you to confirm or overrule before we build foundations:
- **Stack:** TypeScript everywhere (ADR-001) and **managed PostgreSQL + managed hosting** (ADR-003). You didn't pick earlier; these are my strong recommendations and I've justified them. Say the word if you'd prefer otherwise.
- **Build order:** are you happy starting with the *foundations* (Section 14) before any single feature — the professionally correct but less immediately-visible path — or do you want to see one thin vertical slice of a real feature first to build momentum? Both are defensible; I lean foundations-first, but it's your call as founder.

---

*This is a living document. Every decision here can be revisited via an ADR when reality provides new information (Principle 17). Nothing in Skelly's architecture is sacred except the reasoning process that produced it.*
