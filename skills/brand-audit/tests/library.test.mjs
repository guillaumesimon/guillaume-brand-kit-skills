import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseList, parseDataset, selectIndustry, facetCounts } from '../assets/library.mjs';

const fx = (f) => readFileSync(new URL('./fixtures/' + f, import.meta.url), 'utf8');

test('parseList reads slugs and images from an industry page', () => {
  const items = parseList(fx('logosystem-list.html'));
  assert.equal(items.length, 8); // only the first logos are rendered in the markup
  assert.deepEqual(items[0], { slug: 'northpace', name: 'Northpace', image: 'https://cdn.logosystem.co/logos/example-00.webp' });
  assert.equal(new Set(items.map((i) => i.slug)).size, items.length);
});
test('parseList of an unknown markup is empty, not an error', () => assert.deepEqual(parseList('<html></html>'), []));
test('parseDataset decodes the embedded catalogue', () => {
  const logos = parseDataset(fx('logosystem-data.html'));
  assert.equal(logos.length, 15);
  assert.ok(logos[0].slug && logos[0].type && Array.isArray(logos[0].colors));
});
test('parseDataset of an unknown markup is empty', () => assert.deepEqual(parseDataset('<html></html>'), []));
test('selectIndustry keeps one industry and normalises the tags', () => {
  const items = selectIndustry(parseDataset(fx('logosystem-data.html')), 'sports-and-fitness');
  assert.equal(items.length, 12);
  assert.match(items[0].url, /^https:\/\/logosystem\.co\/logo\//);
  assert.ok(items.every((i) => /^[a-z0-9-]+$/.test(i.type)));
  assert.deepEqual(selectIndustry(parseDataset(fx('logosystem-data.html')), 'no-such-industry'), []);
});
test('facetCounts gives count and share per value, most frequent first', () => {
  const f = facetCounts([{ type: 'wordmark', colours: ['blue', 'blue'] }, { type: 'wordmark', colours: ['black'] }, { type: 'symbol', colours: ['blue'] }, { type: 'symbol-and-text', colours: [] }]);
  assert.deepEqual(f.type.wordmark, { count: 2, share: 0.5 });
  assert.deepEqual(Object.keys(f.colour), ['blue', 'black']);
  assert.equal(f.colour.blue.count, 2);
});
