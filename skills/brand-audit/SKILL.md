---
name: brand-audit
description: Run the brand and competitive audit an art director does before designing an identity, and write a visual landscape audit of a sector. It builds a panel (direct and indirect competitors, category leaders, aspirational brands from outside the sector), visits their sites, measures their real colours and typefaces, collects logos, codes every brand on a fixed vocabulary (logo type, symbol, colour, typography, imagery, layout, headline), counts the sector's dominant codes, separates the codes a brand must keep to be understood from the clichés it can break, maps saturated and open visual territories, and proposes differentiation opportunities with their evidence. Two modes, flash (about ten minutes) and deep (about forty). Use this skill whenever someone asks for a brand audit, a competitive audit, a visual audit, a visual landscape, a competitor benchmark of logos or identities, the visual codes or clichés of a sector, where the white space is, how to stand out visually in a category, un audit de marque, un audit concurrentiel, un benchmark visuel, les codes graphiques d'un secteur, une cartographie des concurrents, des opportunités de différenciation. Also use it before brand-kit when there is time, and before a rebrand. Do not use it for positioning, messaging, pricing or SEO comparisons (that is a competitive brief), and do not use it to design the brand itself (that is brand-kit).
---

# Audit a visual landscape

Produce `brand/audit/`: the evidence an art director pins on the wall before drawing anything, and the conclusions drawn from it.

```
brand/audit/
├── audit.json       the single source: panel, measures, codes, counts, classifications, opportunities
├── AUDIT.md         for agents: short, numbered, every rule with its count and its evidence
├── landscape.html   for people: the board
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
| Time | about 10 minutes (measured once: 10 brands, two scouts, two coders) | about 40 minutes (estimate, not yet measured) |
| Panel | 8 direct, 3 indirect, 2 aspirational | 10 to 12 direct, 4 to 6 indirect, 3 to 4 leaders, 5 to 8 aspirational |
| Questions to the user | none if the context is enough | 2 at most, then one panel review |
| Capture | the whole home page, 2 inner pages, the App Store listing | the same |
| Library sample | Logosystem, one industry | Logosystem, Mobbin, and Logoinspo for references |
| Coding | one pass | judgment fields coded twice, disagreements settled |
| Synthesis | counts, classifications as hypotheses, 2 opportunities | map, 3 to 5 opportunities, counter-check, recent rebrands |
| Subagents | 3 scouts, 3 coders | about fifteen, in parallel |

Both capture each brand the same way; the difference is how many brands, how carefully they are coded, and how hard the conclusions are attacked.

Both write the same files in the same schema. A flash audit is deepened later, never redone: set `meta.mode` to `"deep"`, add the missing brands to the panel, and `capture.mjs` captures only those. From then on `check.mjs` asks for the counter-check on every opportunity.

Pick the mode before anything else. If the user or the calling skill named one, use it. If the user is about to start a `brand-kit` session and wants to move, it is flash. Otherwise ask once with `AskUserQuestion`, giving the time each costs.

## Before you start

- Paths below are relative to this skill's directory for scripts (`assets/…`) and to the project for outputs (`brand/audit/`). Write `AUDIT=brand/audit` once and reuse it.
- If `brand/audit/audit.json` exists, this is a resume: read it, say what is there, and continue from the first step that is incomplete. A deep run on a flash audit keeps the panel and adds to it.
- The scripts need Node 22 and Playwright with Chromium. If `node assets/capture.mjs --help` fails on the import, run `npm i playwright && npx playwright install chromium`.
- Subagents make this fast. If you have no subagent tool, run the same steps in series and say so in `limits`.

## The six steps

### 1 · Frame (0 to 2 questions)

You need four things: what the product does in one sentence, who buys it, in which market (country and language), and what people use today instead. In a repository, read it first. If a `brand/` kit or a README answers, do not ask.

Ask only what is missing, one question per turn. The fourth one matters more than it looks: the thing people use instead (paper, a spreadsheet, a free tool from a giant) is an indirect competitor and often the source of the most recognisable open territory.

If a brand already exists (a rebrand, or `brand/tokens.json` is there), it joins the panel with the role `self`.

Write `audit.json` with `meta` and `framing` now. `references/panel.md` has the skeleton.

### 2 · Build the panel

**Read `references/panel.md`.** Dispatch one scout per role, in parallel. Each returns brands with a URL, a reason for being there and a confidence. You merge, deduplicate, cut to the counts of the mode, and set `established` on every direct and leader brand: the exception test in step 6 depends on it.

Aspirational brands are never chosen by taste. Each one needs a sentence that says which of two things it is: it serves the same audience in another category, or it has solved the same tension. A brand you cannot justify that way is decoration and comes out.

**Deep only: show the panel to the user and take one round of corrections.** It is the only stop in the skill. People know competitors a search does not find, and a wrong panel poisons every count that follows. In flash, state the panel in one line and keep going.

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

**Read `references/codebook.md`.** Dispatch coders, four or five brands each. A coder gets the screenshots, the measures and the codebook, looks, and returns one JSON object of codes per brand. Merge with:

```bash
node assets/code.mjs $AUDIT codes-1.json codes-2.json
```

It refuses any value outside the vocabulary and names it. Fix and re-run rather than loosening the vocabulary; `other:<text>` exists for what truly does not fit, and a recurring `other:` is a finding in itself, a code proper to this sector.

Then build the walls and **look at them yourself**:

```bash
node assets/sheets.mjs $AUDIT
```

`evidence/sheets/logos.webp`, `heroes.webp`, `apps.webp` (icons and first store screenshots), `palettes.webp`, `type.webp`. A convention is only visible side by side, and this is the moment the audit stops being a table. Note what strikes you before you read any count.

### 6 · Synthesise

```bash
node assets/aggregate.mjs $AUDIT
```

It prints the counts, the conventions, who breaks each one and whether that brand is established, and a map. **Read `references/synthesis.md`** and then do the part no script does:

1. **Classify every convention** as a legibility code, a cliché or a risky break, with the exception test, a reason and the captures that show it. Add by hand the patterns no single value catches (`manual: true`, see the reference): they are often the real findings.
2. **Read the map.** Name its axes in plain words, say which quadrant is saturated and which is empty, and check each empty one: unexplored, or tried and abandoned.
3. **Write the opportunities.** Each keeps the legibility codes, names the clichés it breaks, says what it borrows from which aspirational brand, and carries a risk.
4. **Deep only: have each opportunity attacked.** A sceptic subagent searches for the brand that already occupies it. What falls is removed; what holds records what was searched.

Then write the two readers' files and pass the gate:

```bash
node assets/aggregate.mjs $AUDIT     # again, after classifying, to refresh counts
node assets/render.mjs $AUDIT --inline     # --inline also writes landscape.single.html, one file to send
cp assets/AUDIT.example.md $AUDIT/AUDIT.md    # then rewrite every line
node assets/check.mjs $AUDIT
```

`AUDIT.example.md` is the quality bar: numbered rules, each with its count and an `evidence/…` path, under 120 lines, in English because agents read it. `check.mjs` fails when a claim has no evidence, a convention is unclassified, or a deep opportunity was not challenged. **An audit that fails the gate does not go out.**

## Showing it

Open `landscape.html` and look at it at desktop and phone width before the user does. Then put it in front of them by the first of these that works: serve `brand/audit/` and open it in the browser pane, or send the file. It links its images from `evidence/`, so it is the folder that travels. To send it to someone, send `landscape.single.html`, which embeds them.

Tell the user, in this order and in their language:

1. what to keep, in one sentence;
2. what to break, in one sentence;
3. the strongest open territory, and its risk;
4. what the audit does not cover.

Do not read the whole board back. They have it.

## Be honest about what it is

- A flash audit is thirteen brands coded once. Write its classifications as hypotheses, and say so in `limits`.
- The panel is a sample chosen by a search, not a census. In deep the sceptic's searches are the defence against a competitor nobody found; in flash there is none.
- A capture is one day. Date it. Sites change, and a category can move in a year.
- "Nobody does this" is the weakest sentence in the audit. It means nobody in the panel does it. Write it that way.

## Third-party material

Screenshots and logos of other companies are working material for internal reference. Do not deploy `landscape.html` publicly. Before committing `brand/audit/evidence/`, check whether the repository is public; if it is, tell the user and let them decide.

## Language

Two readers, two languages.

- **`audit.json` prose and `landscape.html`: the user's language.** Set `meta.locale` to it. Every sentence a person will read on the board comes from `audit.json`: the framing, each brand's `why`, the reasons, the map reading, the opportunities, the limits. Write them in the user's language, and tell the scouts to write `why` and `established.reason` in it. The board's own labels and the vocabulary values follow `meta.locale` (French and English ship with `render.mjs`); logo types keep their English names, as designers say them.
- **`AUDIT.md`: English**, whatever the conversation language, for the same reason `brand-kit` writes `BRAND.md` in English: agents read it. It is written separately, so nothing is lost.

Coded values stay in the vocabulary, in English, always. They are data.

## With brand-kit

`brand-kit` reads `brand/audit/AUDIT.md` when it exists: the framing saves its first questions, section 5 gives it a named competitor for the swap test and a category duel for the tournament, and the clichés seed the "Not" list. This skill never starts `brand-kit`; say that the audit is ready for it and stop.

## Files in this skill

- `references/panel.md`: the roles, the counts per mode, `established`, the aspirational rule, the scout prompt, the `audit.json` skeleton
- `references/capture.md`: what is captured and measured, how to read the notes, the fallback chain for blocked sites
- `references/codebook.md`: the closed vocabulary, one line per value, the tie-break rules, the coder prompt, double coding
- `references/synthesis.md`: thresholds, the exception test, reading the map, the opportunity form, the sceptic prompt, what goes into `AUDIT.md`
- `references/sources.md`: Logosystem, Logoinspo, Mobbin: what to take from each, their bias, the low-volume rule
- `assets/capture.mjs`: visits each brand, screenshots it, measures colours, typefaces and shapes, saves the logo
- `assets/library.mjs`: samples one Logosystem industry with its tags
- `assets/code.mjs`: merges coder output into `audit.json`, refuses values outside the vocabulary, tracks disagreements
- `assets/sheets.mjs`: builds the contact sheets
- `assets/aggregate.mjs`: counts, convention candidates, map axes
- `assets/render.mjs` and `assets/landscape.template.html`: the board
- `assets/check.mjs`: the gate
- `assets/audit.example.json`, `assets/AUDIT.example.md`: a worked example at the expected depth, on a fictional sector
- `assets/lib/`: colour, schema and browser helpers
- `tests/`: `node --test tests/*.test.mjs`
