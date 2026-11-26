#!/usr/bin/env node
// Assemble the moodboard of each creative territory: about ten real, sourced images.
//   node moodboard.mjs <audit-dir>
// Reads synthesis.territories[].moodboard_plan and writes .moodboard and evidence/territories/<id>/.
// A plan has three sources, each image with the one mechanism it is there to show:
//   panel:   [{ asset: "evidence/on/media-1.webp", note }]            images already captured
//   library: [{ tags: ["serif", "calm"], n: 2, note }]                 logos from the Logosystem catalogue, any industry
//   web:     [{ url: "https://…", note }]                              a page whose main image is the reference
// Nothing is generated or invented: an image that cannot be fetched is left out and reported.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch, saveWebp, USER_AGENT } from './lib/browser.mjs';
import { parseDataset } from './library.mjs';

const slug = (s) => String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Logos of the catalogue carrying every tag, in catalogue order, skipping those already used. */
export function pickLibrary(logos, tags, n = 2, used = new Set()) {
  const want = tags.map(slug);
  const out = [];
  for (const l of logos) {
    if (out.length >= n) break;
    if (!l.slug || !l.image || used.has(l.slug)) continue;
    const have = new Set([l.type, ...(l.colors || []), ...(l.styles || []), ...(l.subjects || []), ...(l.moods || []), ...(l.industries || []), ...(l.tags || [])].filter(Boolean).map(slug));
    if (want.every((t) => have.has(t))) { out.push(l); used.add(l.slug); }
  }
  return out;
}

export async function buildMoodboards(auditDir, { only = null } = {}) {
  const file = join(auditDir, 'audit.json');
  const audit = JSON.parse(await readFile(file, 'utf8'));
  const territories = (audit.synthesis?.territories || []).filter((t) => t.moodboard_plan && (!only || only.includes(t.id)));
  if (!territories.length) return { audit, report: [] };
  const browser = await launch();
  const report = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: USER_AGENT });
    const tool = await context.newPage(), page = await context.newPage();
    const get = async (u) => { try { const r = await context.request.get(u, { timeout: 20000 }); return r.ok() ? await r.body() : null; } catch { return null; } };
    let catalogue = null;
    const used = new Set();
    for (const t of territories) {
      if (!/^[a-z0-9][a-z0-9-]*$/i.test(t.id)) throw new Error(`territory id "${t.id}" is not usable as a folder name`);
      const dir = join(auditDir, 'evidence', 'territories', t.id);
      await mkdir(dir, { recursive: true });
      const board = [], missed = [];
      let n = 0;
      const save = async (buf, source, kind, note) => {
        const rel = `evidence/territories/${t.id}/${String(++n).padStart(2, '0')}.webp`;
        try { await saveWebp(tool, buf, join(auditDir, rel), 1000, 1000); board.push({ file: rel, source, kind, note }); }
        catch { n--; missed.push(`${source}: image could not be decoded`); }
      };
      for (const p of t.moodboard_plan.panel || []) {
        if (existsSync(join(auditDir, p.asset))) { const b = audit.panel.find((x) => p.asset.startsWith(`evidence/${x.id}/`)); board.push({ file: p.asset, source: b ? b.url : 'panel', kind: 'panel', note: p.note }); }
        else missed.push(`${p.asset}: not in evidence`);
      }
      for (const q of t.moodboard_plan.library || []) {
        if (!catalogue) { const html = await get('https://logosystem.co/logos/tech'); catalogue = html ? parseDataset(html.toString()) : []; }
        const picks = pickLibrary(catalogue, q.tags, q.n || 2, used);
        if (!picks.length) missed.push(`library [${q.tags.join(', ')}]: no logo carries all these tags`);
        for (const l of picks) { const buf = await get(l.image); if (buf) await save(buf, `https://logosystem.co/logo/${l.slug}`, 'library', `${q.note} (${l.name}${l.author ? ', ' + l.author : ''})`); await new Promise((r) => setTimeout(r, 250)); }
      }
      for (const w of t.moodboard_plan.web || []) {
        try {
          let buf = /\.(jpe?g|png|webp|avif)(\?|$)/i.test(w.url) ? await get(w.url) : null;
          if (!buf) {
            const res = await page.goto(w.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            if (!res || res.status() >= 400) { missed.push(`${w.url}: http ${res ? res.status() : 'error'}`); continue; }
            await page.waitForTimeout(2000);
            const og = await page.evaluate(() => document.querySelector('meta[property="og:image"], meta[name="twitter:image"]')?.content || null);
            buf = og ? await get(new URL(og, w.url).href) : null;
            if (!buf) { // no social image: the largest picture on the page
              const ok = await page.evaluate(() => { let best = null, area = 0; for (const el of document.querySelectorAll('img')) { const r = el.getBoundingClientRect(); if (r.width * r.height > area && r.width > 300) { best = el; area = r.width * r.height; } } if (best) best.setAttribute('data-ba-ref', '1'); return !!best; });
              if (ok) buf = await page.locator('[data-ba-ref]').first().screenshot({ type: 'png', timeout: 6000 }).catch(() => null);
            }
          }
          if (buf) await save(buf, w.url, 'web', w.note); else missed.push(`${w.url}: no usable image`);
        } catch (e) { missed.push(`${w.url}: ${String(e.message).split('\n')[0].slice(0, 80)}`); }
      }
      t.moodboard = board;
      if (missed.length) t.moodboard_missed = missed; else delete t.moodboard_missed;
      report.push({ id: t.id, images: board.length, missed });
    }
  } finally { await browser.close(); }
  await writeFile(file, JSON.stringify(audit, null, 2) + '\n');
  return { audit, report };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const dir = process.argv[2];
  if (!dir || dir.startsWith('--')) { console.log('usage: node moodboard.mjs <audit-dir> [--only territory-id,…]'); process.exit(dir === '--help' ? 0 : 1); }
  const o = process.argv.indexOf('--only');
  const { report } = await buildMoodboards(dir, { only: o > 0 ? process.argv[o + 1].split(',') : null });
  for (const r of report) { console.log(`${r.id}: ${r.images} images`); for (const m of r.missed) console.log('  missed ' + m); }
  if (!report.length) console.log('no territory has a moodboard_plan');
}
