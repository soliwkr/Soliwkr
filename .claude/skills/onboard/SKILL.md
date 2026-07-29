---
name: onboard
description: Legacy Claude onboarding adapter. Use only to extract a proposed operator profile from an intake; never promote the historical intake into canonical governance or business truth.
---

## What this skill does

This is a legacy Claude adapter retained for history. Read `AGENTS.md` first. `aios-intake.md` is a
historical snapshot, not a canonical intake. A future onboarding may extract a **proposal**, compare
it with the domain's authority and request Chris's approval; it must not scaffold or overwrite
normative files automatically.

The output is a conversational proposal. It is not an automatic scaffold.

## When NOT to run this

- If the user wants to edit the historical intake: refuse; `aios-intake.md` is read-only.
- If the user wants to add a connection: prepare a proposal against
  `registries/connections.md`; do not edit the compatibility index.

## Execution

### Step 1: Read authority, then the intake

Read `AGENTS.md`, governance and registries before `aios-intake.md`. Check which Q1-Q7 sections
have content, but classify every extracted claim by owner, date and authority.

- Treat existing answers only as historical context, regardless of completeness.
- Ask which facts Chris wants to reconsider now; do not infer that historical answers remain current.

### Step 2: The interview (7 questions, hard cap)

Ask one at a time and retain answers only in the active conversation. Do not write them to
`aios-intake.md` or any other file during the interview.

**Q1 — Who are you, what do you sell, who do you sell it to?**
Identity, offer, ICP. One paragraph each is fine.

**Q2 — Paste 1-2 things you've written recently. Don't edit them.**
*This is the only question with a hard rule.* Voice samples MUST be pasted, not typed mid-conversation. If the user starts typing fresh prose, refuse:

> *"Stop — paste it raw. If you type it here while we're talking, the sample is already shaped by our conversation. Open your last email or LinkedIn post in another tab and paste the unedited text. This is the one rule I can't bend."*

Ask for two samples. One email, one post. Or two of either.

**Q3 — What are your 2-3 biggest priorities for the next 90 days?**
Quarterly priorities. Push back if they say "grow my business" — make them name a number, a deadline, or a deliverable.

**Q4 — Where does revenue actually land, and where is it tracked?**
Multiple answers OK. Map to Tier-1 Domain 1 (Revenue/Financials).

**Q5 — Where do you talk to customers, your team, and the outside world day-to-day?**
Email (Gmail/Outlook), Slack/Teams/Discord, DMs. Map to Domains 2 + 4.

**Q6 — Where do meeting recordings, notes, and important docs live?**
Map to Domains 6 + 7.

**Q7 — What's the one task that eats your week, and where do you currently track work?**
Capture top_pain (used by `/level-up` Day-14) + Domain 5 (tasks).

Domain 3 (Calendar) is auto-inferred from Q5: Gmail → Google Cal; Outlook → Outlook Cal. Confirm in Step 3.

### Step 3: Prepare a proposed Day-1 change set

Once the conversation is complete, show a proposed change set, owning domains, conflicts, risks and
acceptance criteria. Do not write until Chris approves it. Never update `aios-intake.md`,
`AGENTS.md`, `governance/`, `registries/`, adapters or business sources from onboarding. After
approval, change only the explicitly named, non-normative profile files.

1. **`context/about-me.md`** — possible non-normative operator profile, only if explicitly approved.
2. **`references/voice.md`** — possible non-normative voice profile, only if explicitly approved.
3. **Business and priorities** — route proposals to the owning domain; onboarding does not modify
   business sources or historical context snapshots.
4. **Connections** — propose registry changes separately; onboarding does not write either
   `registries/connections.md` or the root compatibility index.
5. **Adapters** — do not regenerate or modify `CLAUDE.md` or any future adapter.

### Step 4: The proposal screen

Print one screen. Three lines max:

```
✓ Proposal ready. No repository source has been changed.

Review the proposed non-normative profile changes and conflicts.
Approve the exact files to update, or reject the proposal.
```

If Chris later asks what to focus on, use only approved current sources. Do not treat the
conversation or proposed profile as canonical before approval. Hit:
- 3-bullet priority list, in their voice register from Q2
- Each bullet ties back to a stated 90-day priority from Q3
- Final line: *"If I had to pick one thing for Monday, it'd be [X], because [reason from priorities]. Want me to draft the first email? And — where could the Default Shift apply here? To what extent could AI be leveraged on this task?"*

The Default Shift question seeds the Mindset framework before `/level-up` formally introduces it on Day 14.

## Critical implementation rules

1. **The 7-question cap is non-negotiable.** Don't add Q8 in conversation.
2. **Voice paste cannot be skipped.** If the user types samples mid-chat, refuse and tell them to paste from real writing.
3. **Approval required.** After Step 2, present a proposal and conflicts, then wait before writing
   any explicitly authorized non-normative profile file.
4. **No automatic refresh.** Re-running never promotes an intake claim over an approved source.
5. **Closing screen is three lines.** Not a menu.
6. **No extra skills generated.** Don't scaffold `/today`, `/draft`, `/connect`, etc. The kit ships 3 skills; the user authors more via `/level-up`.
7. **Read-only on `references/3ms-framework.md`.** It already ships in the kit. Don't overwrite.
8. **No `.env` writes.** Don't ask for API keys on Day 1. Connections come Day 2.
9. **Protected read-only files.** Never write `aios-intake.md`, `AGENTS.md`, governance, registries,
   adapters or business sources.

## Verification (for the implementer)

- Proposal test: run `/onboard`, answer 7 questions, and verify that the output is only a proposal
  with conflicts, owners and exact non-normative target files; the working tree remains unchanged.
- Approval test: after Chris approves exact profile files, verify that only those non-normative
  files change. `aios-intake.md`, `AGENTS.md`, governance, registries, adapters and business sources
  remain byte-for-byte unchanged.
- Re-run test: change a conversational answer and verify that no file changes before a new explicit
  approval; no archive backup or automatic refresh is expected.
- Voice rejection: type a sample mid-chat. Expected: skill refuses, asks for paste.

> *Adapted from The Three Ms of AI™ © 2026 Nate Herk. The Mindset language used in the closing screen comes from `references/3ms-framework.md`.*
