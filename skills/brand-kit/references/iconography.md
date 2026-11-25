# Iconography

Icons are the most-used and least-discussed part of a visual identity. Every screen has a dozen of them and nobody chose them: they arrived with the component library. That is how a brand with a precise serif and a hairline grid ends up with chunky rounded icons that belong to someone else.

Two things make icons a brand decision rather than a developer default: **the drawing language** (weight, corners, fill, detail) and **the vocabulary** (which concept gets which picture, always).

## Show, do not ask

Open `assets/icon-styles.html`: **the same twelve concepts drawn in seven languages**, each also shown at 16px beside a word.

| # | Style | Set (Iconify) | Says |
|---|---|---|---|
| 1 | Fine line | Phosphor Light | precise, quiet, premium |
| 2 | Neutral outline | Lucide | clear, familiar, neutral |
| 3 | Bold outline | Phosphor Bold | confident, friendly |
| 4 | Sharp and square | Material Symbols Sharp | engineered, systematic |
| 5 | Solid | Phosphor Fill | graphic, instant |
| 6 | Duotone | Phosphor Duotone | crafted, a little illustrated |
| 7 | Pixel | Pixelarticons | playful, nostalgic |

Put the brand into the hash so the comparison is honest — the icon colour, the accent, the surface, and **a real word from the product** for the 16px row, because 16px beside a label is where most icon styles fail and where they will actually live:

```
icon-styles.html#ink=241E1A&accent=1F5D45&card=FBF7F1&label=Occupancy
```

Icons render live from `api.iconify.design`, so the board needs a network connection and a real browser — serve `assets/` with `python3 -m http.server` and open it in the browser pane.

Same question as every board: *which two could be yours, which one is definitely not.* Notes are hidden; say them when asked.

**Often you should not run this board at all.** For a brand whose ledger is already settled, the style follows from the type and the shape language with more than 70% confidence: a hairline serif system takes Fine line or Neutral outline at a thin stroke; a rounded bold sans takes Bold outline; a square-cornered technical system takes Sharp. Assert it with a one-line reason and a free undo. Run the board when the type is still open, or when the product is icon-heavy (a dashboard, a mobile app with a tab bar) and the user clearly has an opinion.

## The spec — what has to be decided

Hard numbers, so a new icon can be drawn or picked without asking anyone. IBM and Atlassian publish the best public versions of this; the parameters follow theirs.

| Parameter | Default | Notes |
|---|---|---|
| **Set** | Lucide | One set. Never mixed, never with emoji. |
| **Style** | outline | Filled is reserved for the active or selected state. |
| **Grid** | 24px | Drawn on 24, scaled down. A 16px-native set (Radix, Atlassian) is denser. |
| **Live area** | 20px | 2px padding; artwork enters it only for weight or a needed detail. |
| **Stroke** | 1.5px | 1.25 for fine and technical, 1.75–2 for warm and friendly. Never mixed inside a set. |
| **Corner radius** | 2px | Match the UI's smallest radius. Rounded outside, square inside is IBM's and Atlassian's rule. |
| **Caps and joins** | round | Or butt — pick one. Square caps read engineered. |
| **Perspective** | straight-on or profile | Never 3D, never isometric. |
| **Sizes** | 16 / 20 / 24 | A 16px icon beside 16px text usually needs to be drawn at 18–20px to look equal. |
| **Metaphors** | one concept, one icon | Written down as a map, so occupancy is always the same bed. |

The stroke and the corner should agree with the type and the illustration. An icon set at 1.5px beside a 2.5px illustration line reads as borrowed. The cheapest way to make a stock set look owned is to take one detail from the typeface — IBM's icons borrow Plex's pointed tips and square caps.

**The metaphor map is the part everyone skips and the part that matters most.** Write the product's own nouns down and give each one icon, forever: `"occupancy": "bed-double"`. Without it, three agents will draw occupancy three ways in a month. Atlassian's guidance is the right instinct here: reuse an existing icon before adding one, use universal symbols rather than cultural references, and ask first whether the thing needs an icon at all.

## How it reaches the site

The site renders icons at build time from Iconify's open sets, so whatever was picked on the board works without code changes:

```json
"icon": {
  "library": "Phosphor Light",
  "iconify": { "prefix": "ph", "suffix": "-light" },
  "stroke_width": null,
  …
}
```

Then `npm i -E @iconify-json/ph` in `brand/site`. Stroke-based sets (Lucide, Tabler) take `stroke_width`; weight-based sets (Phosphor) carry the weight in the suffix and ignore it. Names in `icon.set` and `icon.metaphors` are the set's own names without the suffix — check them at <https://icon-sets.iconify.design>.

## What to write into the kit

`tokens.json → icon`: library, iconify, style, stroke_width, grid, live_area, corner_radius, caps, joins, perspective, size, set (the 8–16 icons the product actually uses, shown on the site), metaphors, `_rules`.

`BRAND.md` → Imagery → `### Icons`: the library and the drawing language in one or two sentences ("Lucide, outline, 1.5px stroke on a 24px grid. Filled only for the active state. One concept, one icon: `icon.metaphors` maps them."), and one checkable rule:

```yaml
rules:
  - verdict: dont
    rule: Never mix Lucide with another icon set or with emoji.
    exception: none
```

Sizes, the label-or-tooltip rule and optical sizing beside text are interface rules: `DESIGN.md` → Components.
