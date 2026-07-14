# Skelly — Technology Stack Selection

**Status:** Draft v1.0 — foundational stack decisions
**Author:** CTO (with founder Raoul)
**Date:** 2026-07-06
**Companion to:** *Skelly — Technical Architecture Blueprint*

> This document turns the architecture blueprint's *shape* into *concrete tools*. Every choice is evaluated against real alternatives and justified on long-term criteria — maintainability, hiring availability, ecosystem maturity, enterprise adoption, and ten-year viability — not popularity. Where a choice is genuinely contested, I say so and explain the judgment call rather than pretending it's obvious.

---

## How I chose (the rubric)

For each decision I weighed eleven factors from your brief, but three carried the most weight for Skelly specifically:

1. **Will an experienced engineer we hire in three years respect and understand this?** (Principle 14.) This favours boring, proven, widely-adopted technology over fashionable technology.
2. **Does it let us honour "single source of truth" and "no black boxes"?** (Principles 4 & 9.) This favours strong typing, explicit data access, and tools that don't hide what they're doing.
3. **Does picking it now foreclose an enterprise or scale option later?** This favours portable, standards-based choices over lock-in.

A recurring theme you'll notice: **I deliberately pick "boring" where boring is a feature.** Enterprise software is a decade-long commitment. The exciting-but-young tool that saves a month this year can cost a rewrite in year four. I'll flag every place I chose maturity over novelty, and every place the newer option is close enough to watch.

---

## 1. The recommended stack at a glance

| Layer | Recommended | Key alternative | One-line reason |
|---|---|---|---|
| Language | **TypeScript** (strict) | — | Locked in architecture (ADR-001) |
| Backend runtime | **Node.js (LTS)** | Bun | Maturity & enterprise trust; Bun still young |
| Backend framework | **NestJS** | Fastify (+ structure) | Opinionated modular structure matches our DDD monolith |
| Frontend framework | **React + Next.js** | Angular | Largest ecosystem + hiring pool; SSR when needed |
| Styling / UI primitives | **Tailwind CSS + Radix (shadcn/ui)** | Component library (MUI) | Own the design system, no vendor lock-in |
| Data grid | **AG Grid (enterprise) / TanStack Table** | — | Enterprise-grade tables are core to Skelly |
| Charts | **ECharts / visx** | Recharts | Handles enterprise data volumes & report exports |
| Forms + validation | **React Hook Form + Zod** | — | Zod schema shared frontend↔backend (SSOT) |
| Server-state | **TanStack Query** | RTK Query | Treats backend as source of truth (Principle 4) |
| Database | **PostgreSQL (managed)** | — | Locked in architecture (ADR-003) |
| DB access | **Prisma** (primary) | **Drizzle** (serious rival) | Migrations + DX + hiring; Drizzle if we need SQL control |
| Validation contracts | **Zod** in a shared package | — | One schema, both sides, build-enforced |
| Auth | **WorkOS** (enterprise SSO/SCIM) + session layer | Auth0 / Keycloak | Purpose-built for B2B enterprise identity |
| Background jobs / queue | **BullMQ (Redis)** | Cloud-native (SQS) | Node-native, simple, powerful enough for years |
| Durable long workflows | **Temporal** (deferred) | — | For complex multi-step/AI orchestration later |
| File storage | **S3-compatible object storage** | — | Versioning, encryption, presigned URLs, cheap at scale |
| Search | **Postgres FTS + pgvector** now → **OpenSearch/Typesense** later | Elasticsearch | Start in the DB; extract when scale demands |
| AI layer | **Internal AI Gateway** over Vercel AI SDK | LiteLLM | Provider-agnostic, governed, explainable |
| API | **REST + OpenAPI** (public contract) | GraphQL / tRPC | Stable, cacheable, marketplace- and enterprise-friendly |
| Cloud | **AWS** (primary) | Azure (if MS-aligned customers) | Breadth, maturity, enterprise trust, hiring |
| Containers | **Docker** + managed runtime (ECS Fargate) | Kubernetes (deferred) | Portability without early K8s ops burden |
| IaC | **Terraform** | Pulumi (TS-native) | Maturity, hiring, multi-cloud portability |
| CI/CD | **GitHub + GitHub Actions** | GitLab CI | Ecosystem, marketplace, hiring familiarity |
| Observability | **OpenTelemetry** → managed backend (Datadog/Grafana) | — | Vendor-neutral instrumentation, no lock-in |
| Error tracking | **Sentry** | — | Best-in-class, cheap, immediate value |
| Security tooling | **Renovate + CodeQL/Semgrep + gitleaks + cloud secrets manager** | Snyk | Layered, mostly free, CI-native |

The rest of this document justifies each and records what we rejected.

---

## 2. Languages & runtime

### 2.1 Language — TypeScript (settled)
Locked in the architecture (ADR-001). One language across frontend, backend, and shared packages; strong typing as enforced documentation; largest hiring pool. Non-negotiable rule: **`strict` mode on, type errors fail the build.** TypeScript's safety is opt-in; half-using it is worse than not, because it lulls you.

### 2.2 Backend runtime — Node.js LTS (recommended) vs Bun vs Deno

**Decision.** Node.js, always on an **LTS (Long-Term Support)** release.

**Why.** Node is the most battle-tested JavaScript runtime in existence — a decade-plus of enterprise production use, the deepest library ecosystem, the largest hiring pool, and predictable LTS support windows enterprises can plan around. For a ten-year platform, "boring and everywhere" is exactly right.

**Alternatives.**
- **Bun** — dramatically faster startup and install, batteries-included tooling, and genuinely delightful DX. It's the most exciting option and I want to like it. But it's young; its production track record at enterprise scale is thin, and betting the *runtime* — the single most load-bearing dependency — on a young project violates our "don't foreclose / don't rewrite" rule. **Verdict: watch it. Revisit in ~18 months.** Our code is standard TypeScript, so a future Node→Bun move would be low-risk if Bun matures.
- **Deno** — excellent security model and standards alignment, but a smaller ecosystem and hiring pool than Node. Not worth the ecosystem tax for us.

**Risk & mitigation.** Node's raw single-thread CPU performance is weaker than Go/Rust/JVM. Skelly is mostly I/O-bound (database, APIs), where Node excels. The exception is heavy CPU work (large simulations) — which we deliberately push to **background jobs** and, if ever needed, a single extracted compute service (the modular-monolith boundary makes this surgical). We don't compromise the whole stack for one workload.

---

## 3. Backend framework — NestJS (recommended)

**Decision.** **NestJS.**

**Why it fits Skelly specifically.**
- **It is opinionated in exactly the way our architecture needs.** Our blueprint calls for a modular monolith organised by business domain with strict boundaries and dependency injection. NestJS's module system, providers, and DI container map *directly* onto that. It nudges every engineer toward the structure we want by default — consistency (Principle 14) enforced by the framework, not just by discipline.
- **Enterprise-grade out of the box.** First-class testing support (Principle 12), guards/interceptors (perfect homes for our auth, permissions, and audit cross-cutting concerns), validation pipes, and native OpenAPI generation for our REST contract.
- **Structure survives a growing team.** An unopinionated framework means every engineer invents their own patterns; six months in you have six architectures. NestJS gives newcomers a familiar, documented skeleton on day one.

**Alternatives.**
- **Fastify (or Express) + hand-rolled structure.** Fastify is faster and lighter, and many strong teams build excellent modular apps on it. But *you* would have to design and enforce all the structure NestJS gives for free — DI, module boundaries, testing conventions. For a solo founder who's still learning, adopting a framework that encodes best practice is a feature, not a constraint. (Express is too bare and its middleware-callback model is dated.) **NestJS actually runs on top of Fastify** as an adapter, so we get much of Fastify's speed *and* the structure. Best of both.
- **tRPC as the whole backend.** Superb type-safety for a TS monorepo, but it couples your API to TypeScript clients and works against the *stable, language-agnostic public API* the marketplace vision requires (ADR-010, Section 8). Good internal tool, wrong foundation.

**Trade-off.** NestJS has a learning curve (decorators, DI concepts) and a little runtime overhead vs raw Fastify. The curve pays for itself the first time a second engineer joins and immediately understands the layout; the overhead is irrelevant for our I/O-bound workload.

**Risk.** NestJS is largely stewarded by a small core team. Mitigation: it's widely adopted with a large community, and because our *business logic lives in framework-agnostic domain modules* (architecture Section 4.3), even a future move off NestJS would touch the thin API/wiring layer, not the domain heart.

---

## 4. Frontend

### 4.1 Framework — React + Next.js (recommended)

**Decision.** **React**, using **Next.js** as the application framework.

**Why.**
- **React has the largest ecosystem and hiring pool of any frontend technology**, by a wide margin. For a company that will hire, that's decisive (Principle 14). Every data-grid, chart library, form library, and design-system tool targets React first.
- **Next.js** gives us production-grade routing, rendering flexibility (server-render the marketing/login and data-heavy report pages for speed and SEO where it matters; client-render the rich app interior), image/asset optimisation, and a mature deployment story — without us hand-building any of it.

**Alternatives.**
- **Angular** — genuinely excellent for large enterprise apps: batteries-included, opinionated, strongly-typed, great for big teams. If Skelly were being built by a 30-person team from day one, Angular would be a serious contender. But its learning curve is steeper, its ecosystem and hiring pool smaller, and its opinionated weight is more than a solo founder needs. React + our own enforced structure gives us Angular's discipline where we want it and flexibility where we don't.
- **Vue / Svelte(Kit)** — both technically lovely; SvelteKit especially is a joy. But smaller enterprise adoption and hiring pools. For a ten-year enterprise bet, React's gravitational pull wins.

**Trade-off.** React is a *library*, not a full framework — it gives you freedom, which is rope to hang yourself with. We counter that with the enforced feature-module structure and design system from the architecture (Section 5). Next.js also evolves quickly; we pin to stable releases and adopt new paradigms deliberately, not reflexively.

### 4.2 The supporting frontend stack

- **Styling: Tailwind CSS + Radix primitives (shadcn/ui pattern).** Tailwind gives consistent, token-driven styling with no giant bespoke CSS to rot. Radix provides accessible, unstyled primitives (menus, dialogs, comboboxes) we style ourselves — so we **own our design system** and depend on no vendor's visual opinions. *Alternative rejected:* a heavy component library like MUI — faster to start, but you inherit its look, its bundle, and its lock-in, and fighting it later is worse than building our own primitives now.
- **Data grids: AG Grid (or TanStack Table).** Skelly is table-heavy at enterprise data volumes (thousands of rows, sorting, grouping, virtualisation, export). This is not a place to improvise — AG Grid is the enterprise standard (note: its advanced tier is commercially licensed; TanStack Table is the open, headless alternative we control fully). We wrap whichever we pick in our own component so the choice is swappable (Principle 6).
- **Charts: ECharts or visx.** Reporting and forecasting need charts that handle large datasets and export cleanly. Recharts is fine for simple dashboards but strains at volume; ECharts is enterprise-proven. Again, wrapped behind our own chart component.
- **Forms: React Hook Form + Zod.** Skelly is intensely form-driven (estimation inputs, cost breakdowns). React Hook Form is performant and ergonomic; **Zod schemas are shared with the backend from the `domain-contracts` package** — the single biggest payoff of TypeScript-everywhere. One validation schema, defined once, enforced on both client (fast UX) and server (authority). This is Principle 4 made literal.
- **Server-state: TanStack Query.** The most important frontend discipline (architecture 5.2): backend data is *fetched and cached*, never copied into a client store and hand-synced. TanStack Query treats the backend as the source of truth. *Alternative:* RTK Query (fine if we were already using Redux; we won't be by default). Genuine client-only UI state uses a lightweight store (Zustand) — small, unopinionated, no ceremony.

---

## 5. Database & data access

### 5.1 Database — PostgreSQL, managed (settled)
Locked (ADR-003). Relational integrity for financial correctness, transactions, Row-Level Security for tenant isolation, JSONB for per-tenant custom fields, `pgvector` for AI retrieval, mature full-text search — one engine covering an enormous surface, operated by the managed provider.

### 5.2 Database access — Prisma (recommended), with Drizzle as a genuine rival

This is one of the **contested calls**, so I'll be honest about it.

**Decision.** **Prisma** as the primary data-access layer and migration tool.

**Why.**
- **Best-in-class migrations and DX.** Prisma's schema-driven migrations are mature, safe, and reviewable — directly serving the architecture's "migrations are code" principle. Its generated client is fully type-safe, and its tooling (Studio, introspection) shortens the loop for a solo builder enormously.
- **Onboarding.** A future engineer reads one `schema.prisma` and understands the entire data model at a glance — that's Principle 14 and Principle 10 for free.
- **Type-safety** ties the database into our TypeScript-everywhere guarantee.

**The serious alternative — Drizzle.** Drizzle is SQL-first, lighter, has no separate query engine, and gives you *precise control* over the SQL emitted. For Skelly's **heavy financial reporting and complex analytical queries**, that control is a real advantage — Prisma has historically been weaker at complex joins/aggregations, sometimes forcing you to `queryRaw`. Drizzle is younger but rapidly maturing and increasingly the choice of teams who care about query performance.

**How I resolve it.** Prisma for the **transactional domain model** (where DX, migrations, and safety dominate) is the right primary. For **heavy read/reporting paths**, we're comfortable dropping to raw, reviewed SQL or a lightweight query builder (**Kysely**) *behind our repository interfaces* — the architecture's repository pattern means the calc/reporting layer doesn't care what's underneath. So the answer is "Prisma primarily, escape hatch to SQL for reporting, and Drizzle is our documented Plan B if Prisma's query limits ever bite hard." I'd rather commit to Prisma's productivity now and keep the boundary clean than pre-optimise for queries we haven't written yet.

**Risk.** Prisma at *very* large scale and very complex queries can require care. Mitigation: the repository abstraction (architecture 4.1) isolates data access, so swapping engines is a contained operation, not a rewrite.

**Rejected: TypeORM / Sequelize.** Older, and TypeORM in particular has a history of instability and awkward typing. No reason to choose them over Prisma or Drizzle today.

---

## 6. Authentication — WorkOS (recommended), with an open-source escape hatch

**Decision.** Delegate identity to a **purpose-built B2B auth provider** — recommended: **WorkOS** — layered so our app never stores passwords and enterprise SSO/SCIM is a switch we flip, not a rebuild.

**Why WorkOS specifically.** Skelly sells to enterprises. Enterprises *require* **SAML/OIDC SSO**, **SCIM directory provisioning** (auto add/remove users from their identity provider), and **MFA** — and these are notoriously painful to build and maintain yourself. WorkOS is built precisely for this: it turns "we support Okta/Azure AD/Google SSO and SCIM" into configuration. That directly de-risks the enterprise sales motion the Vision depends on. It also means we **never hold password liability** (architecture Section 7).

**Alternatives.**
- **Auth0 (Okta) / Amazon Cognito** — mature, full-featured. Auth0 is excellent but gets expensive at scale and is heavier than we need early; Cognito is cost-effective and AWS-native but has a rougher DX and weaker B2B-SSO ergonomics than WorkOS. Both are defensible; WorkOS's B2B focus edges them for our exact use case.
- **Self-hosted (Keycloak / Ory / SuperTokens)** — maximum control, no per-user vendor fees, no lock-in. The trade-off is *you* operate critical auth infrastructure — patching, scaling, securing it — which is a heavy burden and a large attack surface for a solo team. **This is our escape hatch:** if vendor cost or a customer's data-residency rules ever demand self-hosting, Ory/Keycloak are the destination, and we design our auth boundary so the switch is contained.

**The non-negotiable design rule (provider-independent).** Regardless of provider, authentication is accessed through a thin internal `auth` module (architecture Section 4). The rest of Skelly knows only "who is this authenticated user and what may they do" — never *how* they logged in. That keeps us from being welded to any vendor and lets the WorkOS→self-hosted move (or vice versa) stay surgical.

**Authorisation** (a separate concern from authentication) stays *inside* Skelly — the centralised `can(user, action, resource)` permission service (architecture Section 7). We never outsource *what a user is allowed to do*; that's core business logic.

---

## 7. Background processing & long workflows

**Decision.** **BullMQ** (Redis-backed queues) for jobs now; **Temporal** reserved for complex durable workflows later.

**Why BullMQ.** It's the mature, Node-native job queue — reliable retries, scheduling (cron-style jobs), rate limiting, priorities, and good observability, all in TypeScript. It covers everything the architecture's async layer needs today: sending notifications, running long calculations off the request path, syncing integrations, generating reports. Redis is also useful for caching and rate-limiting, so it earns its place twice.

**Alternatives.**
- **Cloud-native queues (AWS SQS + EventBridge / Cloud Tasks).** Fully managed, effectively infinite scale, no Redis to run. The trade-off is tighter cloud coupling and a less rich developer experience for complex job patterns. **We keep this as the scale-out option** — if queue volume ever outgrows a Redis instance, moving hot paths to SQS behind our job abstraction is straightforward.
- **Temporal** for **durable, multi-step, long-running orchestration** — think a multi-stage approval that spans days, or an AI agent executing a sequence with retries and human-in-the-loop pauses. Temporal is superb at exactly this but is operationally heavyweight. **Deferred, not dismissed:** when AI agents and complex cross-domain workflows arrive (Vision), Temporal is the tool. Building it now would be over-engineering (Principle 16).

**Design rule.** Jobs are defined behind a small internal interface so the underlying engine (BullMQ today, SQS/Temporal tomorrow) is swappable — same anti-lock-in discipline as everywhere else.

---

## 8. File storage — S3-compatible object storage

**Decision.** **Object storage** (Amazon S3, or any S3-compatible service) for all documents and files. Never the database, never the server's local disk.

**Why.** Skelly handles bid documents, proposals, and attachments — potentially large, numerous, and needing versioning. Object storage gives effectively unlimited, cheap, durable storage with **built-in versioning** (keep every revision of a document — aligns with the Vision's history-matters philosophy), **server-side encryption at rest**, and **presigned URLs** (time-limited, permissioned direct up/download that never routes big files through our app servers). Storing files in Postgres bloats the database and wrecks backup/restore; storing them on a server's disk breaks the moment we run more than one instance (architecture's stateless requirement).

**Security design.** Files are private by default; access is granted only via short-lived presigned URLs after the permission service authorises the specific user for the specific file. Bucket-level public access is disabled entirely.

**Alternative.** Cloud-provider equivalents (Azure Blob, Google Cloud Storage) are functionally identical; the S3 *API* is the de-facto standard and keeps us portable.

---

## 9. Search — start in Postgres, extract when scale demands

**Decision.** Phase it. **Phase 1: PostgreSQL full-text search + `pgvector`.** **Phase 2 (when scale demands): a dedicated engine (OpenSearch or Typesense/Meilisearch).**

**Why start in Postgres.** Our data already lives there, and Postgres full-text search is genuinely good for a long time — no second system to operate, keep in sync, or secure. Adding a search cluster on day one is classic premature scaling: infrastructure and a sync pipeline in exchange for scale we don't yet have. **`pgvector`** is especially important: it stores the vector embeddings for **AI retrieval (RAG)** *in the same database*, so the organisation's compounding knowledge base (Vision) is searchable semantically without a separate vector database. One fewer system, one fewer sync problem, one fewer thing to secure.

**When to extract.** When search relevance, faceting, or full-text volume genuinely outgrows Postgres — measured, not guessed. Then **OpenSearch** (open-source, enterprise-proven; the open Elasticsearch fork) for heavyweight document/enterprise search, or **Typesense/Meilisearch** for fast, simpler instant-search. Because search reads from our system of record, the index is always a *rebuildable derivative* (architecture 6.2) — extraction is additive, not a migration of truth.

**Rejected as day-one choice: Elasticsearch/OpenSearch from the start.** Powerful but operationally heavy; the wrong first spend. Right tool, wrong time.

---

## 10. AI layer — provider-agnostic gateway

**Decision.** An **internal AI Gateway** module (architecture Section 8) that all AI calls route through, built over a thin provider-abstraction library (**Vercel AI SDK** recommended, or **LiteLLM**), supporting multiple providers (Anthropic, OpenAI, others) behind one internal interface.

**Why.** The Vision demands no single-vendor dependency and the ability to add providers without rewrites. The gateway is the *architectural* answer; the SDK is the *implementation* convenience. Domains express intent ("draft this," "suggest risks"); the gateway chooses the model, applies prompts, enforces which tenant data may reach which provider, tracks cost, logs prompt/model-version/input/output for **explainability** (Principle 9), and returns a *suggestion* the domain and a human then authorise. **AI never writes an authoritative number directly** — it proposes inputs that flow back through validation, permissions, the calc engine, and human approval.

**Why a library, lightly.** The Vercel AI SDK gives clean streaming, tool-calling, and provider-swapping in TypeScript. **We keep it behind our own gateway interface** so even the SDK is replaceable — the same anti-lock-in rule, applied to the fastest-moving corner of the whole industry, where it matters most.

**Embeddings/RAG** use `pgvector` (Section 9), keeping the knowledge base in our system of record.

**Rejected: hard-coding one provider's SDK into domains.** Fast to prototype, catastrophic to govern and un-lock later. Exactly the "quick solution twice" Principle 16 forbids.

---

## 11. API design — REST + OpenAPI as the stable contract

**Decision.** **REST, documented by OpenAPI**, as Skelly's primary and public API philosophy.

**Why.**
- **It's the stable, language-agnostic contract the marketplace and enterprise integrations need** (architecture Sections 9). REST + OpenAPI is universally understood, tooling-rich (auto-generated docs, client SDKs, mocks), cacheable, and the format every enterprise integration team expects. Our own frontend consumes the same API — dogfooding the public contract for years before partners touch it.
- **NestJS generates the OpenAPI spec from our code**, so the docs can't drift from reality.

**Alternatives, weighed honestly.**
- **GraphQL.** Real strengths: clients fetch exactly what they need (great for flexible dashboards/reporting), one endpoint, strong typing. Real costs: caching is harder, complexity is higher, and securing/rate-limiting arbitrary queries at enterprise scale is a known challenge. **Verdict: not the primary API, but a strong candidate for a future dedicated *reporting/analytics* surface** where its flexibility shines. We don't foreclose it.
- **tRPC.** Fantastic end-to-end type-safety for our TS frontend↔backend, essentially free in the monorepo. Its fatal flaw for us: it assumes a TypeScript client, which is wrong for a language-agnostic public/marketplace API. **Possible internal accelerant, never the public contract** — and having two API styles has its own cost, so I lean toward one well-built REST API rather than splitting our attention.

**Design rules:** versioned from day one (`/v1`), consistent resource naming and error format (consistency compounds — Principle 14), everything authenticated/authorised/validated at the boundary (architecture Section 7).

---

## 12. Cloud — AWS (recommended), Azure a real contender

**Decision.** **AWS** as the primary cloud, with the whole platform kept **cloud-portable** (containers + Terraform) so the decision is reversible.

**Why AWS.** The broadest and most mature service catalogue, the deepest enterprise track record, the largest hiring pool of engineers who already know it, and the strongest set of compliance certifications enterprises will ask about. For a ten-year enterprise platform, AWS is the lowest-regret default.

**Alternatives, genuinely weighed.**
- **Azure.** Here's an honest, Skelly-specific consideration: your customers are **enterprise commercial teams**, and large enterprises are frequently deep in the **Microsoft ecosystem** (Azure AD/Entra, Office, Dynamics). Some enterprise deals are *easier* when you're on Azure, and Azure AD integration is a natural fit for our SSO story. If early customer discovery shows your buyers are Microsoft-shops, Azure becomes a serious contender. **This is the one cloud decision I'd want to revisit against real customer data** rather than treat as settled.
- **Google Cloud.** Best-in-class data/analytics and strong AI heritage. But smaller enterprise-SaaS mindshare and hiring pool than AWS. A fine platform; not the safest default for us.

**Why portability matters more than the pick.** Because we run **containers** orchestrated by **Terraform** with **standard Postgres** and **S3-compatible storage**, moving clouds is a real (if non-trivial) option, not a fantasy. That turns "which cloud" from a bet-the-company decision into a strong-default-we-can-revise. The one lock-in to avoid deliberately: don't build the core on a *proprietary* cloud service (e.g. a vendor-specific serverless database) where an open standard exists.

---

## 13. Containers & orchestration — Docker now, Kubernetes deferred

**Decision.** **Docker** for packaging, everywhere. A **managed container runtime** (AWS ECS on Fargate, or equivalent) to run it. **Kubernetes deferred** until real need.

**Why Docker.** It's the portability guarantee that underpins the entire "managed now, portable always" strategy — the app runs identically on your laptop, in CI, in staging, in production, and on any cloud. It also makes onboarding a future engineer a one-command affair. This is settled best practice; there's no real alternative worth debating.

**Why not Kubernetes yet.** Kubernetes is the enterprise-scale orchestration standard, and we'll likely land there eventually — but running it is a *significant* operational discipline that a solo founder should not take on to run one monolith and a worker. **A managed runtime like Fargate gives us container orchestration, autoscaling, and health management without operating a cluster.** When we have multiple services and a team to run them, Kubernetes (likely managed — EKS/AKS/GKE) becomes justified. Adopting it now is textbook over-engineering (Principle 16).

---

## 14. CI/CD — GitHub + GitHub Actions

**Decision.** **GitHub** as the code host and **GitHub Actions** as the pipeline, with **trunk-based development**, **preview environments**, and a **promote-to-production** release model.

**Why.** GitHub is where the world's engineers (and their muscle memory) already are — hiring, familiarity, and the richest integration ecosystem (security scanning, code review, project tooling all live there). Actions is deeply integrated, so pull request → checks → build → deploy is one coherent flow.

**The pipeline (architecture Section 11 made concrete).** On every pull request: lint + format check, TypeScript type-check, unit + integration tests, **module-boundary check** (fails the build if domains illegally import each other), security scans, and a build. Merge to trunk auto-deploys to **staging**; **production** is a deliberate promotion of a staging-verified build. Preview environments spin up per-PR so changes can be seen in a production-like context before merge.

**Release strategy.** Trunk-based with small, frequent, always-releasable changes beats long-lived branches that rot and produce scary big-bang merges. Feature flags let us merge incomplete work safely (dark-launched) — important for a modular platform where features land incrementally.

**Alternative.** GitLab CI (excellent, all-in-one) — a fine choice, but GitHub's ecosystem gravity and hiring familiarity win for us.

---

## 15. Monitoring & observability — OpenTelemetry, vendor-neutral

**Decision.** Instrument everything with **OpenTelemetry** (the vendor-neutral standard for logs, metrics, and traces), send it to a **managed observability backend** (Datadog, or a Grafana Cloud stack — chosen on cost/DX), and use **Sentry** for error tracking.

**Why OpenTelemetry.** It's the one instrumentation standard that *doesn't* lock you to a monitoring vendor. We instrument our code once against OTel; if Datadog gets too expensive or Grafana serves us better, we redirect the data without re-instrumenting. Given observability vendors are notoriously sticky and expensive, this neutrality is worth a lot over ten years.

**What we watch:** structured logs (searchable, correlated by request), distributed traces (follow one request across API → domain → DB → job — invaluable for debugging the modular monolith), metrics (latency, error rates, queue depth, DB health), and alerts on the signals that matter. **Sentry** captures exceptions with full context and is cheap, immediate value from week one. The **audit log** (architecture 6.2) is separate and deliberate — it's a compliance/security record, not operational telemetry, and the two must not be conflated.

---

## 16. Security tooling — layered, mostly free, CI-native

**Decision.** A layered set, most of it free and living in the CI pipeline:

- **Dependency scanning & updates:** **Renovate** (or Dependabot) to keep dependencies current and flag vulnerable ones automatically. Supply-chain risk is a top real-world breach vector; automating it is the highest-leverage cheap win.
- **Static analysis (SAST):** **CodeQL** (free on GitHub) and/or **Semgrep** to catch security anti-patterns in our own code on every PR.
- **Secret scanning:** **gitleaks** in CI plus GitHub's push-protection, so a secret can't be committed in the first place. (Prevention beats rotation.)
- **Secrets management:** the **cloud secrets manager** (AWS Secrets Manager) — or **Doppler** for nicer multi-env DX — as the single source of secrets, injected at runtime, rotated periodically. **No secret ever in the repo or in code** (architecture Section 7).
- **Code quality:** **ESLint + Prettier + TypeScript strict** enforced in CI as the non-negotiable baseline; **SonarQube** optional later for deeper quality/coverage tracking as the team grows.
- **Runtime security monitoring:** cloud-native (AWS GuardDuty) as we scale.

**Alternative.** **Snyk** bundles dependency + code + container scanning in one polished product — worth considering when budget allows and we want one pane of glass; the free layered stack above covers the essentials until then.

**Standards posture.** We build to **OWASP** guidance and keep the **SOC 2** control families as a north star (architecture Section 7) so a future enterprise security review is a *documentation* exercise, not a *re-engineering* one.

---

## 17. The alternative stack (for the record)

If we deliberately optimised differently — say, for maximum raw performance and query control over solo-founder DX — a defensible *alternative* stack would be:

| Layer | Alternative choice | Why you'd pick it instead |
|---|---|---|
| Runtime | Bun | Speed & DX, if you accept the maturity risk |
| Backend | Fastify + hand-rolled DDD structure | Lighter/faster, if you want full control over structure |
| DB access | Drizzle (+ Kysely) | SQL-first precision for heavy financial reporting |
| Frontend | Angular | Batteries-included discipline for a large team from day one |
| Auth | Keycloak / Ory (self-hosted) | No per-user vendor fees, full data control |
| Queue | AWS SQS + EventBridge | Fully managed, infinite scale, tighter cloud coupling |
| Cloud | Azure | If your enterprise buyers are Microsoft-ecosystem shops |
| Observability | Grafana OSS stack (self-hosted) | Lower cost at scale, if you'll operate it |

Notice this isn't a *different* architecture — it's the *same* architecture with different vendors in the slots. That's the point: the architecture boundaries make every one of these a swappable decision, not a foundational one.

---

## 18. Risks & how we hold them

1. **JavaScript/TypeScript CPU ceiling** for heavy simulations. *Mitigation:* push CPU-bound work to background jobs; extract a single compute service (Go/Rust) behind our API boundary only if measurements demand it.
2. **Fast-moving frontend ecosystem** (React/Next churn). *Mitigation:* pin stable releases; adopt new paradigms deliberately; our own design system and structure insulate us from framework fashion.
3. **Prisma at extreme scale / complex queries.** *Mitigation:* repository abstraction + SQL escape hatch (Kysely); Drizzle documented as Plan B.
4. **Auth vendor cost/lock-in (WorkOS/Auth0).** *Mitigation:* thin internal auth boundary; Ory/Keycloak as the self-hosted escape route.
5. **Observability vendor cost.** *Mitigation:* OpenTelemetry means we can change backends without re-instrumenting.
6. **Cloud lock-in.** *Mitigation:* containers + Terraform + open standards (Postgres, S3 API); avoid proprietary services where an open standard exists.
7. **Over-adoption of young tools (Bun, etc.).** *Mitigation:* explicit "watch, don't bet" policy for the load-bearing layers; revisit on a schedule with evidence.

---

## 19. Future considerations

- **Bun** re-evaluation in ~18 months as its enterprise track record matures.
- **GraphQL** as a dedicated reporting/analytics API surface when flexible querying demand appears.
- **Temporal** when durable long-running workflows and AI agents arrive.
- **Kubernetes** (managed) when we run multiple services and have a team to operate them.
- **Dedicated search (OpenSearch/Typesense)** when Postgres FTS is genuinely outgrown.
- **Database-per-tenant premium tier** for enterprise customers with strict isolation/residency needs (architecture 6.1).
- **Azure** as primary or secondary cloud if customer discovery shows Microsoft-ecosystem buyers.
- **SonarQube / Snyk** as the team and budget grow and one-pane security/quality tracking pays off.

---

## 20. What I recommend you decide now

To pour foundations (architecture Section 14), I need three green lights. My recommendations, each justified above:

1. **Core stack:** TypeScript + Node LTS + **NestJS** (backend) + **React/Next.js** (frontend) + **PostgreSQL/Prisma**. — *Recommend proceed.*
2. **Cloud:** **AWS** as default, kept portable — *unless* you already sense your buyers are Microsoft-shops, in which case flag it and we weigh Azure. — *Recommend AWS, revisit with customer data.*
3. **Auth:** **WorkOS** (enterprise SSO/SCIM-ready) behind our own auth boundary. — *Recommend proceed.*

Everything else (queue, storage, search, observability, security tooling) follows naturally and can be adopted as each relevant feature is built — no big-bang decision required.

Say the word on those three and the next step is to scaffold the foundations, or to run your first **module document** (Opportunities or Estimation) through the seven-step methodology. Your call, founder.

---

*Like the architecture blueprint, this is a living document. Each choice can be revisited via an ADR when reality provides new evidence (Principle 17). The stack serves the architecture; the architecture serves the product; the product serves the Vision.*
