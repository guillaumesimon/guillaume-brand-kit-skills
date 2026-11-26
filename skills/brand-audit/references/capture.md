# Capture

```bash
node assets/capture.mjs brand/audit [--only id,id] [--concurrency 4]
```

Reads the panel from `audit.json`, visits every brand that has no `capture` value yet, and writes back after each brand, so a crash on one loses nothing. Ten brands take about a minute. The capture is the same in flash and in deep.

## What comes back, per brand

In `evidence/<id>/`:

| File | What |
|---|---|
| `desktop.webp` | The first screen of the home page at 1440 × 900 |
| `full.webp` | The whole home page as one reduced overview |
| `scroll-2.webp` … `scroll-4.webp` | The next screens of the home page, as readable tiles of 1500 px each |
| `mobile.webp` | The first screen at 390 × 844 |
| `page-1.webp`, `page-2.webp` | The first screen of each `extra_urls` page: product, features, pricing |
| `app-icon.webp`, `app-1.webp` … `app-3.webp` | The App Store listing, when `app_store_term` is set |
| `logo.webp` | A screenshot of the logo as it sits in the header |
| `logo.svg` | The vector, when the logo is inline SVG |
| `icon.webp` | The touch icon or favicon |
| `measures.json` | Everything in the next section |

The page is scrolled once before the overview is taken, so that lazy-loaded sections are there.

The App Store listing comes from Apple's public search API, in the country of `meta.market_country`. Its text goes to `app_store` on the brand: name, genre, rating and the first 400 characters of the description, which is the brand describing itself in its own words. There is no Play Store capture: in almost every case the listing shows the same icon and the same screens, and Google offers no public API for it. If a brand is Android-only, save its Play Store icon and screenshots by hand into the brand's folder and add the paths to its `evidence`.

In `audit.json`, on the brand: `capture`, `measures`, `logo`, `evidence`, `capture_notes`, `app_store`.

## What is measured, and how far to trust it

Read from the rendered page with `getComputedStyle`, in the first 2400 pixels.

| Measure | How | Trust |
|---|---|---|
| `palette` | Background colours weighted by the area they cover, near colours merged | Good for the ground and the big blocks. **Blind to photographs and video**: a page that is one large image measures as its page colour |
| `ground` | From the largest colour: `light`, `dark`, `coloured` | Good |
| `accent` | The most frequent non-neutral background among links and buttons, else their text colour | Good when there is a filled button. Check it against the screenshot |
| `fonts` | Family and weight of each text node, weighted by length | Good. The family is the CSS name, which can be an alias (`__Inter_a1b2c3`) or a house name |
| `headline` | The `h1`, else the largest text near the top | Fair. A cookie or region banner can win; the screenshot settles it |
| `button_radius_px` | The most common radius of filled buttons | Good |
| `media` | Count of large images, videos, SVGs, canvases | A hint for the coder, nothing more |

The measures pre-fill what the coder would otherwise guess. They do not replace the coder's eyes: when a measure and a screenshot disagree, the screenshot wins and the coder says so in `notes`.

## Reading the notes

- `consent banner dismissed`: a cookie banner was clicked away before measuring. Good.
- `logo not found`: no element matched. The brand has `logo: null`. Use `icon.webp` or `app-icon.webp` on the wall, or crop the header yourself, and tell the coder to read the logo from `desktop.webp`.
- `blocked: …`: see below.
- `navigation failed: …`: the site did not answer. `capture: "none"`. Check the URL first.

A banner that was not dismissed and covers the hero is the most common defect. Re-run that brand once (`--only id`); if it persists, the screenshot is still codable from what is visible, and `full.webp` usually shows the rest.

## When a site blocks the visit

Some sites answer a headless browser with a challenge page. The script detects it (an HTTP error, a title like "Just a moment", or a page with almost no text), keeps one screenshot as `blocked.webp`, and marks the brand `capture: "partial"` with `measures: null`.

**Keep the brand.** A blocked leader is still the leader. Get a capture another way, in this order, and stop at the first that works:

1. **Mobbin**, if its MCP server is connected: `search_sections` with the brand name and "hero section". Download the `image_url` into `evidence/<id>/desktop.webp`; cite the `mobbin_url` in the brand's `capture_notes`.
2. **Another official page**: a country variant, the product subdomain, the press or brand page. Put that URL in the panel and re-run with `--only <id>`.
3. **A press kit or a recent screenshot** found by web search, from the brand's own domain or a reputable source. Save it and note the source and its date.
4. **The App Store listing.** The script fetches it even for a blocked brand when `app_store_term` is set: an app's icon and screens are often enough to code it.

Whatever the route, the brand stays `partial`: it is coded by eye from what you got, it appears on the walls, and it is **left out of the counts**, because its measures are missing and its capture is not comparable. Add the file you saved to the brand's `evidence` list and say which route was used.

If nothing works, the brand stays in the panel table as not captured, and `limits` names it. An audit that silently loses the category leader is worse than one that says it could not see it.

## Re-running

- `--only id,id` re-captures those brands from scratch. **It deletes the brand's evidence folder first**, including any file you saved there by hand (a rescued capture, a Mobbin image). Save those again afterwards, or do not use `--only` on a brand you rescued.
- Re-capturing does not touch `codes`. If the page changed, re-code the brand.
- A later run captures only the brands added to the panel since.
- Brand ids must be lower-case slugs, and `sheets` and `library` are reserved: the script refuses anything else before touching a file.
- Captures are dated by `meta.date`. If the audit is resumed weeks later, re-capture rather than mix dates.
