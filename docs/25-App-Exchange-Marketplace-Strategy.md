# 25 — App Exchange / Marketplace Strategy

> **Status:** Strategic vision captured (2026-07-06). The long-term ambition: a Salesforce-AppExchange-style **marketplace** where Skelly and third parties publish plug-in **modules**, sold to Skelly customers with a **revenue-share** cut to Skelly. **Already in the founding Vision** ("industry modules, calculation libraries, benchmark datasets, integrations, partner extensions, customer-developed applications; third parties extend Skelly without modifying its core"). Flagged in the Architecture (Doc 06) as the most demanding requirement — **and protected for ever since.**
> **Timing: build the core first. NOT now.**

---

## 1. The idea
- Skelly is **industry-agnostic**; each industry has specific cost/revenue models, data sources, and integrations crucial to winning. Rather than hard-code every nuance into the core (bloat, impossible to anticipate), **keep the core standardised** and let companies **extend it with modules.**
- A **marketplace** lets: (a) **Skelly** build & sell modules; (b) **customers/partners** build modules and sell them, with **Skelly taking a cut**. Revenue + ecosystem.

## 2. What a "module" is (packaged extensions of things we already build)
- **Industry cost/revenue models** → plug into the Models & Templates / formula engine (already user-creatable — a proto-module).
- **Data sources / benchmark feeds** → plug into Marrow (data catalog) + the integration layer.
- **Integrations** (Salesforce, Oracle, SAP…) → connectors via the integration layer.
- **Dashboards / views** → the view-builder over Marrow.
- **AI agents, calculation libraries, benchmark datasets** (Vision).
→ **Key point:** modules = packaged bundles of capabilities the platform *already supports*. The marketplace formalises **packaging, sharing, selling** them — not a from-scratch build.

## 3. Why the architecture already supports it
- **Modular design + stable public API + "our UI is just an API client"** (ADR-010) → a real extension boundary.
- **Composable/configurable engines** (models-as-data, formula engine, taxonomy, Marrow, AI Gateway) → the raw materials of extensions.
- **Governed API + RBAC + tenant isolation** → the right foundation for running third-party extensions safely.

## 4. Strategic value
- **New revenue stream** — a cut of every module sale.
- **Moat / network effect** — an ecosystem makes Skelly more valuable and much harder to leave (à la Salesforce).
- **Industry-wide coverage without building everything** — partners fill vertical gaps. This is how a horizontal platform goes industry-wide.

## 5. What it takes (a platform, not a feature)
- **Stable, versioned public API + developer SDK** (so third parties can build).
- **⚠️ Security = the hard problem.** Third-party code must NOT compromise tenant isolation/data — modules run **sandboxed & permissioned through the governed API**, never raw access; plus a **review/approval** process (quality + safety + liability).
- **Billing / revenue-share**, module versioning, ratings/discovery, support model.

## 6. Sequencing (honest)
1. **Build & prove the core product**, win customers.
2. **Design/keep the extension boundary** so modules stay possible (ongoing — already doing this).
3. **Open the marketplace** once there's demand + an ecosystem to justify it (~year 2–3+).
- **Biggest risk:** building the marketplace *too early*, before there's anything to sell or anyone to buy. So: **don't build now; don't foreclose it.**

## 7. Notes
- Much module capability is **latent already** (custom models via the formula engine, custom views via Marrow, connectors via the integration layer) — a natural on-ramp.
- Relates to: Competitors/benchmark datasets (Doc 16), Onboarding/integrations (Doc 24), AI agents (Doc 18).
