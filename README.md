# Brand kit skills

Two Claude Code skills that turn a 25-minute conversation into a brand universe, and keep it true afterwards.

- **`brand-kit`** — runs the session and writes the kit.
- **`brand-kit-update`** — keeps the kit honest, versions the brand, and turns every agent mistake into a rule.

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

Clone the repo, then symlink both skills into `~/.claude/skills` so edits here are live everywhere:

```bash
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
