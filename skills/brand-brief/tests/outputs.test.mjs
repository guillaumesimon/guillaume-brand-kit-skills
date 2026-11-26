import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { check } from '../assets/check.mjs';
import { renderBrief } from '../assets/brief.mjs';
import { render, inlineImages } from '../assets/render.mjs';
import { provenance } from '../assets/lib/schema.mjs';

const example = () => JSON.parse(readFileSync(new URL('../assets/brief.example.json', import.meta.url), 'utf8'));
const fails = (b, re) => assert.ok(check(b).errors.some((e) => re.test(e)), `expected a failure matching ${re}, got:\n${check(b).errors.join('\n')}`);

test('the worked example passes the gate', () => assert.deepEqual(check(example()).errors, []));

test('BRIEF.example.md is what the example generates', () => {
  assert.equal(readFileSync(new URL('../assets/BRIEF.example.md', import.meta.url), 'utf8'), renderBrief(example()));
});

test('a draft does not go out, a provisional brief goes out with a note', () => {
  const b = example(); b.meta.status = 'draft'; fails(b, /still a draft/);
  b.meta.status = 'provisional';
  assert.deepEqual(check(b).errors, []);
  assert.ok(check(b).warnings.some((w) => /provisional/.test(w)));
  assert.match(renderBrief(b), /has not validated/);
});

test('an empty section fails unless it is declared empty with a reason', () => {
  const b = example(); b.values = []; fails(b, /"Values" is empty/);
  b.declared_empty = { values: 'the founder had no instance to give' };
  assert.ok(!check(b).errors.some((e) => /Values/.test(e)));
});

test('one primary audience, no more, no less', () => {
  const b = example(); b.audiences[1].primary = true; fails(b, /exactly one audience/);
});

test('a value without an instance and a trait that is an adjective fail', () => {
  const b = example(); delete b.values[0].instance; fails(b, /has no instance/);
  const c = example(); delete c.personality.traits[0].never; fails(c, /is an adjective/);
});

test('a session with no refusal fails', () => {
  const b = example();
  for (const d of b.personality.dimensions) { d.too_left = []; d.too_right = []; }
  b.preferences.signals = b.preferences.signals.filter((s) => s.level !== 'never');
  b.positioning.territories = b.positioning.territories.filter((t) => t.status !== 'rejected');
  fails(b, /nothing was refused/);
});

test('wallpaper words are refused where the brand is summed up', () => {
  const b = example(); b.summary.lead = 'A modern, simple brand people can trust.'; fails(b, /summary\.lead uses "trust", "modern"|summary\.lead uses/);
  const c = example(); c.perception.feel.value = 'Une marque humaine et authentique'; fails(c, /perception\.feel uses/);
});

test('evidence must point at a real interaction, and stated needs one', () => {
  const b = example(); b.context.reason.evidence = ['q99']; fails(b, /cites "q99"/);
  const c = example(); delete c.context.reason.evidence; fails(c, /"stated" needs the interaction/);
  const d = example(); d.personality.dimensions[0].evidence[0].interaction = 'r9-tone'; fails(d, /dimension tone: cites "r9-tone"/);
});

test('a subject judged once is medium at most', () => {
  const b = example(); b.personality.dimensions[0].evidence.pop(); fails(b, /it takes a second, different signal/);
});

test('the board gives markers; the agent must still say what they mean', () => {
  const b = example(); delete b.personality.dimensions[1].orientation; fails(b, /dimension presence: the board gave the markers/);
  const c = example(); c.personality.dimensions[0].fits = ['nobody']; fails(c, /"nobody" is not a reference/);
});

test('every assumption is an open question', () => {
  const b = example(); b.open_questions = []; fails(b, /assumed and only 0 open question/);
});

test('logo contexts are derived, and say where from', () => {
  const b = example(); delete b.logo_contexts[0].source; fails(b, /It is derived, never asked/);
});

test('a reference needs a source and a reason, and closed vocabularies are enforced', () => {
  const b = example(); delete b.references[0].url; fails(b, /no source url/);
  const c = example(); c.references[0].circle = 'famous'; fails(c, /circle "famous"/);
});

test('provenance counts statements, not references or interactions', () => {
  const n = provenance(example());
  assert.equal(n.assumed, 2);
  assert.ok(n.stated > 10 && n.chosen > 3);
});

test('the brief for agents carries the hand-offs, each subject with its markers, and the references by circle', () => {
  const md = renderBrief(example());
  for (const h of ['## For brand-audit', '## For brand-kit', '### Tone (Plain / Playful)', '- Too playful: Mailchimp, Duolingo', '- **The buyers\' own world:** Monocle', 'Derived from the product, not asked', 'Gate: Reads at 16 px']) assert.ok(md.includes(h), h);
  assert.ok(!md.includes('undefined'));
});

test('the report escapes what the founder said and marks assumptions', () => {
  const b = example(); b.context.reason.quote = '<script>alert(1)</script>';
  const html = render(b);
  assert.ok(!html.includes('<script>alert(1)</script>') && html.includes('&lt;script&gt;'));
  assert.ok(html.includes('class="tag assumed"') && !html.includes('undefined'));
});

test('the report is in the session language and falls back to a name tile without an image', () => {
  const b = example(); b.meta.locale = 'fr';
  const html = render(b, { exists: () => false });
  assert.ok(html.includes('Brief de marque') && html.includes('Le monde des acheteurs') && html.includes('jugé sur leurs phrases') && html.includes('<div class="ph">Monocle</div>') && html.includes('class="zone"'));
});

test('inlining embeds local images and leaves the rest alone', () => {
  const html = inlineImages('<img src="evidence/a.webp" alt=""><img src="https://x.test/b.png">', () => Buffer.from('abc'));
  assert.ok(html.includes('src="data:image/webp;base64,YWJj"') && html.includes('src="https://x.test/b.png"'));
});
