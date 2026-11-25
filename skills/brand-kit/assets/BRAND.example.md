---
version: alpha
name: Perch
description: Operations intelligence for independent hotels, in three numbers a general manager can read before the desk opens.
language: en-GB
---

# Perch

## Overview

Perch connects to an independent hotel's property management system and gives the general manager one daily read on occupancy, rate and the week ahead, with the reasons behind each move. It exists because the person who most needs to act is the one with the least time to look.

It looks and sounds like a page from a well-kept book. It resembles Muji signage, Monocle's charts, a hotel's front-desk ledger and a Swiss railway timetable: paper, not glass. It does not resemble SaaS gradient marketing, glassmorphism, a crypto dashboard, boutique-hotel gold foil, illustrated blob people or a dark-mode-first developer tool.

**The organising principle.** Every surface is ruled like a ledger: a hairline under each heading and a mono index label in the top-left corner. Even without the logo, our work is recognisable because it looks like a page from a well-kept book.

**The one weird detail.** The mono index label (`FIG. 04 — OCCUPANCY`, `REF 2026-A`) is never explained and never removed. Do not tidy it away.

When nothing here answers the question, pick the quieter option: fewer colours, fewer type sizes, less motion, more space. If two options are equally quiet, pick the one that reads more like print and less like an app.

Interface work (screens, components, the type scale, spacing, colour roles) follows `@DESIGN.md`, which expresses this brand for every surface Perch builds. Exact values for code live in `@tokens.json`. The brand site in `site/` is built from those files for people: an agent never needs to read it.

```yaml
rules:
  - verdict: do
    rule: Every substantial surface carries the mono index label in its top-left corner and a hairline rule under each heading.
  - verdict: dont
    rule: No emoji, in product, marketing or headings.
    exception: none
```

## Positioning

Operations intelligence for independent hotels, in the words a GM uses: "the morning numbers".

Today they run the house on the PMS's own reports, a spreadsheet and instinct, or they pay for an enterprise revenue management platform that needs a specialist to operate. Perch answers the three questions a GM asks every morning (how full, at what rate, what is coming) and links every number to the bookings that produced it. The proof is the setup: it reads the PMS they already have, with no data entry.

It is not a revenue management system, not a channel manager and not a BI tool. It never offers forty charts where three numbers will do.

## Audience

The general manager of an independent hotel with 20 to 120 rooms, who is also the revenue manager, the operations lead and often the person on the desk at seven in the morning. They believe they know their house better than any software does. They doubt that a tool built for analysts will ever fit into eleven spare minutes. The moment they need us: a week goes badly and nobody can say why.

Owners of two to five properties buy, but they buy because the GM asked. Group revenue managers are not our buyer, and nothing is designed for them.

## Personality

Each trait is a pair, and the second half is the instruction.

<!-- @sync personality: written from tokens.json by sync.py. Edit tokens.json, not this block. -->
```yaml
personality:
  - is: plain
    not: simplistic
    means: Short words for real things. 'Your occupancy dropped four points last week' beats 'Occupancy metrics indicate negative variance.'
  - is: specific
    not: confident
    means: Give the number, the date, the room. Never 'significantly', 'dramatically', 'a lot'.
  - is: warm
    not: chummy
    means: We speak like a good head of housekeeping, not a chatbot. No exclamation marks, no 'Hey there'.
  - is: calm
    not: passive
    means: We never manufacture urgency. No countdowns, no 'limited spots', no red banner for a non-urgent thing.
```
<!-- @/sync -->


## Voice & Tone

<!-- @sync voice: written from tokens.json by sync.py. Edit tokens.json, not this block. -->
```yaml
voice:
  person: We and you. Never 'Perch does X' in product copy — 'We'll email you when the forecast is ready.'
  casing: Sentence case for every heading, button, label and menu item. 'Save changes', not 'Save Changes'.
  sentenceLength: Average under 18 words. Vary it. One-word sentences are allowed.
  examples:
    - instead: Unlock powerful insights into your hotel's performance!
      write: Occupancy dropped four points last week. Here is why.
      why: The number first, the reason second.
    - instead: Our AI-powered solution seamlessly integrates with your PMS.
      write: Perch reads your PMS. Setup takes eleven minutes.
      why: Say what it does and how long it takes.
    - instead: Hurry, limited spots available for our beta!
      write: Start free. Cancel from the settings page.
      why: We never manufacture urgency.
    - instead: Oops! Something went wrong.
      write: The forecast did not load. Your data is safe; try again in a minute.
      why: What happened, and what is safe.
```
<!-- @/sync -->

Present tense, past only for things that happened. Numbers as numerals. en-GB: -ise not -ize, DD Month YYYY, 24-hour clock, £ before the number with no space, no Oxford comma. A spaced en dash, never an em dash.

**Tone by situation**

- **Good news:** the number, then the reason. No celebration.
- **Bad news:** what changed, since when, and what the GM can do today. No softening adjectives.
- **Our own mistake:** first person plural, active voice, what we fixed. "We sent the report late", not "the report was delayed".
- **Sales:** answer the question asked, and say what Perch does not do.

```yaml
rules:
  - verdict: dont
    rule: No exclamation marks, anywhere.
    exception: none
  - verdict: dont
    rule: No vague intensifiers ("significantly", "dramatically", "a lot"). Give the number, the date or the room.
    exception: none
  - verdict: dont
    rule: Never manufacture urgency. No countdowns, no "limited spots".
    exception: none
```

## Messaging

<!-- @sync messaging: written from tokens.json by sync.py. Edit tokens.json, not this block. -->
```yaml
messaging:
  tagline: Know your house.
  oneLiner: Perch turns your PMS data into the three numbers you actually run the house on.
  boilerplate: Perch is operations intelligence for independent hotels. Founded in 2023 and based in Bristol, Perch connects to a property's existing PMS and gives general managers a daily read on occupancy, rate and the week ahead. perch.co
  pillars:
    - claim: Plain answers
      proof: Every number links to the bookings that produced it.
    - claim: No new work
      proof: Connects to your PMS in ten minutes. No data entry, ever.
    - claim: Built for the desk
      proof: Designed for a GM with eleven minutes, not an analyst with an afternoon.
  cta:
    primary: Start free
    never: ["Get started now!", "Book a demo today", "Sign up free — limited spots"]
```
<!-- @/sync -->

The tagline stands alone, on a cover or under the logo; it is never used inside a sentence. The one-liner opens a bio or an introduction. The boilerplate ends every press release unchanged. A headline may paraphrase a pillar but keeps its proof.

## Claims

```yaml
claims:
  - claim: Used by 340 independent properties across the UK and Ireland.
    evidence: Billing export, September 2026. Recount before each use after December 2026.
    status: approved
  - claim: Connects to Mews, Cloudbeds, Guestline and Apaleo.
    evidence: Live integrations listed on the settings page.
    status: approved
  - claim: Average setup time is eleven minutes.
    evidence: Product analytics, sign-up to first report, January to August 2026.
    status: review
  - claim: Perch increases revenue.
    evidence: No study supports it. Say what the GM sees instead.
    status: prohibited
rules:
  - verdict: dont
    rule: Make no factual claim that is not listed here with status approved.
    exception: none
```

## Vocabulary

<!-- @sync vocabulary: written from tokens.json by sync.py. Edit tokens.json, not this block. -->
```yaml
vocabulary:
  use:
    property: What we call a hotel. Never 'hotel asset'.
    house: The warm word for a property, in headlines and talk with GMs.
    guest: The person staying. Never 'customer'.
    rate: The price of a room-night. Never 'ADR' in marketing.
    occupancy: Rooms sold over rooms available, always as a percentage.
    front desk: Two words, lower case. Never 'reception team'.
    set up: Two words as a verb, one word ('setup') as a noun.
    Perch: One word, capital P only. Never 'PERCH' or 'Perch.ai'.
  avoid:
    hotel asset: property
    customer: guest
    reception team: front desk
    utilise: use
    leverage: use
    reach out: email us
    learnings: what we learned
    solution: name the thing — the forecast, the report
    seamless: delete it
    revolutionary: delete it
    unlock: delete it
    empower: delete it
    best-in-class: delete it
    game-changing: delete it
    AI-powered: say what it does — 'forecasts your occupancy'
```
<!-- @/sync -->

## Logo

<!-- @sync logo: written from tokens.json by sync.py. Edit tokens.json, not this block. -->
```yaml
logo:
  full:
    use: The default. Site header, decks, documents, anywhere there is room.
    minSize: 120px
    clearSpace: the height of the mark on every side
    colorways:
      on-light:
        file: assets/logo/perch-lockup.svg
        color: "{colors.ink}"
        backgrounds: ["{colors.paper}"]
      on-dark:
        file: assets/logo/perch-lockup-on-dark.svg
        color: "{colors.paper}"
        backgrounds: ["{colors.ink}", "{colors.moss}"]
  mark:
    use: At 32px and below, and as an avatar or favicon. Never as a decorative watermark.
    minSize: 24px
    clearSpace: half the height of the mark on every side
    colorways:
      on-light:
        file: assets/logo/perch-mark.svg
        color: "{colors.ink}"
        backgrounds: ["{colors.paper}"]
      on-dark:
        file: assets/logo/perch-mark-on-dark.svg
        color: "{colors.paper}"
        backgrounds: ["{colors.ink}", "{colors.moss}"]
```
<!-- @/sync -->

The wordmark is Fraunces at weight 400 with the ascender of the h shortened to cap height; that is the whole mark. The lockup on paper is the default. The mark alone appears at 32px and below.

A logo is always placed from its file. Never ask an image model to draw it: generate the image without it, then place the file.

```yaml
rules:
  - verdict: dont
    rule: Never recolour the logo outside ink, paper and moss.
    exception: none
  - verdict: dont
    rule: Never stretch, rotate, outline, add a shadow to, or re-set the wordmark in a live font.
    exception: none
```

## Colors

<!-- @sync colors: written from tokens.json by sync.py. Edit tokens.json, not this block. -->
```yaml
colors:
  moss: "#1F5D45"
  ink: "#241E1A"
  paper: "#FBF7F1"
required: ["{colors.moss}", "{colors.ink}", "{colors.paper}", "{typography.display}"]
print:
  moss:
    cmyk: 70 0 26 64
    note: Conversion to proof on uncoated stock. No Pantone chosen yet.
  ink:
    cmyk: 0 17 28 86
  paper:
    cmyk: 0 2 4 2
    note: "On cream stock, leave unprinted: the paper is the colour."
```
<!-- @/sync -->

- **Moss** {colors.moss} is the one active thing: the primary action, the link, the line on the chart that matters. In words: a deep, cool forest green, like a bound ledger's cloth spine; not emerald, not teal, not olive. It is small: one or two elements per view.
- **Ink** {colors.ink} carries all text. In words: a warm near-black, like fountain-pen ink dried on paper; never pure black.
- **Paper** {colors.paper} is the ground of everything. In words: a warm off-white, like uncoated book stock; never pure white, never cream-yellow.

The state colours (clay for attention, rose for danger, slate for information) are interface colours, defined in `@DESIGN.md`. They are never used for decoration and never in marketing.

```yaml
rules:
  - verdict: dont
    rule: Never a gradient on a surface.
    exception: A chart fill may fade moss to transparent.
```

## Typography

<!-- @sync typography: written from tokens.json by sync.py. Edit tokens.json, not this block. -->
```yaml
typography:
  display:
    fontFamily: Fraunces
    fallback: Iowan Old Style, Georgia, serif
    license: SIL OFL 1.1
    licenseVerified: true
  text:
    fontFamily: Inter
    fallback: "-apple-system, Segoe UI, sans-serif"
    license: SIL OFL 1.1
    licenseVerified: true
  mono:
    fontFamily: IBM Plex Mono
    fallback: ui-monospace, SF Mono, monospace
    license: SIL OFL 1.1
    licenseVerified: true
```
<!-- @/sync -->

**Fraunces** sets headlines, pull quotes, deck titles and big numbers: the warmth of the brand is in its modulation, not in colour. **Inter** sets everything read at length and every piece of interface. **IBM Plex Mono** sets the index labels and figures in dense tables; it is part of the device.

```yaml
rules:
  - verdict: dont
    rule: Never set Fraunces at weight 700, and never use it for body text or interface labels.
    exception: none
```

## Imagery

When two elements compete for the same job, type and the ledger rule win, then photography, then charts (drawn as `@DESIGN.md` says). Perch does not illustrate. Brief every image and layout against one concept: the house at work.

### Photography

Documentary. The camera is a guest who arrived early: it notices how the house runs before anyone performs for it. Real properties in mid-morning window light, staff mid-task or empty rooms, eye level, square to the architecture. One image per surface.

Recipe: "documentary photograph, small independent British hotel, available mid-morning window light, eye level, square to the architecture, verticals straight, nobody looking at the camera, natural colour with a slight warm balance, fine grain, no filter, no text, no logo."

The images in `assets/photography/` are generated direction. Never publish one as a real property.

```yaml
rules:
  - verdict: dont
    rule: Never stock photography, golden hour, a warm grade, or anyone smiling at a laptop.
    exception: none
  - verdict: dont
    rule: Never set type on a photograph.
    exception: none
visuals:
  - file: assets/photography/hero.webp
    verdict: do
    caption: Front desk at 07:10. Available light, nobody there yet, square to the counter.
  - file: assets/photography/dont-stock.webp
    verdict: dont
    caption: Stock hotel photography shows a hotel nobody runs. Shoot a real property on a weekday morning.
  - file: assets/photography/dont-laptop.webp
    verdict: dont
    caption: A smile at a laptop is the category's oldest cliché. Show staff mid-task, away from screens.
```

### Illustration

None. Use a chart, a photograph or nothing. Diagrams are not illustration: 1.5px strokes matching the icons, brand colours only, labels in mono. If a page feels empty, the fix is more space and fewer elements, not a picture.

```yaml
rules:
  - verdict: dont
    rule: No illustration of any kind, no characters, no drawn metaphors.
    exception: Diagrams drawn in the icon stroke, in brand colours, labelled in mono.
```

### Icons

Lucide, outline, 1.5px stroke on a 24px grid. Filled only for the active state. One concept, one icon: occupancy is always `bed-double`, never a person and never a percent sign.

```yaml
rules:
  - verdict: dont
    rule: Never mix Lucide with another icon set or with emoji.
    exception: none
```

## Motion

<!-- @sync motion: written from tokens.json by sync.py. Edit tokens.json, not this block. -->
```yaml
motion:
  settle:
    duration: 240ms
    delay: 0ms
    timingFunction: cubic-bezier(.16, 1, .3, 1)
  confirm:
    duration: 150ms
    delay: 0ms
    timingFunction: cubic-bezier(.16, 1, .3, 1)
```
<!-- @/sync -->

Quiet and quick. Motion confirms; it never performs. Things fade and rise 12px and then stay still, like a page settling on a desk.

- **Settle** ({motion.settle.duration}) is how anything arrives.
- **Confirm** ({motion.confirm.duration}) is a number that changed, fading in once.

```yaml
rules:
  - verdict: dont
    rule: No bounce, no overshoot, no spring. Nothing flies in or scales from zero.
    exception: none
  - verdict: dont
    rule: The logo never animates.
    exception: none
```

## Applications

### Product

Follows `@DESIGN.md`. Light first, with dark mode; the index label on every card; moss on one primary action per view.

### Marketing site

Paper ground, one photograph per page at most, the three numbers shown as the product shows them. The primary call to action is always "Start free".

### Email

Plain in appearance: paper ground, ink text, no header image, the wordmark once in the footer. System fonts only: a webfont will not load in a mail client. Subject lines state the content ("Your week ahead, 22 September"). Signed "The Perch team".

### Decks

Paper ground, one idea per slide, the index label on every slide, numbers in Fraunces. The cover may centre its title; nothing else does. The last slide is the tagline alone.
