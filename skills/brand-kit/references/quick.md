# Quick mode

The same method as the full session, cut to what a founder can decide in four minutes at the start of a project. It exists because the alternative is not the full session - it is no brand at all, and an agent inventing a palette on the first screen it builds.

A quick kit is a **first hypothesis that agents can build from today**: real tokens, a short `BRAND.md`, a `theme.css`. No site, no generated imagery, no logo work. It is honest about that, and it is built so the full session can pick it up later without redoing anything.

**If `brand/audit/AUDIT.md` exists, read it first.** Its frame can replace the opening question, its "For brand-kit" section names the competitor for the swap test, and its clichés and Avoid decisions are what the asserted system must not reproduce. Quick mode has no room for a category duel; the audit informs what you assert, and you say so in one clause ("pas d'orange : six de tes huit concurrents en ont").

## Budget

**Five user decisions. Hard stop at six. About four minutes of the user's time.**

| # | Decision | Form |
|---|---|---|
| 1-3 | Three duels | two real screenshots, "celui-ci ou celui-là ?" |
| 4 | The first change | one rendered artefact, "qu'est-ce que tu changerais en premier ?" |
| 5 | The one refusal | "qu'est-ce que tu ne ferais jamais, même si ça marchait ?" |

Everything else is asserted. The three rules of the skill apply harder here, not softer: with five decisions, one spent on a mechanism is a fifth of the session gone.

## Step 0 - Cadrer, usually for free

The two framing questions (what, and for whom instead of what) still have to be answered, but rarely asked: a repository, a `PRODUCT_VISION.md`, or the skill that called this one usually has them. Open with what you know in one line and move on. Ask only what is missing, and never the paper follow-up - there is no time to use the answer.

When `project-setup` calls this mode, it passes the pitch, the audience, the problem and the non-goals from its own interview. Use them as the verbatim; do not re-ask.

## Step 1 - Three duels

`references/tournament.md`, unchanged in everything but length: real screenshots, two at a time, nothing next to them, "aucun des deux" is an answer. With three duels instead of six:

- **Duel 1 is the widest gap you can build** in the product's category: light, ruled and quiet against dark, saturated and loud. It orients three axes at once.
- **Duels 2 and 3 are chosen against the ledger**, each on the axis that is still most open. Never spend a duel confirming something the first one settled.
- **No "en un mot, pourquoi ?"**. It costs a decision.
- A "neither" counts as a decision and is worth it. Two in a row: stop duelling, assert, and let the artefact carry the correction.

Do not fabricate specimens to save time. If no screenshot source is available, three duels from real sites opened in the browser take two minutes to prepare; do that, or tell the user the quick mode needs a moment before the first question.

Close with the universe read back in plain words, four clauses at most, free undo. It is not a question: carry on unless they object.

## Step 2 - Assert the whole system

No type board, no photography, illustration, icon or motion board. Derive, through `references/axes.md` and the defaults at the end of `references/visual-system.md`:

- **Colour** - one hue plus neutrals unless a duel said otherwise. Roles and ratios, light and dark, contrast checked.
- **Type** - one pairing from `references/typography.md`, free faces only. Say which and why in one line. The site/app split is decided for them: one family everywhere unless the duels pointed at a display face.
- **Space, radius, shadow, motion, layout** - the defaults, bent by the ledger.
- **Icons** - asserted from the type (Lucide, Phosphor or Radix).
- **Imagery** - `none` for both photography and illustration, marked `assumed`. A graphic device does that job until the full session decides otherwise.
- **Voice** - from their own words in the framing answers: person, sentence length, three "we write / not like this" pairs. Never from adjectives.

Two things are still yours and still not optional, because without them the kit is a template: **the organising principle**, in one sentence, and **the one weird detail**.

Run `references/taste.md` as the gate. It takes no user time.

## Step 3 - One artefact, two questions

Render one page - a landing hero and one product row, the user's real words, full fidelity - and show it the usual way (`SKILL.md`, "Showing things"). Then the two questions with a negative presupposition, one per turn. Apply the first answer and show it again without asking anything. The second answer goes into the kit as a permanent boundary.

If the user has criticised nothing by now, the second question is the gate: do not write the kit without one refusal.

## Step 4 - Write the kit

```
brand/
├── tokens.json     full schema where it was decided; see below
├── BRAND.md        80-140 lines
├── theme.css       from sync.py
├── session.md      the scratch file: verbatim, ledger, refusals, provenance
└── CHANGELOG.md    v0.1.0
```

- `tokens.json` - `meta`, `color`, `type`, `space`, `radius`, `shadow`, `motion`, `layout`, `voice` at the example's depth. `icon` with the library and spec. `messaging` with `one_liner` and `positioning` only. `art_direction` with the concept and the weird detail. `logo` and `imagery` present but short, marked `assumed`. Add `"mode": "quick"` to `meta` and version it `0.1.0`: a quick kit is not a v1.
- `BRAND.md` - same form as `assets/BRAND.example.md`: numbered, imperative, checkable. Drop the `human_kit` line and the "do not read `site/`" sentence; there is no site. Near the top, one line: *"Quick kit (v0.1.0): a first hypothesis from a four-minute session. Run the brand-kit skill in normal mode to turn it into a full identity."*
- `python3 assets/sync.py brand/` - it needs no site.
- `session.md` - copy the scratch file in. It is what lets the full session resume instead of restart.
- Append `assets/claude-md-block.md` to the project's `CLAUDE.md`, without the two lines about `brand/site/`.

**Provenance is blunt in a quick kit.** `stated` for what came from their words, `inferred` for what three duels support, `assumed` for everything else - which is most of it. Write `breaks_if` and `validate` as in any kit, and say it in chat in one sentence when you hand it over: what was decided by them, what was decided for them, and that the second list is long.

## What the quick mode never does

- generate imagery or spend money;
- build or deploy the site;
- draw a logo (a wordmark set in the display face is the placeholder, marked `assumed`);
- run a board to "just check" - a board is a decision, and the budget is five.

## Resuming in normal mode

When `brand/tokens.json` has `meta.mode: "quick"` and the user wants the full identity, this is still `brand-kit`, not `brand-kit-update`. Read `brand/session.md`, restate the universe in one line, and enter the normal flow at Act 2 with only what is open:

1. the duels the ledger still needs (usually three more);
2. the boards that were asserted - type first, then photography, illustration, icons, motion - each only while genuinely open;
3. Act 3 on the existing artefact, then Act 4 in full: the site, the imagery, the rest of the tokens.

Keep every refusal already recorded. On completion, remove `meta.mode`, bump to `1.0.0`, and write the changelog entry as an upgrade, not a rewrite.
