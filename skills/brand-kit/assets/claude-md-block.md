Append the block below to `CLAUDE.md` (or `AGENTS.md`) at the root of any project that should be on-brand. Adapt the paths if the kit lives somewhere other than `brand/`, or if `BRAND.md` sits at the project root. Keep the `@` imports exactly as written: they are what put the brand in context from turn one. In a quick kit, drop the line about `brand/site/`.

---

## Brand

This project is {BRAND}-branded. The brand is not optional.

@brand/BRAND.md
@brand/DESIGN.md

- **`BRAND.md` is the brand**, in the BRAND.md format: who it is for, how it sounds, what it may claim, the logo, colours, typefaces, imagery and motion. Rules sit in the section they govern. Before writing copy or making an image, read the sections for that job; before stating a fact, check `Claims` and use only what is `approved`.
- **`DESIGN.md` is the interface**: colour roles, type scale, spacing, components. It decides applied visuals; `BRAND.md` still decides meaning, voice, vocabulary and claims.
- **Values** live in `brand/tokens.json`. Read it when you need an exact value: every one carries a `_use` or `_rule` next to it. Never hardcode a colour, a size or a spacing value; use the CSS variables in `brand/theme.css`.
- **Never read `brand/site/`.** It is the human-facing brand site, built from `tokens.json`, and costs many times the context of the same facts in these files. Imagery you may reuse lives in `brand/assets/`; never give an image marked `dont` to an image model, and never ask one to draw the logo.
- **The user's instruction in this session wins.** Do what they ask, then note in one line what you overrode: "Used title case as you asked; brand default is sentence case." Do not lecture, refuse or ask first. **Locked:** logo integrity, the contrast floor, legal wording and any claim not `approved`. For these, say what breaks before doing it, and do it only once the user confirms.
- **If a rule is missing and you had to guess**, say so at the end of your reply. A rule that an agent broke is the best evidence that the rule needs writing down: use the `brand-kit-update` skill to add it.

Changing the brand means editing `brand/tokens.json`, or the prose, claims and rules in `brand/BRAND.md` and `brand/DESIGN.md`, then running `sync.py`, which rewrites the synced blocks, `theme.css` and the site's inputs. Use the `brand-kit-update` skill; it keeps the files honest and writes the changelog entry.
