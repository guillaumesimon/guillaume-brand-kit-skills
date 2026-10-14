// The building blocks every page is written with. All of them are available
// in MDX without an import (see mdx-components.tsx). Anything that shows a
// value reads it from tokens.json — pages pass prose, never values.

import Link from "next/link";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { dig, val, ref, entries, rules, contrast, onColour, rootCssPretty, t } from "@/lib/tokens";
import { pages, lookPages, type Provenance } from "@/lib/nav";
import { Swatch, RampStep, MotionLanes, GridToggle, CopyButton } from "./client";
import { Icon } from "./icon";

type Tone = "page" | "accent" | "inverse" | "sunken";
type Kids = { children?: React.ReactNode };

/** "assets/photography/01.webp" in tokens → "/brand/photography/01.webp" on the site. */
export function asset(src: string): string {
  return src.startsWith("assets/") ? `/brand/${src.slice(7)}` : src;
}

/** True when a token's file exists in ../assets — so a page can show a placeholder instead of a broken image. */
export function hasAsset(src?: string): boolean {
  return !!src && existsSync(join(process.cwd(), "..", src));
}

/* ================= page furniture ================= */

export function PageHero({ label, title, lead, tone = "page", provenance, check }: {
  label?: string; title: string; lead?: string; tone?: Tone; provenance?: Provenance;
  /** What would settle an assumed page. Shown on the page, not buried. */
  check?: string;
}) {
  const cls = tone === "page" ? "" : ` hero--${tone}`;
  return (
    <>
      <header className={`hero${cls}`}>
        <div className="wrap">
          {label && <span className="t-label">{label}</span>}
          <h1 className="t-display">{title}</h1>
          {lead && <p className="t-lead">{lead}</p>}
          {provenance && (
            <div className="hero-meta">
              <span className={`badge${provenance === "assumed" ? " badge--assumed" : ""}`}>{provenance}</span>
              <span className="badge">v{dig("meta.version")} · {dig("meta.updated")}</span>
            </div>
          )}
        </div>
      </header>
      {provenance === "assumed" && check && (
        <div className="wrap" style={{ paddingTop: "var(--space-6)" }}>
          <div className="callout">
            <p><strong>{t.assumedTitle}</strong> {t.assumedBody} {check}</p>
          </div>
        </div>
      )}
    </>
  );
}

export function Block({ id, title, label, lead, tone = "page", children }: Kids & {
  id: string; title: string; label?: string; lead?: React.ReactNode; tone?: Tone;
}) {
  return (
    <section id={id} data-section={title} className={`block${tone === "page" ? "" : ` band--${tone}`}`}>
      <div className="wrap">
        <div className="block-head">
          {label && <span className="t-label">{label}</span>}
          <h2 className="t-h1">{title}</h2>
          {lead && <p className="t-lead">{lead}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

export function Prose({ children }: Kids) {
  return <div className="prose">{children}</div>;
}

export function Statement({ children }: Kids) {
  return <p className="statement">{children}</p>;
}

export function Split({ children, even }: Kids & { even?: boolean }) {
  return <div className={`split${even ? " split--even" : ""}`}>{children}</div>;
}

export function Grid({ children, cols }: Kids & { cols?: 2 | 3 }) {
  return <div className={`grid${cols ? ` grid--${cols}` : ""}`}>{children}</div>;
}

export function Card({ title, label, children }: Kids & { title?: string; label?: string }) {
  return (
    <div className="card">
      {label && <p className="t-label" style={{ marginBottom: "var(--space-3)" }}>{label}</p>}
      {title && <h3 className="t-h3">{title}</h3>}
      {children}
    </div>
  );
}

export function Principles({ items, children }: Kids & { items?: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="principles">
      {items?.map((p) => (
        <li key={p.title}><div><h3 className="t-h2">{p.title}</h3><p>{p.body}</p></div></li>
      ))}
      {children}
    </ol>
  );
}

export function Principle({ title, children }: Kids & { title: string }) {
  return <li><div><h3 className="t-h2">{title}</h3><div className="prose">{children}</div></div></li>;
}

/** The `_rules` of any token block, as a numbered list. Rules live next to values. */
export function Rules({ path, start }: { path: string; start?: number }) {
  const list = rules(dig(path));
  if (!list.length) return null;
  return (
    <ol className="principles" start={start}>
      {list.map((r) => <li key={r}><p>{r}</p></li>)}
    </ol>
  );
}

/** Index cards linking to other pages of the kit. */
export function Tiles({ hrefs, accentFirst }: { hrefs?: string[]; accentFirst?: boolean }) {
  const list = hrefs ? pages.filter((p) => hrefs.includes(p.href)) : lookPages;
  return (
    <div className="grid">
      {list.map((p, i) => (
        <Link key={p.href} href={p.href} className={`tile${accentFirst && i === 0 ? " tile--accent" : ""}`}>
          <span className="t-label">{p.section}</span>
          <div>
            <h3 className="t-h2">{p.title}</h3>
            <p>{p.blurb}</p>
          </div>
          <span className="tile-arrow" aria-hidden="true">→</span>
        </Link>
      ))}
    </div>
  );
}

/* ================= do / don't ================= */

/**
 * One do or don't. `children` is the rendered example (HTML, an <img>, a
 * component). For a don't, write the caption as: Don't X — because Y.
 * Instead Z. A don't without a because is arbitrary and gets ignored.
 */
export function DoDont({ kind, caption, why, src, alt, children, bg }: Kids & {
  kind: "do" | "dont"; caption: string; why?: string; src?: string; alt?: string; bg?: string;
}) {
  return (
    <figure className={`dd dd--${kind}`}>
      <div className="dd-frame" style={bg ? { background: bg } : undefined}>
        {src ? <img src={asset(src)} alt={alt ?? caption} /> : children}
      </div>
      <figcaption>
        <span className="dd-tag">{kind === "do" ? t.do : t.dont}</span>
        <p>{caption}</p>
        {why && <p className="why">{why}</p>}
      </figcaption>
    </figure>
  );
}

export function DoDontGrid({ children }: Kids) {
  return <div className="dd-grid">{children}</div>;
}

/* ================= voice ================= */

/** "X, not Y" pairs from voice.attributes. */
export function IsNot() {
  const attrs: { is: string; not: string; means: string }[] = dig("voice.attributes") ?? [];
  return (
    <div className="isnot">
      {attrs.map((a) => (
        <div key={a.is}>
          <div className="is">{cap(a.is)}</div>
          <div className="not">{t.not} <s>{a.not}</s></div>
          <p>{a.means}</p>
        </div>
      ))}
    </div>
  );
}

/** Instead of… we say… — from voice.vocabulary.avoid, set big. */
export function InsteadOf({ limit = 8 }: { limit?: number }) {
  const avoid: Record<string, string> = dig("voice.vocabulary.avoid") ?? {};
  const rows = Object.entries(avoid).slice(0, limit);
  return (
    <div className="insteadof">
      <div className="insteadof-head t-label"><span>{t.insteadOf}</span><span>{t.weSay}</span></div>
      {rows.map(([bad, good]) => (
        <div key={bad} className="insteadof-row">
          <s>{bad}</s>
          <span>{good}</span>
        </div>
      ))}
    </div>
  );
}

export function Lexicon() {
  const use: string[] = dig("voice.vocabulary.use") ?? [];
  const avoid: Record<string, string> = dig("voice.vocabulary.avoid") ?? {};
  return (
    <div className="lexicon">
      <div>
        <p className="t-label">{t.wordsWeUse}</p>
        <ul>{use.map((w) => <li key={w}><span>{w}</span></li>)}</ul>
      </div>
      <div>
        <p className="t-label">{t.wordsWeNeverUse}</p>
        <ul>{Object.entries(avoid).map(([b, g]) => <li key={b}><s>{b}</s><span>{g}</span></li>)}</ul>
      </div>
    </div>
  );
}

export function Rewrite({ before, after }: { before: string; after: string }) {
  return (
    <div className="rewrite">
      <div className="before"><span className="t-label">{t.before}</span><p><s>{before}</s></p></div>
      <div className="after"><span className="t-label">{t.after}</span><p>{after}</p></div>
    </div>
  );
}

/** Person, tense, length, case, locale, punctuation — straight from voice.*. */
export function VoiceMechanics() {
  const keys: [string, string][] = [
    [t.person, "person"], [t.tense, "tense"], [t.length, "sentence_length"], [t.readingLevel, "reading_level"],
    [t.case, "capitalisation"], [t.punctuation, "punctuation"], [t.locale, "locale"],
  ];
  return (
    <dl className="recipe">
      {keys.filter(([, k]) => dig(`voice.${k}`)).map(([label, k]) => (
        <div key={k}><dt className="t-label">{label}</dt><dd>{dig(`voice.${k}`)}</dd></div>
      ))}
    </dl>
  );
}

/** One-liner, elevator, positioning, pillars, boilerplate, CTAs — all copyable. */
export function Messaging() {
  const m = dig("messaging") ?? {};
  const blocks: [string, string | undefined][] = [
    [t.oneLiner, m.one_liner], [t.elevator, m.elevator], [t.positioning, m.positioning], [t.boilerplate, m.boilerplate],
  ];
  return (
    <div className="stack">
      {blocks.filter(([, v]) => v).map(([k, v]) => (
        <div key={k}>
          <p className="t-label" style={{ marginBottom: "var(--space-3)" }}>{k}</p>
          <div className="copy"><p>{v}</p><CopyButton text={v!} label={t.copy} done={t.copied} /></div>
        </div>
      ))}
      {m.pillars && (
        <div>
          <p className="t-label" style={{ marginBottom: "var(--space-3)" }}>{t.pillars}</p>
          <div className="grid grid--3">
            {m.pillars.map((p: { name: string; proof: string }) => (
              <div key={p.name} className="card"><h3 className="t-h3">{p.name}</h3><p>{p.proof}</p></div>
            ))}
          </div>
        </div>
      )}
      {m.cta && (
        <div className="grid grid--3">
          <div className="card"><p className="t-label">{t.primaryCta}</p><p className="t-h3">{m.cta.primary}</p></div>
          <div className="card"><p className="t-label">{t.secondaryCta}</p><p className="t-h3">{m.cta.secondary}</p></div>
          <div className="card"><p className="t-label">{t.never}</p>{(m.cta.never ?? []).map((n: string) => <p key={n}><s>{n}</s></p>)}</div>
        </div>
      )}
    </div>
  );
}

/* ================= colour ================= */

export function Swatches({ theme = "light", groups }: { theme?: "light" | "dark"; groups?: string[] }) {
  const sem = dig(`color.semantic.${theme}`) ?? {};
  const page = val(dig(`color.semantic.${theme}.surface.page`));
  const list = entries(sem).filter(([g]) => !groups || groups.includes(g));
  return (
    <div className="stack">
      {list.map(([group, roles]) => (
        <div key={group}>
          <p className="t-label" style={{ marginBottom: "var(--space-3)" }}>{group}</p>
          <div className="swatches">
            {entries(roles).map(([role, node]) => {
              const v = val(node);
              const isText = group === "ink" || group === "state";
              return (
                <Swatch key={role} name={role} value={v} token={`--color-${group}-${role}`} fg={onColour(v)} copied={t.copied}
                  ratio={isText ? contrast(v, page) : contrast(onColour(v), v)} />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Ramps() {
  return (
    <div className="ramps">
      {entries(dig("color.palette")).map(([name, steps]) => (
        <div key={name} className="ramp">
          <span className="t-label">{name}</span>
          <div className="ramp-steps">
            {entries(steps).map(([k, v]) => <RampStep key={k} value={val(v)} label={k} fg={onColour(val(v))} copied={t.copied} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The share each role takes of a typical surface, from color._ratio. */
export function Dominance() {
  const raw: string = dig("color._ratio") ?? "";
  const parts = raw.split(",").map((s) => s.trim().split(":")).filter((p) => p.length === 2);
  if (!parts.length) return null;
  return (
    <div className="dominance" role="img" aria-label={`Colour ratio: ${raw}`}>
      {parts.map(([path, share]) => {
        const v = val(dig(`color.semantic.light.${path}`));
        return (
          <div key={path} style={{ flex: Number(share), background: v, color: onColour(v) }}>
            {path} {share}%
          </div>
        );
      })}
    </div>
  );
}

/** Light and dark side by side, whatever theme the page is in. */
export function ThemePair() {
  const c = (th: string, p: string) => val(dig(`color.semantic.${th}.${p}`));
  return (
    <div className="theme-pair">
      {["light", "dark"].map((th) => (
        <div key={th} style={{ background: c(th, "surface.page"), color: c(th, "ink.base"), boxShadow: `inset 0 0 0 1px ${c(th, "border.hairline")}` }}>
          <p className="t-label" style={{ color: c(th, "ink.muted") }}>{th}</p>
          <p className="t-h2" style={{ color: c(th, "ink.strong"), margin: "var(--space-3) 0" }}>{dig("type.role.h1._sample") ?? dig("meta.tagline")}</p>
          <p style={{ margin: "0 0 var(--space-5)" }}>{dig("type.role.body._sample")}</p>
          <span className="btn" style={{ background: c(th, "accent.base"), color: c(th, "accent.on") }}>{dig("messaging.cta.primary") ?? "Continue"}</span>
        </div>
      ))}
    </div>
  );
}

/* ================= typography ================= */

export function TypeFamilies() {
  return (
    <div className="grid grid--2">
      {entries(dig("type.family")).map(([k, f]) => (
        <div key={k} className="family">
          <span className="t-label">{k}</span>
          <div className="family-glyphs" style={{ fontFamily: f.stack }}>Aa</div>
          <div>
            <p className="t-h3" style={{ fontFamily: f.stack }}>{f.stack.split(",")[0].replace(/['"]/g, "")}</p>
            <p className="t-caption">{[f.source, f.license].filter(Boolean).join(" · ")}</p>
          </div>
          {f._use && <p style={{ margin: 0 }}>{f._use}</p>}
        </div>
      ))}
    </div>
  );
}

/** Every type role, at real size, with its numbers beside it. */
export function TypeRoles({ only }: { only?: string[] }) {
  const steps = dig("type.scale.step") ?? {};
  return (
    <div>
      {entries(dig("type.role")).filter(([k]) => !only || only.includes(k)).map(([k, r]) => (
        <div key={k} className="specimen">
          <div className="specimen-meta">
            <b>{k}</b>
            {r.family} · {steps[r.size] ?? r.size}<br />
            weight {r.weight} · leading {r.leading}<br />
            tracking {r.tracking ?? 0}{r.case ? ` · ${r.case}` : ""}
            {r._use && <><br /><span style={{ fontFamily: "var(--font-text)" }}>{r._use}</span></>}
          </div>
          <div className="specimen-sample" style={{
            fontFamily: `var(--font-${r.family})`, fontSize: steps[r.size] ?? r.size, fontWeight: r.weight,
            lineHeight: r.leading, letterSpacing: r.tracking, textTransform: r.case, fontStyle: r.style,
            fontVariantNumeric: k === "metric" ? "tabular-nums" : undefined,
          }}>
            {r._sample ?? dig("meta.tagline")}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TypePlatforms() {
  const p = dig("type.platform");
  if (!p) return null;
  const rows = entries(p, ["pattern"]);
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>{t.surface}</th><th>{t.rule}</th></tr></thead>
        <tbody>{rows.map(([k, v]) => <tr key={k}><td><code>{k}</code></td><td>{String(v)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

/* ================= layout, space, shape ================= */

export function SpaceBars() {
  return (
    <div className="bars">
      {entries(dig("space"), ["role"]).map(([k, v]) => (
        <div key={k} className="bar"><span>--space-{k}</span><span>{v}</span><i style={{ width: v }} /></div>
      ))}
    </div>
  );
}

export function Radii() {
  return (
    <div className="radii">
      {entries(dig("radius"), ["role"]).map(([k, v]) => (
        <div key={k} style={{ borderRadius: v === "999px" ? "999px 999px 999px 999px / 999px" : v }}>{k} · {v}</div>
      ))}
    </div>
  );
}

export function Shadows() {
  const phil = dig("shadow._philosophy");
  return (
    <div className="stack">
      {phil && <p className="t-lead" style={{ maxWidth: "60ch", margin: 0 }}>{phil}</p>}
      <div className="grid grid--3">
        {entries(dig("shadow"), ["role", "dark_note"]).map(([k, v]) => (
          <div key={k} className="card" style={{ boxShadow: v, border: v === "none" ? undefined : 0 }}>
            <p className="t-label">shadow.{k}</p><p className="t-caption">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The grid, with an Example / Grid setup toggle over a real composition. */
export function LayoutGrid({ children }: Kids) {
  const g = dig("layout.grid") ?? {};
  const gutter = ref(g.gutter) || "1.5rem";
  const margin = ref(g.margin?.desktop ?? g.margin) || "3rem";
  return (
    <GridToggle cols={g.columns ?? 12} gutter={gutter} margin={margin} labels={[t.example, t.gridSetup]}>
      {children ?? <div className="gridviz" style={{ ["--cols" as string]: g.columns ?? 12, ["--gutter" as string]: gutter, ["--margin" as string]: margin }}>
        {Array.from({ length: g.columns ?? 12 }, (_, i) => <span key={i} />)}
      </div>}
    </GridToggle>
  );
}

export function LayoutSpec() {
  const l = dig("layout") ?? {};
  const rows: [string, string][] = [];
  if (l.grid) rows.push([t.columns, `${l.grid.columns}`], [t.gutter, `${l.grid.gutter} · ${ref(l.grid.gutter)}`],
    [t.margin, typeof l.grid.margin === "object" ? entries(l.grid.margin).map(([k, v]) => `${k} ${ref(v)}`).join(" · ") : ref(l.grid.margin)]);
  for (const [k, v] of entries(l.container)) rows.push([`${t.container} · ${k}`, String(v)]);
  for (const [k, v] of entries(l.breakpoint)) rows.push([`${t.breakpoint} · ${k}`, String(v)]);
  return (
    <div className="table-wrap">
      <table><tbody>{rows.map(([k, v]) => <tr key={k}><td>{k}</td><td><code>{v}</code></td></tr>)}</tbody></table>
    </div>
  );
}

/* ================= imagery ================= */

type Sample = { src?: string; caption?: string; ratio?: string; size?: "wide" | "full"; prompt?: string };

function Plate({ s }: { s: Sample }) {
  return hasAsset(s.src)
    ? <img src={asset(s.src!)} alt={s.caption ?? ""} loading="lazy" />
    : <div className="placeholder" style={{ aspectRatio: (s.ratio ?? "4/5").replace(":", "/") }}>{t.imageToCome}</div>;
}

/** A wall of images from a token list (imagery.photography.samples by default). */
export function ImageWall({ path = "imagery.photography.samples" }: { path?: string }) {
  const list: Sample[] = dig(path) ?? [];
  if (!list.length) return null;
  return (
    <div className="photo-wall">
      {list.map((s, i) => (
        <figure key={i} className={s.size} style={{ ["--ratio" as string]: (s.ratio ?? "4/5").replace(":", "/") }}>
          <Plate s={s} />
          {s.caption && <figcaption className="t-caption">{s.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

/** Do/don't pairs from a token list of { src, kind, caption, why }. */
export function ImageRules({ path }: { path: string }) {
  const list: (Sample & { kind: "do" | "dont"; why?: string })[] = dig(path) ?? [];
  if (!list.length) return null;
  return (
    <DoDontGrid>
      {list.map((s, i) => (
        <DoDont key={i} kind={s.kind} caption={s.caption ?? ""} why={s.why}>
          <Plate s={s} />
        </DoDont>
      ))}
    </DoDontGrid>
  );
}

/** Any { key: rule } object as a ruled definition list: the photography recipe, the icon spec. */
export function Recipe({ path, labels, keys }: { path: string; labels?: Record<string, string>; keys?: string[] }) {
  const r = dig(path) ?? {};
  return (
    <dl className="recipe">
      {entries(r).filter(([k]) => !keys || keys.includes(k)).map(([k, v]) => (
        <div key={k}>
          <dt className="t-label">{labels?.[k] ?? k.replace(/_/g, " ")}</dt>
          <dd>{Array.isArray(v) ? v.join(" · ") : typeof v === "object" ? entries(v).map(([a, b]) => `${a} ${b}`).join(" · ") : String(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A list from tokens, as plain items: imagery.photography.never, etc. */
export function List({ path, strike }: { path: string; strike?: boolean }) {
  const l: string[] = dig(path) ?? [];
  return (
    <ul className="plainlist">
      {l.map((x) => <li key={x}>{strike ? <s>{x}</s> : x}</li>)}
    </ul>
  );
}

/** The named photo types, each with its job (reportage, portrait, still life…). */
export function PhotoTypes() {
  const types: (Sample & { name: string; job: string })[] = dig("imagery.photography.types") ?? [];
  return (
    <div className="grid grid--3">
      {types.map((pt) => (
        <figure key={pt.name} className="type-card">
          <div className="type-card-img" style={{ aspectRatio: (pt.ratio ?? "4/5").replace(":", "/") }}><Plate s={{ ...pt, caption: pt.name }} /></div>
          <figcaption><h3 className="t-h3">{pt.name}</h3><p>{pt.job}</p></figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ================= icons ================= */

export function IconWall() {
  const set: string[] = dig("icon.set") ?? [];
  const stroke = Number(dig("icon.stroke_width") ?? 1.5);
  const meta: Record<string, string> = dig("icon.metaphors") ?? {};
  const byIcon = Object.fromEntries(Object.entries(meta).map(([m, i]) => [i, m]));
  return (
    <div className="icon-wall">
      {set.map((n) => (
        <div key={n}>
          <Icon name={n} size={28} stroke={stroke} />
          <span>{byIcon[n] ? `${byIcon[n]}` : n}</span>
        </div>
      ))}
    </div>
  );
}

export function IconSizes() {
  const sizes: Record<string, string> = dig("icon.size") ?? {};
  const set: string[] = dig("icon.set") ?? [];
  const stroke = Number(dig("icon.stroke_width") ?? 1.5);
  const sample = set.slice(0, 3);
  return (
    <div className="icon-sizes">
      {Object.entries(sizes).map(([k, v]) => (
        <div key={k}>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            {sample.map((n) => <Icon key={n} name={n} size={parseInt(v)} stroke={stroke} />)}
          </div>
          <span className="t-label">{k} · {v}</span>
        </div>
      ))}
    </div>
  );
}

/** The construction: grid, live area, keylines, stroke and corner, drawn at 10×. */
export function IconAnatomy() {
  const g = Number(dig("icon.grid") ?? 24);
  const live = Number(dig("icon.live_area") ?? g - 4);
  const stroke = Number(dig("icon.stroke_width") ?? 1.5);
  const pad = (g - live) / 2;
  const set: string[] = dig("icon.set") ?? [];
  const accent = "var(--color-accent-base)";
  return (
    <div className="split split--even">
      <div className="anatomy">
        <svg viewBox={`0 0 ${g} ${g}`} role="img" aria-label={`${g}px grid, ${live}px live area, ${stroke}px stroke`}>
          {Array.from({ length: g + 1 }, (_, i) => (
            <g key={i}>
              <line x1={i} y1={0} x2={i} y2={g} stroke="var(--color-border-hairline)" strokeWidth={0.04} />
              <line x1={0} y1={i} x2={g} y2={i} stroke="var(--color-border-hairline)" strokeWidth={0.04} />
            </g>
          ))}
          <rect x={pad} y={pad} width={live} height={live} fill="none" stroke={accent} strokeWidth={0.08} strokeDasharray="0.3 0.3" />
          <circle cx={g / 2} cy={g / 2} r={live / 2} fill="none" stroke={accent} strokeWidth={0.06} opacity={0.6} />
          <rect x={pad + 1} y={pad + 1} width={live - 2} height={live - 2} rx={dig("icon.corner_radius") ?? 2} fill="none" stroke={accent} strokeWidth={0.06} opacity={0.6} />
        </svg>
        <div className="anatomy-icon"><Icon name={set[0] ?? "circle"} size={240} stroke={stroke} /></div>
      </div>
      <Recipe path="icon" keys={["library", "style", "grid", "live_area", "stroke_width", "corner_radius", "caps", "joins", "perspective"]}
        labels={{ stroke_width: "stroke", live_area: "live area", corner_radius: "corner radius" }} />
    </div>
  );
}

/* ================= motion ================= */

export function Motion() {
  const d = dig("motion.duration") ?? {};
  const e = dig("motion.easing") ?? {};
  const roles: Record<string, string> = dig("motion.role") ?? {};
  const lanes = Object.entries(roles).map(([name, spec]) => {
    const [dur, ease] = spec.split(" ");
    return { name, duration: d[dur] ?? "240ms", easing: e[ease] ?? "ease", note: `${dur} · ${ease}` };
  });
  if (!lanes.length) {
    for (const [k, v] of Object.entries(e)) lanes.push({ name: k, duration: d.base ?? "240ms", easing: String(v), note: "" });
  }
  return <MotionLanes lanes={lanes} />;
}

/* ================= logo ================= */

export function Logo({ which = "primary", tone = "page", height = 64 }: { which?: string; tone?: Tone; height?: number }) {
  const src = dig(`logo.${which}`);
  const bg = tone === "accent" ? "var(--color-accent-base)" : tone === "inverse" ? "var(--color-surface-inverse)" : tone === "sunken" ? "var(--color-surface-sunken)" : "var(--color-surface-raised)";
  return (
    <div className="logo-plate" style={{ background: bg }}>
      {hasAsset(src) ? <img src={asset(src)} alt={`${dig("meta.name")} ${which}`} style={{ height }} />
        : <span className="logo-fallback" style={{ color: tone === "accent" ? "var(--color-accent-on)" : tone === "inverse" ? "var(--color-ink-inverse)" : "var(--color-ink-strong)" }}>{dig("meta.name")}</span>}
    </div>
  );
}

export function ClearSpace() {
  return (
    <div className="clearspace">
      <div className="clearspace-box"><Logo which="primary" height={56} /></div>
      <p className="t-caption">{dig("logo.clearspace")} · minimum {entries(dig("logo.min_width_px")).map(([k, v]) => `${k} ${v}px`).join(", ")}</p>
    </div>
  );
}

/* ================= tokens for developers ================= */

export function TokenTable({ path, prefix }: { path: string; prefix: string }) {
  const rows = entries(dig(path), ["role"]);
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>{t.variable}</th><th>{t.value}</th><th>{t.use}</th></tr></thead>
        <tbody>
          {rows.flatMap(([k, node]) =>
            node && typeof node === "object" && !("value" in node)
              ? entries(node).map(([k2, n2]) => (
                  <tr key={`${k}-${k2}`}><td><code>{`--${prefix}-${k}-${k2}`}</code></td><td><code>{val(n2)}</code></td><td>{n2?._use ?? ""}</td></tr>
                ))
              : [<tr key={k}><td><code>{`--${prefix}-${k}`}</code></td><td><code>{val(node)}</code></td><td>{node?._use ?? ""}</td></tr>],
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Code({ text }: { text: string }) {
  return (
    <div className="codeblock">
      <pre><code>{text}</code></pre>
      <CopyButton text={text} label={t.copy} done={t.copied} />
    </div>
  );
}

/* ================= honesty ================= */

export function Limits() {
  const p = dig("provenance") ?? {};
  const assumed = Object.entries(p).filter(([k, v]) => !k.startsWith("_") && v === "assumed").map(([k]) => k);
  return (
    <div className="grid grid--3">
      <div className="card">
        <p className="t-label">{t.breaksIf}</p>
        <ul className="plainlist">{(p.breaks_if ?? []).map((x: string) => <li key={x}>{x}</li>)}</ul>
      </div>
      <div className="card">
        <p className="t-label">{t.checkThisWeek}</p>
        <ul className="plainlist">{(p.validate ?? []).map((x: string) => <li key={x}>{x}</li>)}</ul>
      </div>
      <div className="card">
        <p className="t-label">{t.stillAssumed} · {assumed.length}</p>
        <ul className="plainlist">{assumed.map((x) => <li key={x}><code>{x}</code></li>)}</ul>
        {p.expires && <p className="t-caption" style={{ marginTop: "var(--space-4)" }}>{p.expires}</p>}
      </div>
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ================= generic token readers ================= */

/** A token list of { name, rule } as numbered principles. */
export function TokenPrinciples({ path }: { path: string }) {
  const list: { name: string; rule: string }[] = dig(path) ?? [];
  return <Principles items={list.map((p) => ({ title: p.name, body: p.rule }))} />;
}

/** A token list of objects as a table: <Table path="art_direction.hierarchy" cols="element:Element,job:Job" />. */
export function Table({ path, cols }: { path: string; cols: string }) {
  const list: Record<string, string>[] = dig(path) ?? [];
  const c = cols.split(",").map((x) => x.split(":"));
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{c.map(([k, l]) => <th key={k}>{l ?? k}</th>)}</tr></thead>
        <tbody>{list.map((row, i) => <tr key={i}>{c.map(([k]) => <td key={k}>{row[k]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/** layout.formats as true-ratio frames, each with its rule. */
export function Formats() {
  const list: { name: string; ratio: string; rule: string }[] = dig("layout.formats") ?? [];
  return (
    <div className="formats">
      {list.map((f) => (
        <figure key={f.name}>
          <div className="format-frame" style={{ aspectRatio: f.ratio.replace(":", "/") }}>
            <span className="t-label">{f.ratio}</span>
          </div>
          <figcaption><h3 className="t-h3">{f.name}</h3><p>{f.rule}</p></figcaption>
        </figure>
      ))}
    </div>
  );
}

/** A single value from tokens, inline: <T path="art_direction.concept" />. */
export function T({ path }: { path: string }) {
  const v = dig(path);
  return <>{Array.isArray(v) ? v.join(", ") : val(v)}</>;
}

/** The :root block, ready to paste. */
export function RootCss() {
  return <Code text={rootCssPretty()} />;
}
