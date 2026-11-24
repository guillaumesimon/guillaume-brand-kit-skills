# Building the site

How `brand/site/` is made: copying the template, writing pages, the components, running it, and putting it online. What goes on each page is in `references/kit-pages.md`.

## What it is

A Next.js 16 app (App Router, MDX pages, static export) in `assets/site/`, filled with a worked example: Perch, a fictional hotel-operations company. Its tokens are `assets/tokens.example.json`, its rules `assets/DESIGN.example.md`, its photographs `assets/example-assets/`. Open it before writing anything — it is the quality bar, in depth and in tone.

To see the example running:

```bash
D=$(mktemp -d)/brand && mkdir -p $D
cp assets/tokens.example.json $D/tokens.json && cp -R assets/example-assets $D/assets && cp -R assets/site $D/site
cd $D/site && npm install && npm run dev        # http://localhost:3000
```

## How it works, in four lines

- `lib/tokens.ts` reads `../tokens.json` at build time and turns it into CSS variables (`--color-accent-base`, `--text-h1`, `--space-5`…) injected into `<head>`. Light and dark both.
- `site.css` styles the site's furniture **only** with those variables. No brand value is ever typed there.
- `components/kit.tsx` holds every building block. Each one that shows a value reads it from the tokens; pages pass prose, never values.
- Every page is `app/<route>/page.mdx`. All components are available in MDX without an import (`mdx-components.tsx`).

`scripts/copy-assets.mjs` mirrors `../assets` into `public/brand/` — linked in dev so freshly generated images appear on reload, copied at build so the export is self-contained. In tokens, files are written as `assets/photography/hero.webp`; components turn that into `/brand/photography/hero.webp`. A missing file renders as a labelled placeholder rather than a broken image, so the site builds before the imagery exists.

## Making a brand's site

```bash
mkdir -p brand
cp -R <skill>/assets/site brand/site
cd brand/site && npm install
```

Then, with `brand/tokens.json` written:

1. **`lib/nav.ts`** — delete the lines for pages you cannot fill honestly, and edit each blurb.
2. **Every `app/**/page.mdx`** — replace the Perch prose with the brand's, in the brand's voice. Keep the structure (hero → statement → principles → specimen → in practice → rules → misuse), not the sentences. Search for "Perch", "house", "GM" and "hotel" before you finish: a leftover example sentence on a real brand's site is the most embarrassing bug this skill can ship.
3. **The misuse rows** — the `<DoDont>` examples are rendered from JSX so they move with the tokens. Rewrite them against the mistakes *this* system invites.
4. **Icons** — if the set is not Lucide, set `icon.iconify` and `npm i -E @iconify-json/<prefix>`.
5. **Fonts** — `type.webfonts.href` is the one stylesheet URL that loads the brand faces. Self-hosted or licensed faces: put the files in `site/public/fonts/` and a `@font-face` block at the top of `site.css`, and leave `webfonts` out.

6. **The site's language.** Set `meta.site_locale` in the tokens (`"fr"`, `"en"`…). The site's own labels — Do / Don't, Instead of…, Copy, Previous — come from `lib/strings.ts`, which ships English and French; add a block there for any other language. The brand prose that lives in tokens (`_rules`, voice `means`, recipes, captions, `provenance.breaks_if`) stays in English in `tokens.json` for agents, and its translation goes in **`site/locale.json`**: the same shape as `tokens.json`, prose fields only, laid over the tokens when the site builds. Arrays merge item by item, so a translated caption keeps its `src`. Never put a value in it.
7. **The brand's own furniture.** The template is the brand's grammar, not its personality. The one weird detail, the graphic device and the wordmark treatment belong in the site too — add them as a clearly marked block at the end of `site.css` (a class for the device, a rule for headline accents) and use them in the pages. A brand site without its device looks like a template that was recoloured.

Run it with `npm run dev` and look at **every page, at desktop and at phone width**, in light and dark, before showing it to anyone. The failure modes are visible in a second: a band whose text has no contrast, a specimen sample that is still Perch's, a placeholder where an image should be.

## What the site expects in tokens.json

The components read these keys. A brand may add anything; renaming or dropping one of these breaks a page quietly, so keep the shape of `tokens.example.json`:

- `meta.name`, `.tagline`, `.version`, `.updated`, `.organising_principle`, `.weird_detail`, `.site_locale`
- `color.semantic.{light,dark}.{surface,ink,accent,border,state}` with `surface.page/raised/sunken/inverse`, `ink.strong/base/muted/inverse`, `accent.base/hover/subtle/on`, `border.hairline/base/strong`, `state.success/warning/danger/focus`. Optional `accent.text` — the accent as a *text* colour. Without it the site uses `accent.base` when it passes 4.5:1 on the page and `ink.strong` when it does not, so a yellow or pink accent becomes a fill and never unreadable text.
- `color.palette`, `color._ratio`, `color._rules`
- `type.webfonts.href`, `type.family.{display,text,mono}.stack`, `type.scale.step`, and `type.role.{display,h1,h2,h3,lead,body,label,caption,button,metric,quote}` each with `family`, `size` (a step name), `weight`, `leading`, `tracking`, optional `case`, `style`, `_sample`
- `space.1`–`space.10` — the site's own rhythm uses `space.1`–`space.9`, so a longer ramp is fine but those steps must keep their meaning — `radius.{sm,md}` plus `radius.role.{button,card,image}`, `shadow`, `motion.{duration,easing,role,principles}` with `duration.fast/base` and `easing.standard`, `layout.{grid,container,breakpoint,formats}`
- `icon.{iconify,stroke_width,grid,live_area,corner_radius,size,set,metaphors}`, `logo`, `art_direction`, `voice`, `messaging`, `imagery.{photography,illustration}`, `provenance`

## The logo

Until a drawn mark exists, the site sets the brand name in the display face wherever `logo.*` points at a missing file — which is honest for a v1 wordmark and keeps every page building. Mark `logo` as `assumed` in `provenance` and say on the Logo page that the files are to come. When there is a mark, export SVGs with the text **outlined** (a live-text SVG renders in a fallback font inside an `<img>`), put them in `brand/assets/logo/`, and point `logo.primary`, `.mark` and `.wordmark` at them.

## The components

All take their values from tokens. The ones that read a token path accept `path`.

**Furniture** — `PageHero` (`label`, `title`, `lead`, `tone`, `provenance`, `check`), `SectionBar`, `Block` (`id`, `title`, `label`, `lead`, `tone`: page · sunken · inverse · accent), `Prose`, `Statement`, `Split` (`even`), `Grid` (`cols`), `Card` (`label`, `title`), `Tiles` (`hrefs`, `accentFirst`), `T` (one token value inline: `<T path="meta.tagline" />`).

**Rules and principles** — `Principles` (`items` of `{title, body}`), `Principle`, `TokenPrinciples` (a token list of `{name, rule}`), `Rules` (the `_rules` of any block), `Recipe` (any `{key: rule}` object as a definition list), `Table` (`path`, `cols="key:Label,…"`), `List` (`path`, `strike`).

**Do and don't** — `DoDont` (`kind`: do · dont, `caption`, `why`, `src`, `bg`, children rendered as the example), `DoDontGrid`, `ImageRules` (a token list of `{kind, src, caption}`).

**Voice** — `IsNot`, `InsteadOf` (`limit`), `Lexicon`, `Rewrite` (`before`, `after`), `VoiceMechanics`, `Messaging`.

**Colour** — `Swatches` (`theme`, `groups`), `Ramps`, `Dominance`, `ThemePair`.

**Type** — `TypeFamilies`, `TypeRoles` (`only`), `TypePlatforms`.

**Layout** — `LayoutGrid` (children = the example composition; adds the Example / Grid setup toggle), `LayoutSpec`, `SpaceBars`, `Radii`, `Shadows`, `Formats`.

**Imagery** — `ImageWall` (`path`, default `imagery.photography.samples`), `PhotoTypes`, `Icon` (`name`, `size`, `stroke`), `IconWall`, `IconSizes`, `IconAnatomy`, `Logo` (`which`, `tone`), `ClearSpace`.

**Motion** — `Motion` (one hoverable lane per `motion.role`).

**Toolkit** — `RootCss`, `Code` (`text`), `TokenTable` (`path`, `prefix`), `Limits`, `CopyButton`.

When a page needs something no component covers, write it as JSX inline in the page using the `t-*` type classes and the CSS variables — never a literal value. If the same thing is needed on two pages, it becomes a component.

## Building and putting it online

```bash
npm run build          # writes site/out/, a plain static folder
npm start              # serves out/ locally to check the export
```

`out/` opens from any static host. On Vercel it deploys as is: link the project with its root directory set to `brand/site`. Follow the user's own rules for deploys: a **preview** deploy is the default, production only when they ask for it, and nothing goes online before they have seen it locally. A brand site is not secret, but it is unannounced work: say before deploying that a preview URL is reachable by anyone who has it.

Do not deploy it as part of the session by reflex. The deliverable is the folder; the URL is a step the user takes when they are ready to show it.
