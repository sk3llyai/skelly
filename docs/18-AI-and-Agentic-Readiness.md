# 18 — AI & Agentic Readiness (a first-class design principle)

> **Purpose:** record, as an explicit and central design goal, that Skelly is built to **augment and be operated by AI (including agentic AI)** — not as a bolt-on, but as a consequence of how the platform is structured. Founder confirmed this is central (2026-07-06).
> **Last updated:** 2026-07-06

---

## The core idea
**Skelly's structured, single-source-of-truth database is the foundation that makes AI genuinely useful.** AI is only as good as the data it can reason over; fragmented, duplicated, inconsistent data — the exact problem Skelly solves *for its customers* — is also what makes AI unreliable. So the discipline that makes Skelly valuable to users is the same discipline that makes it AI-ready. **The data model is the AI moat.**

## Why the existing design is already AI- and agent-ready
Each point is a decision we've already made, now recognised as an AI enabler:

1. **Structured, relational, single-source-of-truth data** (Principle 4; Postgres; pull-don't-duplicate). Clean, consistent, queryable — the prerequisite for reliable AI.
2. **Explainable calculations / no black boxes** (Vision; calc engine, Doc 10). Every number traces to inputs + formula + version → AI insights can **cite sources**, and agents can rely on trustworthy figures.
3. **The AI Gateway** (ADR-009, Arch §8). One governed, provider-agnostic doorway for all AI. **Agents = orchestrated gateway calls that propose actions a human/domain authorises.** Prompts, models, inputs, outputs logged.
4. **Semantic retrieval built in** (pgvector, Doc 07). "Find similar historical bids / opportunities" is a RAG query over the knowledge base — already used in Identification's Interactive Lists (Doc 17 B.1) and the Competitors concept (Doc 16).
5. **Calculations as agent tools.** Registered, versioned calculations mean an agent **calls the engine** rather than doing (and hallucinating) maths — the key to trustworthy *financial* AI.
6. **Agents act through the same governed API + permissions + tenant isolation + audit** ("UI is just an API client", ADR-010; two-layer authz, Doc 17 A.2). An agent is another authorised actor through the same controlled door — it cannot exceed permissions or cross tenants, and every action is logged.
7. **Compounding structured knowledge** (Vision). Every bid, cost, scenario, and outcome is captured structurally → a rich per-tenant corpus for AI to reason over and learn from — the "central intelligence layer".

## Example: the "similar historical bids" assistant (your example, on this architecture)
1. User is forecasting a bid and asks the assistant for context.
2. The assistant (via the **AI Gateway**) runs a **pgvector semantic search** over the tenant's structured bid history for opportunities with similar scope/sector/value.
3. It pulls those bids' **explainable** figures (award price, margin, outcome) and, where numbers are needed, **calls the calc engine** rather than estimating.
4. It returns insights ("similar bids won at ~8% margin; yours is at 5%") **with citations**, as a **suggestion** — the human decides. All **tenant-scoped, permissioned, audited**.
Nothing here is a new subsystem — it's the existing pieces composed.

## The agentic model & guardrails
- **AI augments, humans decide** (Vision). Agents propose; consequential actions — especially **committing financial values** — require human confirmation.
- **Governed, not god-mode.** Agents operate within RBAC + per-deal access + tenant isolation, through the API/AI-Gateway, fully audited. No raw database access.
- **Provider-independent.** Swap or add models without rework (AI Gateway).
- **Explainable.** Because the underlying data and calcs are explainable, so are the AI's outputs.

## Design principle going forward (make every module AI-consumable)
Every new feature should be built so an AI/agent can use it as easily as a human:
- **Structured & typed** data (no critical info trapped only in free text or the UI).
- **Exposed through the governed API** (the same surface agents use).
- **Explainable** (traceable inputs/outputs).
- **Semantically indexed** where retrieval adds value (embeddings for text-heavy content).
- **Permissioned & audited** so AI access is safe by default.

*Recorded as a cross-cutting principle; referenced from the Architecture (§8), the Living Platform Model (conventions), and honoured in every module analysis.*
