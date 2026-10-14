---
brand: Perch
version: 1.0.0
tokens: ./tokens.json
assets: ./assets/
human_kit: ./site/   # the brand site, generated for people — do not read
---

# Perch — brand rules for agents

You are building for **Perch**: operations intelligence for independent hotels.
Read this file fully. Read `./tokens.json` when you need exact values.
**Do not read `site/`** — the brand site is built from `tokens.json` for people and adds nothing you need.

## 0. Core values
<!--@core-->
Accent `#1F5D45` · Ink `#241E1A` · Page `#FBF7F1` · Raised `#FFFFFF` · Hairline `#E8DFD1`
Display: Fraunces 400 · Text: Inter 400/600 · Mono: IBM Plex Mono
Base spacing 4px · Body 1.125rem/1.6 · Button radius 0.5rem · Card radius 0.75rem
en-GB · Sentence case everywhere · No exclamation marks
<!--@/core-->

## 1. What Perch looks like

Muji signage. Monocle's charts. A hotel's front-desk ledger. Swiss railway timetables. Paper, not glass.

**Not:** SaaS gradients, glassmorphism, crypto dashboards, boutique-hotel gold foil, illustrated blob people, dark-mode-first developer tools.

The organising principle: **every surface is ruled like a ledger** — a hairline under each heading and a mono index label in the top-left corner. Even without the logo, our work is recognisable because it looks like a page from a well-kept book.

When a choice is not covered here, pick the quieter option: fewer colours, fewer type sizes, less motion, more space. If two options are equally quiet, pick the one that reads more like print and less like an app.

## 2. Colour

1. Use semantic CSS variables only — `--color-accent`, `--color-ink-base`, `--color-surface-raised`, `--color-border-hairline`. Never hardcode a hex.
2. Accent appears **at most twice per viewport**: one primary action, one active nav state. Everything else is ink, paper or hairline.
3. The page is `--color-surface-page` (`#FBF7F1`). Pure white is for raised cards only. **Never a white page, never black text.**
4. Never a gradient on a surface. Exception: a chart fill may fade accent to transparent.
5. State colours are never decorative. Clay means something needs attention; if nothing does, nothing is clay.
6. Dark mode: accent steps up to `moss.500` (`#2E7A5C`). `moss.600` on dark fails contrast. Shadows are invisible on dark — separate surfaces with `--color-border-base`.
7. Body text meets 4.5:1, borders and large text 3:1. Check before shipping.

## 3. Type

8. Fraunces for h1 and h2, pull quotes, deck titles and big metrics. Inter for everything else. **Never Fraunces below 1.375rem. Never Fraunces at weight 700.**
9. Body is 1.125rem / 1.6 — larger than you would default to. GMs read this on a desk monitor at arm's length.
10. Measure is capped at 68ch (`--container-prose`, 42rem). A full-width paragraph is a bug.
11. **Body text is never centred.** Exception: empty states, auth screens, deck covers, the 404.
12. **Sentence case** for every heading, button, label and menu item. "Save changes", not "Save Changes". Exception: proper nouns, the wordmark, and the mono index labels which are uppercase.
13. At most two type sizes inside one card. If you need three, split the card.
14. Numbers in tables and metrics use `font-variant-numeric: tabular-nums` and are right-aligned.

## 4. Space, shape, depth

15. Every spacing value comes from `--space-1`…`--space-10` (4px base). Not on the scale? Round to the nearest step.
16. Section rhythm: `--space-9` (6rem) desktop, `--space-7` (3rem) under 768px.
17. Buttons and inputs `--radius-md` (8px). Cards `--radius-lg` (12px). **Tables and data grids are square.**
18. **Pill radius is for tags, avatars and count badges only.** A pill-shaped button is off-brand.
19. Prefer a 1px `--color-border-hairline` to a shadow. Cards are flat at rest, `--shadow-sm` on hover. Shadows only for things that genuinely float: dropdowns and modals. Reason: the ledger line is the device, and a shadow competes with it.
20. Layouts are left-aligned to a 12-column grid, with one deliberate asymmetric split per page — 7/5, not 6/6. Exception to left-alignment: empty states and auth screens.

## 5. The device and imagery

21. Every substantial surface carries a **mono index label in the top-left**, uppercase, `--text-label`, in `--color-ink-muted`: `FIG. 04 — OCCUPANCY`, `REF 2026-A`. It is never explained and never removed. This is the one weird detail; do not "fix" it.
22. Every heading is followed by a 1px `--color-border-hairline` rule running the full column width.
23. **This brand does not illustrate.** Use a chart, a photograph, or nothing. Diagrams are permitted and are not illustration: 1.5px strokes matching the icon set, brand palette only, labels in mono. Never a character, never a drawn metaphor. If a page feels empty the fix is more space and fewer elements, not a picture.
24. **Photography is documentary**: real properties in available mid-morning light, staff mid-task or empty rooms, eye level, square to the architecture. One image per surface. Never stock, never golden hour, never type set on a photograph. Images in `assets/photography/` are generated direction — never publish one as a real property.
25. **Icons**: Lucide via `icon.iconify`, outline, 1.5px stroke, 24px grid. Filled only for the active state. Every icon has a visible label or a tooltip. One concept, one icon — `icon.metaphors` maps them (occupancy is always `bed-double`).
26. **When two visual elements compete for the same job**, follow `art_direction.hierarchy`: type and the ledger rule first, then photography, then charts. Brief every image and layout against the concept: *the house at work*.

## 6. Motion

27. Nothing animates longer than 320ms. Hover is 150ms, most transitions 240ms.
28. No bounce, no overshoot, no spring. Perch does not bounce.
29. Entrances fade and rise 12px. Nothing flies in, slides across or scales from zero.
30. Honour `prefers-reduced-motion`: collapse duration to zero, keep opacity.

## 7. Voice

31. Plain, specific, warm, calm — in that order when they conflict.
32. **No exclamation marks.** Anywhere in product UI or marketing.
33. "We" and "you". Never "Perch does X" in product copy — "We'll email you when the forecast is ready."
34. Give the number, the date, the room. Never "significantly", "dramatically", "a lot".
35. Never manufacture urgency. No countdowns, no "limited spots", no red badge for a non-urgent thing.
36. **Banned words:** seamless · revolutionary · unlock · empower · leverage · utilise · AI-powered · best-in-class · solution · reach out · learnings · game-changing · supercharge. If you write "AI-powered X", replace it with what it does: "forecasts your occupancy".
37. Say "property" or "house" (not "hotel asset"), "guest" (not "customer"), "front desk" (not "reception team").
38. en-GB: -ise not -ize, DD Month YYYY, 24-hour clock, £ with no space, **no Oxford comma**.
39. Average sentence under 18 words. Vary the length. Fragments are fine.
40. Primary CTA is "Start free". Secondary is "See a live property". Never "Book a demo today".

## 8. Component recipes

41. **Primary button** — `bg-accent`, `--color-ink-inverse` text, `--radius-md`, padding `--space-3`/`--space-4`, weight 600, sentence case. Hover darkens to `--color-accent-hover` over 150ms. No shadow, no icon unless the action is destructive or external.
42. **Secondary button** — transparent, 1px `--color-border-base`, `--color-ink-base` text. Hover sets `--color-border-strong`. Never two filled buttons in one row.
43. **Card** — `--color-surface-raised`, 1px `--color-border-hairline`, `--radius-lg`, padding `--space-5`, flat at rest, index label top-left.
44. **Input** — 1px `--color-border-base`, `--radius-md`, 44px min height, label above in `--text-label`. Focus is a 2px `--color-state-focus` ring at 2px offset. **Never `outline: none` without a replacement ring.**
45. **Table** — square corners, `--color-border-hairline` row rules only. No vertical rules, no zebra striping. Header row in `--text-label` on `--color-surface-sunken`. Numbers right-aligned and tabular.
46. **Chart** — series order moss.600, slate.600, clay.500, ink.500, moss.300. Axis in `--color-ink-muted`, gridlines in hairline. No chart junk, no 3D, no donut above four segments, direct labels over a legend where they fit.

## 9. Logo

47. Use `assets/logo/perch-lockup.svg`. The mark alone only at 32px and below, or as an avatar.
48. Clear space on all sides equals the height of the mark. Minimum lockup width 120px.
49. Three colours only: `ink.900`, `paper.50`, `moss.600`. Never recolour, stretch, rotate, outline, add effects to, or re-set the wordmark in a live font.
50. Never on a photograph without a solid plate behind it.

## 10. Never do these

- A centred, gradient hero with a pill button and an emoji. This is the default LLM landing page and it is the opposite of Perch.
- Emoji in product UI, marketing or headings.
- Mixed icon sets. Lucide only, 1.5px stroke.
- Illustration of any kind (rule 23). Use a chart, a photograph, or nothing.
- Lorem ipsum. Write plausible hotel data: "Harbour View, 64 rooms, 81% occupancy, Thursday 18 September".

## 11. If the user asks for something that breaks a rule

Do what the user asks. Then note it in one line: *"Used title case as you asked — brand default is sentence case."* Do not lecture, do not refuse, do not ask permission first.

**Locked:** logo integrity (47–50), the 4.5:1 contrast floor (7), legal boilerplate wording, and any factual claim. For these, say what breaks before you do it, and do it only once the user confirms.

## 12. Before you finish, check

- [ ] No hardcoded hex values — every colour through a CSS variable
- [ ] Accent used at most twice per viewport
- [ ] Every spacing value on the 4px scale
- [ ] Every heading and button in sentence case
- [ ] Zero exclamation marks, zero banned words from rule 36
- [ ] Body copy left-aligned and under 68ch
- [ ] The index label present on every substantial surface
- [ ] Focus rings visible on every interactive element
- [ ] Correct in both light and dark
