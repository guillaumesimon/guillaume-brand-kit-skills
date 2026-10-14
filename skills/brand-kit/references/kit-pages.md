# The pages of the site

What each page of `brand/site/` is for, what belongs on it, what does not, and where its content comes from. The mechanics — components, building, deploying — are in `references/site.md`.

The shape follows `brand.klarna.com`, which is the best public brand site of its kind: a manifesto first, then **Our brand**, **How we speak**, **How we look** (a hub with one page per part of the system), then **In use** and a **Toolkit**. The structure is borrowed; the content never is.

**Delete any page you cannot fill.** Remove its line in `lib/nav.ts` and its folder in `app/`. An empty page is worse than a missing one.

---

## The page template

Every detail page follows the same rhythm, in this order, because it is the order in which people understand a rule:

1. **Hero** — `<PageHero>`: the label, a title, one lead sentence, the provenance badge. The title is a claim in the brand's own voice where it can be ("The house at work."), the section name where it cannot ("Colour").
2. **Section bar** — `<SectionBar />`, sticky, generated from the blocks below.
3. **Statement** — one sentence, set huge. What this part of the system is *for*.
4. **Principles** — at most three, numbered, each one a decision that forbids something.
5. **Specimen** — the thing itself, rendered from tokens: swatches, type at size, the icon set, the motion lanes.
6. **In practice** — the rule applied to real surfaces or real images.
7. **Rules** — `<Rules path="…" />`, the `_rules` of that token block, numbered.
8. **Misuse, always last** — at most six don'ts, each *Don't X — because Y. Instead Z.* Rendered, never described.

Alternate the band tones (`tone="sunken"`, `"inverse"`, `"accent"`) so the page shows the palette as you scroll, as Klarna's does. One `accent` band per page at most; it is the loudest thing in the system.

**Write in the brand's voice.** The guidelines are the first long piece of writing in the new voice, and the most-read. Short blocks — one to three sentences — imperatives for rules, the brand's own vocabulary. A guidelines site written in consultant English contradicts the How we speak page it contains.

---

## Home — the manifesto

Not a table of contents. A few full-width bands, each one sentence, set at billboard size, the background switching between the brand's colours as you scroll: the tagline, what we believe, how it should feel. Then the tiles into the guidelines, then **What this kit is, and is not** (`<Limits />`): this breaks if…, three things to check this week, what is still assumed.

**Belongs:** the founder's own words, verbatim where possible. **Does not:** rules, a values wall, a mission statement written by committee.

## Our brand

The strategic core: why we exist (the tension, as two true things in collision), the idea (in three to seven words, with what it means we build, say, do and **refuse**), who it is for (one audience, and the moment they realise they need us), where we stand (frame / difference / reason to believe), our personality (contrast pairs, `<IsNot />`), what we stand against, and what we turned down (the rejected routes — boundaries, not leftovers).

**Test:** the sacrifice line. If the idea forbids nothing, it is not a position. **Never invent a reason to believe** — if there is none, the card says "no structural reason to believe yet".

## How we speak

Our voice (`<IsNot />`), **Instead of… we say…** (`<InsteadOf />`, on an accent band, set huge — the most memorable block on the whole site), rewrites (`<Rewrite>`, three real sentences before and after), when it gets hard (error, price, bad news, a win), words (`<Lexicon />`), mechanics (`<VoiceMechanics />`) and what we say about ourselves (`<Messaging />`, every block copyable).

Founders use the Messaging block more than any other page after Colour: press, app stores, bios, investor updates.

## How we look — the hub

A statement of the organising principle (*even without the logo, our work is recognisable because…*), the one weird detail shown and explained, then tiles into each part of the system. Inspiration first; rules live on the pages behind it.

### Logo
Lockups in the permitted colourways only, how it is made, clear space and minimum size, rules, misuse (six, against the mistakes this mark invites — ratio, tracking, colour role — not "don't stretch the logo"). **Does not:** a golden-ratio construction grid.

### Art direction
The concept huge, the principles, the formula (`<Recipe path="art_direction.formula" />`), the imagery in practice, the hierarchy table, the rules. See `references/art-direction.md`. No misuse row here — misuse lives on the page of the ingredient that was misused.

### Colour
Roles first (`<Swatches />`, every swatch a copy button with a live contrast badge), the ratio (`<Dominance />`), light and dark side by side (`<ThemePair />`), the raw palette (`<Ramps />`), rules, misuse.

### Typography
The faces (`<TypeFamilies />`), the hierarchy at real size (`<TypeRoles />`), website versus app (`<TypePlatforms />`), rules, misuse. **Does not:** a full glyph set.

### Layout
The grid with its **Example / Grid setup** toggle over a real composition (`<LayoutGrid>`), the numbers and the spacing ramp, formats at their true ratio (`<Formats />`), shape and depth (`<Radii />`, `<Shadows />`), rules.

### Photography
Point of view, what we shoot (`<PhotoTypes />`), the recipe, in practice (`<ImageWall />`), what we never shoot, misuse (`<ImageRules path="imagery.photography.misuse" />`), where images come from. See `references/photography.md`. While the samples are generated, the page is `assumed` and says so under the hero.

**If the answer is none:** say so as a decision with what replaces it, the way the illustration page does.

### Iconography
The set with each icon named for what it means here (`<IconWall />`), the anatomy on its grid (`<IconAnatomy />`), sizes, rules, misuse. See `references/iconography.md`.

### Illustration
If the brand illustrates: the territory, the construction rules, the subject boundary, samples (`<ImageWall path="imagery.illustration.samples" />`), and **who draws the next one**. If it does not: the decision, what replaces it, what is never drawn, and when to revisit. See `references/illustration.md`. A page that shows drawings without saying where the next one comes from is decoration.

### Motion
Principles, the lanes to feel it (`<Motion />`, hover or tap), durations and easing tables, rules including reduced motion.

## In use

Four to six surfaces rendered in HTML from the tokens, never pasted images: a web hero, a dense product screen, a social square, a business card or email signature — and **the sombre test**, the outage or bad-news message, because a system that cannot carry bad news is a costume. Then the system-level do and don't.

Real copy, always. Lorem ipsum hides every hierarchy and measure problem.

## Toolkit

The files and what each is for, the CSS variables (`<RootCss />`, the same block `sync.py` writes to `brand/theme.css`), the Tailwind fragment, the `CLAUDE.md` block, every token as a table, and how the kit is kept true — including the expiry: revisit at the next funding round, the first marketing hire, or 3× revenue.

---

## Pages to cut

The brand story essay · the mood board · the values wall on a gradient · the logo construction grid · the stationery suite nobody prints · the mascot · the full glyph set · persona cards with stock photography.

They inflate the site, they age badly, and no one returns to them.
