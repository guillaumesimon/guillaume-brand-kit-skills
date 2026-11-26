// Colour parsing and classification. Works on the strings getComputedStyle returns.

const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
const alpha = (s) => (s == null ? 1 : s.endsWith('%') ? parseFloat(s) / 100 : parseFloat(s));

/** @returns {{r:number,g:number,b:number,a:number}|null} */
export function parseColor(css) {
  if (typeof css !== 'string') return null;
  const s = css.trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? +(n(6) / 255).toFixed(3) : 1 };
  }
  m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const [rgb, a] = m[1].split('/');
    const p = rgb.split(/[\s,]+/).filter(Boolean);
    if (p.length < 3) return null;
    return { r: clamp(parseFloat(p[0])), g: clamp(parseFloat(p[1])), b: clamp(parseFloat(p[2])), a: alpha(a ? a.trim() : p[3]) };
  }
  m = s.match(/^color\(srgb\s+([^)]+)\)$/);
  if (m) {
    const [rgb, a] = m[1].split('/');
    const p = rgb.trim().split(/\s+/).map(parseFloat);
    if (p.length < 3 || p.some(Number.isNaN)) return null;
    return { r: clamp(p[0] * 255), g: clamp(p[1] * 255), b: clamp(p[2] * 255), a: alpha(a?.trim()) };
  }
  return null;
}

export const toHex = ({ r, g, b }) => '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');

function hsl({ r, g, b }) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min, l = (max + min) / 2;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

/** Hue family from the audit vocabulary, a saturation band, and lightness 0..1. */
export function classify(rgb) {
  const { h, s, l } = hsl(rgb);
  const saturation = s < 0.35 ? 'muted' : s < 0.65 ? 'medium' : 'vivid';
  if (s < 0.12 || l < 0.08 || l > 0.95) return { hue: 'neutral', saturation: 'muted', lightness: l };
  let hue;
  if (h < 12 || h >= 345) hue = 'red';
  else if (h < 45) hue = l < 0.42 && s < 0.7 ? 'brown' : 'orange';
  else if (h < 70) hue = l < 0.35 ? 'brown' : 'yellow';
  else if (h < 160) hue = 'green';
  else if (h < 190) hue = 'teal';
  else if (h < 255) hue = 'blue';
  else if (h < 295) hue = 'purple';
  else hue = 'pink';
  return { hue, saturation, lightness: l };
}

/**
 * Weighted palette from colour samples.
 * @param {Array<{color:string, weight:number}>} samples
 * @returns {Array<{hex:string, share:number, hue:string, saturation:string}>}
 */
export function palette(samples, max = 6) {
  const groups = [];
  for (const { color, weight } of samples) {
    const c = parseColor(color);
    if (!c || c.a < 0.5 || !(weight > 0)) continue;
    const g = groups.find((x) => Math.hypot(x.c.r - c.r, x.c.g - c.g, x.c.b - c.b) < 12);
    if (g) { if (weight > g.top) { g.c = c; g.top = weight; } g.weight += weight; }
    else groups.push({ c, weight, top: weight });
  }
  const total = groups.reduce((n, g) => n + g.weight, 0);
  return groups.sort((a, b) => b.weight - a.weight).slice(0, max).map((g) => {
    const k = classify(g.c);
    return { hex: toHex(g.c), share: +(g.weight / total).toFixed(3), hue: k.hue, saturation: k.saturation };
  });
}
