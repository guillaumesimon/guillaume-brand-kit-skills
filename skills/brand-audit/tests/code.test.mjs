import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeCodes } from '../assets/code.mjs';

const panel = () => [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }];
const ok = { logo_type: 'wordmark', hue: 'blue', imagery: 'product_ui' };

test('codes are merged onto their brand', () => {
  const p = panel();
  const r = mergeCodes(p, { a: ok });
  assert.deepEqual(p[0].codes, ok);
  assert.deepEqual(r, { merged: ['a'], errors: [], conflicts: [] });
});
test('a value outside the vocabulary is refused and nothing is written for that brand', () => {
  const p = panel();
  const r = mergeCodes(p, { a: { ...ok, logo_type: 'logotype' }, b: ok });
  assert.equal(p[0].codes, undefined);
  assert.deepEqual(r.merged, ['b']);
  assert.match(r.errors[0], /a\.logo_type/);
});
test('an unknown brand id is an error', () => {
  assert.match(mergeCodes(panel(), { zzz: ok }).errors[0], /zzz.*not in the panel/);
});
test('a second coding that disagrees is recorded, the first value stands', () => {
  const p = panel();
  mergeCodes(p, { a: ok });
  const r = mergeCodes(p, { a: { ...ok, imagery: 'people_photo', notes: 'second look' } });
  assert.equal(p[0].codes.imagery, 'product_ui');
  assert.deepEqual(p[0].code_conflicts, { imagery: ['product_ui', 'people_photo'] });
  assert.deepEqual(r.conflicts, ['a.imagery: product_ui / people_photo']);
});
test('a second coding that agrees leaves no conflict', () => {
  const p = panel();
  mergeCodes(p, { a: ok }); mergeCodes(p, { a: ok });
  assert.equal(p[0].code_conflicts, undefined);
});
test('--resolve style: an explicit resolution replaces the value and clears the conflict', () => {
  const p = panel();
  mergeCodes(p, { a: ok }); mergeCodes(p, { a: { ...ok, imagery: 'people_photo' } });
  mergeCodes(p, { a: { imagery: 'people_photo' } }, { resolve: true });
  assert.equal(p[0].codes.imagery, 'people_photo');
  assert.equal(p[0].code_conflicts, undefined);
  assert.equal(p[0].codes.logo_type, 'wordmark');
});
