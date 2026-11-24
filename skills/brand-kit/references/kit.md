# The kit: what to write, and where

The output serves two audiences at once. A founder who will show it to their team, and an agent that must build a website, a deck or an app screen from it without guessing. Those two want different things from the same facts, which is why the kit is three artefacts and not one.

## The artefact set

```
brand/
├── BRAND.md        ← agents read this, always. 120–250 lines. Hand-written.
├── tokens.json     ← every value, written once. The source of truth. Hand-written.
├── CHANGELOG.md    ← what changed and why. Hand-written.
├── assets/
│   ├── logo/          ← wordmark.svg, mark.svg, lockup.svg, mark.png (1024², transparent)
│   ├── photography/   ← the samples the Photography page shows (generated until a real shoot)
│   ├── illustration/  ← only if the brand illustrates
│   └── og.png         ← 1200×630
├── references/     ← the sites the brand was measured against: cards and captures. Never published.
└── site/           ← the brand site for people. Next.js, static export. Reads ../tokens.json.
    ├── app/           ← one folder per page, each a page.mdx written in the brand's voice
    ├── components/    ← the building blocks; every value comes from tokens.json
    └── lib/nav.ts     ← the site map
```

Three files, the assets, the references, and the site. More and the founder never opens it; fewer and an agent guesses.

## Read order, and why the site must defend itself

An agent in a fresh session reads in this order and stops as soon as it has enough:

| Step | File | Cost | When |
|---|---|---|---|
| 1 | `CLAUDE.md` (a few lines + the `@brand/BRAND.md` import) | ~100 tokens | always |
| 2 | `brand/BRAND.md` | ~2,200 | always, via the import |
| 3 | `brand/tokens.json` | ~4,500 | only when writing CSS or config |
| 4 | `brand/site/` | **~60,000+** | **never** |
| 5 | `brand/references/` | captures of other brands | **never**: what was taken from them is already in `reference_points` |

That last row is the whole design argument. A pretty brand site is 60–80k tokens — a third of a working context — to deliver about 4k tokens of actual information wrapped in swatch markup and embedded fonts. If the agent reads it, you have paid fifteen times over for the same facts and pushed the user's own codebase out of context.

So the kit is **actively defensive** about it:

- `BRAND.md`, near the top: *"Do not read `site/`. It is built from `tokens.json` for people and contains nothing you need."*
- The site's root layout carries a comment in `<head>`: `AGENTS: this site is generated for people. Read ../BRAND.md and ../tokens.json instead.` and sets `robots: noindex`.
- It lives in `brand/site/`, never at the repo root, where a build tool, a monorepo workspace glob or another skill might pick it up. If the project already uses npm workspaces, exclude `brand/site` from them.

## The duplication rule

**A value is typed once, in `tokens.json`. Prose about the value lives in `BRAND.md`. The site shows both and never types a value of its own.**

| Content | tokens.json | BRAND.md | site/ |
|---|---|---|---|
| `#1F5D45` | authored | never literal | read at build |
| "accent is for one CTA per view" | `_rule` field | rule 14 | `<Rules path="color" />` |
| Clear space = 1× mark height | `logo.clearspace` | a rule | rendered diagram |
| Tone of voice | `voice.*`, structured | prose plus examples | `<IsNot />`, `<InsteadOf />`, `<Lexicon />` |
| Why we exist, the idea | — | a line in the frontmatter | page prose in `app/our-brand/page.mdx` |

Pages carry **prose** — the story, the reasons, the captions, the do/don't sentences — and pull every **value** through a component. A hex typed into an `.mdx` file is the same bug as a hex typed into a component.

One duplication is permitted, and it is mechanical:

1. **The core block at the top of `BRAND.md`** — accent, ink, page, two font families, base spacing, base radius. An agent asked for "a quick landing page" sometimes only has `BRAND.md` in context. Those twelve values get it 80% on-brand with zero further reads. It lives between `<!--@core-->` markers so it can be regenerated without touching the rest.

The site needs no copy: it reads `../tokens.json` at build time, so a rebuild is the sync.

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

`color` — `palette` (raw ramps), `semantic.light` and `semantic.dark` (surface / ink / accent / border / state), `_rules`, `contrast_floor`.

`type` — `family` (display / text / mono, each with stack, source, licence, `_use`), `scale` (`_ratio`, `_base_px`, `step`), `role` (display, h1–h3, body, lead, label, caption, button, metric, quote, code — each with family, size, weight, leading, tracking, case, `_use`, `_sample`), `_rules`.

`space` — `_base_px`, the numeric ramp, `role` aliases, `_rules`. `radius` — values plus `role` plus `_rules`. `shadow` — `_philosophy`, values, `role`, `dark_note`. `motion` — `duration`, `easing`, `role`, `_rules`. `layout` — breakpoints, containers, grid, z-index, `_rules`. `icon` — library, `iconify` (prefix and suffix the site renders from), style, stroke width, grid, live area, corner radius, caps, perspective, sizes, `set`, `metaphors`, `_rules`. See `references/iconography.md`. `logo` — files, min sizes, clearspace, permitted colours, construction, `_rules`.

`art_direction` — concept, principles, formula, hierarchy, weird detail, `_rules`. See `references/art-direction.md`.

`voice` — `attributes` as `{is, not, means}` triples, person, tense, sentence length, reading level, locale, `vocabulary.use` and `vocabulary.avoid` (as a map of banned word → replacement), punctuation, capitalisation.

`messaging` — one-liner, elevator, positioning, pillars with proof, proof points, boilerplate, CTA (`primary`, `secondary`, **`never`**), email signoff.

`imagery` — `photography` (point of view, types, recipe, samples, misuse, never, source — see `references/photography.md`), `illustration` (style, construction, source, never, next one, samples — see `references/illustration.md`), `charts`. Any sample with a `prompt` and a `src` can be generated with `assets/imagery.py brand`.

`type.webfonts.href` — the one stylesheet URL that loads every brand face; the site links it in `<head>`. `motion.principles` — three `{name, rule}` pairs in the brand's words. `layout.formats` — the surfaces made most often, each `{name, ratio, rule}`.

`provenance` — `{field: "stated" | "inferred" | "assumed"}` for everything the session did not settle from the user's own words, plus `breaks_if`, `expires`, `validate`.

The fully populated example lives in `assets/tokens.example.json`. Match its depth.

## BRAND.md — the file that changes agent output

### Five properties, in order of impact

**1 · Imperative and checkable.** An instruction is only real if a second agent could audit the output and return true or false. "Maintain a calm, confident tone" is unauditable and will be ignored because there is nothing to comply with. "No exclamation marks in product UI" is auditable by regex.

**2 · Ordered and numbered.** Numbered rules are citable. Agents write "per rule 14" in commit messages; a human can say "rule 14 is wrong" and you fix one line. Unnumbered bullet soup has no addressability.

**3 · Negatives outnumber positives — but every negative names its exception.** A model already knows how to make a button; it does not know that *this* brand's buttons are never pill-shaped. But an unconditioned negative gets over-applied: "never centre text" and the agent left-aligns the 404 page. Every taste rule carries its escape hatch: *"Body text is never centred. Exception: empty states, auth screens, deck covers."*

**4 · Thresholds, not adjectives.** "Generous whitespace" resolves to the model's prior for generous. "Section padding is `--space-9` (6rem) desktop, `--space-7` (3rem) below 768px" is deterministic. Convert every adjective you can into a number, a ratio or an enum.

**5 · Worked pairs with a one-line reason.** A do/don't pair teaches the underlying principle in a way a rule cannot, and the reason lets the agent generalise to cases you did not enumerate. Without the reason it pattern-matches the surface and misses the point.

### Ignored versus effective

| Ignored | Changes output |
|---|---|
| "Use our brand colours consistently." | "Accent (`--color-accent`) appears at most twice per viewport: one primary button, one active nav item. Everything else is ink or border." |
| "Typography should feel editorial." | "Headings use Fraunces at weight 400 with −0.02em tracking. Never below 1.35rem, never at weight 700." |
| "Avoid clutter." | "A card contains at most two type sizes and one accent element. If you need a third, split into two cards." |
| "Write in a friendly, professional tone." | "No exclamation marks. No 'Hey there'. Reader is 'you', company is 'we'. Average sentence under 18 words." |
| "Buttons should be modern." | "Buttons use `--radius-md` (8px). Pill radius is reserved for tags, avatars and count badges — a pill-shaped button is off-brand." |
| "Our brand is minimal." | "Prefer a 1px `--color-border-base` to a shadow. Cards are flat at rest, `--shadow-sm` on hover. Reason: shadows read as app chrome; this brand should read as printed matter." |
| "Use appropriate spacing." | "All spacing comes from `--space-1`…`--space-10`. If a value is not on the scale, round to the nearest step — never an arbitrary px value." |
| "Don't use AI buzzwords." | "Banned in all copy: seamless, revolutionary, unlock, empower, leverage, AI-powered, best-in-class, solution. If you catch yourself writing 'AI-powered X', write what it actually does instead." |

### Encoding taste

**Constraint plus exception.** `Never X. Exception: A, B, C.` The exception list is load-bearing — it stops the rule metastasising. If you cannot list exceptions, the rule is probably too broad.

**Reference-point triangulation.** Models have enormous latent knowledge of visual culture, and two lines of "this, not that" do more work than a page of adjectives:

> Looks like: Muji signage, Monocle's charts, a well-kept front-desk ledger.
> Does not look like: Linear's gradients, crypto dashboards, boutique-hotel gold foil, illustrated blob people.

This is the highest-leverage block in the file. It sets a prior that steers a thousand micro-decisions you will never write rules for. Put it near the top.

**A decision procedure for unlisted cases.** Taste is mostly the cases you did not anticipate, so give a tiebreaker:

> When a choice is not covered here, pick the quieter option: fewer colours, fewer sizes, less motion, more space. If two options are equally quiet, pick the one that reads more like print and less like an app.

### Length

**120–250 lines, under 2,500 tokens. 250 is a hard ceiling; the example is about 130 and complete.** Beyond that compliance measurably degrades, and it is imported into every session in that project, so it pays rent forever. Overflow goes into `tokens.json` `_rule` fields, read on demand and colocated with their values.

Budget: ~15 lines of frontmatter and core values · ~10 reference points · ~40 visual rules · ~40 voice · ~30 component recipes · ~20 do/don't · ~15 conflict and checklist.

### Conflict with the user

The failure runs both ways: an agent that ignores the brand file, and an agent that refuses a legitimate request because "the brand says sentence case". One paragraph, at the end, where it is read last and remembered:

> The user's instruction in this session overrides this file. Do it, then note in one line what you overrode: *"Used title case as you asked — brand default is sentence case."* Do not lecture, do not refuse, do not ask permission first.
> **Locked:** logo integrity, the contrast floor, legal boilerplate wording, and unverified claims. For these, say what breaks before you do it, and do it only if the user confirms.

`assets/BRAND.example.md` is the quality bar. Match it.

## site/ — the brand site

The human kit is a small Next.js site in the shape of `brand.klarna.com`: a manifesto home, **Our brand**, **How we speak**, **How we look** with one page per part of the visual system, **In use** and a **Toolkit**. The page catalogue is in `references/kit-pages.md`; the mechanics — copying it, the components, building, deploying — are in `references/site.md`. Three things govern it:

**It is rendered in the brand it documents.** The site's own furniture — background, type, headings, the colour bands that open each section — is built from the tokens. A brand book that does not look like the brand has already failed its own thesis.

**Every swatch, specimen, scale, icon and token table is rendered from `tokens.json` at build**, never typed into a page. Change a hex, rebuild, and the swatch, the contrast badge, the component demo and the spec table all move together.

**It builds to a plain static folder.** `npm run build` writes `site/out/`, which opens from any static host, deploys to Vercel as is, and can be zipped and emailed. Founders open it two years later from a link; it must not need a server.

## Wiring it into a project

Copy the `brand/` directory in, then three steps.

**1 · `CLAUDE.md`** gets the block from `assets/claude-md-block.md`. The `@brand/BRAND.md` import is the key mechanic: it is resolved at session start and inlined, so the rules are in context from turn one without the agent deciding to go and look. Do **not** `@`-import `tokens.json` — 4,500 tokens in every session for something needed in perhaps a fifth of them.

**2 · CSS.** `sync.py` writes `brand/theme.css` — every token as a CSS variable, light and dark, under the same names `BRAND.md` uses. Import it in the project's global stylesheet, or point Tailwind v4 at it:

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
