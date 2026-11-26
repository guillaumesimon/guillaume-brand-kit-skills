---
name: brand-brief
description: Run the discovery an art director does before any design work, and write the brand brief. Reads the project, asks two or three short questions, then shows one clickable board where the founder settles the brand one subject at a time (tone, presence, colour, the place of a technology, the sign…), each subject judged on its own material (real sentences for tone, measured palettes for colour, visuals for presence) taken from brands of the product's own world. Writes one source, a generated brief for agents and a report for people. Use it for a brand brief, brand discovery, a discovery workshop, the kick-off of an identity or rebrand project, "help me define my brand", "I don't know what I want my brand to look like", brief de marque, découverte de marque, atelier de marque, cadrage d'identité, and as the first step before brand-audit and brand-kit. Not for auditing competitors (brand-audit) and not for designing the identity (brand-kit).
---

# Run a brand discovery and write the brief

Produce `brand/brief/`: what an art director knows about a company before drawing anything.

```
brand/brief/
├── brief.json         the single source: answers, verbatim, provenance, references, subjects
├── BRIEF.md           for agents: generated from brief.json
├── brief.html         for people: the brief the founder reads, corrects and passes on
├── rounds/            the board that was shown, and its answers
└── evidence/          the material shown: captures, logos, contact sheets
```

The brief answers one question:

> **What must this brand say, to whom, and what must it never become?**

It records intentions and taste. It fixes no colour, no typeface and no logo: that is `brand-kit`, after `brand-audit` has looked at the market.

## What the user must feel

**Simple, and it makes sense at every step.** This skill was rewritten after a first version lost its user in the first minute: a board of brands with no stated subject, then questions only a designer could answer. Everything below exists to prevent that. The user's whole experience is:

1. You tell them what you understood of their product. They correct it.
2. Two or three short questions about their business.
3. One board, five or six subjects, about three minutes. On each subject they know what they are judging, and they see what you understood before moving on.
4. You read the brief back. They correct it. Done.

About fifteen minutes. If a step would make the user ask "what am I looking at?" or "why are you asking me this?", it is wrong, whatever this file says.

## The six rules

**1. One subject at a time, and it is named.** Never show a brand without saying what about it is being judged. A subject has a name ("Le ton"), a question in plain words ("Quand ta marque parle, elle est plutôt…"), and three answers that complete a sentence ("Trop sérieux pour nous · Le bon ton pour nous · Trop joueur pour nous").

**2. Show the matter of the subject, never a home page for everything.** Tone is judged on real sentences. Colour on the palette measured on the brand's site. The sign on logos alone. Presence and imagery on a visual. A screenshot of a site is the matter of almost nothing.

**3. Brands from the product's own world.** What the buyers look at every day, the tools they compare, and the few brands elsewhere that solved the same problem. Never brands chosen because they are famous. For a recruiting tool: the search firms and the recruiting tools, not a telecom operator and a restaurant guide.

**4. Never ask a designer's question.** Where the logo will live, which formats, which constraints of reproduction: derive them from the product, write them as `inferred`, and show them in the read-back to be corrected. The same goes for anything the user would have to guess.

**5. Never ask for the abstraction.** "What are your values?" returns integrity and innovation from everyone. Ask for an instance ("the last time you turned down money"), or let a subject on the board answer.

**6. Read back what you understood, every time.** After each subject on the board, after the questions, at the end. A wrong reading corrected is the best data the session produces.

## Before you start

- Paths: scripts are relative to this skill (`assets/…`), outputs to the project (`brand/brief/`). Write `BRIEF=brand/brief` once.
- **If `brand/brief/brief.json` exists, this is a resume.** Read it, say in two lines what is understood and what is open, and continue. Never restart.
- Scripts need Node 22 or later. Capturing a page needs Playwright with Chromium: `node assets/fetch.mjs --check`; if it is missing, `npm i playwright && npx playwright install chromium`.
- You need web search, a way to read images, and ideally subagents for the scouts.
- Keep the user's exact words as you go. They go into `verbatim`.

## The session

### 1 · Understand, then ask (three minutes)

**Read before asking**: the README, the docs, the site, a deck, `brand/audit/AUDIT.md`. Open with what you understood, in two sentences, for them to correct:

> "Si je lis bien : dogo aide les cabinets de chasse à trouver des dirigeants, et l'idée centrale est que le jugement reste au chasseur. C'est juste ?"

Then ask only what the reading left open, **three questions at most**, one per turn. **Read `references/interview.md`** for which ones and how to word them. Write `brief.json` after each answer (`meta`, `context`, `audiences`, each field with its `source`): that is what makes the session resumable.

### 2 · Prepare the board (while they answer)

As soon as you know what the product is and who buys it, start preparing, in the background. **Read `references/subjects.md`.**

1. **Choose five or six subjects** for this project, and tell the user in one line what is coming: "Je prépare une planche : six sujets, trois minutes."
2. **Gather the reference brands**, about twelve, from the product's own world. One scout per circle.
3. **Fetch their material**:

```bash
node assets/fetch.mjs $BRIEF
```

   For each brand it captures the page, closes consent banners, sets aside blocked and broken pages, **measures the palette**, **reads the sentences the brand sets largest**, downloads any logo or visual you named, and writes contact sheets.

4. **Look at every contact sheet.** Reject what does not show the brand (`--reject id "why"`). For a subject about tone, read the sentences that came back and choose the one that carries the brand's voice: a promotion of the week does not.
5. **Write the round**: for each subject, its question, its three answers, and four or five specimens ordered from one pole to the other.

### 3 · The board (three minutes)

Show it by the first of these that works:

1. **Local server.** `node assets/board.mjs serve $BRIEF r1` in the background, and open the address it prints in the browser pane. On the last click the command exits and prints the answers: you are woken with them, and the user types nothing.
2. **One file.** `node assets/board.mjs build $BRIEF r1` writes `rounds/r1.html` with everything inside. Send it. It ends on a short code; when the user pastes it, `node assets/board.mjs decode $BRIEF r1 "<code>"`. In a cloud session, go straight here.
3. **Chat**, when nothing can be shown: one subject per turn, its question, the specimens as text, the three answers lettered. Say that it is a reduced version.

On the board, each subject goes: the two camps face to face, illustrated (the user picks a side, "in between", or "this subject does not matter to me"); then the specimens one by one, swiped or clicked; then **"here is what I understand"**, a line with the brands placed on it and one sentence, to confirm or redo.

The script records one interaction and one dimension per subject in `brief.json`: which brands fit, which are too far on each side. The user confirmed each reading on the board.

### 4 · Read back and write (five minutes)

For each subject, write what the markers mean for a designer: `orientation` in plain words and, where there is one, the `boundary`. The board gives "fits Harvey and Ashby, too bold: Juicebox"; you write "Direct, without bravado. Never a promise in the imperative."

Then read the whole brief back, **four or five sentences, in plain words**, with what you derived and never asked:

> "Si je résume : dogo parle à des chasseurs de dirigeants comme un confrère précis, pas comme un cabinet ni comme une startup. L'IA est là, mais c'est toi qui décides. Sobre, une seule couleur. J'ai supposé que le logo devra vivre dans une extension Chrome et sur LinkedIn, donc très petit. Qu'est-ce qui est faux là-dedans, ou trop gentil ?"

Require one correction. Then write the rest of `brief.json` (**read `references/brief.md`**), and:

```bash
node assets/brief.mjs $BRIEF            # writes BRIEF.md from the data; never edit it by hand
node assets/render.mjs $BRIEF --inline  # brief.html, and brief.single.html to send
node assets/check.mjs $BRIEF            # the gate
```

**A brief that fails the gate does not go out.** Set `meta.status` to `validated` only when the user confirmed the read-back; if they stopped early, `provisional`, and the outputs say so.

## When one board is not enough

Usually it is enough. Ask for a second, shorter round only when a subject that matters came back with nothing that fits, or two subjects contradict each other: two subjects at most, with new brands around where they pointed. Say why: "Sur le ton, aucune des marques n'était juste. J'en ai trois autres, une minute." Never a third.

## Showing the result

Open `brief.html` and look at it at desktop and phone width before the user does. Then serve `brand/brief/` and open it in the browser pane, or send `brief.single.html`.

Tell the user, in their language:

1. the brand in one sentence;
2. the one tension that will decide most design choices;
3. what was refused, in their words;
4. what you derived without asking, so they can correct it.

Do not read the brief back a second time. They have it.

## Be honest about what it is

- Everything comes from the founder: optimistic, and too broad on audience. No customer was asked. Say so in `limits`.
- The references are a dozen brands chosen to place this one. They show taste, not the market. The market is `brand-audit`.
- A brand on a scale is a marker, never a model. The brief says so, and never says "like X".
- **Never invent**: a sentence a brand did not write, a colour you did not measure, a reference nobody can open, a value with no instance. An empty field with its reason is information.
- **Never simulate a capability.** If nothing can be fetched or shown, say it and run the reduced version in chat.

## Third-party material

Captures, logos and sentences of other companies are working material for internal reference. Do not deploy `brief.html` or a round publicly. Before committing `brand/brief/evidence/` or `rounds/*.html`, check whether the repository is public; if it is, tell the user and let them decide.

## Language

Converse in the user's language. The board and `brief.html` follow it (`meta.locale`; French and English ship). Every label of a subject is written by you in that language. Quotes stay in the language the brand wrote them in. `BRIEF.md` is in English whatever the session language: agents read it. Coded values (`source`, `circle`, `kind`, `level`, `confidence`) stay in English.

## With the other skills

- **`brand-audit`** reads `brand/brief/BRIEF.md` when it exists: its framing comes from the brief, and "For brand-audit" gives it the competitors the founder named and what they believe about the category.
- **`brand-kit`** reads it too: it does not ask again who the product is for, spends its duels on what the brief left open, and seeds its "Not" list from the refusals.
- This skill never starts another one. Say that the brief is ready, what would come next, and stop.

## Files in this skill

- `references/interview.md`: opening with a reformulation, the three questions, wording them, refusing a generic answer, what is never asked, the read-back
- `references/subjects.md`: choosing subjects, the matter of each, choosing brands from the product's world, the scout prompt, fetching and checking the material, writing a round, reading the answers
- `references/brief.md`: the schema of `brief.json`, provenance, the outputs, the gate, the test of a good brief
- `assets/board.html`, `assets/board.mjs`: the board; serve, build, decode
- `assets/fetch.mjs`: captures, measured palettes, the brand's own sentences, logos and visuals, contact sheets
- `assets/brief.mjs`, `assets/render.mjs`, `assets/check.mjs`: `BRIEF.md`, `brief.html`, the gate
- `assets/brief.example.json`, `assets/BRIEF.example.md`: a worked example on a fictional company
- `assets/lib/`: the vocabularies, the answer format, the browser helper
- `tests/`: `node --test tests/*.test.mjs`
