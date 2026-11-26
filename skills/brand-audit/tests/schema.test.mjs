import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateAudit, VOCAB, DIMENSIONS } from '../assets/lib/schema.mjs';

const example = JSON.parse(readFileSync(new URL('../assets/audit.example.json', import.meta.url)));
const clone = () => structuredClone(example);
const combo = (a) => a.panel.findIndex((b) => b.codes?.logo_type === 'combination');
const word = (a) => a.panel.findIndex((b) => b.codes?.logo_type === 'wordmark');

test('logo type has exactly the seven standard values', () => {
  assert.deepEqual(VOCAB.logo_type, ['wordmark', 'lettermark', 'pictorial', 'abstract', 'combination', 'emblem', 'mascot']);
  assert.ok(DIMENSIONS.includes('symbol_subject'));
});
test('example audit is valid', () => assert.deepEqual(validateAudit(example), []));
test('example covers the five convention classes', () => {
  assert.deepEqual([...new Set(example.conventions.map((c) => c.class))].sort(), ['cliche', 'emerging', 'legibility', 'owned', 'risky']);
});
test('example has the six written sections, a summary and a profile per brand', () => {
  assert.deepEqual(Object.keys(example.sections).sort(), ['architecture', 'colour', 'logos', 'symbols', 'typography', 'visual_language']);
  assert.ok(example.summary.validate.length && example.panel.every((b) => b.profile));
});
test('a section finding without evidence is rejected', () => {
  const a = clone(); a.sections.colour.findings[0].evidence = [];
  assert.match(validateAudit(a).join('\n'), /sections\.colour\.findings\[0\]\.evidence/);
});
test('a summary decision needs evidence, except what is still to validate', () => {
  const a = clone(); delete a.summary.avoid[0].evidence; delete a.summary.validate[0].evidence;
  const errs = validateAudit(a);
  assert.equal(errs.length, 1);
  assert.match(errs[0], /summary\.avoid\[0\]\.evidence/);
});
test('an unknown section name is rejected', () => {
  const a = clone(); a.sections.vibes = a.sections.colour;
  assert.match(validateAudit(a).join('\n'), /sections\.vibes: unknown section/);
});
test('rejects an unknown logo type', () => {
  const a = clone(); a.panel[0].codes.logo_type = 'logo';
  assert.match(validateAudit(a)[0], /panel\[0\]\.codes\.logo_type/);
});
test('accepts other: values', () => {
  const a = clone(); a.panel[0].codes.imagery = 'other:route maps';
  assert.deepEqual(validateAudit(a), []);
});
test('symbol_nature is required on combination marks', () => {
  const a = clone(); const i = combo(a); delete a.panel[i].codes.symbol_nature;
  assert.match(validateAudit(a).join('\n'), new RegExp(`panel\\[${i}\\]\\.codes\\.symbol_nature: required`));
});
test('symbol_nature is refused on other logo types', () => {
  const a = clone(); const i = word(a); a.panel[i].codes.symbol_nature = 'abstract';
  assert.match(validateAudit(a).join('\n'), /only for combination/);
});
test('a finding without evidence is rejected', () => {
  const a = clone(); a.conventions[0].evidence = [];
  assert.match(validateAudit(a)[0], /conventions\[0\]\.evidence/);
});
test('established is required on direct and leader brands', () => {
  const a = clone(); const i = a.panel.findIndex((b) => b.role === 'direct'); delete a.panel[i].established;
  assert.match(validateAudit(a)[0], new RegExp(`panel\\[${i}\\]\\.established.*${a.panel[i].name}`));
});
test('an opportunity may only import from a panel brand', () => {
  const a = clone(); a.opportunities[0].import = [{ from: 'nobody', what: 'x' }];
  assert.match(validateAudit(a).join('\n'), /"nobody" is not in the panel/);
});
test('duplicate ids are rejected', () => {
  const a = clone(); a.panel[1].id = a.panel[0].id;
  assert.match(validateAudit(a).join('\n'), /duplicate/);
});
