# 24 — Onboarding & Historical Data Import

> **Status:** Strategy agreed (2026-07-06). A **first-class capability**: bring in a client's existing bid history and data at onboarding so Skelly delivers value **from day one** — not months/years later. Detailed build spec to follow.
> **Why it matters:** without it, the "compounding knowledge" (win-probability calibration, benchmarking, similar-bid insights) has nothing to work with early on → slow adoption. Historical import turns *"valuable over time"* into *"valuable day one."*

---

## 1. What gets imported
- **Historical bids/deals** (the priority): deal name, customer, sector, size/value, **won/lost outcome**, price, competitors, evaluation scores, dates. Powers **win-probability calibration** (Doc 23), **benchmarking**, and **similar-bid retrieval**.
- **Company Parameters:** taxonomy (categories, deal types…), users, financial standards.
- **Accounts & Products/Solutions** the client already sells to / offers.

## 2. Import methods — offer several (clients store bids very differently)
1. **Guided template import** — a standard Excel/CSV template with the key fields; client fills/exports into it and uploads. Reliable, structured. *(Baseline.)*
2. **Flexible column mapping** — map the client's own spreadsheet columns onto Skelly's fields, so they don't reformat by hand.
3. **AI-assisted extraction** — for messy/varied spreadsheets or bid documents/PDFs, AI reads the files and extracts structured bid data; **a human reviews & confirms** (AI proposes, human decides — Doc 18; ties to Attachments AI, Doc 17 A.4).
4. **Source-system connectors** *(later)* — pull bids from CRM (Salesforce, Dynamics), SharePoint, OneDrive, Google Drive via the **integration layer** (Arch §9).
5. **Auto-fill public bids** — for public-sector work, the external procurement/Competitors database (Doc 16) can pre-populate some of the client's **public** wins/losses automatically.

## 3. Principles
- **Minimum viable import:** even just *outcome + value + sector + price* is enough to start calibrating and benchmarking. Don't demand perfect/complete data — import what exists, enrich over time.
- **Provenance & confidence:** tag imported data ("imported from client Excel, date"), distinguish it from natively-created data, and weight its confidence accordingly (feeds the win-probability credibility weighting, Doc 23).
- **Progressive enrichment:** onboarding seeds the database; it compounds from there.
- **Respect existing workflows:** meet clients where their data is (files first, connectors later) rather than forcing a rigid format.

## 4. Onboarding is broader than bids
Historical-bid import is one pillar. Full onboarding = set up Company Parameters (taxonomy, users, financial standards) + import Accounts + Products/Solutions + connect tools. The Portfolio Level Resources are explicitly *"tailored during client onboarding"* (Doc 11).

## 5. Strategic value
- **Day-one value** → faster adoption, stickier product, stronger sales story.
- **Data moat from the start** — the client's structured commercial history becomes usable immediately (AI-consumable, Doc 18).
- A natural **professional-services / onboarding** motion (assisted import) for enterprise deals.

## 6. Open items (for the full spec later)
- Exact import template fields + validation/dedup rules.
- Which connectors first (CRM? file stores?).
- How assisted (human-in-the-loop) vs self-serve the import is.
- Mapping imported categories/outcomes onto Skelly's taxonomy + statement classes.
