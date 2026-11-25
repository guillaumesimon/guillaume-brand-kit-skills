# Typography

Most people choose a typeface on a headline. That is backwards, in the same way choosing illustration by subject is backwards.

**The words say what you do. The type says who you are** — and then it says it 40,000 more times, at 13px, in a table nobody art-directed. A face is picked in ten seconds on a 72px hero and then lived in for three years in a settings screen. The two are barely the same decision.

So the question is never "which font is nice?" It is **"which system can carry both surfaces, for as long as we need it to, with the people we actually have?"**

The craft constants — scales, tracking, leading, measure, the weight ladder — are in `references/visual-system.md` under *Typography*, and they are not brand choices. This file is about the choice itself.

## Show, do not ask

Open `assets/type-systems.html`. It sets **the same words in every system**, twice per card: once as a 36px headline, once as a small row with a number in it.

**The page is a wall of type and nothing else** — no axes, no explanation, no prose beside the specimens. That is deliberate and it must stay that way. The moment there is a paragraph next to a typeface, people read the paragraph and choose the system with the best description. Everything you might want to *say* about a system — what it costs, what it ships as, how it ages, which licence — is in the JSON block of that file and in this document. **Say it in chat, when they ask.** Never put it back on the page.

Three deliberate choices in how the board is built:

**The words are held constant.** Every foundry does the opposite: each specimen shows different copy, because they are selling range. That is the wrong shape for *choosing* — with the words varying, people compare sentences instead of systems.

**Every card shows both surfaces.** A high-contrast serif that is magnificent at 36px contributes nothing at 13px; a face with no tabular figures wrecks a dashboard. Putting the small row directly under the headline means this is discovered in the session rather than in month three.

**Nothing on a card is an argument.** Number, name, source. The user is choosing with their eyes.

### The path, in three steps

Keep it this short. It is four minutes, not fifteen.

1. **Prepare, then show.** Put the brand palette into `palette`, cut `shortlist` to six or eight off the axis ledger, and set `words` to the company's own headline — or type it into the two fields at the top of the page. A face chosen on a stranger's headline is chosen on a stranger's word lengths. Then open the page and say one sentence: *"Same words, eight systems. The big line is your site, the small line is your app."*
2. **Two questions, in chat.** *"Which two could be yours?"* — then — *"Which one is definitely not?"* Elimination after a shortlist is cheaper and more diagnostic than asking for a favourite. Use `AskUserQuestion` with the system names as options.
3. **One question, in chat.** The website/app pattern, below. Then stop asking and specify the rest yourself.

Only now, if the user asks "why that one?" or "what does it cost?", give them the `costs` / `ship` / `dates` lines from the JSON. Answering before they ask turns a four-minute choice into a lecture.

When trimming the shortlist, **never put two neutral grotesks on the same board** — Inter, Uncut Sans, Geist, Google Sans Flex and Satoshi read as one card shown five times and waste four slots. One neutral, then spend the rest on genuinely different ideas.

## The three sources

The board loads from three places, one stylesheet per family, only for the shortlist — so an unshown system costs nothing and a bad spec breaks one card rather than the page. A system declares Google families in `fonts` and anything else as full stylesheet URLs in `cdn`.

| Source | What it is | Licence | Use it for |
|---|---|---|---|
| **Google Fonts** | ~1,950 families, ~550 of them variable. One CDN, no build step | SIL OFL 1.1 | The default. Reach for anything else only when Google Fonts does not have the face |
| **Fontshare** | The Indian Type Foundry's free library, ~100 families, mostly ITF originals. **This is where the trendy display faces are** — Clash Display, Cabinet Grotesk, Zodiak, Sentient, Gambarino, Satoshi, Switzer | **ITF Free Font Licence — free for commercial use but *not* OFL**, with its own redistribution terms | Display faces with character that Google Fonts has no equivalent of. Read the licence before bundling into an app |
| **Fontsource** | ~2,100 families as versioned npm packages and a jsDelivr CDN. Mirrors all of Google Fonts, **plus ~120 open-source families Google does not carry** — Uncut Sans, Open Runde, Bluu Next, Redaction, Apfel Grotezk, Monaspace, Commit Mono, iA Writer, OpenDyslexic | Per family, almost all SIL OFL 1.1 | Two jobs: reaching the non-Google open-source faces, and **self-hosting** |

**Fontsource is the answer to three questions the other two cannot answer**, and this is why it belongs in the kit rather than just on the board:

- *"How do we stop calling Google's CDN?"* — a real requirement for some European teams, since the request carries the visitor's IP. `npm i @fontsource-variable/inter` and the font ships from your own origin.
- *"How do we bundle this in the app?"* — the npm package contains the actual `.woff2` and `.ttf` files, versioned, which is what a native build needs.
- *"How do we pin the version?"* — Google's CDN silently updates a face. A pinned npm version does not, which matters once a design system depends on specific metrics.

URL shapes, all verified:

```
Google Fonts   https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap
Fontshare      https://api.fontshare.com/v2/css?f[]=clash-display@400,500,700&display=swap
Fontsource     https://cdn.jsdelivr.net/fontsource/css/uncut-sans@latest/latin.min.css
```

Two things that will bite: Google Fonts returns **400 for the whole request** if any axis spec is wrong, and axis names must be sorted lowercase-alphabetical then uppercase-alphabetical (`opsz,wght,SOFT,WONK`). And on Fontsource, `latin.min.css` carries **every weight** of a family while `index.min.css` carries only 400 — use `latin.min.css`.

## The four axes

**1 · Register — systematic and invisible ↔ characterful and spoken.**
Inter and the system stack sit at the invisible end; they will never be wrong and never be remembered. Fraunces, Young Serif, Bricolage and Archivo Expanded are heard. This axis has a conservation law: distinctiveness declined here must be paid for in colour, layout or the graphic device. A brand with a neutral face, a neutral palette and no device has no identity, only competence.

**2 · Surface — dense product UI ↔ display-led marketing.**
A table on every screen wants a neutral workhorse with tabular figures and a large x-height. A site that is one statement per section can carry a display serif. Most companies are both, which is what the platform split below is for.

**3 · Half-life — current now ↔ invisible for a decade.**
Fashion is a real axis and it is not the enemy. Looking like 2026 is worth money if you are selling to people who can tell, and a founder who takes the invisible option on every axis builds an invisible brand. The question is only *where* the fashion sits. On the **display face** it is cheap: restating it later is one line in `tokens.json` and a new hero. In the **text face** it is expensive: it is in every screen, every PDF, every email and the app bundle, and changing it is a major version.

**4 · What you can actually ship.**
The honest axis, and the one no font library puts on the page. Ask directly:

> *"Who bundles this into the iOS build — and what happens on Android, in an email, in a PDF, and in the first language you have no glyphs for?"*

If the answer is nobody, the shortlist is a Google Fonts variable family or the system stack. Everything else becomes a broken fallback chain within a year.

## What 2026 actually looks like

Seven movements are running at once. Each is given here with the **free** face that does it properly, which of the three sources it comes from, and what it costs you.

| Movement | What it is | The free face for it | The cost |
|---|---|---|---|
| **Perfectly imperfect** | The reaction against machine-smooth design: wobble, irregularity, visible hand. Reads as *a person made this* | **Bricolage Grotesque** (Google, display *and* text, one file) · **Winky Sans** (Google, display only, much louder) | The irregularity is the point and the expiry date at once. In a text face it is very expensive to undo |
| **Funky curvy serifs** | Bouncy, soft-cornered, bracketed slab terminals. Warm, made, slightly seventies | **Young Serif** (Google) · **Gambarino** (Fontshare, stranger and more hand-cut) | Both are one weight, upright, display only. Check the company name set in Gambarino before committing — some words set badly |
| **Mutant heritage** | Classical faces hacked, degraded or pushed into layouts they were never drawn for | **Redaction** (Fontsource — a classical face deliberately decayed, at seven levels) · **Bluu Next** (Fontsource, Velvetyne) · **Bodoni Moda** (Google, real `opsz`) | Redaction has one voice and cannot be quiet. Bodoni's hairlines vanish on dark, on low-density screens and on uncoated stock |
| **Expressive variable axes** | Faces shipping non-standard axes — `SOFT`, `WONK`, `CASUAL` — so one file spans refined to strange | **Fraunces** (`opsz, wght, SOFT, WONK`) · **Bricolage** (`opsz, wdth, wght`) — both Google | Two configurations of one face to maintain, because the quirk must be dialled off below ~24px |
| **Typographic maximalism** | Type as the image. Width extremes, very large sizes, no photography needed | **Clash Display** (Fontshare — ultra-wide at heavy weights, the defining free display face of the mid-twenties) · **Archivo** (Google, `wdth 62–125`) | Needs room and breaks first on a phone. A brand that shouts on every screen is heard on none of them |
| **Soft geometric** | Rounded terminals, generous curves, friendly without whimsy | **Open Runde** (Fontsource — Inter's skeleton with every terminal rounded) · **Funnel Display** (Google) | Rounded is a ceiling as well as a floor: it cannot do austere and it cannot do expensive |
| **ITC revival / tight-fit seventies** | Tight-set, high-x-height seventies display faces | **Clash Grotesk** (Fontshare) gets closest. Nothing free really nails it | This is the one movement worth paying for, or skipping. Say so rather than substituting something that only rhymes with it |

Two things happening underneath all of them:

**Variable fonts stopped being optional.** One variable file at 100–200 kB replaces four to eight statics at 400–800 kB, and it is now how the good free faces ship. Prefer one variable file over five statics, always — and request only the axes you use, because Google Fonts serves an instance subset.

**The free tier caught up.** This is genuinely new, and it changes the advice. Everything on the board is free for commercial use, and several of them beat what you could licence five years ago. Two notable recent additions: **Google Sans Flex** (opened under the OFL in November 2025 — Google's own brand sans, with weight and width axes, previously unlicensable) and **Inclusive Sans** (Olivia King, 2025 — drawn from legibility research, with a documented, citable accessibility story that is itself a brand position for healthcare, government and education).

**Say the fashion cost out loud rather than steering quietly.** Two faces are almost always chosen without it being said: **Instrument Serif**, which is the most copied look of 2024–26 and now arrives carrying associations the user did not choose, and **Winky Sans** and its relatives, which cannot carry bad news — an outage page or a price rise set in a wobbly hand reads as flippant. Both are still legitimate choices. Neither should be made silently.

## The website and the app are two decisions

The user's app is not a smaller website, and this is where type systems quietly fall apart. **Force this decision in the session**, before the face is picked. Left undecided it resolves itself badly: the site gets the brand face, the app ships system fonts because nobody wanted to own font loading, and within a year they read as two companies.

| Pattern | What it means | Cost | Right when |
|---|---|---|---|
| **One face everywhere** | The brand face is bundled into the app and used for every label, field and row | You own font loading, Dynamic Type scaling, the fallback chain, and every language you have no glyphs for | The brand *is* the product — consumer, media, design-led, with someone to maintain it |
| **Brand display, system text** | Brand face for headlines, empty states, onboarding. Platform face for everything functional | One rule to hold: the brand face never appears below 24px in the app | **The majority answer.** The only one that keeps Dynamic Type and native rendering working for free — and the cheapest place to put a trend |
| **Brand on the site, system in the app** | The site carries the whole system; the app uses platform defaults and is held together by colour, spacing and the device | The app carries no typographic identity, so everything else must | The app is a daily tool for people who are no longer being sold to |

Four native facts that decide this more often than taste does:

- **Dynamic Type and its Android equivalent are accessibility features, not preferences.** A bundled face has to implement the scaling ladder by hand, and teams routinely ship it broken. The system face gets it right for free.
- **iOS and Android both support variable fonts**, but the tooling is worse than on the web and named instances are usually safer than live axis interpolation.
- **Every bundled face adds to app size** and needs a licence that permits embedding — which is a different clause from the one that permits web use.
- **The system face is not a failure state.** SF Pro and Roboto are excellent, free, already installed, hinted for their own screens, and cover more languages than anything you will bundle.

## Licensing, honestly

- **SIL OFL 1.1** — everything on the board except the Fontshare cards. Web use, app bundling, modification and redistribution all permitted; the only real constraint is that a modified version may not keep the original's reserved name. **Default to this.**
- **ITF Free Font Licence** (everything from Fontshare) — genuinely free for commercial use, genuinely good, and *not* OFL. It has its own redistribution terms, which is a different question from whether you may use it on a website. **Read them before bundling into an app**, and write "ITF licence, not OFL" next to the face in the kit rather than writing "free" and leaving someone to find out.
- **Commercial** — the upgrade path, worth naming with a trigger rather than pretending it is not there. `references/visual-system.md` lists the paid face each pairing is reaching for. A budget and a trigger ("after the seed round") beats a vague aspiration.

Whichever it is, **the kit records the source and the licence next to the face**, because "where does the next engineer get this file, and what may they do with it?" is the question that actually gets asked. A typography page showing a specimen without that is decoration.

## Commit to a system, not a favourite

- **One family unless you have a reason.** One excellent family across a wide weight and optical-size range beats a mediocre pair almost every time. Take a second only for a genuine editorial voice, or a mono doing a named job.
- **Three weights.** 400/500/600, or 400/600/700. 500 is the most under-used weight and the one that makes interfaces look designed. Never synthesise a weight or an italic — faux bold is an immediate tell.
- **Never more than two families and five font files on a v1.** Subset to the scripts you use, `font-display: swap`, preload the two most-used weights.
- **Check the numerals before you commit.** Tabular lining for data, oldstyle for editorial. If the display face has awkward figures, numbers are never set in it — and say that as a rule, because someone will try.
- **One rule about where each face may appear.** Not "Fraunces is our display face" but "Fraunces is never used below 1.375rem and never at weight 700". The first is a label; the second is auditable.

## What to write into the kit

In `tokens.json`, under `type`, alongside `family`, `scale` and `role`:

```json
"family": {
  "display": {
    "stack": "'Fraunces', 'Iowan Old Style', Georgia, serif",
    "source": "Google Fonts",
    "delivery": "@fontsource-variable/fraunces, self-hosted — no third-party CDN call",
    "license": "SIL OFL 1.1"
  }
},
"platform": {
  "pattern": "brand-display-system-text",
  "web": "Both brand families. Display above 24px only; text family everywhere else.",
  "ios": "Fraunces bundled for display above 24px. SF Pro for all UI — keeps Dynamic Type.",
  "android": "Fraunces bundled for display above 24px. Roboto for all UI.",
  "email_pdf": "System serif and sans. Never a webfont — it will not load.",
  "_rule": "The brand face never appears below 24px in a native app. If a screen needs character below that, it comes from colour or spacing, not from a second face."
}
```

The families, fallbacks and licences reach `BRAND.md` → Typography through `sync.py` (`type.family`; `license_verified` is `true` only once the user has confirmed the licence covers their use). What you write by hand is one sentence per role in the prose, and one checkable rule in that section. Not "our typography is modern and clean", that is unauditable and will be ignored. Something like:

```yaml
rules:
  - verdict: dont
    rule: Never set Fraunces below 1.375rem, at weight 700, or for numbers in tables and metrics.
    exception: none
```

The sizes, weights and the web/app split are interface decisions: they go in `DESIGN.md` → Typography ("In the iOS and Android apps, Fraunces appears above 24px only and all UI is the platform face, so Dynamic Type keeps working").

If the answer is the system stack, the rule is shorter and just as useful:

```yaml
rules:
  - verdict: dont
    rule: Ship no webfont. Hierarchy comes from size, weight and space, never from a second family.
    exception: none
```
