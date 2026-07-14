# 16 — Competitors / Market Intelligence (PRELIMINARY — parked)

> **Status:** PRELIMINARY IDEAS — deliberately parked by the founder until bid-level Forecasting is fully understood. Not a spec. Captures the founder's vision + CTO input so nothing is lost (Principle 14). Revisit after the Bid Engine / Forecasting.
> **Last updated:** 2026-07-06

---

## 1. Founder's vision (as described)
The **Competitors** section = a **database of UK bids that have already happened**, capturing things like: **award price, winning company, requirements/scope**, (and likely) buyer, sector, dates, contract length.
- **Populated automatically** by an AI process that scans **government procurement portals** (founder has a list of sources).
- **Surfaced to users during bid-level forecasting**, so commercial teams can see **how similar bids were won by competitors** and **price their own bids more competitively**.
- Core value: turn scattered public tender data into structured **competitive pricing intelligence**.

## 2. Where this fits (CTO view)
This is the **external** half of the benchmarking story. We already saw an **internal** benchmark on the cost page ("This cost vs Market Average vs Top Quartile", Doc 11 A2.2). Competitors/Market Intelligence is a strong candidate **source** for those market benchmarks:
- **Internal benchmarks** = anonymised aggregates from Skelly's own clients' bids.
- **External benchmarks** = this public UK tender database.
Together they power the "how does my price compare?" feature during Forecasting.

It also maps directly onto the **Vision's marketplace ambition** ("benchmark datasets" as a future platform asset) — a well-structured, proprietary UK public-bid intelligence dataset is a genuine **competitive moat** and potentially a product in its own right.

## 3. CTO refinements (the ideas you asked for)

### 3a. Reframe "AI scans portals" → "structured ingestion + AI enrichment"
The most reliable, legal, and maintainable architecture separates two jobs:
- **Getting the data:** prefer **official open-data feeds / APIs** over AI web-scraping wherever they exist. Much UK public procurement is *published as open data* in a structured form (the **Open Contracting Data Standard, OCDS**, is widely used by UK services). Ingesting structured feeds is vastly more reliable than an AI reading HTML pages that change layout. *(Which specific portals/APIs to use — to confirm from your list; I can research the current landscape when we return.)*
- **Making the data valuable:** this is where **AI genuinely earns its place** — not fetching, but:
  - **extracting** structured fields from unstructured tender PDFs/notices (scope, requirements, evaluation criteria),
  - **classifying** bids (sector, service type, size band),
  - **entity resolution** (matching "Capgemini", "Capgemini UK Plc", "Capgemini Ltd" to one company — a classic hard problem),
  - **semantic matching** ("find past bids similar to this one") via embeddings.

So: **a structured ingestion pipeline + an AI enrichment layer + a searchable database.** This fits our architecture cleanly — the **integration layer** (Arch §9), **background jobs** (Arch §4.6), the **AI Gateway** (Arch §8), and **pgvector** (already chosen, Doc 07 §9) for "similar bids" search.

### 3b. Legal & compliance (important — flag early)
- **Good news:** UK public procurement award/notice data is largely **open/public by design**, which makes this far more defensible than scraping private data.
- **Still do:** use official APIs/open-data licences, check each source's **terms of use / robots.txt**, respect rate limits, and record **provenance** (which source, when fetched) for every record.
- **GDPR:** corporate data is fine, but any **named individuals** (contact people) are personal data — minimise/handle carefully.
- **Prefer feeds to scraping** not just for legality but reliability (scrapers break constantly when sites change).

### 3c. How it plugs into Forecasting (the payoff)
When a user forecasts a bid, Skelly finds **comparable historical awards** (similar requirements/sector/value via semantic search) and shows award prices, winners, and patterns → feeding the **benchmark comparison** and helping set a competitive price. This is the "knowledge compounds" vision applied to *market* knowledge, not just the client's own.

### 3d. Data-quality concerns to design for
Deduplication, entity resolution (company name normalisation), freshness/refresh cadence, confidence/quality flags, and handling missing fields. Market-intelligence data is messy — quality handling is most of the work.

## 4. Sequencing recommendation
- **Defer the build** (agreed) — this is a substantial sub-system (ingestion pipeline + AI enrichment + search) and is **not required for the core bid-forecasting MVP**.
- **But design the "benchmark slot" now** so this can plug in later without rework — i.e. Forecasting reads benchmarks through a `BenchmarkService` interface that can be backed by internal data first and this external dataset later. (Same anti-lock-in discipline as everywhere.)
- Revisit as its own module after Forecasting, where its purpose will be concrete.

## 5. Open items / to bring next time
- Founder's **list of government portals** (so we can map to official APIs/OCDS feeds).
- Exact fields to capture per bid (award price, winner, buyer, requirements, sector, dates, contract length, CPV/classification…).
- Relationship to the internal **Benchmarking** feature (one unified benchmark service vs two).
- Whether this becomes a **marketplace dataset** (Vision) — strategic decision.
- Named **Competitor** entities (do we track competitors as first-class records, with their win history?) — the section is called "Competitors", so likely yes: a Competitor profile aggregating that company's known wins.

*Parked. To be turned into a full module analysis after bid-level Forecasting is understood.*
