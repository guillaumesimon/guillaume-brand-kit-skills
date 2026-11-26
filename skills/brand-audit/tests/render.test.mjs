import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderLandscape, inlineImages, imageSize, STRINGS } from '../assets/render.mjs';

const example = JSON.parse(readFileSync(new URL('../assets/audit.example.json', import.meta.url)));

test('the report has its twelve numbered sections, in French', () => {
  const html = renderLandscape(example, STRINGS.fr);
  for (const b of example.panel) assert.ok(html.includes(b.name), b.name);
  for (const id of ['summary', 'scope', 'profiles', 'logos', 'architecture', 'colour', 'typography', 'symbols', 'visual_language', 'maps', 'codes', 'opportunities', 'method'])
    assert.ok(html.includes(`<section class="s" id="${id}">`), id);
  for (const label of ['Préserver', 'Éviter', 'Remettre en question', 'Explorer', 'Valider', 'Codes de catégorie', 'Clichés de catégorie', 'Codes associés à un concurrent', 'Codes émergents', 'Ruptures risquées'])
    assert.ok(html.includes(label), label);
  assert.ok(html.includes('6 sur 8'));
  assert.ok(html.includes('Teinte dominante : bleu'), 'vocabulary values are shown in French');
  assert.ok(html.includes('combination'), 'logo types keep their names');
  assert.ok(!html.includes('<!--'));
});
test('each written section shows its lead, findings with provenance, and takeaway', () => {
  const html = renderLandscape(example, STRINGS.en);
  for (const s of Object.values(example.sections)) { assert.ok(html.includes(s.lead.replace(/"/g, '&quot;'))); assert.ok(html.includes(s.takeaway.replace(/"/g, '&quot;'))); }
  assert.ok(html.includes('>measured</span>') && html.includes('>observed</span>') && html.includes('>judged</span>'));
  assert.ok(html.includes(example.panel[0].profile.strength));
});
test('a section that was not written says so instead of vanishing', () => {
  const a = structuredClone(example); delete a.sections.symbols;
  assert.ok(renderLandscape(a, STRINGS.en).includes('This part has not been written yet.'));
});
test('the page is black and white: no colour in the stylesheet', () => {
  const css = renderLandscape(example, STRINGS.en).match(/<style>([\s\S]*?)<\/style>/)[1];
  const colours = [...css.matchAll(/#([0-9a-f]{3,6})\b/gi)].map((m) => m[1].toLowerCase()).filter((h) => { const x = h.length === 3 ? [...h].map((c) => c + c).join('') : h; const [r, g, b] = [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); return Math.max(r, g, b) - Math.min(r, g, b) > 12; });
  assert.deepEqual(colours, []);
});
test('the board loads nothing from the network', () => {
  const html = renderLandscape(example, STRINGS.en);
  assert.ok(!/<(script|link)\b/i.test(html));
  assert.ok(!/@import|url\(\s*["']?https?:/i.test(html));
  for (const m of html.matchAll(/\ssrc="([^"]+)"/g)) assert.ok(m[1].startsWith('evidence/'), m[1]);
});
test('images that do not exist are not linked', () => {
  const html = renderLandscape(example, STRINGS.en, (p) => !p.includes('bindery'));
  assert.ok(!html.includes('evidence/bindery/'));
  assert.ok(html.includes('evidence/folio/desktop.webp'));
});
test('text from the audit is escaped', () => {
  const a = structuredClone(example); a.panel[0].name = 'Fo<script>lio'; a.opportunities[0].rationale = 'a $& b <b>';
  const html = renderLandscape(a, STRINGS.en);
  assert.ok(html.includes('Fo&lt;script&gt;lio'));
  assert.ok(html.includes('a $&amp; b &lt;b&gt;'));
});
test('an audit with too few brands still renders', () => {
  const a = structuredClone(example); a.frequencies = { base: 2, insufficient: true, by_dimension: {} }; a.conventions = []; a.map = null; a.opportunities = [];
  assert.ok(renderLandscape(a, STRINGS.fr).includes('Pas assez de marques directes'));
});
test('--inline embeds every image once and leaves no evidence path', () => {
  const png = (w, h) => { const b = Buffer.alloc(33); b.writeUInt32BE(0x89504e47, 0); b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20); return b; };
  const html = renderLandscape(example, STRINGS.en);
  const reads = new Map();
  const one = inlineImages(html, (p) => { reads.set(p, (reads.get(p) || 0) + 1); return png(400, 300); });
  assert.ok(!one.includes('"evidence/'));
  assert.ok([...reads.values()].every((n) => n === 1), 'each file is read once');
  assert.equal((one.match(/<image id=/g) || []).length, reads.size, 'each image is stored once');
  assert.ok((one.match(/<use href="#i/g) || []).length > reads.size, 'and drawn wherever it is cited');
  assert.ok(one.includes(':is(img,svg.ri)'));
});
test('image sizes are read from WebP and PNG headers', () => {
  const vp8x = Buffer.alloc(32); vp8x.write('RIFF', 0); vp8x.write('WEBP', 8); vp8x.write('VP8X', 12); vp8x.writeUIntLE(1439, 24, 3); vp8x.writeUIntLE(899, 27, 3);
  assert.deepEqual(imageSize(vp8x), { w: 1440, h: 900 });
  assert.equal(imageSize(Buffer.from('nothing')), null);
});
test('a logo the analyst rejected (logo: null) is not shown', () => {
  const a = structuredClone(example); const q = a.panel.find((b) => b.id === 'quire'); q.logo = null;
  const html = renderLandscape(a, STRINGS.en);
  assert.ok(!html.includes('evidence/quire/logo.webp'));
  assert.ok(html.includes('evidence/shelfline/logo.webp'));
});
test('a javascript: url is not linked, and a $ in the product name does not mangle the title', () => {
  const a = structuredClone(example); a.panel[0].url = 'javascript:alert(1)'; a.framing.product = 'Pay $& go';
  const html = renderLandscape(a, STRINGS.en);
  assert.ok(!/href="javascript:/i.test(html));
  assert.ok(html.includes('<title>Visual landscape audit · Pay $&amp; go</title>'));
});
