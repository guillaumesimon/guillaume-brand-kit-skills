import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadRound, pageRound, decode, record, screensOf } from '../assets/lib/schema.mjs';
import { page, buildSingle, save, serve, summary } from '../assets/board.mjs';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
function seed() {
  const dir = mkdtempSync(join(tmpdir(), 'bb-'));
  mkdirSync(join(dir, 'rounds')); mkdirSync(join(dir, 'evidence'));
  const references = ['alpha', 'beta', 'gamma'].map((id) => ({ id, name: id[0].toUpperCase() + id.slice(1), circle: 'analogous', url: `https://${id}.example`, why: 'test', asset: `evidence/${id}.png` }));
  for (const r of references) writeFileSync(join(dir, r.asset), PNG);
  writeFileSync(join(dir, 'brief.json'), JSON.stringify({ meta: { brand: 'Test', locale: 'fr' }, references, interactions: [{ id: 'q01', type: 'question' }] }));
  writeFileSync(join(dir, 'rounds', 'r1.json'), JSON.stringify({ id: 'r1', steps: [
    { type: 'swipe', objective: 'humour', targets: ['playfulness'], items: [{ ref: 'alpha', attributes: ['Les mots', 'La couleur', 'Le ton'] }, { ref: 'beta' }] },
    { type: 'duel', objective: 'paper', targets: ['expressiveness'], known: true, pairs: [{ a: { ref: 'alpha' }, b: { ref: 'gamma' }, attributes: ['Plus sérieux', 'Plus chaud'] }] },
  ] }));
  return dir;
}
const brief = (dir) => JSON.parse(readFileSync(join(dir, 'brief.json'), 'utf8'));

test('a round takes its images and names from the reference cards', () => {
  const round = loadRound(seed(), 'r1');
  assert.equal(round.steps[0].items[0].name, 'Alpha');
  assert.equal(round.steps[0].items[0].src, 'evidence/alpha.png');
  assert.equal(screensOf(round).length, 3);
});

test('a reference without an image cannot enter a round', () => {
  const dir = seed(), b = brief(dir);
  delete b.references[1].asset; writeFileSync(join(dir, 'brief.json'), JSON.stringify(b));
  assert.throws(() => loadRound(dir, 'r1'), /beta.*no image/);
});

test('the page never receives the objective or the dimension tested', () => {
  const html = page(pageRound(loadRound(seed(), 'r1')));
  assert.ok(!html.includes('humour') && !html.includes('playfulness') && !html.includes('expressiveness'));
  assert.ok(html.includes('Les mots') && html.includes('"known":true'));
});

test('a name cannot close the script block', () => {
  const html = page({ id: 'x', steps: [{ type: 'swipe', items: [{ src: 'a.png', name: '</script><b>' }] }] });
  assert.ok(!html.includes('</script><b>'));
});

test('decode reads answers, attributes and the note', () => {
  const round = loadRound(seed(), 'r1');
  const v = decode(round, `pasted: bb1.r1.l02,x,b1.${Buffer.from('trop bavard').toString('base64url')} merci`);
  assert.deepEqual(v.answers[0], { kind: 'swipe', objective: 'humour', targets: ['playfulness'], ref: 'alpha', name: 'Alpha', verdict: 'liked_not_for_us', attributes: ['Les mots', 'Le ton'] });
  assert.equal(v.answers[1].verdict, 'never');
  assert.deepEqual([v.answers[2].choice, v.answers[2].picked, v.answers[2].attributes], ['b', ['gamma'], ['Plus chaud']]);
  assert.equal(v.note, 'trop bavard');
});

test('decode refuses a code for another round, a wrong count and an unknown letter', () => {
  const round = loadRound(seed(), 'r1');
  assert.throws(() => decode(round, 'bb1.r2.y,y,a.'), /round "r2"/);
  assert.throws(() => decode(round, 'bb1.r1.y,y.'), /2 answers.*3 screens/);
  assert.throws(() => decode(round, 'bb1.r1.q,y,a.'), /not a swipe answer/);
  assert.throws(() => decode(round, 'hello'), /not a board code/);
});

test('unknown, skipped and refused are three different things', () => {
  const round = loadRound(seed(), 'r1');
  const v = decode(round, 'bb1.r1.u,_,n.');
  assert.deepEqual(v.answers.map((a) => a.verdict || a.choice), ['unknown', 'skipped', 'neither']);
});

test('record writes interactions and verdicts, and replaces a round recorded twice', () => {
  const dir = seed(), round = loadRound(dir, 'r1');
  save(dir, round, 'bb1.r1.y0,x,2.');
  save(dir, round, 'bb1.r1.x1,y,a0.');
  const b = brief(dir);
  assert.deepEqual(b.interactions.map((x) => x.id), ['q01', 'r1-01', 'r1-02', 'r1-03']);
  const alpha = b.references.find((r) => r.id === 'alpha');
  assert.equal(alpha.verdict, 'never');
  assert.deepEqual(alpha.rejected_attributes, ['La couleur']);
  assert.deepEqual(b.interactions[3].picked, ['alpha']);
  assert.ok(JSON.parse(readFileSync(join(dir, 'rounds', 'r1.votes.json'), 'utf8')).answers.length === 3);
});

test('the single file embeds every image', () => {
  const dir = seed();
  const html = buildSingle(dir, loadRound(dir, 'r1'));
  assert.ok(html.includes('data:image/png;base64,') && !html.includes('evidence/alpha.png'));
});

test('serve hands out the board and the images, takes the votes and stops', async () => {
  const dir = seed(), round = loadRound(dir, 'r1');
  const done = serve(dir, round, { port: 47631, minutes: 1 });
  await new Promise((r) => setTimeout(r, 150));
  const base = 'http://127.0.0.1:47631';
  assert.ok((await (await fetch(base + '/')).text()).includes('"post":"/votes"'));
  assert.equal((await fetch(base + '/evidence/alpha.png')).status, 200);
  assert.equal((await fetch(base + '/brief.json')).status, 404);
  assert.equal((await fetch(base + '/..%2f..%2fetc/passwd')).status, 404);
  assert.equal((await fetch(base + '/votes', { method: 'POST', body: 'nonsense' })).status, 400);
  assert.equal((await fetch(base + '/votes', { method: 'POST', body: 'bb1.r1.y,l,n.' })).status, 200);
  const votes = await done;
  assert.match(summary(votes), /Speaks to them: Alpha/);
  assert.equal(brief(dir).references[1].verdict, 'liked_not_for_us');
});
