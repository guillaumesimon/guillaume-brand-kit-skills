# Design references

One `DESIGN.md` per well-known site, to be used as reference material when building a visual system. Each file follows the DESIGN.md convention: YAML front matter with tokens (colours, typography, radii, spacing, components), then prose sections explaining how the tokens are used.

## How a file is made

1. **Read the site on Mobbin** (MCP server, `search_sections` and `search_screens`) for composition, section patterns and how the site changed over time. Mobbin links are cited in each file.
2. **Measure the live site** with `extract.js`, which loads the page in headless Chromium at 1440x900 and records computed styles: type scale, weights, colours weighted by area, radii, shadows, transitions, section padding, declared CSS variables.
3. **Write the file** from both. Values in the front matter are measured, not estimated from screenshots.

```bash
node design-references/extract.js linear https://linear.app/ ./out
```

## Limits

- Measurements cover the home page on the date given in each file. Sites change.
- Fonts named are the ones the site loads. Most are licensed and are not included here.
- These files describe other companies' identities. They are references to learn from, not systems to copy.

## Index

- [Linear](linear/DESIGN.md)
