# Skelly — Security, Trust & Infrastructure
### A plain-English guide (no coding knowledge needed)

**Who this is for:** you (the founder) — and one day, your customers. It explains, in everyday language, how Skelly is built, how we keep it safe, and how businesses can trust it with their most sensitive information. Wherever there's a technical word, it's explained simply.

**Last updated:** 2026-07-06

---

## Part 1 — How Skelly is built (think of a bank building)

The easiest way to picture the software is as a **secure bank building**. It has a few distinct areas, each with one job:

**1. The front desk — the screens you and your users see.**
This is the part people actually click on: the tables, buttons, charts, and forms. Importantly, the front desk is "polite but not trusted with decisions." It shows information and takes requests, but it doesn't decide anything important on its own. (In tech terms this is the *frontend*.)

**2. The back office — where the real work and rules live.**
Behind the front desk is where all the actual business logic happens: the calculations, the pricing rules, who's allowed to do what. This is the brain of Skelly. We deliberately keep the brain *separate* from the front desk, so the important rules can never be tampered with by messing about with the screens. (This is the *backend*.)

**3. The vault — where all the information is stored.**
Every piece of data — every bid, cost, price, user — is kept in a highly secure, organised store. Think of it as the bank vault. (This is the *database*, and we use a very well-established, trusted one called PostgreSQL.)

**4. The security desk — checks everyone at the door.**
Nobody gets past the front desk without proving who they are, and every request is checked against what that person is allowed to do. (This is *authentication* — proving who you are — and *authorisation* — what you're allowed to do.)

**Where the building physically sits:** rather than buying and running our own servers (like owning and maintaining the whole building yourself, including the boiler and the plumbing), we **rent space in a professionally-run, highly-secure data centre** run by a major provider (e.g. Amazon). They employ hundreds of specialists to keep the building standing, powered, and protected. We focus on Skelly; they handle the bricks and mortar. (This is *managed cloud infrastructure*.)

**The one golden rule of the whole design:** the important rules and calculations live in the back office (the brain), never on the front desk (the screens). This is what keeps Skelly consistent, trustworthy, and hard to trick.

---

## Part 2 — How we keep it secure

Security in Skelly isn't one lock. It's **many layers**, so that if one ever fails, others still protect the data. Here are the layers, in plain terms:

**Each client is in their own locked apartment.**
This is the most important one for a business tool. Imagine an apartment building where every company that uses Skelly has its own private, locked apartment. No company can ever get into another's — *even by accident*. We enforce this in two independent places at once: in the software's rules, **and** in the vault itself, which is built to physically refuse to hand over one company's data to another. Two locks on the same door. (Tech terms: *multi-tenancy* with *row-level security*.)

**A strong front door, plus a second lock.**
To get in, a user must prove who they are, and we support a second check (like a code on your phone) for extra safety. We also let big companies use their own existing company login (the same one they use for email), which their IT teams trust. (This is *single sign-on* and *multi-factor authentication*.)

**We don't keep the keys to your house.**
Skelly does **not** store users' passwords itself. We hand that job to a specialist company whose entire business is doing it safely. That means even in a worst case, there are no passwords sitting in our systems to steal. (This is *delegated authentication* — we chose a provider called WorkOS.)

**Different staff get different keys.**
Not everyone can do everything. Each person only gets access to what their role needs — no more. A junior user can't reach admin controls. (This is *role-based access* and *least privilege*.)

**Everything is sealed, both in transit and in storage.**
When information travels between your screen and Skelly, it's scrambled so nobody in between can read it — like sending a sealed, coded letter instead of a postcard. And when it sits in the vault, it's scrambled there too. Only Skelly, with the right key, can unscramble it. (This is *encryption in transit and at rest*.)

**A permanent, tamper-proof logbook.**
Every important action — who changed a price, who accessed what — is written into a logbook that **can't be edited or erased**. If anyone ever needs to ask "what happened here?", there's a complete, honest record. This is both a security tool and something enterprise clients love to see. (This is an *audit log*.)

**The secret keys are never left lying around.**
The passwords and keys the software itself needs are kept in a special locked cabinet, never written into the code where someone could find them. (This is *secrets management*.)

**Regular automatic safety inspections.**
Every time we make a change, automated tools scan the code for known weaknesses and out-of-date parts *before* it can go live — like a safety inspection that a change must pass before it's allowed into the building. (These are *security scans* in our *pipeline*.)

---

## Part 2b — What about hackers and outside attackers?

Part 2 was mostly about keeping *clients* separated. This part is about keeping *strangers* out — burglars trying to break into the bank from outside. Here are the ways they try, and how we stop each one, in plain terms:

**They try to steal or guess logins (the most common attack by far).**
In real life, most break-ins aren't clever code-breaking — they're stolen or guessed passwords. So we defend that directly: a second lock (a code on your phone), a **limit on how many login attempts** anyone can make (so they can't try millions of guesses), and — crucially — **we don't store passwords ourselves**; a specialist company handles logins and actively watches for suspicious sign-ins (like a login from a strange country). (Tech terms: *multi-factor authentication*, *rate limiting*, *delegated authentication*.)

**They try to trick the software with sneaky input.**
A classic attack is typing something malicious into a form to try to fool the system into misbehaving. We defend this by **inspecting everything that comes in** and only handling it with safe, well-proven methods — never risky shortcuts. Remember the golden rule: the front desk can't make decisions, so even a trick request gets checked by the back office before anything happens. (Tech terms: *input validation*, protection against *injection attacks*.)

**They try to listen in on the conversation.**
When data travels between your screen and Skelly, an attacker might try to intercept it. Because it's sent as a sealed, coded message rather than a readable one, what they'd grab is useless scrambled text. (This is *encryption in transit*.)

**They look for weak or out-of-date parts.**
Software is built partly from many ready-made components, and attackers hunt for known weaknesses in old versions of them. We run **automatic scans that constantly check every part for known weaknesses and flag anything out of date**, so we can fix it fast — and the data-centre provider automatically patches the underlying building. (Tech terms: *dependency scanning*, *patching*.)

**They try to flood us to knock Skelly offline.**
One attack just overwhelms a system with fake traffic until it collapses. Because we sit inside a major provider's data centre, that provider **absorbs and filters these floods** with defences far bigger than any attacker — the same shields that protect the world's largest websites. (Tech term: *DDoS protection*.)

**Someone on the inside, or an honest mistake.**
Not every risk is an outsider. So everyone only has the minimum access they need, and the **tamper-proof logbook** records every action — so mistakes and misuse are both limited and traceable. (Tech terms: *least privilege*, *audit logging*.)

**Professionals watching 24/7.**
The data centre we sit in has round-the-clock security teams, threat-detection systems, firewalls, and physical guards on the actual buildings. We benefit from all of it without having to build it ourselves.

**We hire ethical hackers to attack us on purpose.**
Before Skelly ever holds a real client's live data, we bring in an outside security firm to *try to break in deliberately* and report every weakness they find, so we fix it first. (This is a *penetration test*.)

**The honest bottom line on hackers:** most real-world breaches come from stolen passwords, phishing emails, and out-of-date software — and we specifically target all three. We can't make Skelly impossible to attack (no one can), but we make it *hard*, we watch for trouble constantly, and we're set up to detect and respond quickly. That's exactly how the serious, trusted software your clients already use is protected.

---

## Part 3 — How we keep it reliable (safe *and* dependable)

Secure means "hard to break into." Reliable means "it keeps working and never loses your data or gives wrong answers." Both matter for trust. Here's how we get reliability:

**Automatic backups, with a rewind button.**
The vault is copied automatically and constantly. If anything ever went wrong, we can rewind to how things were at a specific moment. A backup we've never tested is just a rumour, so we test that the rewind actually works. (This is *backups and point-in-time recovery*.)

**The maths is checked, automatically, every time.**
Because Skelly produces financial numbers people bet real contracts on, we build automatic checks that prove the calculations are correct — and they re-run every single time we change anything. If a change would ever make a number wrong, the system blocks it before it can reach your users. (This is *automated testing*, and it's non-negotiable for financial software.)

**Nothing goes live without passing all the checks.**
Every change has to pass every safety and correctness check before it's allowed into the real product. No exceptions, no shortcuts. (This is *continuous integration*.)

**Alarms that tell us before customers notice.**
We watch Skelly constantly, and if something starts going wrong, we're alerted immediately — ideally before any user even notices. (This is *monitoring and alerting*.)

**No black boxes.**
Every number Skelly shows can be traced back to exactly what produced it — the inputs, the formula, the version. A client can always ask "why is this figure £2.3m?" and get a clear answer. For a financial product, this transparency is one of the biggest trust-builders there is.

---

## Part 4 — How your clients will *know* they can trust it

Good engineering (Parts 2 and 3) gets us genuinely secure and reliable. But big enterprise customers won't just take our word for it — and they shouldn't have to. Trust is also **proven by outsiders**. Here's the roadmap:

**Built to the recognised standards from day one.**
We're constructing Skelly to the security standards professionals expect (industry frameworks like OWASP, and the control areas behind a certification called **SOC 2**). This matters because it means that when a client later asks "are you certified?", getting certified is mostly paperwork and an audit — not tearing the building down and rebuilding it.

**An independent expert inspects it before we handle real client data.**
Before Skelly ever holds a real customer's live financial information, I'd recommend we bring in an outside security firm to try to break in on purpose (a *penetration test*) and review everything. This turns "we believe it's secure" into "an independent expert confirmed it is." It's a normal, healthy step.

**Formal certifications as we grow.**
As we start selling to larger organisations, we pursue formal certifications (**SOC 2**, and later possibly **ISO 27001**). These are essentially a trusted third party auditing us and issuing a stamp of approval that enterprise buyers recognise. This is often what unlocks the biggest deals.

---

## Part 5 — The honest truth about security

You deserve straight talk, not false comfort:

- **No software on earth is 100% unbreakable.** Anyone who promises that is lying. The real goal is to make Skelly *enterprise-grade* — as safe as the tools big banks and serious companies already trust — and to be able to respond fast and honestly if anything ever does go wrong.
- **Security is never "finished."** It's an ongoing discipline: kept up every week, reviewed regularly, and improved as threats change. We designed it in from the very first day (rather than bolting it on later), which is the single biggest thing in our favour.
- **Some of it is about people and habits, not just code.** Careful engineering, regular reviews, and good practices matter as much as any single feature. Our way of working already builds a security review into every feature we make.

---

## What this means for you (the short version)

You do **not** need to become a security expert. Here's your honest situation:

Skelly is being built, from day one, the way trustworthy enterprise software is supposed to be built: your clients' data kept strictly separate and encrypted, strong logins handled by specialists, a tamper-proof record of everything, automatic backups, automatically-checked calculations, and professionally-run infrastructure. When the time comes to sell to big clients, we get an independent security review and, later, formal certifications so they have outside proof — not just our word.

It will be genuinely secure and reliable. Keeping it that way is an ongoing job, and protecting it is part of my role as your CTO — I'll flag, every single time, any place where moving faster would put that trust at risk.
