#!/usr/bin/env node
// audit.json -> landscape.html, the board a person reads.
//   node render.mjs <audit-dir> [--inline]
// Self-contained apart from the images, which are linked from evidence/ by relative path:
// share the audit folder, not the file alone. No web font, no CDN, no script.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const STRINGS = {
  en: {
    title: 'Visual landscape audit', question: 'Which codes make a brand understood by this market, and which ones can be broken to stand apart from it?',
    mode: 'Mode', date: 'Date', market: 'Market', base: 'Statistics base', baseUnit: 'direct brands', flash: 'Flash: hypotheses', deep: 'Deep: checked positions',
    keep: 'Keep', keepSub: 'Legibility codes', brk: 'Break', brkSub: 'Clichés', risky: 'Weigh', riskySub: 'Risky breaks',
    classes: { legibility: 'Legibility code', cliche: 'Cliché', risky: 'Risky break' }, unclassified: 'Not classified yet',
    panel: 'The panel', roles: { direct: 'Direct', indirect: 'Indirect', leader: 'Category leader', aspirational: 'Aspirational', self: 'The brand itself' },
    brand: 'Brand', role: 'Role', why: 'Why it is here', capture: 'Capture', established: 'established', partial: 'partial: not measured', none: 'not captured',
    stores: 'App Store listings', storesNote: 'The icon and the first screenshot of each listing. For an app this is often the first thing a buyer sees of the brand, and it does not always look like the site.', logos: 'Logos', logoTypes: 'Logo types', heroes: 'Home pages', colour: 'Colour', palette: 'Palette', accent: 'Accent', type: 'Typography', headline: 'Headline', text: 'Text',
    freq: 'What the panel does', freqNote: 'Share of each observed value among the direct brands. A filled bar in colour is a convention.',
    conventions: 'Conventions, classified', breakers: 'Who does otherwise', nobody: 'nobody', of: 'of',
    map: 'Map', mapNote: 'Two axes taken from the data. Dense quadrants are saturated territories, empty ones are candidates.', saturated: 'saturated', empty: 'empty',
    opps: 'Territories to explore', okeep: 'Keeps', obreak: 'Breaks', oimport: 'Borrows', orisk: 'risk', riskLevels: { low: 'low', medium: 'medium', high: 'high' },
    challenged: 'Counter-check', held: 'held', weakened: 'weakened', searched: 'searched',
    library: 'Beyond the panel: a curated sample', libraryNote: 'Logos tagged by a design library for this industry. Selected by designers: this shows the top of the basket, not the market, and its counts are never mixed with the panel.',
    method: 'Method and limits', provenance: 'Each finding is measured (read from the rendered page), observed (coded by looking at the captures) or judged (a conclusion, with its evidence).',
    internal: 'Third-party logos and screenshots are working material for internal reference. Do not publish this page.',
    dims: { logo_type: 'Logo type', symbol_nature: 'Symbol of combination marks', symbol_subject: 'Symbol subject', name_case: 'Name case', name_style: 'Name lettering', hue: 'Dominant hue', saturation: 'Saturation', ground: 'Ground', hue_count: 'Number of hues', headline_class: 'Headline typeface', text_class: 'Text typeface', imagery: 'Imagery', layout: 'Layout', headline_promise: 'Headline promise' },
    facets: { type: 'Type', colour: 'Colour', style: 'Style', subject: 'Subject', mood: 'Mood' }, other: 'other', insufficient: 'Not enough direct brands to count anything.',
  },
  fr: {
    title: 'Audit du paysage visuel', question: 'Quels codes faut-il garder pour être compris par ce marché, et lesquels peut-on rompre pour s’en distinguer ?',
    mode: 'Mode', date: 'Date', market: 'Marché', base: 'Base statistique', baseUnit: 'marques directes', flash: 'Flash : hypothèses', deep: 'Deep : positions vérifiées',
    keep: 'Garder', keepSub: 'Codes de lisibilité', brk: 'Rompre', brkSub: 'Clichés', risky: 'Peser', riskySub: 'Ruptures risquées',
    classes: { legibility: 'Code de lisibilité', cliche: 'Cliché', risky: 'Rupture risquée' }, unclassified: 'Pas encore classé',
    panel: 'Le panel', roles: { direct: 'Direct', indirect: 'Indirect', leader: 'Leader de catégorie', aspirational: 'Aspirationnelle', self: 'La marque elle-même' },
    brand: 'Marque', role: 'Rôle', why: 'Pourquoi elle est là', capture: 'Capture', established: 'installée', partial: 'partielle : non mesurée', none: 'non capturée',
    stores: 'Fiches App Store', storesNote: 'L\u2019icône et la première capture de chaque fiche. Pour une application, c\u2019est souvent la première chose qu\u2019un acheteur voit de la marque, et elle ne ressemble pas toujours au site.', logos: 'Logos', logoTypes: 'Types de logos', heroes: 'Pages d’accueil', colour: 'Couleur', palette: 'Palette', accent: 'Accent', type: 'Typographie', headline: 'Titre', text: 'Texte',
    freq: 'Ce que fait le panel', freqNote: 'Part de chaque valeur observée parmi les marques directes. Une barre en couleur est une convention.',
    conventions: 'Les conventions, classées', breakers: 'Qui fait autrement', nobody: 'personne', of: 'sur',
    map: 'Cartographie', mapNote: 'Deux axes tirés des données. Les quadrants denses sont les territoires saturés, les vides sont des candidats.', saturated: 'saturé', empty: 'vide',
    opps: 'Territoires à explorer', okeep: 'Garde', obreak: 'Rompt', oimport: 'Emprunte', orisk: 'risque', riskLevels: { low: 'faible', medium: 'moyen', high: 'élevé' },
    challenged: 'Contre-enquête', held: 'tient', weakened: 'affaibli', searched: 'cherché',
    library: 'Au-delà du panel : un échantillon sélectionné', libraryNote: 'Logos étiquetés par une bibliothèque de design pour cette industrie. Choisis par des designers : c’est le haut du panier, pas le marché, et ses comptes ne sont jamais mélangés à ceux du panel.',
    method: 'Méthode et limites', provenance: 'Chaque constat est mesuré (lu sur la page rendue), observé (codé en regardant les captures) ou jugé (une conclusion, avec sa preuve).',
    internal: 'Les logos et captures de tiers sont un matériau de travail interne. Ne pas publier cette page.',
    dims: { logo_type: 'Type de logo', symbol_nature: 'Symbole des combination marks', symbol_subject: 'Sujet du symbole', name_case: 'Casse du nom', name_style: 'Dessin du nom', hue: 'Teinte dominante', saturation: 'Saturation', ground: 'Fond', hue_count: 'Nombre de teintes', headline_class: 'Caractère des titres', text_class: 'Caractère du texte', imagery: 'Imagerie', layout: 'Mise en page', headline_promise: 'Promesse du titre' },
    facets: { type: 'Type', colour: 'Couleur', style: 'Style', subject: 'Sujet', mood: 'Ton' }, other: 'autre',
    values: { light: 'clair', dark: 'sombre', coloured: 'coloré', one: 'une', two: 'deux', many: 'plusieurs', muted: 'sourde', medium: 'moyenne', vivid: 'vive', red: 'rouge', orange: 'orange', yellow: 'jaune', green: 'vert', teal: 'bleu-vert', blue: 'bleu', purple: 'violet', pink: 'rose', brown: 'brun', neutral: 'neutre', none: 'aucun', lower: 'bas de casse', upper: 'capitales', title: 'initiale capitale', mixed: 'mixte', geometric_sans: 'sans géométrique', grotesque: 'grotesque', humanist_sans: 'sans humaniste', serif: 'serif', slab: 'égyptienne', script: 'script', mono: 'mono', custom: 'dessin propre', people_photo: 'photo de personnes', product_ui: 'écran du produit', product_photo: 'photo de produit', illustration_flat: 'illustration à plat', illustration_3d: 'illustration 3D', abstract_graphic: 'graphisme abstrait', video: 'vidéo', centered_hero: 'héros centré', split_hero: 'héros scindé', full_bleed_media: 'image plein cadre', dense_grid: 'grille dense', editorial: 'éditorial', benefit: 'bénéfice', mechanism: 'mécanisme', manifesto: 'manifeste', proof: 'preuve', community: 'communauté' }, insufficient: 'Pas assez de marques directes pour compter quoi que ce soit.',
  },
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plain = (v) => esc(String(v ?? '').replace(/^other:/, '').replace(/[_-]/g, ' '));
const CLASS_COLOR = { legibility: 'var(--keep)', cliche: 'var(--break)', risky: 'var(--risk)' };
const ROLE_ORDER = ['self', 'direct', 'leader', 'indirect', 'aspirational'];
const ROLE_COLOR = { self: '#b4451f', direct: '#16181d', leader: '#2f5fa8', indirect: '#6b7280', aspirational: '#1f6f4a' };

/**
 * @param {object} audit  the parsed audit.json
 * @param {object} strings one of STRINGS
 * @param {(path:string)=>boolean} has whether an evidence file exists (images that do not are not linked)
 * @param {string} template the HTML shell
 */
export function renderLandscape(audit, strings = STRINGS[localeOf(audit)], has = () => true, template = defaultTemplate()) {
  // Vocabulary values are translated when the locale has a label; logo types keep their English names.
  const human = (v) => (strings.values && strings.values[v] ? esc(strings.values[v]) : plain(v));
  const t = strings, byId = new Map(audit.panel.map((b) => [b.id, b]));
  const name = (id) => esc(byId.get(id)?.name || id);
  const img = (path, alt, cls = '') => (path && has(path) ? `<img${cls ? ` class="${cls}"` : ''} src="${esc(path)}" alt="${esc(alt)}" loading="lazy">` : '');
  const panel = [...audit.panel].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
  const ev = (b, file) => (b.evidence || []).find((p) => p.endsWith('/' + file));
  // `logo: null` is the analyst (or the script) saying the captured image is not the logo: fall back to an icon, never to it.
  const logoOf = (b) => b.logo || (b.logo === null ? null : ev(b, 'logo.webp')) || ev(b, 'app-icon.webp') || ev(b, 'icon.webp');
  const safeUrl = (u) => (/^https?:\/\//i.test(String(u || '')) ? esc(u) : '#');
  const label = (dim, value) => `${esc(t.dims[dim] || dim)} : ${human(value)}`;
  const convs = audit.conventions || [];
  const out = [];

  // 1. Header: the question, then the answer in three columns.
  const f = audit.frequencies || {};
  out.push(`<p class="label">${esc(t.title)}</p><h1>${esc(audit.framing?.product || '')}</h1>
<p class="lede">${esc(t.question)}</p>
<div class="meta">
<div><span class="label">${esc(t.market)}</span>${esc(audit.framing?.market || '')}</div>
<div><span class="label">${esc(t.mode)}</span>${esc(t[audit.meta?.mode] || audit.meta?.mode || '')}</div>
<div><span class="label">${esc(t.date)}</span>${esc(audit.meta?.date || '')}</div>
<div><span class="label">${esc(t.base)}</span>${f.base ?? 0} ${esc(t.baseUnit)}</div>
</div>`);
  const col = (cls, head, sub) => {
    const items = convs.filter((c) => c.class === cls);
    return `<section style="--c:${CLASS_COLOR[cls]}"><p class="label">${esc(sub)}</p><h3 style="margin:6px 0 0;font-size:1.3rem">${esc(head)}</h3><ul>${
      items.map((c) => `<li>${label(c.dimension, c.value)} <span class="muted">(${c.count} ${esc(t.of)} ${c.base})</span></li>`).join('') || `<li class="muted">${esc(t.nobody)}</li>`}</ul></section>`;
  };
  out.push(`<div class="answer">${col('legibility', t.keep, t.keepSub)}${col('cliche', t.brk, t.brkSub)}${col('risky', t.risky, t.riskySub)}</div>`);

  // 2. Opportunities, early: this is what the reader came for.
  if ((audit.opportunities || []).length) {
    out.push(`<h2>${esc(t.opps)}</h2>`);
    for (const o of audit.opportunities) {
      const ch = o.challenged ? `<dt>${esc(t.challenged)}</dt><dd>${esc(t[o.challenged.result] || o.challenged.result)}${o.challenged.note ? '. ' + esc(o.challenged.note) : ''} <span class="note">(${esc(t.searched)} : ${o.challenged.searched.map(esc).join(' · ')})</span></dd>` : '';
      out.push(`<article class="opp"><h3>${esc(o.title)}<span class="risk">${esc(t.orisk)} ${esc(t.riskLevels[o.risk] || o.risk)}</span></h3><p>${esc(o.rationale)}</p>
<dl><dt>${esc(t.okeep)}</dt><dd>${(o.keep || []).map(human).join(' · ') || '&nbsp;'}</dd><dt>${esc(t.obreak)}</dt><dd>${(o.break || []).map(human).join(' · ') || '&nbsp;'}</dd>
${(o.import || []).length ? `<dt>${esc(t.oimport)}</dt><dd>${o.import.map((i) => `${name(i.from)} : ${esc(i.what)}`).join(' · ')}</dd>` : ''}${ch}</dl>
<div class="ev">${(o.evidence || []).map((p) => (has(p) && /\.(webp|png|jpe?g|svg)$/.test(p) ? `<a href="${esc(p)}">${img(p, o.title)}</a>` : '')).join('')}</div></article>`);
    }
  }

  // 3. Panel.
  out.push(`<h2>${esc(t.panel)}</h2><div class="scroll"><table><thead><tr><th>${esc(t.brand)}</th><th>${esc(t.role)}</th><th>${esc(t.why)}</th><th>${esc(t.capture)}</th></tr></thead><tbody>${
    panel.map((b) => `<tr><td><a href="${safeUrl(b.url)}" rel="noreferrer">${esc(b.name)}</a>${b.established?.value ? ` <span class="note">(${esc(t.established)})</span>` : ''}</td><td>${esc(t.roles[b.role] || b.role)}</td><td>${esc(b.why)}</td><td>${
      b.capture === 'full' ? '●' : b.capture === 'partial' ? esc(t.partial) : esc(t.none)}</td></tr>`).join('')}</tbody></table></div>`);

  // 4. Walls.
  out.push(`<h2>${esc(t.logos)}</h2><div class="grid g-logos">${panel.map((b) => `<figure><div class="box">${img(logoOf(b), b.name) || `<span class="missing">${esc(b.name)}</span>`}</div><figcaption><span>${esc(b.name)}</span><small>${b.codes?.logo_type ? human(b.codes.logo_type) : ''}</small></figcaption></figure>`).join('')}</div>`);
  out.push(`<h2>${esc(t.heroes)}</h2><div class="grid g-heroes">${panel.filter((b) => ev(b, 'desktop.webp') && has(ev(b, 'desktop.webp'))).map((b) => `<figure><a href="${esc(ev(b, 'full.webp') || ev(b, 'desktop.webp'))}">${img(ev(b, 'desktop.webp'), b.name)}</a><figcaption><span>${esc(b.name)}</span><small>${esc(t.roles[b.role] || b.role)}</small></figcaption></figure>`).join('')}</div>`);

  const stores = panel.filter((b) => (ev(b, 'app-icon.webp') && has(ev(b, 'app-icon.webp'))) || (ev(b, 'app-1.webp') && has(ev(b, 'app-1.webp'))));
  if (stores.length) out.push(`<h2>${esc(t.stores)}</h2><p class="note">${esc(t.storesNote)}</p><div class="grid g-apps">${stores.map((b) => `<figure><div class="box">${img(ev(b, 'app-icon.webp'), b.name, 'appicon')}</div>${img(ev(b, 'app-1.webp'), b.name)}<figcaption><span>${esc(b.name)}</span><small>${esc(t.roles[b.role] || b.role)}</small></figcaption></figure>`).join('')}</div>`);

  // 5. Colour and type, from the measures.
  const measured = panel.filter((b) => b.measures);
  if (measured.length) {
    const strip = (m) => `<div class="strip">${(m.palette || []).map((p) => `<i style="background:${esc(p.hex)};flex:${Math.max(0.06, Math.sqrt(p.share)).toFixed(2)}" title="${esc(p.hex)} ${Math.round(p.share * 100)}%"></i>`).join('')}</div>`;
    out.push(`<h2>${esc(t.colour)} · ${esc(t.type)}</h2><div class="scroll"><table><thead><tr><th>${esc(t.brand)}</th><th>${esc(t.palette)}</th><th>${esc(t.accent)}</th><th>${esc(t.headline)}</th><th>${esc(t.text)}</th></tr></thead><tbody>${
      measured.map((b) => { const m = b.measures, h = m.headline; return `<tr><td>${esc(b.name)}</td><td>${strip(m)}</td><td>${m.accent ? `<span class="dot" style="background:${esc(m.accent)}"></span>${esc(m.accent)}` : ''}</td><td>${h ? `${esc(String(h.family).split(',')[0].replace(/["']/g, ''))} ${esc(h.weight)} · ${Math.round(h.size_px)}px` : ''}</td><td>${esc((m.fonts || [])[0]?.family || '')}</td></tr>`; }).join('')}</tbody></table></div>`);
  }

  // 6. Frequencies.
  out.push(`<h2>${esc(t.freq)}</h2><p class="note">${esc(t.freqNote)}</p>`);
  if (f.insufficient) out.push(`<p>${esc(t.insufficient)}</p>`);
  else out.push(`<div class="bars">${Object.entries(f.by_dimension || {}).map(([dim, values]) => `<div><h3>${esc(t.dims[dim] || dim)}</h3>${values.slice(0, 6).map((v) => `<div class="bar${v.status === 'convention' ? ' conv' : ''}"><b>${human(v.value)}</b><span><i style="width:${Math.round(v.share * 100)}%"></i></span><em>${v.count}/${v.base}</em></div>`).join('')}</div>`).join('')}</div>`);

  // 7. Conventions with their evidence.
  if (convs.length) {
    out.push(`<h2>${esc(t.conventions)}</h2><p class="note">${esc(t.provenance)}</p>`);
    for (const c of [...convs].sort((a, b) => ['legibility', 'cliche', 'risky', undefined].indexOf(a.class) - ['legibility', 'cliche', 'risky', undefined].indexOf(b.class)))
      out.push(`<article class="conv-card" style="--c:${CLASS_COLOR[c.class] || 'var(--line)'}"><p class="label">${esc(t.classes[c.class] || t.unclassified)}</p><h3>${label(c.dimension, c.value)} <span class="count">${c.count} ${esc(t.of)} ${c.base}</span></h3>
${c.reason ? `<p>${esc(c.reason)}</p>` : ''}<p class="note">${esc(t.breakers)} : ${(c.breakers || []).map((b) => `${name(b.id)} (${human(b.value)}${b.established ? ', ' + esc(t.established) : ''})`).join(' · ') || esc(t.nobody)}</p>
<div class="ev">${(c.evidence || []).map((p) => (has(p) && /\.(webp|png|jpe?g|svg)$/.test(p) ? `<a href="${esc(p)}">${img(p, c.value)}</a>` : '')).join('')}</div></article>`);
  }

  // 8. Map.
  if (audit.map) out.push(`<h2>${esc(t.map)}</h2><p class="note">${esc(t.mapNote)}</p>${audit.map.reading ? `<p>${esc(audit.map.reading)}</p>` : ''}${mapSvg(audit.map, byId, t, human)}`);

  // 9. Library sample, set apart.
  const lib = audit.library?.logosystem;
  if (lib?.n) {
    out.push(`<h2>${esc(t.library)}</h2><p class="note">${esc(t.libraryNote)} <a href="${esc(lib.url)}" rel="noreferrer">Logosystem, ${esc(lib.industry)}</a>, n = ${lib.n}, ${esc(lib.fetched)}.</p>`);
    if (lib.facets) out.push(`<div class="bars">${Object.entries(lib.facets).map(([facet, counts]) => `<div><h3>${esc(t.facets[facet] || facet)}</h3>${Object.entries(counts).slice(0, 6).map(([v, c]) => `<div class="bar"><b>${human(v)}</b><span><i style="width:${Math.round(c.share * 100)}%"></i></span><em>${c.count}/${lib.n}</em></div>`).join('')}</div>`).join('')}</div>`);
    out.push(`<div class="grid g-lib">${lib.items.filter((i) => i.image && has(i.image)).map((i) => `<figure><a href="${esc(i.url)}" rel="noreferrer">${img(i.image, i.name)}</a><figcaption><span>${esc(i.name)}</span></figcaption></figure>`).join('')}</div>`);
  }

  // 10. Method.
  out.push(`<h2>${esc(t.method)}</h2><ul>${(audit.limits || []).map((l) => `<li>${esc(l)}</li>`).join('')}</ul><p class="note">${esc(t.provenance)}</p><p class="note">${esc(t.internal)}</p>`);

  return template.replace('<!--LANG-->', esc(localeOf(audit))).replace('<!--TITLE-->', () => `${esc(t.title)} · ${esc(audit.framing?.product || '')}`).replace('<!--BODY-->', () => out.join('\n'));
}

function mapSvg(map, byId, t, human) {
  const W = 1000, Hh = 620, pad = 70, sx = (v) => pad + ((v + 1) / 2) * (W - 2 * pad), sy = (v) => pad + ((v + 1) / 2) * (Hh - 2 * pad);
  const axis = (a) => `${esc(t.dims[a.dimension] || a.dimension)}`;
  const pole = (p) => (p === 'other' ? esc(t.other) : human(p));
  const quad = map.clusters.map((c) => {
    const [qx, qy] = c.quadrant, x = qx < 0 ? pad : W / 2, y = qy < 0 ? pad : Hh / 2, w = W / 2 - pad, h = Hh / 2 - pad;
    const fill = c.saturated ? '#f1e3dc' : c.ids.length === 0 ? '#e6efe9' : 'none';
    const tag = c.saturated ? t.saturated : c.ids.length === 0 ? t.empty : '';
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>${tag ? `<text x="${x + 12}" y="${y + 22}" font-size="13" fill="#666b76" style="text-transform:uppercase;letter-spacing:.08em">${esc(tag)}</text>` : ''}`;
  }).join('');
  const pts = map.points.map((p) => {
    const b = byId.get(p.id), c = ROLE_COLOR[p.role] || '#16181d', x = sx(p.x), y = sy(p.y);
    const mark = p.role === 'aspirational' ? `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" fill="none" stroke="${c}" stroke-width="2.5"/>`
      : p.role === 'self' ? `<path d="M${x} ${y - 9}L${x + 9} ${y + 7}H${x - 9}Z" fill="${c}"/>` : `<circle cx="${x}" cy="${y}" r="6.5" fill="${c}"/>`;
    return `${mark}<text x="${x + 11}" y="${y + 4.5}" font-size="14" fill="#16181d">${esc(b?.name || p.id)}</text>`;
  }).join('');
  const roles = [...new Set(map.points.map((p) => p.role))];
  return `<div class="map"><svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(t.map)}" font-family="ui-sans-serif,system-ui,sans-serif">
${quad}<line x1="${W / 2}" y1="${pad}" x2="${W / 2}" y2="${Hh - pad}" stroke="#16181d"/><line x1="${pad}" y1="${Hh / 2}" x2="${W - pad}" y2="${Hh / 2}" stroke="#16181d"/>
<text x="${pad}" y="${Hh / 2 - 10}" font-size="14" font-weight="600">← ${pole(map.x.poles[0])}</text><text x="${W - pad}" y="${Hh / 2 - 10}" font-size="14" font-weight="600" text-anchor="end">${pole(map.x.poles[1])} →</text>
<text x="${W / 2}" y="${pad - 30}" font-size="14" font-weight="600" text-anchor="middle">↑ ${pole(map.y.poles[0])}</text><text x="${W / 2}" y="${Hh - pad + 44}" font-size="14" font-weight="600" text-anchor="middle">↓ ${pole(map.y.poles[1])}</text>
<text x="${pad}" y="${Hh - 14}" font-size="12" fill="#666b76">${axis(map.x)} (↔) × ${axis(map.y)} (↕)</text>
${pts}</svg></div><div class="legend">${roles.map((r) => `<span><span class="dot" style="background:${r === 'aspirational' ? 'none' : ROLE_COLOR[r]};border:2px solid ${ROLE_COLOR[r]};border-radius:${r === 'aspirational' ? 0 : 50}%"></span>${esc(t.roles[r] || r)}</span>`).join('')}</div>`;
}

const MIME = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml' };
/** Embed every evidence image as a data URI, so the board travels as one file. Links to images are dropped. */
export function inlineImages(html, read) {
  const cache = new Map();
  const uri = (p) => {
    if (!cache.has(p)) cache.set(p, `data:${MIME[p.split('.').pop()] || 'application/octet-stream'};base64,${read(p).toString('base64')}`);
    return cache.get(p);
  };
  return html.replace(/<a href="evidence\/[^"]+">([\s\S]*?)<\/a>/g, '$1').replace(/src="(evidence\/[^"]+)"/g, (m, p) => `src="${uri(p)}"`);
}

function localeOf(audit) { return String(audit.meta?.locale || 'en').slice(0, 2).toLowerCase() === 'fr' ? 'fr' : 'en'; }
function defaultTemplate() { return readFileSync(new URL('./landscape.template.html', import.meta.url), 'utf8'); }
export { STRINGS };

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const dir = process.argv[2];
  if (!dir || dir.startsWith('--')) { console.log('usage: node render.mjs <audit-dir>'); process.exit(dir === '--help' ? 0 : 1); }
  const audit = JSON.parse(readFileSync(join(dir, 'audit.json'), 'utf8'));
  const html = renderLandscape(audit, STRINGS[localeOf(audit)], (p) => existsSync(join(dir, p)));
  writeFileSync(join(dir, 'landscape.html'), html);
  console.log(`landscape.html written (${Math.round(html.length / 1024)} KB, ${localeOf(audit)})`);
  if (process.argv.includes('--inline')) {
    const one = inlineImages(html, (p) => readFileSync(join(dir, p)));
    writeFileSync(join(dir, 'landscape.single.html'), one);
    console.log(`landscape.single.html written (${(one.length / 1048576).toFixed(1)} MB): one file, images embedded, to send to someone`);
  }
}
