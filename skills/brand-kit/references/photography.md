# Photography

People choose photography the way they choose illustration: by subject. "Photos of our customers", "team shots", "something with laptops". That is backwards for the same reason.

**The subject says what you do. The light, the lens and the casting say who you are.** The same woman at the same café table reads as a documentary, an advert, a magazine cover or a film still depending on four decisions nobody in the room thinks they are making. Those four decisions are the brand.

## Show, do not ask

Open `assets/photo-styles.html`. It shows **one scene photographed seven ways**, plus an eighth card for no photography at all:

| # | Direction | What changes |
|---|---|---|
| 1 | Documentary | Available light, candid, eye level, nobody performs |
| 2 | Bright lifestyle | High-key, warm, shallow focus, smiling |
| 3 | Editorial portrait | Posed, direct gaze, one hard key light, painted backdrop |
| 4 | Colour studio | Seamless saturated colour, flash, props held up |
| 5 | Cinematic | Low-key, single source, graded, negative space |
| 6 | Flash snapshot | On-camera flash, grain, off-kilter crop |
| 7 | Still life | Objects only, soft shadow, generous space |
| 8 | None | Type, colour and the device carry it |

The board was built the way the illustration picker was: the scene is generated once as a documentary photograph, then every other card is **re-shot from that master**, so the same person, table and window appear in all seven and only the photography varies. Without that, people pick the picture they liked rather than the direction.

**Regenerate it on the brand's own scene** before showing it, once you know what the business is. One moment with a person, an object and a place — the expensive parts of a photographic system are casting and environment, so a still life tells you almost nothing.

```bash
python3 assets/imagery.py board --dry-run --scene "a florist handing a wrapped bouquet across the counter, morning"
python3 assets/imagery.py board --out "$SCRATCH" --scene "…" --model muse   # ~$0.07, looser
python3 assets/imagery.py board --out "$SCRATCH" --scene "…"                # GPT Image 2.5 medium, ~$0.09, holds the composition better
```

`--out` copies the board into the session's scratchpad and generates there, so the shipped board in the skill is never rewritten. Generation spends the user's money: say what it costs and which model before running it, the same way the `imagegen` skill does, and wait for a yes. If the user declines, show the board as shipped and say the scene is generic.

The board needs a real browser that runs scripts — serve the folder it is in (`python3 -m http.server <port> --directory "$SCRATCH"`) and open it in the browser pane. Put the brand's ink, card colour and tagline in the hash so the "none" card is in the brand: `photo-styles.html#ink=241E1A&card=FBF7F1&line=Know%20your%20house.`

Then the same two-step question as every board:

> "Which two could be yours?" — then — "Which one is definitely not?"

Notes ("says / costs / fits") are hidden behind a button on purpose. Say them in chat when asked. A paragraph beside a photograph gets read instead of the photograph.

## Reading the answer

- **Often the tournament already settled it.** A user who refused every photograph of a person in the site duels has told you casting is out: the shortlist is still life or none. Say so rather than running the board for the sake of it.
- **Two adjacent picks** (documentary + still life, portrait + cinematic) are a system, not indecision: one is the primary type, the other the accent type with a named job. Write both into `imagery.photography.types`.
- **"Lifestyle but not like that"** is the most common answer and the most useful. Lifestyle is the category default for almost everything consumer — the refusal tells you the brand needs one twist (a colour, a crop, a casting rule) that makes it ownable. Ask which part of the card is wrong; it is usually the smile or the light.
- **None is a real answer.** For a serious v1 with no shoot budget it is often the right one, and the graphic device from `references/territories.md` does the job instead.

## The recipe — what has to be decided

Most photography sections in brand books are adjectives: "authentic", "vibrant", "human". They instruct nothing. A recipe is a list of decisions a photographer can brief a shoot from and a reviewer can check an image against. IBM's photography guidance is the best public model of this and the parameters below follow it.

| Parameter | The question it answers | Example |
|---|---|---|
| **Point of view** | What does the camera stand for? | "A guest who arrived early and notices how the house runs." |
| **Types** | Which kinds of image exist, each with one job? | The house · At work · Detail |
| **Light** | Where does the light come from, what time is it? | Available window light, mid-morning. Never flash. |
| **Framing and perspective** | How far, from where? | Eye level, square to the architecture. Aerial never. |
| **Subject state** | What are people doing? | Mid-task. Nobody looks at the camera. |
| **Casting** | Who is in it? | Real staff, every age. Never models. |
| **Colour** | How are the colours handled? | Natural, slightly warm. No grade, no wash. |
| **Depth** | How much is in focus? | The room stays readable; no creamy bokeh. |
| **Treatment** | What happens after the shot? | No filters, no duotone, fine grain as shot. |
| **Ratios** | Which crops exist? | 4:5 and 16:9 only. |
| **Never** | What do we never shoot? | Stock, handshakes, people smiling at laptops, drone skylines. |
| **Source** | Where does the next image come from? | A commissioned shoot; generated images are direction only. |

Two tests, borrowed from the best manuals, that you run on every sample before it goes in the kit:

- **The any-company test.** If any company in the category could have published it, it is off-brand. Generated photography fails this constantly — reject and re-prompt.
- **The literal-concept test.** An image that illustrates an idea literally (a lightbulb for "insight", a handshake for "partnership") is a cliché by construction. Photograph the situation, not the metaphor.

Three rules matter most for a founder, and belong in the kit verbatim if nothing else does: **consistency beats quality**; **a treatment rescues cheap photography** (a fixed crop, a fixed grain, a fixed colour handling unify phone shots and stock into a system); and **say what you will never shoot**.

## Generating the brand's own samples

The photography page of the site shows the recipe applied. Until there is a real shoot, those images are generated — say so on the page, and keep the page `assumed`.

Every entry under `imagery.photography.types`, `.samples` and `.misuse` that has a `prompt` and a `src` can be generated:

```bash
python3 assets/imagery.py brand brand/ --dry-run     # prints every prompt, spends nothing
python3 assets/imagery.py brand brand/ --model muse
python3 assets/imagery.py brand brand/ --only hero --force
```

The script prefixes every "do" prompt with the brand's own recipe, so the samples obey the rules the page states. Entries with `"kind": "dont"` are generated from their prompt alone — they exist to break the rules, which is what makes the misuse row convincing. Write the subject of each prompt concretely: a place, a time, a person's age and task, what is in frame. "A happy customer using our app" produces stock; "a housekeeper in her fifties folding towels on a trolley in a corridor, looking at her hands" produces a brand.

Look at every image before it goes on the site. Generated photography has three recurring faults: hands, text on objects, and an over-perfect gloss that fails the any-company test. Regenerate rather than ship one of those.

## What to write into the kit

In `tokens.json`, under `imagery.photography`:

```json
"photography": {
  "point_of_view": "…",
  "types": [{ "name": "At work", "job": "…", "ratio": "4:5", "src": "assets/photography/at-work.webp", "prompt": "…" }],
  "recipe": { "light": "…", "framing": "…", "subject_state": "…", "casting": "…", "colour": "…", "depth": "…", "treatment": "…", "ratios": ["4:5", "16:9"] },
  "samples": [{ "src": "…", "caption": "…", "ratio": "16:9", "size": "wide", "prompt": "…" }],
  "misuse": [{ "kind": "dont", "src": "…", "caption": "Don't … — because … Instead …", "prompt": "…" }],
  "never": ["…"],
  "source": "…",
  "_rule": "One sentence an agent can apply."
}
```

And in `BRAND.md` → Imagery → `### Photography`: the point of view and the recipe in prose, then the rules and the sample images, written so a second agent could audit an image against them:

```yaml
rules:
  - verdict: dont
    rule: Never stock photography, golden hour, or anyone smiling at a laptop.
    exception: none
visuals:
  - file: assets/photography/hero.webp
    verdict: do
    caption: Front desk at 07:10. Available light, nobody there yet, square to the counter.
  - file: assets/photography/dont-stock.webp
    verdict: dont
    caption: Stock hotel photography shows a hotel nobody runs. Shoot a real property on a weekday morning.
```

The caption carries the rule: say what the image demonstrates, not what it shows. A `dont` image is never given to an image model as a reference.

If the answer is none, the subsection is one sentence: "This brand does not use photography. Type, colour and the ledger rule carry every surface; if a page needs warmth, it comes from the copy."
