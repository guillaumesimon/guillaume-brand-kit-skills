# Illustration

Most people choose illustration by subject — "business illustrations", "healthcare scenes", "empty state vectors". That is backwards.

**The subject says what you do. The style says who you are.** Two drawings of an identical scene leave entirely different impressions depending on whether they are crisp flat geometry, warm hand-drawn linework, isometric perspective or volumetric 3D. The style is read before a single word, and it is the part that becomes the brand.

So the question is never "what should we illustrate?" It is "what visual language are we speaking, and can we keep speaking it?"

## Show, do not ask

Open `assets/illustration-styles.html`. It shows **the same scene drawn seven ways**, plus an eighth card for no illustration at all, so the only thing varying is the grammar.

Two deliberate choices in how that board is built, both worth keeping:

**The subject is held constant.** Commercial libraries do the opposite — every style card shows a different drawing, because they are selling the range of a catalogue. That is the wrong shape for *choosing*: with the subject varying, people compare pictures instead of languages, and pick the one whose content they liked. One scene, eight grammars, is the only arrangement where the choice is about style.

**The scene contains a person, an interface and text.** A still life would be easier to draw and would tell you almost nothing. The expensive parts of an illustration system are whether it can draw a figure — a face, a hand, a posture — and how it sets type, which is what differs most between territories. The shipped scene is a feature announcement for auto-captions: a person on a video call, a caption bar, a sound wave, two language tags.

Before showing it, **regenerate the samples in the brand's own palette**:

```bash
export FAL_KEY=...   # see the imagegen skill for the Keychain route
python3 assets/make-samples.py --out "$SCRATCH" --palette '{"ground":"#FBF7F1","ink":"#241E1A","accent":"#1F5D45","soft":"#86B9A4","warm":"#C8761B","cool":"#2C5E8A"}'
```

Seven calls, about two minutes, and it folds the results back into the page as embedded webp so it stays one openable file. `--out` copies the board into the session's scratchpad first, so the installed skill is never rewritten. It generates the scene once in **Playful Editorial 3D**, which acts as the master image, then draws each other territory *from that master* — which holds the composition far tighter than seven independent generations would. `--dry-run` prints the prompts and spends nothing; `--only <territory>` redoes a single card; `--scene` puts the brand's own moment on all seven.

Be honest about what regeneration costs you: **the shipped artwork was art-directed and picked from several attempts.** A regenerated set is a first pass and will not match it. Regenerate when the brand needs its own scene or palette badly enough to accept that, not by reflex.

Default model is GPT Image 2.5 Flare at `medium` (about $0.09 a run) because it is the strongest of the catalogue at taking a reference image. `--model muse` costs about the same and is noticeably looser. `--quality high` or `xhigh` is worth it when a style needs to stay loose: at `medium` this model tidies a drawing up, which flattens exactly the wobble that makes a hand-drawn style read as hand-drawn.

**A style is better shown than described.** Writing "wobbly organic linework with uneven stroke weight" gets you a generic pencil sketch, every time; the model has no way to know which of a hundred hands you mean. Drop reference images into `assets/refs/` and point `STYLE_REFS` at them instead — the prompt then carries only the palette and the negatives, and the reference carries the hand. That is how the hand-drawn card is built.

Seeing a style rendered in someone else's colours is most of the way to rejecting it for the wrong reason, so this step is not optional once a palette is settled. If the palette is not settled yet, show the board as shipped and say the colours are placeholders.

Then ask the two-step question, in this order:

> "Which two could be yours?" — then — "Which one is definitely not?"

Elimination after a shortlist is cheaper and more diagnostic than asking for a favourite.

## The three axes

Two of these come from the way the style families actually distribute. The third is the one a library selling illustrations will never put on the page, and it is usually the one that decides.

**1 · Tone — structured and authoritative ↔ warm and playful.**
Realistic Isometric and Playful Editorial 3D sit at the structured end. Clever Doodle and New School Cartoon sit at the warm end. Playful Geometric spans the whole range depending on the palette. Cut and Paste and Happy Riso sit slightly off this axis: they are defined by their material rather than their register.

**2 · Surface — text-heavy and dense ↔ visual and immersive.**
Dense surfaces want Playful Geometric, or nothing: anything heavier competes with the content it is meant to support. Immersive surfaces can carry Playful Editorial 3D, Happy Riso or Cut and Paste. A product with a data table on every screen and a 3D hero has two brands.

**3 · What you can actually make.**
The honest axis. A style you cannot extend consistently becomes six mismatched drawings inside a year, which is worse than having none. Ask directly: *"When you need a new illustration in six months, who draws it?"* If the answer is nobody, the shortlist is Playful Geometric, New School Cartoon, or none — the three that a non-illustrator can extend from a written spec.

## The seven territories

Each carries what it buys, what it costs, and where it belongs. **The cost line is the one that matters** — a territory with no stated cost has not been chosen, it has been defaulted into.

| Territory | Buys you | Costs you | Right for |
|---|---|---|---|
| **Playful Geometric** | Circles, arcs and rounded rectangles; colour alone defines form, with no outline anywhere | The most restrained of the seven. Reducing an object to its symbol loses the detail that made it specific | Product marketing, onboarding, anything that must read at a glance |
| **Clever Doodle** | Brush ink on cream: the line swells and thins, greys come only from visible dot screens | Needs a real hand and real nerve. The looseness is the value, and a tidy-up destroys it first | Editorial, changelogs, release notes — anything with a joke in it |
| **Happy Riso** | Four inks on textured paper, overprinted and deliberately out of register | Prints beautifully, screens badly below a certain size. The grain eats fine detail and triples the file weight | Events, culture, print-first brands |
| **Playful Editorial 3D** | Matte clay, soft diffuse light, rounded everywhere. Tangible without tipping into photoreal | Expensive per scene, and it needs an explicit list of what *not* to render or it slides into product photography | Hero moments, launches, one strong image at a time |
| **Cut and Paste** | A flat photograph of a scene actually built in layered paper — torn edges, visible fibre, real shadows | The hardest to extend without drifting into craft-project territory | Editorial, education, texture without nostalgia |
| **New School Cartoon** | Thick black outlines, flat saturated colour, mascot energy. Reads at any size | Eats seriousness. This is the territory that cannot carry bad news | Consumer apps, community, anything aimed young |
| **Realistic Isometric** | A miniature on a slab at a fixed thirty degrees: credible materials, studio light, many small details | The most expensive per scene and the most rigid — the camera never moves | Platforms, logistics, developer tools, a system to explain |
| **None** | Type, colour and the graphic device carry everything. A chart, a photograph, or nothing | Demands the rest of the system is strong, because there is nothing to hide behind | Serious v1s with no illustration budget |

**"None" is a real answer and it belongs on the board.** A library that sells illustrations will not offer it; this skill should. For most early-stage B2B companies it is the right call, and the graphic device from `references/territories.md` does the work instead. If the user picks it, write it into the kit as a rule rather than leaving the section empty.

Two territories to be openly sceptical about, and say why out loud rather than quietly steering: **Playful Editorial 3D** and **Realistic Isometric** are almost always chosen at a budget that cannot sustain them — one new scene in either is a day of work, not an hour. And **Happy Riso** is chosen on screen and then discovered to be unusable at 24px.

## Commit to a system, not a look

The single biggest failure in illustration is mixing families without a system. What a system means, concretely:

- **One primary style.** Everything defaults to it.
- **At most one accent style, used in a named context.** "Abstract shapes for section breaks." "One 3D hero per launch." Named, or it spreads.
- **The palette is the brand palette.** Illustration does not get its own colours. If a style needs colours the brand does not have, that is the style telling you it is the wrong style.
- **One scale language.** A stroke weight, a corner radius and a level of detail that match the icon set and the UI. An illustration at 1.5px stroke beside 2.5px icons reads as borrowed.
- **A stated subject boundary.** What is drawn, and what is never drawn. "People at work, never people celebrating." "Objects and places, never faces."

**Consistency beats quality.** Six consistent mediocre illustrations read as a system. Six excellent inconsistent ones read as clip art.

## Sourcing, honestly

A v1 rarely has a bespoke illustration set, and pretending otherwise produces a kit nobody can follow. Name the route in the kit:

- **A licensed library pack** — the realistic default. Pick **one pack**, not one style, and say which: a style is a category, a pack is a consistent hand. Recolour to the brand palette, which is what makes a bought pack look owned. Check the licence permits it.
- **Generated, then cleaned** — viable for abstract and flat, unreliable for anything with people or hands. If used, say so in the kit: it affects who can extend it later.
- **Commissioned** — the only route that produces something ownable. Worth naming a budget and a trigger ("after the seed round, one pack of 20").
- **Built from the device** — geometric or diagrammatic work derived from the brand's own shape language. Cheapest ownable option, and it usually beats a licensed pack for a technical brand.

Whichever it is, the kit records the decision. An illustration section that shows drawings without saying where the next one comes from is decoration.

## What to write into the kit

In `tokens.json`, under `imagery`:

```json
"illustration": {
  "style": "geometric",
  "accent_style": null,
  "accent_context": null,
  "source": "Commissioned pack of 20 scenes, extended from the written spec in brand/illustration-spec.md.",
  "construction": "Geometric primitives only. No outline anywhere — colour defines form.",
  "palette": "Brand palette only. Illustration never introduces a colour.",
  "subjects": "Objects, places and systems. People only at work, never posed.",
  "never": "Faces in close-up. Corporate-Memphis figures. Drop shadows. Any colour not in the palette.",
  "next_one": "Extend from the pack. If the pack cannot carry it, use a diagram or a photograph rather than mixing a second style."
}
```

And in `BRAND.md` → Imagery → `### Illustration`: the construction in prose, the recipe if images are generated, and a checkable rule. Not "our illustration is friendly and modern", that is unauditable and will be ignored. Something like:

```yaml
rules:
  - verdict: dont
    rule: Never mix a second territory. Circles, arcs and rounded rectangles in the brand palette, no outlines, no volume, no shadow.
    exception: Charts and diagrams, which follow the icon stroke.
```

Add the samples as `visuals`, each with a `do` or `dont` verdict and a caption that states the rule.

If the answer is none, the rule is shorter and just as useful:

```yaml
rules:
  - verdict: dont
    rule: No illustration of any kind. Use a chart, a photograph, or nothing.
    exception: Diagrams drawn in the icon stroke, in brand colours.
```
