#!/usr/bin/env node
// Visit every brand of the panel, screenshot it and measure what is really rendered.
//   node capture.mjs <audit-dir> [--only id,id] [--concurrency 4]
// Reads <audit-dir>/audit.json, writes evidence/<id>/… and updates audit.json in place.
// Brands that already have a `capture` value are skipped unless named with --only.
// --only re-captures from scratch: that brand's evidence folder is deleted first, files added by hand included.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch, saveWebp, USER_AGENT } from './lib/browser.mjs';
import { palette, parseColor, classify, toHex } from './lib/color.mjs';

const TILE = 1500; // height of one scroll tile, in page pixels
const BLOCK_TITLE = /just a moment|attention required|access denied|are you a robot|verify you are human|pardon our interruption/i;
const ERROR_PAGE = /un probl[eè]me est survenu|something went wrong|page (introuvable|not found)|une erreur (est survenue|s'est produite)|404 not found|service unavailable|temporarily unavailable/i;
const CONSENT = /^(tout |i |j')?(accept|autoris|allow|agree|ok$|got it|d'accord)/i;
const LOGO_SELECTOR = 'header a[href="/"] svg, header a[href="/"] img, [class*="logo" i] svg, [class*="logo" i] img, header svg, header img';

/* Runs in the page. Returns raw samples; the classification happens in Node. */
function measureInPage(logoSelector) {
  const vw = innerWidth, LIMIT = 2400;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > LIMIT) return null;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return null;
    return { r, cs };
  };
  const bg = [], text = [], fonts = {}, accentBg = {}, accentText = {}, radii = {};
  const rootBg = [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.documentElement).backgroundColor]
    .find((c) => c && !/rgba?\(0, 0, 0, 0\)|transparent/.test(c)) || 'rgb(255, 255, 255)';
  bg.push({ color: rootBg, weight: vw * 900 });
  let headline = null;
  for (const el of document.querySelectorAll('body *')) {
    const v = visible(el); if (!v) continue;
    const { r, cs } = v;
    const area = Math.min(r.width, vw) * Math.min(r.height, LIMIT);
    bg.push({ color: cs.backgroundColor, weight: area });
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (own.length) {
      text.push({ color: cs.color, weight: own.length });
      const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      const key = family + '|' + cs.fontWeight;
      fonts[key] = (fonts[key] || 0) + own.length;
      const size = parseFloat(cs.fontSize);
      if (own.length >= 8 && r.top < 1200 && (!headline || size > headline.size_px) && !el.closest('[role="dialog"], [aria-modal="true"], [class*="cookie" i], [class*="consent" i], [id*="cookie" i], [id*="consent" i]'))
        headline = { text: own.slice(0, 120), family: cs.fontFamily, size_px: size, weight: +cs.fontWeight || cs.fontWeight,
          tracking_em: cs.letterSpacing === 'normal' ? 0 : +(parseFloat(cs.letterSpacing) / size).toFixed(3) };
    }
    if (el.matches('a, button, [role="button"], input[type="submit"]')) {
      accentBg[cs.backgroundColor] = (accentBg[cs.backgroundColor] || 0) + 1;
      accentText[cs.color] = (accentText[cs.color] || 0) + 1;
      const filled = !/rgba?\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor);
      if (filled && r.height >= 24 && r.height <= 80 && r.width >= 48) {
        const rad = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, r.height / 2);
        radii[Math.round(rad)] = (radii[Math.round(rad)] || 0) + 1;
      }
    }
  }
  const h1 = document.querySelector('h1');
  // The h1 is the headline unless it is an eyebrow: much smaller than the biggest line near the top.
  const h1Size = h1 && visible(h1) ? parseFloat(getComputedStyle(h1).fontSize) : 0;
  if (h1Size && h1.innerText.trim().length >= 4 && (!headline || h1Size >= headline.size_px * 0.6)) {
    const cs = getComputedStyle(h1), size = parseFloat(cs.fontSize);
    headline = { text: h1.innerText.trim().replace(/\s+/g, ' ').slice(0, 120), family: cs.fontFamily, size_px: size, weight: +cs.fontWeight || cs.fontWeight,
      tracking_em: cs.letterSpacing === 'normal' ? 0 : +(parseFloat(cs.letterSpacing) / size).toFixed(3) };
  }
  // Logo: first candidate with a plausible box near the top. Marked so Node can screenshot it.
  let logo = null;
  for (const el of document.querySelectorAll(logoSelector)) {
    const r = el.getBoundingClientRect();
    if (el.closest('button, [role="button"], [aria-label*="menu" i], [class*="burger" i], [class*="menu-toggle" i]')) continue; // a menu or search icon
    if (r.width >= 16 && r.width <= 400 && r.height >= 8 && r.top >= 0 && r.top < 200) {
      // A logo is often a symbol and a wordmark as two graphics in one link: take the link.
      const box = el.closest('a, [class*="logo" i]');
      const br = box && box.getBoundingClientRect();
      const whole = box && box.querySelectorAll('svg, img').length > 1 && br.width <= 400 && br.height <= 120 && br.top >= 0;
      (whole ? box : el).setAttribute('data-brand-audit-logo', '1');
      if (whole) { logo = { tag: 'group', width: Math.round(br.width), height: Math.round(br.height), svg: null, src: null }; break; }
      let svg = null;
      if (el.tagName.toLowerCase() === 'svg') {
        const c = el.cloneNode(true);
        c.removeAttribute('data-brand-audit-logo');
        c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        c.setAttribute('color', getComputedStyle(el).color);
        if (!c.getAttribute('viewBox')) c.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
        svg = c.outerHTML;
      }
      logo = { tag: el.tagName.toLowerCase(), width: Math.round(r.width), height: Math.round(r.height), svg, src: el.currentSrc || el.src || null };
      break;
    }
  }
  const icons = [...document.querySelectorAll('link[rel="apple-touch-icon"], link[rel~="icon"]')]
    .map((l) => ({ href: l.href, apple: /apple/.test(l.rel), size: parseInt((l.sizes && l.sizes.value) || '0', 10) || 0 }))
    .sort((a, b) => (b.apple - a.apple) || (b.size - a.size));
  const count = (sel, min = 0) => [...document.querySelectorAll(sel)].filter((el) => { const r = el.getBoundingClientRect(); return r.width > min && r.height > min; }).length;
  const leadText = [...document.querySelectorAll('h1, h2')].slice(0, 4).map((h) => h.innerText).join(' ').slice(0, 300);
  return { title: document.title, leadText, bodyText: (document.body.innerText || '').trim().length, bg, text, fonts, accentBg, accentText, radii, headline, logo,
    icon: icons[0]?.href || null, media: { img: count('img', 48), video: count('video'), svg: count('svg', 48), canvas: count('canvas', 48) } };
}

function topNonNeutral(counts) {
  const best = Object.entries(counts)
    .map(([color, n]) => ({ c: parseColor(color), n }))
    .filter((x) => x.c && x.c.a >= 0.5 && classify(x.c).hue !== 'neutral')
    .sort((a, b) => b.n - a.n)[0];
  return best ? toHex(best.c) : null;
}

export function summarise(raw) {
  const pal = palette(raw.bg);
  const top = pal[0] ? classify(parseColor(pal[0].hex)) : { hue: 'neutral', lightness: 1 };
  const ground = top.hue !== 'neutral' && top.lightness < 0.85 ? 'coloured' : top.lightness < 0.35 ? 'dark' : 'light';
  const total = Object.values(raw.fonts).reduce((a, b) => a + b, 0) || 1;
  const fonts = Object.entries(raw.fonts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, n]) => {
    const [family, weight] = k.split('|');
    return { family, weight: +weight || weight, share: +(n / total).toFixed(3) };
  });
  const radius = Object.entries(raw.radii).sort((a, b) => b[1] - a[1])[0];
  return {
    palette: pal, accent: topNonNeutral(raw.accentBg) || topNonNeutral(raw.accentText), ground, fonts,
    headline: raw.headline, button_radius_px: radius ? +radius[0] : null, media: raw.media,
  };
}

async function fetchBuffer(context, url) {
  try { const r = await context.request.get(url, { timeout: 15000 }); return r.ok() ? await r.body() : null; }
  catch { return null; }
}

/**
 * Capture one brand. Never throws for a site problem: the outcome is in `capture` and `notes`.
 * @returns {Promise<{capture:'full'|'partial'|'none', measures:object|null, evidence:string[], logo:string|null, notes:string[]}>}
 */
export async function captureBrand(browser, brand, outDir, opts = {}) {
  const dir = join(outDir, brand.id);
  await rm(dir, { recursive: true, force: true }); // a re-capture starts clean: no stale screenshot of an earlier state
  await mkdir(dir, { recursive: true });
  const notes = [], evidence = [];
  const rel = (f) => `evidence/${brand.id}/${f}`;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: USER_AGENT, locale: opts.locale || 'en-US' });
  const tool = await context.newPage();
  const page = await context.newPage();
  const shot = async (p, file, o = {}, maxW = 1600, maxH = 1600) => {
    await saveWebp(tool, await p.screenshot({ type: 'png', ...o }), join(dir, file), maxW, maxH);
    evidence.push(rel(file));
  };
  try {
    let status = 0;
    try {
      const res = await page.goto(brand.url, { waitUntil: 'domcontentloaded', timeout: opts.timeout || 45000 });
      status = res ? res.status() : 0;
    } catch (e) {
      notes.push(`navigation failed: ${String(e.message).split('\n')[0].slice(0, 160)}`);
      return { capture: 'none', measures: null, evidence, logo: null, notes };
    }
    await page.waitForTimeout(opts.settle ?? 3000);
    try {
      const btn = page.getByRole('button', { name: CONSENT }).first();
      if (await btn.isVisible({ timeout: 500 })) { await btn.click({ timeout: 2000 }); await page.waitForTimeout(600); notes.push('consent banner dismissed'); }
    } catch { /* no banner, or not clickable */ }

    let raw = await page.evaluate(measureInPage, LOGO_SELECTOR);
    let blocked = status >= 400 ? `http ${status}` : BLOCK_TITLE.test(raw.title) ? `challenge title "${raw.title}"` : null;
    if (!blocked && raw.bodyText < 200) {
      await page.waitForTimeout(opts.settle ?? 2000);
      raw = await page.evaluate(measureInPage, LOGO_SELECTOR);
      if (raw.bodyText < 200) blocked = `page has ${raw.bodyText} characters of text`;
    }
    const saveLogo = async () => {
      if (!raw.logo) return null;
      try {
        const el = page.locator('[data-brand-audit-logo]').first();
        await saveWebp(tool, await el.screenshot({ type: 'png', timeout: 5000 }), join(dir, 'logo.webp'), 800, 800);
        evidence.push(rel('logo.webp'));
        if (raw.logo.svg) { await writeFile(join(dir, 'logo.svg'), raw.logo.svg); evidence.push(rel('logo.svg')); }
        return rel('logo.webp');
      } catch { notes.push('logo found but could not be saved'); return null; }
    };
    if (!blocked) {
      const lead = `${raw.headline?.text || ''} ${raw.leadText || ''}`;
      if (ERROR_PAGE.test(lead)) blocked = `error page ("${lead.match(ERROR_PAGE)[0]}")`;
    }
    if (blocked) {
      notes.push(`blocked: ${blocked}`);
      await shot(page, 'blocked.webp');
      // An error page often still carries the real header: keep the logo for the wall.
      const logo = status < 400 && !BLOCK_TITLE.test(raw.title) ? await saveLogo() : null;
      // The site would not show itself; its App Store listing still can.
      const app = await appStore(context, tool, brand, dir, opts.country || 'us', evidence, notes, rel);
      return { capture: 'partial', measures: null, evidence, logo, notes, app_store: app };
    }

    const measures = summarise(raw);
    await writeFile(join(dir, 'measures.json'), JSON.stringify({ url: brand.url, title: raw.title, ...measures,
      logo_box: raw.logo && { tag: raw.logo.tag, width: raw.logo.width, height: raw.logo.height } }, null, 2));
    evidence.push(rel('measures.json'));
    await shot(page, 'desktop.webp');

    const logo = await saveLogo();
    if (!logo) notes.push('logo not found');
    if (raw.icon) {
      const buf = await fetchBuffer(context, raw.icon);
      try { if (buf) { await saveWebp(tool, buf, join(dir, 'icon.webp'), 512, 512); evidence.push(rel('icon.webp')); } }
      catch { notes.push('icon could not be decoded'); }
    }

    // The whole home page, not only its first screen: scroll once so lazy content loads, then
    // keep an overview and the next screens as readable tiles.
    const height = await page.evaluate(async () => {
      const step = innerHeight, max = Math.min(document.documentElement.scrollHeight, 12000);
      for (let y = 0; y < max; y += step) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      scrollTo(0, 0); await new Promise((r) => setTimeout(r, 300));
      return document.documentElement.scrollHeight;
    }).catch(() => 900);
    await shot(page, 'full.webp', { fullPage: true }, 720, 3600).catch(() => notes.push('full-page screenshot failed'));
    for (let k = 1; k <= 3 && k * TILE < height - 200; k++) {
      await shot(page, `scroll-${k + 1}.webp`, { fullPage: true, clip: { x: 0, y: k * TILE, width: 1440, height: Math.min(TILE, height - k * TILE) } }, 1100, 1100)
        .catch(() => notes.push(`scroll tile ${k + 1} failed`));
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(800);
    await shot(page, 'mobile.webp', {}, 780, 1688).catch(() => notes.push('mobile screenshot failed'));

    // Inner pages: the home page alone is a thin sample of a brand.
    await page.setViewportSize({ width: 1440, height: 900 });
    let n = 0;
    for (const url of (opts.extraUrls || brand.extra_urls || []).slice(0, 2)) {
      n++;
      try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); await page.waitForTimeout(opts.settle ?? 2500); await shot(page, `page-${n}.webp`); }
      catch { notes.push(`inner page ${n} failed: ${url}`); }
    }
    const app = await appStore(context, tool, brand, dir, opts.country || 'us', evidence, notes, rel);
    return { capture: 'full', measures, evidence, logo, notes, app_store: app };
  } finally {
    await context.close();
  }
}

/** The App Store listing: icon, first screenshots and the words the brand uses about itself. */
async function appStore(context, tool, brand, dir, country, evidence, notes, rel) {
  if (!brand.app_store_term) return null;
  const url = `https://itunes.apple.com/search?entity=software&limit=1&country=${encodeURIComponent(country)}&term=${encodeURIComponent(brand.app_store_term)}`;
  try {
    const buf = await fetchBuffer(context, url);
    const app = buf && JSON.parse(buf.toString()).results?.[0];
    if (!app) { notes.push('app store: no result'); return null; }
    const files = [[app.artworkUrl512, 'app-icon.webp', 512], ...(app.screenshotUrls || []).slice(0, 3).map((u, i) => [u, `app-${i + 1}.webp`, 900])];
    for (const [u, file, max] of files) {
      const img = u && await fetchBuffer(context, u);
      try { if (img) { await saveWebp(tool, img, join(dir, file), max, max * 2); evidence.push(rel(file)); } } catch { /* an image that does not decode */ }
    }
    return { name: app.trackName, url: app.trackViewUrl, genre: app.primaryGenreName, rating: app.averageUserRating ? +app.averageUserRating.toFixed(1) : null,
      ratings: app.userRatingCount || null, description: String(app.description || '').replace(/\s+/g, ' ').slice(0, 400) };
  } catch (e) { notes.push(`app store lookup failed: ${String(e.message).slice(0, 80)}`); return null; }
}

const RESERVED = new Set(['sheets', 'library']);

/**
 * Capture every brand of an audit directory that has not been captured yet.
 * One brand failing never loses the others: audit.json is saved after each brand.
 */
export async function captureAll(auditDir, { only = null, concurrency = 4, settle, _capture = captureBrand } = {}) {
  const file = join(auditDir, 'audit.json');
  const audit = JSON.parse(await readFile(file, 'utf8'));
  for (const b of audit.panel) {
    if (typeof b.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(b.id) || RESERVED.has(b.id))
      throw new Error(`brand id "${b.id}" is not usable: lower-case letters, digits and hyphens only, and not "sheets" or "library"`);
  }
  const todo = audit.panel.filter((b) => (only ? only.includes(b.id) : !b.capture));
  const workers = Math.max(1, Math.min(Number.isFinite(+concurrency) ? Math.floor(+concurrency) : 4, 8));
  const browser = await launch();
  const results = [];
  let saving = Promise.resolve();
  const save = () => (saving = saving.then(() => writeFile(file, JSON.stringify(audit, null, 2) + '\n')));
  try {
    const queue = [...todo];
    await Promise.all(Array.from({ length: Math.min(workers, queue.length) }, async () => {
      for (let b = queue.shift(); b; b = queue.shift()) {
        let r;
        try { r = await _capture(browser, b, join(auditDir, 'evidence'), { settle, country: audit.meta?.market_country, locale: audit.meta?.locale }); }
        catch (e) { r = { capture: 'none', measures: null, logo: null, evidence: [], notes: [`capture crashed: ${String(e.message).split('\n')[0].slice(0, 160)}`] }; }
        Object.assign(b, { capture: r.capture, measures: r.measures, logo: r.logo, capture_notes: r.notes,
          evidence: [...new Set([...(b.evidence || []).filter((p) => !p.startsWith(`evidence/${b.id}/`)), ...r.evidence])] });
        if (r.app_store) b.app_store = r.app_store;
        results.push({ id: b.id, capture: r.capture, notes: r.notes });
        console.log(`${r.capture.padEnd(7)} ${b.id}${r.notes.length ? '  (' + r.notes.join('; ') + ')' : ''}`);
        await save();
      }
    }));
  } finally { await browser.close(); }
  await save();
  return results;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--only' && args[args.indexOf(a) - 1] !== '--concurrency');
  if (!dir || dir.startsWith('--') || args.includes('--help')) { console.log('usage: node capture.mjs <audit-dir> [--only id,id] [--concurrency 4]'); process.exit(args.includes('--help') ? 0 : 1); }
  const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
  const res = await captureAll(dir, { only: opt('--only')?.split(','), concurrency: +(opt('--concurrency') || 4) });
  const n = (c) => res.filter((r) => r.capture === c).length;
  console.log(`\n${res.length} captured: ${n('full')} full, ${n('partial')} partial, ${n('none')} failed`);
}
