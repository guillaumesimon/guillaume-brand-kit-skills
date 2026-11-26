#!/usr/bin/env node
// The gate. An audit does not go out while this fails.
//   node check.mjs <audit-dir>
// Fails on: schema errors, evidence that does not exist (in audit.json or cited in AUDIT.md),
// a convention left unclassified, a section or the summary not written, a brand without a profile,
// an opportunity without its observation, alignment, benefit or validation, a deep-mode opportunity not challenged.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateAudit, SECTIONS } from './lib/schema.mjs';
import { renderBrief } from './brief.mjs';

const MAX_EVIDENCE_MB = 15;

function dirSize(dir) {
  if (!existsSync(dir)) return 0;
  let n = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) n += e.isDirectory() ? dirSize(join(dir, e.name)) : statSync(join(dir, e.name)).size;
  return n;
}

/** @returns {{errors:string[], warnings:string[]}} */
export function checkAudit(auditDir) {
  const errors = [], warnings = [];
  const file = join(auditDir, 'audit.json');
  if (!existsSync(file)) return { errors: [`${file}: not found`], warnings };
  let audit;
  try { audit = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { return { errors: [`audit.json: not valid JSON (${e.message})`], warnings }; }
  errors.push(...validateAudit(audit));
  const missing = (p) => !existsSync(join(auditDir, p));
  const cite = (where, paths) => { for (const p of paths || []) if (missing(p)) errors.push(`${where}: evidence not found: ${p}`); };

  (audit.panel || []).forEach((b) => { cite(`panel "${b.id}"`, b.evidence); if (b.logo) cite(`panel "${b.id}" logo`, [b.logo]); });
  (audit.conventions || []).forEach((c) => {
    if (!c.class) errors.push(`convention ${c.dimension}: ${c.value} (${c.count} of ${c.base}) is not classified`);
    cite(`convention ${c.dimension}: ${c.value}`, c.evidence);
  });
  (audit.opportunities || []).forEach((o) => {
    cite(`opportunity "${o.id}"`, o.evidence);
    if (audit.meta?.mode === 'deep' && !o.challenged) errors.push(`opportunity "${o.id}": deep mode requires the counter-check (challenged)`);
  });
  // The written report: six sections, each by its writer, then the summary, written last.
  for (const key of SECTIONS) {
    const sec = audit.sections?.[key];
    if (!sec) { errors.push(`sections.${key}: not written yet`); continue; }
    (sec.findings || []).forEach((f, i) => cite(`sections.${key} finding ${i + 1}`, f.evidence));
  }
  if (!audit.summary) errors.push('summary: not written yet (preserve, avoid, challenge, explore, validate)');
  else {
    for (const d of ['preserve', 'avoid', 'challenge', 'explore']) (audit.summary[d] || []).forEach((it, i) => cite(`summary.${d}[${i}]`, it.evidence));
    if (!(audit.summary.validate || []).length) errors.push('summary.validate: name at least one hypothesis that needs a person to check it');
  }
  const noProfile = (audit.panel || []).filter((b) => b.codes && !b.profile).map((b) => b.id);
  if (noProfile.length) errors.push(`brands coded but without a profile: ${noProfile.join(', ')}`);
  for (const o of audit.opportunities || []) for (const k of ['observation', 'alignment', 'benefit', 'validate'])
    if (!o[k]) errors.push(`opportunity "${o.id}": ${k} is missing`);
  if (!audit.frequencies) errors.push('frequencies: missing, run aggregate.mjs');
  const full = (audit.panel || []).filter((b) => b.role === 'direct' && b.capture === 'full');
  const uncoded = full.filter((b) => !b.codes).map((b) => b.id);
  if (uncoded.length) errors.push(`direct brands captured but not coded: ${uncoded.join(', ')}`);
  const open = (audit.panel || []).filter((b) => b.code_conflicts && Object.keys(b.code_conflicts).length).map((b) => b.id);
  if (open.length) errors.push(`coding conflicts not settled: ${open.join(', ')}`);
  const asp = (audit.panel || []).filter((b) => b.role === 'aspirational');
  if (asp.length) for (const c of ['same_audience', 'same_tension'])
    if (!asp.some((b) => b.criterion === c)) errors.push(`aspirational brands: none chosen on ${c}; keep at least one per criterion`);
  if (!(audit.limits || []).length) errors.push('limits: say what this audit does not cover');

  // The creative synthesis: thesis, decisions, two to four territories, each with a real moodboard.
  const sy = audit.synthesis;
  if (!sy) errors.push('synthesis: not written yet (thesis, decisions, territories)');
  else {
    if (!(sy.decisions || []).length) errors.push('synthesis.decisions: the decision matrix is empty');
    const nt = (sy.territories || []).length;
    if (nt < 2 || nt > 4) errors.push(`synthesis.territories: ${nt} territories; two to four that are genuinely different`);
    for (const t of sy.territories || []) {
      const mood = (t.moodboard || []).filter((m) => !missing(m.file));
      if (mood.length < 6) errors.push(`territory "${t.id}": ${mood.length} moodboard images found; at least 6, run moodboard.mjs`);
      for (const m of t.moodboard || []) if (missing(m.file)) errors.push(`territory "${t.id}": moodboard image not found: ${m.file}`);
    }
    for (const r of sy.references || []) cite('synthesis.references', [r.asset]);
    if (!(sy.evaluation || []).some((c) => c.gate)) errors.push('synthesis.evaluation: name at least one gate that rejects a concept');
    if (!sy.for_brand_kit) errors.push('synthesis.for_brand_kit: swap competitor, duel and Not list are missing');
  }
  for (const key of SECTIONS) if (audit.sections?.[key] && !audit.sections[key].implications) errors.push(`sections.${key}: implications block is missing`);
  const noId = [...Object.values(audit.sections || {}).flatMap((x) => x.findings || []), ...(audit.conventions || [])].filter((x) => !x.id).length;
  if (noId) errors.push(`${noId} finding(s) or convention(s) without an ID: run aggregate.mjs`);

  const md = join(auditDir, 'AUDIT.md');
  if (!existsSync(md)) errors.push('AUDIT.md: not found');
  else {
    const text = readFileSync(md, 'utf8');
    const cited = [...new Set([...text.matchAll(/`(evidence\/[^`\s]+)`/g)].map((m) => m[1]))];
    for (const p of cited) if (missing(p)) errors.push(`AUDIT.md: evidence not found: ${p}`);
    if (!cited.length) errors.push('AUDIT.md: cites no evidence path');
    if (text !== renderBrief(audit)) errors.push('AUDIT.md: differs from what brief.mjs generates from audit.json; run brief.mjs again, do not edit it by hand');
    if (text.split('\n').length > 160) warnings.push(`AUDIT.md is ${text.split('\n').length} lines; agents read it whole, keep it under 120`);
  }
  if (!existsSync(join(auditDir, 'landscape.html'))) errors.push('landscape.html: not found, run render.mjs');
  const mb = dirSize(join(auditDir, 'evidence')) / 1048576;
  if (mb > MAX_EVIDENCE_MB) warnings.push(`evidence/ is ${mb.toFixed(1)} MB, over the ${MAX_EVIDENCE_MB} MB target`);
  return { errors, warnings };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const dir = process.argv[2];
  if (!dir || dir.startsWith('--')) { console.log('usage: node check.mjs <audit-dir>'); process.exit(dir === '--help' ? 0 : 1); }
  const { errors, warnings } = checkAudit(dir);
  for (const w of warnings) console.log('warning: ' + w);
  for (const e of errors) console.log('FAIL: ' + e);
  console.log(errors.length ? `\n${errors.length} problem(s). The audit is not ready.` : 'OK: schema valid, every claim has its evidence.');
  process.exit(errors.length ? 1 : 0);
}
