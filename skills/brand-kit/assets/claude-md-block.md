Append the block below to `CLAUDE.md` (or `AGENTS.md`) at the root of any project that should be on-brand. Adapt the path if the kit lives somewhere other than `brand/`. Keep the `@` import exactly as written — it is what puts the rules in context from turn one.

---

## Brand

This project is {BRAND}-branded. The brand rules are not optional.

@brand/BRAND.md

- **Values** live in `brand/tokens.json`. Read it when you need an exact hex, size, or rule — every value carries a `_use` or `_rule` next to it.
- **Never read `brand/site/`.** It is the human-facing brand site, built from `tokens.json`, and reading it costs about fifteen times more context than the same facts in `tokens.json`. Imagery you may reuse lives in `brand/assets/`. `brand/references/` holds captures of other brands' sites, kept as working reference: never reuse or publish anything from it.
- **Never hardcode a colour, a size or a spacing value.** Use the CSS variables. If a value is not on the scale, round to the nearest step rather than inventing one.
- **The user's instruction in this session wins.** Do what they ask, then note in one line what you overrode. Logo integrity, the contrast floor and legal wording are the exceptions: say what breaks before doing it.
- **If a rule is missing and you had to guess**, say so at the end of your reply. A rule that an agent broke is the best evidence that the rule needs writing down — use the `brand-kit-update` skill to add it.

Changing the brand means editing `brand/tokens.json` or `brand/BRAND.md`, re-syncing the `BRAND.md` core block, and rebuilding the site. Use the `brand-kit-update` skill; it keeps the files honest and writes the changelog entry.
