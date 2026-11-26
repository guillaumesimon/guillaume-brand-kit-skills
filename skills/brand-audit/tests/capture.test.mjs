import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFileSync, existsSync, mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../assets/lib/browser.mjs';
import { captureBrand, captureAll, summarise } from '../assets/capture.mjs';

const site = fileURLToPath(new URL('./fixtures/site/', import.meta.url));
let server, base, browser;
const out = mkdtempSync(join(tmpdir(), 'ba-cap-'));
const fast = { deep: false, settle: 200 };

before(async () => {
  server = http.createServer((req, res) => {
    const f = join(site, req.url === '/' ? 'index.html' : req.url.slice(1));
    if (!existsSync(f)) { res.writeHead(404); res.end('nope'); return; }
    res.writeHead(200, { 'content-type': 'text/html' }); res.end(readFileSync(f));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await launch();
});
after(async () => { await browser?.close(); server?.close(); });

test('measures a normal page', async () => {
  const r = await captureBrand(browser, { id: 'fix', url: base + '/index.html' }, out, fast);
  assert.equal(r.capture, 'full');
  assert.equal(r.measures.accent, '#1f5d45');
  assert.equal(r.measures.ground, 'light');
  assert.equal(r.measures.button_radius_px, 8);
  assert.match(r.measures.headline.family, /Georgia/);
  assert.equal(r.measures.headline.size_px, 64);
  assert.equal(r.measures.palette[0].hex, '#ffffff');
  for (const f of ['desktop.webp', 'full.webp', 'mobile.webp', 'logo.svg', 'logo.webp', 'measures.json'])
    assert.ok(existsSync(join(out, 'fix', f)), f);
  assert.equal(r.logo, 'evidence/fix/logo.webp');
  assert.equal(readFileSync(join(out, 'fix/desktop.webp')).subarray(8, 12).toString(), 'WEBP');
});
test('a bot challenge is partial, not fatal', async () => {
  const r = await captureBrand(browser, { id: 'blk', url: base + '/blocked.html' }, out, fast);
  assert.equal(r.capture, 'partial');
  assert.equal(r.measures, null);
  assert.ok(r.notes.some((n) => /blocked/.test(n)));
});
test('an http error is partial', async () => {
  const r = await captureBrand(browser, { id: 'nf', url: base + '/missing.html' }, out, fast);
  assert.equal(r.capture, 'partial');
  assert.ok(r.notes.some((n) => /http 404/.test(n)));
});
test('a missing logo is null with a note', async () => {
  const r = await captureBrand(browser, { id: 'nl', url: base + '/nologo.html' }, out, fast);
  assert.equal(r.capture, 'full');
  assert.equal(r.logo, null);
  assert.ok(r.notes.some((n) => /logo not found/.test(n)));
});
test('a logo split in two graphics is captured whole, and a French consent banner is dismissed', async () => {
  const r = await captureBrand(browser, { id: 'split', url: base + '/splitlogo.html' }, out, fast);
  assert.equal(r.capture, 'full');
  assert.ok(r.notes.some((n) => /consent banner dismissed/.test(n)), r.notes.join('; '));
  const m = JSON.parse(readFileSync(join(out, 'split/measures.json')));
  assert.ok(m.logo_box.width >= 110, `logo is ${m.logo_box.width}px wide`);
});
test('a menu icon is not the logo, and a small h1 above a big line is not the headline', async () => {
  const r = await captureBrand(browser, { id: 'eye', url: base + '/eyebrow.html' }, out, fast);
  const m = JSON.parse(readFileSync(join(out, 'eye/measures.json')));
  assert.equal(m.logo_box.width, 140);
  assert.equal(m.headline.text, 'WELCOME HOME RUNNERS');
  assert.equal(m.headline.size_px, 88);
});
test('an error page served with a 200 is partial', async () => {
  const r = await captureBrand(browser, { id: 'err', url: base + '/errorpage.html' }, out, fast);
  assert.equal(r.capture, 'partial');
  assert.ok(r.notes.some((n) => /error page/.test(n)), r.notes.join('; '));
  assert.equal(r.logo, 'evidence/err/logo.webp'); // the header is still there: keep the logo for the wall
});
test('an unreachable host is capture none', async () => {
  const r = await captureBrand(browser, { id: 'dead', url: 'http://127.0.0.1:1/' }, out, { ...fast, timeout: 5000 });
  assert.equal(r.capture, 'none');
});
test('a dark page is read as dark', () => {
  const s = summarise({ bg: [{ color: 'rgb(12, 12, 14)', weight: 100 }], text: [], fonts: {}, accentBg: {}, accentText: { 'rgb(252, 76, 2)': 3 }, radii: {}, headline: null, media: {} });
  assert.equal(s.ground, 'dark');
  assert.equal(s.accent, '#fc4c02');
  assert.equal(s.button_radius_px, null);
});
test('captureAll skips brands already captured', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ba-all-'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'audit.json'), JSON.stringify({ meta: {}, panel: [{ id: 'a', url: base + '/index.html' }, { id: 'b', url: base + '/blocked.html' }] }));
  const first = await captureAll(dir, { settle: 200 });
  assert.equal(first.length, 2);
  const second = await captureAll(dir, { settle: 200 });
  assert.equal(second.length, 0);
  const audit = JSON.parse(readFileSync(join(dir, 'audit.json')));
  assert.equal(audit.panel[0].capture, 'full');
  assert.equal(audit.panel[1].capture, 'partial');
  assert.ok(audit.panel[0].evidence.includes('evidence/a/desktop.webp'));
});
test('re-capturing a brand replaces its evidence instead of piling it up', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ba-re-'));
  const write = (url) => writeFileSync(join(dir, 'audit.json'), JSON.stringify({ meta: {}, panel: [{ id: 'a', url, evidence: ['evidence/a/desktop.webp', 'evidence/other/kept.webp'], logo: 'evidence/a/logo.webp' }] }));
  write(base + '/index.html');
  await captureAll(dir, { settle: 200, only: ['a'] });
  const a = JSON.parse(readFileSync(join(dir, 'audit.json')));
  a.panel[0].url = base + '/blocked.html';
  writeFileSync(join(dir, 'audit.json'), JSON.stringify(a));
  await captureAll(dir, { settle: 200, only: ['a'] });
  const b = JSON.parse(readFileSync(join(dir, 'audit.json'))).panel[0];
  assert.equal(b.capture, 'partial');
  assert.deepEqual(b.evidence.sort(), ['evidence/a/blocked.webp', 'evidence/other/kept.webp']);
  assert.equal(b.logo, null); // a challenge page has no header of the brand
  assert.ok(!existsSync(join(dir, 'evidence/a/desktop.webp')));
});
