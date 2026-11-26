// The closed vocabulary of the audit, and the validator for audit.json.
// Every coded value may also be "other:<text>" when the vocabulary does not fit.

const TYPE_CLASSES = ['geometric_sans', 'grotesque', 'humanist_sans', 'serif', 'slab', 'script', 'mono', 'custom'];

export const VOCAB = {
  logo_type: ['wordmark', 'lettermark', 'pictorial', 'abstract', 'combination', 'emblem', 'mascot'],
  symbol_nature: ['lettermark', 'pictorial', 'abstract', 'mascot'],
  name_case: ['lower', 'upper', 'title', 'mixed'],
  name_style: TYPE_CLASSES,
  hue: ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'brown', 'neutral'],
  saturation: ['muted', 'medium', 'vivid'],
  ground: ['light', 'dark', 'coloured'],
  hue_count: ['one', 'two', 'many'],
  headline_class: TYPE_CLASSES,
  text_class: TYPE_CLASSES,
  imagery: ['people_photo', 'product_ui', 'product_photo', 'illustration_flat', 'illustration_3d', 'abstract_graphic', 'video', 'none'],
  layout: ['centered_hero', 'split_hero', 'full_bleed_media', 'dense_grid', 'editorial'],
  headline_promise: ['benefit', 'mechanism', 'manifesto', 'proof', 'community'],
  // Transversal traits of the logo, whatever its type.
  logo_form: ['geometric', 'organic'],
  logo_energy: ['static', 'dynamic'],
  logo_detail: ['minimal', 'detailed'],
};

// Dimensions that enter the statistics. symbol_subject is free text.
export const DIMENSIONS = [...Object.keys(VOCAB).slice(0, 2), 'symbol_subject', ...Object.keys(VOCAB).slice(2)];

export const ROLES = ['direct', 'indirect', 'leader', 'aspirational', 'self'];
// requirement: the product cannot work without it. signal: how the category is recognised.
// cliche: dominant and proven breakable. owned: tied to one competitor. emerging: appearing. risky: unbroken and uninformative.
export const CLASSES = ['requirement', 'signal', 'cliche', 'risky', 'owned', 'emerging'];
export const STATUSES = ['required', 'preferred', 'explore', 'deprioritise', 'avoid'];
export const CONFIDENCE = ['high', 'medium', 'low'];
export const DIRECTIONS = ['personality', 'logo', 'symbolism', 'colour', 'typography', 'photography', 'graphic_system', 'voice'];
/** The written sections of the report, each by its own writer. */
export const SECTIONS = ['logos', 'architecture', 'colour', 'typography', 'symbols', 'visual_language'];
export const DECISIONS = ['preserve', 'avoid', 'challenge', 'explore', 'validate'];
export const PROVENANCE = ['measured', 'observed', 'judged'];
const CAPTURES = ['full', 'partial', 'none'];

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v) => typeof v === 'string' && v.trim() !== '';

export function validateCodes(codes, path, errors = []) {
  if (!isObj(codes)) { errors.push(`${path}: must be an object`); return errors; }
  for (const [dim, allowed] of Object.entries(VOCAB)) {
    const v = codes[dim];
    if (v == null) continue;
    if (typeof v !== 'string' || !(allowed.includes(v) || /^other:.+/.test(v)))
      errors.push(`${path}.${dim}: "${v}" is not one of ${allowed.join(', ')} or other:<text>`);
  }
  if (!codes.logo_type) errors.push(`${path}.logo_type: required`);
  if (codes.logo_type === 'combination' && !codes.symbol_nature)
    errors.push(`${path}.symbol_nature: required when logo_type is combination`);
  if (codes.logo_type && codes.logo_type !== 'combination' && codes.symbol_nature)
    errors.push(`${path}.symbol_nature: only for combination marks`);
  if (codes.symbol_subject != null && !isStr(codes.symbol_subject))
    errors.push(`${path}.symbol_subject: must be a non-empty string or absent`);
  return errors;
}

function needEvidence(item, path, errors) {
  if (!Array.isArray(item.evidence) || item.evidence.length === 0 || !item.evidence.every(isStr))
    errors.push(`${path}.evidence: at least one evidence path is required`);
  if (!PROVENANCE.includes(item.provenance))
    errors.push(`${path}.provenance: must be one of ${PROVENANCE.join(', ')}`);
}

/** Returns a list of problems; an empty list means the audit is valid. */
export function validateAudit(audit) {
  const e = [];
  if (!isObj(audit)) return ['audit: must be an object'];
  const m = audit.meta;
  if (!isObj(m)) e.push('meta: required');
  else {
    if (!['flash', 'deep'].includes(m.mode)) e.push('meta.mode: must be flash or deep');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(m.date || '')) e.push('meta.date: must be YYYY-MM-DD');
    if (!isStr(m.locale)) e.push('meta.locale: required');
    const t = m.thresholds;
    if (!isObj(t) || !(t.convention > 0 && t.convention <= 1) || !(t.rare >= 0 && t.rare < t.convention))
      e.push('meta.thresholds: needs convention in (0,1] and rare below it');
  }
  const f = audit.framing;
  if (!isObj(f)) e.push('framing: required');
  else for (const k of ['product', 'audience', 'market']) if (!isStr(f[k])) e.push(`framing.${k}: required`);

  const ids = new Set();
  if (!Array.isArray(audit.panel) || audit.panel.length === 0) e.push('panel: must be a non-empty array');
  else audit.panel.forEach((b, i) => {
    const p = `panel[${i}]`;
    if (!isObj(b)) { e.push(`${p}: must be an object`); return; }
    if (!isStr(b.id) || !/^[a-z0-9-]+$/.test(b.id)) e.push(`${p}.id: lower-case slug required`);
    else if (ids.has(b.id)) e.push(`${p}.id: duplicate "${b.id}"`); else ids.add(b.id);
    for (const k of ['name', 'url', 'why']) if (!isStr(b[k])) e.push(`${p}.${k}: required`);
    if (!ROLES.includes(b.role)) e.push(`${p}.role: must be one of ${ROLES.join(', ')}`);
    if (['direct', 'leader'].includes(b.role)) {
      const est = b.established;
      if (!isObj(est) || typeof est.value !== 'boolean' || !isStr(est.reason))
        e.push(`${p}.established: {value, reason} required on ${b.role} brand "${b.name || b.id}"`);
    }
    if (b.role === 'aspirational') {
      if (!['same_audience', 'same_tension'].includes(b.criterion)) e.push(`${p}.criterion: same_audience or same_tension required on aspirational brand "${b.name || b.id}"`);
      if (!isStr(b.recognition)) e.push(`${p}.recognition: say who in the audience knows "${b.name || b.id}", and how we know`);
    }
    if (b.capture != null && !CAPTURES.includes(b.capture)) e.push(`${p}.capture: must be one of ${CAPTURES.join(', ')}`);
    if (b.codes != null) validateCodes(b.codes, `${p}.codes`, e);
    if (b.evidence != null && !(Array.isArray(b.evidence) && b.evidence.every(isStr))) e.push(`${p}.evidence: must be an array of paths`);
  });

  (audit.conventions || []).forEach((c, i) => {
    const p = `conventions[${i}]`;
    if (!isStr(c.dimension) || !isStr(c.value)) e.push(`${p}: dimension and value required`);
    if (!(Number.isInteger(c.count) && Number.isInteger(c.base) && c.count <= c.base)) e.push(`${p}: count and base required, count <= base`);
    if (c.class != null) {
      if (!CLASSES.includes(c.class)) e.push(`${p}.class: must be one of ${CLASSES.join(', ')}`);
      if (!isStr(c.reason)) e.push(`${p}.reason: required once classified`);
      needEvidence(c, p, e);
    }
  });

  (audit.opportunities || []).forEach((o, i) => {
    const p = `opportunities[${i}]`;
    for (const k of ['id', 'title', 'rationale']) if (!isStr(o[k])) e.push(`${p}.${k}: required`);
    for (const k of ['keep', 'break']) if (!Array.isArray(o[k])) e.push(`${p}.${k}: must be an array`);
    if (!['low', 'medium', 'high'].includes(o.risk)) e.push(`${p}.risk: must be low, medium or high`);
    for (const imp of o.import || []) if (!ids.has(imp.from)) e.push(`${p}.import: "${imp.from}" is not in the panel`);
    needEvidence(o, p, e);
    if (o.challenged != null && !(Array.isArray(o.challenged.searched) && ['held', 'weakened'].includes(o.challenged.result)))
      e.push(`${p}.challenged: needs searched[] and result held|weakened`);
  });

  if (audit.sections != null) {
    if (!isObj(audit.sections)) e.push('sections: must be an object');
    else for (const [key, sec] of Object.entries(audit.sections)) {
      const p = `sections.${key}`;
      if (!SECTIONS.includes(key)) { e.push(`${p}: unknown section, expected one of ${SECTIONS.join(', ')}`); continue; }
      if (!isObj(sec) || !isStr(sec.lead)) { e.push(`${p}.lead: required`); continue; }
      if (!Array.isArray(sec.paragraphs) || !sec.paragraphs.every(isStr)) e.push(`${p}.paragraphs: must be an array of strings`);
      if (!isStr(sec.takeaway)) e.push(`${p}.takeaway: required`);
      if (sec.implications != null) {
        const im = sec.implications;
        if (!isObj(im) || !isStr(im.implication) || !CONFIDENCE.includes(im.confidence)) e.push(`${p}.implications: implication and confidence (high|medium|low) required`);
      }
      if (!Array.isArray(sec.findings) || sec.findings.length === 0) e.push(`${p}.findings: at least one finding`);
      else sec.findings.forEach((f, i) => { if (!isStr(f.text)) e.push(`${p}.findings[${i}].text: required`); needEvidence(f, `${p}.findings[${i}]`, e); });
    }
  }
  if (audit.summary != null) {
    const sm = audit.summary;
    if (!isObj(sm) || !isStr(sm.lead)) e.push('summary.lead: required');
    else for (const d of DECISIONS) {
      if (!Array.isArray(sm[d])) { e.push(`summary.${d}: must be an array`); continue; }
      sm[d].forEach((it, i) => {
        if (!isObj(it) || !isStr(it.text)) e.push(`summary.${d}[${i}].text: required`);
        else if (d !== 'validate' && !(Array.isArray(it.evidence) && it.evidence.length && it.evidence.every(isStr))) e.push(`summary.${d}[${i}].evidence: at least one evidence path is required`);
      });
    }
  }
  // The creative synthesis: thesis, decisions, territories. Every reference must resolve.
  const sy = audit.synthesis;
  if (sy != null) {
    if (!isObj(sy)) e.push('synthesis: must be an object');
    else {
      for (const k of ['thesis', 'tension', 'uncertainty']) if (!isStr(sy[k])) e.push(`synthesis.${k}: required`);
      const fids = new Set(Object.values(audit.sections || {}).flatMap((s) => (s.findings || []).map((f) => f.id)).concat((audit.conventions || []).map((c) => c.id)).filter(Boolean));
      const oids = new Set((audit.opportunities || []).map((o) => o.id));
      const refs = (list, p) => { if (!Array.isArray(list) || !list.length) e.push(`${p}: cite at least one finding`); else for (const r of list) if (!fids.has(r)) e.push(`${p}: "${r}" is not a finding or convention of this audit`); };
      (sy.decisions || []).forEach((d, i) => {
        const p = `synthesis.decisions[${i}]`;
        for (const k of ['id', 'dimension', 'recommendation', 'rationale', 'tradeoff']) if (!isStr(d[k])) e.push(`${p}.${k}: required`);
        if (!STATUSES.includes(d.status)) e.push(`${p}.status: must be one of ${STATUSES.join(', ')}`);
        if (!CONFIDENCE.includes(d.confidence)) e.push(`${p}.confidence: high, medium or low`);
        refs(d.finding_refs, `${p}.finding_refs`);
      });
      (sy.territories || []).forEach((t, i) => {
        const p = `synthesis.territories[${i}]`;
        for (const k of ['id', 'title', 'idea', 'description', 'perception', 'risk', 'validate']) if (!isStr(t[k])) e.push(`${p}.${k}: required`);
        if (!CONFIDENCE.includes(t.confidence)) e.push(`${p}.confidence: high, medium or low`);
        if (!isObj(t.directions) || !DIRECTIONS.every((k) => isStr(t.directions[k]))) e.push(`${p}.directions: needs ${DIRECTIONS.join(', ')}`);
        refs(t.finding_refs, `${p}.finding_refs`);
        for (const o of t.opportunity_refs || []) if (!oids.has(o)) e.push(`${p}.opportunity_refs: "${o}" is not an opportunity`);
        if (!Array.isArray(t.open_decisions) || !t.open_decisions.length) e.push(`${p}.open_decisions: say what is left to the designer`);
        (t.moodboard || []).forEach((m, j) => { if (!isStr(m.file) || !isStr(m.source) || !isStr(m.note)) e.push(`${p}.moodboard[${j}]: file, source and note required`); });
      });
      if (sy.for_brand_kit != null) {
        const bk = sy.for_brand_kit;
        if (!isObj(bk) || !isStr(bk.swap_competitor) || !isStr(bk.swap_evidence) || !(Array.isArray(bk.duel) && bk.duel.length === 2 && bk.duel.every(isStr)) || !(Array.isArray(bk.not_list) && bk.not_list.every(isStr)))
          e.push('synthesis.for_brand_kit: needs swap_competitor, swap_evidence, duel [typical, deviant] and not_list');
      }
      (sy.references || []).forEach((r, i) => { for (const k of ['asset', 'mechanism', 'reinterpret', 'do_not_copy']) if (!isStr(r[k])) e.push(`synthesis.references[${i}].${k}: required`); });
      (sy.evaluation || []).forEach((c, i) => { if (!isStr(c.criterion) || !isStr(c.test) || typeof c.gate !== 'boolean') e.push(`synthesis.evaluation[${i}]: criterion, test and gate (true|false) required`); });
    }
  }
  (audit.panel || []).forEach((b, i) => {
    if (b && b.profile != null && !(isObj(b.profile) && ['personality', 'strength', 'lesson'].every((k) => isStr(b.profile[k]))))
      e.push(`panel[${i}].profile: needs personality, strength and lesson`);
  });
  if (audit.limits != null && !(Array.isArray(audit.limits) && audit.limits.every(isStr))) e.push('limits: must be an array of strings');
  return e;
}
