# Synthesis

Everything before this point is collection. This is where the audit earns its place: turning counts into a position on what to keep and what to break.

```bash
node assets/aggregate.mjs brand/audit [--axes dimension,dimension]
```

## What the counts mean

The base is the direct brands captured in full and coded. Each dimension uses the brands that have a value for it, so `symbol_nature` is counted over the combination marks only. The count and the base are always written together: `6 of 8`.

| Status | Rule | Reading |
|---|---|---|
| convention | share ≥ 60 %, and at least 4 brands in the dimension's base | What the category does |
| common | between the two | One option among others |
| rare | share ≤ 15 % | Almost nobody |

In flash a convention also needs 5 brands, since 3 of 4 is not a pattern. The thresholds are in `meta.thresholds`; change them there and say why in `limits`.

**Look at the absences too.** A value of the vocabulary that no direct brand uses does not appear in the output. For each dimension, ask what is missing: no serif at all, no dark ground, no illustration. Those absences are where the empty territories are, and the script will not list them.

## Classifying a convention: the exception test

A convention at 60 % leaves up to 40 % of brands doing otherwise. So the question is never whether someone breaks it. It is **who**.

`aggregate.mjs` prints, for each convention, the brands that do otherwise and marks the established ones with `*`. Then:

| Situation | Class | Meaning |
|---|---|---|
| An **established** brand breaks it and is still read as part of the category | `cliche` | Breakable. The proof exists and you can name it |
| No established brand breaks it, **and** it tells the buyer something they need | `legibility` | A category code. Keep it: it is how the category is recognised |
| No established brand breaks it, and it tells the buyer nothing | `risky` | The best opening or a trap. Decide on purpose |

Two more classes are not conventions and never come out of the counts. Write them by hand (`manual: true`) when you see them:

| Situation | Class | Meaning |
|---|---|---|
| One brand holds a code so firmly that using it means being taken for that brand: a colour, a sign, a way of photographing | `owned` | Avoid. Not a cliché: a property. Name the brand and where it uses it |
| A code that two or three recent or recently rebranded players share, absent from the older ones | `emerging` | Watch. It may be the next convention; entering it now is early, in two years it is late |

For `owned`, the test is recognition without the logo: cover the name on the capture, and if the brand is still obvious because of that one element, it is theirs. For `emerging`, date it: say when each brand adopted it, from the rebrand search or the case studies.

"Tells the buyer something they need" means one of: it identifies the type of product at a glance (a phone screen for an app, a map for navigation), it answers a trust requirement of the sector (a regulated look in finance or health), or it makes the thing usable (a light ground for long reading). Habit does not count. "Everyone does it" is the definition of a convention, not a reason to keep it.

Three cautions.

- **"Still read as part of the category"** is a real condition. An established brand that broke a code and moved to another category (a running app that became a lifestyle brand) proves nothing about the code.
- **One established breaker is enough** for `cliche`, but say how many there are. One of six leaders breaking it is a weaker proof than three.
- **A newcomer breaking a code is not proof.** It is a bet in progress. Mention it in the reason; it does not change the class.

For a `risky` convention, look outside the panel before writing it up: what did the aspirational brands and the leaders abroad do with it? A code nobody breaks here and that is broken freely in the neighbouring category is the most promising kind.

### Conventions the counts cannot see

Some of the strongest patterns cross two values or belong to no dimension: every brand shows either runners or the app; five names are in heavy slanted capitals; every app screenshot is in dark mode. You see them on the walls, not in the table. Write them into `conventions` by hand, with `"manual": true`, your own count and base, the breakers you observed, and a class, reason and evidence like any other. `aggregate.mjs` keeps them as written.

```json
{ "manual": true, "dimension": "imagery", "value": "runners or the app screen", "count": 8, "base": 8, "share": 1,
  "breakers": [], "class": "legibility", "provenance": "judged", "reason": "…", "evidence": ["evidence/sheets/heroes.webp"] }
```

Count them honestly, brand by brand, on the wall, by looking at it yourself. Do not count from the coders' notes: a note says what struck one coder about one brand, not what is true of all of them. In the trial that shaped this skill, a count taken from notes named the wrong brand; the wall corrected it. A manual convention without a real count is an impression with a number attached.

If the base later drops under four brands, the classified conventions are kept and marked `stale` rather than erased; recount when the panel is back.

Write each classification into `audit.json` on the convention:

```json
{ "class": "cliche", "provenance": "judged",
  "reason": "Strava, the category leader, uses no neon at all and is the most recognised brand in the panel.",
  "evidence": ["evidence/sheets/palettes.webp", "evidence/strava/desktop.webp"] }
```

The reason names the brand. The evidence shows it. In flash, start the reason with "Hypothesis." and mean it.

Re-run `aggregate.mjs` afterwards: it keeps your classifications and refreshes the counts.

## The map

The script picks the two dimensions that split the direct panel most evenly and reduces each to its most frequent value against the rest. Every coded brand is plotted, direct or not.

Two maps are drawn: the best pair, then the best pair among the remaining dimensions. One map flatters a single reading; two that agree are an argument, and two that disagree are a finding. Name your own with `--axes a,b --axes c,d`, one map per flag.

The automatic pick is a start. If it gives an axis that says little (saturation against case), choose the two dimensions that carry the story you saw on the walls and re-run with `--axes imagery,ground`. The choice is kept on later runs. A dimension only works as an axis if at least two of its values each hold a fifth of the panel.

Then write `reading` on each map of `maps` in `audit.json`, three or four sentences in plain words:

- name the axes as a person would ("from showing the runner to showing the data", not "imagery");
- say where the crowd is: that quadrant is the **saturated territory**;
- say where the **indirect** competitors sit. What people use today sets what they expect; if the substitutes all sit in one corner and the direct competitors in another, the direct competitors are talking to each other, not to the buyer;
- say which quadrant is empty, and check it. Empty because nobody thought of it, or because it was tried? Look at the leaders and the aspirational brands plotted there, and search for a brand that tried and left.

Where the aspirational brands sit matters as much as where the competitors sit. An empty quadrant that holds two aspirational brands is a territory that works elsewhere and has not arrived here.

## Opportunities

Two in flash, three to five in deep. An opportunity is not "be different". It is a territory, written so that a designer could start from it:

```json
{ "id": "the-training-log", "title": "The training log",
  "keep": ["imagery: product_ui"],
  "break": ["hue: orange", "headline_promise: community"],
  "import": [{ "from": "field-notes", "what": "a ruled, paper-toned page and a mono index" }],
  "rationale": "Nobody addresses the runner alone with their numbers, which is what running two or three times a week is.",
  "observation": "Seven of ten sell belonging with a photograph of a group.",
  "alignment": "The audience runs alone, for its head.",
  "benefit": "Recognised by the people it is for; unlike every competitor.",
  "validate": "Whether a solitary image reads as calm or as lonely: show both to five runners.",
  "risk": "medium", "risk_note": "No direct brand has tried it.", "provenance": "judged",
  "evidence": ["evidence/sheets/heroes.webp", "evidence/field-notes/desktop.webp"] }
```

Rules for writing them:

1. **It keeps every legibility code.** An opportunity that breaks one is a different product category, not a differentiation.
2. **It breaks at least one named cliché or risky convention.** Otherwise it is the category.
3. **It borrows from a panel brand when it borrows.** `import.from` must be a brand id. The borrowing is what makes it concrete: a ground, a typographic manner, a way of showing the product.
4. **It comes from the framing.** The strongest territories usually start from `framing.instead_of` or from the audience's own life, not from design fashion. Ask what this audience already recognises that no competitor uses.
5. **It fails the any-sector test.** Read it with another sector's name. If it still works ("bold, human and simple"), it is not an opportunity for this one. Rewrite or drop it.
6. **It names what it rests on and what it leaves unknown.** `observation` is the pattern in the panel, with its count. `alignment` ties it to the framing. `benefit` says what it would buy. `validate` says what only people can tell you. `check.mjs` requires all four.
7. **Its risk is stated**: `low` when an established brand already proves part of it, `high` when it rests on a risky break.

Rank them. The first is the one you would defend.

This skill stops at the territory. It does not choose a palette or draw a logo; `brand-kit` does that, with the user.

## The counter-check (deep)

The classic failure of an audit is the white space that is not white: a brand outside the panel already lives there. So each opportunity is handed to a subagent whose only job is to make it fall.

```
A brand audit claims the following territory is open in <sector>, <market>:

<title>: <rationale>
It would keep: <keep>. It would break: <break>.

Your job is to prove this wrong. Search for brands in this sector, in this market and abroad,
that already look like this. Try at least five different searches, including image-oriented ones
and ones in the market's language. Look beyond the brands already in the panel: <panel names>.

For each brand you find, open its site and confirm with your own eyes that it occupies this
territory, not something near it.

Return JSON only:
{ "searched": ["the queries you ran"],
  "found": [{ "name": "…", "url": "…", "how_close": "same territory | adjacent | superficial", "note": "…" }],
  "verdict": "held | weakened | fallen",
  "why": "one or two sentences" }
```

Then:

- **fallen**: remove the opportunity. If the brand found is a real competitor, add it to the panel, capture and code it, and re-run the counts.
- **weakened**: keep it, raise the risk, and say who is nearby.
- **held**: keep it.

Record the result on the opportunity: `"challenged": { "searched": [...], "result": "held" | "weakened", "note": "…" }`. `check.mjs` requires it in deep mode. "Held" means held against those searches, and the board prints them.

## Recent rebrands (deep)

One search pass: which brands of this sector changed identity in the last two years, and toward what. A territory three leaders just moved into is about to be saturated, whatever today's counts say. Put what you find in `limits` or in the rationale of the opportunity it affects, with the source.

## Writing `AUDIT.md`

Copy `assets/AUDIT.example.md` and rewrite every line. It is for agents that will design from it, so it is short, imperative and checkable.

- **Frontmatter**: sector, market, mode, date, base.
- **0. Frame**: three lines from `framing`.
- **1. Preserve**: the category codes, as rules.
- **2. Avoid**: the clichés, each naming the established brand that proves it breakable, and the codes owned by a competitor, each naming its owner. Add motif clichés here when a `symbol_subject` reaches a third of the panel, even under the convention threshold: four open books out of eight is a cliché a designer needs to know.
- **3. Challenge**: the risky breaks, with what the neighbours did, and the emerging codes, dated.
- **4. Explore**: the opportunities, ranked, one paragraph each.
- **5. Validate**: what must be checked with people before committing, and how.
- **6. For brand-kit**: three things.
  - *Swap test competitor*: the most typical established brand, the one whose name you would put on a design to see if it still works.
  - *Category duel*: two image paths, the most typical home page against the most deviant one among the direct brands. Typical is the brand that matches the most conventions; deviant, the fewest.
  - *Seed for the Not list*: the clichés as a designer would say them ("orange on white, a group photo at golden hour, a phone tilted at 15 degrees").
- **7. Limits**.

Every rule ends with its count and one or more `evidence/…` paths in backticks. `check.mjs` verifies that each path exists.

## The limits section

Not a disclaimer. A list of what would change the conclusions, so the reader knows what to check:

- the mode and what it skipped;
- brands that could not be captured, by name;
- dimensions where coders disagreed a lot;
- that library samples are curated;
- the date.
