---
name: brand-kit-update
description: Keep an existing brand kit true, and extend it. Use this skill whenever a repository has a brand/ directory with tokens.json and BRAND.md (the brand, in the BRAND.md format) and something about the brand changes or needs adding - a colour, a typeface, a spacing or radius value, a voice or vocabulary rule, the positioning, the messaging, the logo, the photography direction, the icon set, the illustration style, the art direction, a component recipe, a new surface or a sub-brand. Also use it when an agent produced something off-brand and the rule that would have prevented it is missing, when the user asks to audit, refresh, review or version the brand, when a colour fails contrast in real product, when they want to add a page to the brand site, and when the site, theme.css, BRAND.md or DESIGN.md has fallen out of step with tokens.json or fails its linter, and when a kit's BRAND.md is still in the old numbered format and needs migrating to the BRAND.md format. If there is no brand/ directory, use brand-kit instead, including when the project only has a BRAND.md.
---

# Update a brand kit

A brand kit that nothing maintains is wrong within two months and nobody notices. This skill is how it stays true, and how it gets better.

## Quick kits

A kit whose `tokens.json` has `meta.mode: "quick"` came from the four-minute session of `brand-kit`: tokens, `BRAND.md`, `DESIGN.md` and `theme.css`, no site, version 0.x, most of it `assumed`. Update it like any kit - every step about `site/` simply does not apply. When the user wants the site, the imagery or the boards that were skipped, that is not an update: hand over to `brand-kit`, which resumes in normal mode from `brand/session.md`.

## The loop that matters

**The strongest signal that a rule needs to exist is that an agent broke it.**

When a session produces something off-brand, the fix is not to correct the output. It is to add one checkable rule to the section that governs it, in `BRAND.md` for the brand or `DESIGN.md` for the interface, and re-sync. The kit gets measurably better every time it fails, and `CHANGELOG.md` becomes a record of every way this brand has been misunderstood. That record compounds faster than the tokens do.

So when the user says "that's not very us", do not just fix the artefact. Ask what rule would have caught it, write that rule, and say you have.

## What is hand-edited, and what is generated

| File | Holds | Edited by |
|---|---|---|
| `tokens.json` | Every value, and the rule beside it | You |
| `BRAND.md` | The brand, in the BRAND.md format: prose, claims, `rules` and `visuals` in each section | You. The eight blocks between `<!-- @sync -->` markers: **`sync.py`** |
| `DESIGN.md` | The interface system, in the DESIGN.md format | You (the body). The front matter: **`sync.py`** |
| `CHANGELOG.md` | What changed, why, and the version | You |
| `site/app/**/page.mdx` | The brand site's prose — the story, the reasons, captions, do/don't sentences | You |
| `theme.css` | Every token as a CSS variable | **`sync.py`** |
| `site/` values | Every swatch, specimen, icon, scale and table | **The build**, from `tokens.json` |
| `brand.html` (kits made before the site) | The old one-page kit | **`sync.py`** |

The synced blocks are `personality`, `voice`, `messaging`, `vocabulary`, `logo`, `colors` (with `required` and `print`), `typography` and `motion`. Editing one by hand is undone at the next sync: change `tokens.json` instead. Everything outside the markers is yours, and `sync.py` never touches it. The `brand-kit` skill's `references/kit.md` says which token feeds which block and what each BRAND.md section holds; read it before your first edit of a kit.

The site reads `tokens.json` at build time, so values never live in its pages. Never type a hex, a size or a duration into an `.mdx` file or a component — it will silently disagree with the source within a week, and that is exactly how brands rot. Page *prose* is hand-edited; values are not. After a token change, rebuild the site (`cd brand/site && npm run build`) and look at the pages it touches.

Kits made before the site existed have a one-page `brand.html` that embeds a copy of `tokens.json`; `sync.py` still refreshes it. To move such a kit to the site, copy `site/` from the `brand-kit` skill's `assets/`, carry each page's prose into its `page.mdx`, and delete `brand.html` once the site builds — a minor version.

## Which change touches what

| The change | tokens.json | BRAND.md / DESIGN.md | site | Bump |
|---|---|---|---|---|
| A brand colour's value moves | ✅ `color.brand` + the palette | synced; reread the colour's sentence in words | rebuild | patch or major |
| A new semantic role | ✅ | DESIGN.md: a line under Colors if agents must use it | rebuild | minor |
| Contrast fix | ✅ | — | rebuild | patch |
| A typeface changes | ✅ `type.family` + `type.webfonts.href` | BRAND.md Typography prose; `license_verified` re-confirmed | rebuild, check every specimen | major |
| The web/app type pattern changes | ✅ `type.platform` | DESIGN.md Typography | rebuild | minor or major |
| A scale step or leading changes | ✅ | DESIGN.md only if a rule cites it | rebuild | patch or minor |
| A new word to use or avoid | ✅ `voice.vocabulary` | synced | rebuild (How we speak) | patch |
| A new voice rule or rewrite | ✅ `voice.examples` for a rewrite | a `rules` entry in Voice & Tone for anything else | rebuild (How we speak) | patch |
| Positioning or messaging changes | ✅ `messaging` | Positioning prose by hand; Messaging synced | Our brand prose, rebuild | minor or major |
| A claim is added, approved or withdrawn | - | Claims, with evidence and status | - | patch |
| A new component recipe | ✅ `component` | DESIGN.md Components | the In use page | minor |
| Photography direction changes | ✅ `imagery.photography` (+ new samples via `imagery.py brand`) | Imagery → Photography: prose, recipe, rules, `visuals` | the Photography and Art direction pages | minor or major |
| A real shoot replaces generated samples | ✅ `src` of each sample, provenance → `stated` | swap the `visuals` files; drop the "generated direction" sentence | rebuild, drop the *assumed* note | patch |
| The icon set changes | ✅ `icon` + `npm i -E @iconify-json/<prefix>` in `site/` | Imagery → Icons | rebuild | minor |
| Art direction changes | ✅ `art_direction` | Overview and the top of Imagery | the Art direction page | minor or major |
| The logo changes | ✅ `logo` + `logo.variations` + the files | synced; Logo prose and rules by hand | the Logo page | major |
| A new misuse spotted twice | - | a `rules` entry (with a `dont` visual if there is one) in its section | the Misuse page | patch |
| A new surface (iOS, print) | ✅ `surface_overrides.<platform>` | DESIGN.md: one line pointing at it; BRAND.md Applications for a new channel | a new In use mockup | minor |
| A sub-brand | a new `tokens.json` with `extends` | its own complete BRAND.md | its own site | minor |

After any token edit, always:

```bash
python3 ~/.claude/skills/brand-kit-update/assets/sync.py brand/
```

It writes `theme.css`, the synced blocks of `BRAND.md` and the front matter of `DESIGN.md` (and refreshes the embedded tokens in a legacy `brand.html`). It finds `BRAND.md` in `brand/` or, failing that, at the project root. Read what it prints: a block it could not write (a missing section, or a key someone wrote by hand outside the markers) is a finding to fix, not noise. Add `--check` to find out whether anything has drifted without writing, that is the form to use in an audit, or in CI.

Then lint, and fix every error before you hand back:

```bash
npx -y -p github:guillaumesimon/brand.md brandmd lint brand/BRAND.md --format text
npx @google/design.md lint brand/DESIGN.md
```

If `npx` cannot fetch from GitHub, clone `github.com/guillaumesimon/brand.md`, `npm install`, and run `node src/cli.js lint <path> --format text`. A BRAND.md `self-violation` warning means the brand's own messaging or rewrites use a word it bans; fix the copy in `tokens.json`. On DESIGN.md, `orphaned-tokens` and `missing-primary` warnings are expected.

If the skill is installed somewhere else, the same script ships in this skill's `assets/` and in `brand-kit`'s. Either copy works; they are identical.

## Versions

| Bump | Means | Examples |
|---|---|---|
| **Major** | Existing artefacts now look wrong | New logo, new typeface, the accent moves more than about 15° of hue or 10% lightness, a semantic token renamed or removed |
| **Minor** | Additive. Old artefacts still look right | A new semantic role, dark mode, a new component recipe, a new voice rule, a sub-brand |
| **Patch** | Invisible at a glance | A contrast fix, a typo in the boilerplate, a new banned word, tightened tracking |

A major bump owes a migration note in `CHANGELOG.md` listing renamed tokens old to new. That list is what lets an agent bulk-update a codebase in one pass.

**Never delete a token in a minor version.** Mark it instead and let it die at the next major:

```json
"moss": { "400": { "value": "#4A9276", "_deprecated": "since 1.3.0 — use accent.base. Removed in 2.0.0." } }
```

It is the only thing that stops a three-year-old brand becoming a palette of ninety near-identical greens.

## Writing a rule that will actually be followed

First, check whether the rule has a structured home, because those are read and checked better than a rule: a banned word goes in `voice.vocabulary.avoid` with its replacement, a rewrite in `voice.examples`, a refused call to action in `messaging.cta.never`, a forbidden statement in Claims with `status: prohibited`. Otherwise it is a `rules` entry in the section it governs (interface rules in `DESIGN.md`):

```yaml
rules:
  - verdict: dont
    rule: Cards are flat at rest; a shadow only on hover.
    exception: Dropdowns and modals, which float.
```

Every rule has to pass four tests, or it will be skimmed and ignored.

1. **Checkable.** Could a second agent audit the output and return true or false? "Maintain a calm tone" cannot be, and belongs in Personality. "No exclamation marks" can be, by regex.
2. **In the right section.** Rules are found by area: an agent writing an email reads Voice, Messaging and Vocabulary, one generating a photograph reads Photography. A photography rule written under Overview applies everywhere and gets over-applied.
3. **Carries its exception.** Every `dont` has an `exception`, `none` if there is none. An unconditioned negative gets over-applied: "never centre text" and the agent left-aligns the 404.
4. **A threshold, not an adjective.** "Generous whitespace" resolves to the model's own prior. "Section padding is `spacing.9` on desktop, `spacing.7` below 768px" does not.

Rules are cited by their section and their text ("the Voice rule about exclamation marks"), not by number: the BRAND.md format does not number them.

Keep `BRAND.md` under about 400 lines, synced blocks included, and closer to the format's 300 where you can. It is imported into every session in that project, so it pays rent forever. Overflow goes into a `_rule` field in `tokens.json` next to the value it governs, or into a guide in `brand/` referenced with `` `@guides/<topic>.md` ``. If adding a rule would push the file past the ceiling, find one that has never been broken and move it out.

## Migrating to the BRAND.md format

A kit written before the BRAND.md format has a `BRAND.md` of numbered rules with a `<!--@core-->` block at the top, and `sync.py` says so. Migrate it when the user asks, or when you are about to edit it: say so first, in one line, since it rewrites the file every agent reads.

1. **Tokens.** Add what the new blocks read from: `color.brand` (the two to five identity colours, named by meaning, each with a `value` or `_ref`, `required`, and `print` only if the kit has print values), `type.family.<role>.license_verified` (`false` unless the user has confirmed), `voice.examples` (the before/after pairs from the old voice rules), `voice.vocabulary.use` as a map of term → how, `logo.variations` (only for logo files that exist), `motion.brand`, and `component` from the old component recipes. The shapes are in `assets/tokens.example.json` of the `brand-kit` skill.
2. **BRAND.md.** Start from the `brand-kit` skill's `assets/BRAND.example.md` and carry every old rule to its new home, without inventing content. Reference points, the organising principle, the weird detail and the tiebreaker go to Overview; positioning and audience from `tokens.json → messaging` and the site's Our brand page; voice rules to Voice & Tone `rules`, banned words to `vocabulary.avoid`; logo rules to Logo; imagery rules to Imagery, with the photography samples as `visuals`; motion character to Motion. Colours get a sentence in words each: write it from the swatch, and mark it `inferred` in the provenance. Claims start from `messaging.proof_points`, every one `review` until the user approves it.
3. **DESIGN.md.** From the `brand-kit` skill's `assets/DESIGN.example.md`: the colour-role, type-scale, spacing, radius, shadow, interface-motion and component rules, the "never do these" list and the checklist. The "if the user asks for something that breaks a rule" paragraph moves to the `CLAUDE.md` block.
4. `sync.py`, both linters, and a diff read-through: every old rule must land somewhere or be dropped on purpose, and you list the dropped ones for the user.
5. Update the project's `CLAUDE.md` block from `assets/claude-md-block.md` (it now imports `DESIGN.md` too). A **minor** version: nothing about the brand changed, and the changelog entry says the format did.

## Auditing

When asked to review or refresh the kit, do five passes and report rather than fix silently.

**Drift.** Run `sync.py --check` and both linters, and `grep -rnE '#[0-9a-fA-F]{6}' brand/site/app brand/site/components`, a literal hex in the site is a finding. Then look for values in the site's prose, in the hand-written parts of `BRAND.md` and `DESIGN.md`, or in the project's CSS that no longer match `tokens.json`. A hardcoded hex anywhere in the codebase is a finding.

**Provenance.** Every page hero carries a `provenance`, and `tokens.json → provenance` lists every field. Anything still marked `assumed` has been running unverified since the kit was written. List them, oldest first, and say what would settle each one. Do the same for `BRAND.md` → Claims still in `review`, claims whose evidence has a date that has passed, and typefaces with `licenseVerified: false`.

**Type.** A typeface change is a major version and the most expensive thing in the kit to get wrong, so re-run the choice rather than swapping a value. Open the `brand-kit` skill's `assets/type-systems.html`, put the brand palette and the company's own headline into it, shortlist the current system against the candidates, and make the user choose again. Re-read `references/typography.md` first — particularly the half-life axis, because "it feels dated" is usually a display-face problem with a one-token fix rather than a reason to replace the text face.

**Taste.** Run the gate from the `brand-kit` skill's `references/taste.md` against the current system and against real artefacts the project has shipped since. It is mostly counting: typefaces, weights, hues, radius values, accent share, off-scale spacing.

**Reality.** Compare the kit to what the product actually looks like now. When they disagree, the product usually wins and the kit is stale — but say so rather than deciding. A kit that describes an intention nobody follows is worse than no kit.

Report the findings. Fix the drift and the contrast failures; leave the rest for the user, because a gap between the kit and the product is often a real disagreement inside the team rather than a documentation error.

## What not to do

**Do not quietly rewrite the strategy.** The idea, the positioning, the audience, the claims and the refusals came out of a conversation with a person. An agent cannot verify any of them and must never edit them without being asked. If work suggests one is now wrong, say what you noticed and which page it changes, and wait for an explicit yes.

**Do not mark a claim `approved` yourself.** Only the user approves a claim, and only with its evidence named. Draft new ones as `review`.

**Do not add a rule for something nobody would do.** "Don't stretch the logo" is filler. Write rules against the mistakes *this* system invites — usually ratio, density, colour role and tracking.

**Do not let the misuse pages grow past six entries each.** More than six signals a system that is not robust, and nobody reads the seventh.

## Extending

**A new surface** — add a namespaced block rather than forking:

```json
"surface_overrides": {
  "ios": {
    "type": { "role": { "body": { "size": "base", "leading": 1.45 } } },
    "radius": { "role": { "card": "radius.xl" } },
    "_note": "iOS body steps down one size — native rendering runs larger — and cards take the platform's rounder corner."
  }
}
```

Then one line in `DESIGN.md` → Overview: *"Building for iOS or Android? Apply `surface_overrides.<platform>` on top of the base."*

`type.platform` and `surface_overrides.<platform>` do different jobs and should not be merged. `type.platform` holds the **decision and its rule** — which of the three web/app patterns this brand uses, and where the brand face may appear in a native app. `surface_overrides` holds **value deltas** for a platform. If a change is "the brand face is no longer allowed below 24px on iOS", it goes in `type.platform`. If it is "iOS body steps down one size", it goes in `surface_overrides`.

**A sub-brand**, a `tokens.json` with an `extends` pointer and only the deltas, and its own complete `BRAND.md` in its own directory. The BRAND.md format defines no inheritance and refuses references outside the file's directory, so the sub-brand's file stands alone: its Overview names the parent and says what it shares and what differs.

One constraint worth holding: a sub-brand may override colour and logo and add voice rules. It may **not** change the typeface, the spacing scale or the motion language. Those are what make two products look like one company. If a change needs them, it is a new brand, not a sub-brand — say so.

## The changelog entry

Short, and written for the person who will read it in a year.

```markdown
## 1.3.0 — 2026-11-04

**Minor.** Dark mode, and one rule that an agent kept breaking.

- Added `color.semantic.dark` (38 tokens). The accent steps to `moss.500` on dark;
  `moss.600` fails contrast on near-black.
- Added rule 19: cards are flat at rest, `--shadow-sm` on hover. Three sessions in a
  row produced cards with a 20% grey shadow, which is the classic amateur tell.
- Fixed `ink.muted` from `#736659` to `#6E6156` — 4.3:1 on paper, now 4.6:1.

Rebuilt: theme.css, the synced blocks of BRAND.md, the DESIGN.md front matter, the site.
```
