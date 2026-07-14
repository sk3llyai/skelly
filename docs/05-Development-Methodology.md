# 05 — Skelly Software Development Methodology

> **Source:** Founder prompt, provided verbatim. How every feature is built.
> **Status:** Governing document.

Skelly is built exactly as a professional software engineering team would build an enterprise SaaS platform. This is not a series of disconnected coding requests — it is one long-term software project. Every feature should strengthen the existing platform. Every architectural decision should consider the future.

## The 7-step development workflow (do not skip steps)

### Step 1 — Understand
Before writing code, explain understanding of the feature. Identify: purpose, users, dependencies, business rules, reusable logic, relationships with existing modules. If anything is unclear, ask questions before implementation.

### Step 2 — Engineering Review
Review the feature as a senior software architect. Explain: architectural, security, scalability, performance considerations; testing requirements; reusable components and services. Recommend improvements if appropriate.

### Step 3 — Technical Design
Before writing code, describe: folder structure, files to be created, APIs, database changes, frontend components, backend services, business logic, permissions, testing strategy. Wait until the design is internally consistent before implementation.

### Step 4 — Implementation
Only after the previous steps. Generate production-quality code. Avoid placeholder implementations. Avoid temporary solutions unless explicitly requested.

### Step 5 — Documentation
Every feature includes documentation explaining: what was built, why, how it works, how another engineer should extend it. Documentation is part of the feature.

### Step 6 — Code Review
Perform a self-review as a senior engineer reviewing another's pull request. Identify: weaknesses, simplifications, technical debt, security concerns, performance improvements, readability improvements. Improve where appropriate.

### Step 7 — Future Improvements
At the end of every feature, recommend: future enhancements, refactoring opportunities, reuse opportunities, scalability improvements.

## Build features like a team
Every feature passes through: Product Review → Architecture Review → Implementation → Testing → Documentation → Code Review → Merge. Replicate this workflow during every development session.

## Consistency
Never introduce new architectural patterns unless there is a compelling reason. Maintain consistency across: folder structures, naming conventions, APIs, components, services, database access, documentation, testing. The platform should feel as though it was built by one disciplined engineering team.

## Technical debt
Continuously monitor technical debt. If a feature introduces it: explain it, explain why, recommend alternatives. Do not silently introduce poor engineering practices.

## Build for the future
Every implementation should consider future requirements: AI agents, APIs, integrations, enterprise permissions, customisation, reporting, auditing, performance, scalability. Code should not require major rewrites when these capabilities are introduced.

## Professional standards
Every implementation should be capable of passing a professional engineering review. The objective is not to produce working software — it is to produce software that experienced engineers would happily maintain and extend for many years.

---

### CTO's operating note (proportionate rigour)
The full 7-step gate applies at full depth to **load-bearing changes** — calculations, permissions, data model, APIs, auth, money. **Trivial changes** (a renamed field, a button) get a proportionate version. The CTO always names which weight class a change is in and why, so the process stays real rather than ritualistic (spirit of Principle 16).
