# Brand kit skills

Four Claude Code skills that follow an art director's process: understand the company, look at its market, turn a 25-minute conversation into a brand universe, and keep it true afterwards.

- **`brand-brief`** comes first: the discovery interview, and the brand brief. Optional, and the two skills after it read the brief when it is there.
- **`brand-audit`** looks at the market: the competitive and visual audit an art director runs before designing. Optional, and `brand-kit` reads it when it is there.
- **`brand-kit`** — runs the session and writes the kit.
- **`brand-kit-update`** — keeps the kit honest, versions the brand, and turns every agent mistake into a rule.

## The brief

`brand-brief` answers one question: what must this brand say, to whom, and what must it never become. It is the conversation an art director has with a founder before any talk of aesthetics, built on one observation: people cannot describe the brand they want, and can say in a second what they like and what they refuse.

1. **Context.** It reads the project first, then asks only what is missing: short questions, mostly closed, whose options are hypotheses written for this project and anchored in brands the founder knows.
2. **Reference landscape.** Scouts gather about fifteen real brands in four circles (direct competitors, adjacent categories, analogous industries, aspirational brands), plus every brand the founder names. A script fetches one clean image of each: consent banners closed, blocked and broken pages set aside.
3. **Positioning.** Three or four territories in plain words: the closest, the one that goes, what is kept from a second.
4. **Visual discovery.** Clickable boards. Swipe a brand (speaks to me; I like it, not for us; not at all; I don't know it), duel two, then tick what you keep or what bothers you. Votes come back to the agent without anything to type.
5. **Refinement.** Each answer changes the next question: the skill keeps, per dimension, an orientation, a confidence and its evidence, and goes where it matters most and is known least.
6. **Synthesis.** Read back in plain words, corrected, validated.

```
brand/brief/
├── brief.json       the single source: answers, verbatim, provenance, references, votes
├── BRIEF.md         the brief for the next agent, generated from brief.json
├── brief.html       the brief for people, with the three walls of references
├── rounds/          the visual rounds shown, and their votes
└── evidence/        one image per reference
```

Every line of the brief says where it comes from: read in the project, stated, chosen on a board, inferred, or assumed. A gate refuses a brief with a value that has no instance, a wallpaper word in its summary, a conclusion drawn from one signal, or no refusal at all.

What it needs: Node 22 or later, web search, and Playwright with Chromium to capture pages (`node skills/brand-brief/assets/fetch.mjs --check`). No API key. The Mobbin connector is optional. `node --test skills/brand-brief/tests/*.test.mjs` runs its tests.

What to know before using it:

- **It is the founder's account.** No customer is interviewed, and it says so.
- **The references show taste, not the market.** The market is the audit.
- **It fixes no colour, typeface or logo.** It records intentions, taste and refusals for the skills that follow.
- **The board works two ways.** Served locally, the votes reach the agent on the last click. Sent as one file (a cloud session), it ends on a short code to paste back.

## The audit

`brand-audit` answers one question: which codes make a brand understood by its market, and which can be broken to stand apart from it. It does the work an art director does before drawing anything, and keeps three things apart all the way through: what was **measured** on the rendered page, what was **observed** on a capture, and what was **judged** from them.

1. **Panel.** Direct competitors, indirect ones (what people use today instead), category leaders, and aspirational brands from outside the sector, which you validate.
2. **Capture.** A headless browser visits every brand: the whole home page, inner pages, the largest pictures the site publishes, the App Store listing, the logo. It measures the real colours and typefaces.
3. **Coding.** Subagents look at the captures and code each brand on a closed vocabulary (the seven logo types, symbol, colour, type, imagery, layout, headline), so that what they saw can be counted.
4. **Analysis.** Counts, then six written analyses (logos, architecture, colour, typography, signs, visual language), a moodboard and a profile per brand, positioning maps, and every dominant code classified: functional requirement, category signal, cliché, owned by a competitor, emerging, or risky break.
5. **Creative synthesis.** A thesis and its central tension, a decision matrix, two to four creative territories each with about ten real, sourced reference images, and the criteria to judge a concept.

```
brand/audit/
├── audit.json       the single source: panel, measures, codes, counts, sections, synthesis
├── AUDIT.md         the creative brief for the next agent, generated from audit.json
├── landscape.html   the report for people: fourteen sections, black and white
└── evidence/        screenshots, logos, contact sheets, territory moodboards
```

Two modes write the same files: **flash** (about twenty minutes, 13 brands, classifications as hypotheses) and **deep** (about fifty, a larger panel, double coding, and a counter-check on every opportunity). Flash has been run end to end; deep has been exercised less.

What it needs: Node 22 or later and Playwright with Chromium (`npm i playwright && npx playwright install chromium` in your project; `node skills/brand-audit/assets/capture.mjs --check` verifies it), web search, and ideally subagents. No API key. The Mobbin connector is optional. `node --test skills/brand-audit/tests/*.test.mjs` runs its tests.

What to know before using it:

- **The audit reads captures.** It does not measure how people perceive a brand, whether a sign is legally available, or whether a territory sells. It says so, and lists what to validate with people.
- **A panel is a sample chosen by a search**, not a census, and a capture is one day.
- **Other companies' logos and screenshots are working material for internal reference.** The report is not meant to be published, and the skill warns before captures are committed to a public repository.
- **It visits sites as a person would**: a few pages per brand, once, with a headless browser. A site that refuses the visit is recorded as such and left out of the counts; the skill then looks at what the brand publishes elsewhere (its store listing, its press kit) and does not try to defeat the block.

## What it produces

```
brand/
├── BRAND.md        agents read this, always — numbered, checkable rules
├── tokens.json     every value, written once, with its rule beside it
├── theme.css       every token as a CSS variable, generated
├── CHANGELOG.md
├── assets/         logo, photography, illustration
└── site/           the brand guidelines site, rendered in the brand it documents
```

`site/` is a brand guidelines website in the shape of [brand.klarna.com](https://brand.klarna.com): a manifesto home, **Our brand**, **How we speak**, **How we look** — logo, art direction, colour, typography, layout, photography, iconography, illustration, motion — **In use** and a **Toolkit**. It is a small Next.js app that builds to a static folder. Pages carry prose; every swatch, specimen, icon, scale and token table is rendered from `tokens.json` at build, so the site cannot drift from the brand it describes.

## Why it is built this way

Almost nobody can describe the brand they want. Asked what it should feel like, people say "modern, clean, trustworthy" — true of every competitor, and it instructs nothing. Shown two options, the same person chooses decisively and explains why.

So the skill shows rather than asks, asks about consequences rather than mechanisms, and never asks a question it could answer itself with reasonable confidence. The user makes about twelve decisions; the skill makes the other hundred and fifty. `references/axes.md` is the translation layer between the two.

## Install

Clone the repo, then symlink the skills into `~/.claude/skills` so edits here are live everywhere:

```bash
ln -s "$PWD/skills/brand-brief" ~/.claude/skills/brand-brief
ln -s "$PWD/skills/brand-audit" ~/.claude/skills/brand-audit
ln -s "$PWD/skills/brand-kit" ~/.claude/skills/brand-kit
ln -s "$PWD/skills/brand-kit-update" ~/.claude/skills/brand-kit-update
```

## Try it

The worked example — Perch, a fictional hotel-operations company — as a running site:

```bash
D=$(mktemp -d)/brand && mkdir -p $D && A=skills/brand-kit/assets
cp $A/tokens.example.json $D/tokens.json && cp -R $A/example-assets $D/assets && cp -R $A/site $D/site
cd $D/site && npm install && npm run dev
```

The boards the session shows, served from `skills/brand-kit/assets` (`python3 -m http.server`), since they run scripts:
- `skills/brand-kit/assets/duel.html` — the tournament board: two real screenshots side by side, a site name under each, and nothing else.
- `skills/brand-kit/assets/type-systems.html` — twenty free type systems setting the same words, each shown twice: once as a headline and once as the 13px product row. Licence, payload and honest half-life on every card.
- `skills/brand-kit/assets/illustration-styles.html` — the same scene drawn seven ways, for choosing an illustration language. "None" is the eighth card, with the same weight as the other seven.
- `skills/brand-kit/assets/photo-styles.html` — one scene re-shot seven ways (documentary, lifestyle, portrait, colour studio, cinematic, flash, still life), plus none. `assets/imagery.py board --scene "…"` re-shoots it on a brand's own moment.
- `skills/brand-kit/assets/icon-styles.html` — twelve concepts in seven icon languages, at 30px and at 16px beside a word.
- `skills/brand-kit/assets/motion-styles.html` — the same card arriving six ways, for choosing a motion temperament.
