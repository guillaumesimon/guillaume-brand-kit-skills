#!/usr/bin/env node
// The gate. An audit does not go out while this fails.
//   node check.mjs <audit-dir>
// Fails on: schema errors, evidence that does not exist (in audit.json or cited in AUDIT.md),
// a convention left unclassified, a deep-mode opportunity that was not challenged.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateAudit } from './lib/schema.mjs';

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
  if (!audit.frequencies) errors.push('frequencies: missing, run aggregate.mjs');
  const full = (audit.panel || []).filter((b) => b.role === 'direct' && b.capture === 'full');
  const uncoded = full.filter((b) => !b.codes).map((b) => b.id);
  if (uncoded.length) errors.push(`direct brands captured but not coded: ${uncoded.join(', ')}`);
  if (!(audit.limits || []).length) errors.push('limits: say what this audit does not cover');

  const md = join(auditDir, 'AUDIT.md');
  if (!existsSync(md)) errors.push('AUDIT.md: not found');
  else {
    const text = readFileSync(md, 'utf8');
    const cited = [...new Set([...text.matchAll(/`(evidence\/[^`\s]+)`/g)].map((m) => m[1]))];
    for (const p of cited) if (missing(p)) errors.push(`AUDIT.md: evidence not found: ${p}`);
    if (!cited.length) errors.push('AUDIT.md: cites no evidence path');
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
