"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type L = { href: string; title: string };

export function Header({ name, links, labels }: { name: string; links: L[]; labels: { brand: string; menu: string; close: string; theme: string } }) {
  const path = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    try {
      const t = localStorage.getItem("theme");
      if (t === "light" || t === "dark") apply(t);
    } catch {}
  }, []);

  function apply(t: "light" | "dark") {
    document.documentElement.dataset.theme = t;
    setTheme(t);
    try { localStorage.setItem("theme", t); } catch {}
  }
  function toggle() {
    const dark = theme ? theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    apply(dark ? "light" : "dark");
  }

  return (
    <header className="site-head">
      <div className="wrap head-row">
        <Link href="/" className="wordmark" aria-label={name}>
          {name}<span>{labels.brand}</span>
        </Link>
        <button className="menu-btn" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>
          {open ? labels.close : labels.menu}
        </button>
        <nav id="site-nav" className={open ? "is-open" : ""} aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path.startsWith(l.href) ? "page" : undefined}>
              {l.title}
            </Link>
          ))}
          <button className="theme-btn" onClick={toggle} aria-label={labels.theme}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
