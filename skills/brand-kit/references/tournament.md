# The visual tournament

How the user's universe gets decided by looking, in about four minutes, without a single abstract question.

## Why this replaced the sliders

Two things failed in practice, and both failed for the same reason.

**Sliders and archetypes ask the user to name a preference they have never had to name.** "Warm and personal" versus "precise but human" is studio vocabulary. The founder answers something, the answer is a prior rather than a decision, and everything downstream rests on a word they picked to be helpful.

**Fabricated comparison boards are worse than they look.** A board that renders two or three mini-artefacts from the same template varies colour, type and radius and *nothing else* — same layout, same blocks, same spacing. The difference the designer thinks they are showing lives in the accompanying paragraph, not in the pixels. The user says, correctly, "these all look like the same thing", and then cannot answer "which is furthest from you". Asking someone to judge a difference you described but did not draw is the single most common way this skill wastes a session.

Real sites do not have that problem. Two real homepages differ in layout, density, photography, type, colour, voice and confidence *all at once*, which is exactly why a non-designer can rank them in one second. You give up clean measurement and get a real answer. Take the real answer.

**The rule this generalises to: never ask the user to judge something you have not shown, and never ask them to judge a difference that only exists in your text.**

## Where the images come from

Mobbin, through its MCP server, when it is connected:

- `search_sections(query)` — website sections. The workhorse. Ask for hero sections, pricing pages, feature sections.
- `search_screens(query, platform: "ios" | "web")` — product screens, for the duels about the *inside* of the app rather than the site.
- Each result carries `site_name`, a `mobbin_url` to cite, and an `image_url` that is high-resolution and **expires after 30 days**.

Two consequences for the kit: **download every image you intend to keep** rather than hotlinking it, and cite the `mobbin_url` as a markdown link whenever you name a site in chat, so the user can open it.

**Mobbin's own pages are closed to automated browsers.** `mobbin.com/discover/sites/popular` and its neighbours answer `403` to the in-app browser, so there is no scraping path to the popularity ranking. Go through the MCP server, or through the user's own logged-in Chrome if they ask for that exact page.

### Reading the popularity ranking from the user's own browser

The MCP server searches the library; it does not expose the ranking. `mobbin.com/discover/sites/popular` holds it, and it is worth having, because "the sites people are looking at this month" is a better pool for a tournament than anything a semantic query returns.

It is only reachable through the user's own logged-in Chrome, and three things will waste your time if you do not know them:

- **The site names are in `aria-label` on the card's anchor, not in its text.** `textContent` is empty and `innerText` is empty. Collect `a[aria-label]` and filter out the chrome — the nav, the category and style filters, "Play video", "Scroll to top".
- **The list is virtualised**, so cards unmount as you scroll past them. Collect *as you go*, into an accumulator on `window`, or you will end up with whatever thirty cards happen to be mounted.
- **Chunk the scrolling across several calls.** A single script that scrolls the whole page hits the 45-second CDP timeout and returns nothing. Seven or eight viewport-scrolls per call, holding state on `window`, gets there in three calls.

`href` values come back redacted by the extension's safety filter, so build the duel from the name and fetch the image through the MCP.

A snapshot of that ranking, most popular first, as a starting pool — it moves, so re-read it rather than trusting this list: Vercel, Webflow, Lassie, Until, Voiceflow, Customer.io, OFF+BRAND, MOUTHWASH Studio, Apollo, Biograph, MetaMask, Speakeasy, Visitors, Fourmula AI, Ditto, Swap, Stripe, Flighty, Ada, Linear, Aave, Acctual, Popcorn, Ease, Notion, Spade, Clay, Retool, Chronicle, Wispr Flow. Further down: Square, Craft, Apple, Cash App, ElevenLabs, Mixpanel, incident.io, Claude, Framer, Intercom, Headspace, COLLINS, Slush.

Note what that pool is and is not. It is what the design community is looking at, which means it is **fashion-weighted and agency-heavy** — portfolio studios like OFF+BRAND, MOUTHWASH and COLLINS sit next to Stripe and Notion. That is useful for finding the ceiling of a user's taste and useless as a category reference. Mix it: a duel between two studio sites tells you about appetite for risk, a duel between two product sites tells you where they actually live.

If the Mobbin server is not connected, say so plainly and fall back to the browser: open six to eight real sites you can name, screenshot each, and run the identical tournament. Do not fall back to fabricating specimens — that is the failure this file exists to prevent.

## How to build a duel

Build it from `assets/duel.html`: fill its JSON block, put it in the scratchpad directory, and show it. Download each `image_url` to a local file first — the URL expires after 30 days and a board that dies in a month is not a kit asset.

**Two images, side by side, nothing else.** The site name small underneath; no description, no annotation, no "this one says you are trustworthy". A paragraph next to a specimen turns the exercise into reading, and people pick the best-written description.

**Pick pairs that are far apart on everything.** Not a clean isolation of one variable — a wide gap. You are not measuring, you are getting an orientation you can check later. Two dark technical sites differ too little to produce a fast answer.

**Hold the category constant, not the product.** Both sides should be roughly the same kind of thing (two landing pages, or two app screens), or the user judges the category rather than the design.

**Six duels, adaptive.** The first two are wide open and orient. Each subsequent pair is chosen against whatever is still uncertain in the ledger — if the first two answers both leaned warm, stop spending duels on temperature and spend them on density, or on how much personality the type carries.

**Offer "neither" as a real third option.** It looks like an escape hatch and it is the opposite: a refusal eliminates *two* worlds in one second, where a choice only ranks two. In testing, half the answers came back "aucun des deux", and the session moved faster for it — it is how you learn that illustrated characters, precious editorial line-work, saturated colour fields, stark black-on-white and documentary photography of people are all out, in three clicks. Take it at face value, do not ask why, and re-pair against what is left.

**Watch for "I like it but I would not want it."** The most valuable answer a duel produces, and the binary hides it. A founder drawn to a glossy consumer brand who immediately says *"mais je ne voudrais pas ça"* has separated **attraction from fit** — that distinction is the thing a moodboard normally takes three rounds to surface. When it appears, write both halves down: the attraction tells you the ceiling of their taste, the refusal tells you the brief.

**When a whole area gets refused, that is a finding, not a gap.** Six duels that reject every photograph of a person *and* every illustration leave the imagery slot empty — which in identity terms means a graphic device has to do that job. Say it out loud, because it is a real decision the user made by looking, and they will not realise they made it.

**Ask nothing but the choice.** *"Celui-ci ou celui-là ?"* — one line. On the third duel only, add *"en un mot, pourquoi ?"*, because by then the user has a vocabulary and one word of theirs is worth a paragraph of yours. Any earlier and they have nothing to say; every time and it becomes homework.

**And have the downgrade ready, because that question fails often.** "Je sais pas trop" is the normal answer, and repeating or rephrasing it in the open produces nothing. Downgrade in one step to a forced choice **inside the artefact they already picked**: name three things that are actually on that page — the serif, the colour, the space — and ask which one they would miss most if it were removed. It answers instantly, and it is a better answer than the open question would have given, because it is anchored to something in front of them. It also tells you which layer carries the warmth, which sets the saturation budget for the whole palette.

**Never state the axis, during or after.** The user should finish the tournament believing they looked at twelve websites, not that they filled in a questionnaire wearing a costume.

## Reading the answers

Each choice moves the ledger. The mapping is not subtle, and it does not need to be:

| What they chose | What it moves |
|---|---|
| Dark, photographic, product-as-object | Premium ↑, Cool ↑, Expressive ↑ |
| Light, ruled, tabular, mono numerals | Minimal ↑, Serious ↑, Classic ↑ |
| Rounded, saturated, illustrated, bold sans | Playful ↑, Accessible ↑, Contemporary ↑ |
| Serif display over a plain text face | Classic ↑, Human ↑, and *warmth carried by type rather than by colour* |
| Dense dashboards and real data on the page | Corporate ↑, Minimal ↑, Serious ↑ |
| A single sentence, huge, little else | Human ↑, Minimal ↑, Confident — voice-led |

Two readings matter more than the table.

**Watch for the reason that contradicts your own label.** A user who picks the sober, ruled, serif route and explains it with *"the serif gives more emotion, it humanises"* has just told you something you did not know: for them warmth arrives through typography, not through round corners and terracotta. That sentence is worth more than the choice itself, and it overrules your reading of the same artefact. Write it verbatim.

**Watch for choices made on content.** If they say "I prefer this one, there are graphs", they judged the product, not the universe. Re-pair on the same content type and run that duel again.

## Closing the tournament

State the universe you deduced in **plain words, no axis names, with a free undo**:

> "Alors si je lis bien : du clair plutôt que du sombre, une typo qui porte la chaleur plutôt que la couleur, peu de choses à l'écran, et une voix qui parle normalement. Si l'un des quatre est faux, dis lequel."

Wrong is fine here and cheap to fix — reacting to a wrong claim is easier than generating a right one, and a correction at this point is better data than an answer would have been.

## What still has to be asked in words

The tournament settles the *universe*. It cannot settle meaning, and meaning is what the user owns:

- who this is for, and what they use instead today
- what the product must never do, even if it worked
- what the nearest thing does *better*, and what will have to be given up

Those three are concrete, they are about the user's own business, and in practice people answer them fast and well. Keep them. Everything that asked the user to describe a feeling, rank an adjective or pick a personality is gone.

## Category duels, when an audit exists

If `brand/audit/AUDIT.md` exists, its section 5 names two images: the most typical home page of the category and the most deviant one, both from the user's real competitors.

This does not replace anything above. Competitors resemble each other by construction, which is exactly what makes them poor material for the main duels, where the two sides must differ on everything. The Mobbin duels stay as they are.

The category duel measures one thing the others cannot: **whether the user wants to stand inside their category or beside it.** Run it once, after the third or fourth ordinary duel, on the same board and with the same line:

> "Celui-ci ou celui-là ?"

Put the site's name under each, as always. Do not say that one is typical and the other is not; that is the answer.

Reading it:

- **The deviant side**: the user is ready to leave the category's look. The audit's open territories are live options, and the clichés in its section 2 go straight into the refusals.
- **The typical side**: they want to be recognised as one of the category first. Keep every legibility code, break one cliché rather than four, and prefer the audit's low-risk territory.
- **Neither**: the strongest signal. Neither the category nor its current dissident is theirs. Look at where the audit's aspirational brands sit.

If the audit has a second pair worth showing (two direct competitors in different quadrants of its map), one more category duel is allowed. Never more than two: past that the session is comparing competitors, which is the audit's job and is already done.

A category duel moves the ledger like any other, and it is recorded as *chosen*, not *said*.

