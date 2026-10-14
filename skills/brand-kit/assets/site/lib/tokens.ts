// Reads ../tokens.json at build time. This is the only place the site gets a
// value from: no hex, size or duration is ever typed into a page or a
// component. Change tokens.json, rebuild, and every page follows.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { strings } from "./strings";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Tokens = Record<string, any>;

// tokens.json is written in English for agents. When the site speaks another
// language (meta.site_locale), site/locale.json carries the translated prose —
// the same shape as tokens.json, prose fields only — and is laid over it here.
// Values always come from tokens.json; agents never read the overlay.
function overlay(base: any, top: any): any {
  if (Array.isArray(base) && Array.isArray(top)) {
    return top.map((t, i) => (t && typeof t === "object" && base[i] && typeof base[i] === "object" ? overlay(base[i], t) : t));
  }
  if (base && top && typeof base === "object" && typeof top === "object" && !Array.isArray(top)) {
    const out = { ...base };
    for (const k of Object.keys(top)) out[k] = k in base ? overlay(base[k], top[k]) : top[k];
    return out;
  }
  return top === undefined ? base : top;
}

const source: Tokens = JSON.parse(readFileSync(join(process.cwd(), "..", "tokens.json"), "utf-8"));
const localeFile = join(process.cwd(), "locale.json");
export const tokens: Tokens = existsSync(localeFile) ? overlay(source, JSON.parse(readFileSync(localeFile, "utf-8"))) : source;

/** The site's own labels, in the site's language. */
export const t = strings(tokens.meta?.site_locale);

/** Walk a dotted path: dig("color.semantic.light.accent.base"). */
export function dig(path: string, from: any = tokens): any {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), from);
}

/** A leaf is either a raw value or { value, _use, _ref, ... }. */
export function val(node: any): string {
  if (node == null) return "";
  return typeof node === "object" && "value" in node ? String(node.value) : String(node);
}

/** Follow a "radius.md" style reference to its value. */
export function ref(r: any): string {
  if (typeof r !== "string") return val(r);
  const hit = dig(r);
  return hit !== undefined && typeof hit !== "object" ? String(hit) : val(hit ?? r);
}

/** Only the public keys of a token block: drops _rules, _note, role, etc. */
export function entries(block: any, skip: string[] = []): [string, any][] {
  if (!block || typeof block !== "object") return [];
  return Object.entries(block).filter(([k]) => !k.startsWith("_") && !skip.includes(k));
}

export function rules(block: any): string[] {
  if (!block) return [];
  const r = block._rules ?? block._rule;
  return Array.isArray(r) ? r : r ? [r] : [];
}

/* ---------- colour maths, for the contrast badges ---------- */

function lum(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a: string, b: string): number {
  if (!/^#/.test(a) || !/^#/.test(b)) return 0;
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return Math.round(((x + 0.05) / (y + 0.05)) * 10) / 10;
}

/** The ink that reads best on a given fill — for labels on swatches. */
export function onColour(fill: string): string {
  const light = val(dig("color.semantic.light.surface.page")) || "#FFFFFF";
  const dark = val(dig("color.semantic.light.ink.strong")) || "#000000";
  return contrast(fill, light) >= contrast(fill, dark) ? light : dark;
}

/* ---------- CSS variables ---------- */
// Mapping, as stated in BRAND.md: drop `semantic.<theme>.`, join with `-`,
// prefix `--`. color.semantic.light.ink.muted → --color-ink-muted.

function themeVars(theme: "light" | "dark"): string[] {
  const out: string[] = [];
  for (const [group, roles] of entries(dig(`color.semantic.${theme}`))) {
    for (const [role, node] of entries(roles)) out.push(`--color-${group}-${role}:${val(node)}`);
    // Shorthand: the base of a group is also the group itself, so BRAND.md can say --color-accent.
    if (roles && typeof roles === "object" && "base" in roles) out.push(`--color-${group}:${val(roles.base)}`);
  }
  return out;
}

/** Accent as text needs 4.5:1 on the page. A light accent (yellow, pink) is a fill, not a text colour. */
function accentText(theme: "light" | "dark"): string {
  const own = val(dig(`color.semantic.${theme}.accent.text`));
  if (own) return own;
  const base = val(dig(`color.semantic.${theme}.accent.base`));
  const page = val(dig(`color.semantic.${theme}.surface.page`));
  return contrast(base, page) >= 4.5 ? base : val(dig(`color.semantic.${theme}.ink.strong`)) || base;
}

function staticVars(): string[] {
  const out: string[] = [];
  for (const [k, f] of entries(dig("type.family"))) out.push(`--font-${k}:${f.stack}`);
  const steps = dig("type.scale.step") ?? {};
  for (const [k, v] of entries(steps)) out.push(`--step-${k}:${v}`);
  for (const [k, r] of entries(dig("type.role"))) {
    out.push(`--text-${k}:${steps[r.size] ?? r.size}`);
    out.push(`--leading-${k}:${r.leading}`);
    out.push(`--tracking-${k}:${r.tracking ?? 0}`);
    out.push(`--weight-${k}:${r.weight}`);
    out.push(`--family-${k}:var(--font-${r.family})`);
    if (r.style) out.push(`--style-${k}:${r.style}`);
  }
  for (const [k, v] of entries(dig("space"))) out.push(`--space-${k}:${v}`);
  for (const [k, v] of entries(dig("radius"))) out.push(`--radius-${k}:${v}`);
  for (const [k, v] of entries(dig("radius.role"))) out.push(`--radius-${k}:${ref(v)}`);
  for (const [k, v] of entries(dig("shadow"), ["dark_note"])) out.push(`--shadow-${k}:${v}`);
  for (const [k, v] of entries(dig("motion.duration"))) out.push(`--duration-${k}:${v}`);
  for (const [k, v] of entries(dig("motion.easing"))) out.push(`--ease-${k}:${v}`);
  for (const [k, v] of entries(dig("layout.container"))) out.push(`--container-${k}:${v}`);
  return out;
}

export function rootCss(): string {
  const light = [...staticVars(), ...themeVars("light"), `--color-accent-text:${accentText("light")}`].join(";");
  const dark = [...themeVars("dark"), `--color-accent-text:${accentText("dark")}`].join(";");
  return [
    `:root{${light}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${dark}}}`,
    `:root[data-theme="dark"]{${dark}}`,
  ].join("\n");
}

/** The paste-able block on the Toolkit page: light theme only, one per line. */
export function rootCssPretty(): string {
  return `:root {\n${[...staticVars(), ...themeVars("light")].map((l) => `  ${l.replace(":", ": ")};`).join("\n")}\n}`;
}
