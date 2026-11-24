---
# Perch v1.0.0. Generated from tokens.json by sync.py: edit tokens.json, not this block.
version: alpha
name: "Perch"
description: "Operations intelligence for independent hotels. Know your house."
colors:
  primary: "{colors.accent-base}"
  surface: "{colors.surface-page}"
  on-surface: "{colors.ink-base}"
  error: "{colors.state-danger}"
  surface-page: "#FBF7F1"
  surface-raised: "#FFFFFF"
  surface-sunken: "#F4EDE3"
  surface-inverse: "#141110"
  ink-strong: "#141110"
  ink-base: "#241E1A"
  ink-muted: "#6E6156"
  ink-faint: "#A79D92"
  ink-inverse: "#FBF7F1"
  accent-base: "#1F5D45"
  accent-hover: "#153F2E"
  accent-subtle: "#DCEBE4"
  accent-on: "#FBF7F1"
  border-hairline: "#E8DFD1"
  border-base: "#D6CCBE"
  border-strong: "#A79D92"
  state-info: "#2C5E8A"
  state-success: "#153F2E"
  state-warning: "#B4562B"
  state-danger: "#9E2B25"
  state-focus: "#2E7A5C"
  dark-surface-page: "#141110"
  dark-surface-raised: "#1E1A17"
  dark-surface-sunken: "#0D0B0A"
  dark-surface-inverse: "#FBF7F1"
  dark-ink-strong: "#FBF7F1"
  dark-ink-base: "#E4DDD3"
  dark-ink-muted: "#A79D92"
  dark-ink-faint: "#6E6156"
  dark-ink-inverse: "#141110"
  dark-accent-base: "#2E7A5C"
  dark-accent-hover: "#86B9A4"
  dark-accent-subtle: "#17342A"
  dark-accent-on: "#FBF7F1"
  dark-border-hairline: "#2A2420"
  dark-border-base: "#3A332D"
  dark-border-strong: "#6E6156"
  dark-state-info: "#9DC2E0"
  dark-state-success: "#86B9A4"
  dark-state-warning: "#E0A268"
  dark-state-danger: "#E09A95"
  dark-state-focus: "#86B9A4"
typography:
  display: { fontFamily: "Fraunces", fontSize: "4rem", fontWeight: 400, lineHeight: 1.02, letterSpacing: "-0.028em" }
  h1: { fontFamily: "Fraunces", fontSize: "3rem", fontWeight: 400, lineHeight: 1.06, letterSpacing: "-0.024em" }
  h2: { fontFamily: "Fraunces", fontSize: "1.75rem", fontWeight: 400, lineHeight: 1.18, letterSpacing: "-0.016em" }
  h3: { fontFamily: "Inter", fontSize: "1.375rem", fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.008em" }
  lead: { fontFamily: "Inter", fontSize: "1.125rem", fontWeight: 400, lineHeight: 1.5, letterSpacing: "-0.004em" }
  body: { fontFamily: "Inter", fontSize: "1.125rem", fontWeight: 400, lineHeight: 1.6, letterSpacing: "0em" }
  body-sm: { fontFamily: "Inter", fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.55, letterSpacing: "0em" }
  label: { fontFamily: "IBM Plex Mono", fontSize: "0.75rem", fontWeight: 500, lineHeight: 1.2, letterSpacing: "0.10em" }
  caption: { fontFamily: "Inter", fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.4, letterSpacing: "0.008em" }
  button: { fontFamily: "Inter", fontSize: "0.875rem", fontWeight: 600, lineHeight: 1, letterSpacing: "0.004em" }
  metric: { fontFamily: "Fraunces", fontSize: "2.25rem", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.03em" }
  quote: { fontFamily: "Fraunces", fontSize: "1.375rem", fontWeight: 300, lineHeight: 1.35, letterSpacing: "-0.01em" }
rounded:
  none: "0px"
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
  pill: "999px"
  button: "0.5rem"
  input: "0.5rem"
  card: "0.75rem"
  tag: "999px"
  avatar: "999px"
  image: "0.5rem"
  table: "0px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.5rem"
  "6": "2rem"
  "7": "3rem"
  "8": "4rem"
  "9": "6rem"
  "10": "8rem"
  inline-gap: "0.5rem"
  stack-gap: "1rem"
  card-padding: "1.5rem"
  section-y: "6rem"
  page-gutter: "1.5rem"
  control-x: "1rem"
  control-y: "0.75rem"
  grid-columns: 12
  grid-gutter: "1.5rem"
  container-prose: "42rem"
  container-content: "72rem"
  container-wide: "88rem"
components:
  page: { backgroundColor: "{colors.surface-page}", textColor: "{colors.ink-base}", typography: "{typography.body}" }
  heading: { backgroundColor: "{colors.surface-page}", textColor: "{colors.ink-strong}", typography: "{typography.h1}" }
  page-muted: { backgroundColor: "{colors.surface-page}", textColor: "{colors.ink-muted}", typography: "{typography.caption}" }
  card: { backgroundColor: "{colors.surface-raised}", textColor: "{colors.ink-base}", rounded: "{rounded.card}", padding: "{spacing.card-padding}", typography: "{typography.body}" }
  well: { backgroundColor: "{colors.surface-sunken}", textColor: "{colors.ink-base}", typography: "{typography.body}" }
  inverse: { backgroundColor: "{colors.surface-inverse}", textColor: "{colors.ink-inverse}", typography: "{typography.body}" }
  button-primary: { backgroundColor: "{colors.accent-base}", textColor: "{colors.accent-on}", rounded: "{rounded.button}", padding: "{spacing.control-y}", typography: "{typography.button}" }
  button-primary-hover: { backgroundColor: "{colors.accent-hover}", textColor: "{colors.accent-on}" }
  tag: { backgroundColor: "{colors.accent-subtle}", textColor: "{colors.ink-base}", rounded: "{rounded.tag}", typography: "{typography.label}" }
  link: { backgroundColor: "{colors.surface-page}", textColor: "{colors.accent-base}" }
  alert-info: { backgroundColor: "{colors.surface-page}", textColor: "{colors.state-info}" }
  alert-success: { backgroundColor: "{colors.surface-page}", textColor: "{colors.state-success}" }
  alert-warning: { backgroundColor: "{colors.surface-page}", textColor: "{colors.state-warning}" }
  alert-danger: { backgroundColor: "{colors.surface-page}", textColor: "{colors.state-danger}" }
  page-dark: { backgroundColor: "{colors.dark-surface-page}", textColor: "{colors.dark-ink-base}" }
  heading-dark: { backgroundColor: "{colors.dark-surface-page}", textColor: "{colors.dark-ink-strong}" }
  page-muted-dark: { backgroundColor: "{colors.dark-surface-page}", textColor: "{colors.dark-ink-muted}" }
  card-dark: { backgroundColor: "{colors.dark-surface-raised}", textColor: "{colors.dark-ink-base}" }
  well-dark: { backgroundColor: "{colors.dark-surface-sunken}", textColor: "{colors.dark-ink-base}" }
  inverse-dark: { backgroundColor: "{colors.dark-surface-inverse}", textColor: "{colors.dark-ink-inverse}" }
  button-primary-dark: { backgroundColor: "{colors.dark-accent-base}", textColor: "{colors.dark-accent-on}" }
  button-primary-hover-dark: { backgroundColor: "{colors.dark-accent-hover}", textColor: "{colors.dark-accent-on}" }
  tag-dark: { backgroundColor: "{colors.dark-accent-subtle}", textColor: "{colors.dark-ink-base}" }
  link-dark: { backgroundColor: "{colors.dark-surface-page}", textColor: "{colors.dark-accent-base}" }
  alert-info-dark: { backgroundColor: "{colors.dark-surface-page}", textColor: "{colors.dark-state-info}" }
  alert-success-dark: { backgroundColor: "{colors.dark-surface-page}", textColor: "{colors.dark-state-success}" }
  alert-warning-dark: { backgroundColor: "{colors.dark-surface-page}", textColor: "{colors.dark-state-warning}" }
  alert-danger-dark: { backgroundColor: "{colors.dark-surface-page}", textColor: "{colors.dark-state-danger}" }
---

# Perch: brand rules for agents

You are building for **Perch**: operations intelligence for independent hotels.
Read this file fully. The front matter above holds the exact values, in the [DESIGN.md format](https://github.com/google-labs-code/design.md): a token named `colors.ink-muted` is the CSS variable `--color-ink-muted` in `./theme.css`. `./tokens.json` holds everything else (palette, shadows, motion, icons, imagery) with a `_use` note beside each value; read it when you need a value that is not above.
Reusable imagery lives in `./assets/`. **Do not read `./site/`**: the brand site is built from `tokens.json` for people and adds nothing you need.

## Overview

Muji signage. Monocle's charts. A hotel's front-desk ledger. Swiss railway timetables. Paper, not glass.

**Not:** SaaS gradients, glassmorphism, crypto dashboards, boutique-hotel gold foil, illustrated blob people, dark-mode-first developer tools.

The organising principle: **every surface is ruled like a ledger** — a hairline under each heading and a mono index label in the top-left corner. Even without the logo, our work is recognisable because it looks like a page from a well-kept book.

When a choice is not covered here, pick the quieter option: fewer colours, fewer type sizes, less motion, more space. If two options are equally quiet, pick the one that reads more like print and less like an app.

## Colors

1. Use semantic CSS variables only — `--color-accent`, `--color-ink-base`, `--color-surface-raised`, `--color-border-hairline`. Never hardcode a hex.
2. Accent appears **at most twice per viewport**: one primary action, one active nav state. Everything else is ink, paper or hairline.
3. The page is `--color-surface-page` (`#FBF7F1`). Pure white is for raised cards only. **Never a white page, never black text.**
4. Never a gradient on a surface. Exception: a chart fill may fade accent to transparent.
5. State colours are never decorative. Clay means something needs attention; if nothing does, nothing is clay.
6. Dark mode: accent steps up to `moss.500` (`#2E7A5C`). `moss.600` on dark fails contrast. Shadows are invisible on dark — separate surfaces with `--color-border-base`.
7. Body text meets 4.5:1, borders and large text 3:1. Check before shipping.

## Typography

8. Fraunces for h1 and h2, pull quotes, deck titles and big metrics. Inter for everything else. **Never Fraunces below 1.375rem. Never Fraunces at weight 700.**
9. Body is 1.125rem / 1.6 — larger than you would default to. GMs read this on a desk monitor at arm's length.
10. Measure is capped at 68ch (`--container-prose`, 42rem). A full-width paragraph is a bug.
11. **Body text is never centred.** Exception: empty states, auth screens, deck covers, the 404.
12. **Sentence case** for every heading, button, label and menu item. "Save changes", not "Save Changes". Exception: proper nouns, the wordmark, and the mono index labels which are uppercase.
13. At most two type sizes inside one card. If you need three, split the card.
14. Numbers in tables and metrics use `font-variant-numeric: tabular-nums` and are right-aligned.

## Layout

15. Every spacing value comes from `--space-1`…`--space-10` (4px base). Not on the scale? Round to the nearest step.
16. Section rhythm: `--space-9` (6rem) desktop, `--space-7` (3rem) under 768px.
17. Layouts are left-aligned to a 12-column grid, with one deliberate asymmetric split per page — 7/5, not 6/6. Exception to left-alignment: empty states and auth screens.

## Elevation & Depth

18. Prefer a 1px `--color-border-hairline` to a shadow. Cards are flat at rest, `--shadow-sm` on hover. Shadows only for things that genuinely float: dropdowns and modals. Reason: the ledger line is the device, and a shadow competes with it.

## Shapes

19. Buttons and inputs `--radius-md` (8px). Cards `--radius-lg` (12px). **Tables and data grids are square.**
20. **Pill radius is for tags, avatars and count badges only.** A pill-shaped button is off-brand.

## Components

21. **Primary button** — `bg-accent`, `--color-ink-inverse` text, `--radius-md`, padding `--space-3`/`--space-4`, weight 600, sentence case. Hover darkens to `--color-accent-hover` over 150ms. No shadow, no icon unless the action is destructive or external.
22. **Secondary button** — transparent, 1px `--color-border-base`, `--color-ink-base` text. Hover sets `--color-border-strong`. Never two filled buttons in one row.
23. **Card** — `--color-surface-raised`, 1px `--color-border-hairline`, `--radius-lg`, padding `--space-5`, flat at rest, index label top-left.
24. **Input** — 1px `--color-border-base`, `--radius-md`, 44px min height, label above in `--text-label`. Focus is a 2px `--color-state-focus` ring at 2px offset. **Never `outline: none` without a replacement ring.**
25. **Table** — square corners, `--color-border-hairline` row rules only. No vertical rules, no zebra striping. Header row in `--text-label` on `--color-surface-sunken`. Numbers right-aligned and tabular.
26. **Chart** — series order moss.600, slate.600, clay.500, ink.500, moss.300. Axis in `--color-ink-muted`, gridlines in hairline. No chart junk, no 3D, no donut above four segments, direct labels over a legend where they fit.

## Imagery and the device

27. Every substantial surface carries a **mono index label in the top-left**, uppercase, `--text-label`, in `--color-ink-muted`: `FIG. 04 — OCCUPANCY`, `REF 2026-A`. It is never explained and never removed. This is the one weird detail; do not "fix" it.
28. Every heading is followed by a 1px `--color-border-hairline` rule running the full column width.
29. **This brand does not illustrate.** Use a chart, a photograph, or nothing. Diagrams are permitted and are not illustration: 1.5px strokes matching the icon set, brand palette only, labels in mono. Never a character, never a drawn metaphor. If a page feels empty the fix is more space and fewer elements, not a picture.
30. **Photography is documentary**: real properties in available mid-morning light, staff mid-task or empty rooms, eye level, square to the architecture. One image per surface. Never stock, never golden hour, never type set on a photograph. Images in `assets/photography/` are generated direction — never publish one as a real property.
31. **Icons**: Lucide via `icon.iconify`, outline, 1.5px stroke, 24px grid. Filled only for the active state. Every icon has a visible label or a tooltip. One concept, one icon — `icon.metaphors` maps them (occupancy is always `bed-double`).
32. **When two visual elements compete for the same job**, follow `art_direction.hierarchy`: type and the ledger rule first, then photography, then charts. Brief every image and layout against the concept: *the house at work*.

## Motion

33. Nothing animates longer than 320ms. Hover is 150ms, most transitions 240ms.
34. No bounce, no overshoot, no spring. Perch does not bounce.
35. Entrances fade and rise 12px. Nothing flies in, slides across or scales from zero.
36. Honour `prefers-reduced-motion`: collapse duration to zero, keep opacity.

## Voice

37. Plain, specific, warm, calm — in that order when they conflict.
38. **No exclamation marks.** Anywhere in product UI or marketing.
39. "We" and "you". Never "Perch does X" in product copy — "We'll email you when the forecast is ready."
40. Give the number, the date, the room. Never "significantly", "dramatically", "a lot".
41. Never manufacture urgency. No countdowns, no "limited spots", no red badge for a non-urgent thing.
42. **Banned words:** seamless · revolutionary · unlock · empower · leverage · utilise · AI-powered · best-in-class · solution · reach out · learnings · game-changing · supercharge. If you write "AI-powered X", replace it with what it does: "forecasts your occupancy".
43. Say "property" or "house" (not "hotel asset"), "guest" (not "customer"), "front desk" (not "reception team").
44. en-GB: -ise not -ize, DD Month YYYY, 24-hour clock, £ with no space, **no Oxford comma**.
45. Average sentence under 18 words. Vary the length. Fragments are fine.
46. Primary CTA is "Start free". Secondary is "See a live property". Never "Book a demo today".

## Logo

47. Use `assets/logo/perch-lockup.svg`. The mark alone only at 32px and below, or as an avatar.
48. Clear space on all sides equals the height of the mark. Minimum lockup width 120px.
49. Three colours only: `ink.900`, `paper.50`, `moss.600`. Never recolour, stretch, rotate, outline, add effects to, or re-set the wordmark in a live font.
50. Never on a photograph without a solid plate behind it.

## Do's and Don'ts

- A centred, gradient hero with a pill button and an emoji. This is the default LLM landing page and it is the opposite of Perch.
- Emoji in product UI, marketing or headings.
- Mixed icon sets. Lucide only, 1.5px stroke.
- Illustration of any kind (rule 29). Use a chart, a photograph, or nothing.
- Lorem ipsum. Write plausible hotel data: "Harbour View, 64 rooms, 81% occupancy, Thursday 18 September".

### If the user asks for something that breaks a rule

Do what the user asks. Then note it in one line: *"Used title case as you asked — brand default is sentence case."* Do not lecture, do not refuse, do not ask permission first.

**Locked:** logo integrity (47–50), the 4.5:1 contrast floor (7), legal boilerplate wording, and any factual claim. For these, say what breaks before you do it, and do it only once the user confirms.

### Before you finish, check

- [ ] No hardcoded hex values — every colour through a CSS variable
- [ ] Accent used at most twice per viewport
- [ ] Every spacing value on the 4px scale
- [ ] Every heading and button in sentence case
- [ ] Zero exclamation marks, zero banned words from rule 42
- [ ] Body copy left-aligned and under 68ch
- [ ] The index label present on every substantial surface
- [ ] Focus rings visible on every interactive element
- [ ] Correct in both light and dark
