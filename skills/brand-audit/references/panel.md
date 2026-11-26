# Building the panel

Every count in the audit is a count over this list. A wrong panel does not produce a slightly wrong audit, it produces a confident audit of something else.

## The skeleton

Write this before dispatching anyone. Scripts add the rest.

```json
{
  "meta": { "mode": "flash", "date": "2026-11-26", "locale": "fr", "market_country": "fr",
            "thresholds": { "convention": 0.6, "rare": 0.15 } },
  "framing": { "product": "…", "audience": "…", "market": "…", "instead_of": "…" },
  "panel": [
    { "id": "strava", "name": "Strava", "url": "https://www.strava.com", "role": "direct",
      "why": "Same product, same runners", "confidence": 0.9,
      "established": { "value": true, "reason": "Category leader since 2009, over 100 million users" },
      "extra_urls": ["https://www.strava.com/features", "https://www.strava.com/pricing"],
      "app_store_term": "Strava" }
  ],
  "library": {}, "conventions": [], "opportunities": [], "limits": []
}
```

`id` is a lower-case slug and becomes the folder name in `evidence/`. `market_country` is a two-letter code used for the App Store lookup. `extra_urls` and `app_store_term` are read in deep mode only.

## The five roles

| Role | What it is | How to find it |
|---|---|---|
| `direct` | Same offer, same buyer, same market | What a buyer compares on the day they choose |
| `indirect` | Another offer for the same need | What they use today instead, including the non-digital substitute and the free feature of a giant |
| `leader` | The category's reference abroad, absent or marginal in this market | Where the category is heading |
| `aspirational` | Outside the sector | See the rule below |
| `self` | The brand being audited, when one exists | A rebrand |

**The statistics base is the `direct` brands only.** The other roles are there to be compared against it. So a brand that could be direct or indirect is direct if a buyer would hesitate between it and the product; otherwise indirect.

## Counts

| | direct | indirect | leader | aspirational |
|---|---|---|---|---|
| Flash | 8 | 0 | 0 | 2 |
| Deep | 10 to 12 | 4 to 6 | 3 to 4 | 5 to 8 |

Fewer than 4 direct brands captured in full and nothing can be counted: `aggregate.mjs` says so and stops. If the market truly has four players, say that in `limits` and lean on the leaders and the library sample.

Do not pad. Eight brands that a buyer compares beat twelve with four fillers, because the fillers move every percentage.

## `established`

Set on every `direct` and `leader` brand, with a reason. It is the hinge of the exception test: a convention is only proven breakable when an **established** brand breaks it and is still read as part of the category. A newcomer breaking a code proves nothing yet; it may be why it stays small.

A brand is established when at least one of these is true and you can cite it: it has been there for years and still leads, its scale is public (users, revenue, shops), or the trade press and buyers name it as a reference. The reason is one sentence with the fact in it. "Well known" is not a reason.

When in doubt, `false`. A false `true` creates a fake cliché; a false `false` only makes the audit more cautious.

## The aspirational rule

These are the brands the result could borrow from, so they decide the opportunities. They are chosen on a criterion, never because they are admired. Each `why` must say which of the two it is:

1. **Same audience, other category.** The people this product is for already buy from this brand in another part of their life, so its codes are already legible to them.
2. **Same tension, solved.** The framing contains a tension (serious without being cold, expert without being intimidating, dense without being heavy). This brand resolved the same one in its own sector.

A brand that fits neither comes out. Six design-forward startups everyone has on their moodboard are not an aspirational panel, they are a taste.

Spread them: at least half from sectors with no relation to tech if the product is software.

## The scout prompt

One subagent per role, in parallel. Give each the framing and this:

```
You are building one part of a competitor panel for a visual brand audit.

Product: <framing.product>
Audience: <framing.audience>
Market: <framing.market>
Used today instead: <framing.instead_of>
Already known: <brands the user named, or "none">

Your part: <ROLE>, as defined here: <the row of the roles table, and for aspirational the two criteria>.
Find <N + 3> candidates, so that some can be cut.

Search the web. For each candidate, open its site and confirm it is live and is what you think it is.
Use the official marketing site in this market's language when one exists.

Return JSON only, an array of:
{ "id": "lower-case-slug", "name": "…", "url": "https://…", "role": "<ROLE>",
  "why": "one sentence, specific to this audit",
  "confidence": 0.0 to 1.0,
  "established": { "value": true|false, "reason": "one sentence with the fact" },   // direct and leader only
  "extra_urls": ["a product or features page", "a pricing page"],                   // when they exist
  "app_store_term": "name to search in the App Store"                                // when there is an app
}

Write "why" and "established.reason" in <the user's language>: they are printed on the board.

Do not describe how any brand looks. That is measured later, from captures. A description from
memory would contaminate the audit.
```

The last paragraph is not a formality. A scout that returns "Strava: orange, bold, sporty" has just written the audit from memory, and the coders will see what they were told to see.

If Similarweb or Ahrefs connectors are available, a scout may use them to find competitors by shared audience or organic overlap. They are optional.

## Merging

Deduplicate by domain. Cut to the counts of the mode, keeping the highest confidence and making sure the established players are in. If two scouts return the same brand under two roles, apply the buyer test above.

Then write the panel into `audit.json`. In deep, show it to the user as a short table (name, role, one-line why) and ask one question:

> "Voici le panel. Qui manque, et qui n'a rien à faire là ?"

One round. Apply the corrections and capture.
