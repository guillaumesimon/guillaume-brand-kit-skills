# The kit: what to write, and where

The output serves two audiences at once. A founder who will show it to their team, and an agent that must build a website, a deck or an app screen from it without guessing. Those two want different things from the same facts, which is why the kit is three artefacts and not one.

## The artefact set

```
brand/
├── BRAND.md        ← the brand, in the BRAND.md format. Agents read it, always. Prose and rules hand-written; values synced.
├── DESIGN.md       ← the interface system, in the DESIGN.md format. Front matter synced; body hand-written.
├── tokens.json     ← every value, written once. The source of truth. Hand-written.
├── theme.css       ← every token as a CSS variable. Generated.
├── CHANGELOG.md    ← what changed and why. Hand-written.
├── assets/
│   ├── logo/          ← one file per variation and colourway: lockup.svg, lockup-on-dark.svg, mark.svg, mark-on-dark.svg
│   ├── photography/   ← the samples the Photography page shows (generated until a real shoot)
│   ├── illustration/  ← only if the brand illustrates
│   └── og.png         ← 1200×630
└── site/           ← the brand site for people. Next.js, static export. Reads ../tokens.json.
    ├── app/           ← one folder per page, each a page.mdx written in the brand's voice
    ├── components/    ← the building blocks; every value comes from tokens.json
    └── lib/nav.ts     ← the site map
```

Two open formats, one token file, the assets and the site. More and the founder never opens it; fewer and an agent guesses.

**`BRAND.md` follows the BRAND.md format** ([github.com/guillaumesimon/brand.md](https://github.com/guillaumesimon/brand.md), `docs/spec.md`, version `alpha`). Any tool or agent that knows the format can read the kit without knowing this skill, and its linter checks it. **`DESIGN.md` follows Google's DESIGN.md format** ([github.com/google-labs-code/design.md](https://github.com/google-labs-code/design.md)), of which BRAND.md is a sibling. The split is the formats' own test: *if it should survive a complete visual redesign, it belongs in BRAND.md; if it could change during that redesign without changing who the brand is, it belongs in DESIGN.md.* Voice, claims, logo, identity colours, typefaces, imagery and motion character are brand. Colour roles, the type scale, spacing, radius, elevation, interface motion and components are design.

`BRAND.md` usually lives in `brand/`, beside its assets. A project that already keeps a `BRAND.md` at its root keeps it there: the kit updates that file and never writes a second one (one brand, one file). `sync.py` looks in `brand/` first, then in the project root, and writes asset paths relative to wherever the file is.

## Read order, and why the site must defend itself

An agent in a fresh session reads in this order and stops as soon as it has enough:

| Step | File | Cost | When |
|---|---|---|---|
| 1 | `CLAUDE.md` (a few lines + the `@brand/BRAND.md` import) | ~100 tokens | always |
| 2 | `brand/BRAND.md` | ~4,500 | always, via the import |
| 3 | `brand/DESIGN.md` | ~3,500 | always, via the import |
| 4 | `brand/tokens.json` | ~5,000 | only when writing CSS or config |
| 5 | `brand/site/` | **~60,000+** | **never** |

That last row is the whole design argument. A pretty brand site is 60–80k tokens, a third of a working context, to deliver about 8k tokens of actual information wrapped in swatch markup and embedded fonts. If the agent reads it, you have paid many times over for the same facts and pushed the user's own codebase out of context.

So the kit is **actively defensive** about it:

- `BRAND.md`, at the end of Overview: *"The brand site in `site/` is built from those files for people: an agent never needs to read it."*
- The site's root layout carries a comment in `<head>`: `AGENTS: this site is generated for people. Read ../BRAND.md, ../DESIGN.md and ../tokens.json instead.` and sets `robots: noindex`.
- It lives in `brand/site/`, never at the repo root, where a build tool, a monorepo workspace glob or another skill might pick it up. If the project already uses npm workspaces, exclude `brand/site` from them.

## The duplication rule

**A value is typed once, in `tokens.json`. Prose and rules about the value live in `BRAND.md` or `DESIGN.md`. The site shows all of it and never types a value of its own.**

| Content | tokens.json | BRAND.md | DESIGN.md | site/ |
|---|---|---|---|---|
| `#1F5D45` | authored in `color.brand` and the palette | synced into `colors` | synced into `colors.accent` | read at build |
| "moss is one or two elements per view" | `_rule` field | prose under Colors | the accent rule under Colors | `<Rules path="color" />` |
| Logo files, minimum size, clear space | `logo.variations` | synced into `logo` | - | rendered diagram |
| Traits, voice, vocabulary, messaging | `voice.*`, `messaging.*` | synced into `personality`, `voice`, `vocabulary`, `messaging` | - | `<IsNot />`, `<InsteadOf />`, `<Lexicon />` |
| Claims, rules, visuals, imagery recipes | - | hand-written | - | page prose |
| Button recipe | `component` | - | synced into `components` | the In use page |
| Why we exist, the idea | - | Overview and Positioning prose | - | page prose in `app/our-brand/page.mdx` |

Pages carry **prose** — the story, the reasons, the captions, the do/don't sentences — and pull every **value** through a component. A hex typed into an `.mdx` file is the same bug as a hex typed into a component.

The copies in `BRAND.md` and `DESIGN.md` are mechanical: `sync.py` writes them. In `BRAND.md` each synced block sits between `<!-- @sync <name> -->` and `<!-- @/sync -->` markers, eight of them (`personality`, `voice`, `messaging`, `vocabulary`, `logo`, `colors`, `typography`, `motion`), and everything outside the markers is yours. In `DESIGN.md` the whole front matter is synced and the body is yours. An agent asked for "a quick landing page" with only `BRAND.md` in context still has the identity colours, the faces and the voice as values, so it gets most of the way on-brand with no further reads.

Hand-maintained duplication is how brands rot. The drift always starts the day someone fixes a hex in the docs and not in the token file.

## tokens.json

### Shape

`<category>.<role>[.<variant>]`, lowercase, kebab-case. **Semantic roles at the point of use, never palette names**: `color.semantic.light.accent.base`, not `moss.600`. The palette is raw material; the semantic layer is the API, and an agent should never write `moss-600` into a component.

Numeric scales are **absolute, not t-shirt sized**: `space.4` = 16px. T-shirt sizes invite an agent to invent `xxl`; numbers cannot be invented past the end of a scale without it being obvious.

**Mapping to CSS, stated once in `BRAND.md` so no lookup table is needed:** drop the `semantic.<theme>.` segment, join the rest with `-`, prefix with `--`. So `color.semantic.light.ink.muted` → `--color-ink-muted`, `space.5` → `--space-5`, `type.role.body.size` → `--text-body`.

### Values are resolved, not aliased

Do not ship W3C DTCG as the read surface. It is the right interchange format and the wrong agent-facing one: `{"$value":…, "$type":…}` at every leaf roughly doubles the token cost for a type annotation a model infers from `#1F5D45` instantly, and `"$value": "{color.base.moss.600}"` forces an agent to walk a reference graph in its head, which it will occasionally get wrong silently.

**Ship resolved values.** Keep the alias as a sibling `_ref` string, for humans and for diffing. And note that DTCG has no schema for the half of a brand that is not visual — voice, vocabulary, boilerplate, messaging — which is precisely the half that stops an agent writing "Unlock the power of AI-driven synergy".

### Underscore keys colocate the rule with the value

`_use`, `_rule`, `_rules`, `_note`, `_ref`, `_sample` are instructions for the reader, human or machine. This is the central trick of the whole schema: an agent reading `color.semantic.light.accent` gets the hex **and** "at most twice per viewport" in the same object. Rules in a separate document get skimmed; rules attached to the value get applied.

### The blocks

`meta` — name, legal name, version, updated, tagline, category, personality, anti-personality, and **`reference_points`**: what it looks like and what it does not. That string does more work than any other in the file.

`color`, `palette` (raw ramps), `brand` (the identity colours, named by meaning, each a `value` and its `_ref`, `required`, and `print` with `cmyk`, `pantone` only if one was chosen with a swatch book, and `note`), `semantic.light` and `semantic.dark` (surface / ink / accent / border / state), `_rules`, `contrast_floor`.

`type`, `family` (display / text / mono, each with stack, source, `license`, `license_verified`, `required` when every piece must carry it, `weight` only when a weight is part of the identity, `_use`), `scale` (`_ratio`, `_base_px`, `step`), `role` (display, h1–h3, body, lead, label, caption, button, metric, quote, code, each with family, size, weight, leading, tracking, case, `_use`, `_sample`), `_rules`.

`space`, `_base_px`, the numeric ramp, `role` aliases, `_rules`. `radius`, values plus `role` plus `_rules`. `shadow`, `_philosophy`, values, `role`, `dark_note`. `motion`, `duration`, `easing`, `role` (interface transitions, for DESIGN.md), `brand` (the brand's motion named for purpose, such as `settle`, each a `duration` and an `easing` key), `_rules`. `layout`, breakpoints, containers, grid, z-index, `_rules`. `icon`, library, `iconify` (prefix and suffix the site renders from), style, stroke width, grid, live area, corner radius, caps, perspective, sizes, `set`, `metaphors`, `_rules`. See `references/iconography.md`. `logo`, `primary`, `mark`, `wordmark` files for the site, min sizes, clearspace, permitted colours, construction, `_rules`, and `variations` in BRAND.md's own shape (`use`, `minSize`, `clearSpace`, `colorways` → `on-light` / `on-dark` → `file`, `color`, `backgrounds`, with colours as `{colors.<brand name>}`). Leave `variations` out until the files exist. `component`, the recipes in DESIGN.md's shape (`backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `height`), with references to DESIGN.md token names.

`art_direction` — concept, principles, formula, hierarchy, weird detail, `_rules`. See `references/art-direction.md`.

`voice`, `attributes` as `{is, not, means}` triples, person, tense, sentence length, reading level, locale, `examples` as `{instead, write, why}` rewrites (at least three), `vocabulary.use` (a map of term → how to use it) and `vocabulary.avoid` (a map of banned word → replacement), punctuation, capitalisation.

`messaging` — one-liner, elevator, positioning, pillars with proof, proof points, boilerplate, CTA (`primary`, `secondary`, **`never`**), email signoff.

`imagery` — `photography` (point of view, types, recipe, samples, misuse, never, source — see `references/photography.md`), `illustration` (style, construction, source, never, next one, samples — see `references/illustration.md`), `charts`. Any sample with a `prompt` and a `src` can be generated with `assets/imagery.py brand`.

`type.webfonts.href` — the one stylesheet URL that loads every brand face; the site links it in `<head>`. `motion.principles` — three `{name, rule}` pairs in the brand's words. `layout.formats` — the surfaces made most often, each `{name, ratio, rule}`.

`provenance` — `{field: "stated" | "inferred" | "assumed"}` for everything the session did not settle from the user's own words, plus `breaks_if`, `expires`, `validate`.

The fully populated example lives in `assets/tokens.example.json`. Match its depth.

## BRAND.md — the file that changes agent output

`assets/BRAND.example.md` is the quality bar, and `docs/spec.md` in the BRAND.md repository is the format. Match both.

### The format, in one screen

- Front matter: `version: alpha` (the format's version, not the brand's: that is `meta.version` in `tokens.json` and the changelog), `name` (the only required key), `description` (one sentence), `language` (a BCP 47 tag, such as `en-GB`).
- An optional `# Name` title, then `##` sections **in this order**, each optional except Overview: **Overview · Positioning · Audience · Personality · Voice & Tone · Messaging · Claims · Vocabulary · Logo · Colors · Typography · Imagery · Motion · Applications.** Imagery takes `###` subsections (Photography, Illustration, Icons, anything else the brand uses); Applications one `###` per channel.
- Structured values sit in fenced `yaml` blocks inside the section they belong to. Each top-level key is defined once in the file, except `rules` and `visuals`, which may appear in every section and govern the section they are in.
- Token references in prose and YAML use braces: `{colors.moss}`, `{motion.settle.duration}`. A reference that does not resolve is an error. Files are referenced as `` `@DESIGN.md` `` or `` `@assets/photography/hero.webp` ``, relative to the BRAND.md directory.
- Unknown sections and keys are preserved by every tool, so a project's own additions survive.

| Section | Written by | What goes in it |
|---|---|---|
| Overview | you | what the brand is, what it resembles and must not resemble, the organising principle, the weird detail, the tiebreaker, and one line pointing interface work at `@DESIGN.md`. Rules that apply everywhere. |
| Positioning, Audience | you | prose only: the category in the customer's words, what they use instead, the difference and its proof, what it is not; a person in a situation, what they believe and doubt, who it is not for |
| Personality | sync (`voice.attributes`) | `{is, not, means}` traits |
| Voice & Tone | sync (`voice.person`, `capitalisation`, `sentence_length`, `examples`) + you | mechanics, before/after pairs, tone by situation in prose, the voice rules |
| Messaging | sync (`meta.tagline`, `messaging.*`) + you | when each length is used and how far it may be adapted |
| Claims | you | every factual statement the brand may make, with evidence and a status |
| Vocabulary | sync (`voice.vocabulary`) | `use` (term → how) and `avoid` (term → what to write instead) |
| Logo | sync (`logo.variations`) + you | what the mark means, the default, the prohibitions |
| Colors | sync (`color.brand`: `colors`, `required`, `print`) + you | for each colour: what it stands for, **how it reads in words**, how much of it appears |
| Typography | sync (`type.family`) + you | what each role is for and how the pairing should feel |
| Imagery | you | the hierarchy, then per kind: subject, treatment, what never appears, the generation recipe, `rules` and `visuals` |
| Motion | sync (`motion.brand`) + you | the character with a reference, what moves and what never does |
| Applications | you | per channel: what changes there and what does not |

### What the format asks that the old rule file did not

**Colours in words.** An image model ignores `#1F5D45`. "A deep, cool forest green, like a bound ledger's cloth spine; not emerald, not teal, not olive" is an instruction it follows. Every colour in Colors gets that sentence, with two neighbours it must not be mistaken for.

**Claims with a status.** Marketing copy makes factual statements, and an agent will invent plausible ones unless told which are true. List every claim the session surfaced. `approved` only when the user has approved that exact wording in the session and the evidence is named; `review` for anything you drafted or inferred; `prohibited` for what they ruled out or what has no evidence ("increases revenue"). Never invent evidence. Proof points with provenance `stated` are candidates for `approved`, and you still ask.

**A licence that someone checked.** `license_verified` in `type.family` (and so `licenseVerified` in BRAND.md) is `true` only when the user has confirmed the licence covers their use. A free family under the OFL is likely fine; say so, and leave it `false` until they confirm.

**Visuals with a verdict.** Sample images go in `visuals` with `do` or `dont` and a caption that carries the rule ("Mid-task, never looking at the camera"), not a description ("a woman folding towels"). A consumer never passes a `dont` visual to an image model.

**The logo is placed, never drawn.** Say it in Logo. Every colourway is a file that exists; a brand with no logo file yet declares no `logo` block and says so in prose (`omitted: [{section: logo, reason: "Wordmark not drawn yet."}]` in the front matter).

### Rules that change output

The structured places come first: `vocabulary.avoid` for words, `voice.examples` for rewrites, `personality` for traits, `messaging.cta.never` for calls to action, `claims` with `status: prohibited` for statements. A `rules` entry is for what fits none of them, and lives in the section it governs:

```yaml
rules:
  - verdict: dont
    rule: No exclamation marks, anywhere.
    exception: none
```

**1 · Checkable.** A rule is real only if a second agent could audit the output and return true or false. "Maintain a calm, confident tone" is unauditable and belongs in Personality; "No exclamation marks" is auditable by regex.

**2 · Every `dont` names its exception.** An unconditioned negative gets over-applied: "never centre text" and the agent left-aligns the 404. Write `exception: none` when there is none; that is information too. If you cannot list exceptions, the rule is too broad.

**3 · Thresholds, not adjectives.** "Generous whitespace" resolves to the model's prior. "Moss on one or two elements per view" does not. Convert every adjective you can into a number, a ratio or an enum.

**4 · Worked pairs with a one-line reason.** `voice.examples` teaches the principle in a way a rule cannot, and the `why` lets the agent generalise to cases you never listed. At least three, four is better. The `write` lines must not use any word in `vocabulary.avoid`: the linter checks.

**5 · Few.** A section with twenty rules has prose that is too vague. There is no quota.

| Ignored | Changes output |
|---|---|
| "Use our brand colours consistently." | Colors prose: "Moss is the one active thing: one or two elements per view." DESIGN.md: "Accent appears at most twice per viewport." |
| "Typography should feel editorial." | `dont`: "Never set Fraunces below 1.375rem or at weight 700." `exception: none` |
| "Write in a friendly, professional tone." | Traits `{is: warm, not: chummy, means: ...}`, four rewrites, and `dont`: "No exclamation marks, anywhere." |
| "Don't use AI buzzwords." | `vocabulary.avoid`: `AI-powered: say what it does, such as "forecasts your occupancy"` |
| "Be accurate." | `claims`, each with evidence and a status |

**Reference-point triangulation** is still the highest-leverage paragraph, at the top of Overview: two lines of "resembles this, not that" set a prior that steers a thousand micro-decisions. And end Overview with **a tiebreaker** for the cases nobody listed: "When nothing here answers the question, pick the quieter option."

### Length

The format asks for **under about 300 lines**, because an agent reads the file whole, every time. The synced blocks take 120 to 160 of them, so the hand-written part is short. The example is about 400 and that is the ceiling: past it, move a long guide (a photography brief, a page of approved copy) to its own file in `brand/` and reference it with `` `@guides/photography.md` ``, read on demand. Interface rules never go here; they go in `DESIGN.md`.

### Conflict with the user

The failure runs both ways: an agent that ignores the brand, and an agent that refuses a legitimate request because "the brand says sentence case". That paragraph is agent behaviour, not brand, so it lives in the `CLAUDE.md` block (`assets/claude-md-block.md`), not in `BRAND.md`: do what the user asks, then note in one line what was overridden. Locked: logo integrity, the contrast floor, legal wording and any claim not `approved`.

### Lint it

Run the format's linter before handing the kit over, and fix every error and every warning you can:

```bash
npx -y -p github:guillaumesimon/brand.md brandmd lint brand/BRAND.md --format text
```

If `npx` from GitHub is not available, clone the repository and run `node src/cli.js lint <path> --format text` after `npm install`. It catches broken references, missing logo files, unreadable logo colours, approved claims without evidence, the brand's own banned words in its messaging, and drift between a `required` colour and `DESIGN.md`.

## DESIGN.md: the interface system

`assets/DESIGN.example.md` is the quality bar. Its front matter is written by `sync.py` from `tokens.json`: `colors` from `color.semantic` (light, plus a `dark` group), `typography` from `type.role`, `rounded` from `radius`, `spacing` from `space`, `motion` from `motion.role`, `components` from `component`, and `brand: ./BRAND.md`, which links the two files so the BRAND.md linter can check that every `required` colour and every face appears here. Token names follow `theme.css` without the prefix: `colors.ink-muted` is `--color-ink-muted`.

The body is hand-written, in DESIGN.md's order: **Overview · Colors · Typography · Layout · Elevation & Depth · Shapes · Motion & Micro-interaction · Components · Do's and Don'ts.** It carries everything that used to be numbered interface rules: accent share per viewport, the type scale's limits, measure, alignment, spacing rhythm, the grid, radius roles, shadows, reduced motion, each component recipe, the "never do these" list and the pre-flight checklist. Overview maps each brand colour to its role in a table and states the CSS variable mapping once. Keep it under about 200 lines.

Lint it with `npx @google/design.md lint brand/DESIGN.md`. Errors are bugs. `orphaned-tokens` warnings for colours that only the prose uses, and `missing-primary` (the kit names its roles `accent`, `ink`, `surface-*`, like `theme.css`) are expected.

## site/ — the brand site

The human kit is a small Next.js site in the shape of `brand.klarna.com`: a manifesto home, **Our brand**, **How we speak**, **How we look** with one page per part of the visual system, **In use** and a **Toolkit**. The page catalogue is in `references/kit-pages.md`; the mechanics — copying it, the components, building, deploying — are in `references/site.md`. Three things govern it:

**It is rendered in the brand it documents.** The site's own furniture — background, type, headings, the colour bands that open each section — is built from the tokens. A brand book that does not look like the brand has already failed its own thesis.

**Every swatch, specimen, scale, icon and token table is rendered from `tokens.json` at build**, never typed into a page. Change a hex, rebuild, and the swatch, the contrast badge, the component demo and the spec table all move together.

**It builds to a plain static folder.** `npm run build` writes `site/out/`, which opens from any static host, deploys to Vercel as is, and can be zipped and emailed. Founders open it two years later from a link; it must not need a server.

## Wiring it into a project

Copy the `brand/` directory in, then three steps.

**1 · `CLAUDE.md`** gets the block from `assets/claude-md-block.md`. The `@brand/BRAND.md` and `@brand/DESIGN.md` imports are the key mechanic: they are resolved at session start and inlined, so the brand and the interface rules are in context from turn one without the agent deciding to go and look. Do **not** `@`-import `tokens.json`: 5,000 tokens in every session for something needed in perhaps a fifth of them.

**2 · CSS.** `sync.py` writes `brand/theme.css`: every token as a CSS variable, light and dark, under the same names `DESIGN.md` uses. Import it in the project's global stylesheet, or point Tailwind v4 at it:

```css
@import "tailwindcss";
@import "../brand/theme.css";

@theme inline {
  --color-brand:       var(--color-accent-base);
  --color-brand-hover: var(--color-accent-hover);
  --color-body:        var(--color-ink-base);
  --color-paper:       var(--color-surface-page);
  --font-serif:        var(--font-display);
  --font-sans:         var(--font-text);
  --spacing:           0.25rem;   /* p-4 = 1rem, matching space.4 */
}
```

`@theme inline` makes the utilities emit `var(--color-accent-base)` rather than a baked hex, so the dark-mode override in `theme.css` flows through `bg-brand` automatically. The utility names are deliberately new (`brand`, `body`, `paper`, `serif`): reusing a token's own name, as in `--color-accent: var(--color-accent)`, makes the variable point at itself and silently resolves to nothing.

**3 · A skill, only if needed.** Add one when the project generates **non-web** artefacts — decks, social images, PDFs — or juggles sub-brands. Skills load on demand, so that is where long-tail rules live without taxing every session.

**Not MCP.** Tokens are a 20KB static file that changes monthly. An MCP server adds a process to start, a connection to fail, a tool schema in every session's context and latency on every lookup, in exchange for nothing a file read does not already give. Files version with git, diff in pull requests, and work when the server is down.
