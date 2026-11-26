---
name: brand-kit
description: Build a brand universe and its guidelines from a guided conversation, in a quick mode (four minutes, five decisions: tokens, BRAND.md and theme.css an agent can build from today) or a normal mode (twenty minutes), and in normal mode publish them as a Klarna-style brand guidelines website (Our brand, How we speak, How we look - art direction, colour, typography, layout, photography, iconography, illustration, motion) plus machine-readable tokens and an agent instruction file. Use this skill whenever someone wants to create a brand, a visual identity, brand guidelines, a brand book, a brand site, a style guide, a charte graphique, une identité de marque, un univers de marque, or says they need to define how their product or company should look and sound. Also use it when a new project is starting and nothing about its brand has been decided, when a project needs a brand so that agents can build on-brand pages, decks and screens, and when someone asks for a colour palette, a typographic system, a tone of voice, a photography direction, an icon style, an illustration style or a logo direction for a real company. Also use it to turn a quick kit into a full identity. Do not use it to update a kit that already exists - use brand-kit-update for that.
---

# Build a brand kit

Produce a `brand/` directory: a brand guidelines **site** a founder would show their team — shaped like `brand.klarna.com`, with Our brand, How we speak, and How we look broken into art direction, colour, typography, layout, photography, iconography, illustration and motion — plus a `tokens.json` an agent can build from and a `BRAND.md` that actually changes what agents make.

The hard part is not the site. The template does that. The hard part is that **almost nobody can describe the brand they want.** Asked what it should feel like, people say "modern, clean, trustworthy" — which is true of every competitor and instructs nothing. Shown two options, the same person chooses decisively and explains why. So this skill is built to **show rather than ask**, and to ask about consequences rather than mechanisms.

## The three rules that shape everything

**1 · Never ask for the abstraction. Ask for the instance.**
"What are your values?" returns *integrity, innovation, excellence* from everyone. "Tell me about the last time you turned down money" returns a real value, in the only form that is falsifiable. Values are inferred from stories, never from the question "what do you value?"

**2 · Ask about consequences, never mechanisms.**
Not "serif or sans?" but "should they feel they've found something established, or something new?" You do the translating — that is the whole value of the expert layer, and `references/axes.md` is the translation table.

**3 · Never ask a question you could answer with over 70% confidence.**
Assert it instead, with a one-line reason and a free undo. When you are right it costs the user nothing; when you are wrong the correction is better data than an answer would have been, because reacting to a wrong claim is easier than generating a right one.

**Budget: about 20 to 25 minutes in normal mode, four in quick mode.** In normal mode, two questions at the start, two at the end, and everything in between is looking at two things and pointing. Count the cost, not the count: a duel costs a second, a question in words costs a minute, and a question that asks someone to describe a feeling costs the session.

## Two modes

| | Quick | Normal |
|---|---|---|
| User's time | about 4 minutes | 20 to 25 minutes |
| Decisions | 5: three duels, one change, one refusal | about 12 |
| Output | `tokens.json`, `BRAND.md`, `theme.css` | the same, plus the brand site and imagery |
| Status | v0.1.0, a first hypothesis, mostly `assumed` | v1.0.0, provenance per page |

Both write the same files in the same schema, so a quick kit is upgraded later, never redone.

Pick the mode before the first question. If the user or the calling skill named one, use it. If a project is being set up and the user wants to start building, it is quick. Otherwise ask once, with `AskUserQuestion`, giving the time each costs and what each leaves out - it is the only question in this skill about the session itself.

**Quick mode: read `references/quick.md` and follow it instead of the four acts below.** The three rules above and "Showing things" still apply. The rest of this file describes the normal mode.

## Before you start

Check whether `brand/tokens.json` already exists. If it does, this is not the right skill — use `brand-kit-update`. One exception: a kit whose `tokens.json` has `meta.mode: "quick"`, when the user wants the full identity. That is this skill in normal mode, resumed - `references/quick.md` → *Resuming in normal mode*. A `brand/` directory that holds only `audit/` is not a kit: it is the audit described next.

**If `brand/audit/AUDIT.md` exists, read it before the first question**, in both modes. It is the output of the `brand-audit` skill: what this category looks like, counted on real captures. It changes four things, and nothing else:

- **Framing.** Where its section 0 answers one of the two Act 1 questions, state the answer and move on (rule 3). Do not ask what the audit already knows.
- **Tournament.** Add the category duel from its "For brand-kit" section. `references/tournament.md` → *Category duels, when an audit exists*.
- **Swap test.** Use the competitor it names, rather than choosing one.
- **The "Not" list.** Seed `BRAND.md` section 1 from its clichés, then let the session's refusals add to it.

Never launch the audit from here. If there is none and the user has twenty minutes before starting, say once that `brand-audit` exists and what it would add, then carry on either way.

Create a scratch file for the session (in the scratchpad directory, not in the project) and keep three things in it as you go: **verbatim** (their exact words, never paraphrased), the **axis ledger** (six axes, each with a position −2…+2, a confidence 0–1, and whether it came from something they *said* or something they *chose*), and **provenance** (which facts are stated, inferred, or assumed).

Verbatim matters more than it sounds. The dominant failure mode of a model doing this job is regression to the register mean — everything comes out sounding like a Series B homepage. Their own words are the antidote and the only proprietary asset in the room.

## The flow

Four acts. **Two questions, a pile of duels, two more questions, then you build.** Everything the user does is either looking at two things and pointing, or answering something about their own business in one sentence. Nothing else earns a turn.

Ask **one question per turn**, and never ask twice in a row without putting something new on screen.

### Act 1 · Cadrer (2 questions, 2 min)

If you are in a repository, read it first and open with what you already know. Otherwise:

> "On travaille sur quoi, en une phrase ?"
> "C'est pour qui, et ils utilisent quoi aujourd'hui à la place ?"

The "instead of" clause smuggles in the enemy, the category codes and the competitive frame in one answer — and the honest answer is often paper, a spreadsheet or the Notes app, which is worth more than a competitor's name. One follow-up, and only if the alternative is a manual one: **"et qu'est-ce que le papier fait *mieux* ?"** Every item on that list is something to match or to give up on purpose, and it is the cheapest strategy you will ever be handed.

Never open with "tell me about your business", and never open with a question about feeling. The first question teaches the user what kind of conversation this is.

### Act 2 · Regarder (4–8 min, and it decides almost everything)

**Read `references/tournament.md` and run it.** Duels of real, screenshotted sites — two images side by side, one line: *"celui-ci ou celui-là ?"* Six is usually enough. "Aucun des deux" is a real answer and eliminates twice as fast.

**Type, photography, illustration, icons and motion are more duels, not separate acts.** Same mechanic, same question — *which two could be yours, which one is definitely not* — and the same discipline: run a board only while the ledger is genuinely open on it. Where the answer follows from what they already chose with more than 70% confidence, assert it with a reason and a free undo instead. A session that runs every board has stopped listening.

- **Type** — show `assets/type-systems.html`, cut to six or eight systems, set in **their own headline**, big as a headline and small as the 13px product row. `references/typography.md` has the axes, the licensing and the half-lives. Two questions, same as any duel: which two could be yours, which one is definitely not. One question that is not a duel, because it has no visual form and gets forgotten otherwise: **one face everywhere, brand display over system text, or brand site over system app?** Force it before the face is settled, or the site gets the brand face and the app quietly ships system fonts.
- **Photography** — show `assets/photo-styles.html`: one scene re-shot seven ways (documentary, lifestyle, editorial portrait, colour studio, cinematic, flash, still life) plus **none**. Regenerate it on the brand's own moment first if the user agrees to the cost. `references/photography.md` has the board, the recipe the kit has to record, and the two tests every image must pass.
- **Illustration** — show `assets/illustration-styles.html`, the same scene drawn seven ways plus **none** as an eighth card with equal weight, because for most early-stage companies none is the right answer and no library will ever offer it. Often the tournament has already settled this: a user who refused every illustrated and every photographic pair has told you the imagery slot is empty, which means a graphic device has to do that job. Say it out loud — it is a real decision they made by looking, and they will not realise they made it.
- **Icons** — `assets/icon-styles.html`: twelve concepts in seven drawing languages, each also at 16px beside one of the product's own words. Usually asserted from the type and the shape language; run it when the product is icon-heavy or the type is still open. `references/iconography.md`.
- **Motion** — `assets/motion-styles.html`: the same card arriving six ways. Five seconds, one question: *which one moves like you, which one would embarrass you.* `references/visual-system.md` → Motion.

Never let a board be judged in someone else's palette. The photo, icon and motion boards take the brand's colours, face and words through the URL hash; the type board through its JSON block; the illustration board only by regenerating it (`make-samples.py`, which costs money — ask). Each file's comment block shows how.

**Nothing explanatory goes next to a specimen.** Licence, payload, what a system costs and how it ages are said in chat, when asked. A paragraph beside an image means people read the paragraph and pick the best-written one.

Close the act by **reading the universe back in plain words, no axis names, four clauses at most**:

> "Alors si je lis bien : du clair plutôt que du sombre, une typo qui porte la chaleur plutôt que la couleur, peu de choses à l'écran, et une voix qui parle normalement. Si l'un des quatre est faux, dis lequel — sinon je construis là-dessus."

### Act 3 · Montrer (2 questions, 4 min)

Stop asking and build. **Read `references/visual-system.md`** and specify the whole system — palette with roles and ratios, type scale, spacing, radius, graphic device, motion, the photography recipe, the icon spec. It has the reference palettes, the tracking and leading tables, and the list of what can be **defaulted**, so you spend no user attention on craft constants. Two things are yours alone and must not be skipped:

- **The organising principle.** Exactly one, written as *"Even without the logo, our work is recognisable because ______."* Without it there is no system, only assets.
- **The one weird detail.** Every system that looks like a studio made it contains exactly one decision that is slightly strange and completely committed to. One. Two is a style, three is chaos, zero is a template. Write it into the kit as a rule so nobody tidies it away.

Then write **the art direction** — the concept every piece of work is briefed against, three principles, the formula of a single image or layout, and which element carries which job. Nothing new is asked: it is the synthesis of everything chosen so far, and `references/art-direction.md` says where each part comes from. Read the concept back in one sentence the user could repeat to their team.

Then render **one** artefact — one site surface, one product screen, real content, full fidelity — and show it. **There is no three-route presentation in this skill, and adding one back is a regression:** shown three directions, a founder cannot tell what is being judged, says the three look like the same thing, and either stalls or answers about colour. It is not a craft problem. "Which of these worlds is yours" is a designer's question wearing a client's clothes.

Two questions on the rendered thing, both with a negative presupposition, because "do you like it?" has a socially obligatory answer:

> "Qu'est-ce que tu changerais en premier ?"
> "Qu'est-ce que tu ne ferais jamais, même si ça marchait ?"

The second is load-bearing. A platform with no sacrifice cannot generate decisions, and generating decisions is the entire function — ask it until you have three. And **require one genuine negative before locking**: if the user has criticised nothing all session, force it.

When an answer lands on the generic blocklist — *intégrité, innovation, premium, moderne, simple, tout le monde* — do not accept it. `references/discovery.md` has the refuse-the-first-answer loop, and the six tests your positioning has to pass before you are allowed to write it down: swap, reversal, Monday-morning, sacrifice, new-hire, wallpaper.

Two tests you run silently and report, never delegate to the user: the **swap test** — put a competitor's name on the artefact and the positioning; if both still work you have elicited category conventions, not a brand. With an audit, the competitor is the one its "For brand-kit" section names, and its clichés and Avoid decisions are is what the artefact is checked against: an artefact that reproduces three of the category's clichés has failed whatever the swap looks like. And `references/taste.md` **as a gate**: counting typefaces, weights, hues, radius values, accent share, off-scale spacing, plus the five renders. A system that fails it does not go out.

### Act 4 · Écrire

**Read `references/kit.md`, `references/kit-pages.md` and `references/site.md`.**

1. `cp assets/tokens.example.json brand/tokens.json` and replace every value. It is the source of truth: a value is typed once, here, with its `_use` or `_rule` beside it. Match the example's depth, including `art_direction`, `imagery.photography`, `icon` and `motion.principles`.
2. `cp assets/BRAND.example.md brand/BRAND.md` and rewrite it. That file is the quality bar: numbered, imperative, checkable rules under 250 lines.
3. `python3 assets/sync.py brand/` — writes `brand/theme.css` and the core block of `BRAND.md`.
4. `cp -R assets/site brand/site`, `npm install`, then write every page in the brand's own voice (`references/site.md` → *Making a brand's site*). The example is Perch, a fictional hotel-operations company: keep the structure, replace every sentence.
5. **Imagery.** Write a concrete `prompt` on each photography (and illustration) sample in the tokens, show the cost, and on a yes run `python3 assets/imagery.py brand brand/`. Look at every image before it ships; regenerate the ones that fail the any-company test. Mark the photography page `assumed` until a real shoot replaces them. If the user declines, the pages show labelled placeholders — that is fine.
6. `npm run dev` in `brand/site`, open it in the browser pane, and check every page at desktop and phone width, light and dark. Fix what you see before the user sees it.
7. Create `brand/CHANGELOG.md` with the v1.0.0 entry, and append `assets/claude-md-block.md` to the project's `CLAUDE.md`.

Show the user the site. Then tell them plainly what it is and is not. Offer a Vercel **preview** deploy as a next step; do not deploy by reflex (`references/site.md`).

## Be honest about what a session produces

Say this in the kit rather than performing a confidence it has not earned. The 30-minute version is **a well-formed hypothesis**; a six-week engagement produces **a defended position**. What is missing: customer evidence (everything here is founder self-report, systematically optimistic and over-broad on audience), a category audit, so nobody has checked whether the difference is actually the category's wallpaper, and alignment, because half the value of a real process is that twelve people were interviewed and feel authorship.

The category audit is the one of the three that can be had in an afternoon: when `brand/audit/audit.json` has `meta.mode: "deep"`, drop that caveat and cite the audit instead. A flash audit narrows it without removing it; say that the category was looked at in flash mode, on about thirteen brands.

So every kit carries three things, on the home page, not buried:

- **Provenance per page** — `stated` (they said it), `inferred` (you derived it), `assumed` (you filled it; go and check). Assumed pages are visually distinct and counted.
- **"This breaks if…"** — three named conditions that would invalidate it, plus an expiry: the next funding round, the first marketing hire, or 3× revenue.
- **Three validation tasks** they can do in an afternoon.

**Never invent a reason to believe.** If there is no structural proof for the difference, write "no structural reason to believe yet" and give them the three ways to find one. A confident fabricated RTB is the worst thing this skill can produce.

## Showing things

Every *show* turn is a real rendered page, never a description. Build it from `assets/duel.html` for the tournament, use the boards in `assets/` for type, photography, illustration, icons and motion, or write the artefact by hand for Act 3 · Montrer, and put it in front of the user by the first of these that works:

1. **Serve it and open it in the browser pane.** The boards run scripts, load fonts and (for icons) fetch from Iconify, which a `file://` preview may not do. Copy what you show into the scratchpad, run `python3 -m http.server <port> --directory <scratchpad>` in the background, and open `http://localhost:<port>/<board>.html#…` with `preview_start` or `navigate`.
2. Send it with `SendUserFile` and `display: "render"`.
3. Publish it as an Artifact.

Then ask the question **in chat**, with `AskUserQuestion` where the answer space is genuinely small and you can write the options better than the user can write prose. A board may carry its question as a caption so the user knows what to look for, but the answer is taken in the conversation, never in the page — you need it there to act on it.

### The brand board, when it is there

If a tool named `mcp__brand-board__show` is among your tools, the user has the brand-board mod: a pane beside the chat that shows what is decided so far - the palette, a headline in their words, the button shape, what they refused, and how many decisions are left - and repeats it above each question. Call it with the whole current state after every decision and every time the asserted system changes, in both modes, and with `isLive: false` once the kit is written. Leave out what is not decided yet rather than guessing a value to fill the board.

It shows **state**, never a choice. A duel is still two real screenshots in the browser, and the artefact is still a real rendered page: the board's specimen is drawn from one template and only names the kind of typeface, so asking the user to judge the brand on it is the fabricated-board failure `references/tournament.md` describes. If the tool is not there, nothing changes: the session runs exactly as written.

## Language

Follow the user's language in conversation and on the brand site (`meta.site_locale`, page prose in their language, translated token prose in `site/locale.json` — `references/site.md`). Write `BRAND.md` and `tokens.json` in **English** whatever the conversation language, unless the user asks otherwise: they are read by agents and by people who may not share the team's language. If the user wants them in another language, follow them and say so in the maintenance page so later updates stay consistent.

## Files in this skill

- `references/quick.md` — the quick mode: five decisions, what is asserted, what is written, and how the normal mode resumes from it
- `references/tournament.md` — the visual tournament: where the screenshots come from, how to build a duel, and how to read the answers without ever naming an axis
- `references/discovery.md` — the interview: the questions that work, the refuse-the-first-answer loop, provenance, and the tests a positioning must pass
- `references/session.md` — the turn-by-turn script, showing options well, handling "I don't know", and telling a real answer from a polite one
- `references/axes.md` — the translation layer: six axes to concrete design variables, with the derived parameters and the correlation traps
- `references/territories.md` — turning strategy into visual constraint: contrast pairs, reference gathering, and the organising principle
- `references/visual-system.md` — the craft: colour, type, logo, layout, imagery, device, motion, with eight palettes and twelve pairings
- `references/typography.md` — choosing the type system: the four axes, what 2026 actually looks like in free faces, the website/app split, and licensing
- `references/illustration.md` — the seven territories plus none, the three axes, and how to commit to a system rather than a look
- `references/photography.md` — the seven directions plus none, the recipe the kit records, the any-company test, and generating the brand's own samples
- `references/iconography.md` — the seven icon languages, the spec in numbers, the metaphor map, and how a chosen set reaches the site
- `references/art-direction.md` — the concept, principles, formula and hierarchy, and where each comes from in the session
- `references/taste.md` — the gate. Counts, measurements, and the five renders
- `references/kit.md` — the artefact set, the token schema, and what makes a `BRAND.md` that agents actually follow
- `references/kit-pages.md` — each page of the site: purpose, what belongs, what does not, and the page template
- `references/site.md` — the site's mechanics: copying it, the components, running, building, deploying
- `assets/site/` — the brand site to copy (Next.js, static export), filled with a worked example at the expected depth
- `assets/tokens.example.json` — the token schema, fully populated
- `assets/example-assets/` — the worked example's photography, so the example site runs complete
- `assets/BRAND.example.md` — the agent instruction file, at the quality bar
- `assets/duel.html` — the tournament board: two real screenshots side by side, a site name under each, and nothing else
- `assets/type-systems.html` — the same words set in thirty free type systems, each shown as a headline and as a 13px product row, for choosing type
- `assets/illustration-styles.html` — the same scene drawn seven ways plus an eighth card for none, for choosing an illustration language
- `assets/make-samples.py` — redraws the seven territories on a brand's own scene and palette
- `assets/photo-styles.html` — one scene re-shot seven ways plus none, for choosing a photography direction
- `assets/icon-styles.html` — twelve concepts in seven icon languages, at 30px and at 16px beside a word
- `assets/motion-styles.html` — the same card arriving six ways, for choosing a motion temperament
- `assets/imagery.py` — regenerates the photography board on a brand's scene, and generates the brand's own photography and illustration samples from the prompts in `tokens.json`
- `assets/claude-md-block.md` — the block to append to a project's `CLAUDE.md`
- `assets/sync.py` — writes `theme.css` and the `BRAND.md` core block from `tokens.json`
