#!/usr/bin/env node
// Pin the evidence side by side: a convention is only visible on a wall.
//   node sheets.mjs <audit-dir>
// Writes evidence/sheets/{logos,heroes,palettes,type}.webp. Cells carry the brand name and role, nothing else.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch, saveWebp } from './lib/browser.mjs';
import { parseColor, classify } from './lib/color.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ROLE_ORDER = ['self', 'direct', 'leader', 'indirect', 'aspirational'];
const CSS = `*{box-sizing:border-box}body{margin:0;padding:24px;background:#f4f3ef;font:15px/1.3 system-ui,Helvetica,Arial,sans-serif;color:#16181d;width:1500px}
h1{font-size:15px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 16px}.g{display:grid;gap:12px}
.c{background:#fff;border:1px solid #dcdad3}.c .i{display:flex;align-items:center;justify-content:center;background:#fff;overflow:hidden}
.c img{display:block;max-width:100%}.c p{margin:0;padding:6px 9px;border-top:1px solid #dcdad3;font-size:13px;display:flex;justify-content:space-between;gap:8px}
.c p small{color:#666b76}.row{display:grid;grid-template-columns:190px 1fr 110px;gap:12px;align-items:center;margin-bottom:8px}
.strip{display:flex;height:44px;border:1px solid #dcdad3}.sw{height:44px;border:1px solid #dcdad3}
table{border-collapse:collapse;width:100%;background:#fff}td,th{border:1px solid #dcdad3;padding:8px 10px;text-align:left;font-size:14px}th{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#666b76}`;

function hueKey(hex) {
  const c = hex && parseColor(hex); if (!c) return 999;
  const k = classify(c);
  return ['red', 'orange', 'brown', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'neutral'].indexOf(k.hue);
}

/** The four sheets as {name: html}. Exported so the layout can be tested without a browser. */
export function sheetPages(audit, auditDir, has = (p) => existsSync(join(auditDir, p))) {
  const url = (p) => pathToFileURL(resolve(auditDir, p)).href;
  const panel = [...audit.panel].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
  const ev = (b, f) => (b.evidence || []).find((p) => p.endsWith('/' + f) && has(p));
  const cap = (b) => `<p><span>${esc(b.name)}</span><small>${esc(b.role)}</small></p>`;
  const page = (title, body) => `<!doctype html><meta charset="utf-8"><style>${CSS}</style><h1>${esc(title)} · ${panel.length} brands</h1>${body}`;
  const logos = panel.map((b) => { const p = (b.logo && has(b.logo) && b.logo) || ev(b, 'logo.webp') || ev(b, 'app-icon.webp') || ev(b, 'icon.webp');
    return `<div class="c"><div class="i" style="height:130px;padding:16px">${p ? `<img src="${url(p)}" style="max-height:98px">` : '<small>no logo captured</small>'}</div>${cap(b)}</div>`; }).join('');
  const heroes = panel.filter((b) => ev(b, 'desktop.webp')).map((b) => `<div class="c"><div class="i"><img src="${url(ev(b, 'desktop.webp'))}"></div>${cap(b)}</div>`).join('');
  const measured = panel.filter((b) => b.measures).sort((a, b) => hueKey(a.measures.accent) - hueKey(b.measures.accent));
  const palettes = measured.map((b) => `<div class="row"><div>${esc(b.name)} <small style="color:#666b76">${esc(b.role)}</small></div><div class="strip">${
    (b.measures.palette || []).map((p) => `<div style="background:${esc(p.hex)};flex:${Math.max(0.06, Math.sqrt(p.share)).toFixed(2)}"></div>`).join('')}</div><div class="sw" style="background:${esc(b.measures.accent || '#fff')}"></div></div>`).join('');
  const type = `<table><tr><th>Brand</th><th>Headline family</th><th>Weight</th><th>Size</th><th>Tracking</th><th>Text family</th><th>Headline</th></tr>${
    measured.map((b) => { const h = b.measures.headline || {}; return `<tr><td>${esc(b.name)}</td><td>${esc(String(h.family || '').split(',')[0].replace(/["']/g, ''))}</td><td>${esc(h.weight ?? '')}</td><td>${h.size_px ? Math.round(h.size_px) + 'px' : ''}</td><td>${h.tracking_em ?? ''}</td><td>${esc((b.measures.fonts || [])[0]?.family || '')}</td><td>${esc(String(h.text || '').slice(0, 70))}</td></tr>`; }).join('')}</table>`;
  return {
    logos: page('Logos', `<div class="g" style="grid-template-columns:repeat(6,1fr)">${logos}</div>`),
    heroes: page('Home pages', `<div class="g" style="grid-template-columns:repeat(3,1fr)">${heroes}</div>`),
    palettes: page('Palettes, by accent hue (right: accent)', palettes),
    type: page('Typography, as measured', type),
  };
}

export async function buildSheets(auditDir) {
  const audit = JSON.parse(await readFile(join(auditDir, 'audit.json'), 'utf8'));
  const dir = join(auditDir, 'evidence', 'sheets');
  await mkdir(dir, { recursive: true });
  const pages = sheetPages(audit, auditDir);
  const browser = await launch();
  const written = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1548, height: 900 } });
    const tool = await context.newPage(), page = await context.newPage();
    for (const [name, html] of Object.entries(pages)) {
      const tmp = join(dir, `_${name}.html`);
      await writeFile(tmp, html);
      await page.goto(pathToFileURL(resolve(tmp)).href, { waitUntil: 'load' });
      await saveWebp(tool, await page.screenshot({ type: 'png', fullPage: true }), join(dir, `${name}.webp`), 1600, 5000);
      await rm(tmp);
      written.push(`evidence/sheets/${name}.webp`);
    }
  } finally { await browser.close(); }
  return written;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const dir = process.argv[2];
  if (!dir || dir.startsWith('--')) { console.log('usage: node sheets.mjs <audit-dir>'); process.exit(dir === '--help' ? 0 : 1); }
  for (const f of await buildSheets(dir)) console.log(f);
}
