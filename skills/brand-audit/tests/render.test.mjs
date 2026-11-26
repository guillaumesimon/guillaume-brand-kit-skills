import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderLandscape, inlineImages, STRINGS } from '../assets/render.mjs';

const example = JSON.parse(readFileSync(new URL('../assets/audit.example.json', import.meta.url)));

test('the board names every brand and the three classes, in French', () => {
  const html = renderLandscape(example, STRINGS.fr);
  for (const b of example.panel) assert.ok(html.includes(b.name), b.name);
  for (const label of ['Code de lisibilité', 'Cliché', 'Rupture risquée', 'Territoires à explorer']) assert.ok(html.includes(label), label);
  assert.ok(html.includes('6 sur 8'));
  assert.ok(html.includes('Teinte dominante : bleu'), 'vocabulary values are shown in French');
  assert.ok(html.includes('combination'), 'logo types keep their names');
  assert.ok(!html.includes('<!--'));
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
test('--inline embeds every image and leaves no evidence path', () => {
  const one = inlineImages(renderLandscape(example, STRINGS.en), () => Buffer.from('x'));
  assert.ok(!one.includes('"evidence/'));
  assert.ok(one.includes('src="data:image/webp;base64,eA=="'));
});
