// The closed vocabularies of brief.json and of a round, and the helpers every script shares.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Where a statement comes from. `assumed` is the only one that must reappear in open_questions. */
export const SOURCES = ['documented', 'stated', 'chosen', 'inferred', 'assumed'];
export const CIRCLES = ['direct', 'adjacent', 'analogous', 'aspirational'];
export const VERDICTS = ['for_us', 'liked_not_for_us', 'never', 'unknown', 'skipped'];
export const CONFIDENCE = ['unknown', 'low', 'medium', 'high'];
export const IMPORTANCE = ['low', 'medium', 'high'];
export const LEVELS = ['must', 'preference', 'explore', 'never'];
export const LOGO_PRIORITY = ['critical', 'expected', 'later'];
export const STATUS = ['draft', 'provisional', 'validated'];
export const CAPTURE = ['ok', 'blocked', 'failed', 'rejected'];

/** Words that describe every company. Allowed only beside the instance that proves them. */
export const GENERIC = [
  'integrity', 'innovation', 'innovative', 'excellence', 'trust', 'trustworthy', 'quality', 'passion', 'customer-centric',
  'seamless', 'effortless', 'empowering', 'transparency', 'simplicity', 'authentic', 'premium', 'modern', 'clean',
  'minimal', 'professional', 'disruptive', 'human',
  'intégrité', 'innovant', 'confiance', 'qualité', 'transparence', 'simplicité', 'authentique', 'moderne', 'épuré',
  'professionnel', 'humain', 'bienveillance', 'bienveillant',
];

/** The nine subjects a brief must cover, with the path that holds each. */
export const SECTIONS = [
  ['context', 'Business context'], ['audiences', 'Audiences'], ['positioning', 'Positioning'], ['ambition', 'Ambition'],
  ['values', 'Values'], ['personality', 'Personality'], ['perception', 'Desired perception'],
  ['references', 'References and taste'], ['constraints', 'Constraints and logo contexts'],
];

const SWIPE = { y: 'for_us', l: 'liked_not_for_us', x: 'never', u: 'unknown', _: 'skipped' };
const DUEL = { a: 'a', b: 'b', 2: 'both', n: 'neither', u: 'unknown', _: 'skipped' };

export const briefPath = (dir) => join(dir, 'brief.json');
export const readBrief = (dir) => JSON.parse(readFileSync(briefPath(dir), 'utf8'));
export const writeBrief = (dir, brief) => writeFileSync(briefPath(dir), JSON.stringify(brief, null, 2) + '\n');
export const roundPath = (dir, id, ext = 'json') => join(dir, 'rounds', `${id}.${ext}`);

/**
 * Load a round and resolve each `ref` against the brief's references, so a round names a
 * reference once and the image and the name come from its card.
 * @returns {{id:string, locale:string, steps:object[]}}
 */
export function loadRound(dir, id, brief = readBrief(dir)) {
  const round = JSON.parse(readFileSync(roundPath(dir, id), 'utf8'));
  const refs = new Map((brief.references || []).map((r) => [r.id, r]));
  const fill = (it) => {
    const r = refs.get(it.ref);
    if (!r && !(it.src && it.name)) throw new Error(`round ${id}: "${it.ref}" is not in brief.json references and carries no src and name`);
    return { ...it, name: it.name || r.name, src: it.src || r.asset };
  };
  if (round.id !== id) throw new Error(`round file ${id}.json declares id "${round.id}"`);
  if (!Array.isArray(round.steps) || !round.steps.length) throw new Error(`round ${id}: no steps`);
  for (const s of round.steps) {
    if (s.type === 'swipe') s.items = (s.items || []).map(fill);
    else if (s.type === 'duel') s.pairs = (s.pairs || []).map((p) => ({ ...p, a: fill(p.a), b: fill(p.b) }));
    else throw new Error(`round ${id}: unknown step type "${s.type}" (swipe or duel)`);
    for (const it of s.type === 'swipe' ? s.items : s.pairs.flatMap((p) => [p.a, p.b])) {
      if (!it.src) throw new Error(`round ${id}: "${it.ref}" has no image. Run fetch.mjs, or take it out of the round.`);
    }
  }
  round.locale = round.locale || brief.meta?.locale || 'fr';
  return round;
}

/** What the page is allowed to know: images, names, labels. Never the objective or the dimension tested. */
export function pageRound(round) {
  const item = ({ src, name, attributes }) => ({ src, name, ...(attributes?.length ? { attributes } : {}) });
  return {
    id: round.id, locale: round.locale,
    steps: round.steps.map((s) => s.type === 'swipe'
      ? { type: 'swipe', title: s.title, sub: s.sub, items: s.items.map(item) }
      : { type: 'duel', title: s.title, sub: s.sub, known: !!s.known, pairs: s.pairs.map((p) => ({ a: item(p.a), b: item(p.b), ...(p.attributes?.length ? { attributes: p.attributes } : {}) })) }),
  };
}

/** One entry per screen, in the order the board shows them. */
export function screensOf(round) {
  return round.steps.flatMap((s) => s.type === 'swipe'
    ? s.items.map((item) => ({ kind: 'swipe', step: s, item }))
    : s.pairs.map((pair) => ({ kind: 'duel', step: s, pair })));
}

/**
 * Turn the code a board returns into votes.
 * @param {string} code `bb1.<round>.<tokens>.<note>`, a token being an answer letter then attribute indexes in base 36
 */
export function decode(round, code) {
  const m = String(code).trim().match(/bb1\.([^.\s]+)\.([^.\s]*)\.([A-Za-z0-9_-]*)/);
  if (!m) throw new Error('not a board code (expected bb1.<round>.<answers>.<note>)');
  if (m[1] !== round.id) throw new Error(`this code is for round "${m[1]}", not "${round.id}"`);
  const screens = screensOf(round), toks = m[2].split(',');
  if (toks.length !== screens.length) throw new Error(`the code holds ${toks.length} answers and the round has ${screens.length} screens`);
  const answers = screens.map((sc, i) => {
    const c = toks[i][0], idx = [...toks[i].slice(1)].map((ch) => parseInt(ch, 36));
    const base = { objective: sc.step.objective || '', targets: sc.step.targets || [] };
    if (sc.kind === 'swipe') {
      if (!SWIPE[c]) throw new Error(`answer ${i + 1}: "${c}" is not a swipe answer`);
      return { kind: 'swipe', ...base, ref: sc.item.ref, name: sc.item.name, verdict: SWIPE[c], attributes: idx.map((k) => (sc.item.attributes || [])[k]).filter(Boolean) };
    }
    if (!DUEL[c]) throw new Error(`answer ${i + 1}: "${c}" is not a duel answer`);
    const p = sc.pair, choice = DUEL[c];
    const picked = choice === 'a' ? [p.a.ref] : choice === 'b' ? [p.b.ref] : choice === 'both' ? [p.a.ref, p.b.ref] : [];
    const labels = choice === 'a' || choice === 'b' ? (p[choice].attributes || p.attributes || []) : [];
    return { kind: 'duel', ...base, a: p.a.ref, b: p.b.ref, names: [p.a.name, p.b.name], choice, picked, attributes: idx.map((k) => labels[k]).filter(Boolean) };
  });
  return { round: round.id, at: new Date().toISOString(), answers, note: m[3] ? Buffer.from(m[3], 'base64url').toString('utf8') : '' };
}

const add = (list, values) => [...new Set([...(list || []), ...values])];

/**
 * Merge a round's votes into the brief: one interaction per screen, and each reference's verdict
 * and attributes. Recording the same round twice replaces the first recording.
 */
export function record(brief, votes) {
  const refs = new Map((brief.references || []).map((r) => [r.id, r]));
  brief.interactions = (brief.interactions || []).filter((x) => x.round !== votes.round);
  votes.answers.forEach((a, i) => {
    const id = `${votes.round}-${String(i + 1).padStart(2, '0')}`;
    if (a.kind === 'swipe') {
      const r = refs.get(a.ref);
      if (r) {
        r.verdict = a.verdict;
        if (a.verdict === 'never') r.rejected_attributes = add(r.rejected_attributes, a.attributes);
        else r.liked_attributes = add(r.liked_attributes, a.attributes);
      }
      brief.interactions.push({ id, round: votes.round, type: 'swipe', objective: a.objective, targets: a.targets, refs: [a.ref], answer: a.verdict, attributes: a.attributes, at: votes.at });
    } else {
      for (const ref of a.picked) { const r = refs.get(ref); if (r) r.liked_attributes = add(r.liked_attributes, a.attributes); }
      brief.interactions.push({ id, round: votes.round, type: 'duel', objective: a.objective, targets: a.targets, refs: [a.a, a.b], answer: a.choice, picked: a.picked, attributes: a.attributes, at: votes.at });
    }
  });
  if (votes.note) brief.verbatim = [...(brief.verbatim || []).filter((v) => v.about !== `round ${votes.round}`), { quote: votes.note, about: `round ${votes.round}` }];
  return brief;
}

/** How many statements of the brief come from each source. Interactions and references are not statements. */
export function provenance(brief) {
  const counts = Object.fromEntries(SOURCES.map((s) => [s, 0]));
  const walk = (x) => {
    if (Array.isArray(x)) return x.forEach(walk);
    if (!x || typeof x !== 'object') return;
    if (typeof x.source === 'string' && x.source in counts) counts[x.source]++;
    Object.values(x).forEach(walk);
  };
  const { interactions, references, ...rest } = brief;
  walk(rest);
  return counts;
}

/** Every object of the brief that carries a `source`, with a readable label. */
export function statements(brief) {
  const out = [];
  const walk = (x, path) => {
    if (Array.isArray(x)) return x.forEach((v, i) => walk(v, `${path}[${i}]`));
    if (!x || typeof x !== 'object') return;
    if (typeof x.source === 'string') out.push({ path, node: x });
    for (const [k, v] of Object.entries(x)) walk(v, path ? `${path}.${k}` : k);
  };
  const { interactions, references, ...rest } = brief;
  walk(rest, '');
  return out;
}
