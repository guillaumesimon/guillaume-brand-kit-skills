// The closed vocabularies of brief.json and of a round, and the helpers every script shares.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Where a statement comes from. `assumed` is the only one that must reappear in open_questions. */
export const SOURCES = ['documented', 'stated', 'chosen', 'inferred', 'assumed'];
/** Where a reference sits relative to the product. `buyer_world` is what the buyers look at every day. */
export const CIRCLES = ['buyer_world', 'direct', 'adjacent', 'analogous'];
/** What a subject shows, so that the thing judged is the thing asked about. */
export const KINDS = ['quote', 'image', 'logo', 'palette'];
export const CONFIDENCE = ['unknown', 'low', 'medium', 'high'];
export const IMPORTANCE = ['low', 'medium', 'high'];
export const LEVELS = ['must', 'preference', 'explore', 'never'];
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

/** The subjects a brief must cover, with the key that holds each. */
export const SECTIONS = [
  ['context', 'Business context'], ['audiences', 'Audiences'], ['positioning', 'Positioning'], ['ambition', 'Ambition'],
  ['values', 'Values'], ['personality', 'Personality'], ['perception', 'Desired perception'],
  ['references', 'References'], ['constraints', 'Constraints and logo contexts'],
];

const CAMP = { a: 'left', b: 'right', m: 'between', x: 'skipped', _: 'unanswered' };
const JUDGE = { l: 'too_left', o: 'fits', r: 'too_right', u: 'unknown', _: 'unanswered' };

export const briefPath = (dir) => join(dir, 'brief.json');
export const readBrief = (dir) => JSON.parse(readFileSync(briefPath(dir), 'utf8'));
export const writeBrief = (dir, brief) => writeFileSync(briefPath(dir), JSON.stringify(brief, null, 2) + '\n');
export const roundPath = (dir, id, ext = 'json') => join(dir, 'rounds', `${id}.${ext}`);

/**
 * Load a round and resolve each specimen against the brief's references: the name comes from the
 * reference card, the image from its main capture or from the material the specimen names.
 * A subject is refused when what it shows cannot be shown.
 */
export function loadRound(dir, id, brief = readBrief(dir)) {
  const round = JSON.parse(readFileSync(roundPath(dir, id), 'utf8'));
  const refs = new Map((brief.references || []).map((r) => [r.id, r]));
  if (round.id !== id) throw new Error(`round file ${id}.json declares id "${round.id}"`);
  if (!Array.isArray(round.subjects) || !round.subjects.length) throw new Error(`round ${id}: no subjects`);
  const seen = new Set();
  for (const s of round.subjects) {
    const at = `round ${id}, subject "${s.id}"`;
    if (!s.id || seen.has(s.id)) throw new Error(`round ${id}: every subject needs its own id`);
    seen.add(s.id);
    if (!KINDS.includes(s.kind)) throw new Error(`${at}: kind "${s.kind}" is not one of ${KINDS.join(', ')}`);
    for (const k of ['name', 'question', 'ask', 'too_left', 'ok', 'too_right']) if (!s[k]) throw new Error(`${at}: "${k}" is missing. The user must always know what they are judging`);
    if (!s.ask.includes('%s')) throw new Error(`${at}: "ask" must contain %s where the brand's name goes`);
    for (const side of ['left', 'right']) for (const k of ['label', 'title', 'desc', 'word']) if (!s[side]?.[k]) throw new Error(`${at}: ${side}.${k} is missing`);
    if (!Array.isArray(s.specimens) || s.specimens.length < 3 || s.specimens.length > 6) throw new Error(`${at}: 3 to 6 specimens, ordered from the left pole to the right one`);
    s.specimens = s.specimens.map((sp) => {
      const r = refs.get(sp.ref);
      if (!r) throw new Error(`${at}: "${sp.ref}" is not in brief.json references`);
      const material = sp.material ? r.materials?.[sp.material] : null;
      if (sp.material && !material) throw new Error(`${at}: reference "${sp.ref}" has no material "${sp.material}"`);
      const out = { ...sp, name: sp.name || r.name, src: sp.src || (material ? material.asset : r.asset) || null };
      if (s.kind === 'quote' && !sp.quote) throw new Error(`${at}: "${sp.ref}" has no quote. A subject about words shows words`);
      if (s.kind === 'quote' && !sp.source_url && !r.url) throw new Error(`${at}: the quote of "${sp.ref}" has no source`);
      if (s.kind === 'palette' && !((sp.colors || r.palette || []).length >= 2)) throw new Error(`${at}: "${sp.ref}" has no measured palette. Run fetch.mjs, or give "colors" read from the source`);
      if (s.kind === 'palette') out.colors = sp.colors || r.palette;
      if ((s.kind === 'image' || s.kind === 'logo') && !out.src) throw new Error(`${at}: "${sp.ref}" has no image. Run fetch.mjs, or take it out`);
      return out;
    });
  }
  round.locale = round.locale || brief.meta?.locale || 'fr';
  return round;
}

/** What the page receives: the subjects and their specimens, nothing about the brief. */
export function pageRound(round) {
  return {
    id: round.id, locale: round.locale,
    subjects: round.subjects.map((s) => ({
      id: s.id, name: s.name, question: s.question, ask: s.ask, kind: s.kind,
      left: s.left, right: s.right, too_left: s.too_left, ok: s.ok, too_right: s.too_right,
      specimens: s.specimens.map(({ name, src, quote, colors, crop, look }) => ({ name, src, quote, colors, crop, look })),
    })),
  };
}

/**
 * Turn the code a board returns into votes.
 * @param {string} code `bb2.<round>.<one token per subject>.<note>`; a token is the camp letter, then one letter per specimen
 */
export function decode(round, code) {
  const m = String(code).trim().match(/bb2\.([^.\s]+)\.([^.\s]*)\.([A-Za-z0-9_-]*)/);
  if (!m) throw new Error('not a board code (expected bb2.<round>.<answers>.<note>)');
  if (m[1] !== round.id) throw new Error(`this code is for round "${m[1]}", not "${round.id}"`);
  const toks = m[2].split(',');
  if (toks.length !== round.subjects.length) throw new Error(`the code holds ${toks.length} subjects and the round has ${round.subjects.length}`);
  const subjects = round.subjects.map((s, i) => {
    const t = toks[i], camp = CAMP[t[0]];
    if (!camp) throw new Error(`subject "${s.id}": "${t[0]}" is not a camp answer`);
    const letters = [...t.slice(1)];
    if (camp !== 'skipped' && letters.length !== s.specimens.length) throw new Error(`subject "${s.id}": ${letters.length} answers for ${s.specimens.length} specimens`);
    const answers = camp === 'skipped' ? [] : s.specimens.map((sp, k) => {
      if (!JUDGE[letters[k]]) throw new Error(`subject "${s.id}": "${letters[k]}" is not an answer`);
      return { ref: sp.ref, name: sp.name, answer: JUDGE[letters[k]] };
    });
    const pick = (a) => answers.filter((x) => x.answer === a).map((x) => x.ref);
    return { id: s.id, name: s.name, kind: s.kind, poles: [s.left.label, s.right.label], camp, answers, fits: pick('fits'), too_left: pick('too_left'), too_right: pick('too_right'), unknown: pick('unknown') };
  });
  return { round: round.id, at: new Date().toISOString(), subjects, note: m[3] ? Buffer.from(m[3], 'base64url').toString('utf8') : '' };
}

/** One line a person can read: where the brand sits on a subject, in the names of the brands judged. */
export function reading(subject, names = (id) => id) {
  const list = (ids) => ids.map(names).join(', ');
  if (subject.camp === 'skipped') return 'does not matter to them';
  const parts = [];
  if (subject.fits.length) parts.push(`fits: ${list(subject.fits)}`);
  if (subject.too_left.length) parts.push(`too ${subject.poles[0].toLowerCase()}: ${list(subject.too_left)}`);
  if (subject.too_right.length) parts.push(`too ${subject.poles[1].toLowerCase()}: ${list(subject.too_right)}`);
  if (subject.unknown.length) parts.push(`not known: ${list(subject.unknown)}`);
  if (!subject.fits.length) parts.unshift(`none of the brands shown fits (leans ${subject.camp})`);
  return parts.join('; ');
}

/**
 * Merge a round's votes into the brief: one interaction per subject, and the subject's dimension.
 * The user confirmed each reading on the board, so the dimension is validated; what it means for a
 * designer (orientation, boundary) is still the agent's to write. Recording a round twice replaces it.
 */
export function record(brief, votes) {
  const name = (id) => (brief.references || []).find((r) => r.id === id)?.name || id;
  brief.interactions = (brief.interactions || []).filter((x) => x.round !== votes.round);
  brief.personality = brief.personality || {};
  const dims = (brief.personality.dimensions = brief.personality.dimensions || []);
  for (const s of votes.subjects) {
    const id = `${votes.round}-${s.id}`;
    brief.interactions.push({ id, round: votes.round, type: 'subject', subject: s.id, question: s.name, camp: s.camp, answers: s.answers.map(({ ref, answer }) => ({ ref, answer })), answer: reading(s, name), at: votes.at });
    let d = dims.find((x) => x.id === s.id);
    if (!d) dims.push((d = { id: s.id, importance: 'medium' }));
    const bounded = s.too_left.length + s.too_right.length > 0;
    Object.assign(d, {
      name: s.name, poles: s.poles, kind: s.kind, camp: s.camp, fits: s.fits, too_left: s.too_left, too_right: s.too_right, unknown: s.unknown,
      confidence: s.camp === 'skipped' ? 'unknown' : s.fits.length && bounded ? 'medium' : 'low',
      validation: s.camp === 'skipped' ? 'skipped' : 'validated',
      evidence: [...(d.evidence || []).filter((e) => e.interaction !== id), { interaction: id, signal: reading(s, name), status: 'explicit' }],
    });
    if (s.camp === 'skipped') d.importance = 'low';
  }
  if (votes.note) brief.verbatim = [...(brief.verbatim || []).filter((v) => v.about !== `round ${votes.round}`), { quote: votes.note, about: `round ${votes.round}` }];
  return brief;
}

/** How many statements of the brief come from each source. Interactions and references are not statements. */
export function provenance(brief) {
  const counts = Object.fromEntries(SOURCES.map((s) => [s, 0]));
  for (const { node } of statements(brief)) if (node.source in counts) counts[node.source]++;
  return counts;
}

/** Every object of the brief that carries a `source`, with a readable path. */
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
