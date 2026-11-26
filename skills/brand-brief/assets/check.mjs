#!/usr/bin/env node
// The gate. A brief that fails it does not go out.
//   node check.mjs <brief-dir>
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readBrief, statements, SOURCES, CIRCLES, KINDS, CONFIDENCE, IMPORTANCE, LEVELS, STATUS, GENERIC, SECTIONS } from './lib/schema.mjs';
import { renderBrief } from './brief.mjs';

const generic = (text) => GENERIC.filter((w) => new RegExp(`(^|[^\\p{L}])${w}([^\\p{L}]|$)`, 'iu').test(text || ''));

const PRESENT = {
  context: (b) => !!b.context?.product?.value,
  audiences: (b) => (b.audiences || []).length > 0,
  positioning: (b) => !!b.positioning?.frame_wanted?.value || (b.positioning?.territories || []).some((t) => t.status === 'chosen'),
  ambition: (b) => !!b.ambition?.horizon?.value,
  values: (b) => (b.values || []).length > 0,
  personality: (b) => (b.personality?.traits || []).length + (b.personality?.dimensions || []).length > 0,
  perception: (b) => !!b.perception?.feel?.value,
  references: (b) => (b.references || []).length > 0,
  constraints: (b) => (b.logo_contexts || []).length > 0,
};

/**
 * @param {object} b the brief
 * @param {{dir?: string}} [o] with a directory, the generated files are checked too
 * @returns {{errors: string[], warnings: string[]}}
 */
export function check(b, { dir } = {}) {
  const errors = [], warnings = [], err = (m) => errors.push(m);
  const m = b.meta || {};
  if (!m.brand) err('meta.brand is missing');
  if (!STATUS.includes(m.status)) err(`meta.status must be one of ${STATUS.join(', ')}`);
  if (m.status === 'draft') err('the brief is still a draft: read the synthesis back to the founder, then set meta.status to "validated", or to "provisional" if they stopped early');
  if (m.status === 'provisional') warnings.push('provisional: the founder has not validated the synthesis. The outputs say so.');
  if (!b.summary?.lead) err('summary.lead is missing: one sentence on what this brand must say, to whom');

  for (const [key, label] of SECTIONS) {
    const why = b.declared_empty?.[key];
    if (!PRESENT[key](b) && !why) err(`section "${label}" is empty. Fill it, or say why it is empty in declared_empty.${key}`);
    if (why) warnings.push(`"${label}" is declared empty: ${why}`);
  }

  const primary = (b.audiences || []).filter((a) => a.primary);
  if ((b.audiences || []).length && primary.length !== 1) err(`exactly one audience must be primary (found ${primary.length}). Ask which one, if lost tomorrow, would end the company`);

  for (const v of b.values || []) if (!v.instance) err(`value "${v.value}" has no instance: the time it cost something. Without one it is a preference; drop it`);
  for (const t of b.personality?.traits || []) if (!(t.more_than && t.never && t.sounds_like)) err(`trait "${t.trait}" is an adjective. Give it "more_than", "never" and "sounds_like"`);

  const refused = (b.personality?.dimensions || []).some((d) => (d.too_left || []).length + (d.too_right || []).length > 0) || (b.preferences?.signals || []).some((s) => s.level === 'never') || (b.positioning?.territories || []).some((t) => t.status === 'rejected');
  if (!refused) err('nothing was refused. A session where the founder only said yes is politeness, not a brief: get one real refusal');

  // Wallpaper words are only allowed beside the instance that proves them.
  const wall = [['summary.lead', b.summary?.lead], ...(b.summary?.essence || []).map((s, i) => [`summary.essence[${i}]`, s]), ['positioning.promise', b.positioning?.promise?.value],
    ['perception.think', b.perception?.think?.value], ['perception.feel', b.perception?.feel?.value], ...(b.principles || []).map((p, i) => [`principles[${i}]`, p.principle])];
  for (const [path, text] of wall) { const g = generic(text); if (g.length) err(`${path} uses "${g.join('", "')}", true of every competitor. Say the specific thing`); }

  const ids = new Set((b.interactions || []).map((x) => x.id));
  const isId = (e) => !/[./\s]/.test(e);
  const st = statements(b);
  for (const { path, node } of st) {
    if (!SOURCES.includes(node.source)) err(`${path}: source "${node.source}" is not one of ${SOURCES.join(', ')}`);
    for (const e of node.evidence || []) if (isId(e) && !ids.has(e)) err(`${path}: cites "${e}", which is not an interaction`);
    if ((node.source === 'stated' || node.source === 'chosen') && !(node.evidence || []).length) err(`${path}: "${node.source}" needs the interaction it comes from in "evidence"`);
  }
  const assumed = st.filter((x) => x.node.source === 'assumed').length;
  if (assumed > (b.open_questions || []).length) err(`${assumed} statement${assumed > 1 ? 's are' : ' is'} assumed and only ${(b.open_questions || []).length} open question${(b.open_questions || []).length === 1 ? '' : 's'} listed: every assumption is a question to someone`);

  const refIds = new Set();
  for (const r of b.references || []) {
    if (refIds.has(r.id)) err(`reference id "${r.id}" appears twice`); refIds.add(r.id);
    if (!CIRCLES.includes(r.circle)) err(`reference ${r.id}: circle "${r.circle}" is not one of ${CIRCLES.join(', ')}`);
    if (!r.url) err(`reference ${r.id}: no source url. A reference nobody can open is an invention`);
    if (!r.why) err(`reference ${r.id}: no "why". Say what makes it relevant to this project`);
    if (dir && r.asset && !existsSync(join(dir, r.asset))) err(`reference ${r.id}: ${r.asset} is not on disk`);
  }
  for (const x of b.interactions || []) for (const a of x.answers || []) if (!refIds.has(a.ref)) err(`interaction ${x.id} shows "${a.ref}", which is not a reference`);

  for (const d of b.personality?.dimensions || []) {
    if (!CONFIDENCE.includes(d.confidence)) err(`dimension ${d.id}: confidence must be one of ${CONFIDENCE.join(', ')}`);
    if (d.importance && !IMPORTANCE.includes(d.importance)) err(`dimension ${d.id}: importance must be one of ${IMPORTANCE.join(', ')}`);
    if (d.kind && !KINDS.includes(d.kind)) err(`dimension ${d.id}: kind must be one of ${KINDS.join(', ')}`);
    for (const side of ['fits', 'too_left', 'too_right']) for (const ref of d[side] || []) if (!refIds.has(ref)) err(`dimension ${d.id}: "${ref}" is not a reference`);
    if (d.camp !== 'skipped' && d.validation === 'validated' && !d.orientation) err(`dimension ${d.id}: the board gave the markers; write "orientation", what it means for a designer in plain words`);
    for (const e of d.evidence || []) if (!ids.has(e.interaction)) err(`dimension ${d.id}: cites "${e.interaction}", which is not an interaction`);
    if (d.confidence === 'high' && (d.evidence || []).length < 2) err(`dimension ${d.id}: confidence "high" on ${(d.evidence || []).length} piece of evidence. A subject judged once is "medium" at most; it takes a second, different signal`);
    if (d.importance === 'high' && ['unknown', 'low'].includes(d.confidence) && !(b.open_questions || []).length) err(`dimension ${d.id} matters and is not understood, and no open question says so`);
  }
  for (const s of b.preferences?.signals || []) {
    if (!LEVELS.includes(s.level)) err(`signal "${s.statement}": level must be one of ${LEVELS.join(', ')}`);
    for (const e of s.evidence || []) if (isId(e) && !ids.has(e)) err(`signal "${s.statement}": cites "${e}", which is not an interaction`);
  }
  for (const c of b.logo_contexts || []) if (!c.source) err(`logo context "${c.context}": say where it comes from (inferred from the product, stated, or assumed). It is derived, never asked`);
  if (!(b.evaluation || []).some((e) => e.type === 'gate')) err('no evaluation gate: give at least one criterion a concept must pass');
  if (!(b.limits || []).length) err('limits is empty: say what this brief does not cover');

  if (dir) {
    const md = join(dir, 'BRIEF.md');
    if (!existsSync(md)) err('BRIEF.md is missing: run brief.mjs');
    else if (readFileSync(md, 'utf8') !== renderBrief(b)) err('BRIEF.md differs from what brief.json generates: run brief.mjs again, never edit it by hand');
    if (!existsSync(join(dir, 'brief.html'))) err('brief.html is missing: run render.mjs');
  }
  return { errors, warnings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2];
  if (!dir) { console.log('usage: node check.mjs <brief-dir>'); process.exit(1); }
  const { errors, warnings } = check(readBrief(dir), { dir });
  for (const w of warnings) console.log(`note   ${w}`);
  for (const e of errors) console.log(`FAIL   ${e}`);
  console.log(errors.length ? `\n${errors.length} problem${errors.length > 1 ? 's' : ''}. The brief does not go out.` : '\nThe brief passes the gate.');
  process.exit(errors.length ? 1 : 0);
}
