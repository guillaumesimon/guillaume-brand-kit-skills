---
version: alpha
name: Perch interface
description: "The interface system for Perch: colour roles, type scale, spacing, shape, motion and components."
brand: ./BRAND.md
colors:
  surface-page: "#FBF7F1"
  surface-raised: "#FFFFFF"
  surface-sunken: "#F4EDE3"
  surface-inverse: "#141110"
  ink-strong: "#141110"
  ink: "#241E1A"
  ink-muted: "#6E6156"
  ink-faint: "#A79D92"
  ink-inverse: "#FBF7F1"
  accent: "#1F5D45"
  accent-hover: "#153F2E"
  accent-subtle: "#DCEBE4"
  accent-on: "#FBF7F1"
  border-hairline: "#E8DFD1"
  border: "#D6CCBE"
  border-strong: "#A79D92"
  state-info: "#2C5E8A"
  state-success: "#153F2E"
  state-warning: "#B4562B"
  state-danger: "#9E2B25"
  state-focus: "#2E7A5C"
  dark:
    surface-page: "#141110"
    surface-raised: "#1E1A17"
    surface-sunken: "#0D0B0A"
    surface-inverse: "#FBF7F1"
    ink-strong: "#FBF7F1"
    ink: "#E4DDD3"
    ink-muted: "#A79D92"
    ink-faint: "#6E6156"
    ink-inverse: "#141110"
    accent: "#2E7A5C"
    accent-hover: "#86B9A4"
    accent-subtle: "#17342A"
    accent-on: "#FBF7F1"
    border-hairline: "#2A2420"
    border: "#3A332D"
    border-strong: "#6E6156"
    state-info: "#9DC2E0"
    state-success: "#86B9A4"
    state-warning: "#E0A268"
    state-danger: "#E09A95"
    state-focus: "#86B9A4"
typography:
  display:
    fontFamily: Fraunces
    fontSize: 4rem
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.028em"
  h1:
    fontFamily: Fraunces
    fontSize: 3rem
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-0.024em"
  h2:
    fontFamily: Fraunces
    fontSize: 1.75rem
    fontWeight: 400
    lineHeight: 1.18
    letterSpacing: "-0.016em"
  h3:
    fontFamily: Inter
    fontSize: 1.375rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.008em"
  lead:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.004em"
  body:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  label:
    fontFamily: IBM Plex Mono
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.10em
  caption:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.008em
  button:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.004em
  metric:
    fontFamily: Fraunces
    fontSize: 2.25rem
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.03em"
  quote:
    fontFamily: Fraunces
    fontSize: 1.375rem
    fontWeight: 300
    lineHeight: 1.35
    letterSpacing: "-0.01em"
rounded:
  none: 0px
  sm: 0.25rem
  md: 0.5rem
  lg: 0.75rem
  pill: 999px
spacing:
  "1": 0.25rem
  "2": 0.5rem
  "3": 0.75rem
  "4": 1rem
  "5": 1.5rem
  "6": 2rem
  "7": 3rem
  "8": 4rem
  "9": 6rem
  "10": 8rem
motion:
  hover:
    duration: 150ms
    timingFunction: cubic-bezier(.16, 1, .3, 1)
  dropdown:
    duration: 240ms
    timingFunction: cubic-bezier(.16, 1, .3, 1)
  modal:
    duration: 320ms
    timingFunction: cubic-bezier(.16, 1, .3, 1)
  exit:
    duration: 150ms
    timingFunction: cubic-bezier(.7, 0, .84, 0)
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-on}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "{spacing.3}"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-page}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "{spacing.3}"
  card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.5}"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: 44px
  table-header:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
  tag:
    backgroundColor: "{colors.accent-subtle}"
    textColor: "{colors.accent-hover}"
    rounded: "{rounded.pill}"
---

## Overview

This design system expresses the Perch brand (`@BRAND.md`) on every screen Perch builds: the product, the marketing site, the decks. BRAND.md decides meaning, voice, vocabulary and claims; this file decides applied visuals.

The front matter is written from `tokens.json` by `sync.py`. Change a value there, never here. Every token is also a CSS variable in `theme.css`, under one mapping: drop `semantic.<theme>.`, join the rest with `-`, prefix `--`. So `colors.ink-muted` is `--color-ink-muted`, `spacing.5` is `--space-5`, `typography.body` is `--text-body`, `rounded.md` is `--radius-md`. Use the variables; never type a hex or a pixel value.

The brand colours, given a role:

| Role | Brand colour |
|---|---|
| `accent` | Moss |
| `ink` | Ink |
| `surface-page` | Paper |

Everything else (`surface-raised`, `border-*`, `state-*`, the dark theme) is designed here and is not a brand colour.

## Colors

- **Accent** {colors.accent} appears at most twice per viewport: one primary action and one active navigation item. Everything else is ink, paper or hairline.
- **Surface page** {colors.surface-page} is the body background. Pure white ({colors.surface-raised}) is for raised cards only.
- **State colours** are never decorative. Warning means something needs attention; if nothing does, nothing is that colour.
- **Dark mode:** the accent steps up to `dark.accent`. Shadows are invisible on dark: separate surfaces with `border`.
- Body text meets 4.5:1 against its background; borders and large text meet 3:1.

## Typography

- Fraunces is for `display`, `h1`, `h2`, `quote` and `metric`. Inter is for everything else. Never Fraunces below 1.375rem.
- Body is `typography.body`, larger than you would default to: GMs read on a desk monitor at arm's length. The measure is capped at 68ch (`--container-prose`); a full-width paragraph is a bug.
- Body text is never centred. Exception: empty states, auth screens, deck covers, the 404.
- Sentence case for every heading, button, label and menu item. Exception: proper nouns and the mono index labels, which are uppercase.
- At most two type sizes inside one card. If you need three, split the card.
- Numbers in tables and metrics are right-aligned with `font-variant-numeric: tabular-nums`.

## Layout

- Every spacing value is a step of `spacing` (4px base). Not on the scale? Round to the nearest step.
- Section rhythm is `spacing.9` on desktop and `spacing.7` below 768px.
- Content is left-aligned to a 12-column grid, with one deliberate asymmetric split per page: 7/5, not 6/6.
- **The device.** Every substantial surface carries the index label top-left (`typography.label`, uppercase, `ink-muted`), and every heading is followed by a 1px `border-hairline` rule across the full column.

## Elevation & Depth

Prefer a 1px `border-hairline` to a shadow: the ledger line is the device, and a shadow competes with it. Cards are flat at rest and take `--shadow-sm` on hover. Only things that genuinely float, dropdowns and modals, take `--shadow-md`.

## Shapes

Buttons and inputs use `rounded.md`, cards `rounded.lg`. Tables and data grids are square. Pill radius is for tags, avatars and count badges only: a pill-shaped button is off-brand. Nested radii decrease inward.

## Motion & Micro-interaction

Hover is `motion.hover`, most transitions `motion.dropdown`, and nothing runs longer than `motion.modal`. Honour `prefers-reduced-motion`: collapse durations to zero and keep opacity.

## Components

- **Primary button:** `button-primary`, weight 600, sentence case. Hover darkens to `button-primary-hover` over `motion.hover`. No shadow, and no icon unless the action is destructive or external.
- **Secondary button:** transparent with a 1px `border` line and ink text; hover sets `border-strong`. Never two filled buttons in one row.
- **Card:** `card`, 1px `border-hairline`, flat at rest, index label top-left.
- **Input:** `input`, 1px `border`, label above in `typography.label`. Focus is a 2px `state-focus` ring at 2px offset. Never `outline: none` without a replacement ring.
- **Table:** square corners, `border-hairline` row rules only. No vertical rules, no zebra striping. Header row is `table-header`.
- **Chart:** series in the order moss, slate, clay, ink, light moss. Axis in `ink-muted`, gridlines in `border-hairline`. Direct labels over a legend where they fit. No 3D, no donut above four segments.
- **Tag:** `tag`. The only pill shape in the interface besides avatars and counts.

## Do's and Don'ts

- Don't build a centred, gradient hero with a pill button and an emoji. It is the default generated landing page and the opposite of Perch.
- Don't write lorem ipsum. Use plausible hotel data: "Harbour View, 64 rooms, 81% occupancy, Thursday 18 September".
- Don't hardcode a hex or a pixel value. Every colour and every space comes through a variable.
- Do check before finishing: accent used at most twice per viewport; every spacing value on the scale; sentence case everywhere; body copy left-aligned and under 68ch; the index label on every substantial surface; focus rings visible; correct in light and dark.
