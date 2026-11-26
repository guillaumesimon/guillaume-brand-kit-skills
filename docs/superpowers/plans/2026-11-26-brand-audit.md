# brand-audit Implementation Plan

> **Historical working document.** It records how `brand-audit` was first designed and planned. The skill has changed since (capture depth, written sections, creative synthesis, generated brief); `skills/brand-audit/SKILL.md` is the reference.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `brand-audit` skill that produces an evidence-backed visual landscape audit of a sector, in flash and deep modes, and have `brand-kit` consume it.

**Architecture:** One data file (`audit.json`) is the source of truth. Node scripts do the mechanical work (capture and measure with Chromium, aggregate frequencies, build contact sheets, render the human board, check evidence). The agent and its subagents do the looking and the judging, guided by `SKILL.md` and five reference files.

**Tech Stack:** Node 22 ES modules, `node --test`, Playwright with Chromium (resolved from the environment, not vendored), no other dependency. Markdown for the skill.

**Spec:** `docs/superpowers/specs/2026-11-26-brand-audit-design.md`

## Global Constraints

- Skill lives in `skills/brand-audit/`. Output of a run goes to `<project>/brand/audit/`.
- No API key required. Mobbin, Similarweb, Ahrefs are optional.
- `AUDIT.md` in English. `landscape.html` in the user's language.
- Every finding carries `provenance`: `measured`, `observed` or `judged`, and at least one `evidence` path that exists.
- Thresholds: convention at share >= 0.60, rare at share <= 0.15, read from `audit.json` `meta.thresholds`. Counts and base are always stored next to the share.
- Statistics base is the panel's `direct` brands with `capture: "full"`. Library samples are reported separately and never merged.
- Logo type has exactly seven values: `wordmark`, `lettermark`, `pictorial`, `abstract`, `combination`, `emblem`, `mascot`.
- Roles: `direct`, `indirect`, `leader`, `aspirational`, `self`.
- Images written to `evidence/` are WebP, longest side 1600px at most.
- Library sites are consulted at low volume (one industry page per library per run, at most 60 items), source cited.
- No em dashes in files written for the user in French.

## Review Focus

1. A site answers with a bot challenge (403, "Just a moment"). Expected: brand kept, `capture: "partial"`, excluded from colour and type statistics, run continues.
2. A panel with fewer than 4 usable direct brands. Expected: `aggregate` refuses to classify and says why, instead of printing 100% conventions.
3. A brand whose logo cannot be found by selector. Expected: `logo: null` and a flag for the coder, never a wrong image silently used.
4. An `AUDIT.md` claim citing a file that is not in `evidence/`. Expected: `check.mjs` exits non-zero and names the claim.
5. A deep run started on an existing flash audit. Expected: panel and evidence kept, brands already captured are not re-fetched.

---

## File map

```
skills/brand-audit/
├── SKILL.md                    the flow, the two modes, when to stop
├── references/
│   ├── panel.md                roles, criteria, scout prompts, `established`
│   ├── capture.md              what capture.mjs does, fallback chain
│   ├── codebook.md             the closed vocabulary, coder prompt
│   ├── synthesis.md            thresholds, exception test, map, opportunities, sceptic prompt
│   └── sources.md              Logosystem, Logoinspo, Mobbin: what to take, precautions
├── assets/
│   ├── lib/color.mjs           colour parsing, hue families, weighting
│   ├── lib/schema.mjs          vocabulary and validateAudit
│   ├── lib/browser.mjs         launch Chromium, PNG to WebP
│   ├── capture.mjs             CLI: panel in, per-brand evidence out
│   ├── library.mjs             CLI: one Logosystem industry page to a tag sample
│   ├── aggregate.mjs           CLI: frequencies, conventions, map axes
│   ├── sheets.mjs              CLI: contact sheets
│   ├── render.mjs              CLI: audit.json to landscape.html
│   ├── check.mjs               CLI: schema and evidence gate
│   ├── landscape.template.html
│   ├── audit.example.json
│   └── AUDIT.example.md
└── tests/
    ├── fixtures/site/          a small local site, plus a bot-challenge page
    └── *.test.mjs
```

`audit.json` top-level keys, fixed here for every task: `meta` (`mode`, `date`, `locale`, `thresholds`), `framing` (`product`, `audience`, `market`, `instead_of`), `panel[]`, `library` (`logosystem`, `mobbin`), `frequencies`, `conventions[]`, `map`, `opportunities[]`, `limits[]`.

A `panel[]` entry: `id`, `name`, `url`, `role`, `why`, `confidence`, `established` (`{value, reason}` for `direct` and `leader`), `capture` (`full` | `partial` | `none`), `measures` (from capture), `codes` (from coders), `evidence` (paths relative to `brand/audit/`).

---

### Task 1: Vocabulary, schema and example

**Files:**
- Create: `skills/brand-audit/assets/lib/schema.mjs`, `skills/brand-audit/assets/audit.example.json`
- Test: `skills/brand-audit/tests/schema.test.mjs`

**Interfaces:**
- Produces: `VOCAB` (object: dimension name to array of allowed values), `DIMENSIONS` (array of dimension names used for statistics), `validateAudit(audit: object): string[]` (empty array means valid; each string names the path and the problem).

`VOCAB` dimensions and values:
- `logo_type`: the seven values of Global Constraints
- `symbol_nature` (only when `logo_type` is `combination`): `lettermark`, `pictorial`, `abstract`, `mascot`
- `symbol_subject`: free string, lower case, or `none`
- `name_case`: `lower`, `upper`, `title`, `mixed`
- `name_style`: `geometric_sans`, `grotesque`, `humanist_sans`, `serif`, `slab`, `script`, `mono`, `custom`
- `hue`: `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `purple`, `pink`, `brown`, `neutral`
- `saturation`: `muted`, `medium`, `vivid`
- `ground`: `light`, `dark`, `coloured`
- `hue_count`: `one`, `two`, `many`
- `headline_class`, `text_class`: same values as `name_style`
- `imagery`: `people_photo`, `product_ui`, `product_photo`, `illustration_flat`, `illustration_3d`, `abstract_graphic`, `video`, `none`
- `layout`: `centered_hero`, `split_hero`, `full_bleed_media`, `dense_grid`, `editorial`
- `headline_promise`: `benefit`, `mechanism`, `manifesto`, `proof`, `community`

Any coded value may also be `other:<text>`.

- [ ] **Step 1: Write the failing tests**

```js
test('example audit is valid', () => assert.deepEqual(validateAudit(example), []));
test('rejects an unknown logo type', () => {
  const a = structuredClone(example); a.panel[0].codes.logo_type = 'logo';
  assert.match(validateAudit(a)[0], /panel\[0\]\.codes\.logo_type/);
});
test('accepts other: values', () => {
  const a = structuredClone(example); a.panel[0].codes.imagery = 'other:route maps';
  assert.deepEqual(validateAudit(a), []);
});
test('symbol_nature required for combination marks only', () => { /* missing on combination: error; present on wordmark: error */ });
test('a finding without evidence is rejected', () => {
  const a = structuredClone(example); a.conventions[0].evidence = [];
  assert.match(validateAudit(a)[0], /conventions\[0\]\.evidence/);
});
test('established is required on direct and leader brands', () => { /* delete it, expect an error naming the brand */ });
```

- [ ] **Step 2: Run** `node --test skills/brand-audit/tests/schema.test.mjs`. Expected: fails, module not found.
- [ ] **Step 3: Write `schema.mjs` and `audit.example.json`.** The example is a fictional sector (independent bookshops' ordering apps), 8 direct brands, 2 aspirational, flash mode, every key of the file map populated, 3 conventions (one per class), 2 opportunities.
- [ ] **Step 4: Run the tests.** Expected: pass.
- [ ] **Step 5: Commit** `feat(brand-audit): vocabulary, schema and worked example`.

### Task 2: Colour utilities

**Files:**
- Create: `skills/brand-audit/assets/lib/color.mjs`
- Test: `skills/brand-audit/tests/color.test.mjs`

**Interfaces:**
- Produces:
  - `parseColor(css: string): {r,g,b,a} | null`: accepts `rgb()`, `rgba()`, `#rgb`, `#rrggbb`, `color(srgb …)`, `oklch()` is returned `null`.
  - `toHex({r,g,b}): string`
  - `classify({r,g,b}): {hue: string, saturation: string, lightness: number}` with `hue` in `VOCAB.hue`. Neutral when HSL saturation < 0.12 or lightness < 0.08 or > 0.95.
  - `palette(samples: Array<{color: string, weight: number}>, max = 6): Array<{hex, share, hue, saturation}>`: merges colours closer than 12 in RGB distance, drops alpha < 0.5, shares sum to 1.

- [ ] **Step 1: Failing tests**

```js
assert.equal(classify(parseColor('rgb(216, 236, 252)')).hue, 'blue');
assert.equal(classify(parseColor('#FBF7F1')).hue, 'neutral');
assert.equal(classify(parseColor('#1F5D45')).hue, 'green');
assert.equal(classify(parseColor('#FF5A1F')).saturation, 'vivid');
assert.equal(parseColor('rgba(0, 0, 0, 0)').a, 0);
const p = palette([{color:'#ffffff',weight:60},{color:'#fefefe',weight:20},{color:'#ff0000',weight:20}]);
assert.equal(p.length, 2); assert.equal(p[0].share, 0.8);
```

- [ ] **Step 2: Run, expect failure.** `node --test skills/brand-audit/tests/color.test.mjs`
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run, expect pass.**
- [ ] **Step 5: Commit** `feat(brand-audit): colour utilities`.

### Task 3: Capture

**Files:**
- Create: `skills/brand-audit/assets/lib/browser.mjs`, `skills/brand-audit/assets/capture.mjs`, `skills/brand-audit/tests/fixtures/site/index.html`, `skills/brand-audit/tests/fixtures/site/blocked.html`, `skills/brand-audit/tests/fixtures/site/nologo.html`
- Test: `skills/brand-audit/tests/capture.test.mjs`

**Interfaces:**
- Consumes: `palette`, `classify` from Task 2.
- Produces:
  - `browser.mjs`: `launch(): Promise<Browser>` (uses `/opt/pw-browsers/chromium` only if the default launch fails), `saveWebp(page: Page, pngBuffer: Buffer, outPath: string, maxSide = 1600): Promise<void>` (draws on a canvas in the page and exports WebP at quality 0.8).
  - `capture.mjs` export `captureBrand(browser, brand: {id, url}, outDir: string, opts: {deep: boolean, extraUrls?: string[]}): Promise<{capture, measures, evidence, logo, notes: string[]}>`.
  - CLI: `node capture.mjs <audit-dir> [--deep] [--only id,id] [--concurrency 4]`. Reads `<audit-dir>/audit.json`, captures every panel brand whose `capture` is unset (so a deep run on a flash audit skips what exists), writes `evidence/<id>/…` and updates `audit.json` in place.
  - `measures`: `{palette, accent: hex|null, ground: 'light'|'dark'|'coloured', fonts: [{family, weight, share}], headline: {text, family, size_px, weight, tracking_em}, button_radius_px: number|null, media: {img, video, svg, canvas}}`.
  - Evidence files per brand: `desktop.webp` (1440x900), `full.webp` (full page, capped at 6000px high), `mobile.webp` (390x844), `logo.svg` or `logo.webp` when found, `measures.json`.

Decisions the tests do not fix:
- Blocked detection: status >= 400, or title matching `/just a moment|attention required|access denied|are you a robot/i`, or body text under 200 characters after 5 s. Result: `capture: "partial"`, `measures: null`, one screenshot kept as `blocked.webp`, a note saying which rule fired.
- Cookie banners: before measuring, click the first visible button matching `/^(accept|accepter|tout accepter|agree|j'accepte|ok|allow all|got it)/i`, at most once, ignore failure.
- Accent: the most frequent non-neutral background colour among visible `a`, `button`, `[role=button]`; if none, the most frequent non-neutral text colour of the same set.
- Logo: first match in `header a[href="/"] svg, header a[href="/"] img, [class*="logo" i] svg, [class*="logo" i] img, header svg, header img`, kept only if its box is between 16 and 400px wide and in the top 200px. Otherwise `logo: null` and note `logo not found`. Also save `icon.webp` from `link[rel="apple-touch-icon"]` or the largest `link[rel~="icon"]`.
- `--deep`: also captures `extraUrls` (the scout supplies product and pricing URLs) as `page-1.webp`, `page-2.webp`, desktop only, no measures.
- App Store (deep, only when the panel entry has `app_store_term`): query `https://itunes.apple.com/search?entity=software&limit=1&country=<meta.market_country>&term=…`, save `artworkUrl512` as `app-icon.webp` and the first two `screenshotUrls` as `app-1.webp`, `app-2.webp`. A failed lookup is a note, not an error.
- Timeouts: 45 s navigation, then 3 s settle. A thrown navigation error is `capture: "none"` with the message in notes.

- [ ] **Step 1: Write the fixtures and failing tests.** `index.html`: white page, `#1F5D45` button with 8px radius, an inline SVG logo 120px wide inside `header a[href="/"]`, `h1` in Georgia 64px. Tests start `http.createServer` on a random port serving the fixture directory.

```js
test('measures a normal page', async () => {
  const r = await captureBrand(browser, {id:'fix', url: base + '/index.html'}, out, {deep:false});
  assert.equal(r.capture, 'full');
  assert.equal(r.measures.accent, '#1f5d45');
  assert.equal(r.measures.ground, 'light');
  assert.equal(r.measures.button_radius_px, 8);
  assert.match(r.measures.headline.family, /Georgia/);
  assert.ok(existsSync(join(out, 'fix/desktop.webp')));
  assert.ok(existsSync(join(out, 'fix/logo.svg')));
});
test('a bot challenge is partial, not fatal', async () => {
  const r = await captureBrand(browser, {id:'blk', url: base + '/blocked.html'}, out, {deep:false});
  assert.equal(r.capture, 'partial'); assert.equal(r.measures, null);
});
test('a missing logo is null with a note', async () => {
  const r = await captureBrand(browser, {id:'nl', url: base + '/nologo.html'}, out, {deep:false});
  assert.equal(r.logo, null); assert.ok(r.notes.some(n => /logo not found/.test(n)));
});
test('an unreachable host is capture none', async () => { /* http://127.0.0.1:1/ */ });
test('CLI skips brands already captured', async () => { /* run twice on a temp audit dir, second run reports 0 captured */ });
```

- [ ] **Step 2: Run, expect failure.**
- [ ] **Step 3: Implement `browser.mjs` and `capture.mjs`.**
- [ ] **Step 4: Run, expect pass.** `node --test skills/brand-audit/tests/capture.test.mjs`
- [ ] **Step 5: Smoke on two live sites** (`https://www.strava.com`, `https://runkeeper.com`) into the scratchpad; open the screenshots and check the measures are plausible. Fix what is wrong, add a fixture for any new failure.
- [ ] **Step 6: Commit** `feat(brand-audit): capture and measure a panel with Chromium`.

### Task 4: Library sample

**Files:**
- Create: `skills/brand-audit/assets/library.mjs`, `skills/brand-audit/tests/fixtures/logosystem-list.html`, `skills/brand-audit/tests/fixtures/logosystem-logo.html`
- Test: `skills/brand-audit/tests/library.test.mjs`

**Interfaces:**
- Produces: `parseList(html: string): Array<{slug, image}>`, `parseLogo(html: string): {tags: string[], source: string|null}`, CLI `node library.mjs <audit-dir> --industry <slug> [--max 40]` writing `audit.json` `library.logosystem = {industry, url, fetched, n, items: [{slug, tags, image, source}], tag_counts: {tag: n}}` and the images to `evidence/library/`.

Decisions: `--max` capped at 60. One request per second. User agent is a plain desktop Chrome string. The industry slugs are the `/logos/<slug>` paths of logosystem.co; `references/sources.md` lists the industry ones seen on 2026-11-26. If the list page yields no items, exit 0 with `n: 0` and a note, since the site's markup may change.

- [ ] **Step 1: Save two real pages as fixtures** (one industry list, one logo page), then failing tests: `parseList` returns more than 20 items with `slug` and `image`; `parseLogo` returns tags including `wordmark` and a non-null `source` for the saved page; `parseList('<html></html>')` returns `[]`.
- [ ] **Step 2: Run, expect failure. Step 3: Implement. Step 4: Run, expect pass.**
- [ ] **Step 5: Commit** `feat(brand-audit): sample a Logosystem industry page`.

### Task 5: Aggregate

**Files:**
- Create: `skills/brand-audit/assets/aggregate.mjs`
- Test: `skills/brand-audit/tests/aggregate.test.mjs`

**Interfaces:**
- Consumes: `DIMENSIONS`, `VOCAB` from Task 1.
- Produces:
  - `frequencies(panel, thresholds): {base: number, by_dimension: {[dim]: Array<{value, count, share, brands: string[], status: 'convention'|'common'|'rare'}>}}`
  - `conventionCandidates(freq, panel): Array<{dimension, value, count, base, share, breakers: Array<{id, established: boolean, value}>}>`
  - `mapAxes(panel): {x: {dimension, poles: [string, string]}, y: {...}, points: Array<{id, x, y}>, clusters: Array<{ids: string[], label: string}>}`
  - CLI `node aggregate.mjs <audit-dir>`: writes `frequencies`, replaces `conventions[]` candidates while preserving any existing `class`, `reason` and `evidence` for the same dimension and value, writes `map`.

Decisions:
- Base: `role === 'direct'` and `capture === 'full'` and `codes` present.
- If base < 4: write `frequencies.base`, set `frequencies.insufficient = true`, leave `conventions` empty, print the reason, exit 0.
- Status: `convention` when share >= thresholds.convention, `rare` when share <= thresholds.rare and count >= 1, else `common`. In flash mode (`meta.mode === 'flash'`) convention needs count >= 5 as well.
- `other:` values are counted as themselves, case-folded.
- Map axes: among the dimensions with at least two values each held by >= 20% of the base, take the two with the highest normalised entropy that are not `hue_count` or `name_case`. Each axis is reduced to two poles: the most frequent value against the rest. Brands of every role with codes are plotted; `self` included. Points get a deterministic jitter from the brand id. A cluster is a quadrant holding >= 40% of the base.

- [ ] **Step 1: Failing tests** on a hand-built panel of 10 direct brands: 7 blue gives `convention` with `count: 7, base: 10, share: 0.7`; a partial brand is not in the base; breakers list carries `established`; base of 3 sets `insufficient`; flash mode with 4 of 6 is `common`, not `convention`; an existing `class: "cliche"` survives a re-run; `mapAxes` never picks a dimension where one value holds 100%.
- [ ] **Step 2: Run, expect failure. Step 3: Implement. Step 4: Run, expect pass.**
- [ ] **Step 5: Commit** `feat(brand-audit): frequencies, convention candidates and map axes`.

### Task 6: Sheets, board and gate

**Files:**
- Create: `skills/brand-audit/assets/sheets.mjs`, `skills/brand-audit/assets/render.mjs`, `skills/brand-audit/assets/landscape.template.html`, `skills/brand-audit/assets/check.mjs`, `skills/brand-audit/assets/AUDIT.example.md`
- Test: `skills/brand-audit/tests/render.test.mjs`, `skills/brand-audit/tests/check.test.mjs`

**Interfaces:**
- Consumes: `launch`, `saveWebp` (Task 3), `validateAudit` (Task 1).
- Produces:
  - `node sheets.mjs <audit-dir>`: writes `evidence/sheets/logos.webp`, `palettes.webp`, `heroes.webp`, `type.webp`. Each cell is labelled with the brand name and role only.
  - `renderLandscape(audit: object, strings: object): string` and `node render.mjs <audit-dir>`: writes `landscape.html`. Sections in order: what this is and its limits, the panel, logo wall, palettes, typography, hero wall, conventions by class, map (inline SVG), opportunities, library sample (set apart, labelled as a curated sample), method. Images by relative link to `evidence/`. No external request: no web font, no CDN. UI strings for `fr` and `en` ship in `render.mjs`; `meta.locale` picks.
  - `node check.mjs <audit-dir>`: exit 0 or 1. Fails on `validateAudit` errors; on any `evidence` path in `audit.json` that does not exist; on any backticked `evidence/…` path in `AUDIT.md` that does not exist; on a convention without `class`; on an opportunity in deep mode without `challenged` (`{searched: string[], result: 'held'|'weakened'}`); on `evidence/` over 15 MB (warning only, exit 0).
  - `AUDIT.example.md`: the quality bar for the agent-written file. Sections: `0. Frame`, `1. Keep (legibility codes)`, `2. Break (clichés)`, `3. Risky breaks`, `4. Open territories`, `5. For brand-kit` (reference competitor for the swap test, the category duel pair as two image paths, seed for the Not list), `6. Limits`. Numbered rules, each ending with its count (`6 of 8`) and an `evidence/…` path. Under 120 lines.

- [ ] **Step 1: Failing tests.** `renderLandscape(example, fr)` contains every panel brand name, no `http://` or `https://` in a `src` or `href` attribute other than panel URLs, and the three convention classes in French. `check` on a temp copy of the example with its evidence stubbed: exit 0; remove one evidence file: exit 1 and the path is printed; `AUDIT.md` citing a missing file: exit 1; convention without class: exit 1.
- [ ] **Step 2: Run, expect failure. Step 3: Implement. Step 4: Run, expect pass.**
- [ ] **Step 5: Render the example with stub images, open `landscape.html` in Chromium at 1440 and 390 wide, look at the screenshots, fix what reads badly.**
- [ ] **Step 6: Commit** `feat(brand-audit): contact sheets, landscape board and evidence gate`.

### Task 7: The skill's prose

**Files:**
- Create: `skills/brand-audit/SKILL.md`, `skills/brand-audit/references/panel.md`, `capture.md`, `codebook.md`, `synthesis.md`, `sources.md`

**Interfaces:**
- Consumes: every CLI above, by its exact command.

Content each file must carry (the spec has the substance; this fixes where it goes):
- `SKILL.md`, under 200 lines: frontmatter description with French and English triggers and the boundary with `brand-kit` and `marketing:competitive-brief`; the one question the audit answers; mode table and how to pick; the six steps with the command for each; the single stop in deep (panel review); the three provenance labels; what to tell the user at the end (three sentences: what to keep, what to break, the strongest open territory, then the limits); public-repo warning before committing `evidence/`; degraded paths (no subagents: run in series; no Mobbin: skip; capture partial: fallback chain).
- `panel.md`: criteria per role, counts per mode (flash 8 direct and 2 aspirational; deep 10 to 12 direct, 4 to 6 indirect, 3 to 4 leaders, 5 to 8 aspirational), how to set `established`, the aspirational rule (same audience elsewhere, or same tension solved; one sentence of justification each), the scout prompt, the `self` role.
- `capture.md`: the command, how to read notes, the fallback chain in order, what `partial` excludes.
- `codebook.md`: every dimension with a one-line definition per value and the tie-break rules (logo type coded on the header logo; `combination` needs `symbol_nature`; `symbol_used_alone`), the coder prompt (inputs: 4 to 5 brands, their measures, their screenshot paths; output: JSON matching `codes`), double coding in deep.
- `synthesis.md`: thresholds, the exception test word for word from the spec, how to read the map and name its axes in plain words, the opportunity form, the sceptic prompt, recent rebrands (deep), the swap-test competitor and the category duel pair.
- `sources.md`: the three libraries, the industry slugs, the bias warning, the low-volume rule.

- [ ] **Step 1: Write the six files.**
- [ ] **Step 2: Check** every command in the prose runs as written against the example (`--help` or a dry run), and every file named in `SKILL.md` exists: `grep -o 'assets/[a-zA-Z./_-]*\|references/[a-z-]*\.md' skills/brand-audit/SKILL.md | sort -u | while read f; do test -e skills/brand-audit/$f || echo MISSING $f; done`. Expected: no output.
- [ ] **Step 3: Commit** `feat(brand-audit): skill instructions and references`.

### Task 8: brand-kit reads the audit

**Files:**
- Modify: `skills/brand-kit/SKILL.md` ("Before you start", Act 1, Act 3 swap test, "Be honest…"), `skills/brand-kit/references/tournament.md` (new section "Category duels, when an audit exists"), `skills/brand-kit/references/quick.md` (read the audit at start), `README.md` (third skill, where it sits in the process)

Exact changes:
- "Before you start": the test becomes whether `brand/tokens.json` exists. Add: if `brand/audit/AUDIT.md` exists, read it first; never launch the audit from here, mention it once if absent and the user has time.
- Act 1: when `audit.json` `framing` answers a question, state it and move on (rule 3 of the skill).
- Tournament: Mobbin duels unchanged. Add one or two category duels from `AUDIT.md` section 5, most typical against most deviant, same board, same one-line question. A choice of the deviant side twice raises confidence that the user wants out of the category.
- Swap test: use the named reference competitor.
- `BRAND.md` "Not:" list: seed from section 2.
- "Be honest": drop the "no category audit" caveat only when `meta.mode` is `deep`.

- [ ] **Step 1: Make the edits.**
- [ ] **Step 2: Check** `grep -n "brand/\` already exists" skills/brand-kit/SKILL.md` returns nothing, and `grep -c "audit" skills/brand-kit/SKILL.md` is at least 4.
- [ ] **Step 3: Commit** `feat(brand-kit): consume a brand audit when one exists`.

### Task 9: End-to-end trial on running apps

**Files:**
- Create (not committed): `brand-kit-workspace/running/brand/audit/…`
- Modify: whatever the trial breaks; `skills/brand-audit/SKILL.md` mode table with measured durations

- [ ] **Step 1: Flash run**, following `SKILL.md` as written, framing "a running app for people who run two or three times a week", French market. Record wall time per step.
- [ ] **Step 2: `node skills/brand-audit/assets/check.mjs brand-kit-workspace/running/brand/audit`.** Expected: exit 0.
- [ ] **Step 3: Look at `landscape.html` and every sheet.** Note each place the skill's text was unclear or a script was wrong; fix; add a test for script bugs.
- [ ] **Step 4: Deep run on the same directory.** Check that flash captures are reused, the sceptic's searches are recorded, `check.mjs` exits 0.
- [ ] **Step 5: Write measured durations into the mode table; commit** `fix(brand-audit): findings from the running-app trial`.
- [ ] **Step 6: Push the branch and send `landscape.html` and `AUDIT.md` from the trial to the user.**
