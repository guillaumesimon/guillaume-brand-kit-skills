# The interview

How to get something specific out of someone who has never had to describe a brand, with as little writing on their side as possible.

## Before the first question

Read what exists: the README, the docs, the site, a pitch deck, user research, an older brief, `brand/audit/AUDIT.md`. Every fact you find is a question you do not ask. Record it with `source: "documented"` and the file as evidence.

Open with what you understood, as one or two sentences to correct. The first turn teaches the user what kind of conversation this is: if it is a question about feeling, they will produce adjectives for twenty minutes.

Never open with "tell me about your business" or "what should the brand feel like?".

## Three ways to ask, cheapest first

1. **A reformulation to validate.** "If I read this right, [the thing]. Is that fair?" Costs a yes, and a wrong one gets corrected with better data than a question would have returned.
2. **A closed question with hypotheses.** Three or four answers you wrote for this project, each anchored where possible, plus "something else". Use `AskUserQuestion` when it exists (one question, up to four options, `multiSelect` for the logo contexts).
3. **An open question about an instance.** Only for what lives in their words and nowhere else: a story, a refusal, the sentence a customer says.

Never a numbered list of questions. One per turn.

## What to learn, and how to ask it

Ask only what the reading left open. Each line gives the subject, the question that works, and the thing you are fishing for.

| Subject | Ask | Fishing for |
|---|---|---|
| Product | "What are you building, and who bought most recently? What were they doing the hour before?" | a real buyer and the moment of need, not a market |
| Reason to exist | "What happened the last time this went wrong for someone?" | the problem as an event |
| What is used instead | "What do they use today instead? And what does that do *better*?" | the real competitor, often paper or a spreadsheet, and what must be matched or given up |
| Difference | "When someone picks you over the obvious choice, what sentence do they say to justify it?" | the difference in the customer's words |
| Proof | "Why can't the obvious choice just copy that?" | a structural reason. If there is none, write "no structural reason to believe yet" |
| Audience | closed: "If you lost one of these tomorrow, which would end the company?" | exactly one primary audience |
| Frame | closed: "Today people put you next to X. Which of these would you rather be put next to?" | the chosen comparison |
| Ambition | closed, three futures written for them: "In five years, which is closest?" | scale and what the brand must be able to carry |
| Values | "Tell me about the last time you turned down money." then "What would you never do, even if it worked?" | a sacrifice. Ask the second one twice |
| Perception | closed, anchored: "Someone has just used it. They feel like after…" with three moments they know | the emotion, as a situation |
| Fear | "What are you afraid this turns you into?" | the emotion to forbid, and often the best line of the brief |
| References | "Any brand you admire, in your world or far from it? Any you would hate to be mistaken for?" | goes into the pool, tagged `founder_cited` |
| Constraints | closed, multi-select: what exists and stays (name, colour, domain), languages, legal, deadline | what design cannot touch |
| Logo contexts | closed, multi-select, written for their product: app icon, favicon, shop sign, packaging, embroidery, vehicle, invoice, social avatar, one-colour print… then "which one, if the logo failed there, would be a real problem?" | the critical context |

## Closing a question with hypotheses

The options are **your reading of this project**, not a taxonomy.

Bad, a category list anyone could have written:

> Who is your audience? · SMEs · Large companies · Individuals · Other

Good, three hypotheses from what you read:

> If you lost one of these tomorrow, which would end the company?
> · Owner-managers who also work the front desk
> · Regional groups with five to ten hotels
> · Housekeeping contractors working for several hotels
> · Someone else

Rules:

- Three or four options, mutually exclusive, all plausible. One obviously wrong option is a wasted slot.
- Their vocabulary, not yours. Reuse words they said.
- "Something else" always exists, and a pick of it is followed by one open question.
- Record the options you offered in the interaction, not only the answer: what they did not choose is information.

## Anchoring an option in something they know

An abstraction is hard to choose; a known thing is easy. Replace the pole with a brand, a place or a moment the founder certainly knows.

| Instead of | Ask |
|---|---|
| "Reassuring or stimulating?" | "They leave you like after an appointment with a good pharmacist, or like after a climbing session?" |
| "Premium or accessible?" | "On a shelf, are you next to Aesop or next to Le Petit Marseillais?" |
| "Serious or playful?" | "Does it speak like a bank's letter, like Alan's app, or like a friend who works there?" |
| "Expert or close?" | "The tone of a specialist doctor, or of the nurse who explains what the doctor said?" |

How to pick anchors:

- **Known to this founder.** Their country, their generation, their sector. A French founder of a health product knows Doctolib and Alan; do not assume Headspace. If unsure, offer the anchor and add "if you know it".
- **Far apart on the point, comparable on the rest.** Two consumer brands, or two work tools, not one of each.
- **Outside their own category** when the question is about attitude, so they judge an attitude and not a competitor.
- **Never the same six brands for every project.** If you reach for Apple, Patagonia and Oatly by reflex, you are describing your own references.
- An anchor is a pointer, not a model. Never write "like Alan" in the brief; write what they kept from it.

## Territories

Before any logo is shown, give the direction a shape the founder can point at. Write three or four territories **for this project**:

- a name of two to four words, a metaphor a person would use, not an archetype label;
- one sentence in plain words: what the brand is to its user;
- all credible, and far enough apart that choosing one costs something.

For a practice-management tool for physiotherapists:

| Territory | In one sentence |
|---|---|
| The everyday partner | Warm and close to practitioners; makes running the practice lighter. |
| The expert co-pilot | Reliable and precise; gives the feeling of mastering one's activity. |
| The modern challenger | Bold; shakes up the old management software. |
| The invisible tool | Sober and fluid; disappears behind the practitioner's work. |

Then three questions, in chat, one per turn:

1. "Which is closest to what you want to be?"
2. "Which one goes straight away?"
3. "Is there something in one of the others you would keep?"

A mix is an answer. "None" is an answer: ask what is missing and write a fifth. Record each territory with its status (`chosen`, `kept_from` with what is kept, `rejected` with the reason, `open`). The rejected one often says more than the chosen one.

Never use the twelve archetypes as the options. There are twelve of them and ten thousand companies: every fintech becomes the Sage.

## Refusing the first answer

When an answer lands on this list, do not write it down and move on:

`integrity · innovation · excellence · trust · quality · passion · customer-centric · seamless · effortless · empowering · transparency · simplicity · authentic · premium · modern · clean · minimal · professional · disruptive · human` and their French equivalents.

Ask for the time it cost something:

- "Integrity" → "Give me the time integrity cost you money."
- "Premium" → "What does someone get from you that they cannot get for less elsewhere? A thing, not a feeling."
- "Everyone" → "Who bought most recently?"
- "Modern and clean" → "Name a brand you would be annoyed to be mistaken for. Why that one?"

If there is no instance, the answer does not exist. Leave the field empty and say why in `declared_empty`. `check.mjs` refuses a value with no instance and a wallpaper word in the summary.

## "I don't know"

Never repeat the question and never rephrase it as another open question. Go down one step:

open question → closed question with hypotheses → a pair of anchors → **assert it yourself with a free undo**:

> "I'll make the call: [X], because [reason from something they said]. Tell me if that is wrong."

Record an asserted answer as `inferred`, not `stated`.

## Telling a real answer from a polite one

- **Never ask "do you like it?".** It has a socially obligatory answer. Ask "what is wrong in this?" or "what is too kind?".
- **Polite no**: "that's interesting", "I could see that", "it's fine", "whatever you think", "maybe for another audience". Treat each as a no and say so: "That read as a no. What is wrong with it?"
- **Real yes**: they elaborate without being asked, imagine a use, criticise a detail (criticising a detail accepts the whole), or say who they would show it to.
- **Fatigue**: answers shorten to one word, "whatever you think" appears. Stop asking, assert with undo, and say how much is left.
- **Contradiction** is information, not an error. Do not average it. Name it and ask for the sacrifice: "You said premium and you picked the most approachable one each time. On a Tuesday, with an undecided customer: would you rather they think *this is not for me*, or *this seems cheap*?" The answer becomes a tension in the brief.

## Founder's taste against the audience's need

Keep four layers apart in `brief.json`, because they are not the same kind of statement:

| Layer | Example |
|---|---|
| Strategy | Make practice management accessible to independents. |
| Desired perception | "I feel accompanied and confident." |
| Personality | Warm, competent, direct, slightly mischievous. |
| Creative preferences | Simple illustration, an expressive identity, a modern typeface. |

The first three belong to the brand. The fourth is the founder's taste until something shows the audience shares it. When a preference pulls against the audience (a founder who loves dark, dense developer tools, selling to people on old phones in bright rooms), do three things: say the risk plainly, offer one or two ways through, and ask them to arbitrate. Record it in `preferences.founder_vs_audience` with who decided. Never replace their choice silently with your judgement.

## The read-back

Four or five sentences, no axis names, their words where you can, and a question that makes disagreement cheap:

> "Si je résume : une marque pour [qui], qui doit donner le sentiment de [quoi]. Plutôt [X] que [Y], jamais [Z]. Tu aimes [référence] mais tu n'en veux pas pour toi. Et il faut que ça tienne sur [contexte critique]. Qu'est-ce qui est faux là-dedans, ou trop gentil ?"

Require one correction. A read-back accepted without a word has not been read. When it is confirmed, mark the dimensions it covered `validated` and set `meta.status` to `validated`.
