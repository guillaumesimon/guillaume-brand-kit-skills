# Art direction

Colour, type, photography, icons and motion are ingredients. Art direction is the recipe that combines them — and it is the page that decides whether a slide, a billboard and a settings screen look like the same company.

Most brand books skip it, because it cannot be shown as a swatch. Klarna's is the model worth copying: a concept in one line, a formula with four or five ingredients, and every rule shown applied to real work. It is short, and it is the page a photographer, an agency and an agent all need first.

## What it is made of

**1 · The concept — one line every piece of work is briefed against.**
Not a tagline and not a value. A scene. Klarna's is "magic from the mundane"; Perch's is "the house at work". The test: a photographer handed only this line could plan a shoot, and a designer could reject a layout with it. If it could brief a competitor's shoot just as well, it is category wallpaper.

Derive it, do not ask for it. It almost always sits in the founder's own words from Act 1 — the "what the paper does better" answer, the moment of need, the thing they refused. Propose it with the sentence it came from and a free undo.

**2 · Principles — three, each one a decision.**
Each says what wins when two things compete. "Ruled, not decorated." "Colour marks consequence." "The real building." Three because four is a values wall. Every principle must forbid something plausible; one that forbids nothing is an adjective.

**3 · The formula — the ingredients of a single image or layout.**
Subject, light, colour, framing, and where type goes. Written so it can be checked: *"Type never sits on a photograph. It sits on paper beside it, under a hairline."* This is the part that makes work recognisable without the logo, which is the organising principle from `references/territories.md` applied to one surface at a time.

**4 · The hierarchy — which element carries which job.**
A table: type and device, photography, charts, illustration, motion — each with its job and how much of it a surface may carry. It settles the argument nobody has written down: when a page needs warmth, does it get a photograph, a drawing, or bigger type? Without it, every page answers differently.

**5 · The one weird detail.**
Already decided in Act 3 (`meta.weird_detail`). It lives here too, as a rule nobody may tidy away.

## Where it comes from in the session

Nothing new is asked. By the end of Act 2 you have the tournament, the type, the illustration and photography picks, and the founder's verbatim — art direction is the synthesis of those, written by you:

| Ingredient | Comes from |
|---|---|
| Concept | The founder's own words: the moment, the enemy, the refusal |
| Principles | The contrast pairs and the three things they "would never do, even if it worked" |
| Formula · subject and light | The photography board (or "none") |
| Formula · colour | The palette's ratios and the accent's behaviour |
| Formula · type on image | The tournament: did they pick type-led or image-led sites? |
| Hierarchy | Which boards they answered "none" to, and the product's density |

Read it back in Act 3 alongside the rendered artefact, in plain words: *"Everything we make shows the house working. Type leads, a photograph proves it's real, and nothing is ever drawn."* It is the sentence the user will repeat to their team, so it has to survive being said aloud.

## What to write into the kit

`tokens.json → art_direction`:

```json
"art_direction": {
  "concept": "The house at work.",
  "_concept_use": "Brief every shoot, layout and campaign against this line.",
  "principles": [{ "name": "Ruled, not decorated", "rule": "…" }],
  "formula": { "subject": "…", "light": "…", "colour": "…", "framing": "…", "type_on_image": "…" },
  "hierarchy": [{ "element": "Photography", "job": "…", "share": "One image per surface at most" }],
  "weird_detail": "…",
  "_rules": ["One image per surface, at most.", "…"]
}
```

`DESIGN.md`, one rule that makes the hierarchy usable by an agent:

> **26.** When two visual elements compete for the same job, follow `art_direction.hierarchy`: type and the ledger rule first, then photography, then charts. Brief every image and layout against the concept: *the house at work*.

On the site, the Art direction page shows the concept huge, the principles numbered, the formula as a recipe, the imagery in practice, the hierarchy table, and the rules last. No do/don't row here — misuse lives on the pages of the ingredient that was misused.
