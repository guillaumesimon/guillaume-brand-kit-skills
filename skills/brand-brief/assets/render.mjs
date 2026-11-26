#!/usr/bin/env node
// brief.json -> brief.html, the brief a founder reads, corrects and passes on.
//   node render.mjs <brief-dir> [--inline]     --inline also writes brief.single.html, one file to send
// Black and white: the only colour on the page is in the references.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readBrief, provenance } from './lib/schema.mjs';

const T = {
  fr: { title: 'Brief de marque', status: { draft: 'Brouillon', provisional: 'Provisoire, non validé', validated: 'Validé' },
    src: { documented: 'lu dans le projet', stated: 'dit', chosen: 'choisi', inferred: 'déduit', assumed: 'supposé' },
    prov: 'D’où vient ce brief', s: ['En bref', 'Le contexte', 'Les audiences', 'Le positionnement', 'L’ambition', 'Les valeurs', 'La perception voulue', 'La personnalité', 'Les tensions', 'Les références', 'Les préférences créatives', 'Les principes', 'Contraintes et usages du logo', 'Juger un concept', 'Ce qui reste ouvert', 'Ce que ce brief n’est pas'],
    product: 'Produit', reason: 'Raison d’être', problem: 'Ce qui ne va pas aujourd’hui', instead: 'Utilisé à la place', difference: 'Différence', proof: 'Preuve',
    primary: 'audience principale', need: 'Besoin', feeling: 'Doit ressentir', frameIn: 'Comparé aujourd’hui à', frameOut: 'Veut être comparé à', promise: 'Promesse',
    chosen: 'Retenu', kept: 'On en garde', rejected: 'Écarté', open: 'Non tranché', horizon: 'Horizon', scale: 'Échelle', carry: 'La marque doit pouvoir porter',
    think: 'On doit penser', feel: 'On doit ressentir', never: 'Jamais', sounds: 'Ça donne', dim: 'Dimension', orient: 'Orientation', conf: 'Confiance', bound: 'Limite',
    c: { unknown: 'inconnue', low: 'faible', medium: 'moyenne', high: 'forte' }, validated: 'validé', crossed: 'La limite est franchie quand',
    walls: { for_us: 'Ça leur parle', liked_not_for_us: 'Aimé, mais pas pour cette marque', never: 'Jamais' }, keeps: 'Garde', rejects: 'Rejette', cited: 'cité par le fondateur',
    circle: { direct: 'concurrent direct', adjacent: 'catégorie voisine', analogous: 'industrie analogue', aspirational: 'aspirationnelle' }, noverdict: 'Sans avis', notshown: 'non montrée',
    level: { must: 'Indispensable', preference: 'Préférence', explore: 'Piste', never: 'Interdit' }, wish: 'Goût du fondateur', risk: 'Risque pour l’audience', arb: 'Arbitrage',
    where: 'Où le logo doit vivre', prio: 'Priorité', p: { critical: 'critique', expected: 'attendu', later: 'plus tard' }, timeline: 'Calendrier', gate: 'Obligatoire', pref: 'Préférence', forWho: { founder: 'pour le fondateur', audit: 'pour l’audit', kit: 'pour le kit' },
    unsolved: 'Non résolu' },
  en: { title: 'Brand brief', status: { draft: 'Draft', provisional: 'Provisional, not validated', validated: 'Validated' },
    src: { documented: 'read in the project', stated: 'stated', chosen: 'chosen', inferred: 'inferred', assumed: 'assumed' },
    prov: 'Where this brief comes from', s: ['In short', 'Context', 'Audiences', 'Positioning', 'Ambition', 'Values', 'Desired perception', 'Personality', 'Tensions', 'References', 'Creative preferences', 'Principles', 'Constraints and logo contexts', 'Judging a concept', 'Still open', 'What this brief is not'],
    product: 'Product', reason: 'Reason to exist', problem: 'What is wrong today', instead: 'Used instead', difference: 'Difference', proof: 'Proof',
    primary: 'primary audience', need: 'Need', feeling: 'Should feel', frameIn: 'Compared today with', frameOut: 'Wants to be compared with', promise: 'Promise',
    chosen: 'Chosen', kept: 'Kept from it', rejected: 'Rejected', open: 'Not ruled on', horizon: 'Horizon', scale: 'Scale', carry: 'The brand must be able to carry',
    think: 'People should think', feel: 'People should feel', never: 'Never', sounds: 'Sounds like', dim: 'Dimension', orient: 'Orientation', conf: 'Confidence', bound: 'Boundary',
    c: { unknown: 'unknown', low: 'low', medium: 'medium', high: 'high' }, validated: 'validated', crossed: 'The limit is crossed when',
    walls: { for_us: 'Speaks to them', liked_not_for_us: 'Liked, but not for this brand', never: 'Never' }, keeps: 'Keeps', rejects: 'Rejects', cited: 'cited by the founder',
    circle: { direct: 'direct competitor', adjacent: 'adjacent category', analogous: 'analogous industry', aspirational: 'aspirational' }, noverdict: 'No verdict', notshown: 'not shown',
    level: { must: 'Must', preference: 'Preference', explore: 'To explore', never: 'Never' }, wish: 'Founder’s taste', risk: 'Risk for the audience', arb: 'Arbitration',
    where: 'Where the logo must live', prio: 'Priority', p: { critical: 'critical', expected: 'expected', later: 'later' }, timeline: 'Timeline', gate: 'Gate', pref: 'Preference', forWho: { founder: 'for the founder', audit: 'for the audit', kit: 'for the kit' },
    unsolved: 'Unresolved' },
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const CSS = `
:root{--bg:#fff;--ink:#111;--muted:#666;--line:#dedede;--soft:#f5f5f5}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1040px;margin:0 auto;padding:56px 28px 96px}
header{border-bottom:2px solid var(--ink);padding-bottom:20px;margin-bottom:40px}
.kicker,.n,.tag,th,.lab{font:500 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
h1{font-size:44px;line-height:1.05;letter-spacing:-.03em;font-weight:650;margin:8px 0 12px}
.meta{display:flex;gap:18px;flex-wrap:wrap;color:var(--muted);font-size:14px}
.badge{border:1px solid var(--ink);color:var(--ink);border-radius:999px;padding:1px 10px;font-size:12px}
.lead{font-size:28px;line-height:1.25;letter-spacing:-.018em;font-weight:500;max-width:26ch;margin:0 0 20px;max-width:880px}
section{display:grid;grid-template-columns:200px 1fr;gap:32px;padding:32px 0;border-top:1px solid var(--line)}
section>div:first-child h2{font-size:15px;font-weight:600;margin:4px 0 0}
.n{display:block}
ul{margin:0;padding-left:18px} li{margin:4px 0}
dl{margin:0;display:grid;gap:16px}
dt{margin-bottom:2px} dd{margin:0}
.tag{margin-left:8px;white-space:nowrap}
.tag.assumed{color:var(--ink);border:1px dashed var(--ink);padding:0 5px}
q,blockquote{quotes:"\\201C" "\\201D";font-style:italic}
blockquote{margin:6px 0 0;padding-left:14px;border-left:2px solid var(--ink)}
blockquote:before{content:open-quote} blockquote:after{content:close-quote}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
.card{border:1px solid var(--line);border-radius:10px;padding:16px}
.card.on{border:2px solid var(--ink)} .card.off{color:var(--muted)} .card.off h3{text-decoration:line-through}
.card h3{font-size:16px;margin:4px 0 6px}
table{border-collapse:collapse;width:100%;font-size:14.5px} th,td{text-align:left;padding:9px 12px 9px 0;border-bottom:1px solid var(--line);vertical-align:top}
.wall{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:18px 14px;margin:10px 0 30px}
.wall figure{margin:0} .wall img,.ph{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top;border-radius:8px;outline:1px solid var(--line);background:var(--soft)}
.ph{display:grid;place-items:center;color:var(--muted);font-size:13px}
.wall.never img{filter:grayscale(1);opacity:.55}
figcaption{font-size:13.5px;margin-top:7px;line-height:1.45} figcaption b{font-weight:600} figcaption span{color:var(--muted);display:block}
h3.w{font-size:15px;margin:0}
.prov{display:flex;gap:20px;flex-wrap:wrap;font-size:14px;margin-top:22px;color:var(--muted)} .prov b{color:var(--ink)}
@media (max-width:760px){section{grid-template-columns:1fr;gap:10px}h1{font-size:34px}.lead{font-size:22px}.wrap{padding:32px 18px 64px}}
@media print{section{break-inside:avoid}}
`;

/** @returns {string} the report; image paths are relative to the brief directory */
export function render(b, { exists = () => true } = {}) {
  const t = T[b.meta?.locale] || T.en, m = b.meta || {}, c = b.context || {}, p = b.positioning || {}, a = b.ambition || {}, pe = b.perception || {}, per = b.personality || {}, pref = b.preferences || {};
  const tag = (f) => (f?.source ? `<span class="tag ${f.source}">${t.src[f.source] || f.source}</span>` : '');
  const item = (label, f) => (f?.value ? `<div><dt class="lab">${label}${tag(f)}</dt><dd>${esc(f.value)}${f.quote ? `<blockquote>${esc(f.quote)}</blockquote>` : ''}</dd></div>` : '');
  let k = 0;
  const sec = (i, body) => (body && body.trim() ? `<section><div><span class="n">${String(++k).padStart(2, '0')}</span><h2>${t.s[i]}</h2></div><div>${body}</div></section>` : '');
  const n = provenance(b);

  const audiences = (b.audiences || []).map((x) => `<div class="card${x.primary ? ' on' : ''}">${x.primary ? `<span class="lab">${t.primary}</span>` : ''}<h3>${esc(x.name)}</h3><p>${esc(x.who || '')}</p><p><span class="lab">${t.need}</span><br>${esc(x.need || '')}</p><p><span class="lab">${t.feeling}</span><br>${esc(x.feeling || '')}</p>${x.quote ? `<blockquote>${esc(x.quote)}</blockquote>` : ''}</div>`).join('');
  const terr = (p.territories || []).map((x) => `<div class="card${x.status === 'chosen' ? ' on' : x.status === 'rejected' ? ' off' : ''}"><span class="lab">${{ chosen: t.chosen, kept_from: t.kept, rejected: t.rejected, open: t.open }[x.status] || ''}</span><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p>${x.keep ? `<p><b>${esc(x.keep)}</b></p>` : ''}${x.reason ? `<p>${esc(x.reason)}</p>` : ''}</div>`).join('');
  const values = (b.values || []).map((v) => `<div><dt><b>${esc(v.value)}</b>${tag(v)}</dt><dd>${esc(v.instance || '')}${v.quote ? `<blockquote>${esc(v.quote)}</blockquote>` : ''}</dd></div>`).join('');
  const traits = (per.traits || []).map((x) => `<div class="card"><h3>${esc(x.trait)}${tag(x)}</h3><p>${esc(x.more_than)}; ${esc(x.never)}.</p><p><span class="lab">${t.sounds}</span><br><q>${esc(x.sounds_like)}</q></p></div>`).join('');
  const dims = (per.dimensions || []).length ? `<table><tr><th>${t.dim}</th><th>${t.orient}</th><th>${t.conf}</th><th>${t.bound}</th></tr>${per.dimensions.map((d) => `<tr><td>${esc((d.poles || [d.id]).join(' / '))}</td><td>${esc(d.orientation || '')}</td><td>${t.c[d.confidence] || ''}${d.validation === 'validated' ? `, ${t.validated}` : ''}</td><td>${esc(d.boundary || '')}${d.contradictions ? `<br><span class="lab">${t.unsolved}</span> ${esc(d.contradictions)}` : ''}</td></tr>`).join('')}</table>` : '';
  const tensions = (b.tensions || []).map((x) => `<div><dt><b>${esc(x.direction)}</b> <span class="tag">${esc(x.tension)}</span></dt><dd><span class="lab">${t.crossed}</span><br>${esc(x.crossed_when || '')}</dd></div>`).join('');

  const tile = (r) => `<figure>${r.asset && exists(r.asset) ? `<img src="${esc(r.asset)}" alt="${esc(r.name)}">` : `<div class="ph">${esc(r.name)}</div>`}<figcaption><b>${esc(r.name)}</b> <span>${t.circle[r.circle] || ''}${r.founder_cited ? `, ${t.cited}` : ''}</span>${r.liked_attributes?.length ? `${t.keeps} : ${esc(r.liked_attributes.join(' ; '))}<br>` : ''}${r.rejected_attributes?.length ? `${t.rejects} : ${esc(r.rejected_attributes.join(' ; '))}` : ''}</figcaption></figure>`;
  const refs = b.references || [];
  const walls = ['for_us', 'liked_not_for_us', 'never'].map((v) => { const xs = refs.filter((r) => r.verdict === v); return xs.length ? `<h3 class="w">${t.walls[v]}</h3><div class="wall ${v}">${xs.map(tile).join('')}</div>` : ''; }).join('');
  const rest = refs.filter((r) => !['for_us', 'liked_not_for_us', 'never'].includes(r.verdict));
  const noverdict = rest.length ? `<p><span class="lab">${t.noverdict}</span><br>${rest.map((r) => `${esc(r.name)}${r.capture && r.capture.status !== 'ok' ? ` (${t.notshown})` : ''}`).join(', ')}</p>` : '';

  const signals = Object.keys(t.level).map((lv) => { const xs = (pref.signals || []).filter((s) => s.level === lv); return xs.length ? `<div><dt class="lab">${t.level[lv]}</dt><dd><ul>${xs.map((s) => `<li>${esc(s.statement)}${tag(s)}</li>`).join('')}</ul></dd></div>` : ''; }).join('');
  const fva = (pref.founder_vs_audience || []).map((x) => `<div class="card"><p><span class="lab">${t.wish}</span><br>${esc(x.wish)}</p><p><span class="lab">${t.risk}</span><br>${esc(x.risk)}</p><p><span class="lab">${t.arb}</span><br><b>${esc(x.arbitration)}</b></p></div>`).join('');
  const constraints = `${(b.constraints?.items || []).length ? `<ul>${b.constraints.items.map((x) => `<li>${esc(x.constraint)}${tag(x)}</li>`).join('')}</ul>` : ''}${b.constraints?.timeline ? `<p><span class="lab">${t.timeline}</span><br>${esc(b.constraints.timeline)}</p>` : ''}${(b.logo_contexts || []).length ? `<table><tr><th>${t.where}</th><th>${t.prio}</th><th></th></tr>${b.logo_contexts.map((x) => `<tr><td>${esc(x.context)}</td><td>${t.p[x.priority] || ''}</td><td>${esc(x.note || '')}</td></tr>`).join('')}</table>` : ''}`;

  const body = [
    sec(0, b.summary?.lead ? `<p class="lead">${esc(b.summary.lead)}</p><ul>${(b.summary.essence || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''),
    sec(1, `<dl>${item(t.product, c.product)}${item(t.reason, c.reason)}${item(t.problem, c.problem)}${item(t.instead, c.instead_of)}${item(t.difference, c.difference)}${item(t.proof, c.proof)}</dl>`.replace('<dl></dl>', '')),
    sec(2, audiences && `<div class="cards">${audiences}</div>`),
    sec(3, `<dl>${item(t.frameIn, p.frame_inherited)}${item(t.frameOut, p.frame_wanted)}${item(t.promise, p.promise)}</dl>`.replace('<dl></dl>', '') + (terr ? `<div class="cards" style="margin-top:20px">${terr}</div>` : '')),
    sec(4, `<dl>${item(t.horizon, a.horizon)}${item(t.scale, a.scale)}${item(t.carry, a.must_carry)}</dl>`.replace('<dl></dl>', '')),
    sec(5, values && `<dl>${values}</dl>`),
    sec(6, `<dl>${item(t.think, pe.think)}${item(t.feel, pe.feel)}${item(t.never, pe.never_feel)}</dl>`.replace('<dl></dl>', '')),
    sec(7, (traits ? `<div class="cards">${traits}</div>` : '') + (dims ? `<div style="margin-top:24px">${dims}</div>` : '')),
    sec(8, tensions && `<dl>${tensions}</dl>`),
    sec(9, walls + noverdict),
    sec(10, (signals ? `<dl>${signals}</dl>` : '') + (fva ? `<div class="cards" style="margin-top:20px">${fva}</div>` : '')),
    sec(11, (b.principles || []).length ? `<dl>${b.principles.map((x) => `<div><dt><b>${esc(x.principle)}</b></dt><dd>${esc(x.because || '')}</dd></div>`).join('')}</dl>` : ''),
    sec(12, constraints),
    sec(13, (b.evaluation || []).length ? `<ul>${b.evaluation.map((x) => `<li><span class="lab">${x.type === 'gate' ? t.gate : t.pref}</span> ${esc(x.criterion)}</li>`).join('')}</ul>` : ''),
    sec(14, (b.open_questions || []).length ? `<dl>${b.open_questions.map((x) => `<div><dt><b>${esc(x.question)}</b> <span class="tag">${t.forWho[x.for] || ''}</span></dt><dd>${esc(x.why || '')}</dd></div>`).join('')}</dl>` : ''),
    sec(15, (b.limits || []).length ? `<ul>${b.limits.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''),
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="${T[m.locale] ? m.locale : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(m.brand || '')} · ${t.title}</title><style>${CSS}</style></head><body><div class="wrap">
<header><span class="kicker">${t.title}</span><h1>${esc(m.brand || '')}</h1>
<div class="meta"><span>${esc(m.date || '')}</span><span class="badge">${t.status[m.status] || t.status.draft}</span></div>
<div class="prov"><span class="lab">${t.prov}</span>${Object.keys(t.src).map((s) => `<span><b>${n[s]}</b> ${t.src[s]}</span>`).join('')}</div></header>
${body}
</div></body></html>
`;
}

/** Replace every local image path by its bytes, so that one file travels alone. */
export function inlineImages(html, read) {
  const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif' };
  return html.replace(/<img src="([^"]+)"/g, (all, src) => {
    const type = MIME[extname(src).toLowerCase()];
    if (!type || /^(data|https?):/.test(src)) return all;
    return `<img src="data:${type};base64,${read(src).toString('base64')}"`;
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2];
  if (!dir || dir.startsWith('--')) { console.log('usage: node render.mjs <brief-dir> [--inline]'); process.exit(1); }
  const html = render(readBrief(dir), { exists: (p) => existsSync(join(dir, p)) });
  writeFileSync(join(dir, 'brief.html'), html);
  console.log(`brief.html written in ${dir}`);
  if (process.argv.includes('--inline')) {
    const one = inlineImages(html, (p) => readFileSync(join(dir, p)));
    writeFileSync(join(dir, 'brief.single.html'), one);
    console.log(`brief.single.html written (${(one.length / 1048576).toFixed(1)} MB): one file, images embedded, to send to someone`);
  }
}
