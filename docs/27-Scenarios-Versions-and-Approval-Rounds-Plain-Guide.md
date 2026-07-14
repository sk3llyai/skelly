# 27 — Scenarios, Versions & Approval Rounds — Plain-English Guide

> **Status:** Plain-English explainer (2026-07-12). The definitive, easy-to-follow mental model for how Skelly handles scenarios/versions and approval rounds. Technical detail lives in Doc 12 (Scenarios) and Doc 17 B.6 (Approval); this doc is the "explain it simply" companion.

---

## The one idea to hold onto

There are **two completely different reasons** a deal ends up with "multiple versions." Almost every clunky bidding tool fails because it muddles them. Skelly keeps them separate:

1. **You're exploring choices** → these are **Scenarios**. They sit **side by side**. You compare them and pick. *(Question they answer: "which option is best?")*
2. **You're revising one chosen thing after feedback** → these are **Rounds / Versions**. They sit in a **timeline**. Each replaces the one before. *(Question they answer: "how did this change, and why?")*

That's the whole thing. Scenarios are **parallel**. Rounds are **linear**. Everything below is just detail on those two.

---

## Part 1 — Scenarios (the "which option is best?" versions)

**What a Scenario is:** a complete, self-contained version of the bid — its full costs, phasing, risks, pricing, revenue and forecast. Not a note or a tweak — a whole working model that produces its own numbers (bid price, margin, cash peak, win probability).

**Why you have several:** because a real deal has genuine choices to explore. For example:
- Different **scopes** — "Products A+B+C" vs "just A" (Case 1).
- Different **commercial models** — "CAPEX + OPEX" vs "OPEX-only" (Case 1).
- Different **volumes** — "10 units" vs "30 units" (Case 2).
- Different **strategies** — "Aggressive / win-focused" vs "Base / margin-focused".

**The key property: they coexist.** None of them is "the history" of another. They're rival options on the table at the same time. You line them up, compare them (that's what the **Scenario Battle** screen is for), and decide which to pursue.

**Analogy:** think of **contestants lined up on a stage**. You look at all of them together, judge them against each other, and crown a winner. Removing one doesn't change the others; they're independent.

---

## Part 2 — Rounds / Versions (the "how did this change?" versions)

**What a Round is:** a **saved snapshot of one scenario at a moment in time** — specifically, the moment you sent it for approval. The next round is the *same scenario after you've reworked it* in response to feedback.

**Why you have several:** because approval is almost never one-and-done. You present a bid, management says "margin's too thin, rework it," you change it, you present again. Each of those presentations is a round.

**The key property: they're a timeline, and each replaces the last.** Round 3 is the **current** bid; Rounds 1 and 2 are **history** you can look back at. You would never pursue Round 1 and Round 2 as two separate live bids — Round 2 exists *because* Round 1 was superseded.

**What a snapshot actually contains (important):** the **entire scenario** — all the costs, phasing, risk, tax, revenue, P&L, cash flow and simulator inputs — not just the headline numbers. That's what lets Skelly show you *exactly* what changed between rounds, and gives you an audit trail. (See Doc 12 A.5.1.)

**Analogy:** think of the **version history of a document** (like the "see edit history" in Google Docs). v1, v2, v3 of the *same* document. The latest is what's live; the older ones are there so you can see how it evolved and compare.

---

## Part 3 — How the two fit together (the picture)

Stack them and you get a simple two-level tree:

```
DEAL: "Government X — Legacy IT Replacement"
│
├── Scenario A — "A+B+C, CAPEX+OPEX"        ← parallel options
│      ├── Round 1  (presented 3 Jun — "too expensive")
│      ├── Round 2  (presented 10 Jun — "closer, trim risk")
│      └── Round 3  (presented 17 Jun — APPROVED)   ← current
│
├── Scenario B — "A only, OPEX-only"
│      └── Round 1  (presented 3 Jun — parked)
│
└── Scenario C — "A+C, CAPEX+OPEX"
       └── Round 1
```

- **Top level = Scenarios** → parallel options you compare and choose between.
- **Inside each scenario = Rounds** → the linear history of that one option as it's revised.

So "which do we bid?" is answered at the **Scenario** level. "How did our chosen bid evolve through sign-off?" is answered at the **Round** level. Two questions, two levels, no confusion.

---

## Part 4 — Keeping it manageable when there are lots (the organising layer)

Real deals can have many scenarios (Case 1 alone = 5 scopes × 2 commercial models = 10). A flat list would be chaos, so Skelly adds three helpers (Doc 12 A.5.2):

1. **Tags / dimensions** — every scenario is labelled by what makes it different (scope, commercial model, volume, price point, contract lot). You can then **filter and group** ("show me all the OPEX-only ones") and view them as a **grid** (scopes down the side, commercial models across the top).
2. **Generate, don't hand-build** — tell Skelly "these 5 scopes × these 2 models" and it **creates the 10 starter scenarios for you**. Or "run this at 1, 5, 10 and 30 units" and it spins up the four automatically. This is what makes complex deals fast.
3. **Shared building blocks** — Product A is defined once. Every scenario that includes A reuses it. So when you optimise A's cost, the change flows to every scenario using A (with control over when to lock it). That's what powers the "prices are too high → cut costs → show the improvement" loop.

---

## Part 5 — Approval rounds, step by step

Here's the actual approval loop, and where rounds come from:

1. **You pick what to present.** Either **one bid** (a single scenario) or, for complex deals, **a set of options** (several scenarios side by side — Cases 1 & 2).
2. **Skelly builds the approval pack** in whatever form the approver needs — an email summary, slides for a call, or a document pack (Doc 17 B.6f).
3. **You present; management responds.** They **approve**, **reject**, or **push back with feedback** ("pricing's too risky", "cash flow's wrong").
4. **If pushed back, you rework.** You change the scenario to address the feedback. **That rework is saved as the next round** — a fresh snapshot, with the feedback attached to it.
5. **You re-present.** Now the approver can see Round 2 *and* exactly what changed since Round 1 (the round-to-round diff).
6. **Repeat until approved.** When they approve, that round is **locked** as the official bid.

**Two shapes of approval (both supported):**
- **Linear** — you're refining **one bid** across rounds (the loop above). This is the common case.
- **Parallel** — you present a **set of options** for a single decision; management picks one (or sends the set back). Here the "round" covers the whole set, and the tags/grid from Part 4 make the comparison readable.

**Plus a fast lane:** for early, low-stakes submissions (an RFI budgetary price, or a pre-approved standard offer — Case 3), the approval matrix can allow a **fast-track / pre-approved** path instead of the full cycle.

**Who has to approve** isn't fixed — it's driven by the company's **Approval Matrix**: bigger or more complex bids need higher sign-off (Business Unit → Geo → Corporate/CEO), configured per company (Doc 17 B.6f).

---

## Part 6 — The cheat sheet

| | **Scenarios** | **Rounds / Versions** |
|---|---|---|
| **Answer the question** | "Which option is best?" | "How did this one change, and why?" |
| **Shape** | Parallel (side by side) | Linear (a timeline) |
| **Relationship** | Coexist — rivals | Each supersedes the last |
| **You** | Compare & choose | Revise & track |
| **Everyday analogy** | Contestants on a stage | A document's edit history |
| **Example** | "A+B+C" vs "A only" | "Bid v1 → v2 → v3 after feedback" |
| **In Skelly** | Scenario Battle, grid view | Version timeline, round diff |
| **Created by** | You, exploring choices | Approval feedback → rework |

**If you remember nothing else:** *Scenarios are the options you choose between. Rounds are the history of the option you chose.* One is parallel, one is a timeline — never mix them up, and the whole system stays simple.

---

## Cross-references
- Scenarios (full spec) — Doc 12 (A.5.1 rounds, A.5.2 organising layer)
- Approval (full spec) — Doc 17 B.6 (B.6f process, B.6g two shapes)
- Complex cases that drove this — Doc 26
