# The translation layer

Six axes carry almost all of the design output. Everything else is either derived from them or is a content decision rather than a brand-feel decision.

This file is the reason the skill can ask a founder about *consequences* and still produce a specification. Ask "when someone lands on this, should they feel they have found something established, or something new?" — then translate here. Never ask "serif or sans?". That translation is the entire value of the expert layer.

Score each axis **−2 … +2**. Keep a confidence 0–1 next to each, and note whether it came from something the user *said* or something they *chose*. Chosen beats said, always.

---

## A · Classic ↔ Contemporary — time signature

| | Classic (−2) | Contemporary (+2) |
|---|---|---|
| **Type** | Old-style or transitional serif, high stroke contrast, true italics, small caps. Scale ratio 1.25, leading 1.55–1.65 | Neo-grotesque or variable sans, low contrast, display tracked to −0.02em. Ratio 1.333–1.5, leading 1.35–1.45 |
| **Colour** | Ink and paper: near-black on off-white (`#1A1714` on `#F6F2EA`), one muted accent, chroma < 0.08 | Near-pure neutrals, one saturated accent; duotone and gradient permitted |
| **Form** | Radius 0–2px, symmetric and centred, 1px hairline rules, wide margins | Radius 8–14px, asymmetric and left-aligned, borders replaced by elevation |
| **Motion & image** | 300–450ms ease-out, opacity plus small translate only. Film grain, no clipped highlights | 140–200ms `cubic-bezier(.2,0,0,1)`. Crisp digital imagery, 3D acceptable |

## B · Serious ↔ Playful — register

| | Serious (−2) | Playful (+2) |
|---|---|---|
| **Type** | One family, two weights (400/600), sentence case, no display quirk | Two families or a wide-axis variable font, 400/700/900, rounded or humanist terminals, occasional oversize |
| **Colour** | Two neutrals + one accent; the accent is reserved for action | Three or more hues, one high-chroma; colour used decoratively, not only functionally |
| **Form** | Radius 0–4px, orthogonal, consistent 8px grid | Radius 14–999px (pill), rotation, overlap, deliberate off-grid moments |
| **Motion & image** | 180–220ms, no overshoot, no bounce. Photography over illustration | Spring, damping ≈0.65, slight overshoot. Illustration, character, hand elements |

## C · Premium ↔ Accessible — status

| | Premium (−2) | Accessible (+2) |
|---|---|---|
| **Type** | Smaller type relative to canvas, labels in tracked caps 0.10–0.16em, display serif or high-contrast sans, body ≤15px | Body 16–18px, filled and labelled buttons, bold weights for hierarchy, humanist sans |
| **Colour** | Restrained: two neutrals + one. Near-black, never `#000`. Low chroma. No colour on anything inessential | Bright saturated primary, success and warning colours present, high value contrast |
| **Form** | Padding ×1.75 of baseline, ≤5 elements per view, wide empty margins, radius 0–6 | Dense: padding ×0.75, more elements and more affordances, radius 6–10 |
| **Motion & image** | 400–600ms with a long ease-out tail. Few, large images. Nothing blinks | 120–160ms. Price and CTA always visible. Helpful iconography |

## D · Warm ↔ Cool — temperature

| | Warm (−2) | Cool (+2) |
|---|---|---|
| **Type** | Humanist sans or old-style serif — an asymmetric, calligraphic skeleton | Geometric or neo-grotesque — a rational skeleton |
| **Colour** | Neutrals tinted hue 30–60° at 2–6% chroma. Accents amber, terracotta, coral, olive. Black tinted warm (`#1C1815`) | Neutrals tinted hue 230–260°. Accents blue, teal, violet. Black tinted cool (`#101215`) |
| **Form** | Slightly softer radius, organic shapes permitted | Crisper edges, thinner strokes |
| **Image** | Warm grade +200K, people in frame, skin tones prioritised | Cool grade −200K, product, architecture, abstraction |

## E · Minimal ↔ Expressive — density of signal

| | Minimal (−2) | Expressive (+2) |
|---|---|---|
| **Type** | ≤3 distinct text styles in the entire system, one family | 6–10 styles, two families plus a display face, mixed case and scale contrast inside one block |
| **Colour** | ≤3 colours total including neutrals. No gradient, no texture | 5+ colours. Gradient, grain, pattern, texture |
| **Form** | Empty:filled ≥ 60:40, strict grid, no decoration, borders rather than fills | Empty:filled ≈ 35:65, layering, overlap, edge bleed |
| **Motion & image** | One motion pattern reused everywhere. Imagery sparse and large | Several motion patterns. Imagery collaged, cropped, repeated |

## F · Corporate ↔ Human — distance

| | Corporate (−2) | Human (+2) |
|---|---|---|
| **Type** | Neo-grotesque, oblique rather than italic, tabular figures, third-person voice | Humanist sans with true italics, first person, contractions, occasional lowercase |
| **Colour** | A single corporate primary with rigid usage rules | Palette allowed to shift by context; one "off" colour that should not work but does |
| **Form** | Perfect grid, uniform spacing, fixed logo lockup | Intentional irregularity, hand marks, a signature, looser spacing |
| **Motion & image** | No hand elements, abstract or architectural imagery, measured motion | Real people in real rooms, imperfect photography, conversational micro-copy |

---

## Derived parameters — compute these, never ask them

With each axis as a number in −2…+2:

```
radius_base   = clamp(4 + 2.5*serious_play + 1.5*classic_contemp + 1.0*corp_human, 0, 20)
                // above 16, use 999 (pill) for buttons and keep 16 for cards
space_unit    = 8 * (1 - 0.15*prem_access)              // premium gets a bigger unit
density       = 1.0 + 0.18*prem_access - 0.12*min_expr  // multiplies elements per view
motion_ms     = 220 - 30*classic_contemp - 55*prem_access - 20*serious_play
easing        = serious_play >= +1 ? spring(damping .65) : cubic-bezier(.2,0,0,1)
type_contrast = high  if classic_contemp <= -1 or prem_access <= -1  else low
accent_chroma = 0.06 + 0.035*(prem_access + 2) + 0.02*(serious_play + 2)   // OKLCH C
neutral_hue   = warm_cool <= 0 ? 45 : 245
neutral_chroma= 0.06 - 0.012*abs(warm_cool)             // tint strength, 2–6%
style_count   = 3 + 1.5*(min_expr + 2)                  // distinct type styles allowed
palette_size  = 3 + 1.0*(min_expr + 2)
```

Treat these as a starting specification you then exercise judgement on, not as a generator. They exist so that two different runs of this skill on the same answers produce the same system, and so that nothing in the kit is arbitrary.

## Correlation traps — encode these deliberately

Some axes look coupled but are not, and the uncoupled quadrants are where differentiation lives.

- **Premium and Minimal** correlate, but Premium + Expressive is the maximalist-luxury quadrant. Real, and rare.
- **Playful and Accessible** correlate, but **Premium + Playful** is legitimate, valuable and badly under-occupied.
- **Contemporary and Cool** correlate *by category convention* — which is exactly why Contemporary + Warm differentiates in almost every software category.

When the user lands in a rare quadrant, **say so out loud**: "that combination is unusual, which is good, and here is the risk." It reads as expertise and it pre-empts the wobble that otherwise arrives two days later.

## What does not map, and must not be asked

Logo form (mark versus wordmark), the name, the tagline, illustration specifics, the icon set. These are downstream craft decisions. Asking about them early produces low-quality input and burns decision budget that belongs to the six axes.
