# The visual exercises

A catalogue, not a sequence. Each exercise is used when it is the cheapest way to learn the thing that matters most and is known least. Never run them all.

Every exercise has an **objective** and **target dimensions**, written in the round file and never shown.

## The round file

`brand/brief/rounds/<id>.json`. A round is what the user does between two turns of conversation: 8 to 14 screens, two or three minutes.

```json
{
  "id": "r1",
  "steps": [
    { "type": "swipe",
      "objective": "How much humour can the brand carry; inside the category or beside it",
      "targets": ["playfulness", "category_fit"],
      "items": [
        { "ref": "mailchimp", "attributes": ["Les mots simples", "L'humour", "Les illustrations", "Le jaune"] },
        { "ref": "mews", "attributes": ["On dirait tous les logiciels", "Le tableau de bord en premier", "Le ton"] },
        { "ref": "monocle" }
      ] },
    { "type": "duel", "known": true,
      "objective": "Polish against paper",
      "targets": ["expressiveness"],
      "pairs": [
        { "a": { "ref": "monocle" }, "b": { "ref": "stripe" },
          "attributes": ["Ça fait plus sérieux", "Ça fait plus chaleureux", "C'est plus simple à lire"] }
      ] }
  ]
}
```

- `ref` is a reference id; the image and the name come from its card. A reference with no image cannot enter a round.
- `attributes` on a swipe item are offered after the answer: "what would you keep from it?" after a yes, "what bothers you?" after a no. On a duel they are offered after a pick: "why this one?". Several can be ticked; none is an answer.
- `known: true` adds "I don't know it" to a duel. Swipe always has it.
- `title` and `sub` on a step replace the default line. Use them only to say what kind of thing to look at ("Look at how they speak, not at the product"), never the axis.
- Attribute labels are written in the user's language, in their register.

The page receives the images, the names and the attribute labels. `objective` and `targets` are stripped by `board.mjs`.

## A · Brand sorting (swipe)

One brand at a time, four answers: **speaks to me**, **I like it, not for us**, **not at all**, **I don't know it**. Drag, click or arrow keys.

Use it first, on six to ten references spread across the four circles, to find where the founder lives. It is the cheapest exercise per signal.

The four answers are four different things, and the whole value is in keeping them apart:

- **"I like it, not for us"** is the most useful answer in the brief. It separates attraction from fit: the attraction is the ceiling of their taste, the refusal is the brief. Always give these cards attributes, and write both halves down.
- **"I don't know it"** is not a no. The image did not carry the brand for them: do not read anything into it, and note that this anchor does not work for this founder.
- A skipped card is not neutral either. It is nothing.
- **"Not at all"** on a whole kind of thing is a finding. Every illustrated brand refused, every photograph of a person refused: say it out loud at the next turn, because they made a decision by looking and do not know it.

## B · Pairwise comparison (duel)

Two images side by side: left, right, **both**, **neither**, and "I don't know it" when the brands are meant to be known.

Use it to settle one uncertain point after a sorting round. Two ways to compose a pair:

- **Wide apart**, two brands that differ on everything, to get a fast orientation early. You are not measuring; you get a direction you check later.
- **Close on everything but one thing**, to isolate a dimension: Headspace (expressive warmth) against Calm (restrained serenity). Real brands never differ on one thing only, so **give the pair attributes and read the reason, not the pick**. Never attribute a choice to the dimension you had in mind when they did not say so.

Rules that hold for every pair:

- Same kind of object on both sides: two home pages, two packs, two app screens. Otherwise they judge the support.
- For an attitude, use brands outside their category, so they judge an attitude and not a competitor.
- "Neither" eliminates two worlds in a second: take it at face value and re-pair against what is left. "Both" means the difference you drew does not matter to them: drop that dimension's importance.
- If the reason is about content ("there are graphs in this one"), they judged the product. Re-pair on the same content type.

## C · Attribute extraction

What, in a reference they liked, they actually like. It is built into the swipe and the duel through `attributes`; it can also be one closed question in chat about a brand they cited.

Write four to six attributes per card, each a thing visibly present in that image, in plain words, mixing layers:

> For Alan: the mascot's personality · the simplicity of the words · the human, accessible side · the use of colour · how it makes a serious subject likeable

Mix what is **said** (the words, the tone), what is **seen** (colour, illustration, type, photography) and what is **felt** (control, calm, closeness). The layer they pick tells you which one carries the brand for them. Liking Alan does not mean wanting a green mascot.

Do not attach attributes to every card: three or four cards per round, the ones whose reason you cannot guess. Each attribute screen costs five seconds; ten of them is homework.

## D · Anti-brand discovery

Counter-examples shown on purpose, to find the limit rather than a global rejection. Put two or three in a sorting round, with rejection attributes written as precise failures:

> too corporate · childish · cold · generic · elitist · "startup" · medical · luxury

"Not at all" with "childish" ticked is a boundary: playful, never infantilising. "Not at all" with nothing ticked is only a no; ask one word in chat.

Include the category's typical look once (a direct competitor at its most conventional). The answer says whether they want to stand inside the category or beside it, which the audit will need.

## E · Boundary testing

For an attribute already chosen, three or four references at rising intensity: subtle, moderate, strong, extreme. Run it as a swipe step in that order, or as two duels of neighbours. Then one question in chat: "where does it start to be wrong, and what tips it?".

Use it only on a dimension that is important and whose direction is known. It produces the most reusable sentence of the brief: a tension with the sign that the limit is crossed.

## F · Personality review

Not on the board. The current reading, said back in plain words in chat, for correction: three or four sentences, no axis names, with a free undo. It is how the dimensions become `validated`. Never show sliders or scores and ask the user to adjust them: a slider asks someone to name a preference in studio vocabulary and returns a number they picked to be helpful.

## Composing a round

- **First round**: sorting, six to ten cards, all four circles, wide. Three or four cards with attributes. One or two anti-brands. End with two wide duels.
- **Second round**: built from the first. Two to four duels on the points that are important and unclear, two or three new cards in the area they leaned to, one boundary test if a direction is clear.
- **Third round, only if needed**: logos and signs (wordmark, symbol, monogram, emblem, mascot) as a short sort, when the founder has opinions about the sign or the logo contexts make its form a real question. Supports must be comparable: logos on their own, same size.
- Never the same reference twice in a round. A reference can return in a later round in a duel.
- Put what matters most in the first six screens. Attention drops fast.
- Before building, check the contact sheet again for the images of this round.

## Reading the votes

`board.mjs` prints a summary and records each screen as an interaction (`r1-01`, `r1-02`, …) with its objective and targets, and sets each reference's `verdict`, `liked_attributes` and `rejected_attributes`. Then you read:

1. **What do the liked ones share, and the refused ones?** Look at the images again, side by side. The common point is often not the dimension you composed for.
2. **Which reasons were given?** A ticked attribute is explicit; your reading of an unexplained pick is an interpretation. Keep them apart: `status: "explicit"` or `"interpretation"` on each piece of evidence.
3. **What contradicts what was said?** Chosen beats stated. Say it when they diverge: naming it is how you get the tension.
4. **What is the note?** The optional sentence at the end goes into `verbatim` as it is.

## The dimensions

`personality.dimensions` in `brief.json` is the state of understanding. Start from the ones that matter for this project and add your own; these are common ones, not a required set:

| id | poles |
|---|---|
| `exclusivity` | accessible / exclusive |
| `playfulness` | serious / playful |
| `modernity` | classic / innovative |
| `expressiveness` | minimal / expressive |
| `incarnation` | human / technological |
| `boldness` | discreet / bold |
| `energy` | reassuring / stimulating |
| `tone` | formal / conversational |
| `benefit` | functional / emotional |
| `category_fit` | inside the category / beside it |

Poles are heuristics, not opposites. A brand can be human and technological, premium and accessible. When two things can coexist, do not force them onto one line: write the orientation as a phrase ("human, shown through objects rather than faces"), or use two dimensions.

For each dimension:

```json
{ "id": "playfulness", "poles": ["serious", "playful"],
  "orientation": "moderately playful",
  "importance": "high",
  "confidence": "medium",
  "boundary": "Playful but never childish",
  "contradictions": "",
  "validation": "provisional",
  "evidence": [
    { "interaction": "r1-01", "signal": "Liked Alan", "reason": "human and approachable", "status": "explicit" },
    { "interaction": "r1-04", "signal": "Rejected a childish illustration", "reason": "must stay professional", "status": "explicit" }
  ] }
```

- `confidence`: `unknown` (nothing yet), `low` (one signal, or signals that disagree), `medium` (two signals that agree, or one with a stated reason), `high` (agreement across two different kinds of exercise, or confirmed in the read-back). `check.mjs` refuses `high` on a single piece of evidence.
- `importance`: how much a designer's choices depend on it for this project. Three or four dimensions are `high`; if all are, none is.
- `orientation` is words. No score, no percentage, no position on a line.
- Keep invalidated hypotheses in the evidence with what overturned them, so they are not reintroduced.

## Choosing what comes next

After each answer or round, look at the dimensions and ask, in this order:

1. Is something **important and contradictory**? Resolve it first: a duel, or the sacrifice question in chat.
2. Is something **important and at `unknown` or `low`**? One exercise aimed at it.
3. Is a direction clear but its **limit** unknown? A boundary test, or one anchored closed question.
4. Otherwise, stop.

Pick the cheapest form that can answer: a closed question in chat before a round, a two-duel round before a ten-card one. Never ask again what is at `medium` or above and unimportant. Never treat one isolated pick as a validation.

## Exit rules

Stop the discovery and go to the synthesis when:

- the business context is clear, with one primary audience;
- every `high` importance dimension is at `medium` confidence or above, or its contradiction is written down as a tension;
- at least one real refusal is recorded;
- constraints and logo contexts are captured.

Secondary uncertainty goes into `open_questions`, addressed to the founder, the audit or the kit. Do not prolong the session to close it. If the user wants to stop before these are met, synthesise anyway and mark the brief `provisional`.
