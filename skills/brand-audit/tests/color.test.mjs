import test from 'node:test';
import assert from 'node:assert/strict';
import { parseColor, toHex, classify, palette } from '../assets/lib/color.mjs';

test('parses the CSS forms a browser returns', () => {
  assert.deepEqual(parseColor('rgb(216, 236, 252)'), { r: 216, g: 236, b: 252, a: 1 });
  assert.equal(parseColor('rgba(0, 0, 0, 0)').a, 0);
  assert.deepEqual(parseColor('#fff'), { r: 255, g: 255, b: 255, a: 1 });
  assert.deepEqual(parseColor('#1F5D45'), { r: 31, g: 93, b: 69, a: 1 });
  assert.deepEqual(parseColor('color(srgb 1 0.5 0 / 0.5)'), { r: 255, g: 128, b: 0, a: 0.5 });
  assert.deepEqual(parseColor('rgb(10 20 30 / 50%)'), { r: 10, g: 20, b: 30, a: 0.5 });
  assert.equal(parseColor('oklch(0.7 0.1 200)'), null);
  assert.equal(parseColor('transparent'), null);
  assert.equal(parseColor(undefined), null);
});
test('hex round trip', () => assert.equal(toHex(parseColor('#1F5D45')), '#1f5d45'));
test('classifies hue families', () => {
  assert.equal(classify(parseColor('rgb(216, 236, 252)')).hue, 'blue');
  assert.equal(classify(parseColor('#FBF7F1')).hue, 'neutral');
  assert.equal(classify(parseColor('#1F5D45')).hue, 'green');
  assert.equal(classify(parseColor('#fc4c02')).hue, 'orange');
  assert.equal(classify(parseColor('#e11d48')).hue, 'red');
  assert.equal(classify(parseColor('#7c3aed')).hue, 'purple');
  assert.equal(classify(parseColor('#7c4a2d')).hue, 'brown');
  assert.equal(classify(parseColor('#14b8a6')).hue, 'teal');
  assert.equal(classify(parseColor('#111111')).hue, 'neutral');
});
test('classifies saturation', () => {
  assert.equal(classify(parseColor('#FF5A1F')).saturation, 'vivid');
  assert.equal(classify(parseColor('#8a9aa8')).saturation, 'muted');
});
test('palette merges near colours, drops transparent ones, shares sum to 1', () => {
  const p = palette([{ color: '#ffffff', weight: 60 }, { color: '#fefefe', weight: 20 }, { color: '#ff0000', weight: 20 }, { color: 'rgba(0,0,0,0.2)', weight: 500 }]);
  assert.equal(p.length, 2);
  assert.equal(p[0].share, 0.8);
  assert.equal(p[1].hex, '#ff0000');
  assert.equal(p[1].hue, 'red');
});
test('palette of nothing is empty', () => assert.deepEqual(palette([]), []));
