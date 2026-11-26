# The codebook

Looking produces impressions. Impressions cannot be counted. The codebook turns what a coder sees into one value per dimension, from a closed list, so that "most of them look the same" becomes "7 of 10".

The lists live in `assets/lib/schema.mjs` and `code.mjs` enforces them. This file says what each value means.

## Rules that apply to every dimension

- **One value per dimension.** The dominant one. If two are truly equal, take the one in the hero.
- **Code the brand across all its captures**, home page, inner pages and store listing, not its first screen alone. The hero says what the brand wants to be this month; the rest says what it is.
- **Code what is on the capture**, not what you know about the brand. If the capture shows a campaign page, that is what is coded, and `notes` says so.
- **`other:<two or three words>`** when nothing fits. Do not stretch a value to avoid it. Several brands with the same `other:` is a finding: a code that belongs to this sector.
- **Leave a dimension out** rather than guess, when the capture does not show it. A missing value is not counted; a guessed one is.
- **`notes`**: one or two sentences on what makes this brand unlike the others. It is free text, read by the analyst, never counted.

## Logo

Coded on the **primary logo**, the one in the site header (`logo.webp`, or the header of `desktop.webp` when the logo was not captured).

### `logo_type`: seven values

| Value | What it is | Tell |
|---|---|---|
| `wordmark` | The name, set in type, and nothing else | Remove the letters and nothing is left |
| `lettermark` | One to three letters or a monogram standing for the name | Initials, an abbreviation, a single letter. The full name is absent from the mark |
| `pictorial` | A recognisable picture of a thing, alone | You can name the object: a bird, an apple, a flame |
| `abstract` | A non-representational shape, alone | You can describe it only as geometry: a swoosh, three bars, a knot |
| `combination` | A symbol and the name, side by side or stacked | Two separable parts. The most common type by far |
| `emblem` | The name locked inside a shape: a badge, a seal, a crest | The parts cannot be separated without redrawing |
| `mascot` | A character | It has a face or a body and could be given a voice |

Tie-breaks:

- A wordmark in which one letter is redrawn as a picture (an `o` that is a ball) is still a `wordmark`. Say it in `notes`.
- A symbol used alone in the header, with the name nowhere in the mark: `pictorial`, `abstract`, `lettermark` or `mascot`. Not `combination`.
- A name inside a plain coloured rectangle is a `wordmark` on a background, not an `emblem`. An emblem has a designed container.

### `symbol_nature`: only for `combination`

Because most brands are combination marks, that value alone would hide everything. This field says what the symbol is: `lettermark`, `pictorial`, `abstract` or `mascot`, with the definitions above. It is required on a combination mark and refused on any other type.

### `symbol_subject`

What the symbol shows, in one to three lower-case words: `running figure`, `letter s`, `flame`, `route line`, `chevron`, `heart`, `shoe`. Use `none` for a wordmark. Prefer the word a member of the public would use, and reuse the same word across brands when it is the same thing: this is the field where motif clichés appear, and they only appear if `runner` is not also written `running man` and `sprinter`.

### `symbol_used_alone`

`true` when the brand also uses its symbol without the name (app icon, favicon, social avatar). Look at `icon.webp` and `app-icon.webp`. Not counted; it tells the designer whether the category expects a symbol that stands alone.

### `logo_form`, `logo_energy`, `logo_detail`

Three traits that cut across the types, coded on the whole mark.

| Dimension | Values | Tell |
|---|---|---|
| `logo_form` | `geometric`, `organic` | Built from circles, straight lines and constant strokes, or drawn with a hand behind it: irregular curves, a pen, a brush |
| `logo_energy` | `static`, `dynamic` | Upright and at rest, or leaning, slanted, cut, in motion |
| `logo_detail` | `minimal`, `detailed` | Readable at 16 px with nothing lost, or carrying inner lines, shading, several elements |

### `name_case` and `name_style`

How the name is written in the logo. `name_case`: `lower`, `upper`, `title`, `mixed`. `name_style` uses the type classes below. `custom` is for lettering drawn for the brand that fits no class.

## Type classes

Used by `name_style`, `headline_class` and `text_class`.

| Value | Look for |
|---|---|
| `geometric_sans` | Round `o`, single-storey `a` often, even strokes: Futura, Circular, Poppins, Gilroy |
| `grotesque` | Neutral, slightly squared, closed apertures: Helvetica, Inter, Söhne, Akzidenz |
| `humanist_sans` | Open apertures, a pen behind the shapes: Gill, Frutiger, Open Sans, Source Sans |
| `serif` | Any serif that is not a slab |
| `slab` | Heavy, unbracketed serifs |
| `script` | Handwriting, brush, connected letters |
| `mono` | Fixed width |
| `custom` | A house typeface or lettering that belongs to none of the above |

`measures.headline.family` and `measures.fonts` give the family names. A name you recognise settles the class. A house name (`AlanSans`, `Boathouse`) does not: look at the letters in the screenshot.

Condensed, italic and extended are not classes. When the headline is strongly one of them, write `other:condensed grotesque italic` only if that is what dominates the impression; otherwise code the class and put it in `notes`.

## Colour

Coded on what the **eye** sees in `desktop.webp`, with the measures as a start. The measured palette does not see photographs: a hero that is a full-bleed image of a forest is green to the eye and white to the script.

- `hue`: the brand's dominant hue, the one you would name if asked for its colour. `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `purple`, `pink`, `brown`, `neutral`. Black-and-white brands are `neutral`. `measures.accent` usually gives it.
- `saturation`: of that hue. `muted`, `medium`, `vivid`.
- `ground`: what the page sits on. `light`, `dark`, `coloured`. `measures.ground` usually gives it.
- `hue_count`: distinct brand hues, neutrals excluded. `one`, `two`, `many`.

## Imagery

What carries the hero and the first two screens.

| Value | What |
|---|---|
| `people_photo` | Photographs of people: users, athletes, staff |
| `product_ui` | The product's own screens, in a phone or bare |
| `product_photo` | Photographs of a physical product or a place |
| `illustration_flat` | Flat or line illustration |
| `illustration_3d` | Rendered 3D objects or characters |
| `abstract_graphic` | Shapes, gradients, patterns, data as decoration |
| `video` | Moving image fills the hero |
| `none` | Type and colour only |

A photograph with a phone mock-up in front of it: code what takes more of the hero.

## Layout

| Value | What |
|---|---|
| `centered_hero` | Headline centred, call to action below, image under or behind |
| `split_hero` | Text on one side, image on the other |
| `full_bleed_media` | An image or video fills the viewport, text on top of it |
| `dense_grid` | Many tiles, cards or products from the first screen |
| `editorial` | Asymmetric, type-led, reads like a magazine page |

## Headline promise

What the main headline does. `measures.headline.text` has it; check it against the screenshot.

| Value | The headline… | Example |
|---|---|---|
| `benefit` | says what you get | "Run faster in 8 weeks" |
| `mechanism` | says how it works | "Plans that adapt after every run" |
| `manifesto` | states a belief or an attitude | "Running is for everyone" |
| `proof` | leads with a number or an authority | "Trusted by 2 million runners" |
| `community` | invites you into a group | "Together, we run" |

## The coder prompt

Four or five brands per coder: each brand is about ten images. Give the absolute paths; the coder must open the images.

```
You are coding brands for a visual audit. You look at captures and return codes from a closed
vocabulary. You do not judge, compare or recommend.

Read the codebook first: <absolute path to this file>

For each brand below, list its folder and open every image in it: desktop.webp (the first
screen), scroll-2 to scroll-4.webp (the rest of the home page), page-1 and page-2.webp (inner
pages), app-icon.webp and app-1 to app-3.webp (the App Store listing), logo.webp, icon.webp,
mobile.webp. full.webp is a small overview; the tiles are the readable version. A brand is more
than its first screen: code what dominates across everything you see, and when the first screen
and the rest disagree, code the whole and say it in notes. Read measures.json: it holds colours and typefaces
measured on the page, to start from, not to copy. When a measure and the image disagree, the
image wins and you say so in notes.

Brands:
- <id>: <absolute path to evidence/<id>/>
- …

Code only what the captures show. Do not use what you know about these brands from elsewhere.
If a capture does not show a dimension, leave it out.

Return JSON only:
{
  "<id>": {
    "logo_type": "…", "symbol_nature": "… (combination marks only)", "symbol_subject": "…",
    "symbol_used_alone": true|false,
    "logo_form": "…", "logo_energy": "…", "logo_detail": "…",
    "name_case": "…", "name_style": "…",
    "hue": "…", "saturation": "…", "ground": "…", "hue_count": "…",
    "headline_class": "…", "text_class": "…",
    "imagery": "…", "layout": "…", "headline_promise": "…",
    "notes": "one or two sentences: what sets this brand apart on the capture"
  }
}
```

Save each coder's answer as a file and merge with `node assets/code.mjs brand/audit <files>`. A refused value is reported with the brand and the dimension: correct the file, or send that one brand back to a coder, and merge again.

Code every brand with a capture, whatever its role. Aspirational brands and partial captures are coded too; only the direct, fully captured ones are counted.

## Double coding (deep)

The dimensions that depend on judgment are `logo_type`, `symbol_nature`, `name_style`, `headline_class`, `imagery`, `layout` and `headline_promise`. In deep mode, send every direct brand to a second coder who has not seen the first answers, and merge the second set the same way. `code.mjs` keeps the first value and lists each disagreement.

Settle each one yourself, looking at the capture. Then write the final values in a file and apply it:

```bash
node assets/code.mjs brand/audit resolved.json --resolve
```

Two things to read in the disagreements before settling them. A dimension where coders disagree on half the brands is a dimension the codebook defines badly for this sector: say it in `limits` and lean on it less. And a brand that draws disagreement on several dimensions is usually the interesting one: it sits between two territories.

`check.mjs` fails while a conflict is open.
