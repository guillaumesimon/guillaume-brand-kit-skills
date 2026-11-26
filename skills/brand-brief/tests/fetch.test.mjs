import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFileSync, existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../assets/lib/browser.mjs';
import { capturePage, downloadImage, run, reject } from '../assets/fetch.mjs';

const fixtures = fileURLToPath(new URL('./fixtures/', import.meta.url));
let server, base, browser;
before(async () => {
  server = http.createServer((req, res) => {
    if (req.url === '/big.png') { res.writeHead(200, { 'content-type': 'image/png' }); res.end(Buffer.concat([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'), Buffer.alloc(9000)])); return; }
    if (req.url === '/logo.svg') { res.writeHead(200, { 'content-type': 'image/svg+xml' }); res.end('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" fill="#114433"/><text x="10" y="26" fill="#fff" font-size="16">Maison Verger</text></svg>'); return; }
    if (req.url === '/tiny.png') { res.writeHead(200, { 'content-type': 'image/png' }); res.end(Buffer.alloc(200)); return; }
    if (req.url === '/forbidden') { res.writeHead(403, { 'content-type': 'text/html' }); res.end('<h1>No</h1>'); return; }
    const f = join(fixtures, req.url.slice(1));
    if (!existsSync(f)) { res.writeHead(404); res.end('nope'); return; }
    res.writeHead(200, { 'content-type': 'text/html' }); res.end(readFileSync(f));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
  try { browser = await launch(); } catch { browser = null; }
});
after(async () => { await browser?.close(); server?.close(); });
const noBrowser = (t) => { if (!browser) { t.skip('no Chromium here'); return true; } return false; };

test('a consent banner is closed and a region bar hidden, and the site header stays', async (t) => {
  if (noBrowser(t)) return;
  const got = await capturePage(browser, `${base}/cookie.html`);
  assert.equal(got.status, 'ok');
  assert.ok(got.notes.includes('consent banner closed'));
  assert.ok(got.notes.some((n) => /overlay/.test(n)));
  assert.ok(got.buffer.length > 1000);
});

test('a capture brings back the measured colours and the sentences set largest', async (t) => {
  if (noBrowser(t)) return;
  const got = await capturePage(browser, `${base}/cookie.html`);
  assert.ok(got.palette.includes('#ffffff') && got.palette.includes('#114433'), `palette: ${got.palette.join(' ')}`);
  assert.equal(got.copy[0], "Des pommes, et rien d'autre.");
});

test('a logo may be small or an SVG; a picture may not', async () => {
  assert.equal((await downloadImage(`${base}/logo.svg`, { logo: true })).status, 'ok');
  assert.equal((await downloadImage(`${base}/logo.svg`)).status, 'failed');
});

test('the header of a site is not taken for a notice', async (t) => {
  if (noBrowser(t)) return;
  const got = await capturePage(browser, `${base}/cookie.html`);
  assert.equal(got.notes.filter((n) => /overlay/.test(n))[0], '1 overlay hidden');
});

test('a bot challenge is reported as blocked, never shown', async (t) => {
  if (noBrowser(t)) return;
  assert.equal((await capturePage(browser, `${base}/blocked.html`)).status, 'blocked');
  assert.equal((await capturePage(browser, `${base}/forbidden`)).status, 'blocked');
});

test('a maintenance page is a failure, not a picture of the brand', async (t) => {
  if (noBrowser(t)) return;
  const got = await capturePage(browser, `${base}/maintenance.html`);
  assert.equal(got.status, 'failed');
  assert.match(got.notes[0], /maintenance/);
});

test('a picture is downloaded, a page or a thumbnail is not accepted as one', async () => {
  assert.equal((await downloadImage(`${base}/big.png`)).status, 'ok');
  assert.match((await downloadImage(`${base}/tiny.png`)).notes[0], /too small/);
  assert.match((await downloadImage(`${base}/cookie.html`)).notes[0], /not a picture/);
});

test('run writes assets, statuses and a contact sheet; reject drops an image with its reason', async (t) => {
  if (noBrowser(t)) return;
  const dir = mkdtempSync(join(tmpdir(), 'bb-f-'));
  writeFileSync(join(dir, 'brief.json'), JSON.stringify({ meta: {}, references: [
    { id: 'verger', name: 'Maison Verger', url: `${base}/cookie.html`, materials: { logo: { image_url: `${base}/logo.svg` } } },
    { id: 'wall', name: 'Wall', url: `${base}/blocked.html` },
    { id: 'none', name: 'None' },
  ] }));
  const out = await run(dir);
  assert.deepEqual(out.shown, ['verger']);
  assert.deepEqual(out.bad.sort(), ['none', 'wall']);
  assert.ok(existsSync(join(dir, 'evidence/verger.webp')) && existsSync(join(dir, 'evidence/sheet-1.webp')));
  let b = JSON.parse(readFileSync(join(dir, 'brief.json'), 'utf8'));
  assert.equal(b.references[1].capture.status, 'blocked');
  assert.equal(b.references[0].materials.logo.asset, 'evidence/verger-logo.svg');
  assert.ok(b.references[0].palette.length >= 2 && b.references[0].copy.length >= 1);
  assert.equal(b.references[1].asset, undefined);
  reject(dir, ['verger'], 'the hero is a stock photo');
  b = JSON.parse(readFileSync(join(dir, 'brief.json'), 'utf8'));
  assert.deepEqual([b.references[0].capture.status, b.references[0].asset, b.references[0].capture.notes[0]], ['rejected', undefined, 'the hero is a stock photo']);
  assert.deepEqual((await run(dir)).shown, []);
});
