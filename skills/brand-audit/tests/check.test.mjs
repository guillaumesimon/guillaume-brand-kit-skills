import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { checkAudit } from '../assets/check.mjs';
import { sheetPages } from '../assets/sheets.mjs';

const assets = fileURLToPath(new URL('../assets/', import.meta.url));
const example = () => JSON.parse(readFileSync(join(assets, 'audit.example.json')));

/** A complete audit directory built from the example, with empty files standing in for images. */
function fixture(mutate) {
  const dir = mkdtempSync(join(tmpdir(), 'ba-chk-'));
  const audit = example();
  const md = readFileSync(join(assets, 'AUDIT.example.md'), 'utf8');
  const paths = new Set([...md.matchAll(/`(evidence\/[^`\s]+)`/g)].map((m) => m[1]));
  for (const b of audit.panel) { b.evidence.forEach((p) => paths.add(p)); if (b.logo) paths.add(b.logo); }
  for (const c of [...audit.conventions, ...audit.opportunities]) c.evidence.forEach((p) => paths.add(p));
  for (const p of paths) { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), ''); }
  copyFileSync(join(assets, 'AUDIT.example.md'), join(dir, 'AUDIT.md'));
  writeFileSync(join(dir, 'landscape.html'), '<html></html>');
  mutate?.(audit, dir);
  writeFileSync(join(dir, 'audit.json'), JSON.stringify(audit));
  return dir;
}

test('the worked example passes the gate', () => assert.deepEqual(checkAudit(fixture()).errors, []));
test('the example AUDIT.md stays under 120 lines', () => {
  assert.ok(readFileSync(join(assets, 'AUDIT.example.md'), 'utf8').split('\n').length < 120);
});
test('missing evidence in audit.json fails and is named', () => {
  const dir = fixture(); rmSync(join(dir, 'evidence/bindery/desktop.webp'));
  assert.ok(checkAudit(dir).errors.some((e) => /evidence not found: evidence\/bindery\/desktop\.webp/.test(e)));
});
test('AUDIT.md citing a missing file fails', () => {
  const dir = fixture((a, d) => writeFileSync(join(d, 'AUDIT.md'), 'Keep blue. `evidence/ghost/desktop.webp`'));
  assert.ok(checkAudit(dir).errors.some((e) => /AUDIT\.md: evidence not found: evidence\/ghost/.test(e)));
});
test('a convention left unclassified fails', () => {
  const dir = fixture((a) => { delete a.conventions[0].class; });
  assert.ok(checkAudit(dir).errors.some((e) => /is not classified/.test(e)));
});
test('deep mode requires the counter-check on every opportunity', () => {
  const dir = fixture((a) => { a.meta.mode = 'deep'; a.opportunities[0].challenged = { searched: ['bookshop app warm paper brand'], result: 'held' }; });
  const errs = checkAudit(dir).errors.filter((e) => /counter-check/.test(e));
  assert.equal(errs.length, 1);
  assert.match(errs[0], /the-back-office/);
});
test('a captured direct brand without codes fails', () => {
  const dir = fixture((a) => { delete a.panel[2].codes; });
  assert.ok(checkAudit(dir).errors.some((e) => /not coded: pagewise/.test(e)));
});
test('the CLI exits 1 on failure and 0 on success', () => {
  assert.match(execFileSync('node', [join(assets, 'check.mjs'), fixture()], { encoding: 'utf8' }), /^OK/m);
  assert.throws(() => execFileSync('node', [join(assets, 'check.mjs'), fixture((a) => { a.limits = []; })], { encoding: 'utf8', stdio: 'pipe' }), (e) => e.status === 1 && /limits/.test(e.stdout));
});
test('sheets label cells with name and role only, and skip missing images', () => {
  const a = example();
  const pages = sheetPages(a, '/tmp/x', (p) => !p.includes('folio'));
  assert.deepEqual(Object.keys(pages).sort(), ['apps', 'heroes', 'logos', 'palettes', 'type']);
  assert.ok(pages.logos.includes('no logo captured'));
  assert.ok(!pages.heroes.includes('folio/desktop.webp'));
  assert.ok(pages.heroes.includes('bindery/desktop.webp'));
  assert.ok(!/wordmark|combination|cliche/.test(pages.logos));
});
test('an unsettled coding conflict fails', () => {
  const dir = fixture((a) => { a.panel[0].code_conflicts = { imagery: ['product_ui', 'people_photo'] }; });
  assert.ok(checkAudit(dir).errors.some((e) => /conflicts not settled: folio/.test(e)));
});
