---
version: alpha
name: Linear
description: Marketing site of linear.app. Near-black ground, one grey ramp, Inter at unusual weights, depth from hairlines instead of shadows.
source:
  live: https://linear.app/
  measured: 2026-11-24, 1440x900 viewport, computed styles
colors:
  ground: "#08090A"
  surface: "#0F1011"
  surface-raised: "#101112"
  overlay-1: "rgba(255,255,255,0.02)"
  overlay-2: "rgba(255,255,255,0.04)"
  text-primary: "#F7F8F8"
  text-secondary: "#D0D6E0"
  text-tertiary: "#8A8F98"
  text-quaternary: "#62666D"
  hairline: "rgba(255,255,255,0.08)"
  hairline-strong: "rgba(255,255,255,0.12)"
  border-solid: "#23252A"
  cta: "#E5E5E6"
  on-cta: "#08090A"
  brand-indigo: "#5E6AD2"
  status-green: "#27A644"
  status-red: "#EB5757"
  status-yellow: "#F0BF00"
  status-blue: "#4EA7FC"
typography:
  display-xl:
    fontFamily: Inter Variable
    fontSize: 72px
    fontWeight: 510
    lineHeight: 1
    letterSpacing: -0.022em
  display:
    fontFamily: Inter Variable
    fontSize: 64px
    fontWeight: 510
    lineHeight: 1
    letterSpacing: -0.022em
  h2:
    fontFamily: Inter Variable
    fontSize: 48px
    fontWeight: 510
    lineHeight: 1
    letterSpacing: -0.022em
  lead:
    fontFamily: Inter Variable
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: -0.012em
  h3:
    fontFamily: Inter Variable
    fontSize: 20px
    fontWeight: 590
    lineHeight: 1.33
    letterSpacing: -0.012em
  body:
    fontFamily: Inter Variable
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: -0.011em
  small:
    fontFamily: Inter Variable
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.01em
  label-mono:
    fontFamily: Berkeley Mono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    textTransform: uppercase
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  unit: 4px
  gap-tight: 4px
  gap: 8px
  gap-loose: 12px
  section-y: 128px
  page-max: 1436px
  gutter: 32px
motion:
  fast: 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)
  base: 160ms cubic-bezier(0.25, 0.46, 0.45, 0.94)
  reveal: 700ms cubic-bezier(0.32, 0.72, 0, 1)
components:
  button-primary:
    backgroundColor: "{colors.cta}"
    textColor: "{colors.on-cta}"
    typography: "{typography.small}"
    fontWeight: 510
    height: 32px
    padding: 0 12px
    rounded: "{rounded.full}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.text-tertiary}"
    height: 32px
    padding: 0 12px
    rounded: "{rounded.full}"
  list-row:
    backgroundColor: "{colors.overlay-2}"
    textColor: "{colors.text-secondary}"
    height: 28px
    padding: 0 7px
    rounded: "{rounded.md}"
  chip:
    border: 1px solid #2E2E32
    textColor: "{colors.text-secondary}"
    height: 24px
    rounded: "{rounded.xl}"
  header:
    position: fixed
    height: 73px
    backgroundColor: rgba(11,11,11,0.8)
    backdropFilter: blur(20px)
---

# Linear

## Overview

A dark, almost colourless page that reads as a piece of software rather than as advertising. The product UI is the illustration: real issue lists, inboxes and diffs sit inside the page at near full size. Everything else steps back. One typeface, one grey ramp, no drop shadows, and a primary button that is light grey rather than a brand colour.

The tone is calm and exact. Density is high inside the product mockups (13px text, 28px rows) and very low around them (128px between sections).

## Colors

- **Ground `#08090A`, surface `#0F1011`.** Neither is pure black. The two are close enough that panels are separated by a hairline, not by contrast.
- **Text is a four-step ramp:** `#F7F8F8` for headings, `#D0D6E0` for emphasised body, `#8A8F98` for body and navigation, `#62666D` for captions and legal. Most text on the page is the second and third steps, not the first.
- **Hairlines are white at 8% alpha** (12% for emphasis). Borders are never an opaque grey on the marketing surfaces.
- **The call to action is `#E5E5E6` with `#08090A` text.** The brand indigo `#5E6AD2` exists but covers well under 1% of the page: focus states, a logo tint, small product accents.
- **Status colours** (green, red, yellow, blue) appear only inside product mockups, and usually as a tint at 7 to 10% alpha behind a label.
- A second heading tone: an `h2` may be set entirely in `#8A8F98`, or start in `#F7F8F8` and finish in grey, to rank two sentences without changing size.

## Typography

- **Inter Variable for everything**, with `SF Pro Display` as fallback. The weights are the signature: **510 for medium and 590 for semibold**, where a default system would use 500 and 600. Bold is 680. Regular is 400, with 300 used sparingly.
- **Display sizes have a line height of 1 and tracking of -0.022em.** 64px for the page `h1`, 48px for section `h2`, 72px for the closing statement.
- **Body is 15px on 24px**, slightly under the usual 16px, with -0.011em tracking. Interface text is 13px.
- Ratio of largest type to body: 72 to 15, about 4.8 to 1.
- **Berkeley Mono, 12px, uppercase**, for eyebrow labels and code. It is the only second voice on the home page.
- A serif (`Tiempos Headline`) is declared and used on editorial pages such as the Method page, at very large sizes, centred.

## Layout

- Content runs to about 1436px with 32px gutters. Headlines are left aligned and wide (up to 1250px), text columns stop near 540 to 620px.
- Sections are separated by 128px top and bottom.
- Inside components the scale is 4px based and small: 4, 6, 8, 12. 8px is the default gap.
- Typical section: mono eyebrow, large two-tone heading, then a product panel that spans the full container. Feature groups use two or three columns divided by hairlines rather than cards with gaps.
- Header: fixed, 73px, translucent `rgba(11,11,11,0.8)` with a 20px backdrop blur. Navigation links are 13px grey pills, 32px tall.

## Elevation & Depth

- The shadow tokens are all set to none. Depth comes from three devices: a 1px ring (`0 0 0 1px rgba(0,0,0,0.2)`), an inset white ring at 5 to 8% alpha on raised surfaces, and a white overlay at 1 to 4% alpha to lift a row or panel.
- One soft ambient shadow (`0 2px 32px rgba(0,0,0,0.25)`) is reserved for floating product windows.
- Product panels are sometimes tilted in perspective and fade into the ground at their edges through a mask.

## Shapes

- Radius scale: 4, 6, 8, 12, 16, then full pill. 8px for rows and inputs, 12px for panels, pill for buttons and nav items, circles for avatars and status dots.
- Buttons are small: 32px tall on the marketing page, 28px rows and 24px chips in the product.

## Motion

- Interactions are short: 100ms and 160ms on an ease-out-quad curve `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
- Larger reveals use 700ms on `cubic-bezier(0.32, 0.72, 0, 1)`.
- A full named easing set (quad to expo, in, out, in-out) is defined as tokens.

## Components

- **Primary button:** light grey pill, dark text, 13px at weight 510, 32px tall, 12px side padding, a very faint stacked shadow.
- **Ghost button and nav link:** same geometry, no fill, text `#8A8F98`.
- **List row:** 28px tall, 8px radius, hover or selected state is a 4% white fill.
- **Chip:** 24px tall, 16px radius, 1px `#2E2E32` border, 12px text with a leading icon or dot.
- **Prompt and input surface:** `#0F1011` plus a 4% white overlay, 8px radius, 10px padding, 1px dark ring.
- **Footer:** five columns, 13px, headings in `#F7F8F8` at 510, links in `#8A8F98`, legal in `#62666D`.

## Do's and Don'ts

- Do let real product UI carry the page. Do not add illustrations or stock imagery next to it.
- Do rank text with the grey ramp before reaching for size or weight.
- Do separate surfaces with an 8% white hairline. Do not use drop shadows on cards.
- Do keep the primary action neutral. Do not fill buttons with the brand indigo.
- Do keep display type tight (line height 1, negative tracking). Do not centre long paragraphs.
- Do not introduce a second hue outside product status colours.

## What to borrow

- The 510 / 590 weight pair: a small deviation from defaults that changes the whole texture.
- A neutral primary button on a dark ground, which leaves the brand colour free to mean "focus" or "selected".
- Hairlines and overlays as the only elevation system.

## Evolution, as seen on Mobbin

Mobbin keeps several generations of the site, useful to see what was dropped:

- [2022: gradient headline and indigo gradient button](https://mobbin.com/sites/sections/40a46191-a57a-4bab-9a92-94fc14cad817)
- [Earlier: bold headline, blue to red glow, indigo button](https://mobbin.com/sites/sections/0c5ba4e7-fd0e-458a-9922-4584dacbdec8)
- [Features hero with glowing icon grid](https://mobbin.com/sites/sections/c5db0cc6-cd72-4388-b14e-2c7ae294bd0e)
- [Projects page, two column heading](https://mobbin.com/sites/sections/a0a0bf38-ae87-4276-b209-f5a8f5774da7)
- [Neutral period: floating pill nav, tilted product panel](https://mobbin.com/sites/sections/b8f0bfb5-9da2-45b1-978f-1251f7ec3a49)
- [Left aligned hero with light grey button](https://mobbin.com/sites/sections/f1148b2c-af7e-451c-a2a4-3f8740f58596)
- [Older footer and closing call to action](https://mobbin.com/sites/sections/db0da4a6-735a-4fe8-8722-8fbd154d4496)
- [Method page with serif display](https://mobbin.com/sites/sections/66f59864-ae93-419b-89c9-e53fbb46a3f3)

The direction over time is removal: the gradients, glows and coloured buttons went, the grey ramp and the product stayed.
