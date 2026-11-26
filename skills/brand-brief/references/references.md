# The reference landscape

The pool of real brands the founder will react to. It is built for this project before any taste is asked, and it is not an audit: it exists to provoke precise reactions, not to describe a market.

## The four circles

| Circle | Role | For a practice-management tool for physiotherapists |
|---|---|---|
| `direct` | the codes of the category, and whether they want to stand in it | Doctolib, Maiia, Jane |
| `adjacent` | neighbouring categories the same buyer already uses | Alan, Qonto, Pennylane |
| `analogous` | another industry that solved the same problem (making a chore approachable, earning trust fast) | Notion, Linear, Mailchimp |
| `aspirational` | an expressive or emotional ambition, far from the sector | Headspace, Oatly, Aesop |

The right-hand column is an illustration, not a starter list. Find the brands that matter for this market, this country and this buyer.

Counts for a session: 3 or 4 direct, 3 or 4 adjacent, 4 to 6 analogous, 4 to 6 aspirational, plus everything the founder named. About sixteen in the pool, of which ten to fourteen are shown. More is collecting.

**Every brand the founder cites goes in**, tagged `founder_cited: true`, whatever you think of it. Brands they dread go in too: an anti-reference shown beside others tells you where the limit is.

## The reference card

One entry of `references` in `brief.json`:

```json
{
  "id": "mailchimp",
  "name": "Mailchimp",
  "circle": "analogous",
  "url": "https://mailchimp.com",
  "shot_url": "https://mailchimp.com/about/",
  "image_url": null,
  "kind": "home page",
  "consulted": "2026-11-26",
  "why": "Made a complicated professional chore approachable.",
  "hypothesis": "How much humour can a work tool carry?",
  "limits": "A marketing audience, not shift workers.",
  "founder_cited": false
}
```

- `id`: lowercase, no spaces; it names the image file.
- `url`: the source, always. A reference nobody can open is an invention, and `check.mjs` refuses it.
- `image_url`: a direct picture, when the best expression of the brand is not its home page: a campaign, packaging, a press image, a case-study picture. Tried first.
- `shot_url`: the page to capture when it is not `url`.
- `kind`: what the image is. A round compares like with like.
- `why`, `hypothesis`, `limits`: why it is relevant here, what showing it should teach, and where the comparison stops. A reference with no hypothesis is decoration; take it out.

`fetch.mjs` adds `asset` and `capture`; a round adds `verdict`, `liked_attributes`, `rejected_attributes`.

## The scouts

One subagent per circle, in parallel, in the background while the interview continues. Without subagents, do the four searches yourself, in series.

Prompt, to fill in:

```
You are scouting reference brands for a brand discovery. You return candidates; you do not judge taste.

Project: <product in one sentence>. Buyer: <who>. Market: <country, language>.
Used today instead: <alternative>. What the founder has said so far: <three lines, verbatim where possible>.

Your circle: <direct | adjacent | analogous | aspirational>, defined as: <definition from the table>.
Find <n> real brands for this circle that the founder is likely to know or will read at a glance.
For analogous and aspirational: each brand must be there for a reason you can state in one sentence
about THIS project. No brand chosen because it is famous or well designed.

For each, return JSON:
{ "id", "name", "circle", "url", "shot_url" (or null), "image_url" (or null), "kind",
  "why", "hypothesis" (what reaction to it would teach us), "limits" }

Image rules:
- Use real, verifiable sources: the brand's own site, its brand guidelines, an agency case study.
- Prefer the page or picture where the brand is most itself: a campaign, a product page, packaging,
  an about page. A home page that is a carousel of promotions shows the sales calendar, not the brand.
- If you give image_url, open it and check it is a real picture of that brand, large enough to read.
- Never invent a URL. If you cannot find a usable image, return the brand with both null and say so.

Write the JSON array to <path>. Reply with one line per brand: name, and the one-sentence why.
```

Merge the four files into `references`, remove duplicates, cut to the counts, and check that each `why` is about this project. Then fetch.

## Where images come from

In this order:

1. **The Mobbin connector**, when it is connected: `search_sections` for website sections, `search_screens` for product screens. High resolution and already clean. Its `image_url` expires after thirty days: `fetch.mjs` downloads it, never hotlink it. Cite the `mobbin_url` as the source.
2. **A direct picture** from the brand's press kit, brand guidelines or a case study: `image_url`.
3. **A capture of the page**: `url` or `shot_url`, by Playwright.

```bash
node assets/fetch.mjs $BRIEF                         # everything that has no image yet
node assets/fetch.mjs $BRIEF --only mews,alan --force
node assets/fetch.mjs $BRIEF --reject mews "the hero is a rotating promotion"
```

What the script does to a page: sets the market's locale, waits for it to settle, clicks the consent button in the page or its frames, hides what still sits on top (modals, cookie bars, region pickers, chat bubbles, newsletter pop-ups), and leaves the site's own header alone. It reports a bot challenge as `blocked`, and a maintenance, error or empty page as `failed`. It never tries to defeat a block: a site that refuses the visit is recorded as such, and you look for a picture the brand publishes elsewhere.

## Looking at the contact sheet

The script writes `evidence/sheet-1.webp` (twelve images per sheet), each image labelled with its id and what was done to it. **Open every sheet and look at every image.** No heuristic replaces this.

Reject an image when:

- a banner, a pop-up, a chat bubble or a cookie wall is still visible;
- the page is a loading state, a skeleton, a video's first black frame, or mostly empty;
- the first screen is a seasonal promotion, a sale banner or a carousel slide that says nothing of the brand;
- the brand cannot be read: no name, no recognisable sign, a generic stock photograph;
- it is in the wrong language or region for this founder, when that changes what they see;
- it is plainly out of date.

For each rejected image, try once more with a better source (`shot_url` to an about or product page, or an `image_url`), then drop the reference. Ten good images beat fourteen with four that mislead. A reference with no usable image is never replaced by a description on a board.

Do not show only logos, and do not show only home pages. A brand is recognised by a campaign, a pack, an interface, a way of setting type: pick the support where each one is most itself, and keep supports comparable inside a duel.

## What this pool is not

It is a sample of about fifteen brands chosen by you and your scouts to provoke reactions. It says what this founder is drawn to and what they refuse. It does not say what the category looks like, which codes are clichés, or where the white space is: that is `brand-audit`, on a real panel, with counts. Pass it the direct competitors and the admired brands in the hand-off, as candidates to validate.

Other companies' screenshots and images are working material for internal reference. See "Third-party material" in `SKILL.md`.
