import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { frequencies, conventionCandidates, mapAxes, aggregate } from '../assets/aggregate.mjs';

const T = { convention: 0.6, rare: 0.15 };
const brand = (id, codes, extra = {}) => ({ id, name: id, role: 'direct', capture: 'full', established: { value: false, reason: 'x' }, codes: { logo_type: 'wordmark', ...codes }, ...extra });
const ten = () => [
  ...['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id, i) => brand(id, { hue: 'blue', layout: i < 4 ? 'split_hero' : 'centered_hero', imagery: i % 2 ? 'product_ui' : 'people_photo' })),
  brand('h', { hue: 'green', layout: 'split_hero', imagery: 'product_ui' }, { established: { value: true, reason: 'leader' } }),
  brand('i', { hue: 'neutral', layout: 'centered_hero', imagery: 'people_photo' }),
  brand('j', { hue: 'Other:Neon', layout: 'centered_hero', imagery: 'product_ui' }),
];

test('7 of 10 blue is a convention, with count, base and share', () => {
  const f = frequencies(ten(), T, 'deep');
  const blue = f.by_dimension.hue.find((v) => v.value === 'blue');
  assert.deepEqual({ count: blue.count, base: blue.base, share: blue.share, status: blue.status }, { count: 7, base: 10, share: 0.7, status: 'convention' });
  assert.deepEqual(blue.brands, ['a', 'b', 'c', 'd', 'e', 'f', 'g']);
  assert.equal(f.by_dimension.hue.find((v) => v.value === 'green').status, 'rare');
  assert.ok(f.by_dimension.hue.some((v) => v.value === 'other:neon'));
});
test('partial captures and other roles are not in the base', () => {
  const p = [...ten(), brand('k', { hue: 'red' }, { capture: 'partial' }), brand('l', { hue: 'red' }, { role: 'aspirational' }), { id: 'm', role: 'direct', capture: 'full' }];
  const f = frequencies(p, T, 'deep');
  assert.equal(f.base, 10);
  assert.ok(!f.by_dimension.hue.some((v) => v.value === 'red'));
});
test('a dimension coded on few brands uses its own base', () => {
  const p = ten(); p[0].codes.logo_type = 'combination'; p[0].codes.symbol_nature = 'abstract'; p[1].codes.logo_type = 'combination'; p[1].codes.symbol_nature = 'abstract';
  const f = frequencies(p, T, 'deep');
  assert.equal(f.by_dimension.symbol_nature[0].base, 2);
  assert.notEqual(f.by_dimension.symbol_nature[0].status, 'convention'); // 2 of 2 is too thin to call
});
test('breakers carry established', () => {
  const p = ten();
  const c = conventionCandidates(frequencies(p, T, 'deep'), p).find((x) => x.dimension === 'hue');
  assert.equal(c.value, 'blue');
  assert.deepEqual(c.breakers, [{ id: 'h', established: true, value: 'green' }, { id: 'i', established: false, value: 'neutral' }, { id: 'j', established: false, value: 'other:neon' }]);
});
test('fewer than 4 usable direct brands is insufficient', () => {
  const f = frequencies(ten().slice(0, 3), T, 'deep');
  assert.equal(f.insufficient, true);
  assert.equal(f.base, 3);
});
test('flash needs at least 5 brands to call a convention', () => {
  const p = ten().slice(0, 6); // 6 brands, all blue
  p[4].codes.hue = 'red'; p[5].codes.hue = 'green'; // 4 of 6 blue = 0.67
  assert.equal(frequencies(p, T, 'flash').by_dimension.hue[0].status, 'common');
  assert.equal(frequencies(p, T, 'deep').by_dimension.hue[0].status, 'convention');
});
test('map axes never use a dimension without spread', () => {
  const p = ten();
  const m = mapAxes(p);
  const dims = [m.x.dimension, m.y.dimension];
  assert.ok(!dims.includes('logo_type'), dims.join()); // 100% wordmark
  assert.ok(dims.includes('layout') && dims.includes('imagery'), dims.join());
  assert.equal(m.points.length, 10);
  assert.ok(m.points.every((pt) => pt.x >= -1 && pt.x <= 1 && pt.y >= -1 && pt.y <= 1));
  assert.deepEqual(mapAxes(p).points, m.points); // deterministic
});
test('map is null when no two dimensions have spread', () => {
  assert.equal(mapAxes(ten().map((b) => ({ ...b, codes: { logo_type: 'wordmark', hue: 'blue' } }))), null);
});
test('aggregate keeps an existing classification on re-run', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ba-agg-'));
  const audit = JSON.parse(readFileSync(new URL('../assets/audit.example.json', import.meta.url)));
  audit.conventions = audit.conventions.filter((c) => c.dimension !== 'logo_type'); // one not judged yet
  writeFileSync(join(dir, 'audit.json'), JSON.stringify(audit));
  const out = aggregate(dir);
  const blue = out.conventions.find((c) => c.dimension === 'hue' && c.value === 'blue');
  assert.equal(blue.class, 'cliche');
  assert.match(blue.reason, /Bindery/);
  assert.equal(blue.count, 6);
  assert.deepEqual(out.conventions.filter((c) => !c.class).map((c) => c.dimension), ['logo_type']); // new candidates arrive unclassified
  assert.equal(JSON.parse(readFileSync(join(dir, 'audit.json'))).frequencies.base, 8);
});
test('the analyst can name the axes, and the choice survives a re-run', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ba-axes-'));
  writeFileSync(join(dir, 'audit.json'), readFileSync(new URL('../assets/audit.example.json', import.meta.url)));
  const m = aggregate(dir, ['name_style', 'layout']).map;
  assert.deepEqual([m.x.dimension, m.y.dimension].sort(), ['layout', 'name_style']);
  assert.deepEqual(aggregate(dir).map.forced, ['name_style', 'layout']);
});
test('a convention written by the analyst survives a re-run', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ba-man-'));
  const audit = JSON.parse(readFileSync(new URL('../assets/audit.example.json', import.meta.url)));
  audit.conventions.push({ manual: true, dimension: 'imagery', value: 'a screen or a shelf', count: 8, base: 8, share: 1, breakers: [], class: 'legibility', provenance: 'judged', reason: 'x', evidence: ['evidence/sheets/heroes.webp'] });
  writeFileSync(join(dir, 'audit.json'), JSON.stringify(audit));
  const out = aggregate(dir);
  assert.equal(out.conventions.filter((c) => c.manual).length, 1);
  assert.equal(aggregate(dir).conventions.filter((c) => c.manual).length, 1);
});
test('classifications are not erased when the base drops under 4', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ba-dip-'));
  const audit = JSON.parse(readFileSync(new URL('../assets/audit.example.json', import.meta.url)));
  audit.panel.slice(0, 6).forEach((b) => { b.capture = 'partial'; });
  writeFileSync(join(dir, 'audit.json'), JSON.stringify(audit));
  const out = aggregate(dir);
  assert.equal(out.frequencies.insufficient, true);
  assert.equal(out.conventions.length, audit.conventions.length);
  assert.ok(out.conventions.every((c) => c.stale === true && c.reason));
});
test('--axes without a value is ignored, not a crash', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ba-ax-'));
  writeFileSync(join(dir, 'audit.json'), readFileSync(new URL('../assets/audit.example.json', import.meta.url)));
  assert.match(execFileSync('node', [fileURLToPath(new URL('../assets/aggregate.mjs', import.meta.url)), dir, '--axes'], { encoding: 'utf8' }), /base: 8/);
});
