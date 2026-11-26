#!/usr/bin/env node
// Sample one Logosystem industry: logos of a sector beyond the panel, with the site's own
// tags (type, colour, style, subject, mood). A curated sample, never mixed with the panel.
//   node library.mjs <audit-dir> --industry health-and-wellness [--max 40]
// Low volume by design: one page request, then at most 60 images for the wall.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch, saveWebp, USER_AGENT } from './lib/browser.mjs';

const ORIGIN = 'https://logosystem.co';
const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** @returns {Array<{slug:string, name:string, image:string}>} */
export function parseList(html) {
  const out = [], seen = new Set();
  const re = /<a[^>]+href="\/logo\/([a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>/g;
  for (let m; (m = re.exec(html)); ) {
    const img = m[2].match(/<img[^>]*>/);
    const src = img && img[0].match(/src="(https:\/\/cdn\.logosystem\.co\/logos\/[^"]+)"/);
    if (!src || seen.has(m[1])) continue;
    seen.add(m[1]);
    const alt = img[0].match(/alt="([^"]*)"/);
    out.push({ slug: m[1], name: alt ? alt[1].replace(/&amp;/g, '&') : m[1], image: src[1] });
  }
  return out;
}

/**
 * The industry page embeds the whole catalogue in its Next.js payload: one request gives
 * every logo with its type, colours, industries, styles, subjects and moods.
 * @returns {Array<object>} raw catalogue entries, or [] when the payload is not there
 */
export function parseDataset(html) {
  let flight = '';
  for (const m of html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)) {
    try { flight += JSON.parse(m[1]); } catch { /* not a string chunk */ }
  }
  const key = '"logos":[';
  const start = flight.indexOf(key);
  if (start < 0) return [];
  let depth = 0, inStr = false, j = start + key.length - 1;
  for (; j < flight.length; j++) {
    const c = flight[j];
    if (inStr) { if (c === '\\') j++; else if (c === '"') inStr = false; }
    else if (c === '"') inStr = true;
    else if (c === '[') depth++;
    else if (c === ']' && --depth === 0) break;
  }
  try { return JSON.parse(flight.slice(start + key.length - 1, j + 1)).filter((l) => l && l.slug); }
  catch { return []; }
}

const FACETS = { type: 'type', colors: 'colour', styles: 'style', subjects: 'subject', moods: 'mood' };

/** Catalogue entries of one industry, normalised. `industry` is the URL slug. */
export function selectIndustry(logos, industry) {
  return logos.filter((l) => (l.industries || []).some((i) => slugify(i) === industry)).map((l) => ({
    slug: l.slug, name: l.name, url: `${ORIGIN}/logo/${l.slug}`, remote_image: l.image, image: null,
    studio: l.author || null, source: l.source_link || null,
    type: l.type ? slugify(l.type) : null,
    colours: (l.colors || []).map(slugify), styles: (l.styles || []).map(slugify),
    subjects: (l.subjects || []).map(slugify), moods: (l.moods || []).map(slugify),
  }));
}

/** Counts per facet over the whole industry sample: {type: {wordmark: {count, share}}, colour: …}. */
export function facetCounts(items) {
  const out = {};
  for (const [field, label] of [['type', 'type'], ['colours', 'colour'], ['styles', 'style'], ['subjects', 'subject'], ['moods', 'mood']]) {
    const c = {};
    for (const it of items) for (const v of new Set([].concat(it[field] || []))) c[v] = (c[v] || 0) + 1;
    out[label] = Object.fromEntries(Object.entries(c).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([v, n]) => [v, { count: n, share: +(n / items.length).toFixed(3) }]));
  }
  return out;
}

export async function sampleIndustry(auditDir, industry, max = 40) {
  max = Math.min(max, 60);
  const file = join(auditDir, 'audit.json');
  const audit = JSON.parse(await readFile(file, 'utf8'));
  const url = `${ORIGIN}/logos/${industry}`;
  const browser = await launch();
  let items = [];
  const notes = [];
  try {
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const tool = await context.newPage();
    const get = async (u) => { try { const r = await context.request.get(u, { timeout: 20000 }); return r.ok() ? r : null; } catch { return null; } };
    const list = await get(url);
    const html = list ? await list.text() : '';
    items = selectIndustry(parseDataset(html), industry);
    if (!items.length) {
      // Fallback: the few logos rendered in the markup, without tags.
      items = parseList(html).map((l) => ({ slug: l.slug, name: l.name, url: `${ORIGIN}/logo/${l.slug}`, remote_image: l.image, image: null }));
      notes.push(!list ? 'industry page not reachable' : items.length ? 'catalogue payload not found: logos kept without tags, the markup may have changed'
        : 'no logo found for this industry: check the slug, or the markup may have changed');
    }
    for (const it of items.slice(0, max)) {
      await new Promise((r) => setTimeout(r, 250));
      const img = await get(it.remote_image);
      try { if (img) { it.image = `evidence/library/${it.slug}.webp`; await saveWebp(tool, await img.body(), join(auditDir, it.image), 480, 600); } }
      catch { it.image = null; }
    }
  } finally { await browser.close(); }
  const tagged = items.filter((i) => i.type);
  audit.library = { ...(audit.library || {}),
    logosystem: { industry, url, fetched: new Date().toISOString().slice(0, 10), n: items.length, images: items.filter((i) => i.image).length,
      facets: tagged.length ? facetCounts(tagged) : null, items, notes } };
  await writeFile(file, JSON.stringify(audit, null, 2) + '\n');
  return audit.library.logosystem;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const args = process.argv.slice(2);
  const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
  const industry = opt('--industry');
  if (!args[0] || args[0].startsWith('--') || !industry) { console.log('usage: node library.mjs <audit-dir> --industry <slug> [--max 40]'); process.exit(args.includes('--help') ? 0 : 1); }
  const r = await sampleIndustry(args[0], industry, +(opt('--max') || 40));
  console.log(`${r.n} logos in ${r.url}, ${r.images} images saved`);
  for (const [facet, counts] of Object.entries(r.facets || {}))
    console.log(`${facet.padEnd(8)} ` + Object.entries(counts).slice(0, 6).map(([v, c]) => `${v} ${c.count}`).join(' · '));
  for (const n of r.notes) console.log('note: ' + n);
}
