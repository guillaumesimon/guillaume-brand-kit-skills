# The creative synthesis

The research sections say what the category looks like. This phase says what that means for the brand to be designed, and hands it to the next agent in a form it can act on and challenge. It runs after everything else and is yours: it reads the framing and the whole audit, not the summary.

The audit is not the identity. It narrows the problem; it does not pick a logo, a palette or a typeface.

## The chain every recommendation follows

```
framing + observed evidence → finding → implication → recommendation → trade-off → how to validate
```

Five kinds of statement, never blurred:

| Layer | Question | Where it lives |
|---|---|---|
| Evidence | What was observed? | `evidence/`, measures, codes |
| Findings | What patterns exist? | section findings (`F-…`), conventions (`C-…`) |
| Implications | Why does it matter for this brand? | each section's `implications` |
| Recommendations | What to do about it? | `synthesis.decisions` (`D-…`), `synthesis.territories` (`T-…`) |
| Evaluation | How will we know it works? | `synthesis.evaluation`, `summary.validate` |

Rules that hold throughout:

- **Prevalence is not necessity, rarity is not originality, absence is not demand.** "No brand in a panel of eight shows a solo runner" is a finding. "Solo running is an unmet need" is a hypothesis about people, and the audit has not met any.
- **A perception is never an observation.** A slanted mark is slanted (observed). That the audience reads it as competitive is an interpretation; write it as one.
- **Every recommendation cites finding IDs.** One that cannot is reframed as a hypothesis, or dropped.
- **Denominators stay visible.** Eight brands counted, nine icons, six measured accents: say which each time, and carry the same figure everywhere. `aggregate.mjs` gives every finding and convention an ID; cite those.
- **Direct, indirect and aspirational are three datasets.** Aspirational brands show a mechanism that works somewhere, not proof it works here.
- **Do not ban a whole colour or a whole type of logo.** Name the crowded combination and why ("royal blue with a white pictogram is the leader's").
- **Confidence belongs to a claim**: `high` when directly observed and well covered, `medium` when it leans on interpretation or thin coverage, `low` when it extrapolates. A high-confidence finding can carry a low-confidence recommendation.

**Fit the touchpoints to the product.** For an app they are the icon, the store listing and the home page; for a shop, the sign, the bag and the site; for a service, the proposal and the invoice. Name the ones that matter in the territories and in the evaluation gates.

## 1 · Implications, section by section

Each written section ends with a compact block. Write it yourself after reading the section, or have the section writer draft it and edit it:

```json
"implications": {
  "implication": "What this means for this brand, in one or two sentences.",
  "preserve": ["signals or requirements worth keeping"],
  "explore": ["promising directions, not solutions"],
  "deprioritise": ["directions with a stated downside"],
  "tradeoff": "What may be lost by following this.",
  "confidence": "high | medium | low"
}
```

Leave a list empty rather than fill it for symmetry. "Nothing here changes the brief" is a valid implication.

## 2 · Thesis, tension, uncertainty

```json
"synthesis": {
  "thesis": "What the brand should communicate, to whom, keeping which category expectations and challenging which conventions.",
  "tension": "The two things it has to hold at once.",
  "uncertainty": "The one unknown that would most change the recommendations."
}
```

The thesis is a synthesis of the framing and the audit. It is not validated by anyone; say so where it matters.

## 3 · The decision matrix

One row per decision that matters, across logo, symbolism, colour, typography, imagery, graphic system, voice and touchpoints:

```json
{ "id": "D-03", "dimension": "Colour", "status": "explore",
  "recommendation": "A tinted, light ground held across site, icon and store.",
  "rationale": "Colour is reduced to a button on most direct sites and changes between site and store.",
  "finding_refs": ["F-COL-01", "C-04"], "tradeoff": "Less contrast for dense screens.", "confidence": "medium" }
```

| Status | Use it for |
|---|---|
| `required` | A functional, legal or explicit brief constraint. The product fails without it. Rare |
| `preferred` | A category signal worth keeping unless a stronger idea needs to break it |
| `explore` | A direction the evidence opens |
| `deprioritise` | Crowded or weakly aligned; allowed with a reason |
| `avoid` | A competitor's property, or a collision the audience would misread |

A common convention is never `required`. If you are about to write `required`, ask what breaks without it: "the icon must read at 60 px" breaks the product; "a light ground" breaks nothing.

## 4 · From opportunities to territories

Opportunities sit at different levels: an image direction, a system principle, a positioning. They are not alternatives; several combine into one coherent answer. **Territories are the alternatives**: two to four genuinely different creative responses to the same brief. Do not manufacture a third to fill a quota; do not present three variations of one idea.

First say, in the decision matrix, what every territory shares. Then, per territory:

```json
{ "id": "T-quiet-loop", "title": "The quiet loop",
  "idea": "One sentence: the creative idea.",
  "description": "One or two sentences on the brand this would be.",
  "perception": "What the audience should feel or think. A hypothesis.",
  "finding_refs": ["F-VIS-02", "C-07"], "opportunity_refs": ["alone-outside"],
  "directions": {
    "personality": "three traits",
    "logo": "architecture and formal qualities, not a drawing",
    "symbolism": "ideas a sign could carry",
    "colour": "principles and relationships, never hex values",
    "typography": "characteristics, never a font name",
    "photography": "who, where, in what light; or illustration, or none",
    "graphic_system": "the recurring device",
    "voice": "how it speaks"
  },
  "touchpoints": { "<the touchpoints that matter for this product>": "…", "Home page": "…" },
  "preserves": ["category signals kept"], "challenges": ["conventions broken"],
  "risk": "What could go wrong, and the credible counter-argument.",
  "confidence": "medium",
  "validate": "What would confirm or kill it, and how to test.",
  "open_decisions": ["what is deliberately left to the designer"],
  "moodboard_plan": { "panel": [], "library": [], "web": [] }
}
```

Directions are principles a designer can interpret three different ways. "Muted natural tones" is a direction; `#B8A58A` is a decision that is not yours to make. `open_decisions` is required: it is how the next agent knows where its freedom is.

Test each pair of territories: could one moodboard serve both? Then they are one territory.

## 5 · The moodboards

A territory is judged by eye. Each one gets about ten images, every one real, sourced, and there for one stated mechanism. A moodboard is a set of annotated references, not decoration.

Three sources, mixed:

- **`panel`**: images already in `evidence/`, mostly from aspirational brands. `{ "asset": "evidence/<brand-id>/media-2.webp", "note": "…" }`
- **`library`**: logos and identities from the Logosystem catalogue, picked by tags across all its industries (any of its pages carries the whole catalogue). `{ "tags": ["serif", "calm"], "n": 2, "note": "…" }`. Tags come from its vocabulary: types (`wordmark`, `symbol`, `symbol-and-text`), styles (`serif`, `sans-serif`, `script`, `hand-drawn`, `geometric`, `monoline`, `lowercase`, `rounded`, `bold`, `minimal`, `vintage-and-retro`), moods (`calm`, `friendly`, `playful`, `elegant`, `energetic`, `premium`, `modern`), subjects (`abstract`, `letterform`, `nature-and-plant`, `human-and-face`, `wave`, `circle`), colours.
- **`web`**: a page whose main image is the reference: an editorial cover, a studio case study, a photographer's series, a campaign. `{ "url": "https://…", "note": "…" }`. The script takes the page's social image, else its largest picture.

Dispatch one **moodboard scout** per territory to find the `web` references and choose the `panel` ones:

```
You are building the moodboard of one creative territory for a brand designer. Find real,
published images that each show ONE mechanism the territory needs. You are not illustrating a
mood; you are collecting evidence that a mechanism exists and works somewhere.

Brand to design: <framing>
Territory: <title, idea, description, the eight directions>
Already in evidence (you may pick from these): <list of evidence/<brand>/media-*.webp and app-*.webp with their kinds>

Find 6 to 8 web references outside this product's direct competitors: editorial covers and
spreads, brand identity case studies on studio sites, photography series, packaging, signage.
Cover the directions between them: at least one each for photography or illustration, typography,
colour, logo or symbol, and graphic system. Prefer the publisher's or the studio's own page.
Fetch each page and confirm it loads and shows the image you mean.

For each reference and each panel image you choose, write the note as:
"<what to look at>: <the mechanism>. Do not copy <what is theirs>."

Write valid JSON to <path>: { "panel": [{ "asset", "note" }], "library": [{ "tags", "n", "note" }], "web": [{ "url", "note" }] }
Then reply with one line per image.
```

Then:

```bash
node assets/moodboard.mjs brand/audit
```

It fetches, saves under `evidence/territories/<id>/`, and reports what it missed. Nothing is generated or substituted: a page that blocks the visit is reported and left out. **Look at every moodboard, then curate it.** The script keeps everything it found; you keep ten. In `audit.json`, reorder each territory's `moodboard` and cut it to ten images: the first is shown large, so lead with the image that best carries the territory, and mix photography, type, sign and system rather than grouping them. Library picks are the most hit-and-miss: drop the ones that only match their tags. Remove an image that does not show its mechanism, replace what was missed, and re-run with `--only <territory-id>`. `check.mjs` asks for at least six images per territory.

Borrow the mechanism, not the look. The moodboard and the `references` list say what to study in each image and what must not be copied. These are third-party images, for internal reference: the report is not published.

## 6 · References, evaluation, hand-off

**References** are the few panel assets worth a designer's close study, across territories:

```json
{ "asset": "evidence/<brand-id>/app-1.webp", "mechanism": "One ground and one handwritten word, unchanged from icon to every store image.",
  "reinterpret": "Find the one surface this brand can hold everywhere.", "do_not_copy": "The gradient, the script, the blue." }
```

**Evaluation** is how a concept will be judged, derived from this brief, with gates kept apart from preferences:

```json
{ "criterion": "Functional", "test": "The mark is recognisable at its smallest real size, in one colour, beside the competitors' marks.", "gate": true }
```

A gate rejects a concept (a required size, a required contrast, category recognition). A preference weighs on it (differentiation, system potential). Using a common hue is never a gate. Looking unlike a competitor is not trademark clearance: flag legal review separately. An agent's prediction of how an audience will react is unvalidated, and says so.

**For brand-kit**: what the next skill needs, in four keys:

```json
"for_brand_kit": {
  "swap_competitor": "The most typical established brand, and why.",
  "swap_evidence": "evidence/<brand-id>/desktop.webp",
  "duel": ["evidence/<most-typical>/desktop.webp", "evidence/<most-deviant>/desktop.webp"],
  "not_list": ["the clichés as a designer would say them", "…"]
}
```

Typical is the direct brand that matches the most conventions; deviant, the fewest.

**The brief** is generated:

```bash
node assets/brief.mjs brand/audit
```

It writes `AUDIT.md` from `audit.json`: thesis, decisions by status, what the category does with its counts, the territories with their moodboard notes, references, evaluation, what to validate, limits. Never edit it by hand; `check.mjs` compares it with the data and fails on any difference. To change the brief, change the data.

**Then rewrite the summary** from the completed synthesis, last.

## Before it goes out

In deep mode, hand the framing, `audit.json` and the evidence folder to an independent critic with this list. In flash, run it yourself.

- Does every decision and territory cite findings that exist, and does each finding's evidence show what it says?
- Do counts, bases and exclusions agree between the sections, the conventions and the brief?
- Is anything about what people think or want written as a fact?
- Are direct, indirect and aspirational evidence kept apart?
- Is each `required` a real constraint?
- Are the territories different enough that one moodboard could not serve two?
- Does each moodboard image show the mechanism its note claims?
- Could the next agent start from `AUDIT.md` alone?
- Does the summary say what the synthesis says?

A gate that fails is repaired. Where the evidence cannot be had, the recommendation is weakened or removed and the limit is written down.
