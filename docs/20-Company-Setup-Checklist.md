# 20 — Company Setup Checklist (foundational digital accounts)

> **Purpose:** a plain, ordered checklist to set up Skelly's foundational company accounts correctly from day one — so nothing is scattered across personal emails and everything is owned by the company and secured. Operational (not platform architecture).
> **Golden rule:** create **every** account under the **company email**, save every credential in the **password manager**, and turn on **2FA** everywhere.
> **Last updated:** 2026-07-06
>
> **Progress so far:** Domain = **skelly.ai** ✅. GitHub Org = **sk3llyai** ✅. First repo = **sk3llyai/skelly** (private, monorepo) — recommended settings: Private, README on, .gitignore = Node, no license (proprietary = all rights reserved).

---

## Do these in order — each unlocks the next

### Step 0 — (Parallel, optional) The legal company itself
Incorporating a legal entity (Ltd / LLC) is a **separate legal + accounting step**, not a software account — and not required to start building. You'll want it before taking real customers or money. Flag it to a lawyer/accountant. The accounts below can be created now and transferred to the entity later. *(Outside my CTO remit — just making sure it's on your radar.)*

### Step 1 — Company name + domain  (~15 min · ~£10–40/yr)
The domain is the anchor everything else hangs off.
- [ ] Decide the name (Skelly?) and check domain availability.
- [ ] Prefer **.com**; good alternatives **.ai / .io / .co**.
- [ ] Buy it via a clean registrar — **Cloudflare Registrar** (at-cost, no upsells) or Namecheap.
- [ ] Turn on **auto-renew**, **WHOIS privacy**, and **2FA** on the registrar account.
- **Decision needed:** the exact domain.

### Step 2 — Company email  (~30 min · ~£5–6/user/month)
- [ ] Sign up for **Google Workspace** using your domain.
- [ ] **Verify the domain** (add the DNS record it gives you at your registrar — Workspace walks you through it).
- [ ] Create your founder mailbox (e.g. `raoul@yourdomain`) + a couple of aliases (`hello@`, `admin@`).
- [ ] Enable **2FA** on the Google account.
- **Decision needed:** **Google Workspace** (default) vs **Microsoft 365** (pick this if you lean Microsoft/Azure later — remember the cloud discussion) vs **Zoho Mail** (cheapest). Recommend Google Workspace.

### Step 3 — Password manager + 2FA discipline  (~20 min · ~£3–8/month)
Do this **before** creating more accounts so every credential lands in one safe place.
- [ ] Create a **1Password** account with your new company email.
- [ ] Store the domain + email credentials in it.
- [ ] Save all **2FA recovery codes** in 1Password too (losing these is a common disaster).
- **Rule from here on:** new account → company email → credential in 1Password → 2FA on.

### Step 4 — GitHub Organization  (~20 min · free to start)
- [ ] Sign up to / sign in to **GitHub** with your company email.
- [ ] Create a **new Organization** (not just a personal account) — Free tier is fine. This makes the code company-owned, not personal.
- [ ] Enable **2FA**, and in org settings **require 2FA** for all members.
- [ ] Create the first **private repository** — this will hold the code **and** `skelly-docs`.

### Step 5 — Hygiene / record-keeping  (~10 min)
- [ ] Keep a simple record (in 1Password) of: registrar, email admin, GitHub org, billing card, recovery emails.
- [ ] Use the **company email** as the recovery/owner on every account — never personal Gmail.
- [ ] You now have a shared **Google Drive** (with Workspace) for company docs if you want one.

---

## Deliberately DEFER (create later, when we build, under the company email)
Cloud (**AWS**), **WorkOS** (auth), **Sentry** (errors), monitoring, and other service accounts. No need — and no cost — until the relevant piece gets built.

## Rough total
~1.5 hours of setup; ~£15–25/month ongoing (email + password manager) + the domain once a year. GitHub free to start.

## Next (I can help)
Once the GitHub org + repo exist, I can **scaffold the repository structure** (a clean monorepo skeleton per the architecture) and a starter **README**, and place `skelly-docs` inside it so the project has a proper home from the first commit.
