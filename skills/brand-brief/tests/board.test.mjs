import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadRound, pageRound, decode, record, reading } from '../assets/lib/schema.mjs';
import { page, buildSingle, save, serve, summary } from '../assets/board.mjs';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const side = (label) => ({ label, title: `${label} side`, desc: 'what it means', word: label.toLowerCase() });
const subject = (id, kind, specimens) => ({ id, name: `About ${id}`, kind, question: 'Your brand is rather…', ask: 'If your brand were like %s, it would be…',
  left: side('Quiet'), right: side('Loud'), too_left: 'Too quiet for us', ok: 'Right for us', too_right: 'Too loud for us', specimens });

function seed(subjects) {
  const dir = mkdtempSync(join(tmpdir(), 'bb-'));
  mkdirSync(join(dir, 'rounds')); mkdirSync(join(dir, 'evidence'));
  const references = ['alpha', 'beta', 'gamma', 'delta'].map((id) => ({ id, name: id[0].toUpperCase() + id.slice(1), circle: 'direct', url: `https://${id}.example`, why: 'test',
    asset: `evidence/${id}.png`, palette: ['#ffffff', '#111111', '#ff0000'], materials: { logo: { asset: `evidence/${id}-logo.png` } } }));
  for (const r of references) { writeFileSync(join(dir, r.asset), PNG); writeFileSync(join(dir, r.materials.logo.asset), PNG); }
  writeFileSync(join(dir, 'brief.json'), JSON.stringify({ meta: { brand: 'Test', locale: 'fr' }, references, interactions: [{ id: 'q01', type: 'question' }] }));
  writeFileSync(join(dir, 'rounds', 'r1.json'), JSON.stringify({ id: 'r1', subjects: subjects || [
    subject('tone', 'quote', [{ ref: 'alpha', quote: 'We deliver solutions.' }, { ref: 'beta', quote: 'It just works.' }, { ref: 'gamma', quote: 'Win the war' }]),
    subject('colour', 'palette', [{ ref: 'alpha' }, { ref: 'beta' }, { ref: 'gamma' }, { ref: 'delta' }]),
    subject('sign', 'logo', [{ ref: 'alpha', material: 'logo' }, { ref: 'beta', material: 'logo' }, { ref: 'gamma', material: 'logo' }]),
  ] }));
  return dir;
}
const brief = (dir) => JSON.parse(readFileSync(join(dir, 'brief.json'), 'utf8'));
const refuses = (subjects, re) => assert.throws(() => loadRound(seed(subjects), 'r1'), re);

test('a specimen takes its name from the reference card and its matter from the subject', () => {
  const round = loadRound(seed(), 'r1');
  assert.equal(round.subjects[0].specimens[0].name, 'Alpha');
  assert.equal(round.subjects[0].specimens[0].src, 'evidence/alpha.png');
  assert.deepEqual(round.subjects[1].specimens[0].colors, ['#ffffff', '#111111', '#ff0000']);
  assert.equal(round.subjects[2].specimens[0].src, 'evidence/alpha-logo.png');
});

test('a subject must say what is judged: its name, its question and three full answers', () => {
  const s = subject('tone', 'quote', [{ ref: 'alpha', quote: 'a' }, { ref: 'beta', quote: 'b' }, { ref: 'gamma', quote: 'c' }]);
  refuses([{ ...s, ok: '' }], /"ok" is missing/);
  refuses([{ ...s, ask: 'Would it fit?' }], /must contain %s/);
  refuses([{ ...s, left: { label: 'Quiet' } }], /left\.title is missing/);
  refuses([{ ...s, kind: 'homepage' }], /kind "homepage"/);
});

test('a subject about words shows words, about colour shows measured colours, about signs shows images', () => {
  refuses([subject('tone', 'quote', [{ ref: 'alpha' }, { ref: 'beta', quote: 'b' }, { ref: 'gamma', quote: 'c' }])], /"alpha" has no quote/);
  refuses([subject('sign', 'logo', [{ ref: 'alpha', material: 'wordmark' }, { ref: 'beta' }, { ref: 'gamma' }])], /no material "wordmark"/);
  const dir = seed([subject('colour', 'palette', [{ ref: 'alpha' }, { ref: 'beta' }, { ref: 'gamma' }])]);
  const b = brief(dir); delete b.references[0].palette; writeFileSync(join(dir, 'brief.json'), JSON.stringify(b));
  assert.throws(() => loadRound(dir, 'r1'), /"alpha" has no measured palette/);
});

test('three to six specimens, and only brands that are in the brief', () => {
  refuses([subject('tone', 'quote', [{ ref: 'alpha', quote: 'a' }, { ref: 'beta', quote: 'b' }])], /3 to 6 specimens/);
  refuses([subject('tone', 'quote', [{ ref: 'alpha', quote: 'a' }, { ref: 'beta', quote: 'b' }, { ref: 'zeta', quote: 'z' }])], /"zeta" is not in brief\.json/);
});

test('the page carries the subject and its labels, and a name cannot close the script block', () => {
  const html = page(pageRound(loadRound(seed(), 'r1')));
  assert.ok(html.includes('About tone') && html.includes('Too quiet for us') && html.includes('We deliver solutions.'));
  assert.ok(!page({ id: 'x', subjects: [{ name: '</script><b>' }] }).includes('</script><b>'));
});

test('decode reads the camp, each judgement and the note', () => {
  const round = loadRound(seed(), 'r1');
  const v = decode(round, `voici : bb2.r1.aolr,mooru,x.${Buffer.from('jamais de robot').toString('base64url')}`);
  assert.deepEqual([v.subjects[0].camp, v.subjects[0].fits, v.subjects[0].too_left, v.subjects[0].too_right], ['left', ['alpha'], ['beta'], ['gamma']]);
  assert.deepEqual([v.subjects[1].camp, v.subjects[1].fits, v.subjects[1].unknown], ['between', ['alpha', 'beta'], ['delta']]);
  assert.deepEqual([v.subjects[2].camp, v.subjects[2].answers], ['skipped', []]);
  assert.equal(v.note, 'jamais de robot');
});

test('decode refuses a code for another round, a wrong count and an unknown letter', () => {
  const round = loadRound(seed(), 'r1');
  assert.throws(() => decode(round, 'bb2.r9.aooo,aoooo,x.'), /round "r9"/);
  assert.throws(() => decode(round, 'bb2.r1.aooo,x.'), /2 subjects.*has 3/);
  assert.throws(() => decode(round, 'bb2.r1.aoo,aoooo,x.'), /2 answers for 3 specimens/);
  assert.throws(() => decode(round, 'bb2.r1.aozo,aoooo,x.'), /"z" is not an answer/);
  assert.throws(() => decode(round, 'bb1.r1.y,y.'), /not a board code/);
});

test('a reading names the brands that fit and the ones that bound it', () => {
  const v = decode(loadRound(seed(), 'r1'), 'bb2.r1.alor,brrrr,x.');
  assert.equal(reading(v.subjects[0], (id) => id.toUpperCase()), 'fits: BETA; too quiet: ALPHA; too loud: GAMMA');
  assert.match(reading(v.subjects[1]), /^none of the brands shown fits \(leans right\); too loud:/);
  assert.equal(reading(v.subjects[2]), 'does not matter to them');
});

test('record writes one interaction and one dimension per subject, and replaces a round recorded twice', () => {
  const dir = seed(), round = loadRound(dir, 'r1');
  save(dir, round, 'bb2.r1.aooo,aoooo,aooo.');
  save(dir, round, 'bb2.r1.alor,mooou,x.');
  const b = brief(dir);
  assert.deepEqual(b.interactions.map((x) => x.id), ['q01', 'r1-tone', 'r1-colour', 'r1-sign']);
  const [tone, colour, sign] = b.personality.dimensions;
  assert.deepEqual([tone.fits, tone.too_left, tone.too_right, tone.confidence, tone.validation, tone.kind], [['beta'], ['alpha'], ['gamma'], 'medium', 'validated', 'quote']);
  assert.equal(tone.evidence.length, 1);
  assert.equal(colour.confidence, 'low', 'fits with no bound on either side is not yet a position');
  assert.deepEqual([sign.camp, sign.importance, sign.confidence], ['skipped', 'low', 'unknown']);
  assert.equal(JSON.parse(readFileSync(join(dir, 'rounds', 'r1.votes.json'), 'utf8')).subjects.length, 3);
});

test('recording keeps what the agent wrote on a dimension', () => {
  const dir = seed(), round = loadRound(dir, 'r1');
  save(dir, round, 'bb2.r1.alor,aoooo,x.');
  const b = brief(dir); b.personality.dimensions[0].orientation = 'plain'; b.personality.dimensions[0].importance = 'high';
  writeFileSync(join(dir, 'brief.json'), JSON.stringify(b));
  save(dir, round, 'bb2.r1.aoor,aoooo,x.');
  const d = brief(dir).personality.dimensions[0];
  assert.deepEqual([d.orientation, d.importance, d.fits], ['plain', 'high', ['alpha', 'beta']]);
});

test('the single file embeds every image', () => {
  const dir = seed();
  const html = buildSingle(dir, loadRound(dir, 'r1'));
  assert.ok(html.includes('data:image/png;base64,') && !html.includes('evidence/alpha.png'));
});

test('serve hands out the board and the images, takes the answers and stops', async () => {
  const dir = seed(), round = loadRound(dir, 'r1');
  const done = serve(dir, round, { port: 47631, minutes: 1 });
  await new Promise((r) => setTimeout(r, 150));
  const base = 'http://127.0.0.1:47631';
  assert.ok((await (await fetch(base + '/')).text()).includes('"post":"/votes"'));
  assert.equal((await fetch(base + '/evidence/alpha.png')).status, 200);
  assert.equal((await fetch(base + '/brief.json')).status, 404);
  assert.equal((await fetch(base + '/..%2f..%2fetc/passwd')).status, 404);
  assert.equal((await fetch(base + '/votes', { method: 'POST', body: 'nonsense' })).status, 400);
  assert.equal((await fetch(base + '/votes', { method: 'POST', body: 'bb2.r1.alor,aoooo,x.' })).status, 200);
  const votes = await done;
  assert.match(summary(votes, brief(dir)), /About tone \(Quiet \/ Loud\): fits: Beta; too quiet: Alpha; too loud: Gamma/);
});
