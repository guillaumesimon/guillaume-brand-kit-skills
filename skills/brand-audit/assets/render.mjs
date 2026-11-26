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
    sec: {
      summary: ['Executive summary', 'The landscape in two minutes.'], scope: ['Competitive landscape', 'Who was observed, and why.'], profiles: ['Brand profiles', 'One grid, applied to every brand.'],
      logos: ['Logo landscape', 'The marks side by side, at the same optical size.'], architecture: ['Logo architecture', 'Which kinds of mark dominate, and which are rare.'], colour: ['Colour landscape', 'How the colour space is occupied.'],
      typography: ['Typography landscape', 'The lettering signatures of the category.'], symbols: ['Signs and meaning', 'What the marks represent.'], visual_language: ['Visual language and touchpoints', 'The logo is one piece of a larger system.'],
      maps: ['Positioning maps', 'Where the brands gather, and where they do not.'], codes: ['Codes and conventions', 'What helps a brand be understood, and what stops it standing apart.'], opportunities: ['White space and opportunities', 'The bridge from the audit to the creative work.'], method: ['Method and limits', 'What this audit can and cannot say.'] },
    decisions: { preserve: ['Preserve', 'Codes to keep to stay legible'], avoid: ['Avoid', 'Clichés and resemblances'], challenge: ['Challenge', 'Conventions worth questioning'], explore: ['Explore', 'Territories to open'], validate: ['Validate', 'Hypotheses to check with people'] },
    classInfo: { legibility: ['Category codes', 'Signals a brand needs to be understood and believed.'], cliche: ['Category clichés', 'So widespread they no longer distinguish anyone. An established brand does without.'], risky: ['Risky breaks', 'Nobody established breaks them and they tell the buyer nothing. An opening or a trap.'], owned: ['Codes owned by a competitor', 'Strongly tied to one brand. Imitating them is borrowing its identity.'], emerging: ['Emerging codes', 'Appearing in the category or next to it. Not yet a convention.'] },
    takeaway: 'What to take from it', findingsTitle: 'Findings', prov: { measured: 'measured', observed: 'observed', judged: 'judged' }, convention: 'convention', otherValue: 'other value',
    original: 'As published', mono: 'In black and white', icons: 'The sign alone: app icons', specimens: 'Headlines as set on the page', spectrum: 'Accent hues on the spectrum', panelCounts: 'What the panel does', library: 'Curated sample', homes: 'Home pages',
    personality: 'Perceived personality', strength: 'Strength', lesson: 'What it teaches', notes: 'Coder\u2019s note', learn: 'What it shows', nBrands: 'Brands', source: 'Source', seen: 'Captured',
    roleLearn: { direct: 'The codes of the category and its baseline expectations.', indirect: 'The alternatives the audience already uses.', leader: 'Where the category is heading.', aspirational: 'A level of execution, and codes that could transfer.', self: 'The starting point.' },
    observation: 'Observation', alignment: 'Link to the brief', benefit: 'Expected benefit', risk: 'Risk', toValidate: 'To validate', mapCaveat: 'A map drawn from the captures is a reading of the identities, not a measure of how people perceive them. That takes a study with the audience.',
    quality: 'Before using it', sources: 'Sources', noSection: 'This part has not been written yet.', contents: 'Contents',
    title: 'Visual landscape audit', question: 'Which codes make a brand understood by this market, and which ones can be broken to stand apart from it?',
    mode: 'Mode', date: 'Date', market: 'Market', base: 'Statistics base', baseUnit: 'direct brands', flash: 'Flash: hypotheses', deep: 'Deep: checked positions',
    keep: 'Keep', keepSub: 'Legibility codes', brk: 'Break', brkSub: 'Clichés', risky: 'Weigh', riskySub: 'Risky breaks',
    classes: { legibility: 'Category code', cliche: 'Cliché', risky: 'Risky break', owned: 'Owned by a competitor', emerging: 'Emerging code' }, unclassified: 'Not classified yet',
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
    dims: { logo_type: 'Logo type', symbol_nature: 'Symbol of combination marks', symbol_subject: 'Symbol subject', name_case: 'Name case', name_style: 'Name lettering', hue: 'Dominant hue', saturation: 'Saturation', ground: 'Ground', hue_count: 'Number of hues', headline_class: 'Headline typeface', text_class: 'Text typeface', imagery: 'Imagery', layout: 'Layout', headline_promise: 'Headline promise', logo_form: 'Logo form', logo_energy: 'Logo energy', logo_detail: 'Logo detail' },
    facets: { type: 'Type', colour: 'Colour', style: 'Style', subject: 'Subject', mood: 'Mood' }, other: 'other', insufficient: 'Not enough direct brands to count anything.',
  },
  fr: {
    sec: {
      summary: ['Synthèse', 'Le paysage en deux minutes.'], scope: ['Paysage concurrentiel', 'Qui a été observé, et pourquoi.'], profiles: ['Fiches de marques', 'Une même grille pour chaque marque.'],
      logos: ['Paysage des logos', 'Les signes côte à côte, à taille optique comparable.'], architecture: ['Architectures de logos', 'Les formes d\u2019identité dominantes, et les rares.'], colour: ['Paysage coloriel', 'Comment l\u2019espace des couleurs est occupé.'],
      typography: ['Paysage typographique', 'Les signatures de lettres de la catégorie.'], symbols: ['Signes et sémantique', 'Ce que les signes représentent.'], visual_language: ['Langage visuel et points de contact', 'Le logo est une pièce d\u2019un système plus large.'],
      maps: ['Cartes de positionnement', 'Où les marques se regroupent, et où elles ne vont pas.'], codes: ['Codes et conventions', 'Ce qui aide à être compris, et ce qui empêche de se distinguer.'], opportunities: ['Espaces libres et opportunités', 'La passerelle entre l\u2019audit et la création.'], method: ['Méthode et limites', 'Ce que cet audit peut dire, et ce qu\u2019il ne peut pas.'] },
    decisions: { preserve: ['Préserver', 'Les codes à garder pour rester lisible'], avoid: ['Éviter', 'Clichés et ressemblances'], challenge: ['Remettre en question', 'Les conventions qui se discutent'], explore: ['Explorer', 'Les territoires à ouvrir'], validate: ['Valider', 'Les hypothèses à vérifier auprès de personnes'] },
    classInfo: { legibility: ['Codes de catégorie', 'Les signaux nécessaires pour être compris et crédible.'], cliche: ['Clichés de catégorie', 'Si répandus qu\u2019ils ne distinguent plus personne. Une marque installée s\u2019en passe.'], risky: ['Ruptures risquées', 'Aucune marque installée ne les rompt, et ils ne disent rien à l\u2019acheteur. Une ouverture ou un piège.'], owned: ['Codes associés à un concurrent', 'Fortement liés à une marque. Les imiter, c\u2019est emprunter son identité.'], emerging: ['Codes émergents', 'Ils apparaissent dans la catégorie ou à côté. Pas encore une convention.'] },
    takeaway: 'Ce qu\u2019il faut en retenir', findingsTitle: 'Constats', prov: { measured: 'mesuré', observed: 'observé', judged: 'jugé' }, convention: 'convention', otherValue: 'autre valeur',
    original: 'Tels que publiés', mono: 'En noir et blanc', icons: 'Le signe seul : icônes d\u2019application', specimens: 'Les titres tels qu\u2019ils sont composés', spectrum: 'Les teintes d\u2019accent sur le spectre', panelCounts: 'Ce que fait le panel', library: 'Échantillon sélectionné', homes: 'Pages d\u2019accueil',
    personality: 'Personnalité perçue', strength: 'Force', lesson: 'Enseignement', notes: 'Note du codeur', learn: 'Ce qu\u2019on y apprend', nBrands: 'Marques', source: 'Source', seen: 'Capture',
    roleLearn: { direct: 'Les codes de la catégorie et ses attentes de base.', indirect: 'Les alternatives que le public utilise déjà.', leader: 'Vers où la catégorie se déplace.', aspirational: 'Un niveau d\u2019exécution, et des codes transférables.', self: 'Le point de départ.' },
    observation: 'Constat', alignment: 'Lien avec le brief', benefit: 'Bénéfice attendu', risk: 'Risque', toValidate: 'À valider', mapCaveat: 'Une carte dessinée à partir des captures est une lecture des identités, pas une mesure de la perception du public. Celle-ci demande une étude auprès de l\u2019audience.',
    quality: 'Avant de s\u2019en servir', sources: 'Sources', noSection: 'Cette partie n\u2019a pas encore été rédigée.', contents: 'Sommaire',
    title: 'Audit du paysage visuel', question: 'Quels codes faut-il garder pour être compris par ce marché, et lesquels peut-on rompre pour s’en distinguer ?',
    mode: 'Mode', date: 'Date', market: 'Marché', base: 'Base statistique', baseUnit: 'marques directes', flash: 'Flash : hypothèses', deep: 'Deep : positions vérifiées',
    keep: 'Garder', keepSub: 'Codes de lisibilité', brk: 'Rompre', brkSub: 'Clichés', risky: 'Peser', riskySub: 'Ruptures risquées',
    classes: { legibility: 'Code de catégorie', cliche: 'Cliché', risky: 'Rupture risquée', owned: 'Associé à un concurrent', emerging: 'Code émergent' }, unclassified: 'Pas encore classé',
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
    dims: { logo_type: 'Type de logo', symbol_nature: 'Symbole des combination marks', symbol_subject: 'Sujet du symbole', name_case: 'Casse du nom', name_style: 'Dessin du nom', hue: 'Teinte dominante', saturation: 'Saturation', ground: 'Fond', hue_count: 'Nombre de teintes', headline_class: 'Caractère des titres', text_class: 'Caractère du texte', imagery: 'Imagerie', layout: 'Mise en page', headline_promise: 'Promesse du titre', logo_form: 'Forme du logo', logo_energy: 'Énergie du logo', logo_detail: 'Détail du logo' },
    facets: { type: 'Type', colour: 'Couleur', style: 'Style', subject: 'Sujet', mood: 'Ton' }, other: 'autre',
    values: { light: 'clair', dark: 'sombre', coloured: 'coloré', one: 'une', two: 'deux', many: 'plusieurs', muted: 'sourde', medium: 'moyenne', vivid: 'vive', red: 'rouge', orange: 'orange', yellow: 'jaune', green: 'vert', teal: 'bleu-vert', blue: 'bleu', purple: 'violet', pink: 'rose', brown: 'brun', neutral: 'neutre', none: 'aucun', lower: 'bas de casse', upper: 'capitales', title: 'initiale capitale', mixed: 'mixte', geometric_sans: 'sans géométrique', grotesque: 'grotesque', humanist_sans: 'sans humaniste', serif: 'serif', slab: 'égyptienne', script: 'script', mono: 'mono', custom: 'dessin propre', people_photo: 'photo de personnes', product_ui: 'écran du produit', product_photo: 'photo de produit', illustration_flat: 'illustration à plat', illustration_3d: 'illustration 3D', abstract_graphic: 'graphisme abstrait', video: 'vidéo', centered_hero: 'héros centré', split_hero: 'héros scindé', full_bleed_media: 'image plein cadre', dense_grid: 'grille dense', editorial: 'éditorial', benefit: 'bénéfice', mechanism: 'mécanisme', manifesto: 'manifeste', proof: 'preuve', community: 'communauté', geometric: 'géométrique', organic: 'organique', static: 'statique', dynamic: 'dynamique', minimal: 'minimaliste', detailed: 'détaillé' }, insufficient: 'Pas assez de marques directes pour compter quoi que ce soit.',
  },
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plain = (v) => esc(String(v ?? '').replace(/^other:/, '').replace(/[_-]/g, ' '));
const ROLE_ORDER = ['self', 'direct', 'leader', 'indirect', 'aspirational'];
const CLASS_ORDER = ['legibility', 'cliche', 'owned', 'risky', 'emerging'];
const IMG = /\.(webp|png|jpe?g|svg)$/i;

function hueAngle(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '')); if (!m) return null;
  const n = parseInt(m[1], 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d < 0.08) return null; // a grey has no place on the spectrum
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

/**
 * @param {object} audit  the parsed audit.json
 * @param {object} strings one of STRINGS
 * @param {(path:string)=>boolean} has whether an evidence file exists (images that do not are not linked)
 * @param {string} template the HTML shell
 */
export function renderLandscape(audit, strings = STRINGS[localeOf(audit)], has = () => true, template = defaultTemplate()) {
  const t = strings, byId = new Map(audit.panel.map((b) => [b.id, b]));
  // Vocabulary values are translated when the locale has a label; logo types keep their English names.
  const human = (v) => (t.values && t.values[v] ? esc(t.values[v]) : plain(v));
  const name = (id) => esc(byId.get(id)?.name || id);
  const img = (path, alt, cls = '') => (path && has(path) ? `<img${cls ? ` class="${cls}"` : ''} src="${esc(path)}" alt="${esc(alt)}" loading="lazy">` : '');
  const panel = [...audit.panel].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
  const ev = (b, file) => { const p = (b.evidence || []).find((x) => x.endsWith('/' + file)); return p && has(p) ? p : null; };
  // `logo: null` is the analyst (or the script) saying the captured image is not the logo: fall back to an icon, never to it.
  const logoOf = (b) => (b.logo && has(b.logo) ? b.logo : null) || (b.logo === null ? null : ev(b, 'logo.webp')) || ev(b, 'app-icon.webp') || ev(b, 'icon.webp');
  const safeUrl = (u) => (/^https?:\/\//i.test(String(u || '')) ? esc(u) : '#');
  const label = (dim, value) => `${esc(t.dims[dim] || dim)} : ${human(value)}`;
  const role = (b) => esc(t.roles[b.role] || b.role);
  const thumbs = (paths, alt) => { const x = (paths || []).filter((p) => IMG.test(p) && has(p)); return x.length ? `<div class="ev">${x.map((p) => `<a href="${esc(p)}">${img(p, alt)}</a>`).join('')}</div>` : ''; };
  const f = audit.frequencies || {}, by = f.by_dimension || {};
  const convs = audit.conventions || [], opps = audit.opportunities || [], sections = audit.sections || {};

  const bars = (dims) => {
    const blocks = dims.filter((d) => by[d]?.length).map((d) => `<div><h4>${esc(t.dims[d] || d)}</h4>${by[d].slice(0, 7).map((v) =>
      `<div class="bar-row${v.status === 'convention' ? ' conv' : ''}"><b title="${human(v.value)}">${human(v.value)}</b><span class="t"><i style="width:${Math.round(v.share * 100)}%"></i></span><em>${v.count}/${v.base}</em></div>`).join('')}</div>`);
    return blocks.length ? `<h3>${esc(t.panelCounts)}</h3><div class="bars">${blocks.join('')}</div><p class="legend"><span><i class="k"></i>${esc(t.convention)}</span><span><i></i>${esc(t.otherValue)}</span><span>${f.base ?? 0} ${esc(t.baseUnit)}</span></p>` : '';
  };
  const facets = (keys) => {
    const lib = audit.library?.logosystem; if (!lib?.facets) return '';
    const blocks = keys.filter((k) => lib.facets[k]).map((k) => `<div><h4>${esc(t.facets[k] || k)}</h4>${Object.entries(lib.facets[k]).slice(0, 6).map(([v, c]) =>
      `<div class="bar-row"><b>${human(v)}</b><span class="t"><i style="width:${Math.round(c.share * 100)}%"></i></span><em>${c.count}/${lib.n}</em></div>`).join('')}</div>`);
    return blocks.length ? `<h3>${esc(t.library)} <span class="tag">Logosystem · ${esc(lib.industry)} · n = ${lib.n}</span></h3><p class="note">${esc(t.libraryNote)}</p><div class="bars">${blocks.join('')}</div>` : '';
  };
  /** The written part of a section: lead, paragraphs, findings with provenance and evidence, takeaway. */
  const written = (key) => {
    const s = sections[key];
    if (!s) return { lead: '', rest: `<p class="note">${esc(t.noSection)}</p>` };
    const findings = (s.findings || []).length ? `<h3>${esc(t.findingsTitle)}</h3><ul class="findings">${s.findings.map((x) =>
      `<li><span class="tag">${esc(t.prov[x.provenance] || x.provenance)}</span><div>${esc(x.text)}${thumbs(x.evidence, x.text)}</div></li>`).join('')}</ul>` : '';
    return { lead: `<p class="lead">${esc(s.lead)}</p>`,
      rest: `<div class="prose">${(s.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('')}</div>${findings}<div class="take"><h4>${esc(t.takeaway)}</h4>${esc(s.takeaway)}</div>` };
  };
  const wall = (items, cls, cell) => (items.length ? `<div class="grid ${cls}">${items.map(cell).join('')}</div>` : '');
  const cap = (b, right) => `<figcaption><span>${esc(b.name)}</span><small>${right ?? role(b)}</small></figcaption>`;

  const S = []; // [key, html]
  // 01 Summary
  const sm = audit.summary;
  const decisions = sm ? `<div class="decisions">${['preserve', 'avoid', 'challenge', 'explore', 'validate'].map((d) =>
    `<section><div><h3>${esc(t.decisions[d][0])}</h3><h4>${esc(t.decisions[d][1])}</h4></div><ul>${(sm[d] || []).map((it) => `<li>${esc(it.text)}</li>`).join('') || '<li class="note">&nbsp;</li>'}</ul></section>`).join('')}</div>` : '';
  S.push(['summary', `${sm ? `<p class="lead">${esc(sm.lead)}</p>` : `<p class="note">${esc(t.noSection)}</p>`}${decisions}`]);

  // 02 Scope
  const roles = ROLE_ORDER.filter((r) => panel.some((b) => b.role === r));
  S.push(['scope', `<p class="lead">${esc(audit.framing?.audience || '')}</p>
<div class="prose"><p>${esc(audit.framing?.product || '')}. ${esc(audit.framing?.market || '')}.${audit.framing?.instead_of ? ' ' + esc(audit.framing.instead_of) + '.' : ''}</p></div>
<div class="scroll"><table><thead><tr><th>${esc(t.role)}</th><th>${esc(t.nBrands)}</th><th>${esc(t.learn)}</th></tr></thead><tbody>${roles.map((r) =>
    `<tr><td>${esc(t.roles[r])}</td><td>${panel.filter((b) => b.role === r).length}</td><td>${esc(t.roleLearn[r])}</td></tr>`).join('')}</tbody></table></div>
<div class="scroll"><table><thead><tr><th>${esc(t.brand)}</th><th>${esc(t.role)}</th><th>${esc(t.why)}</th><th>${esc(t.seen)}</th></tr></thead><tbody>${panel.map((b) =>
    `<tr><td><a href="${safeUrl(b.url)}" rel="noreferrer">${esc(b.name)}</a>${b.established?.value ? `<span class="sub">${esc(t.established)} · ${esc(b.established.reason)}</span>` : ''}</td><td>${role(b)}</td><td>${esc(b.why)}</td><td>${
      b.capture === 'full' ? esc(audit.meta?.date || '●') : b.capture === 'partial' ? esc(t.partial) : esc(t.none)}</td></tr>`).join('')}</tbody></table></div>`]);

  // 03 Profiles
  const strip = (m) => `<div class="strip">${(m.palette || []).map((p) => `<i style="background:${esc(p.hex)};flex:${Math.max(0.06, Math.sqrt(p.share)).toFixed(2)}" title="${esc(p.hex)} ${Math.round(p.share * 100)}%"></i>`).join('')}</div>`;
  const chip = (b, d) => (b.codes?.[d] ? `<span class="tag">${human(b.codes[d])}</span>` : '');
  S.push(['profiles', panel.map((b) => {
    const m = b.measures, h = m?.headline, pr = b.profile;
    const read = pr ? `<div><h4>${esc(t.personality)}</h4><p>${esc(pr.personality)}</p></div><div><h4>${esc(t.strength)}</h4><p>${esc(pr.strength)}</p></div><div><h4>${esc(t.lesson)}</h4><p>${esc(pr.lesson)}</p></div>`
      : b.codes?.notes ? `<div><h4>${esc(t.notes)}</h4><p>${esc(b.codes.notes)}</p></div>` : '';
    return `<article class="profile"><header><div class="lg">${img(logoOf(b), b.name) || `<span class="missing">${esc(b.name)}</span>`}</div><div><h3>${esc(b.name)}</h3><p>${esc(b.why)}</p></div><span class="tag${b.role === 'direct' ? ' on' : ''}">${role(b)}</span></header>
<div class="body"><div class="shots">${img(ev(b, 'desktop.webp') || ev(b, 'blocked.webp'), b.name)}${img(ev(b, 'app-1.webp'), b.name, 'app')}</div>
<div class="read"><div class="chips">${['logo_type', 'hue', 'ground', 'headline_class', 'imagery', 'headline_promise'].map((d) => chip(b, d)).join('')}</div>${m ? strip(m) : ''}${
      h ? `<p class="note">${esc(String(h.family).split(',')[0].replace(/["']/g, ''))} ${esc(h.weight)} · ${Math.round(h.size_px)}px${h.text ? ` · “${esc(h.text.slice(0, 70))}”` : ''}</p>` : ''}${read}</div></div></article>`;
  }).join('')]);

  // 04 Logos
  const withLogo = panel.filter((b) => logoOf(b)), withIcon = panel.filter((b) => ev(b, 'app-icon.webp') || ev(b, 'icon.webp'));
  let w = written('logos');
  S.push(['logos', `${w.lead}<h3>${esc(t.original)}</h3>${wall(withLogo, 'g6', (b) => `<figure class="f"><div class="box">${img(logoOf(b), b.name)}</div>${cap(b, b.codes?.logo_type ? human(b.codes.logo_type) : null)}</figure>`)}
<h3>${esc(t.mono)}</h3>${wall(withLogo, 'g6 mono', (b) => `<figure class="f"><div class="box">${img(logoOf(b), b.name)}</div>${cap(b)}</figure>`)}
${withIcon.length ? `<h3>${esc(t.icons)}</h3>${wall(withIcon, 'g6', (b) => `<figure class="f"><div class="box icon">${img(ev(b, 'app-icon.webp') || ev(b, 'icon.webp'), b.name)}</div>${cap(b)}</figure>`)}` : ''}${w.rest}`]);

  // 05 Architecture
  w = written('architecture');
  S.push(['architecture', `${w.lead}${bars(['logo_type', 'symbol_nature', 'name_case', 'logo_form', 'logo_energy', 'logo_detail'])}${facets(['type', 'style'])}${w.rest}`]);

  // 06 Colour
  w = written('colour');
  const measured = panel.filter((b) => b.measures);
  const dots = measured.map((b) => ({ b, a: hueAngle(b.measures.accent) })).filter((x) => x.a != null);
  const spectrum = dots.length ? `<h3>${esc(t.spectrum)}</h3><div class="spectrum"><svg viewBox="0 0 1000 ${70 + 22 * dots.length}" role="img" aria-label="${esc(t.spectrum)}" font-family="-apple-system,system-ui,sans-serif">
<defs><linearGradient id="sp">${[0, 60, 120, 180, 240, 300, 360].map((d) => `<stop offset="${(d / 3.6).toFixed(1)}%" stop-color="hsl(${d} 85% 55%)"/>`).join('')}</linearGradient></defs>
<rect x="20" y="20" width="960" height="6" rx="3" fill="url(#sp)" opacity=".55"/>
${dots.sort((x, y) => x.a - y.a).map((d, i) => { const x = 20 + (d.a / 360) * 960, y = 58 + i * 22; return `<line x1="${x}" y1="26" x2="${x}" y2="${y}" stroke="#e5e5e7"/><circle cx="${x}" cy="${y}" r="6" fill="${esc(d.b.measures.accent)}" stroke="rgba(0,0,0,.15)"/><text x="${x + (x > 800 ? -12 : 12)}" y="${y + 4}" font-size="12" fill="#1d1d1f" text-anchor="${x > 800 ? 'end' : 'start'}">${esc(d.b.name)}</text>`; }).join('')}</svg></div>` : '';
  S.push(['colour', `${w.lead}${measured.length ? `<div>${measured.map((b) => `<div class="pal"><span>${esc(b.name)}</span>${strip(b.measures)}<span class="hx">${b.measures.accent ? `<i class="dot" style="background:${esc(b.measures.accent)}"></i>${esc(b.measures.accent)}` : ''}</span></div>`).join('')}</div>` : ''}${spectrum}${bars(['hue', 'saturation', 'ground', 'hue_count'])}${facets(['colour'])}${w.rest}`]);

  // 07 Typography
  w = written('typography');
  const spec = panel.filter((b) => ev(b, 'headline.webp'));
  S.push(['typography', `${w.lead}${spec.length ? `<h3>${esc(t.specimens)}</h3>${wall(spec, 'g3', (b) => { const h = b.measures?.headline || {}; return `<div class="specimen"><div class="im">${img(ev(b, 'headline.webp'), b.name)}</div><p>${esc(b.name)}<span>${esc(String(h.family || '').split(',')[0].replace(/["']/g, ''))} ${esc(h.weight ?? '')} · ${h.size_px ? Math.round(h.size_px) + 'px' : ''}${b.codes?.headline_class ? ' · ' + human(b.codes.headline_class) : ''}</span></p></div>`; })}` : ''}
${measured.length ? `<div class="scroll"><table><thead><tr><th>${esc(t.brand)}</th><th>${esc(t.headline)}</th><th>${esc(t.text)}</th></tr></thead><tbody>${measured.map((b) => { const h = b.measures.headline; return `<tr><td>${esc(b.name)}</td><td>${h ? `${esc(String(h.family).split(',')[0].replace(/["']/g, ''))} ${esc(h.weight)} · ${Math.round(h.size_px)}px` : ''}</td><td>${esc((b.measures.fonts || [])[0]?.family || '')}</td></tr>`; }).join('')}</tbody></table></div>` : ''}${bars(['headline_class', 'text_class', 'name_style'])}${w.rest}`]);

  // 08 Symbols
  w = written('symbols');
  S.push(['symbols', `${w.lead}${bars(['symbol_subject', 'symbol_nature'])}${facets(['subject', 'mood'])}${w.rest}`]);

  // 09 Visual language and touchpoints
  w = written('visual_language');
  const homes = panel.filter((b) => ev(b, 'desktop.webp')), stores = panel.filter((b) => ev(b, 'app-1.webp'));
  S.push(['visual_language', `${w.lead}<h3>${esc(t.homes)}</h3>${wall(homes, 'g3', (b) => `<figure class="f"><a href="${esc(ev(b, 'full.webp') || ev(b, 'desktop.webp'))}">${img(ev(b, 'desktop.webp'), b.name)}</a>${cap(b)}</figure>`)}
${stores.length ? `<h3>${esc(t.stores)}</h3><p class="note">${esc(t.storesNote)}</p>${wall(stores, 'g-app', (b) => `<figure class="f">${img(ev(b, 'app-1.webp'), b.name)}${cap(b)}</figure>`)}` : ''}${bars(['imagery', 'layout', 'headline_promise'])}${w.rest}`]);

  // 10 Maps
  const maps = audit.maps || (audit.map ? [audit.map] : []);
  S.push(['maps', maps.length ? `${maps.map((m) => `<div><div class="map">${mapSvg(m, byId, t, human)}</div>${m.reading ? `<div class="prose"><p>${esc(m.reading)}</p></div>` : ''}</div>`).join('')}<p class="note">${esc(t.mapCaveat)}</p>` : `<p class="note">${esc(f.insufficient ? t.insufficient : t.noSection)}</p>`]);

  // 11 Codes and conventions
  const item = (c) => `<div class="item"><h4>${label(c.dimension, c.value)}<span class="c">${c.count} ${esc(t.of)} ${c.base}</span></h4>${c.reason ? `<p>${esc(c.reason)}</p>` : ''}<p class="note">${esc(t.breakers)} : ${(c.breakers || []).map((b) => `${name(b.id)} (${human(b.value)}${b.established ? ', ' + esc(t.established) : ''})`).join(' · ') || esc(t.nobody)}</p>${thumbs(c.evidence, c.value)}</div>`;
  const groups = CLASS_ORDER.map((k) => [k, convs.filter((c) => c.class === k)]).filter(([, l]) => l.length);
  const unclassified = convs.filter((c) => !c.class);
  S.push(['codes', (f.insufficient ? `<p class="note">${esc(t.insufficient)}</p>` : '') + groups.map(([k, l]) => `<div class="group"><h3>${esc(t.classInfo[k][0])} <span class="tag">${l.length}</span></h3><p class="note">${esc(t.classInfo[k][1])}</p>${l.map(item).join('')}</div>`).join('')
    + (unclassified.length ? `<div class="group"><h3>${esc(t.unclassified)}</h3>${unclassified.map(item).join('')}</div>` : '') + `<p class="note">${esc(t.provenance)}</p>`]);

  // 12 Opportunities
  S.push(['opportunities', opps.length ? opps.map((o, i) => {
    const row = (k, v) => (v ? `<dt>${esc(k)}</dt><dd>${v}</dd>` : '');
    const ch = o.challenged ? `${esc(t[o.challenged.result] || o.challenged.result)}${o.challenged.note ? '. ' + esc(o.challenged.note) : ''} <span class="note">(${esc(t.searched)} : ${(o.challenged.searched || []).map(esc).join(' · ')})</span>` : '';
    return `<article class="opp"><div class="k">${String(i + 1).padStart(2, '0')}</div><h3>${esc(o.title)}</h3><p>${esc(o.rationale)}</p><dl>
${row(t.observation, o.observation && esc(o.observation))}${row(t.alignment, o.alignment && esc(o.alignment))}${row(t.benefit, o.benefit && esc(o.benefit))}
${row(t.okeep, (o.keep || []).map(human).join(' · '))}${row(t.obreak, (o.break || []).map(human).join(' · '))}${row(t.oimport, (o.import || []).map((x) => `${name(x.from)} : ${esc(x.what)}`).join(' · '))}
${row(t.risk, `${esc(t.riskLevels[o.risk] || o.risk)}${o.risk_note ? '. ' + esc(o.risk_note) : ''}`)}${row(t.toValidate, o.validate && esc(o.validate))}${row(t.challenged, ch)}</dl>${thumbs(o.evidence, o.title)}</article>`;
  }).join('') : `<p class="note">${esc(t.noSection)}</p>`]);

  // Method, limits, sources
  const lib = audit.library?.logosystem;
  S.push(['method', `<h3>${esc(t.quality)}</h3><ul class="list">${(audit.limits || []).map((l) => `<li>${esc(l)}</li>`).join('')}</ul><p class="note">${esc(t.provenance)}</p>
<h3>${esc(t.sources)}</h3><div class="scroll"><table><thead><tr><th>${esc(t.brand)}</th><th>${esc(t.source)}</th><th>${esc(t.seen)}</th></tr></thead><tbody>${panel.map((b) =>
    `<tr><td>${esc(b.name)}</td><td><a href="${safeUrl(b.url)}" rel="noreferrer">${esc(String(b.url).replace(/^https?:\/\//, '').slice(0, 70))}</a>${b.app_store?.url ? `<span class="sub"><a href="${safeUrl(b.app_store.url)}" rel="noreferrer">App Store · ${esc(b.app_store.name || '')}</a></span>` : ''}</td><td>${esc(audit.meta?.date || '')}</td></tr>`).join('')}${
    lib?.n ? `<tr><td>Logosystem</td><td><a href="${safeUrl(lib.url)}" rel="noreferrer">${esc(lib.industry)}</a> · n = ${lib.n}</td><td>${esc(lib.fetched)}</td></tr>` : ''}</tbody></table></div><p class="note">${esc(t.internal)}</p>`]);

  const num = (i) => String(i + 1).padStart(2, '0');
  const numbered = S.slice(0, 12), method = S[12];
  const title = `${esc(t.title)} · ${esc(audit.framing?.title || audit.framing?.product || '')}`;
  const html = `<header class="bar"><div class="wrap"><b>${esc(t.title)}</b><nav aria-label="${esc(t.contents)}">${numbered.map(([k], i) => `<a href="#${k}">${num(i)} ${esc(t.sec[k][0])}</a>`).join('')}</nav></div></header>
<main class="wrap">
<div class="cover"><p class="eyebrow">${esc(t.title)} · ${esc(audit.meta?.date || '')}</p><h1>${esc(audit.framing?.title || audit.framing?.product || '')}</h1><p class="deck">${esc(t.question)}</p>
<div class="meta"><div><span>${esc(t.market)}</span>${esc(audit.framing?.market || '')}</div><div><span>${esc(t.mode)}</span>${esc(t[audit.meta?.mode] || audit.meta?.mode || '')}</div><div><span>${esc(t.nBrands)}</span>${panel.length}</div><div><span>${esc(t.base)}</span>${f.base ?? 0} ${esc(t.baseUnit)}</div><div><span>${esc(t.date)}</span>${esc(audit.meta?.date || '')}</div></div>
<nav class="toc" aria-label="${esc(t.contents)}">${numbered.map(([k], i) => `<a href="#${k}"><span>${num(i)}</span>${esc(t.sec[k][0])}</a>`).join('')}</nav></div>
${numbered.map(([k, body], i) => `<section class="s" id="${k}"><aside class="rail"><div class="n">${num(i)}</div><h2>${esc(t.sec[k][0])}</h2><p>${esc(t.sec[k][1])}</p></aside><div class="col">${body}</div></section>`).join('\n')}
<section class="s" id="method"><aside class="rail"><div class="n">—</div><h2>${esc(t.sec.method[0])}</h2><p>${esc(t.sec.method[1])}</p></aside><div class="col">${method[1]}</div></section>
</main>`;
  return template.replace('<!--LANG-->', esc(localeOf(audit))).replace('<!--TITLE-->', () => title).replace('<!--BODY-->', () => html);
}

/** A two-axis map in black and white: role is carried by the shape of the mark. */
function mapSvg(map, byId, t, human) {
  const W = 1000, Hh = 600, pad = 72, sx = (v) => pad + ((v + 1) / 2) * (W - 2 * pad), sy = (v) => pad + ((v + 1) / 2) * (Hh - 2 * pad);
  const pole = (p) => (p === 'other' ? esc(t.other) : human(p));
  const quad = map.clusters.map((c) => {
    const [qx, qy] = c.quadrant, x = qx < 0 ? pad : W / 2, y = qy < 0 ? pad : Hh / 2, w = W / 2 - pad, h = Hh / 2 - pad;
    const tag = c.saturated ? t.saturated : c.ids.length === 0 ? t.empty : '';
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.saturated ? '#f5f5f7' : 'none'}"${c.ids.length === 0 ? ' stroke="#a1a1a6" stroke-dasharray="3 5"' : ''}/>${tag ? `<text x="${x + 14}" y="${y + 24}" font-size="11" fill="#6e6e73" letter-spacing=".06em" style="text-transform:uppercase">${esc(tag)}</text>` : ''}`;
  }).join('');
  // Labels never overlap: a label that would sit on another moves down until it is clear.
  const placed = [];
  const labelY = (x, y, w) => {
    let ly = y + 4.5;
    for (let n = 0; n < 12 && placed.some((r) => x + 12 < r.x2 && x + 12 + w > r.x1 && Math.abs(ly - r.y) < 15); n++) ly += 15;
    placed.push({ x1: x + 12, x2: x + 12 + w, y: ly });
    return ly;
  };
  const pts = [...map.points].sort((p, q) => p.y - q.y || p.x - q.x).map((p) => {
    const b = byId.get(p.id), x = sx(p.x), y = sy(p.y);
    const mark = p.role === 'direct' ? `<circle cx="${x}" cy="${y}" r="6" fill="#0a0a0a"/>`
      : p.role === 'self' ? `<path d="M${x} ${y - 9}L${x + 9} ${y + 7}H${x - 9}Z" fill="#0a0a0a"/>`
      : p.role === 'aspirational' ? `<rect x="${x - 5.5}" y="${y - 5.5}" width="11" height="11" fill="#fff" stroke="#0a0a0a" stroke-width="2"/>`
      : `<circle cx="${x}" cy="${y}" r="5.5" fill="#fff" stroke="#0a0a0a" stroke-width="2"/>`;
    const label = b?.name || p.id, ly = labelY(x, y, label.length * 7.2);
    return `${mark}${ly !== y + 4.5 ? `<line x1="${x + 6}" y1="${y}" x2="${x + 11}" y2="${ly - 4}" stroke="#a1a1a6"/>` : ''}<text x="${x + 12}" y="${ly}" font-size="13" fill="#1d1d1f">${esc(label)}</text>`;
  }).join('');
  const roles = [...new Set(map.points.map((p) => p.role))];
  const key = (r, i) => { const x = pad + i * 170, y = Hh - 18; const m = r === 'direct' ? `<circle cx="${x}" cy="${y - 4}" r="5" fill="#0a0a0a"/>` : r === 'aspirational' ? `<rect x="${x - 5}" y="${y - 9}" width="10" height="10" fill="#fff" stroke="#0a0a0a" stroke-width="2"/>` : r === 'self' ? `<path d="M${x} ${y - 11}L${x + 7} ${y + 1}H${x - 7}Z" fill="#0a0a0a"/>` : `<circle cx="${x}" cy="${y - 4}" r="5" fill="#fff" stroke="#0a0a0a" stroke-width="2"/>`; return `${m}<text x="${x + 12}" y="${y}" font-size="12" fill="#6e6e73">${esc(t.roles[r] || r)}</text>`; };
  return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(t.map)}" font-family="-apple-system,system-ui,sans-serif">
${quad}<line x1="${W / 2}" y1="${pad}" x2="${W / 2}" y2="${Hh - pad}" stroke="#0a0a0a"/><line x1="${pad}" y1="${Hh / 2}" x2="${W - pad}" y2="${Hh / 2}" stroke="#0a0a0a"/>
<text x="${pad}" y="${Hh / 2 - 12}" font-size="13" font-weight="600" fill="#0a0a0a">← ${pole(map.x.poles[0])}</text><text x="${W - pad}" y="${Hh / 2 - 12}" font-size="13" font-weight="600" fill="#0a0a0a" text-anchor="end">${pole(map.x.poles[1])} →</text>
<text x="${W / 2}" y="${pad - 28}" font-size="13" font-weight="600" fill="#0a0a0a" text-anchor="middle">↑ ${pole(map.y.poles[0])}</text><text x="${W / 2}" y="${Hh - pad + 28}" font-size="13" font-weight="600" fill="#0a0a0a" text-anchor="middle">↓ ${pole(map.y.poles[1])}</text>
<text x="${W - pad}" y="${pad - 28}" font-size="11" fill="#6e6e73" text-anchor="end">${esc(t.dims[map.x.dimension] || map.x.dimension)} ↔ · ${esc(t.dims[map.y.dimension] || map.y.dimension)} ↕</text>
${pts}${roles.map(key).join('')}</svg>`;
}

const MIME = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml' };
/** Width and height of a WebP or PNG from its header, or null. */
export function imageSize(buf) {
  if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const kind = buf.toString('ascii', 12, 16);
    if (kind === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (kind === 'VP8L') { const bits = buf.readUInt32LE(21); return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 }; }
    if (kind === 'VP8X') return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 };
  }
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  return null;
}

/**
 * Embed every evidence image, so the report travels as one file. Each image is stored once and
 * drawn wherever it is cited through an SVG <use>, so an image cited ten times weighs once.
 * Links to images are dropped.
 */
export function inlineImages(html, read) {
  const ids = new Map(), defs = [];
  const idOf = (p) => {
    if (!ids.has(p)) {
      const buf = read(p), size = imageSize(buf);
      const uri = `data:${MIME[p.split('.').pop().toLowerCase()] || 'application/octet-stream'};base64,${buf.toString('base64')}`;
      ids.set(p, { id: `i${ids.size}`, size, uri });
      if (size) defs.push(`<image id="i${ids.size - 1}" width="${size.w}" height="${size.h}" href="${uri}"/>`);
    }
    return ids.get(p);
  };
  let out = html.replace(/<a href="evidence\/[^"]+">([\s\S]*?)<\/a>/g, '$1');
  out = out.replace(/<img((?:\s+[a-z-]+="[^"]*")*)\s*>/g, (tag, attrs) => {
    const src = /\ssrc="(evidence\/[^"]+)"/.exec(attrs);
    if (!src) return tag;
    const im = idOf(src[1]);
    if (!im.size) return tag.replace(src[0], ` src="${im.uri}"`);
    const cls = /\sclass="([^"]*)"/.exec(attrs)?.[1] || '';
    const alt = /\salt="([^"]*)"/.exec(attrs)?.[1] || '';
    return `<svg class="ri${cls ? ' ' + cls : ''}" viewBox="0 0 ${im.size.w} ${im.size.h}" width="${im.size.w}" height="${im.size.h}" role="img" aria-label="${alt}"><use href="#${im.id}"/></svg>`;
  });
  // Rules written for <img> apply to the drawn images too.
  out = out.replace(/<style>([\s\S]*?)<\/style>/, (m, css) => `<style>${css.replace(/\bimg\b/g, ':is(img,svg.ri)')}\nsvg.ri{display:block;height:auto}\n</style>`);
  return out.replace(/<body>/, () => `<body><svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${defs.join('')}</defs></svg>`);
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
