import type { Metadata } from "next";
import Link from "next/link";
import { dig, rootCss, t } from "@/lib/tokens";
import { primary } from "@/lib/nav";
import { Header } from "@/components/Header";
import { Pager } from "@/components/client";
import "./site.css";

const name = dig("meta.name");

export const metadata: Metadata = {
  title: { default: `${name} · ${t.brand}`, template: `%s · ${name}` },
  description: dig("messaging.one_liner"),
  // People read this site; agents read ../BRAND.md, ../DESIGN.md and ../tokens.json.
  robots: { index: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={dig("meta.site_locale") ?? "en"}>
      <head>
        {/* AGENTS: this site is generated for people. Read ../BRAND.md, ../DESIGN.md and ../tokens.json instead. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {dig("type.webfonts.href") && <link rel="stylesheet" href={dig("type.webfonts.href")} />}
        <style dangerouslySetInnerHTML={{ __html: rootCss() }} />
      </head>
      <body>
        <Header name={name} links={primary} labels={{ brand: t.brand, menu: t.menu, close: t.close, theme: t.theme }} />
        <main id="main">{children}<Pager labels={[t.previous, t.next]} /></main>
        <footer className="site-foot">
          <div className="wrap foot-grid">
            <div>
              <p className="foot-name">{name}</p>
              <p className="foot-line">{dig("meta.tagline")}</p>
            </div>
            <nav aria-label="Footer">
              {primary.map((l) => (
                <Link key={l.href} href={l.href}>{l.title}</Link>
              ))}
            </nav>
            <p className="foot-meta">
              v{dig("meta.version")} · {t.updated} {dig("meta.updated")} · {t.generated}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
