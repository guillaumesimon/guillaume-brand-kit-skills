---
name: brand-kit-update
description: Keep an existing brand kit true, and extend it. Use this skill whenever a repository has a brand/ directory with tokens.json and DESIGN.md and something about the brand changes or needs adding - a colour, a typeface, a spacing or radius value, a voice or vocabulary rule, the positioning, the messaging, the logo, the photography direction, the icon set, the illustration style, the art direction, a component recipe, a new surface or a sub-brand. Also use it when an agent produced something off-brand and the rule that would have prevented it is missing, when the user asks to audit, refresh, review or version the brand, when a colour fails contrast in real product, when they want to add a page to the brand site, and when the site, theme.css or the DESIGN.md front matter has fallen out of step with tokens.json, and when a kit still has a BRAND.md to migrate to DESIGN.md. If there is no brand/ directory, use brand-kit instead.
---

# Update a brand kit

A brand kit that nothing maintains is wrong within two months and nobody notices. This skill is how it stays true, and how it gets better.

## Quick kits

A kit whose `tokens.json` has `meta.mode: "quick"` came from the four-minute session of `brand-kit`: tokens, `DESIGN.md` and `theme.css`, no site, version 0.x, most of it `assumed`. Update it like any kit - every step about `site/` simply does not apply. When the user wants the site, the imagery or the boards that were skipped, that is not an update: hand over to `brand-kit`, which resumes in normal mode from `brand/session.md`.

## The loop that matters

**The strongest signal that a rule needs to exist is that an agent broke it.**

When a session produces something off-brand, the fix is not to correct the output. It is to add one numbered, checkable line to `DESIGN.md` and re-sync. The kit gets measurably better every time it fails, and `CHANGELOG.md` becomes a record of every way this brand has been misunderstood. That record compounds faster than the tokens do.

So when the user says "that's not very us", do not just fix the artefact. Ask what rule would have caught it, write that rule, and say you have.

## What is hand-edited, and what is generated

| File | Holds | Edited by |
|---|---|---|
| `tokens.json` | Every value, and the rule beside it | You |
| `DESIGN.md` | Body: rules expressed as prose, numbered | You (the YAML front matter: **`sync.py`**) |
| `CHANGELOG.md` | What changed, why, and the version | You |
| `site/app/**/page.mdx` | The brand site's prose — the story, the reasons, captions, do/don't sentences | You |
| `theme.css` | Every token as a CSS variable | **`sync.py`** |
| `site/` values | Every swatch, specimen, icon, scale and table | **The build**, from `tokens.json` |
| `brand.html` (kits made before the site) | The old one-page kit | **`sync.py`** |

The site reads `tokens.json` at build time, so values never live in its pages. Never type a hex, a size or a duration into an `.mdx` file or a component — it will silently disagree with the source within a week, and that is exactly how brands rot. Page *prose* is hand-edited; values are not. After a token change, rebuild the site (`cd brand/site && npm run build`) and look at the pages it touches.

Kits made before the site existed have a one-page `brand.html` that embeds a copy of `tokens.json`; `sync.py` still refreshes it. To move such a kit to the site, copy `site/` from the `brand-kit` skill's `assets/`, carry each page's prose into its `page.mdx`, and delete `brand.html` once the site builds — a minor version.

## Which change touches what

| The change | tokens.json | DESIGN.md | site | Bump |
|---|---|---|---|---|
| A colour value moves | ✅ | only if a rule cites the hex | rebuild | patch or major |
| A new semantic role | ✅ | ✅ if agents must use it | rebuild | minor |
| Contrast fix | ✅ | — | rebuild | patch |
| A typeface changes | ✅ + `type.webfonts.href` | ✅ | rebuild, check every specimen | major |
| The web/app type pattern changes | ✅ `type.platform` | ✅ the rule about the brand face in-app | rebuild | minor or major |
| A scale step or leading changes | ✅ | ✅ if a rule cites it | rebuild | patch or minor |
| A new voice or vocabulary rule | ✅ `voice.vocabulary` | ✅ numbered rule | rebuild (How we speak) | patch |
| Positioning or messaging changes | ✅ `messaging` | — | Our brand prose, rebuild | minor or major |
| A new component recipe | — | ✅ numbered rule | the In use page | minor |
| Photography direction changes | ✅ `imagery.photography` (+ new samples via `imagery.py brand`) | ✅ the photography rule | the Photography and Art direction pages | minor or major |
| A real shoot replaces generated samples | ✅ `src` of each sample, provenance → `stated` | — | rebuild, drop the *assumed* note | patch |
| The icon set changes | ✅ `icon` + `npm i -E @iconify-json/<prefix>` in `site/` | ✅ the icon rule | rebuild | minor |
| Art direction changes | ✅ `art_direction` | ✅ the hierarchy rule | the Art direction page | minor or major |
| The logo changes | ✅ `logo` + the asset | ✅ | the Logo page | major |
| A new misuse spotted twice | — | ✅ if checkable | the Misuse page | patch |
| A new surface (iOS, print) | ✅ `surface_overrides.<platform>` | ✅ one line pointing at it | a new In use mockup | minor |
| A sub-brand | a new `tokens.json` with `extends` | a short file importing the parent | its own site | minor |

After any token edit, always:

```bash
python3 ~/.claude/skills/brand-kit-update/assets/sync.py brand/
```

It writes `theme.css` and regenerates the YAML front matter of `DESIGN.md` (and refreshes the core block of a legacy `BRAND.md`, or the embedded tokens of a legacy `brand.html`). Add `--check` to find out whether they have drifted without writing anything; that is the form to use in an audit, or in CI.

Then lint the file, since it follows Google's [DESIGN.md format](https://github.com/google-labs-code/design.md):

```bash
npx @google/design.md lint brand/DESIGN.md
```

A `contrast-ratio` warning is a finding: fix the token, not the component pair. `orphaned-tokens` warnings on border and focus colours are expected. Before a release, `npx @google/design.md diff <old DESIGN.md> brand/DESIGN.md` lists every token that changed, which is the raw material for the changelog entry.

**A kit with `BRAND.md` and no `DESIGN.md`** predates the format. Migrate it once, as a minor version: rename `BRAND.md` to `DESIGN.md`, delete its old front matter and core block, move its sections into the order of the `brand-kit` skill's `assets/DESIGN.example.md`, renumber the rules top to bottom (and every "rule N" inside the file), run `sync.py`, lint, then replace `@brand/BRAND.md` with `@brand/DESIGN.md` in the project's `CLAUDE.md` or `AGENTS.md`. Log the old-to-new rule numbers in the changelog entry, since commit messages cite them.

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

Every rule you add to `DESIGN.md` has to pass four tests, or it will be skimmed and ignored.

1. **Checkable.** Could a second agent audit the output and return true or false? "Maintain a calm tone" cannot be. "No exclamation marks in product UI" can be, by regex.
2. **Numbered.** Numbered rules are citable, so a human can say "rule 14 is wrong" and you fix one line.
3. **Carries its exception.** An unconditioned negative gets over-applied — "never centre text" and the agent left-aligns the 404. Write *"Body text is never centred. Exception: empty states, auth screens, deck covers."* If you cannot list exceptions, the rule is too broad.
4. **A threshold, not an adjective.** "Generous whitespace" resolves to the model's own prior. "Section padding is `--space-9` (6rem) desktop, `--space-7` below 768px" does not.

And keep the file **under 250 lines**. It is imported into every session in that project, so it pays rent forever. Overflow belongs in a `_rule` field in `tokens.json`, next to the value it governs, where it is read on demand — rules in a separate document get skimmed, rules attached to the value get applied.

If adding a rule would push the file past the ceiling, find one that has never been broken and move it to `tokens.json` instead.

## Auditing

When asked to review or refresh the kit, do five passes and report rather than fix silently.

**Drift.** Run `sync.py --check`, and `grep -rnE '#[0-9a-fA-F]{6}' brand/site/app brand/site/components` — a literal hex in the site is a finding. Then look for values in the site's prose, in `DESIGN.md` rules, or in the project's CSS that no longer match `tokens.json`. A hardcoded hex anywhere in the codebase is a finding.

**Provenance.** Every page hero carries a `provenance`, and `tokens.json → provenance` lists every field. Anything still marked `assumed` has been running unverified since the kit was written. List them, oldest first, and say what would settle each one.

**Type.** A typeface change is a major version and the most expensive thing in the kit to get wrong, so re-run the choice rather than swapping a value. Open the `brand-kit` skill's `assets/type-systems.html`, put the brand palette and the company's own headline into it, shortlist the current system against the candidates, and make the user choose again. Re-read `references/typography.md` first — particularly the half-life axis, because "it feels dated" is usually a display-face problem with a one-token fix rather than a reason to replace the text face.

**Taste.** Run the gate from the `brand-kit` skill's `references/taste.md` against the current system and against real artefacts the project has shipped since. It is mostly counting: typefaces, weights, hues, radius values, accent share, off-scale spacing.

**Reality.** Compare the kit to what the product actually looks like now. When they disagree, the product usually wins and the kit is stale — but say so rather than deciding. A kit that describes an intention nobody follows is worse than no kit.

Report the findings. Fix the drift and the contrast failures; leave the rest for the user, because a gap between the kit and the product is often a real disagreement inside the team rather than a documentation error.

## What not to do

**Do not quietly rewrite the strategy.** The idea, the positioning, the audience and the refusals came out of a conversation with a person. An agent cannot verify any of them and must never edit them without being asked. If work suggests one is now wrong, say what you noticed and which page it changes, and wait for an explicit yes.

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

Then one line in `DESIGN.md`: *"Building for iOS or Android? Apply `surface_overrides.<platform>` on top of the base."*

`type.platform` and `surface_overrides.<platform>` do different jobs and should not be merged. `type.platform` holds the **decision and its rule** — which of the three web/app patterns this brand uses, and where the brand face may appear in a native app. `surface_overrides` holds **value deltas** for a platform. If a change is "the brand face is no longer allowed below 24px on iOS", it goes in `type.platform`. If it is "iOS body steps down one size", it goes in `surface_overrides`.

**A sub-brand** — a `tokens.json` with an `extends` pointer and only the deltas, plus a short `DESIGN.md` that imports the parent with `@../<parent>/DESIGN.md` and lists the differences. Its front matter, generated from the deltas, holds only the values that differ.

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

Rebuilt: theme.css, the DESIGN.md front matter, the site.
```
