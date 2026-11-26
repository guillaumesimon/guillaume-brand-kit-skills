#!/usr/bin/env node
// Get one usable image per reference of brief.json, and a contact sheet to look at before anything is shown.
//   node fetch.mjs <brief-dir> [--only id,id] [--force] [--concurrency 4]
//   node fetch.mjs <brief-dir> --reject id,id "why"     the image does not show the brand: drop it
//   node fetch.mjs --check                              verify that Playwright and Chromium work
// A reference gives `image_url` (a picture: a campaign, a pack, a press image) and/or `url` (a page to capture;
// `shot_url` when the page worth capturing is not the home page). The picture is tried first.
// A capture that shows a cookie banner, a region picker or a bot challenge makes the user judge something
// other than the brand, so the script closes what it can, marks what it cannot, and never hides a failure.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readBrief, writeBrief } from './lib/schema.mjs';
import { launch, saveWebp, probe, USER_AGENT } from './lib/browser.mjs';

const BLOCKED = /just a moment|attention required|access denied|are you a (robot|human)|verify you are human|pardon our interruption|captcha|unusual traffic|403 forbidden|request blocked/i;
const DOWN = /maintenance|we.?re working on it|be right back|temporarily unavailable|site (is )?under construction|coming soon|page not found|\b404\b/i;
const ACCEPT = /^\s*(tout accepter|accepter et fermer|accepter tout|accepter les cookies|accepter|j.accepte|ok pour moi|continuer sans accepter|accept all cookies|accept all|accept cookies|accept|allow all|agree|i agree|got it|ok|alle akzeptieren|akzeptieren|aceptar todo|aceptar|accetta tutti|accetta)\s*$/i;
const OVERLAY = /cookie|consent|rgpd|gdpr|vie privée|confidentialité|privacy|traceurs|choose (another|your) (country|region)|select your (country|region)|choisissez votre (pays|région)|viewing our website for|looks like you.?re in|vous consultez le site|newsletter|subscribe|inscrivez-vous|télécharger l.app|download the app|chat now|chat with (us|sales)|discuter avec/i;

/** Click the first visible consent button, in the page or in any of its frames. */
async function dismissConsent(page) {
  for (const frame of page.frames()) {
    try {
      const btn = frame.getByRole('button', { name: ACCEPT }).first();
      if (await btn.isVisible({ timeout: 300 })) { await btn.click({ timeout: 1500 }); await page.waitForTimeout(700); return true; }
    } catch { /* next frame */ }
  }
  return false;
}

/** Hide what still sits on top of the page: banners, modals, region pickers. Returns how many were hidden. */
function hideOverlays(page) {
  return page.evaluate((src) => {
    const re = new RegExp(src, 'i'), vw = innerWidth, vh = innerHeight;
    let n = 0;
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky' && el.getAttribute('aria-modal') !== 'true' && el.getAttribute('role') !== 'dialog') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const modal = el.getAttribute('aria-modal') === 'true' || el.getAttribute('role') === 'dialog';
      const covers = r.width * r.height > vw * vh * 0.6 && cs.position === 'fixed';
      // A fixed header is part of the brand; a fixed block that talks about cookies or covers the page is not.
      const text = el.innerText || '';
      // A bar at the top is usually the site's own header, logo included: it goes only when it is plainly a notice.
      const header = r.top <= 4 && r.height < vh * 0.3;
      const notice = header ? text.length < 400 && /cookie|consent|country|region|pays|région/i.test(text) : re.test(text);
      if (modal || covers || notice) { el.style.setProperty('display', 'none', 'important'); n++; }
    }
    for (const el of [document.documentElement, document.body]) { el.style.setProperty('overflow', 'visible', 'important'); el.style.setProperty('position', 'static', 'important'); }
    return n;
  }, OVERLAY.source);
}

/**
 * The colours a visitor actually sees on the first screen, largest surface first: backgrounds by the
 * area they cover, then the colours of buttons and large text. Measured, never recalled.
 * @returns {Promise<string[]>} up to five hex colours
 */
export function measurePalette(page) {
  return page.evaluate(() => {
    const area = new Map(), vw = innerWidth, vh = innerHeight;
    const hex = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).map(Number); return a < 0.5 ? null : '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join(''); };
    const add = (c, n) => { const h = hex(c); if (h) area.set(h, (area.get(h) || 0) + n); };
    // A page that sets no background is white: the browser's own canvas.
    const canvas = hex(getComputedStyle(document.body).backgroundColor) || hex(getComputedStyle(document.documentElement).backgroundColor) || '#ffffff';
    area.set(canvas, vw * vh);
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8 || r.top > vh || r.bottom < 0) continue;
      const cs = getComputedStyle(el), seen = Math.min(r.width, vw) * (Math.min(r.bottom, vh) - Math.max(r.top, 0));
      add(cs.backgroundColor, seen);
      if (/^(A|BUTTON)$/.test(el.tagName) && seen < vw * vh * 0.05) add(cs.backgroundColor, seen * 6);
      if (parseFloat(cs.fontSize) >= 28 && el.childElementCount === 0 && el.textContent.trim()) add(cs.color, seen * 0.6);
    }
    const far = (a, b) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const [x, y] = [p(a), p(b)]; return Math.abs(x[0] - y[0]) + Math.abs(x[1] - y[1]) + Math.abs(x[2] - y[2]) > 48; };
    const out = [];
    for (const [h] of [...area.entries()].sort((a, b) => b[1] - a[1])) { if (out.every((o) => far(o, h))) out.push(h); if (out.length === 5) break; }
    return out;
  });
}

/**
 * The sentences the brand sets largest on the page, as written. They are the raw material of a
 * subject about tone: quoted from the source, never recalled.
 * @returns {Promise<string[]>} up to six sentences, largest first
 */
export function readCopy(page) {
  return page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('h1,h2,h3,p,[class*="title" i],[class*="headline" i]')) {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (r.width < 40 || r.height < 10 || cs.visibility === 'hidden' || cs.display === 'none' || r.top > innerHeight * 2.5) continue;
      const text = (el.innerText || '').replace(/\s+/g, ' ').trim();
      if (text.length < 12 || text.length > 160 || text.split(' ').length < 3) continue;
      out.push({ text, size: parseFloat(cs.fontSize) });
    }
    const seen = new Set();
    return out.sort((a, b) => b.size - a.size).filter((x) => !seen.has(x.text.toLowerCase()) && seen.add(x.text.toLowerCase())).slice(0, 6).map((x) => x.text);
  });
}

/** @returns {{status:'ok'|'blocked'|'failed', via:'page', notes:string[], buffer?:Buffer}} */
export async function capturePage(browser, url, { locale = 'fr-FR' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale, userAgent: USER_AGENT });
  const page = await ctx.newPage(), notes = [];
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(1200);
    const read = async () => `${await page.title()} ${(await page.evaluate(() => document.body?.innerText || '')).slice(0, 600)}`;
    let text = await read();
    if ((res && res.status() >= 400) || BLOCKED.test(text)) return { status: 'blocked', via: 'page', notes: [`the site refused the visit (${res ? res.status() : 'no response'})`] };
    if (await dismissConsent(page)) notes.push('consent banner closed');
    const hidden = await hideOverlays(page);
    if (hidden) notes.push(`${hidden} overlay${hidden > 1 ? 's' : ''} hidden`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    text = await read();
    if (DOWN.test(text.slice(0, 300))) return { status: 'failed', via: 'page', notes: ['maintenance, error or placeholder page'] };
    const thin = await page.evaluate(() => (document.body?.innerText || '').trim().length < 60 && document.images.length < 2 && !document.querySelector('video,canvas,svg'));
    if (thin) return { status: 'failed', via: 'page', notes: ['the page rendered almost nothing'] };
    return { status: 'ok', via: 'page', notes, buffer: await page.screenshot({ type: 'png' }), palette: await measurePalette(page), copy: await readCopy(page) };
  } catch (e) {
    return { status: 'failed', via: 'page', notes: [String(e.message).split('\n')[0].slice(0, 140)] };
  } finally { await ctx.close(); }
}

/** @returns {{status:'ok'|'failed', via:'image', notes:string[], buffer?:Buffer, type?:string}} */
export async function downloadImage(url, { logo = false } = {}) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': USER_AGENT, accept: 'image/*' }, signal: AbortSignal.timeout(20000) });
    const type = (res.headers.get('content-type') || '').split(';')[0];
    if (!res.ok || !(logo ? /^image\/(png|jpeg|webp|gif|avif|svg\+xml)$/ : /^image\/(png|jpeg|webp|gif|avif)$/).test(type)) return { status: 'failed', via: 'image', notes: [`not a picture (${res.status} ${type || 'no type'})`] };
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < (logo ? 150 : 8000)) return { status: 'failed', via: 'image', notes: ['picture too small to judge a brand on'] };
    return { status: 'ok', via: 'image', notes: [], buffer, type };
  } catch (e) { return { status: 'failed', via: 'image', notes: [String(e.message).slice(0, 140)] }; }
}

/** One labelled grid of every image, so that all of them are looked at in one read. */
export async function contactSheet(browser, dir, tiles, out) {
  const { readFileSync } = await import('node:fs');
  const MIME = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif' };
  const cells = tiles.map((t) => `<figure><img src="data:${MIME[t.asset.split('.').pop()]};base64,${readFileSync(join(dir, t.asset)).toString('base64')}"><figcaption><b>${t.label}</b>${t.notes?.length ? ` · ${t.notes.join(', ')}` : ''}${t.palette?.length ? `<span>${t.palette.map((c) => `<i style="background:${c}"></i>`).join('')}</span>` : ''}</figcaption></figure>`).join('');
  const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
  await page.setContent(`<style>body{margin:16px;font:13px/1.4 sans-serif;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}figure{margin:0}img{width:100%;height:300px;object-fit:contain;background:#f2f2f2;outline:1px solid #ccc}figcaption{margin-top:4px}span{display:flex;margin-top:4px}i{width:28px;height:14px;outline:1px solid #ccc}</style>${cells}`);
  await saveWebp(page, await page.screenshot({ type: 'png', fullPage: true }), out, 1500, 6000);
  await page.close();
}

export async function run(dir, { only = null, force = false, concurrency = 4 } = {}) {
  const brief = readBrief(dir);
  const todo = (brief.references || []).filter((r) => (!only || only.includes(r.id)) && (force || r.capture?.status !== 'rejected') && (force || !r.asset || !existsSync(join(dir, r.asset))));
  mkdirSync(join(dir, 'evidence'), { recursive: true });
  let browser = null;
  try { browser = await launch(); } catch (e) { console.log(`No browser: ${String(e.message).split('\n')[0]}\nPictures are downloaded as they are; pages cannot be captured.`); }
  const helper = browser && await browser.newPage();
  const locale = brief.meta?.market_locale || 'fr-FR';
  const queue = [...todo];
  /** Get one picture for a reference or one of its materials: the direct picture first, then a capture of the page. */
  const get = async (t, base, logo = false) => {
    let got = { status: 'failed', notes: ['no image_url and no url'] };
    if (t.image_url) got = await downloadImage(t.image_url, { logo });
    if (got.status !== 'ok' && (t.shot_url || t.url)) {
      const before = got.notes;
      got = browser ? await capturePage(browser, t.shot_url || t.url, { locale }) : { status: 'failed', via: 'page', notes: ['no browser to capture the page'] };
      if (t.image_url) got.notes = [...got.notes, `picture failed first: ${before.join(', ')}`];
    }
    let asset = null;
    if (got.status === 'ok') {
      const raw = !helper || got.type === 'image/svg+xml';
      asset = raw ? `${base}.${got.type.split('/')[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg')}` : `${base}.webp`;
      try {
        if (raw) writeFileSync(join(dir, asset), got.buffer);
        else await Promise.race([saveWebp(helper, got.buffer, join(dir, asset), 1600, 1200), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 15000))]);
      } catch { asset = null; got = { ...got, status: 'failed', notes: [...got.notes, 'the picture could not be read'] }; }
    }
    return { asset, palette: got.palette, copy: got.copy, capture: { status: got.status, via: got.via || null, notes: got.notes, at: new Date().toISOString().slice(0, 10) } };
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length || 1) }, async () => {
    for (let r; (r = queue.shift());) {
      const main = await get(r, `evidence/${r.id}`);
      delete r.asset;
      if (main.asset) r.asset = main.asset;
      if (main.palette?.length) r.palette = main.palette;
      if (main.copy?.length) r.copy = main.copy;
      r.capture = main.capture;
      console.log(`${main.capture.status.padEnd(7)} ${r.id}${main.capture.notes.length ? `  (${main.capture.notes.join('; ')})` : ''}`);
      // Other material of the same brand: a logo, a campaign visual, a pack. One file each.
      for (const [name, mat] of Object.entries(r.materials || {})) {
        const got = await get(mat, `evidence/${r.id}-${name}`, name === 'logo' || mat.kind === 'logo');
        delete mat.asset;
        if (got.asset) mat.asset = got.asset;
        mat.capture = got.capture;
        console.log(`${got.capture.status.padEnd(7)} ${r.id} · ${name}${got.capture.notes.length ? `  (${got.capture.notes.join('; ')})` : ''}`);
      }
    }
  }));
  const shown = (brief.references || []).filter((r) => r.asset && existsSync(join(dir, r.asset)));
  const sheets = [];
  const tiles = shown.flatMap((r) => [{ label: `${r.id} ${r.name}`, asset: r.asset, notes: r.capture?.notes, palette: r.palette },
    ...Object.entries(r.materials || {}).filter(([, m]) => m.asset && existsSync(join(dir, m.asset))).map(([n, m]) => ({ label: `${r.id} · ${n}`, asset: m.asset, notes: m.capture?.notes }))]);
  if (browser && tiles.length) {
    for (let i = 0; i < tiles.length; i += 12) {
      const out = `evidence/sheet-${i / 12 + 1}.webp`;
      await contactSheet(browser, dir, tiles.slice(i, i + 12), join(dir, out));
      sheets.push(out);
    }
  }
  if (browser) await browser.close();
  writeBrief(dir, brief);
  const bad = (brief.references || []).filter((r) => r.capture && r.capture.status !== 'ok');
  console.log(`\n${shown.length} image${shown.length === 1 ? '' : 's'} ready, ${bad.length} without one${bad.length ? ` (${bad.map((r) => r.id).join(', ')})` : ''}.`);
  console.log(sheets.length ? `Look at ${sheets.map((s) => join(dir, s)).join(', ')} before building a round. Reject what does not show the brand:\n  node fetch.mjs ${dir} --reject <id,id> "<why>"` : 'No contact sheet without a browser: open each image before building a round.');
  return { shown: shown.map((r) => r.id), bad: bad.map((r) => r.id), sheets };
}

/** The agent looked and the image does not show the brand. It leaves the pool, with the reason. */
export function reject(dir, ids, why) {
  const brief = readBrief(dir);
  for (const r of brief.references || []) {
    if (!ids.includes(r.id)) continue;
    delete r.asset;
    r.capture = { ...(r.capture || {}), status: 'rejected', notes: [why || 'the image does not show the brand'], at: new Date().toISOString().slice(0, 10) };
  }
  writeBrief(dir, brief);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2), opt = (n) => { const i = args.indexOf(`--${n}`); return i < 0 ? undefined : args[i + 1]; };
  if (args.includes('--check')) { try { console.log(`ok: Chromium ${await probe()}`); process.exit(0); } catch (e) { console.log(String(e.message).split('\n')[0]); process.exit(1); } }
  const dir = args[0];
  if (!dir || dir.startsWith('--')) { console.log('usage: node fetch.mjs <brief-dir> [--only id,id] [--force] [--concurrency 4]\n       node fetch.mjs <brief-dir> --reject id,id "why"\n       node fetch.mjs --check'); process.exit(1); }
  if (opt('reject')) { reject(dir, opt('reject').split(','), args[args.indexOf('--reject') + 2]); console.log('Rejected. Give the reference another image_url or shot_url and run fetch.mjs --only <id> --force, or leave it out.'); }
  else await run(dir, { only: opt('only')?.split(','), force: args.includes('--force'), concurrency: Number(opt('concurrency')) || 4 });
}
