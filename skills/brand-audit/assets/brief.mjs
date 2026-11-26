#!/usr/bin/env node
// audit.json -> AUDIT.md, the creative brief the next agent reads instead of the report.
//   node brief.mjs <audit-dir>
// Generated, never hand-written: its counts and recommendations cannot drift from the data.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const STATUS = { required: 'Required', preferred: 'Preferred', explore: 'Explore', deprioritise: 'Deprioritise', avoid: 'Avoid' };
const CLASS = { requirement: 'Functional requirements', signal: 'Category signals', cliche: 'Clichés (dominant, proven breakable)', owned: 'Owned by a competitor', risky: 'Unbroken and uninformative', emerging: 'Emerging' };
const ev = (paths) => (paths || []).slice(0, 2).map((p) => `\`${p}\``).join(' ');
const refs = (ids) => (ids || []).join(', ');

/** @returns {string} the brief, in English whatever the report language */
export function renderBrief(audit) {
  const f = audit.framing || {}, sy = audit.synthesis || {}, fr = audit.frequencies || {}, L = [];
  const direct = (audit.panel || []).filter((b) => b.role === 'direct');
  const counted = direct.filter((b) => b.capture === 'full' && b.codes).length;
  const out = direct.filter((b) => !(b.capture === 'full' && b.codes)).map((b) => b.name);
  L.push('---', `audit: ${f.title || f.product || ''}`, `market: ${f.market || ''}`, `mode: ${audit.meta?.mode || ''}`, `date: ${audit.meta?.date || ''}`,
    `base: ${counted} direct brands counted of ${direct.length} observed${out.length ? ` (not counted: ${out.join(', ')})` : ''}; ${(audit.panel || []).length} brands in all`,
    'data: ./audit.json', 'report: ./landscape.html   # for people; do not read', 'generated: by brief.mjs from audit.json; do not edit by hand', '---', '',
    '# Creative brief from the visual landscape audit', '',
    'You are designing a brand that enters this category. This file is enough to start; `audit.json` holds the evidence behind every ID.',
    'Respect what is marked Required. Treat everything else as defeasible: explore alternatives, and say why when you depart from this brief for a stronger idea. This is not an identity specification.',
    `Counts are \`n of base\`. Bases differ by dimension and are given each time. ${audit.meta?.mode === 'flash' ? 'Flash mode: every classification is a hypothesis.' : ''}`, '');
  L.push('## 0. Brief', '', `${f.product || ''}. For: ${f.audience || ''}. Market: ${f.market || ''}.`, f.instead_of ? `Used today instead: ${f.instead_of}.` : '', '');
  if (sy.thesis) L.push('## 1. Thesis', '', sy.thesis, '', `**Central tension.** ${sy.tension}`, '', `**Most consequential uncertainty.** ${sy.uncertainty}`, '');
  if ((sy.decisions || []).length) {
    L.push('## 2. Decisions', '');
    for (const st of Object.keys(STATUS)) {
      const ds = sy.decisions.filter((d) => d.status === st); if (!ds.length) continue;
      L.push(`### ${STATUS[st]}`, '');
      for (const d of ds) L.push(`- **${d.id} · ${d.dimension}.** ${d.recommendation} ${d.rationale} Trade-off: ${d.tradeoff} Confidence: ${d.confidence}. Rests on ${refs(d.finding_refs)}.`);
      L.push('');
    }
  }
  const convs = audit.conventions || [];
  if (convs.length) {
    L.push('## 3. What the category does', '');
    for (const k of Object.keys(CLASS)) {
      const cs = convs.filter((c) => c.class === k); if (!cs.length) continue;
      L.push(`### ${CLASS[k]}`, '');
      for (const c of cs) L.push(`- **${c.id}** ${c.dimension}: ${c.value}, ${c.count} of ${c.base}${c.population ? ` (${c.population})` : ''}. ${c.reason || ''} ${ev(c.evidence)}`);
      L.push('');
    }
  }
  if ((sy.territories || []).length) {
    L.push('## 4. Creative territories', '', 'Alternative answers to the same brief. Hypotheses to explore, not directions to execute.', '');
    sy.territories.forEach((t, i) => {
      L.push(`### ${i + 1}. ${t.title} (${t.id})`, '', `*${t.idea}* ${t.description}`, '', `Intended perception: ${t.perception}`, '');
      for (const [k, v] of Object.entries(t.directions || {})) L.push(`- ${k.replace('_', ' ')}: ${v}`);
      L.push('', `Keeps: ${(t.preserves || []).join('; ')}. Challenges: ${(t.challenges || []).join('; ')}.`,
        `Risk: ${t.risk} Confidence: ${t.confidence}. To validate: ${t.validate}`, `Left open: ${(t.open_decisions || []).join('; ')}.`, `Rests on ${refs(t.finding_refs)}.`);
      const mood = (t.moodboard || []).slice(0, 10);
      if (mood.length) { L.push('', 'Moodboard, one mechanism per image:'); for (const m of mood) L.push(`- \`${m.file}\` ${m.note}`); }
      L.push('');
    });
  }
  if ((sy.references || []).length) {
    L.push('## 5. References: borrow the mechanism, not the look', '');
    for (const r of sy.references) L.push(`- \`${r.asset}\` Mechanism: ${r.mechanism} Reinterpret: ${r.reinterpret} Do not copy: ${r.do_not_copy}`);
    L.push('');
  }
  if ((sy.evaluation || []).length) {
    L.push('## 6. Judging a concept', '', 'A gate rejects a concept. A preference weighs on it.', '');
    for (const c of sy.evaluation) L.push(`- **${c.criterion}** (${c.gate ? 'gate' : 'preference'}): ${c.test}`);
    L.push('');
  }
  const val = audit.summary?.validate || [];
  if (val.length) { L.push('## 7. To validate with people', '', 'The audit reads captures. It does not measure perception, demand or legal availability.', ''); for (const v of val) L.push(`- ${v.text}`); L.push(''); }
  const bk = sy.for_brand_kit;
  if (bk && Array.isArray(bk.duel)) L.push('## 8. For brand-kit', '', `- **Swap test competitor:** ${bk.swap_competitor || ''} \`${bk.swap_evidence || ''}\``, `- **Category duel:** most typical \`${bk.duel[0] || ''}\` against most deviant \`${bk.duel[1] || ''}\`.`, `- **Seed for the Not list:** ${(bk.not_list || []).join(', ')}.`, '');
  L.push('## 9. Limits', '', ...(audit.limits || []).map((l) => `- ${l}`), '');
  if (fr.base != null) L.push(`Statistics base: ${fr.base} direct brands captured in full and coded.`, '');
  return L.filter((x) => x !== undefined).join('\n').replace(/\n{3,}/g, '\n\n');
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const dir = process.argv[2];
  if (!dir || dir.startsWith('--')) { console.log('usage: node brief.mjs <audit-dir>'); process.exit(dir === '--help' ? 0 : 1); }
  const md = renderBrief(JSON.parse(readFileSync(join(dir, 'audit.json'), 'utf8')));
  writeFileSync(join(dir, 'AUDIT.md'), md);
  console.log(`AUDIT.md written (${md.split('\n').length} lines)`);
}
