# The subjects and the board

The board is where the brand gets settled: five or six subjects, one at a time, each judged on its own material, against brands of the product's own world.

## Choosing the subjects

Five or six, chosen for this project. A subject is worth a place when a designer's choices depend on it and the founder cannot be expected to state it in words.

Common ones, and what each shows:

| Subject | Poles (rewrite them for the project) | `kind` | What the user sees |
|---|---|---|---|
| Tone | serious / playful, hushed / direct, formal / conversational | `quote` | a real sentence of the brand, set large |
| The place of a technology | the human first / the machine first | `quote` | how the brand talks about it, in its own words |
| Status | accessible / exclusive | `quote` or `image` | a promise, a price line, or a visual |
| Presence | quiet / loud | `image` | a visual: a campaign, a hero image, a pack |
| Colour | sober / colourful, cold / warm | `palette` | the colours measured on the brand's site |
| The sign | a name set in type / a symbol, plain / drawn | `logo` | logos alone, same size, on white |
| Imagery | objects / faces, photographs / drawings | `image` | a photograph or an illustration of the brand, without text |
| Era | established / new | `logo` or `image` | what reads as old or new |

Rules:

- **Write the poles for this product.** For a recruiting tool for search firms, "serious / playful" is the wrong axis: nobody there is playful. "Hushed / direct" is the real one. The right poles are the two ways a company in this world actually behaves.
- **Always include the subject the product turns on.** For an AI tool, the place of the AI. For a food brand, craft against industry. It is rarely in the table above.
- **Start with tone.** It is the easiest to judge and it teaches the user how the board works.
- **Skip what is already decided.** An existing name, an imposed colour: these are constraints, not subjects.
- Six is the ceiling. Past that the answers get faster and worth less.

## The matter of each subject

The thing judged must be the thing asked about. This is the rule the first version broke, by showing a home page for everything.

- **`quote`**: one sentence, at most two, **as the brand wrote it**, from its site, an ad or its product. Take the sentence that carries the voice: a headline, a promise, a refusal. Not a navigation label, not a promotion of the week. `fetch.mjs` returns the sentences each brand sets largest in `copy`; choose from them or read the page. The board sets every quote in the same neutral type, on a blurred image of the brand, so the words are judged and not the typeface. Keep the sentence in its language; if the user does not read it, pick brands that write in theirs.
- **`palette`**: the colours `fetch.mjs` measured on the brand's first screen, largest surface first. Never colours from memory. If the measure is poor (a page that is one big photograph), give `colors` read from the brand's own guidelines, or drop the brand from this subject.
- **`logo`**: the logo alone. Name it as a material of the reference (`materials.logo.image_url`, from the press kit or the site's own file); the board shows it on white, at one size.
- **`image`**: a visual that shows the brand doing the thing: a campaign, a pack, a hero photograph. Either a direct picture (`materials.<name>.image_url`) or the capture, cropped onto the visual with `crop` so that the menu and the text are out of the frame.

## Choosing the brands

About twelve in all, each used in one to three subjects.

| Circle | What it is | For a research tool sold to executive-search firms |
|---|---|---|
| `buyer_world` | what the buyers look at every day and respect | Spencer Stuart, Egon Zehnder, Russell Reynolds, Korn Ferry |
| `direct` | the alternatives they compare | LinkedIn Recruiter, Juicebox, hireEZ, Gem, Ashby |
| `adjacent` | other tools and services the same buyer uses | Welcome to the Jungle, lemlist, Superhuman |
| `analogous` | the same problem solved for another trade | Harvey (AI for lawyers), Granola (AI that stays out of the way) |

The right-hand column is an example, not a list to reuse.

- **The world first.** Most brands come from `buyer_world` and `direct`. The user must recognise their own landscape on the board: that is what makes the judging feel relevant.
- **An outside brand needs a reason about this project**, said in one sentence: "Harvey: AI sold to a profession whose value is its judgement." A brand that is merely famous or well designed is not a reference. A telecom operator and a restaurant guide on a recruiting tool's board is the failure this file exists to prevent.
- **Every brand the founder names goes in**, tagged `founder_cited`.
- **Known to this user.** If the founder may not know a brand, it can still serve when its material speaks for itself (a sentence does; a logo does not). The board always offers "I don't know this brand".
- **A spread on each subject.** Each subject needs brands at both ends and in the middle, or there is nothing to choose between.

A reference in `brief.json`:

```json
{ "id": "harvey", "name": "Harvey", "circle": "analogous",
  "url": "https://www.harvey.ai",
  "why": "AI sold to a profession whose value is its judgement.",
  "founder_cited": false,
  "materials": { "logo": { "image_url": "https://…/harvey-logo.svg" } } }
```

`url` and `why` are required. `fetch.mjs` adds `asset`, `capture`, `palette` and `copy`.

### The scouts

One subagent per circle, in parallel, while the interview goes on. Without subagents, search yourself.

```
You are scouting reference brands for a brand discovery. You return candidates with their material.

Product: <one sentence>. Buyer: <who>. Market: <country, language>. Used today instead: <alternative>.
Subjects that will be judged: <the five or six subjects, with their poles>.

Your circle: <buyer_world | direct | adjacent | analogous>, meaning: <definition>.
Find <n> real brands of this circle. The buyer must recognise most of them at once.
For "analogous": each brand needs one sentence saying which problem of THIS product it solved.
No brand because it is famous or well designed.

For each brand, return JSON:
{ "id", "name", "circle", "url", "why",
  "quotes": [up to 3 sentences copied exactly from its site or ads, each with "source_url"],
  "materials": { "logo": { "image_url" }, "visual": { "image_url" or "shot_url" } }   (when you found them)
  "where": for each subject it could serve, which end it sits at }

Rules: copy sentences exactly, never paraphrase or translate. Open every image_url and check it is that
brand. Never invent a URL or a sentence; return less rather than something unverified.
Write the JSON array to <path>. Reply with one line per brand: its name and why.
```

Merge into `references`, remove duplicates, check each `why`.

## Fetching and checking

```bash
node assets/fetch.mjs $BRIEF                           # every reference without an image
node assets/fetch.mjs $BRIEF --only harvey,gem --force
node assets/fetch.mjs $BRIEF --reject gem "the first screen is a webinar banner"
```

For each reference: the page is captured at the market's locale; the consent banner is clicked; modals, cookie bars, region pickers, chat bubbles and newsletter pop-ups are hidden; the site's own header is left alone. A bot challenge is reported `blocked` and a maintenance or empty page `failed`: the script never tries to defeat a block. The palette is measured, the largest sentences are read into `copy`, each material is downloaded, and contact sheets are written to `evidence/sheet-N.webp`.

**Open every contact sheet.** No heuristic replaces this look. Reject an image when a banner or pop-up is still visible, the page is a loading state, the first screen is a promotion or a carousel slide that says nothing of the brand, the brand cannot be read, or it is in the wrong language for this user. Try once more with a better `shot_url` or `image_url`, then leave the brand out of the subjects that need an image. It can still serve a `quote` subject: a sentence needs no capture.

A blocked site is common (job boards, marketplaces). Use what the brand publishes elsewhere, or another brand of the same circle.

## Writing the round

`brand/brief/rounds/r1.json`:

```json
{ "id": "r1", "subjects": [
  { "id": "tone", "name": "Le ton", "kind": "quote",
    "question": "Quand dogo parle à un chasseur de têtes, il est plutôt…",
    "ask": "Si dogo parlait comme %s, ce serait…",
    "left":  { "label": "Feutré", "title": "Feutré et institutionnel", "desc": "La voix d'un grand cabinet. Posée, un peu distante.", "word": "feutré" },
    "right": { "label": "Direct", "title": "Direct et sûr de lui", "desc": "Des phrases courtes, qui tranchent et qui promettent.", "word": "direct" },
    "too_left": "Trop feutré pour nous", "ok": "Le bon ton pour nous", "too_right": "Trop bravache pour nous",
    "specimens": [
      { "ref": "egonzehnder", "quote": "In a world full of questions, we deliver human-centric solutions.", "look": "Leur phrase d'accueil." },
      { "ref": "russellreynolds", "quote": "Your Leadership Challenges, Solved.", "look": "Leur phrase d'accueil." },
      { "ref": "harvey", "quote": "The world's top law firms and in-house legal teams trust Harvey with their highest-stakes work.", "look": "De l'IA pour avocats, présentée par ses clients." },
      { "ref": "ashby", "quote": "What an ATS should be.", "look": "Leur phrase d'accueil." },
      { "ref": "juicebox", "quote": "Win the talent war", "look": "Leur phrase d'accueil." }
    ] }
] }
```

Every label is yours to write, in the user's language, and each must read as plain speech:

- `name`: two or three words. `question`: a sentence that ends on "…" and that either camp completes.
- `left` and `right`: `label` for the ends of the scale; `title` and `desc` for the camp (one sentence, what it is like, no jargon); `word`, an adjective that completes "never as … as [brand]".
- `ask`: the swipe question, with `%s` for the brand: "Si dogo parlait comme %s, ce serait…".
- `too_left`, `ok`, `too_right`: three answers that complete `ask`. "Trop feutré pour nous · Le bon ton pour nous · Trop bravache pour nous". Read the question and each answer aloud as one sentence; if it does not hold, rewrite. "C'est ça" was tried and nobody understood it.
- `specimens`: three to six, **ordered from the left pole to the right one**. The first two illustrate the left camp and the last two the right one. `look` is one short line saying what to look at or where the sentence comes from; never what to think of it.
- For `image`, `crop: { "x": 50, "y": 40, "z": 1.5 }` frames the visual (focus point in percent, zoom). For `logo` and for a direct visual, `material: "logo"`. For `palette`, nothing: the measured colours are used.

`board.mjs` refuses a round with a missing label, a quote subject without a quote, a palette that was not measured, or a brand that is not in the brief.

Before showing it, go through the round as the user: on each screen, do I know what I am judging, and is what I see the thing I am asked about?

## Reading the answers

`board.mjs` prints one line per subject and records it:

```
Le ton (Feutré / Direct): fits: Russell Reynolds, Harvey, Ashby; too feutré: Egon Zehnder; too direct: Juicebox
```

In `brief.json`, each subject becomes a dimension with `camp`, `fits`, `too_left`, `too_right`, `unknown`, a `confidence` and the interaction as evidence. Then it is your turn:

- **`orientation`**: what the markers mean for a designer, in plain words. Look again at the specimens that fit and at the ones on each side, and say what separates them. "Direct, without bravado: it states what it does, it never promises a victory."
- **`boundary`**: where there is one, the limit and its sign. "Never an imperative that promises ('Win…', 'Crush…')."
- **`importance`**: `high` for the three or so subjects a designer's choices depend on most.
- **`confidence`**: the script sets `medium` when something fits and something bounds it, `low` otherwise. Raise it to `high` only with a second, different signal (something they said, a site that already does it), added to `evidence`.
- **A skipped subject** ("does not matter to me") is information: the decision is the designer's. Say so in the brief.
- **Nothing fits**: the brands were wrong, or the poles were. If the subject matters, one short second round.
- **"I don't know this brand" on several cards**: your references were not their world. Note it; do not read the subject.
- **Fits at both ends and not in the middle**: a contradiction. Name it in the read-back and ask which one wins on a bad day. The answer is a tension.

Never write "like Harvey" in the brief. A brand is a marker on a scale; the brief says what was kept from it.
