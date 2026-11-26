# The report

Counts and walls are not an audit. An audit says what they mean. A report that lists "people photo 5 of 8" and stops has done the collecting and skipped the work; the reader, a designer about to draw, learns nothing they can use.

So the report is written, section by section, each part by a writer who looks at the evidence for that part and nothing else. Then the analyst writes the conclusions, and the summary last.

## The twelve sections

| # | Section | Written by | What it must deliver |
|---|---|---|---|
| 01 | Executive summary | the analyst, **last** | The landscape in two minutes: a lead, then five decisions |
| 02 | Competitive landscape | the analyst | Who was observed and why, by ring of proximity |
| 03 | Brand profiles | profile writers | The same grid for every brand: personality, strength, lesson |
| 04 | Logo landscape | a writer | The marks side by side: what the wall shows that one logo hides |
| 05 | Logo architecture | a writer | Which types dominate, which are rare, and whether rare means open |
| 06 | Colour landscape | a writer | How the colour space is occupied, logo and identity apart |
| 07 | Typography landscape | a writer | The lettering signatures, and where a signature is still free |
| 08 | Signs and meaning | a writer | The ideas behind the symbols: metaphors, motifs, clichés |
| 09 | Visual language and touchpoints | a writer | What makes a brand recognisable without its logo, across site and store |
| 10 | Positioning maps | the analyst | Two or three maps, each read in plain words |
| 11 | Codes and conventions | the analyst | Every convention classified, with its proof |
| 12 | White space and opportunities | the analyst | Territories a designer could start from |

`render.mjs` lays these out. Sections 04 to 09 come from `audit.json` `sections`, 03 from each brand's `profile`, 01 from `summary`.

## What a written section is

```json
"colour": {
  "lead": "One sentence a reader could repeat. The finding, not the topic.",
  "paragraphs": ["Two to four paragraphs of analysis. What is there, what it means, what is absent."],
  "findings": [
    { "text": "Six of eight accents fall between 217 and 226 degrees of hue.", "provenance": "measured", "evidence": ["evidence/sheets/palettes.webp"] },
    { "text": "The warm half of the spectrum is empty.", "provenance": "observed", "evidence": ["evidence/sheets/palettes.webp"] }
  ],
  "takeaway": "One or two sentences: what a designer should do with this."
}
```

The six keys are `logos`, `architecture`, `colour`, `typography`, `symbols`, `visual_language`.

What separates analysis from description:

- **The lead states a finding.** "Blue dominates" is a topic. "Blue says software here, not running, and the warm half of the spectrum is empty" is a finding.
- **Every paragraph answers "so what".** A count, then what it means for someone entering the category.
- **Absences are findings.** What no brand does is often worth more than what most do. Name what is missing.
- **Site and store are compared.** A brand that is black and white on its site and acid yellow in its app icon has told you something.
- **Indirect and aspirational brands are read against the direct ones.** They are in the panel to be contrasted, not listed.
- **Three to six findings**, each one checkable on the evidence it cites, each labelled `measured`, `observed` or `judged`.
- **The takeaway is for a designer**, in the imperative or close to it. Not a recap.

Write in the report language: English unless the user asked for another. Quotes from a site stay in their own language. No adjectives that would fit any sector: "modern", "dynamic", "clean" describe nothing.

## Dispatching the writers

After coding and `aggregate.mjs`, and after `sheets.mjs`. In flash, three writers, each taking two sections. In deep, one writer per section.

| Writer | Sections | Looks at |
|---|---|---|
| Signs | `logos`, `architecture`, `symbols` | `sheets/logos.webp`, `sheets/apps.webp`, every `logo.webp` and `app-icon.webp` |
| Colour and type | `colour`, `typography` | `sheets/palettes.webp`, `sheets/type.webp`, every `headline.webp` and `desktop.webp` |
| System | `visual_language` | `sheets/heroes.webp`, `sheets/apps.webp`, the `scroll-*`, `page-*` and `app-*` of each brand |

Give each writer the counts for its dimensions (copy the relevant lines of `aggregate.mjs` output), the coders' notes for every brand, the library facets when there are any, and this prompt:

```
You are writing one part of a visual brand audit, as an art director would for the team that
will design a new brand in this category. You analyse; you do not design and you do not
recommend a direction.

Sector and market: <framing.product>, <framing.market>
Audience: <framing.audience>
What they use today: <framing.instead_of>

Your sections: <keys>, as defined in <absolute path to this file>. Read it first.

Evidence. Open and look at every image listed here before you write a word:
<absolute paths to the sheets and per-brand folders for this writer>

Counts on the direct brands (n of base):
<the lines of aggregate output for this writer's dimensions>

Coders' notes, one per brand:
<id: role: notes>

Curated library sample, apart from the panel: <facets, or "none">

Rules:
- Say only what the images and counts show. If you state a count, it must be one given above
  or one you counted yourself on a sheet, brand by brand, and can name.
- Compare: direct brands with each other, then against the indirect and aspirational ones, and
  each brand's site against its store listing.
- Name what is absent as well as what is present.
- Every finding cites one or more evidence paths, relative, starting with "evidence/", that
  you opened.
- Write in <the report language, English by default>. Quote headlines in their own language. Plain sentences. No word that would fit any sector.

Write your result as valid JSON to <absolute path>/sections-<writer>.json, one object per section key:
{ "<key>": { "lead": "…", "paragraphs": ["…", "…"],
             "findings": [{ "text": "…", "provenance": "measured|observed|judged", "evidence": ["evidence/…"] }],
             "takeaway": "…" } }
Then reply with three lines: your main findings. Do not paste the JSON in your reply.
```

**Have each writer save a file.** A section is several hundred words; returned in a message it has to be retyped to reach disk, which costs time and invites errors. A file is merged as it is. The same goes for coders and profile writers. Merge the files into `audit.json` under `sections`. Read every section yourself before keeping it: a writer that states a count you cannot find on the wall has to be sent back.

## Brand profiles

One per brand that has codes. A profile is three sentences, written from all the brand's captures:

```json
"profile": {
  "personality": "How the brand comes across: two or three traits, each tied to something visible.",
  "strength": "The one thing in its identity that works and would be hard to copy.",
  "lesson": "What this brand teaches the one being created."
}
```

`lesson` is the one that matters. "Strong colour" is not a lesson. "A single saturated colour held across site, icon and store listing makes a retailer's sub-brand recognisable at icon size" is one.

Profile writers take six or seven brands each. They get the brand folders and the coders' codes and notes, and save `{ "<id>": { "personality", "strength", "lesson" } }` to a file. The coders can be asked for the profile in the same pass when the panel is small.

## The summary, written last

```json
"summary": {
  "lead": "Two or three sentences. The category as one picture, and the one thing to know before designing.",
  "preserve":  [{ "text": "…", "evidence": ["evidence/…"] }],
  "avoid":     [{ "text": "…", "evidence": ["evidence/…"] }],
  "challenge": [{ "text": "…", "evidence": ["evidence/…"] }],
  "explore":   [{ "text": "…", "evidence": ["evidence/…"] }],
  "validate":  [{ "text": "…" }]
}
```

| Decision | Comes from | It is |
|---|---|---|
| `preserve` | conventions classed `legibility` | The codes to keep to be understood and believed |
| `avoid` | `cliche` and `owned` | The clichés, and what belongs to a competitor |
| `challenge` | `risky`, and what the writers found unexamined | Conventions that could be questioned, on purpose |
| `explore` | the opportunities, and `emerging` codes | Territories to open |
| `validate` | everything the audit cannot know | Hypotheses a person, an audience or a specialist must check |

`validate` is not optional. An audit read from captures knows what brands show; it does not know how people perceive them, whether a sign is legally free, or whether a territory sells. Name the two or three things most worth checking, and how: "show both versions to five runners who do not use an app".

Three to five items per decision at most. An item is one line a designer can act on.

## Before it goes out: eight questions

Answer each honestly; a "no" is a limit to write down or a gap to close.

1. **Relevance.** Is each brand in the panel there for a stated reason?
2. **Coverage.** Logos, colour, type, symbols, imagery, and the touchpoints that matter for this product: all looked at?
3. **Visual evidence.** Does every claim point at something a reader can see?
4. **Accuracy.** Are the captures current, from the brand's own pages, and dated?
5. **Pattern recognition.** Does the report say what repeats across brands, not only describe each one?
6. **Strategic alignment.** Does each opportunity answer something in the framing?
7. **Actionability.** Could a designer start from the five decisions alone?
8. **Uncertainty.** Are readings kept apart from facts, and is what needs validating named?

`check.mjs` verifies the mechanical half: sections and summary written, evidence present, profiles, the fields of each opportunity. The other half is yours.
