---
name: brand-audit
description: Run the brand and competitive audit an art director does before designing an identity, and write a visual landscape audit of a sector. It builds a panel (direct and indirect competitors, category leaders, aspirational brands from outside the sector), visits their sites, measures their real colours and typefaces, collects logos, codes every brand on a fixed vocabulary (logo type, symbol, colour, typography, imagery, layout, headline), counts the sector's dominant codes, separates what a brand must keep to be understood from the clichés it can break, maps saturated and open visual territories, and ends with a creative synthesis: a decision matrix, two to four creative territories each with a sourced moodboard, and a brief for the designer or agent who comes next. It writes a black and white report for people and a generated brief for agents. Two modes, flash (about twenty minutes) and deep (about fifty). Use this skill whenever someone asks for a brand audit, a competitive audit, a visual audit, a visual landscape, a competitor benchmark of logos or identities, creative territories or moodboards grounded in a competitor study, the visual codes or clichés of a sector, where the white space is, how to stand out visually in a category, un audit de marque, un audit concurrentiel, un benchmark visuel, les codes graphiques d'un secteur, une cartographie des concurrents, des opportunités de différenciation. Also use it before brand-kit when there is time, and before a rebrand. Do not use it for positioning, messaging, pricing or SEO comparisons (that is a competitive brief), and do not use it to design the brand itself (that is brand-kit).
---

# Audit a visual landscape

Produce `brand/audit/`: the evidence an art director pins on the wall before drawing anything, and the conclusions drawn from it.

```
brand/audit/
├── audit.json       the single source: panel, measures, codes, counts, sections, classifications, synthesis
├── AUDIT.md         for agents: the creative brief, generated from audit.json
├── landscape.html   for people: the report, fourteen sections, black and white
└── evidence/        screenshots, logos, contact sheets, one folder per brand
```

The audit answers one question, and everything else serves it:

> **Which codes make a brand understood by this market, and which ones can be broken to stand apart from it?**

## Why this skill is built the way it is

A model asked to describe a sector's visual codes answers from memory, and memory returns the sector's received ideas: health is blue, fintech is green, running is neon on black. That is the opposite of an audit. So three kinds of statement are kept apart, and every line of the output carries one of these labels:

- **measured**: read from the rendered page by a script. Colours, typefaces, sizes.
- **observed**: coded by looking at a capture, on a closed vocabulary, so that it can be counted.
- **judged**: a conclusion. Always written with the count and the capture it rests on.

Nothing is asserted that is not in `evidence/`. If you catch yourself writing a claim about a brand you have not captured, stop and capture it or delete the claim.

The scripts do the mechanical work so that your attention goes where it is needed: looking, and judging.

## Two modes

| | Flash | Deep |
|---|---|---|
| Time | about 20 minutes | about 50 minutes (estimate: this mode has been exercised less) |
| Panel | 8 direct, 3 indirect, 2 aspirational | 10 to 12 direct, 4 to 6 indirect, 3 to 4 leaders, 5 to 8 aspirational |
| Questions to the user | framing if the context lacks it, then the aspirational brands | 2 at most, then one panel review, aspirational brands included |
| Capture | the whole home page, 2 inner pages, the App Store listing | the same |
| Library sample | Logosystem, one industry | Logosystem, Mobbin, and Logoinspo for references |
| Coding | one pass | judgment fields coded twice, disagreements settled |
| Conclusions | counts, classifications as hypotheses, 2 or 3 opportunities | maps, 3 to 5 opportunities, counter-check, recent rebrands |
| Writing | 3 section writers, 2 profile writers | one writer per section, profile writers |
| Creative synthesis | thesis, decisions, 2 to 4 territories, one moodboard scout each | the same, plus an independent critique pass |
| Subagents | about 14 | about 30, in parallel |

Both capture each brand the same way; the difference is how many brands, how carefully they are coded, and how hard the conclusions are attacked.

Both write the same files in the same schema. A flash audit is deepened later, never redone: set `meta.mode` to `"deep"`, add the missing brands to the panel, and `capture.mjs` captures only those. From then on `check.mjs` asks for the counter-check on every opportunity.

Pick the mode before anything else. If the user or the calling skill named one, use it. If the user is about to start a `brand-kit` session and wants to move, it is flash. Otherwise ask once with `AskUserQuestion`, giving the time each costs.

## Before you start

- Paths below are relative to this skill's directory for scripts (`assets/…`) and to the project for outputs (`brand/audit/`). Write `AUDIT=brand/audit` once and reuse it.
- If `brand/audit/audit.json` exists, this is a resume: read it, say what is there, and continue from the first step that is incomplete. A deep run on a flash audit keeps the panel and adds to it.
- The scripts need Node 22 or later and Playwright with Chromium, and nothing else: no API key, no other dependency. If `node assets/capture.mjs --help` fails on the import, run `npm i playwright && npx playwright install chromium`.
- You need web search, a way to read images, and ideally subagents. Mobbin is optional. `AskUserQuestion` is used where it exists; otherwise ask in plain text.
- Subagents make this fast. If you have no subagent tool, run the same steps in series and say so in `limits`.

## The eight steps

### 1 · Frame (0 to 2 questions)

You need four things: what the product does in one sentence, who buys it, in which market (country and language), and what people use today instead. In a repository, read it first. If a `brand/` kit or a README answers, do not ask.

Ask only what is missing, one question per turn. The fourth one matters more than it looks: the thing people use instead (paper, a spreadsheet, a free tool from a giant) is an indirect competitor and often the source of the most recognisable open territory.

If a brand already exists (a rebrand, or `brand/tokens.json` is there), it joins the panel with the role `self`.

Write `audit.json` with `meta` and `framing` now. `references/panel.md` has the skeleton.

### 2 · Build the panel

**Read `references/panel.md`.** Dispatch one scout per role, in parallel. Each returns brands with a URL, a reason for being there and a confidence. You merge, deduplicate, cut to the counts of the mode, and set `established` on every direct and leader brand: the exception test in step 6 depends on it.

Aspirational brands are never chosen by taste. Each one needs a sentence that says which of two things it is: it serves the same audience in another category, or it has solved the same tension, and a second that says who in the audience recognises it and how we know. At least one brand per criterion. A brand you cannot justify that way is decoration and comes out.

**Both modes: have the user validate the aspirational brands.** They decide what the opportunities borrow from, so they move the recommendations more than any other choice, and the user knows what their audience reads where a search does not. Show the candidates with their criterion and recognition, and take one round of keep, drop, add.

**Deep only: show the rest of the panel too, in the same turn.** People know competitors a search does not find, and a wrong panel poisons every count that follows. In flash, state the direct and indirect brands in one line and keep going.

### 3 · Capture

```bash
node assets/capture.mjs $AUDIT
```

One home page's first screen is a thin sample of a brand, so every brand is captured in depth, in both modes: the first screen, the whole home page as an overview and as readable tiles, the mobile view, up to two inner pages (`extra_urls`: a product or features page, a pricing page), and the App Store listing when `app_store_term` is set (icon, first screenshots, the description). For an app, the store listing and the product screens are most of what people ever see of the brand.

**Read `references/capture.md`** for what is measured and for the fallback chain. A site that answers with a bot challenge comes back `partial`: keep the brand, get a capture another way, and leave it out of the colour and type counts. Then look at what came back. Open a few `desktop.webp` and every logo that looks wrong; a selector can pick a partner badge instead of the logo. To reject a captured logo, set the brand's `logo` to `null` in `audit.json`: the walls then fall back to its app icon.

### 4 · Widen with the libraries

```bash
node assets/library.mjs $AUDIT --industry <slug>
```

**Read `references/sources.md`.** The panel says what competitors do. A design library says what the sector looks like at its best, tagged by type, colour, style and subject. These samples are curated by designers, so they are reported apart and their counts are never added to the panel's.

### 5 · Code

**Read `references/codebook.md`.** Dispatch coders, four or five brands each. A coder gets the screenshots, the measures and the codebook, looks, and writes one JSON object of codes per brand to a file. Merge with:

```bash
node assets/code.mjs $AUDIT codes-1.json codes-2.json
```

It refuses any value outside the vocabulary and names it. Fix and re-run rather than loosening the vocabulary; `other:<text>` exists for what truly does not fit, and a recurring `other:` is a finding in itself, a code proper to this sector.

Then build the walls and **look at them yourself**:

```bash
node assets/sheets.mjs $AUDIT
```

`evidence/sheets/logos.webp`, `heroes.webp`, `apps.webp` (icons and first store screenshots), `palettes.webp`, `type.webp`. A convention is only visible side by side, and this is the moment the audit stops being a table. Note what strikes you before you read any count.

### 6 · Count, and write the six analyses

```bash
node assets/aggregate.mjs $AUDIT
```

It prints the counts, the conventions, who breaks each one and whether that brand is established, and two maps.

Counts are not an audit. **Read `references/report.md`** and dispatch the section writers: each looks at the walls for its part (signs, colour and type, the visual system) and writes an analysis with a lead, paragraphs, findings tied to evidence, and a takeaway for a designer. Three writers in flash, one per section in deep. Dispatch the profile writers at the same time: three sentences per brand, ending on what it teaches. Each writer saves a JSON file; merge them into `audit.json` under `sections` and on each brand's `profile`, and read all of it: you are the editor, and a count nobody can find on the wall goes back to its writer.

### 7 · Conclude

**Read `references/synthesis.md`.** This part is yours, not a subagent's, because it is where everything meets.

1. **Classify every convention**: a functional requirement, a category signal, a cliché, a code owned by a competitor, an emerging code or a risky break, with the exception test, a reason, a confidence and the captures that show it. Add by hand the patterns no single value catches (`manual: true`, with the population counted): they are often the real findings.
2. **Read the maps.** Name the axes in plain words, say which quadrant is saturated and which is empty, where the indirect brands sit, and check each empty one: unexplored, or tried and abandoned. Pick better axes with `--axes` when the automatic ones say little.
3. **Write the opportunities.** Each one states the observation it rests on, its link to the brief, the benefit, what it keeps and breaks, what it borrows from which brand, its risk, and what must be validated with people. An empty space in a small panel is an observation; that filling it has value is a hypothesis, and is written as one.
4. **Deep only: have each opportunity attacked.** A sceptic subagent searches for the brand that already occupies it. What falls is removed; what holds records what was searched.

### 8 · Synthesise for the designer

**Read `references/creative.md`.** The research says what the category looks like; this step says what it means for the brand to be designed, and hands it over.

1. **Implications**: a compact block at the end of each written section.
2. **Thesis, central tension, most consequential uncertainty.**
3. **The decision matrix**: per dimension, what is required, preferred, to explore, to deprioritise, to avoid, each citing finding IDs, with its trade-off and confidence. `required` is for real constraints only.
4. **Two to four creative territories.** Opportunities combine; territories are the alternatives. Each gives eight directions (personality, logo, symbolism, colour, typography, photography, graphic system, voice) as principles, never as hex values or font names, and says what it leaves open.
5. **A moodboard per territory**: about ten real, sourced images, each there for one mechanism. One scout per territory finds the references; then

```bash
node assets/aggregate.mjs $AUDIT     # refreshes counts and gives every finding its ID
node assets/moodboard.mjs $AUDIT     # fetches and assembles the moodboards
```

   Look at each one; replace what does not show its mechanism.
6. **References, evaluation criteria (gates apart from preferences), the block for brand-kit.**
7. **Write the summary last**, from the finished synthesis: a lead and five decisions, *preserve, avoid, challenge, explore, validate* (`references/report.md`).

Then generate the report and the brief, and pass the gate:

```bash
node assets/render.mjs $AUDIT --inline     # --inline also writes landscape.single.html, one file to send
node assets/brief.mjs $AUDIT               # writes AUDIT.md from the data; never edit it by hand
node assets/check.mjs $AUDIT
```

`check.mjs` fails when a claim has no evidence, a convention is unclassified, a section, its implications, the summary or a profile is missing, a decision cites a finding that does not exist, there are fewer than two or more than four territories, a moodboard has under six images, `AUDIT.md` differs from what the data generates, or a deep opportunity was not challenged. **An audit that fails the gate does not go out.**

## Showing it

Open `landscape.html` and look at it at desktop and phone width before the user does. Then put it in front of them by the first of these that works: serve `brand/audit/` and open it in the browser pane, or send the file. It links its images from `evidence/`, so it is the folder that travels. To send it to someone, send `landscape.single.html`, which embeds them.

Tell the user, in this order and in their language:

1. what to preserve, in one sentence;
2. what to avoid, in one sentence;
3. the strongest territory to explore, and its risk;
4. what has to be validated with people, and what the audit does not cover.

Do not read the whole report back. They have it.

## Be honest about what it is

- A flash audit is thirteen brands coded once. Write its classifications as hypotheses, and say so in `limits`.
- The panel is a sample chosen by a search, not a census. In deep the sceptic's searches are the defence against a competitor nobody found; in flash there is none.
- A capture is one day. Date it. Sites change, and a category can move in a year.
- "Nobody does this" is the weakest sentence in the audit. It means nobody in the panel does it. Write it that way.

## Third-party material

Screenshots and logos of other companies are working material for internal reference. Do not deploy `landscape.html` publicly. Before committing `brand/audit/evidence/`, check whether the repository is public; if it is, tell the user and let them decide.

## Language

**The report is in English by default**, whatever language the conversation is in: `landscape.html`, every sentence of `audit.json` a person will read (the framing, each brand's `why`, `established.reason` and `recognition`, the sections, the profiles, the reasons, the map readings, the opportunities, the summary, the limits), and `AUDIT.md`. Keep `meta.locale` at `"en"` and write the scouts', coders' and writers' prompts so that they answer in English.

Converse with the user in their own language. Only when the user asks for the report in another language, set `meta.locale` to it and have every writer write in it; French and English labels ship with `render.mjs`. `AUDIT.md` stays in English in every case: agents read it, for the same reason `brand-kit` writes `BRAND.md` in English.

Quotes from a site stay in the language they were written in: a French headline is quoted in French inside an English sentence.

Coded values stay in the vocabulary, in English, always. They are data.

## With brand-kit

`brand-kit` reads `brand/audit/AUDIT.md` when it exists: the brief saves its first questions, the section "For brand-kit" gives it a named competitor for the swap test, a category duel for the tournament and the seed of the "Not" list, and the territories are candidates the session can test. This skill never starts `brand-kit`; say that the audit is ready for it and stop.

## Files in this skill

- `references/panel.md`: the roles, the counts per mode, `established`, the aspirational rule, the scout prompt, the `audit.json` skeleton
- `references/capture.md`: what is captured and measured, how to read the notes, the fallback chain for blocked sites
- `references/codebook.md`: the closed vocabulary, one line per value, the tie-break rules, the coder prompt, double coding
- `references/report.md`: the fourteen sections, what a written section is, the writer and profile prompts, the summary in five decisions, the eight quality questions
- `references/creative.md`: the creative synthesis: implications, thesis, decision matrix, territories, moodboards and their scout prompt, references, evaluation, the generated brief, the critique list
- `references/synthesis.md`: thresholds, the exception test and the six classes, reading the maps, the opportunity form, the sceptic prompt
- `references/sources.md`: Logosystem, Logoinspo, Mobbin: what to take from each, their bias, the low-volume rule
- `assets/capture.mjs`: visits each brand, screenshots it, measures colours, typefaces and shapes, saves the logo
- `assets/library.mjs`: samples one Logosystem industry with its tags
- `assets/code.mjs`: merges coder output into `audit.json`, refuses values outside the vocabulary, tracks disagreements
- `assets/sheets.mjs`: builds the contact sheets
- `assets/aggregate.mjs`: counts, convention candidates, map axes
- `assets/render.mjs` and `assets/landscape.template.html`: the report, in black and white
- `assets/moodboard.mjs`: assembles each territory's moodboard from panel images, the Logosystem catalogue and web references
- `assets/brief.mjs`: generates `AUDIT.md`, the creative brief for the next agent
- `assets/check.mjs`: the gate
- `assets/audit.example.json`, `assets/AUDIT.example.md`: a worked example at the expected depth, on a fictional sector
- `assets/lib/`: colour, schema and browser helpers
- `tests/`: `node --test tests/*.test.mjs`
