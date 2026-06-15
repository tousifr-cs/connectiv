# ProConnectiv — Positioning Brief

**Author:** Hermes (strategy session with founder)
**Date:** June 11, 2026
**Status:** Draft v1 — needs your sign-off before code work
**Scope:** The spine, the vocabulary, the home page hero, and the rename map.
**Out of scope:** Logo design, dispute policy doc, video-call recording gate (those are separate work items B and C).

---

## 1. The Spine (one paragraph, the thing you tell yourself)

> ProConnectiv is a community where users meet experts on video — for free conversations, paid 1:1 expert sessions, or both. Members join to grow their network. Experts join to share what they know, build reputation, and earn from paid sessions. The platform holds trust: identity is verified, payments are escrowed, and disputes are decided on recorded evidence.

If you forget everything else in this doc, remember that paragraph. Every page, every button label, every onboarding email should be testable against it: "does this sentence reinforce the spine?"

---

## 2. The Vocabulary

You said you didn't know what to call the expert. We landed on **Expert** for everyone who helps — paid or free. One word, one role, no "Member" distinction. The visitor who posts a job and the person who answers are both Experts. The platform just helps them find each other.

| Concept | Word | Why |
|---|---|---|
| Person who helps (any context) | **Expert** | Signals skill + value, neutral on industry, doesn't borrow Upwork's "pro" (which we tried and which felt off) |
| A posted request for help | **Job** | You already use this in the codebase (`PostJob`, `Jobs.tsx`, `JobDetail.tsx`). Plain, clear, already shipping. |
| A response to a job | **Proposal** | Already in the schema (`jobProposals`). Standard freelance vocabulary. |
| A paid 1:1 video session | **Expert session** (or just "session" in context) | "Paid call" felt transactional, "consultation" felt stiff |
| A free 1:1 video session | **Conversation** | Warmer than "free call," matches the community feel |
| The platform's promise | **Find an expert · talk on video · pay only if it works** | The why-pay line is a strong promise but might over-promise on dispute outcomes — soften if you don't want to commit to a satisfaction guarantee |

**Words we are killing:**

- "Creator" — drop from user-facing copy. It's a 2024 word, implies influencer/parasocial, doesn't fit the new framing. (The DB column `creators` can stay aliased to `pros` for now, but new copy never uses it.)
- "Pro" — drop from user-facing copy. You tried it. It felt off. It's also Upwork's word, which is a confusion tax we don't need to pay.
- "Member" — drop. You said one word for "person who helps." That word is Expert.
- "Booking" — internal only. To users it's a "session" or "conversation."

**Words to introduce carefully:**

- "Verified" — keep, it's the trust signal. But be specific: "identity verified" beats just "verified" alone.
- "Escrow" — keep, but only show it to people who have money on the line. Don't lead with it on the home page.

---

## 3. The Home Page — Three Hero Variants

Pick one, or remix. These are written for the new spine. The existing Home.tsx has the structure already; we're only rewriting the hero block and the FAQ strings.

### Variant A — "Two doors" (community + expert)

**Eyebrow:** For professionals who'd rather talk than tweet
**Headline:** **Real conversations with real experts.** Free to start. Worth paying for when it counts.
**Subhead:** Browse 800+ verified professionals, drop into a free community conversation, or book a paid 1:1 — your call.
**Primary CTA:** Browse experts
**Secondary CTA:** Join a free conversation
**Trust line:** Free to join · Paid sessions are escrow-protected · No subscription

**Why it works:** Honors both paid and free, names the two doors clearly, doesn't privilege one. The "real conversations with real experts" line is a quiet dig at AI/wrong-number scams.

### Variant B — "The network you can hear" (community-first)

**Eyebrow:** Professional networking, on video
**Headline:** **The professional network where you can actually hear each other.**
**Subhead:** Free conversations with people in your field. Paid 1:1s with experts when you need deeper help. Your network, with faces.
**Primary CTA:** Find your first conversation
**Secondary CTA:** See all experts
**Trust line:** Identity verified · Sessions over WebRTC · No bot calls

**Why it works:** Strong differentiator vs LinkedIn (text) and Twitter (broadcast). Puts community ahead of paid, which matches your intent. The "with faces" line is the hook — the absence of faces is exactly the modern complaint.

### Variant C — "Upwork but with people" (expert-first)

**Eyebrow:** Verified experts · 1:1 video · No bots
**Headline:** **Hire an expert. Talk to them on video. Pay only if it lands.**
**Subhead:** Browse verified experts, book a 15, 30, or 60 minute session, and pay through escrow. Disputes are decided on the call recording.
**Primary CTA:** Browse experts
**Secondary CTA:** Become an expert
**Trust line:** Identity verified · Escrow on every paid session · Dispute resolution on the record

**Why it works:** Closest to the current Home page in spirit. Cleaner, more confident. The "Pay only if it lands" is a strong promise but might over-promise on dispute outcomes — soften to "Pay through escrow" if you don't want to commit to a satisfaction guarantee.

**My recommendation: Variant B** for launch, with the "free conversations" door prominent and "expert sessions" as the deeper engagement. It matches your intent ("free + paid, community professional networking") and gives you the most differentiation. Variant A is the safe backup. Variant C is the closest to what you have — useful only if B tests worse.

---

## 4. FAQ — New Wording (drops into Home.tsx FAQ section)

```
Q: What's the difference between an expert and a member?
A: Anyone can join ProConnectiv as a member and start free
   conversations. To run paid 1:1 sessions, you apply to become
   an expert — we verify your identity and review your profile
   before you can be booked.

Q: How much does it cost to join?
A: Joining ProConnectiv is free. Free conversations are free.
   Paid expert sessions are priced by each expert, typically
   between $30 and $300 for a 30-minute session.

Q: How are paid sessions protected?
A: Your payment is held in escrow when you book. The expert
   is paid after the session is completed. If something goes
   wrong, you can open a dispute within 48 hours and our team
   will review the call recording and any evidence you submit.

Q: Are calls recorded?
A: No. Calls are not recorded by default. If a dispute is
   opened on a paid call, the platform may request the audio
   transcript and any clips either side submits as evidence.
   Free conversations are never recorded.

Q: How long are the sessions?
A: Paid expert sessions are 15, 30, or 60 minutes — you pick
   when you book. Free conversations can be as long as both
   sides want.
```

---

## 5. The Rename Map (codebase)

**Goal:** User-facing copy says "expert" and "member." Internal/DB stays mostly on "pro" for now, because renaming the database is a migration and a risk we don't need to take pre-launch. We're only renaming things users see.

### Tier 1 — must do (user-visible copy)

These are the strings the visitor reads. Renaming them is pure copy work, low risk.

| Current | New | Files |
|---|---|---|
| "Browse pros" | "Browse experts" | `Navbar.tsx`, `Home.tsx`, `Pros.tsx` |
| "Pro" (in user copy) | "Expert" | All `pages/*.tsx` and `components/*.tsx` |
| "Pros" (in user copy) | "Experts" | All `pages/*.tsx` and `components/*.tsx` |
| "Become a Pro" | "Become an expert" | `BecomePro.tsx`, `Navbar.tsx` |
| "Pro" in nav | "Experts" | `Navbar.tsx` |
| "Creator" anywhere in user copy | "Expert" | `Home.tsx`, `Pros.tsx`, `Request.tsx`, `VideoCall.tsx` |
| "Booking" in user copy | "Session" (paid) / "Conversation" (free) | `MyBookings.tsx`, `Dashboard*.tsx`, `BookingPayment.tsx` |
| "Creator" in `README.md` | "Expert" | `README.md` |

### Tier 2 — should do (component and route names)

Renames files and import paths. Medium risk. Cursor is the right tool for this.

| Current | New | Notes |
|---|---|---|
| `pages/Pros.tsx` | `pages/Experts.tsx` | |
| `pages/ProProfile.tsx` | `pages/ExpertProfile.tsx` | |
| `pages/BecomePro.tsx` | `pages/BecomeExpert.tsx` | |
| `pages/ProLocal.tsx` | `pages/ForExperts.tsx` | |
| `components/ProCard.tsx` | `components/ExpertCard.tsx` | |
| `hooks/use-pros.ts` | `hooks/use-experts.ts` | |
| Route `/pros` | `/experts` | Add `/pros` as a 301 redirect |
| Route `/pro/:id` | `/expert/:id` | Add `/pro/:id` as a 301 redirect |
| Route `/become-pro` | `/become-expert` | Add `/become-pro` as a redirect |
| Route `/for-pros` | `/for-experts` | Add `/for-pros` as a redirect |

### Tier 3 — optional, can wait (DB schema and API)

These are real renames. They take a migration. They break things. We can ship without doing them.

| Current | New | Why we can wait |
|---|---|---|
| `pros` table | `experts` | Existing alias `creators = pros` shows the pattern. The DB name doesn't show to users. |
| `creators` aliases in `shared/schema.ts` | Drop aliases | Cleanup, not user-facing |
| `Booking` API type | `Session` | Internal only, no user impact |
| `/api/creators` | `/api/experts` | Add `/api/creators` as a redirect if you care about old clients |

**Total estimated rename work:**

- Tier 1 (copy): ~30-60 minutes in Cursor with a careful find-and-replace pass. I'll do it for you if you want.
- Tier 2 (files + routes): ~1-2 hours in Cursor. Mostly mechanical.
- Tier 3 (DB): half a day minimum, plus a migration file. Defer to v1.1.

### Tier 0 — folder name (the one that haunts you)

The folder is `Creator-Showcase 3`. Two options:

1. **Rename the folder.** `git mv "Creator-Showcase 3" proconnectiv` from one level up. Free, fixes the AI's name recognition, fixes the JetBrains/Cursor cache names. Do this first.
2. **Leave the folder, fix the `name` in `package.json`.** `name: "proconnectiv"`. The folder name is cosmetic; the package name is what npm and tools use.

I recommend both. Folder name is what your OS shows. Package name is what your tools show.

---

## 6. The Logo Decision (deferred to a separate work item)

The current monogram (D/C/P interlocked) reads as "luxury fashion house," not "modern tech platform for professionals." That's a real mismatch with the new spine. Three options:

| Option | Cost | Time | Quality |
|---|---|---|---|
| Fiverr designer with brief + 3 references | $30-100 | 2-3 days | High |
| AI generation (ideogram/recraft/midjourney) → pick or refine | $0-30 | 1 hour generation, 1 day decision | Medium-high |
| Keep current and accept the mismatch | $0 | 0 | It's fine, but it doesn't help the spine |

**Recommendation:** Option 2 first, Option 1 to refine the chosen one. Total: under $200, 2-3 days, you get a logo that actually matches "verified professional community." This is the only piece I think is worth doing OUTSIDE the codebase.

---

## 7. What I'm NOT recommending (and why)

- **Don't rename the DB schema yet.** It's a real migration. You don't have the test coverage or the user base to justify the risk pre-launch. Aliases are fine.
- **Don't add "free calls" as a billing concept.** Free means free. No timer, no credits, no daily limits in v1. Add limits only when abuse forces it.
- **Don't change the dark + neon-green theme.** It's distinctive, it works for the technical/professional audience, and it's already 80% of the way to "modern." Change logo and copy first, theme last.
- **Don't add a mobile app yet.** Mobile web is fine. The video call is WebRTC which works in mobile browsers. An app is a 3-month project you don't need.

---

## 8. Decision Points (what I need from you)

Before I do any code work, I need answers on these:

1. **Spine (Section 1):** Is this the right paragraph? Edit it until it sounds like you.
2. **Vocabulary (Section 2):** Are you comfortable with "Expert" and "Member"? If not, what?
3. **Hero variant (Section 3):** A, B, or C? Or a remix?
4. **Rename Tier 1 only, or 1 + 2?** My recommendation: do both, in one Cursor pass.
5. **Folder rename (Section 5, Tier 0):** Yes/no?
6. **Logo (Section 6):** Want me to brief a designer, or do AI generation, or leave it?

Once you answer, the next steps are:

- If you pick B (or a remix) for the hero: I rewrite `Home.tsx` hero + FAQ.
- If you say "do tier 1 and 2 renames": I generate a precise patch list and either apply it or hand to Cursor.
- If you say "fix the logo": I write a designer brief OR an AI prompt set, your call.

---

## 9. What I would do if I were you (in order)

1. Edit Section 1's spine paragraph until it sounds like you talk. Don't move on until it does.
2. Pick a hero variant. Read it out loud. If it doesn't sound like something you'd say to a friend, change it.
3. Say yes to tier 1 and 2 renames. Hand to Cursor as one batch. ~2 hours.
4. Rename the folder.
5. Get a new logo. Outside the codebase. ~2 days.
6. Replace logo, swap home hero, ship to 10-20 people you trust.
7. Watch what they click. Talk to 3 of them. Iterate.

Launch is a few days of focused work, not weeks. The hard parts of the product (WebRTC, escrow, dispute flow, schema) are already built. The easy parts (copy, names, logo) are what's left.
