#!/usr/bin/env node
// Count what the coders observed. Frequencies are computed, never estimated.
//   node aggregate.mjs <audit-dir> [--axes imagery,ground] [--axes hue,logo_type]   (one map per --axes)
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
export function mapAxes(panel, forced = [], exclude = []) {
  const base = panel.filter(inBase);
  if (base.length < MIN_BASE) return null;
  const cands = [];
  for (const dim of DIMENSIONS) {
    if (NOT_AN_AXIS.has(dim) || exclude.includes(dim)) continue;
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

/**
 * Stable IDs for everything a recommendation can cite. An ID is given once and never reused:
 * F-<section>-<n> for a section finding, C-<n> for a convention, O-<n> is the opportunity's own slug.
 */
export function assignIds(audit) {
  const next = (items, prefix) => {
    let n = items.reduce((m, it) => Math.max(m, +(String(it.id || '').match(new RegExp(`^${prefix}(\\d+)$`))?.[1] || 0)), 0);
    for (const it of items) if (!it.id) it.id = `${prefix}${String(++n).padStart(2, '0')}`;
  };
  const short = { logos: 'LOG', architecture: 'ARC', colour: 'COL', typography: 'TYP', symbols: 'SYM', visual_language: 'VIS' };
  for (const [key, sec] of Object.entries(audit.sections || {})) next(sec.findings || [], `F-${short[key] || key.toUpperCase()}-`);
  next(audit.conventions || [], 'C-');
  return audit;
}

/** Recompute an audit directory in place and return the audit. */
export function aggregate(auditDir, axes = []) {
  const file = join(auditDir, 'audit.json');
  const audit = JSON.parse(readFileSync(file, 'utf8'));
  const thresholds = audit.meta?.thresholds || { convention: 0.6, rare: 0.15 };
  audit.frequencies = frequencies(audit.panel, thresholds, audit.meta?.mode);
  const previous = new Map((audit.conventions || []).filter((c) => !c.manual).map((c) => [`${c.dimension}=${norm(c.value)}`, c]));
  // A convention the analyst wrote by hand (`manual: true`, e.g. a pattern across two values) is kept as written.
  const manual = (audit.conventions || []).filter((c) => c.manual);
  // Too few brands to count: keep what was judged, marked stale, rather than erase the analyst's work.
  audit.conventions = audit.frequencies.insufficient ? (audit.conventions || []).map((c) => ({ ...c, stale: true })) : [...conventionCandidates(audit.frequencies, audit.panel).map((c) => {
    const old = previous.get(`${c.dimension}=${c.value}`);
    return old?.class ? { ...c, id: old.id, class: old.class, provenance: old.provenance, reason: old.reason, evidence: old.evidence, confidence: old.confidence, population: old.population } : old?.id ? { ...c, id: old.id } : c;
  }), ...manual];
  // Several maps: the pairs the analyst named, else the best pair and the best of what is left.
  const before = audit.maps || (audit.map ? [audit.map] : []);
  const readingOf = (m) => before.find((o) => o.x?.dimension === m.x.dimension && o.y?.dimension === m.y.dimension)?.reading;
  const pairs = axes.length ? axes : before.filter((m) => m.forced).map((m) => m.forced);
  let maps = [];
  if (!audit.frequencies.insufficient) {
    if (pairs.length) maps = pairs.map((pair) => { const m = mapAxes(audit.panel, pair); if (m) m.forced = pair; return m; }).filter(Boolean);
    else {
      const first = mapAxes(audit.panel);
      const second = first && mapAxes(audit.panel, [], [first.x.dimension, first.y.dimension]);
      maps = [first, second].filter(Boolean);
    }
  }
  for (const m of maps) { const r = readingOf(m); if (r) m.reading = r; }
  audit.maps = maps;
  audit.map = maps[0] || null;
  assignIds(audit);
  writeFileSync(file, JSON.stringify(audit, null, 2) + '\n');
  return audit;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const dir = process.argv[2];
  if (!dir || dir.startsWith('--')) { console.log('usage: node aggregate.mjs <audit-dir> [--axes dimension,dimension]'); process.exit(dir === '--help' ? 0 : 1); }
  const axes = [];
  process.argv.forEach((v, i) => { const n = process.argv[i + 1]; if (v === '--axes' && n && !n.startsWith('--')) axes.push(n.split(',')); });
  const a = aggregate(dir, axes);
  const f = a.frequencies;
  if (f.insufficient) { console.log(f.reason); process.exit(0); }
  console.log(`base: ${f.base} direct brands captured in full and coded (${a.meta?.mode || 'deep'} mode)\n`);
  for (const [dim, values] of Object.entries(f.by_dimension))
    console.log(dim.padEnd(17) + values.slice(0, 5).map((v) => `${v.value} ${v.count}/${v.base}${v.status === 'convention' ? ' ●' : ''}`).join('  '));
  console.log(`\n${a.conventions.length} convention(s), ${a.conventions.filter((c) => !c.class).length} to classify:`);
  for (const c of a.conventions)
    console.log(`  ${c.class ? c.class.padEnd(10) : 'TO CLASSIFY'} ${c.dimension}: ${c.value} (${c.count} of ${c.base}) · breakers: ${c.breakers.map((b) => b.id + (b.established ? '*' : '')).join(', ') || 'none'}`);
  console.log('  * = established brand');
  if (!a.maps.length) console.log('\nmap: not enough spread in the codes to draw two axes');
  for (const m of a.maps) {
    console.log(`\nmap: ${m.x.dimension} [${m.x.poles.join(' | ')}] × ${m.y.dimension} [${m.y.poles.join(' | ')}]`);
    for (const c of m.clusters) console.log(`  ${c.label}: ${c.ids.length}${c.saturated ? ' (saturated)' : c.ids.length === 0 ? ' (empty)' : ''}`);
  }
}
