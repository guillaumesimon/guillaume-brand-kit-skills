# Building the visual system

The craft half. Read this before specifying anything.

The central claim to hold on to: **typography and layout do more brand work than the logo.** Type is present on every surface at every size. Layout is the most-seen and least-consciously-noticed layer. A founder who gets the grid right and the logo wrong has a better identity than the reverse.

---

## Colour

### A palette is roles with ratios, not a list of colours

Amateur palettes are lists. Professional palettes are structures.

| Role | Count | Purpose | Surface share |
|---|---|---|---|
| Ground / paper | 1–2 | The dominant surface. Near-white or near-black, rarely pure | 60–80% |
| Ink | 1 | Primary text. Almost never `#000` or `#FFF` | 10–20% |
| Neutrals | 4–8 steps | Hairlines, borders, disabled, secondary text | 5–15% |
| Brand | 1 | The colour the brand is *called*. Actions and emphasis | 3–10% product, 20–60% marketing |
| Secondary | 0–2 | Sections, categories, illustration | 0–10% |
| Functional | 4 | Success / warning / danger / info, tuned to the palette | <2% |
| Accent / flare | 0–1 | Rare and loud. Campaign moments | <1% |

Always specify by **role**, never by name: `--color-surface`, `--color-ink`, `--color-ink-muted`, `--color-border`, `--color-accent`, `--color-accent-on`. Two layers — a primitive ramp plus semantic aliases pointing into it. Dark mode is then a re-pointing of the semantic layer only; primitives never change. That single structural decision is what makes dark mode tractable.

Semantic names describe role, never appearance. `--color-danger`, not `--color-red`. The day the brand colour moves from blue to green, `--blue-600` becomes a lie and `--color-accent` does not.

### 60-30-10 is wrong

It comes from interior decoration and it fails twice.

It **grossly overstates accent** — 10% of a product UI in brand colour is a carnival. Real product surfaces run ~85% neutral / ~12% ink and structure / ~3% brand. The brand colour earns its power precisely because it is rare: it becomes a reliable signal that something is actionable.

And it **ignores that ratio is surface-dependent**:

| Surface | Ground | Ink & structure | Brand | Accent |
|---|---|---|---|---|
| Product UI | 80–88% | 10–15% | 2–5% | ~0 |
| Marketing site | 60–75% | 15–25% | 8–20% | 0–3% |
| Social / campaign | 30–60% | 10–20% | 25–50% | 0–10% |
| Print / packaging | 40–70% | 10–20% | 15–40% | 0–5% |

Put this in the kit as **"colour behaves differently in product and in marketing"** with the numbers. It is the single most useful thing a non-designer can be told about colour.

**Dominance rule:** one colour clearly wins on every surface. Two colours at similar area is a layout with no hierarchy. If you have two strong colours, make one 4× the area of the other.

### How colour carries meaning

1. **Category convention** is real and audiences read it: blue = trust/finance/enterprise, green = money/health, black-and-white = premium/editorial, yellow = utility/attention, purple = tech-creative/AI, orange = accessible/budget. Two legitimate moves: comply deliberately (fast legitimacy, zero distinctiveness) or break one convention systematically. Never break it by accident.
2. **Temperature and chroma do more than hue.** Desaturated reads serious and expensive; high-chroma reads energetic or cheap depending entirely on execution. Warm neutrals read human and crafted, cool neutrals clinical and engineered. **Moving a ground from `#FFFFFF` to `#FAF8F4` changes the brand more than moving the accent from blue to green.**
3. **Behaviour.** *Where* colour appears is meaning. Colour only at the point of action reads functional. Full-bleed colour reads confident. Colour only inside photography reads editorial. This is often the organising principle itself.

### The eight ways amateur palettes fail

1. **Equal lightness.** Five colours all near L≈60. Nothing recedes, everything competes, unusable in greyscale. Force separation: at least one value below L\*30 and one above L\*90.
2. **Too many hues.** One hue plus neutrals is a valid and often superior palette. Two is plenty. Three needs a written reason.
3. **No neutral family.** `#CCCCCC` and `#888888`. Neutrals should be tinted — a warm brand gets neutrals at hue 40–60 with chroma 0.005–0.02, never pure grey. One of the highest-yield invisible details in the system.
4. **Generated tints.** Mixing with pure white or black gives muddy, dead mid-tones — blues go grey, yellows go brown. Build ramps in OKLCH with fixed lightness steps and slight hue rotation (+8–15° toward the light end), reducing chroma at both extremes. An 11-step L ramp: `.985 .960 .915 .855 .775 .680 .590 .500 .415 .330 .240`.
5. **Accent used as a ground for body text.** Define each colour's permitted roles — `text-on-light`, `text-on-dark`, `fill`, `stroke`, `ground` — and forbid the rest.
6. **Functional colours from another universe.** Bootstrap red `#DC3545` inside a warm oat palette looks like a browser error. Derive them at the palette's own chroma and temperature.
7. **No dark-mode plan**, so the palette gets inverted programmatically and the brand colour vibrates on near-black.
8. **Never tested small, printed, or in greyscale.** Three mandatory checks: 16px text, a 1px hairline, and a greyscale render.

### Accessibility, non-negotiable

- Body text **≥4.5:1** against its actual background. Large text (≥24px, or ≥18.66px bold) **≥3:1**.
- UI components, icons, form borders, focus rings, chart series **≥3:1**.
- **Never hue alone** for state — pair with icon, weight or label. Roughly 1 in 12 men has a colour-vision deficiency.
- Focus rings: 2px, ≥3:1 against both the component and the adjacent background, 1–2px offset.
- Placeholder text at 3:1 is a failure. Placeholders are text.

Compute the ratio for every text/background pair the kit uses and refuse any below threshold, substituting the nearest compliant step. The template does this live for every swatch.

### Dark mode is not inversion

- **Elevation comes from lighter surfaces, not shadow.** Three or four steps: `#0B0C0E → #15171A → #1E2126 → #282C33`, plus a 1px hairline at 8–12% white.
- **Never pure black ground** unless the brand is explicitly OLED-cinematic. `#0A0A0C`–`#121316` is the working range; pure black with pure white produces halation.
- **Never pure white text.** `#E8E9EB` at ~87% is the workhorse; muted `#9AA0A6`.
- **Brand colours must be lightened and desaturated**, typically +15–25% L and −10–20% C. Emit a separate dark token; never reuse the light one.
- **Large coloured areas must be dimmed** — a full-bleed brand colour that works on white is aggressive on dark. Use a 10–15% alpha tint over the surface.

### Print

Specify HEX + OKLCH for screen, Pantone plus a CMYK build for print. Very high-chroma screen colours are not printable — bright cyans, electric greens and vivid violets shift badly. Rich black for large areas is `C60 M40 Y40 K100`, never K100 alone; small text is K100 only. Uncoated stock eats 10–15% of chroma.

### Eight reference palettes

Starting points spanning genuinely different territories. Derive from them; do not paste them unchanged.

**1 · Quiet Authority** — B2B infrastructure, fintech, compliance, security. Competence that does not shout.
Ground `#FAFAF7` · raised `#FFFFFF` · ink `#14161A` · muted `#6B7078` · hairline `#E4E4DF` · brand `#2F49D1` · hover `#2439A8` · tint `#EDF0FD` · success `#197A56` · warning `#9A6B10` · danger `#B3321F`
Ratio product 82/15/3, marketing 68/20/12. Dark: ground `#0F1114`, surfaces `#171A1F`/`#1F232A`, ink `#E8E9EB`, brand `#6E86FF`.
*Rule: the blue appears at most three times per screen.*

**2 · Editorial Warm** — consumer, food and drink, wellness, media, hospitality. Made by people.
Ground `#F4EDE3` · alt `#FBF7F1` · ink `#241E1A` · muted `#6E6156` · hairline `#DDD2C2` · brand `#C25A3A` (large text and fills only, 4.0:1) · brand deep `#9C4128` (small text) · secondary `#4A5236` · accent `#E8B23C`
Ratio marketing 62/18/15/5. Dark: ground `#1A1614`, surface `#221D1A`, ink `#F0E8DE`, brand `#E07B57`.
*Rule: terracotta never sits on olive. No grey anywhere — every neutral is warm.*

**3 · Technical Grid** — dev tools, infrastructure, data platforms. Dark-first.
Ground `#0B0C0E` · surfaces `#15171A`/`#1E2126` · hairline `#2A2E35` · ink `#E6E8EA` · muted `#8A9099` · brand `#7CF03D` (never on light) · light-mode substitute `#3E7A12` · light ground `#F5F6F7` · danger `#FF5C4D` · info `#4DA6FF`
Ratio 86/11/3. *Rule: the acid is a cursor, a caret, a status dot — not a large button fill. A mono face must carry this palette or it reads as a gaming brand.*

**4 · Clinical Optimism** — health, insurtech, benefits, public-sector-adjacent.
Ground `#FFFFFF` (genuine white is correct here) · tint `#EEF4F7` · ink `#0E2A47` · muted `#5A7286` · hairline `#D6E1E8` · action `#1668B8` · mint `#5FD0A8` (fills only) · coral `#FF6B52` (marketing only) · success `#1E7A54` · danger `#C0392B`
Ratio product 84/13/3, marketing 55/25/15/5. *Rule: navy-on-white is the default for everything; colour is reserved for state and illustration. That is what stops it becoming a hospital brochure.*

**5 · Heritage Craft** — spirits, apparel, hospitality, furniture. Sold on material quality.
Bone `#EDE7DA` · ink/bottle green `#14312A` (also a full-bleed ground) · muted `#5C6B60` · hairline `#CFC5B2` · brass `#B08D3F` (hairlines and small glyphs only, never body text) · oxblood `#6B2029` · soot `#2A2A28`
Ratio packaging 50/38/8/4. *Rule: brass as a fill reads as a 2011 luxury template. Set the wordmark in bone on green, never brass on green.*

**6 · Nocturne** — AI products, music, creative tools. Dark-first.
Void `#0A0A0F` · surface `#14141C` · elevated `#1E1E29` · hairline `#2C2C3A` · ink `#EDEDF2` · muted `#9494A6` · violet `#7C5CFF` (fills and ≥24px text) · violet text `#A38CFF` (small text on dark) · violet deep `#5A3FE0` (light mode) · flare `#FF4D8D` · light ground `#F7F7FA`
Ratio 83/13/4. *Rule: the violet is a glow source, not a paint — small fills, a 1px lit border, a gradient at ≤12% alpha. Large flat violet reads as a crypto deck.*

**7 · Civic Utility** — logistics, marketplaces, ops software, construction, transit.
Black `#111111` · white `#FFFFFF` · concrete `#E8E8E5` · mid `#767674` · signal yellow `#FFD500` · hairline `#CFCFCB` · danger `#D62B1F` · success `#0F7A3D`
Ratio marketing 35/30/30/5, product 80/15/5. *Rule: two colours plus neutrals, forever — the discipline is the brand. Yellow is a ground or a fill, never a text colour, never a gradient. Black on yellow, always.*

**8 · Soft Modern** — DTC, care, community, HR and people tools, education. Warmth without infantilising.
Ground `#F2EFEA` · ink/aubergine `#2E1F3D` (all text) · muted `#6B5C78` · hairline `#DFD8D0` · lilac `#CFC2F2` · sage `#A8BFA0` · blush `#E8A08B` (all three surfaces only) · action `#5B3C86`
Ratio 64/18/15/3. *Rule: pastels are surfaces, never text, and never more than one per screen. The deep aubergine is what stops this being a wellness template.*

---

## Typography

**Choosing the system is `references/typography.md`** — the four axes, the 2026 movements and the free face for each, the website/app split, licensing, and the board at `assets/type-systems.html` that shows twenty systems on the same words. What follows here is the craft underneath, which is mostly constants rather than brand choices.

### One family or two

**Default to one excellent family across a wide weight and optical-size range.** It beats a mediocre pair almost every time: coherence for free, half the decisions, half the loading cost, and no incompatible pairing.

Use **two** when you need a genuine editorial voice, or a functional third register (mono for data, code, labels). Use **three** only when the third is a mono doing a specific job.

### Pairing logic — contrast of category, agreement of proportion

- **Contrast the category clearly.** Serif with sans, geometric with grotesk, display with workhorse. Two similar sans-serifs is the worst outcome: it looks like a mistake rather than a decision.
- **Agree on x-height and width.** Set both at 100px and compare the lowercase x; within ~8% is comfortable.
- **One face leads.** Decide which family owns 90% of the words. The display face appears 1–3 times per page and never inside a paragraph.
- **Check the numerals.** Tabular lining for data, oldstyle for editorial. If the display face has awkward figures, never set numbers in it.

**Optical sizing.** Real typefaces are drawn differently at different sizes. If the family has an `opsz` axis (Fraunces, Newsreader, Source Serif 4, Literata, Roboto Flex, Bricolage Grotesque, Inter v4), enable it. Otherwise use the display cut above ~32px.

**The weight ladder.** Pick three: typically 400/500/700, or 400/600. 500 is the most under-used weight and the one that makes interfaces look designed. Never 300 or lighter below 20px, and never on dark at any size. 900 is almost always wrong unless the territory is explicitly broadcast — get impact from size and tightness, not weight. **Never synthesise** a weight or an italic; faux bold is an immediate tell.

### The scales

**Product scale** — ratio ≈1.2–1.25, base 16.

| Token | px | Leading | Tracking | Weight |
|---|---|---|---|---|
| display-xl | 72 | 72 (1.0) | −0.03em | 600 |
| display-l | 56 | 60 (1.07) | −0.025em | 600 |
| h1 | 40 | 46 (1.15) | −0.02em | 600 |
| h2 | 30 | 38 (1.27) | −0.015em | 600 |
| h3 | 24 | 32 (1.33) | −0.01em | 600 |
| h4 | 20 | 28 (1.4) | −0.005em | 600 |
| body-l | 18 | 29 (1.6) | 0 | 400 |
| body | 16 | 26 (1.6) | 0 | 400 |
| body-s | 14 | 21 (1.5) | +0.005em | 400 |
| caption | 12 | 17 (1.4) | +0.01em | 500 |
| overline | 11 | 14 | +0.10em | 600 uppercase |

**Editorial scale** — ratio ≈1.333 above body, base 17–18.
display 96/92 −0.035em · h1 67/68 −0.03em · h2 50/54 −0.025em · h3 37/44 −0.015em · h4 28/36 −0.01em · lede 24/36 −0.005em · body 18/30 · caption 14/20 +0.01em

### Tracking and leading — craft constants, not brand choices

**Tracking:** ≥60px → −0.03 to −0.04em · 36–60px → −0.02 to −0.03em · 24–36px → −0.01 to −0.02em · 17–24px → −0.005 to 0 · 14–16px → 0 · 11–13px → +0.005 to +0.015em · ALL CAPS at any size → +0.06 to +0.12em (smaller caps, more tracking) · mono → 0. Serifs need less negative tracking than sans at display; geometric sans need the most.

**Leading:** display >48px → 0.95–1.1 · headings 24–48px → 1.1–1.3 · body 16–20px → 1.5–1.7 · dense UI 13–15px → 1.4–1.5 · captions 1.35–1.45. Leading and measure move together: at 45ch use 1.45, at 75ch use 1.65.

**Measure:** body prose 60–75 characters, optimum 66 (`max-width: 66ch`). UI text 45–70ch. Anything above 90ch is a readability failure regardless of how good the type is.

### What the register actually signals

| Feels | Signals |
|---|---|
| **Premium** | Tight tracking at display · a 6:1 ratio between display and body, not 2:1 · very few weights · generous margins · restrained colour · lowercase · text never centred except deliberately |
| **Cheap** | Default tracking everywhere · too many weights · 900 headlines · shadow or glow on type · centred body copy · gradients on type · 1.5 leading on a 60px headline · visible system-font fallback · type filling the container edge to edge |
| **Technical** | Mono for labels and data · tabular figures · tracked uppercase overlines · tight vertical rhythm · visible hairlines · small type used confidently · squared terminals |
| **Warm** | Humanist sans or old-style serif · slightly looser leading · larger x-height · warm ground · ragged right, never justified · italics for real emphasis |
| **Broadcast** | Condensed or expanded widths · very large sizes · tracking to −0.045em · type as the image, no photography needed |

### Twelve pairings that work

All available on Google Fonts unless noted, each with the territory it serves and its commercial upgrade. These are the *specifications*; the board at `assets/type-systems.html` holds twenty systems as live specimens, with licence, payload and half-life on each — including newer arrivals this list predates (Google Sans Flex, Mona Sans, Young Serif, Bodoni Moda, Inclusive Sans, Funnel, Winky Sans, and Satoshi + Switzer from Fontshare).

1. **Inter alone** — default product/SaaS. Display Inter 600 (`opsz` or Inter Display above 32px) −0.025em; text 400/500 at 16/26. *Quiet Authority, Clinical Optimism.* Honest note: correct and completely anonymous — it will never be wrong and never be memorable. Use it when distinctiveness comes from colour, layout or device, and say so. ↑ ABC Diatype, Söhne, Untitled Sans, Suisse Int'l.
2. **Instrument Serif + Inter** — editorial-modern startup, AI tooling, design-adjacent B2B. Display Instrument Serif Regular 56–96px, −0.02em, leading 1.0, often italic for the one hero line; text Inter 400/500 at 17/28. *Watch: it is everywhere in 2024–26.* ↑ PP Editorial New, Reckless, Migra, Romie.
3. **Fraunces + Public Sans** — warm, crafted, consumer. Fraunces `opsz auto`, wght 500–600, `SOFT 30`, `WONK 1`, −0.02em, leading 1.05; text Public Sans 400/600 at 17/28. Keep WONK on at display and off below 24px. *Editorial Warm, Soft Modern.* ↑ Gambarino, Ogg, Canela.
4. **Archivo Expanded + Archivo** — confident, broadcast, sports and creator tools. Display Archivo Expanded 700 at 48–120px, −0.02em, leading 0.95, often uppercase; text Archivo 400/500 at 16/26. Width contrast gives drama without a second face. *Civic Utility.* ↑ GT America Expanded, Right Grotesk, Monument Extended.
5. **Space Grotesk + IBM Plex Mono** — technical with personality. Display 500/700 at 40–80px, −0.03em, leading 1.0; body Space Grotesk 400 16/26; labels Plex Mono 400/500 at 12–13px, +0.01em. Space Grotesk's odd `g` and `a` are the personality and get annoying in long prose — keep paragraphs short or swap the body to Inter. *Technical Grid, Nocturne.* ↑ PP Neue Montreal + PP Supply Mono.
6. **IBM Plex Sans + Plex Mono + Plex Serif** — systematic, engineered, enterprise with a conscience. Three registers from one designed superfamily; the cheapest route to a coherent three-face system. *Quiet Authority, Technical Grid, Civic Utility.*
7. **EB Garamond + Work Sans** — heritage, institutional, cultural, education. Display EB Garamond 400/500 at 56–96px, −0.015em, leading 1.05 — the italic is the best free italic available. *Heritage Craft.* ↑ Adobe Garamond, Lyon, Freight Text.
8. **DM Serif Display + DM Sans** — approachable editorial, consumer fintech, marketplaces. Display 400 at 48–88px, −0.02em, leading 1.0; text DM Sans 400/500/700 16/26. DM Serif Display is high-contrast and never works below 32px. *Editorial Warm, Soft Modern.*
9. **Bricolage Grotesque alone** — indie, cultural, editorial-tech. Display 600–800, `wdth 75–100`, 56–120px, −0.03em, leading 0.95; text 400 at 17/28 with `opsz auto`. A genuine single-family display-to-text system with character, and rare among free faces.
10. **Newsreader + Schibsted Grotesk** — long-form, publishing, research, newsletters. Display Newsreader 400/500 italic, `opsz auto`, 40–72px, −0.015em; body Newsreader 400 at 19/32 on a 66ch measure; UI Schibsted Grotesk 500/700 at 14–16px.
11. **Geist + Geist Mono** — contemporary developer product. Display Geist 600 at 48–80px, −0.03em, leading 1.0; text 400/500 16/26. Reads more current than Inter, still neutral. *Technical Grid, Nocturne, Quiet Authority.*
12. **Libre Franklin + Lora** — civic, trust, institutional, public-interest, healthcare. Display Libre Franklin 700 at 40–72px, −0.02em; long-form Lora 400 at 18/30; UI Libre Franklin 400/500 16/26. Franklin's journalistic heritage does a lot of "serious and public" work for free. *Clinical Optimism, Civic Utility.*

**Loading discipline:** never more than two families and five font files on a v1. Subset to latin, `font-display: swap`, preload the two most-used weights, prefer one variable file over five statics.

---

## Logo

### The realistic options for a v1, ranked

1. **Wordmark, set and refined.** The name in a chosen typeface, then actually adjusted — kerned pair by pair, spacing optimised, one or two letterforms modified. **The right answer for 90% of v1s.** Cheap, distinctive enough, scales, never dates, and it teaches the audience your name, which is the actual job at v1.
2. **Wordmark plus one letterform intervention** — the "one weird detail". A terminal cut, a ligature, a crossbar removed, a counter filled, a dot replaced, one letter at a different weight. Takes a wordmark from generic to ownable in one move.
3. **Lettermark / monogram.** You need one regardless — a wordmark cannot fill a 32×32 square. Cheapest path: the first letter in the same typeface, optically centred in the container shape from your organising principle.
4. **Symbol plus wordmark.** The most expensive and most commonly botched. A symbol earns its place only when the name is long or hard to read, or there is a specific idea worth encoding. **In a 30-minute session: skip it**, and say why.
5. **No-logo systems.** The identity is carried by type, colour, layout and device; the "logo" is the name set in the brand face at a fixed weight. Legitimate and increasingly common — and it requires the rest of the system to be strong, which is exactly the trade you want.

### What makes a wordmark work

**Spacing over drawing.** A well-spaced wordmark in an ordinary typeface beats a badly-spaced one in a beautiful typeface. Kern optically: the *area* between letters should look equal, not the distance. Problem pairs: `LT`, `AV`, `VA`, `To`, `Ty`, `rn`, `Ll`, `P.`, and anything beside a round letter.

A weight that survives at 16px and at 3 metres — 500–700 for most. Tight but not touching, −0.02 to −0.04em. **Optical alignment, not geometric**: round letters overshoot baseline and cap-height by 1–1.5%, pointed letters more. One idea executed completely — half-applied ideas read as errors. One primary lockup, one compact, one stacked. Not fourteen.

### Mistakes to screen for

Gradient on the mark (dies in one colour, embroidery, engraving, dark mode) · a symbol that needs explaining · stock icon plus name in a default font · very wide letter-spacing on a small wordmark (`L U X E`) · putting the mark in a circle to solve the avatar problem, then using the circle everywhere · too much detail to survive 16px in one colour · a tagline welded to the lockup · perfect symmetry, which reads inert · script fonts, all-caps thin geometric sans, swooshes · **designing the logo first** — it should be the last decision, derived from the type and the device.

---

## Layout, space and shape

### The spacing scale

4px base, 8px rhythm. Emit exactly this ramp and forbid anything outside it:

`4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 128 · 160 · 192`

A single `padding: 22px` is detectable and reads as sloppy. This one rule does more for "looks designed" than almost anything else, because inconsistent spacing is the loudest amateur signal.

**Proximity rule:** the space *around* a group must be larger than the space *within* it, by at least two steps. Heading to its paragraph 12–16px; paragraph to next heading 48–64px. Getting this backwards is the single most common layout error.

### The grid

Desktop 12 columns, content 1200–1440px, gutter 24–32, margin 48–80. Tablet 8 columns, gutter 24, margin 32. Mobile 4 columns, gutter 16, margin 20–24. Section padding 96–160 desktop, 64–80 mobile.

**Asymmetry is a decision.** Twelve equal thirds forever is a template. Use 7/5, 8/4, 5/7 splits; offset content into columns 2–8. One deliberate asymmetric relationship per page is a strong taste signal.

### Density is a brand attribute

| Setting | Body | Section padding | Component padding | Reads as |
|---|---|---|---|---|
| Airy | 18–20px | 128–160px | 24–32px | Premium, editorial, consumer |
| Standard | 16px | 96–120px | 16–24px | Neutral, professional |
| Dense | 14–15px | 48–64px | 8–12px | Technical, expert tool |

The mismatch to avoid: an airy marketing site and a dense product with no bridge. Define the bridge — same family, same colours, different density — and say so out loud.

### White space

Not "empty": the primary mechanism for signalling value. Higher price point, more space, near-universally. The highest-leverage move for an amateur is **double the margins and halve the content**. Space should be unequal and intentional — even padding on all four sides of everything is a template tell. And do not centre everything: a left-aligned grid-anchored page with one centred moment reads as designed; an entirely centred page reads as a page builder.

### Radius, borders, shadow

These three carry enormous personality and are almost always set unconsciously.

**Radius:** 0px serious/technical/editorial · 2–4px neutral and precise · 6–10px contemporary software · 12–16px friendly consumer · 999px approachable, and slightly dated for buttons. Pick one scale (e.g. 0/4/8/16) and never vary. Nested radii decrease inward — outer 12, inner 8 — they never match.

**Borders:** 1px hairlines at 8–12% of ink read as precise. 2px reads bold or playful. Never mix widths.

**Shadow:** either commit to a real three-level elevation scale with low-opacity layered values (`0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.06)`) or use **none at all** and rely on hairlines and surface tint. "No shadow" is completely valid and currently rather sophisticated. A single fuzzy grey shadow at 20% opacity is the classic amateur tell.

---

## Imagery and the graphic device

### Photography — a six-part recipe, not adjectives

1. **Light** — hard directional / soft diffused / available window / flash-on-camera / golden hour / overcast / single-source with deep shadow / high-key
2. **Distance and framing** — wide environmental / medium / close / macro; eye-level / low / overhead
3. **Subject state** — candid in action / posed and aware / absent (place and object only) / hands only / in context versus in void
4. **Colour treatment** — neutral-true / warm-lifted shadows / cool desaturated / high contrast with crushed blacks / duotone in brand colours / lifted-black matte
5. **Crop discipline** — always full bleed, or always inside the device shape; two aspect ratios maximum, stated
6. **Post** — none / fine 35mm-like grain / brand-colour scrim at 6–10% / duotone / no filters ever

Three rules that matter most for a founder: **consistency beats quality** (six consistent mediocre photos look more professional than six excellent inconsistent ones); **a treatment rescues cheap photography** (duotone, a consistent crop shape, or a consistent grain unifies stock and phone photos into a system); and **say what you will never shoot** — no people smiling at laptops, no handshakes, no isolated product on white, no drone shots of cities.

The direction is chosen by looking, not from this list: **read `references/photography.md`** and show `assets/photo-styles.html` — one scene re-shot seven ways, plus none. That file also has the full recipe the kit records (point of view, types, casting, ratios, source) and how to generate the brand's own samples.

### Illustration

The subject says what you do; the style says who you are. Choosing it is a decision in its own right, with its own board and its own honest third axis — what the brand can actually keep making.

**Read `references/illustration.md`** and show `assets/illustration-styles.html`, which draws the same scene seven ways plus an eighth card for none, so the only thing varying is the grammar.

The short version: **none** — type, the device, a chart or a photograph — is the strongest and cheapest answer for a serious v1, and it belongs on the board with the same weight as the other seven. Beyond that, Playful Geometric and New School Cartoon are the ones a non-illustrator can extend from a written spec, and Editorial 3D and Realistic Isometric are almost always chosen at a budget that cannot sustain them.

### The graphic device — the recognisability engine

The repeatable non-logo element that makes an artefact identifiable at a glance.

| Device | The rule | Best for |
|---|---|---|
| Aperture | All imagery masked into one shape — arch, slot, hexagon | Any brand with weak photography |
| Rule system | Hairlines at fixed positions: under every heading, at a fixed offset from every edge | Editorial, institutional, technical |
| Corner mark | Registration or crop marks, corner brackets at fixed offsets | Technical, craft, archival |
| Index | Mono labels and numbers on everything: `01 —`, `FIG. 04` | Technical Grid, Heritage Craft |
| Block | Solid rectangles as structure, highlight and crop | Civic Utility, bold territories |
| Glyph | One symbol from the wordmark as bullet, divider, loader, cursor, pattern | Any |
| Diagonal | One consistent angle applied to crops, dividers and motion | Energetic, sports, logistics |
| Stack | Content always in offset overlapping cards | Software, layered products |
| Halftone / grain | A specific texture over every image and flat colour | Craft, music, culture |

**Rules for a device:** one per system · describable in one sentence · works at 32px and at 3m · implementable in CSS by a non-designer · appears on *every* artefact without exception for at least a year.

### Shape language and icons

Decide once, apply everywhere: radius, angle (0° only, or one specific angle), stroke weight, terminal style, and whether forms are geometric or organic. Device, icons, illustration, loaders and layout all obey it. When they do not, the system feels assembled rather than designed.

For v1 use an existing well-drawn set rather than commissioning, but specify it: 24×24 grid, 20×20 live area · stroke **1.5px** uniform (1.75 for warm, 1.25 for fine/technical) · caps and joins round or butt, pick one · 2px corner radius · outline *or* filled, one only, filled reserved for active states · optically balanced — a 16px icon beside 16px text usually needs to be 18–20px to look equal. Known-good free sets: **Lucide** (neutral), **Phosphor** (six weights, excellent coverage), **Radix Icons** (15px grid, very precise), **Remix Icon**. Heroicons is ubiquitous enough to be a mild genericness risk.

**Read `references/iconography.md`** for the board (`assets/icon-styles.html`, twelve concepts in seven drawing languages), the metaphor map, and how the chosen set reaches the site through Iconify.

---

## Motion

**One temperament, applied consistently.** Precise/technical: 120–180ms, sharp ease-out, no bounce, no scale — opacity and small translation only. Confident/premium: 240–320ms, long deceleration, larger travel, nothing ever bounces. Warm/playful: 280–400ms, gentle overshoot on a few elements only, slight scale.

**Show the temperament, never describe it.** "Snappy" and "smooth" mean nothing to a founder until they see the same card arrive both ways. `assets/motion-styles.html` plays one card entering six ways — Still, Quiet, Snappy, Springy, Editorial, Playful — side by side, in the brand's colours and face through the hash (`#ground=FBF7F1&ink=241E1A&accent=1F5D45&on=FBF7F1&font=Inter&label=Occupancy&metric=81%25&cta=Open`). Ask *which one moves like you, which one would embarrass you*. It is one duel, five seconds, and the chosen card's `tokens` block is the starting point for `motion`. If the ledger already points clearly at one temperament, assert it instead and skip the board. Then write three motion principles in the brand's words (`motion.principles`) — the site's Motion page leads with them.

**Duration scales with distance and size.**

| Token | ms | Use |
|---|---|---|
| instant | 80 | Colour and opacity on hover, focus rings |
| fast | 150 | Button state, tooltip, checkbox |
| base | 240 | Dropdown, popover, accordion, tab |
| slow | 320 | Modal, drawer, sheet |
| slower | 480 | Page transition, large hero reveal |

Over 500ms in a UI feels broken; under 80ms is not perceived as motion.

**Easing — things enter quickly and settle slowly, and leave fast.**

| Token | cubic-bezier | Use |
|---|---|---|
| ease-out (default) | `(.16, 1, .3, 1)` | Entering, expanding, hover-in. The workhorse |
| ease-out-soft | `(.25, 1, .5, 1)` | Gentler, for large elements |
| ease-in | `(.7, 0, .84, 0)` | Exiting and dismissal, at a *shorter* duration than the entrance |
| ease-in-out | `(.65, 0, .35, 1)` | Moving A to B while staying on screen |
| ease-spring | `(.34, 1.4, .64, 1)` | Sparingly. One playful element, never utility UI |
| linear | — | Continuous loops only |

**Never use CSS `ease`** — the default is the motion equivalent of a system font.

**Motion is subtractive.** Animate at most two properties, prefer `transform` and `opacity`, keep travel to 8–24px. A fade with a 12px rise at 240ms ease-out covers 80% of a v1. Stagger lists at 40–60ms per item, capped at six. Always honour `prefers-reduced-motion: reduce` — collapse to opacity-only at 100ms, or to none.

---

## What can be defaulted

State these as craft constants rather than brand choices, and do not spend user attention on them.

Spacing scale → the 4/8 ramp. Type scale ratio → 1.25 product, 1.333 editorial. Leading and tracking → the size-dependent tables above. Functional colours → derived at the palette's own chroma and temperature. Neutral ramp → generated in OKLCH from the ground's hue at low chroma. Icons → Lucide 1.5px for standard/technical, Phosphor for warm, Radix for dense product. Motion → 240ms, `cubic-bezier(.16,1,.3,1)`, 12px rise plus fade. Shadow → none, replaced by 1px hairlines and one surface tint. Grid → 12 / 1280 / 32 / 64. Dark mode → re-point the semantic layer, lighten the brand +20% L and desaturate −15% C.

## What must be decided — no default is acceptable

1. The **territory** — everything derives from it.
2. **Typeface(s) and the weight ladder** — the highest-bandwidth brand signal.
3. **Ground and ink** — the two largest surface areas. Choosing `#FFFFFF`/`#000000` by default is a decision to have no brand.
4. **The one brand colour and its permitted roles.**
5. **The organising principle / device** — without it there is no system, only assets.
6. **Density** — airy, standard or dense.
7. **The radius scale.**
8. **The wordmark's typeface, weight and tracking.**

## What to leave open, on purpose

Say these are deliberately unsettled. It is a credibility signal, not a gap.

The **symbol** — ship a wordmark and a monogram, revisit later. **Photography** — specify the direction and the treatment, not a library; real art direction needs a real shoot. **Illustration style** — decide whether it exists at all, commission later. **Extended colour** for product lines and data visualisation — define how to extend (same L, rotate hue by fixed increments), not the colours. **Sub-brands and architecture** — premature. **Merchandise, environment, packaging** — derivable once the device exists.
