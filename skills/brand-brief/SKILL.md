---
name: brand-brief
description: Run the discovery an art director does before any design work, and write the brand brief. Interviews the founder or the people in charge of the brand with short, mostly closed questions, and alternates them with clickable boards where they judge real brands by swiping, duelling and picking what they keep or reject. Covers the product and its reason to exist, audiences, positioning, ambition, values, personality, the emotions to provoke, taste, references and aversions, constraints and where the logo will have to live. Adapts each question to the answers before it. Writes one source, a generated brief for agents and a report for people. Use it for a brand brief, brand discovery, a discovery workshop, a kick-off of an identity or rebrand project, "help me define my brand", "I don't know what I want my brand to look like", brief de marque, découverte de marque, atelier de marque, cadrage d'identité, and as the first step before brand-audit and brand-kit. Not for auditing competitors (brand-audit) and not for designing the identity (brand-kit).
---

# Run a brand discovery and write the brief

Produce `brand/brief/`: what an art director knows about a company before drawing anything.

```
brand/brief/
├── brief.json         the single source: answers, verbatim, provenance, references, votes, dimensions
├── BRIEF.md           for agents: generated from brief.json
├── brief.html         for people: the brief the founder reads, corrects and passes on
├── rounds/            the visual rounds that were shown, and their votes
└── evidence/          one image per reference
```

The brief answers one question:

> **What must this brand say, to whom, and what must it never become?**

It records intentions and taste. It fixes no colour, no typeface and no logo: that is `brand-kit`, after `brand-audit` has looked at the market.

## Why this skill is built the way it is

Almost nobody can describe the brand they want. Asked, people say "modern, simple, trustworthy", which is true of every competitor and instructs nothing. Shown a real brand, the same person says "not that" in one second, and can say why. So:

- **Recognition over recall.** People react to things; they do not generate descriptions. Show, then ask.
- **Business before aesthetics.** No image is shown before the product, the buyer and the alternative are understood. Otherwise the founder judges pictures with nothing to judge them against.
- **Each answer changes the next question.** This is an interview, not a form. `brief.json` holds what is understood and how well; the next exercise goes where it matters most and is known least.
- **Nothing is concluded from one signal.** A liked brand is a hypothesis about why. The attribute they keep, a second exercise, or their own words turn it into a finding.
- **Their taste is not their audience's need.** Both are recorded, apart. When they collide, say so and let them arbitrate.

## The five rules

**1. Never ask for the abstraction. Ask for the instance.** "What are your values?" returns integrity and innovation from everyone. "Tell me about the last time you turned down money" returns a value. Values, personality and emotions are derived from stories and choices, never asked for by name.

**2. Close the question with hypotheses written for this project.** Not "who is your audience?" but three candidate answers you wrote from what you read, plus "something else". A wrong hypothesis corrected is better data than an open question answered. Never a list of generic categories.

**3. Anchor an option in something they know.** Not "reassuring or stimulating?" but "they leave you the way they leave a good pharmacist, or the way they leave a climbing gym?". A known brand, a place, a moment. `references/interview.md` has the method.

**4. Never name what a board tests**, during or after. The user should finish a round believing they looked at brands, not that they filled in a personality test. The scripts strip the objective from the page; do not put it back in a title.

**5. One question per turn, and never two spoken turns in a row without something to look at.**

## Before you start

- Paths: scripts are relative to this skill (`assets/…`), outputs to the project (`brand/brief/`). Write `BRIEF=brand/brief` once.
- **If `brand/brief/brief.json` exists, this is a resume.** Read it, say in two lines what is understood and what is open, and continue from the weakest important point. Never restart, and never ask again what it holds.
- Scripts need Node 22 or later. Capturing a page needs Playwright with Chromium: `node assets/fetch.mjs --check`; if it is missing, `npm i playwright && npx playwright install chromium`. Without it, only direct pictures can be fetched: say so, and lean on Mobbin and press images.
- You need web search, a way to read images, and ideally subagents for the scouts. `AskUserQuestion` is used where it exists; otherwise ask in plain text with lettered options.
- Keep a scratch file for **verbatim**: their exact words, never paraphrased. Their sentences are the only proprietary material in the room.

## The session

Fifteen to twenty-five minutes of the user's attention. Six phases; they are landmarks, not a tunnel. Skip what is already known, go back when a board contradicts something said.

| | Phase | Form | What it settles |
|---|---|---|---|
| 1 | Context | read first, then 2 to 4 questions | product, reason to exist, what is used instead, difference |
| 2 | Reference landscape | scouts, in the background | the pool of real brands to react to |
| 3 | Positioning | 3 or 4 territories, in chat | the direction, what is kept from a second, what is killed |
| 4 | Visual discovery | rounds on the board | taste, aversions, and the reasons |
| 5 | Refinement | short rounds and closed questions | the dimensions that matter and are still unclear; tensions and their limits |
| 6 | Synthesis | read back, correct, validate | the brief |

Constraints and logo contexts are two closed questions; ask them whenever the user needs a rest from judging, and before phase 6 at the latest.

### 1 · Context

**Read before asking.** README, docs, the site, a deck, an existing brief, `brand/audit/AUDIT.md` if there is one. Open with what you understood and have them correct it. A reformulation to validate beats a question:

> "Si je lis bien : tu ne fais pas un logiciel de gestion de plus pour les kinés, tu veux qu'ils aient le sentiment de reprendre la main sur leur cabinet. C'est juste ?"

Then only what is missing, one per turn. **Read `references/interview.md`** for the questions, the follow-ups, and how to refuse a generic answer. Write `brief.json` now, with `meta`, `context` and each field's `source`, and keep writing it after every answer: that is what makes the session resumable.

### 2 · Reference landscape

As soon as you know what the product is, who buys it and in which market, **read `references/references.md`** and dispatch the scouts, in the background, while the interview goes on. Four circles: direct competitors, adjacent categories, analogous industries, aspirational brands. Add every brand the founder names. Then:

```bash
node assets/fetch.mjs $BRIEF
```

It downloads or captures one image per reference, closes consent banners, marks blocked and broken pages, and writes contact sheets. **Look at every contact sheet before any round.** A capture that shows a cookie banner, a region picker, a maintenance page, a loading state or a hero where the brand cannot be read makes the user judge something other than the brand. Reject it (`--reject id "why"`), give the reference a better `image_url` or `shot_url`, and fetch again. This look is not optional and no script does it for you.

### 3 · Positioning

Before any logo, write three or four **territories** for this project in plain words: a name and one sentence each, distinct and all credible. Ask which is closest, which one goes at once, and what they would keep from a second. Mixing, none, and rewording are all allowed. `references/interview.md` has the form and an example.

### 4 and 5 · Rounds on the board

**Read `references/exercises.md`.** A round is a small JSON file: a few swipe cards and a few duels, each with the attributes you want to offer afterwards. The same page serves every exercise.

Show it by the first of these that works:

1. **Local server, browser pane.** Run `node assets/board.mjs serve $BRIEF r1` in the background and open the address it prints. When the user clicks Done the command exits and prints the votes: you are woken with them, and the user types nothing.
2. **One file.** `node assets/board.mjs build $BRIEF r1` writes `rounds/r1.html` with the images inside. Send it (`SendUserFile` with `display: "render"`, or an artifact). It ends on a short code; when the user pastes it, `node assets/board.mjs decode $BRIEF r1 "<code>"`.
3. **Chat.** Show the images, number them, and take the answers in words. Record them in the same shape.

All three write `rounds/r1.votes.json` and merge it into `brief.json`. In a cloud session there is no local server the user can reach: go straight to 2.

After each round, **run the loop**:

1. Read the votes and the attributes. Note the reason they gave, not the reason you expected.
2. Update the dimensions in `brief.json`: orientation, confidence, evidence, boundary, contradictions.
3. Say one thing back in plain words, with a free undo, when a reading is worth checking. Never a list of axes.
4. Choose what comes next by four things: how much the point matters, how unsure you are, whether two signals contradict, and what it costs the user. A closed question in chat is cheaper than a round; a round is cheaper than a paragraph to write.
5. Stop when the exit rules are met (`references/exercises.md`). Document what is left open; do not prolong the session to close it.

Two or three rounds are usual. Past four, the session is collecting, not learning.

### 6 · Synthesis

Read the brief back **in plain words, four or five sentences, with a free undo**, and require one correction:

> "Si je résume : […]. Qu'est-ce qui est faux là-dedans, ou trop gentil ?"

Then write the rest of `brief.json`. **Read `references/brief.md`** for the schema and what each part must contain. The parts that are yours alone: the summary, the tensions written as "X without being Y" with the sign that the limit is crossed, the principles, the evaluation criteria, the open questions, and the two hand-off blocks.

```bash
node assets/brief.mjs $BRIEF            # writes BRIEF.md from the data; never edit it by hand
node assets/render.mjs $BRIEF --inline  # brief.html, and brief.single.html to send
node assets/check.mjs $BRIEF            # the gate
```

`check.mjs` fails when a section is empty without a stated reason, there is not exactly one primary audience, a value has no instance, a trait is a bare adjective, nothing was refused, a wallpaper word sums the brand up, a statement cites an interaction that does not exist, a dimension is "high" on one signal, an assumption is not an open question, a verdict rests on an image that was never shown, no logo context is critical, or `BRIEF.md` differs from what the data generates. **A brief that fails the gate does not go out.**

Set `meta.status` to `validated` only when the user has confirmed the read-back. If they stop early, write what you have with `provisional`: the outputs say so.

## Showing it

Open `brief.html` and look at it at desktop and phone width before the user does. Then put it in front of them: serve `brand/brief/` and open it in the browser pane, or send `brief.single.html`.

Tell the user, in their language and in this order:

1. the brand in one sentence;
2. the one tension that will decide most design choices;
3. what was refused, in their words;
4. what is still open, and who has to answer it.

Do not read the brief back. They have it.

## Be honest about what it is

- Everything comes from the founder. It is self-report: optimistic, and too broad on audience. No customer was asked. Say so in `limits`.
- The references are a small sample chosen to provoke reactions. They show taste, not the market. The market is `brand-audit`.
- A confidence level is your judgement on the evidence, not a measurement. Never show it as a percentage.
- **Never invent**: a reference nobody can open, a quote, a reason to believe, a value with no instance. An empty field with its reason is information; a plausible filled one is a lie the founder will repeat for a year.
- **Never simulate a capability.** If images cannot be fetched or no board can be shown, say it, ask the user for references, and run a comparison in words that is labelled as limited.

## Third-party material

Screenshots and images of other companies are working material for internal reference. Do not deploy `brief.html` publicly. Before committing `brand/brief/evidence/` or a `rounds/*.html`, check whether the repository is public; if it is, tell the user and let them decide. Never generate a fake identity for an existing brand.

## Language

Converse in the user's language. `brief.html` follows it (`meta.locale`: French and English labels ship with `render.mjs` and the board), because the founder is the one who reads and validates it. `BRIEF.md` is in English whatever the session language, for the same reason `AUDIT.md` and `BRAND.md` are: agents read it. Write the prose of `brief.json` in the session language, and keep quotes exactly as spoken. Coded values (`source`, `verdict`, `circle`, `level`, `confidence`) stay in English: they are data.

## With the other skills

- **`brand-audit`** reads `brand/brief/BRIEF.md` when it exists: its framing comes from the brief, and the section "For brand-audit" gives it the competitors and admired brands the founder named, and hypotheses to check on captures.
- **`brand-kit`** reads it too: it does not ask again who the product is for, spends its duels on what the brief left open, and seeds its "Not" list from the refusals.
- This skill never starts another one. Say that the brief is ready, what would come next, and stop.

## Files in this skill

- `references/interview.md`: the questions per subject, closing a question with hypotheses, anchoring in known brands, territories, refusing a generic answer, telling a real answer from a polite one, the read-back
- `references/references.md`: the four circles, the reference card, the scout prompt, where images come from, what makes an image usable, looking at the contact sheet
- `references/exercises.md`: sorting, duels, attribute extraction, anti-brand, boundary testing, the round file, composing a round, reading votes, the dimensions, the exit rules
- `references/brief.md`: the schema of `brief.json`, provenance, what each section must contain, the outputs, the gate, the test of a good brief
- `assets/board.html`, `assets/board.mjs`: the clickable board; serve, build, decode
- `assets/fetch.mjs`: one image per reference, consent banners closed, blocked pages marked, contact sheets
- `assets/brief.mjs`: generates `BRIEF.md`
- `assets/render.mjs`: generates `brief.html`
- `assets/check.mjs`: the gate
- `assets/brief.example.json`, `assets/BRIEF.example.md`: a worked example at the expected depth, on a fictional company
- `assets/lib/`: the vocabularies, the vote format, the browser helper
- `tests/`: `node --test tests/*.test.mjs`
