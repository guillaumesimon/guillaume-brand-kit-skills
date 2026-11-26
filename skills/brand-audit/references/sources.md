# Outside sources

The panel is what competitors do. These libraries show the sector as designers have collected it. Both are needed and they must not be mixed: a library is curated, so it shows the top of the basket, not the market. Its counts are reported apart, labelled as a curated sample, and never added to the panel's.

Use them as a person would: a few requests, the source cited, the images kept for internal reference.

## Logosystem: logos by industry, already tagged

```bash
node assets/library.mjs brand/audit --industry sports-and-fitness [--max 40]
```

One page request returns the industry's logos with the site's own tags: type, colours, styles, subjects, moods, the studio and a link to the case study. The script writes them to `audit.json` under `library.logosystem`, with counts per facet, and saves up to `--max` images (60 at most) into `evidence/library/` for the board.

Industry slugs seen on 2026-11-26:

`agency` · `ai` · `automotive` · `beauty` · `design-studio` · `e-commerce-and-dtc` · `education` · `fashion` · `fintech` · `food-and-drink` · `gaming` · `health-and-wellness` · `industrial` · `media-and-entertainment` · `non-profit` · `real-estate` · `saas` · `sports-and-fitness` · `tech` · `travel-and-hospitality` · `web3-and-crypto`

Pick the closest one. If the product sits between two (a running app is `sports-and-fitness`, and also `health-and-wellness`), run the closest and mention the other in `limits`. A wrong slug returns nothing and the script says so.

How to read it:

- Its types are `wordmark`, `symbol`, `symbol-and-text`, `animated`: coarser than the seven of the codebook. Read `symbol-and-text` as combination, `symbol` as pictorial or abstract.
- Compare its shares with the panel's, side by side. **The gap is the finding.** If 31 % of the library sample is wordmarks and 1 of 10 competitors is, good recent work in the sector is moving somewhere the competitors have not gone.
- The `subject` facet is where motif clichés show at scale (letterform, abstract, circle, human figure).
- Each item links to a studio case study. For the two or three logos closest to an opportunity, the case study is worth reading: it says why.

The sample skews toward tech companies and recent work from studios. Say so when you cite it.

The site's `robots.txt` allows use as reference and refuses training. Reference is what this is.

## Logoinspo: typologies, not sectors

`https://www.logoinspo.com/` is organised by type and colour (`/wordmark`, `/symbol`, `/symbol-and-text`, `/color/blue`, and combinations like `/symbol-blue`), not by industry. It does not tell you about a sector.

Use it in deep mode, by hand, for one thing: when an opportunity calls for a kind of mark the sector does not have (a serif wordmark, a black symbol), open the matching page and pick two or three references from other sectors to show what it could look like. Save them under `evidence/library/` and cite the page. No script; this is three images, chosen by looking.

## Mobbin: home pages and screens beyond the panel

Through its MCP server, when it is connected (`mcp__Mobbin__search_sections`, `mcp__Mobbin__search_screens`). It is the same source `brand-kit` uses for its duels.

Three uses, in this order of value:

1. **Rescue a blocked capture.** `search_sections` with the brand's name and "hero section". See `references/capture.md`.
2. **Widen the view of the category's pages** (deep). `search_sections` with the kind of product and "hero section", 20 results. Look at them as one more wall: do they confirm the panel's conventions, or does the wider set do something the panel does not? Record what you saw in `library.mobbin` as `{ "query": "…", "n": 20, "observation": "…", "examples": [{ "site_name": "…", "mobbin_url": "…" }] }`.
3. **The inside of the product** (deep, for apps). `search_screens` with the kind of app and a key screen ("running app activity summary"), `platform: "ios"`. The audit is about the brand, but in an app the product screen is most of what people see of it.

Image URLs expire after 30 days: download what you keep into `evidence/`, and cite the `mobbin_url`. If the server is not connected, skip all three and say so in `limits`. Nothing depends on it.

## Web search

For the scouts (who is in the category), the sceptic (who already occupies a territory), and recent rebrands. Not for how a brand looks: that comes from captures only.

Useful queries for the rebrand pass: `<sector> rebrand 2026`, `<brand> new identity`, and the studios' own case studies, which the library items link to.

## What is deliberately not used

- **Brand-data APIs** (logo and palette by domain). They need a key and return what the capture already gives.
- **Image search results as evidence.** An image without its page has no date and no context. A capture of the brand's own page has both.
- **Your memory of a brand.** It is usually a version or two out of date, and it is the thing this audit exists to replace.
