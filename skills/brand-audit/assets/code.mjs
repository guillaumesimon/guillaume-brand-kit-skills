#!/usr/bin/env node
// Merge what the coders returned into audit.json, refusing anything outside the vocabulary.
//   node code.mjs <audit-dir> <codes.json> [more.json…] [--resolve]
// A codes file is {"<brand id>": {logo_type: …, hue: …, …}}.
// A second coding of the same brand (deep mode) does not overwrite: disagreements are recorded
// in `code_conflicts` for the analyst to settle, with --resolve and a file holding the final values.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateCodes, VOCAB } from './lib/schema.mjs';

const norm = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v);

/** @returns {{merged:string[], errors:string[], conflicts:string[]}} */
export function mergeCodes(panel, codesById, { resolve = false } = {}) {
  const merged = [], errors = [], conflicts = [];
  for (const [id, raw] of Object.entries(codesById)) {
    const brand = panel.find((b) => b.id === id);
    if (!brand) { errors.push(`${id}: not in the panel`); continue; }
    const codes = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, k in VOCAB || k === 'symbol_subject' ? norm(v) : v]));
    if (resolve) {
      const next = { ...brand.codes, ...codes };
      if (next.logo_type && next.logo_type !== 'combination' && !('symbol_nature' in codes)) delete next.symbol_nature;
      if (next.symbol_nature == null) delete next.symbol_nature;
      const errs = validateCodes(next, id);
      if (errs.length) { errors.push(...errs); continue; }
      brand.codes = next;
      for (const k of Object.keys(codes)) delete brand.code_conflicts?.[k];
      if ('logo_type' in codes) delete brand.code_conflicts?.symbol_nature;
      if (brand.code_conflicts && !Object.keys(brand.code_conflicts).length) delete brand.code_conflicts;
      merged.push(id);
      continue;
    }
    const errs = validateCodes(codes, id);
    if (errs.length) { errors.push(...errs); continue; }
    if (!brand.codes) { brand.codes = codes; merged.push(id); continue; }
    for (const [k, v] of Object.entries(codes)) {
      if (k === 'notes' || k === 'symbol_used_alone') continue;
      const first = brand.codes[k];
      // symbol_nature only means something once the two coders agree the mark is a combination.
      if (k === 'symbol_nature' && norm(brand.codes.logo_type) !== norm(codes.logo_type)) continue;
      if (first == null) brand.codes[k] = v;
      else if (norm(first) !== norm(v)) {
        brand.code_conflicts = { ...brand.code_conflicts, [k]: [first, v] };
        conflicts.push(`${id}.${k}: ${first} / ${v}`);
      }
    }
    merged.push(id);
  }
  return { merged, errors, conflicts };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const args = process.argv.slice(2), files = args.filter((a) => !a.startsWith('--')).slice(1), dir = args[0];
  if (!dir || dir.startsWith('--') || !files.length) { console.log('usage: node code.mjs <audit-dir> <codes.json> [more.json…] [--resolve]'); process.exit(args.includes('--help') ? 0 : 1); }
  const file = join(dir, 'audit.json');
  const audit = JSON.parse(readFileSync(file, 'utf8'));
  let bad = 0;
  for (const f of files) {
    const r = mergeCodes(audit.panel, JSON.parse(readFileSync(f, 'utf8')), { resolve: args.includes('--resolve') });
    console.log(`${f}: ${r.merged.length} brand(s) merged`);
    for (const e of r.errors) { console.log('  REFUSED ' + e); bad++; }
    for (const c of r.conflicts) console.log('  conflict ' + c);
  }
  writeFileSync(file, JSON.stringify(audit, null, 2) + '\n');
  const open = audit.panel.filter((b) => b.code_conflicts).map((b) => `${b.id} (${Object.keys(b.code_conflicts).join(', ')})`);
  if (open.length) console.log(`\nopen conflicts, look at the captures and settle with --resolve: ${open.join('; ')}`);
  const uncoded = audit.panel.filter((b) => b.capture === 'full' && !b.codes).map((b) => b.id);
  if (uncoded.length) console.log(`not coded yet: ${uncoded.join(', ')}`);
  process.exit(bad ? 1 : 0);
}
