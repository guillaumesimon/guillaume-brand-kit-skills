"use client";
// The few things that need the browser: the in-page index, copy buttons,
// the previous/next links, the motion lanes and the grid overlay toggle.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { pages } from "@/lib/nav";

/** Reads every [data-section] block on the page and tracks the one in view. */
export function SectionBar({ label = "On this page" }: { label?: string }) {
  const [items, setItems] = useState<{ id: string; title: string }[]>([]);
  const [on, setOn] = useState("");
  const path = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    setItems(els.map((el) => ({ id: el.id, title: el.dataset.section || el.id })));
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setOn(e.target.id)),
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);

  if (items.length < 2) return null;
  return (
    <nav className="sectionbar" aria-label={label}>
      <ol>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className={on === i.id ? "on" : undefined}>{i.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Pager({ labels = ["Previous", "Next"] }: { labels?: [string, string] }) {
  const path = usePathname() ?? "/";
  const i = pages.findIndex((p) => p.href === path);
  if (i < 0) return null;
  const prev = pages[i - 1];
  const next = pages[i + 1];
  return (
    <div className="wrap">
      <nav className="pager" aria-label="Previous and next">
        {prev && (
          <Link href={prev.href}><span className="t-label">{labels[0]}</span><span className="t-h3">{prev.title}</span></Link>
        )}
        {next && (
          <Link href={next.href} className="next"><span className="t-label">{labels[1]}</span><span className="t-h3">{next.title}</span></Link>
        )}
      </nav>
    </div>
  );
}

function useCopy(): [boolean, (text: string) => void] {
  const [done, setDone] = useState(false);
  return [
    done,
    (text: string) => {
      navigator.clipboard?.writeText(text).then(() => {
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      });
    },
  ];
}

export function CopyButton({ text, label = "Copy", done: doneLabel = "Copied" }: { text: string; label?: string; done?: string }) {
  const [done, copy] = useCopy();
  return <button type="button" onClick={() => copy(text)}>{done ? doneLabel : label}</button>;
}

/** A swatch is a button: click copies the hex. */
export function Swatch({ name, value, token, fg, ratio, big, copied = "Copied" }: {
  name: string; value: string; token: string; fg: string; ratio?: number; big?: boolean; copied?: string;
}) {
  const [done, copy] = useCopy();
  return (
    <button type="button" className={`swatch${big ? " swatch--big" : ""}`} style={{ background: value, color: fg }}
      onClick={() => copy(value)} title={`Copy ${value}`}>
      {ratio ? <em className="aa">{ratio}:1{ratio >= 4.5 ? " AA" : ratio >= 3 ? " AA large" : ""}</em> : <i />}
      <div>
        <b>{done ? copied : name}</b>
        <span>{value}</span>
        <span>{token}</span>
      </div>
    </button>
  );
}

export function RampStep({ value, label, fg, copied = "Copied" }: { value: string; label: string; fg: string; copied?: string }) {
  const [done, copy] = useCopy();
  return (
    <button type="button" style={{ background: value, color: fg }} onClick={() => copy(value)} title={`Copy ${value}`}>
      {done ? copied : label}
    </button>
  );
}

/** Hover or tap a lane to watch the easing. */
export function MotionLanes({ lanes }: { lanes: { name: string; duration: string; easing: string; note?: string }[] }) {
  const [go, setGo] = useState<string | null>(null);
  return (
    <div className="lanes">
      {lanes.map((l) => (
        <div key={l.name} className={`lane${go === l.name ? " go" : ""}`} onClick={() => setGo(go === l.name ? null : l.name)}>
          <i style={{ transition: `left ${l.duration} ${l.easing}` }} />
          <span>{l.name} · {l.duration}{l.note ? ` · ${l.note}` : ""}</span>
        </div>
      ))}
    </div>
  );
}

/** Example / Grid setup: the same artwork with and without its grid. */
export function GridToggle({ children, cols = 12, gutter, margin, labels = ["Example", "Grid setup"] }: {
  children: React.ReactNode; cols?: number; gutter: string; margin: string; labels?: [string, string];
}) {
  const [grid, setGrid] = useState(false);
  return (
    <div>
      <div className="toggle" role="tablist">
        <button role="tab" aria-selected={!grid} onClick={() => setGrid(false)}>{labels[0]}</button>
        <button role="tab" aria-selected={grid} onClick={() => setGrid(true)}>{labels[1]}</button>
      </div>
      <div className="gridtoggle">
        {children}
        {grid && (
          <div className="gridtoggle-overlay" style={{ gap: gutter, paddingInline: margin, gridTemplateColumns: `repeat(${cols}, 1fr)` }} aria-hidden="true">
            {Array.from({ length: cols }, (_, i) => <span key={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
