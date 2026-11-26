#!/usr/bin/env node
// Count what the coders observed. Frequencies are computed, never estimated.
//   node aggregate.mjs <audit-dir> [--axes imagery,ground]
// Writes `frequencies`, the convention candidates (keeping classifications already made) and `map`.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DIMENSIONS } from './lib/schema.mjs';

const MIN_BASE = 4;
const norm = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : null);
const inBase = (b) => b.role === 'direct' && b.capture === 'full' && b.codes;

/**
 * Share of each coded value among the direct brands captured in full.
 * Each dimension uses its own base: the brands that have a value for it.
 */
export function frequencies(panel, thresholds, mode = 'deep') {
  const base = panel.filter(inBase);
  const out = { base: base.length, by_dimension: {} };
  if (base.length < MIN_BASE) {
    out.insufficient = true;
    out.reason = `Only ${base.length} direct brand(s) captured in full and coded; at least ${MIN_BASE} are needed to count anything.`;
    return out;
  }
  for (const dim of DIMENSIONS) {
    const groups = new Map();
    for (const b of base) {
      const v = norm(b.codes[dim]);
      if (!v) continue;
      if (!groups.has(v)) groups.set(v, []);
      groups.get(v).push(b.id);
    }
    const n = [...groups.values()].reduce((a, g) => a + g.length, 0);
    if (!n) continue;
    out.by_dimension[dim] = [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).map(([value, brands]) => {
      const share = +(brands.length / n).toFixed(3);
      const convention = share >= thresholds.convention && n >= MIN_BASE && (mode !== 'flash' || brands.length >= 5);
      return { value, count: brands.length, base: n, share, brands, status: convention ? 'convention' : share <= thresholds.rare ? 'rare' : 'common' };
    });
  }
  return out;
}

/** Each convention with the brands that do otherwise. `established` is what the exception test needs. */
export function conventionCandidates(freq, panel) {
  const out = [];
  for (const [dimension, values] of Object.entries(freq.by_dimension || {})) {
    for (const v of values.filter((x) => x.status === 'convention')) {
      const breakers = panel
        .filter((b) => (inBase(b) || (b.role === 'leader' && b.codes)) && norm(b.codes[dimension]) && norm(b.codes[dimension]) !== v.value)
        .map((b) => ({ id: b.id, established: !!b.established?.value, value: norm(b.codes[dimension]) }));
      out.push({ dimension, value: v.value, count: v.count, base: v.base, share: v.share, breakers });
    }
  }
  return out;
}

const NOT_AN_AXIS = new Set(['hue_count', 'name_case', 'symbol_nature', 'symbol_subject']);
const H = (p) => (p <= 0 || p >= 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p)));
function jitter(id, salt) {
  let h = 2166136261;
  for (const c of id + salt) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (((h >>> 0) % 1000) / 1000 - 0.5) * 0.7; // -0.35 … 0.35
}

/**
 * Two axes taken from the data: the dimensions that split the direct panel most evenly.
 * Each axis is the most frequent value against everything else.
 * @returns {null | {x, y, points, clusters}}
 */
export function mapAxes(panel, forced = []) {
  const base = panel.filter(inBase);
  if (base.length < MIN_BASE) return null;
  const cands = [];
  for (const dim of DIMENSIONS) {
    if (NOT_AN_AXIS.has(dim)) continue;
    const counts = {};
    let n = 0;
    for (const b of base) { const v = norm(b.codes[dim]); if (v) { counts[v] = (counts[v] || 0) + 1; n++; } }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    if (n < MIN_BASE || sorted.filter(([, c]) => c / n >= 0.2).length < 2) continue;
    const rest = sorted.slice(1);
    cands.push({ dimension: dim, poles: [sorted[0][0], rest.length === 1 ? rest[0][0] : 'other'], top: sorted[0][0], entropy: H(sorted[0][1] / n) });
  }
  // Dimensions named by the analyst come first, when they have enough spread to be an axis.
  cands.sort((a, b) => (forced.includes(b.dimension) - forced.includes(a.dimension)) || b.entropy - a.entropy);
  const side = (b, ax) => { const v = norm(b.codes?.[ax.dimension]); return v ? (v === ax.top ? -1 : 1) : null; };
  const x = cands[0];
  // The second axis must not be the first one in disguise.
  const y = cands.slice(1).find((c) => {
    const pairs = base.map((b) => [side(b, x), side(b, c)]).filter(([a, d]) => a && d);
    const agree = pairs.filter(([a, d]) => a === d).length / (pairs.length || 1);
    return agree > 0.1 && agree < 0.9;
  });
  if (!x || !y) return null;
  const points = panel.filter((b) => b.codes && side(b, x) && side(b, y)).map((b) => ({
    id: b.id, role: b.role,
    x: +(side(b, x) * 0.5 + jitter(b.id, 'x')).toFixed(3), y: +(side(b, y) * 0.5 + jitter(b.id, 'y')).toFixed(3),
  }));
  const clusters = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const ids = base.filter((b) => side(b, x) === sx && side(b, y) === sy).map((b) => b.id);
    clusters.push({ quadrant: [sx, sy], ids, share: +(ids.length / base.length).toFixed(3), saturated: ids.length / base.length >= 0.4,
      label: `${x.poles[sx < 0 ? 0 : 1]} × ${y.poles[sy < 0 ? 0 : 1]}` });
  }
  const strip = ({ dimension, poles }) => ({ dimension, poles });
  return { x: strip(x), y: strip(y), points, clusters };
}

/** Recompute an audit directory in place and return the audit. */
export function aggregate(auditDir, axes = []) {
  const file = join(auditDir, 'audit.json');
  const audit = JSON.parse(readFileSync(file, 'utf8'));
  const thresholds = audit.meta?.thresholds || { convention: 0.6, rare: 0.15 };
  audit.frequencies = frequencies(audit.panel, thresholds, audit.meta?.mode);
  const previous = new Map((audit.conventions || []).map((c) => [`${c.dimension}=${norm(c.value)}`, c]));
  audit.conventions = audit.frequencies.insufficient ? [] : conventionCandidates(audit.frequencies, audit.panel).map((c) => {
    const old = previous.get(`${c.dimension}=${c.value}`);
    return old?.class ? { ...c, class: old.class, provenance: old.provenance, reason: old.reason, evidence: old.evidence } : c;
  });
  const reading = audit.map?.reading;
  const forced = axes.length ? axes : audit.map?.forced || [];
  audit.map = audit.frequencies.insufficient ? null : mapAxes(audit.panel, forced);
  if (audit.map && reading) audit.map.reading = reading;
  if (audit.map && forced.length) audit.map.forced = forced;
  writeFileSync(file, JSON.stringify(audit, null, 2) + '\n');
  return audit;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const dir = process.argv[2];
  if (!dir || dir.startsWith('--')) { console.log('usage: node aggregate.mjs <audit-dir> [--axes dimension,dimension]'); process.exit(dir === '--help' ? 0 : 1); }
  const ax = process.argv.indexOf('--axes');
  const a = aggregate(dir, ax > 0 ? process.argv[ax + 1].split(',') : []);
  const f = a.frequencies;
  if (f.insufficient) { console.log(f.reason); process.exit(0); }
  console.log(`base: ${f.base} direct brands captured in full and coded (${a.meta?.mode || 'deep'} mode)\n`);
  for (const [dim, values] of Object.entries(f.by_dimension))
    console.log(dim.padEnd(17) + values.slice(0, 5).map((v) => `${v.value} ${v.count}/${v.base}${v.status === 'convention' ? ' ●' : ''}`).join('  '));
  console.log(`\n${a.conventions.length} convention(s), ${a.conventions.filter((c) => !c.class).length} to classify:`);
  for (const c of a.conventions)
    console.log(`  ${c.class ? c.class.padEnd(10) : 'TO CLASSIFY'} ${c.dimension}: ${c.value} (${c.count} of ${c.base}) · breakers: ${c.breakers.map((b) => b.id + (b.established ? '*' : '')).join(', ') || 'none'}`);
  console.log('  * = established brand');
  if (a.map) {
    console.log(`\nmap: ${a.map.x.dimension} [${a.map.x.poles.join(' | ')}] × ${a.map.y.dimension} [${a.map.y.poles.join(' | ')}]`);
    for (const c of a.map.clusters) console.log(`  ${c.label}: ${c.ids.length}${c.saturated ? ' (saturated)' : c.ids.length === 0 ? ' (empty)' : ''}`);
  } else console.log('\nmap: not enough spread in the codes to draw two axes');
}
