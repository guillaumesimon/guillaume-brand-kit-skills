#!/usr/bin/env node
// brief.json -> BRIEF.md, what the next agent reads instead of the report.
//   node brief.mjs <brief-dir>
// Generated, never hand-written: it cannot drift from the answers it rests on.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readBrief, provenance } from './lib/schema.mjs';

const LEVEL = { must: 'Must', preference: 'Preference', explore: 'To explore', never: 'Never' };
const CIRCLE = { buyer_world: 'the buyers\' own world', direct: 'direct alternatives', adjacent: 'adjacent tools and services', analogous: 'the same problem solved elsewhere' };
const tag = (f) => (f?.source ? ` _(${f.source}${f.evidence?.length ? `: ${f.evidence.join(', ')}` : ''})_` : '');
const field = (label, f) => (f?.value ? [`- **${label}.** ${f.value}${tag(f)}${f.quote ? ` "${f.quote}"` : ''}`] : []);
const list = (xs) => (xs || []).join('; ');

/** @returns {string} the brief, in English whatever the session language; quotes stay as spoken */
export function renderBrief(b) {
  const m = b.meta || {}, c = b.context || {}, p = b.positioning || {}, a = b.ambition || {}, pe = b.perception || {}, per = b.personality || {};
  const refs = b.references || [], pref = b.preferences || {}, h = b.handoff || {}, L = [];
  const n = provenance(b);
  L.push('---', `brief: ${m.brand || ''}`, `date: ${m.date || ''}`, `status: ${m.status || 'draft'}`,
    `provenance: ${['documented', 'stated', 'chosen', 'inferred', 'assumed'].map((s) => `${n[s] || 0} ${s}`).join(', ')}`,
    'data: ./brief.json', 'report: ./brief.html   # for people; do not read', 'generated: by brief.mjs from brief.json; do not edit by hand', '---', '',
    `# Brand brief: ${m.brand || ''}`, '',
    'You are working on this brand. This file states what it must say, to whom, and what it must never become. It is enough to start; `brief.json` holds every answer and every vote behind an ID.',
    'It records intentions and taste, not design decisions: no colour, typeface or logo is fixed here. Respect what is marked Must and Never. Treat a Preference as defeasible and say why when you depart from it.',
    'Every line says where it comes from: `documented` (read in the project), `stated` (the founder said it), `chosen` (picked on a board), `inferred` (derived, theirs to confirm), `assumed` (filled in, unverified).',
    m.status === 'validated' ? '' : `**Status: ${m.status || 'draft'}.** The founder has not validated this synthesis.`, '');

  if (b.summary?.lead) L.push('## 0. In short', '', b.summary.lead, '', ...(b.summary.essence || []).map((s) => `- ${s}`), '');

  L.push('## 1. Business context', '', ...field('Product', c.product), ...field('Reason to exist', c.reason), ...field('Problem with what exists', c.problem),
    ...field('Used today instead', c.instead_of), ...field('Difference', c.difference), ...field('Reason to believe', c.proof), '');

  L.push('## 2. Audiences', '');
  for (const x of b.audiences || []) L.push(`- **${x.name}${x.primary ? ' (primary)' : ''}.** ${x.who || ''} Needs: ${x.need || ''} Should feel: ${x.feeling || ''}${tag(x)}${x.quote ? ` "${x.quote}"` : ''}`);
  L.push('');

  L.push('## 3. Positioning', '', ...field('Compared today with', p.frame_inherited), ...field('Wants to be compared with', p.frame_wanted), ...field('Promise', p.promise), '');
  const ts = p.territories || [];
  const chosen = ts.find((t) => t.status === 'chosen');
  if (chosen) L.push(`**Territory chosen: ${chosen.name}.** ${chosen.description}`);
  for (const t of ts.filter((x) => x.status === 'kept_from')) L.push(`- Kept from "${t.name}": ${t.keep}`);
  for (const t of ts.filter((x) => x.status === 'rejected')) L.push(`- Rejected: "${t.name}" (${t.description}) ${t.reason || ''}`);
  for (const t of ts.filter((x) => x.status === 'open')) L.push(`- Not ruled on: "${t.name}"`);
  L.push('');

  L.push('## 4. Ambition', '', ...field('Horizon', a.horizon), ...field('Scale', a.scale), ...field('The brand must be able to carry', a.must_carry), '');

  L.push('## 5. Values', '', 'Each value is given with the time it cost something. A value with no instance is not listed.', '');
  for (const v of b.values || []) L.push(`- **${v.value}** ${v.instance || ''}${tag(v)}${v.quote ? ` "${v.quote}"` : ''}`);
  L.push('');

  L.push('## 6. Desired perception', '', ...field('People should think', pe.think), ...field('People should feel', pe.feel), ...field('People must never feel', pe.never_feel), '');

  L.push('## 7. Personality', '');
  for (const t of per.traits || []) L.push(`- **${t.trait}.** ${t.more_than}; ${t.never}. Sounds like: "${t.sounds_like}"${tag(t)}`);
  const nm = (id) => refs.find((r) => r.id === id)?.name || id;
  const dims = (per.dimensions || []).filter((d) => d.camp !== 'skipped');
  if (dims.length) {
    L.push('', 'Each subject below was judged on real material from brands of this product\'s world, one subject at a time, and the founder confirmed each reading. A brand named here is a marker on a scale, never a model to copy.', '');
    for (const d of dims) {
      const [l, r] = d.poles || ['', ''];
      L.push(`### ${d.name || d.id} (${l} / ${r})`, '', ...[
        d.orientation ? `- **Orientation.** ${d.orientation}` : '', d.boundary ? `- **Boundary.** ${d.boundary}` : '',
        (d.fits || []).length ? `- Fits: ${d.fits.map(nm).join(', ')}` : '- None of the brands shown fits.',
        (d.too_left || []).length ? `- Too ${l.toLowerCase()}: ${d.too_left.map(nm).join(', ')}` : '', (d.too_right || []).length ? `- Too ${r.toLowerCase()}: ${d.too_right.map(nm).join(', ')}` : '',
        d.contradictions ? `- Unresolved: ${d.contradictions}` : '',
        `- Importance ${d.importance || 'medium'}, confidence ${d.confidence || 'unknown'}${d.kind ? `; judged on ${{ quote: 'their words', image: 'their visuals', logo: 'their logos', palette: 'their measured colours' }[d.kind]}` : ''} _(${(d.evidence || []).map((e) => e.interaction).join(', ')})_`].filter(Boolean), '');
    }
    L.push('Confidence is a judgement on the evidence in `brief.json`, not a measurement. Design against `high` and `medium`; hold `low` and `unknown` as open.');
  }
  const skipped = (per.dimensions || []).filter((d) => d.camp === 'skipped');
  if (skipped.length) L.push('', `Does not matter to the founder: ${skipped.map((d) => d.name || d.id).join(', ')}. Yours to decide.`);
  L.push('');

  if ((b.tensions || []).length) {
    L.push('## 8. Creative tensions', '');
    for (const t of b.tensions) L.push(`- **${t.direction}** (${t.tension}). The limit is crossed when: ${t.crossed_when || 'not stated'}`);
    L.push('');
  }

  L.push('## 9. Creative preferences', '', 'Signals from what the founder chose and refused. They are taste, not rules, except Must and Never.', '');
  for (const lv of Object.keys(LEVEL)) {
    const xs = (pref.signals || []).filter((s) => s.level === lv);
    if (xs.length) L.push(`### ${LEVEL[lv]}`, '', ...xs.map((s) => `- ${s.statement}${tag(s)}`), '');
  }
  for (const x of pref.founder_vs_audience || []) L.push(`**Founder's taste against the audience's need.** ${x.wish} Risk: ${x.risk} Arbitration: ${x.arbitration}`, '');

  L.push('## 10. References', '', 'The brands the subjects were judged against, chosen from this product\'s world. Section 7 says where the brand sits relative to each.', '');
  for (const c of Object.keys(CIRCLE)) {
    const xs = refs.filter((r) => r.circle === c); if (!xs.length) continue;
    L.push(`- **${CIRCLE[c][0].toUpperCase()}${CIRCLE[c].slice(1)}:** ${xs.map((r) => `${r.name}${r.founder_cited ? ' (cited by the founder)' : ''}${r.capture && r.capture.status !== 'ok' ? ` (not shown, ${r.capture.status})` : ''}`).join(', ')}`);
  }
  L.push('');

  if ((b.principles || []).length) L.push('## 11. Creative principles', '', ...b.principles.map((x, i) => `${i + 1}. **${x.principle}** ${x.because}${x.evidence?.length ? ` _(${x.evidence.join(', ')})_` : ''}`), '');

  L.push('## 12. Constraints and logo contexts', '');
  for (const x of b.constraints?.items || []) L.push(`- ${x.constraint} _(${x.kind}, ${x.source})_`);
  if (b.constraints?.timeline) L.push(`- Timeline: ${b.constraints.timeline}`);
  if ((b.logo_contexts || []).length) {
    L.push('', 'Where the logo will have to live. Derived from the product, not asked: check anything marked inferred or assumed.', '', '| Context | Priority | Source | Note |', '|---|---|---|---|');
    for (const x of b.logo_contexts) L.push(`| ${x.context} | ${x.priority || ''} | ${x.source || ''} | ${x.note || ''} |`);
  }
  L.push('');

  if ((b.evaluation || []).length) {
    L.push('## 13. How to judge a concept', '');
    for (const x of b.evaluation.filter((e) => e.type === 'gate')) L.push(`- Gate: ${x.criterion}`);
    for (const x of b.evaluation.filter((e) => e.type !== 'gate')) L.push(`- Preference: ${x.criterion}`);
    L.push('');
  }

  if ((b.open_questions || []).length) L.push('## 14. Open questions', '', ...b.open_questions.map((q) => `- **${q.question}** ${q.why || ''} _(for: ${q.for || 'founder'})_`), '');
  if ((b.limits || []).length) L.push('## 15. What this brief is not', '', ...b.limits.map((x) => `- ${x}`), '');

  if (h.audit) L.push('## For brand-audit', '', `- Competitors the founder named: ${list(h.audit.competitors) || 'none'}`, `- Brands the founder admires, candidates for the aspirational role: ${list(h.audit.aspirational) || 'none'}`,
    ...(h.audit.hypotheses || []).map((x) => `- Hypothesis to check on captures: ${x}`), '', 'These are the founder\'s account. The audit validates them like any other brand in its panel.', '');
  if (h.kit) L.push('## For brand-kit', '', `- Settled by looking, do not ask again: ${list(h.kit.settled) || 'nothing'}`, `- Still open, worth a duel: ${list(h.kit.open) || 'nothing'}`,
    `- Seed of the "Not" list: ${list(h.kit.refusals) || 'nothing'}`, h.kit.swap_candidate ? `- Swap test against: ${h.kit.swap_candidate}` : '', '');

  return L.filter((x, i, arr) => !(x === '' && arr[i - 1] === '')).join('\n').trimEnd() + '\n';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2];
  if (!dir) { console.log('usage: node brief.mjs <brief-dir>'); process.exit(1); }
  writeFileSync(join(dir, 'BRIEF.md'), renderBrief(readBrief(dir)));
  console.log(`BRIEF.md written in ${dir}`);
}
