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

Chat questions are recorded as interactions `q01`, `q02`, … with `type` (`question`, `closed`, `territory`), the `question`, the `options` offered, and the `answer`. Board screens are recorded by `board.mjs` as `r1-01`, `r1-02`, ….

## The sections

`meta`: `schema` (1), `brand`, `date`, `locale` (session language, drives the report), `market_locale` (drives captures, e.g. `fr-FR`), `status` (`draft`, `provisional`, `validated`).

`summary`: `lead`, one sentence: what the brand must say, to whom. `essence`, three or four sentences: who it is for, what it should feel like, the central tension, the critical constraint. Written last. No wallpaper words.

`context`: `product`, `reason`, `problem`, `instead_of`, `difference`, `proof`. If there is no structural proof, `proof.value` says "No structural reason to believe yet" and what would count.

`audiences`: a list; exactly one `primary: true`. Each: `name`, `who`, `need`, `feeling`, `source`, `evidence`, `quote`.

`positioning`: `frame_inherited` (what people compare them with today), `frame_wanted`, `promise`, and `territories`, each with `id`, `name`, `description`, `status` (`chosen`, `kept_from` with `keep`, `rejected` with `reason`, `open`).

`ambition`: `horizon`, `scale`, `must_carry` (what the brand has to survive: other languages, a second product, a sale).

`values`: each `value` with the `instance` that proves it (the time it cost something), the `quote`, the `source`. No instance, no value.

`perception`: `think`, `feel`, `never_feel`.

`personality`: `traits`, each operable: `trait`, `more_than` ("more a head housekeeper than a consultant"), `never` ("never fussy"), `sounds_like` (one real sentence). And `dimensions`: see `references/exercises.md`.

`tensions`: `tension` ("Humour / credibility"), `direction` ("Playful without being childish"), `crossed_when` (the observable sign that the limit is passed), optional `examples`.

`references`: the cards (`references/references.md`), with their verdicts and attributes.

`preferences`: `signals`, each a `statement` with a `level`, `evidence` and `source`; and `founder_vs_audience`, each `wish`, `risk`, `arbitration`, `decided_by`.

| `level` | Means |
|---|---|
| `must` | a requirement: the brief fails without it. Rare, and usually a constraint |
| `preference` | chosen more than once; defeasible with a reason |
| `explore` | a lead, one signal, worth testing |
| `never` | refused, in their words |

`principles`: three to five decision rules a designer can apply on a Monday: `principle`, `because`, `evidence`. Each must forbid something.

`constraints`: `items`, each `constraint`, `kind` (`practical`, `technical`, `legal`, `cultural`, `existing`), `source`; and `timeline`.

`logo_contexts`: each `context`, `priority` (`critical`, `expected`, `later`), `note`. At least one is `critical`.

`evaluation`: criteria to judge a future concept, each `criterion` and `type` (`gate` or `preference`). Gates come from constraints, refusals and the critical logo context.

`interactions`, `verbatim`: the record. `verbatim` holds the sentences worth reusing, each with what it is `about`.

`open_questions`: each `question`, `why`, and `for` (`founder`, `audit`, `kit`). Market hypotheses go to the audit; design questions to the kit.

`limits`: what the brief does not cover. Always: it is the founder's account; the references are a sample; and anything specific to this session (a blocked site, a session cut short).

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

`BRIEF.md` is in English, sixteen short sections, with every line tagged by its source and its interaction ids, then the two hand-off blocks. It tells the reader what is binding (Must, Never, gates) and what is defeasible.

`brief.html` is in the session language, black and white: the summary, each section with its quotes and provenance tags, the three walls of references with the real images (speaks to them; liked, but not for this brand; never), the logo contexts, what is open, what the brief is not. An `assumed` statement is drawn with a dashed tag and counted in the header.

## The gate

`check.mjs` fails when:

- `meta.status` is `draft`, or `summary.lead` is missing;
- one of the nine sections is empty and not in `declared_empty`;
- there is not exactly one primary audience;
- a value has no instance, or a trait lacks `more_than`, `never` or `sounds_like`;
- nothing was refused: no `never` verdict, no `never` signal, no rejected territory;
- a wallpaper word (modern, simple, trust, premium, human, authentic…) appears in the summary, the promise, the perception or a principle;
- a `stated` or `chosen` statement has no evidence, or any statement cites an interaction that does not exist;
- there are more `assumed` statements than open questions;
- a reference has no `url` or no `why`, or carries a verdict although its image was never shown;
- a dimension is `high` on fewer than two pieces of evidence, or uses a value outside the vocabulary;
- no logo context is `critical`, no evaluation criterion is a gate, or `limits` is empty;
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
