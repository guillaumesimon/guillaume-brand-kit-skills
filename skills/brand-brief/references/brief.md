# The brief

`brief.json` is the single source. `BRIEF.md` and `brief.html` are generated from it and never edited. `assets/brief.example.json` is a worked example at the expected depth: read it before writing your first one.

The brief is not a transcript of the interview. An art director or an agent must be able to make decisions from it without the conversation.

## Provenance

Every statement of the brief is an object with a `source`:

| `source` | Means | Needs |
|---|---|---|
| `documented` | read in the project or on the site | the file or URL in `evidence` |
| `stated` | the founder said it | the interaction id in `evidence`, the `quote` when it is worth keeping |
| `chosen` | picked on a board or in a closed question | the interaction ids in `evidence` |
| `inferred` | you derived it | what it rests on in `evidence`; theirs to confirm |
| `assumed` | you filled it because the brief needed a value | a matching entry in `open_questions` |

A plain field is `{ "value": "...", "source": "...", "evidence": ["q03"], "quote": "..." }`. Never let an `assumed` pass for a finding: the report draws it differently and counts it, and `check.mjs` requires an open question for each.

Chat questions are recorded as interactions `q01`, `q02`, … with `type` (`question`, `closed`), the `question`, the `options` offered, and the `answer`. Each subject of the board is recorded by `board.mjs` as `r1-<subject>`, for example `r1-tone`.

## The sections

`meta`: `schema` (1), `brand`, `date`, `locale` (session language, drives the report), `market_locale` (drives captures, e.g. `fr-FR`), `status` (`draft`, `provisional`, `validated`).

`summary`: `lead`, one sentence: what the brand must say, to whom. `essence`, three or four sentences: who it is for, what it should feel like, the central tension, the critical constraint. Written last. No wallpaper words.

`context`: `product`, `reason`, `problem`, `instead_of`, `difference`, `proof`. If there is no structural proof, `proof.value` says "No structural reason to believe yet" and what would count.

`audiences`: a list; exactly one `primary: true`. Each: `name`, `who`, `need`, `feeling`, `source`, `evidence`, `quote`.

`positioning`: `frame_inherited` (what people compare them with today), `frame_wanted`, `promise`. Optionally `territories`, when the direction itself was put to the user as three or four plain-word options: each with `id`, `name`, `description`, `status` (`chosen`, `kept_from` with `keep`, `rejected` with `reason`, `open`). Do not add that step by default; the board usually settles it.

`ambition`: `horizon`, `scale`, `must_carry` (what the brand has to survive: other languages, a second product, a sale).

`values`: each `value` with the `instance` that proves it (the time it cost something), the `quote`, the `source`. No instance, no value.

`perception`: `think`, `feel`, `never_feel`.

`personality`: `traits`, each operable: `trait`, `more_than` ("more a head housekeeper than a consultant"), `never` ("never fussy"), `sounds_like` (one real sentence). And `dimensions`, one per subject of the board:

```json
{ "id": "tone", "name": "Le ton", "poles": ["Feutré", "Direct"], "kind": "quote",
  "camp": "left", "fits": ["russellreynolds", "harvey", "ashby"], "too_left": ["egonzehnder"], "too_right": ["juicebox"], "unknown": [],
  "orientation": "Direct, without bravado: it states what it does and never promises a victory.",
  "boundary": "Never an imperative that promises.",
  "importance": "high", "confidence": "medium", "validation": "validated",
  "evidence": [ { "interaction": "r1-tone", "signal": "fits: Russell Reynolds, Harvey, Ashby; too feutré: Egon Zehnder; too direct: Juicebox", "status": "explicit" } ] }
```

`board.mjs` writes everything but `orientation`, `boundary` and `importance`, which are yours (`references/subjects.md` → *Reading the answers*). `confidence` is `unknown`, `low`, `medium` or `high`: a judgement on the evidence, never shown as a number. A subject the user said does not matter has `camp: "skipped"`.

`tensions`: `tension` ("Humour / credibility"), `direction` ("Playful without being childish"), `crossed_when` (the observable sign that the limit is passed), optional `examples`.

`references`: the brands the subjects were judged against (`references/subjects.md`): `id`, `name`, `circle`, `url`, `why`, and what `fetch.mjs` added (`asset`, `capture`, `palette`, `copy`, `materials`).

`preferences`: `signals`, each a `statement` with a `level`, `evidence` and `source`; and `founder_vs_audience`, each `wish`, `risk`, `arbitration`, `decided_by`.

| `level` | Means |
|---|---|
| `must` | a requirement: the brief fails without it. Rare, and usually a constraint |
| `preference` | chosen more than once; defeasible with a reason |
| `explore` | a lead, one signal, worth testing |
| `never` | refused, in their words |

`principles`: three to five decision rules a designer can apply on a Monday: `principle`, `because`, `evidence`. Each must forbid something.

`constraints`: `items`, each `constraint`, `kind` (`practical`, `technical`, `legal`, `cultural`, `existing`), `source`; and `timeline`.

`logo_contexts`: where the logo will have to live, **derived from the product and never asked**: each `context`, `priority` (`critical`, `expected`, `later`), `note`, and a `source` (`inferred` from the product, `stated` if the user mentioned it, `assumed` for a guess, which then needs an open question). They are shown in the read-back for correction.

`evaluation`: criteria to judge a future concept, each `criterion` and `type` (`gate` or `preference`). Gates come from constraints, refusals and the most demanding logo context.

`interactions`, `verbatim`: the record. `verbatim` holds the sentences worth reusing, each with what it is `about`.

`open_questions`: each `question`, `why`, and `for` (`founder`, `audit`, `kit`). Market hypotheses go to the audit; design questions to the kit.

`limits`: what the brief does not cover. Always: it is the founder's account; the references are a dozen brands chosen to place this one, not the market; and anything specific to this session (a blocked site, a subject skipped, a session cut short).

`declared_empty`: `{ "<section>": "why it is empty" }` for a section that could not be filled. An empty section with its reason passes the gate; an invented one is worse than a gap.

`handoff`:

```json
"handoff": {
  "audit": {
    "competitors": ["names the founder cited as competitors"],
    "aspirational": ["brands they admire, candidates for the audit's aspirational role"],
    "hypotheses": ["what the founder believes about the category, to check on captures"]
  },
  "kit": {
    "settled": ["what was decided by looking; do not ask again"],
    "open": ["what is worth a duel"],
    "refusals": ["the seed of the Not list, in their words"],
    "swap_candidate": "the competitor to run the swap test against"
  }
}
```

## The outputs

```bash
node assets/brief.mjs $BRIEF            # BRIEF.md
node assets/render.mjs $BRIEF --inline  # brief.html and brief.single.html
node assets/check.mjs $BRIEF            # the gate
```

`BRIEF.md` is in English, sixteen short sections, with every line tagged by its source and its interaction ids, then the two hand-off blocks. Each subject of the board appears with its orientation, its boundary and its markers (which brands fit, which are too far on each side). It tells the reader what is binding (Must, Never, gates) and what is defeasible, and that a brand named is a marker, never a model.

`brief.html` is in the session language, black and white: the summary, each section with its quotes and provenance tags, each subject as the same line the user saw on the board (the brands placed, the zone that fits), the references by circle, the logo contexts with where each comes from, what is open, what the brief is not. An `assumed` statement is drawn with a dashed tag and counted in the header.

## The gate

`check.mjs` fails when:

- `meta.status` is `draft`, or `summary.lead` is missing;
- one of the nine sections is empty and not in `declared_empty`;
- there is not exactly one primary audience;
- a value has no instance, or a trait lacks `more_than`, `never` or `sounds_like`;
- nothing was refused: no brand judged too far on a subject, no `never` signal, no rejected territory;
- a wallpaper word (modern, simple, trust, premium, human, authentic…) appears in the summary, the promise, the perception or a principle;
- a `stated` or `chosen` statement has no evidence, or any statement cites an interaction that does not exist;
- there are more `assumed` statements than open questions;
- a reference has no `url` or no `why`, or a dimension names a brand that is not a reference;
- a dimension confirmed on the board has no `orientation`, is `high` on a single piece of evidence, or uses a value outside the vocabulary;
- a logo context does not say where it comes from, no evaluation criterion is a gate, or `limits` is empty;
- `BRIEF.md` differs from what `brief.json` generates, or `brief.html` is missing.

`provisional` passes with a note. Fix the data and run the three commands again; never edit a generated file to pass.

## Before it goes out, read it as the next designer

Seven questions. If one fails, go back to the data.

1. **Swap.** Put a competitor's name on the summary. Still plausible? Then it says nothing.
2. **Monday morning.** Name three decisions this brief changes next week.
3. **Sacrifice.** What does it forbid? If nothing, there is no position.
4. **Traceable.** Pick three conclusions at random: does each lead to an answer or a vote?
5. **Nuance.** Are there limits and tensions, or only adjectives?
6. **Layers.** Is a taste of the founder written as a need of the audience anywhere?
7. **Alone.** Could someone who was not in the room work from `BRIEF.md` only?

## The test of a good brief

When there is time, and always when the skill itself is being changed: give `BRIEF.md` alone to a fresh creative agent and ask for three distinct directions that respect it. A good brief yields three directions that differ from one another and that the founder would each recognise as theirs. Three near-identical directions mean the brief over-specifies taste; three that the founder would refuse mean it under-specifies the refusals. Do not show the directions to the user as proposals: this is a test of the brief, and designing is `brand-kit`.
