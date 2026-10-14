// The site map. One list drives the header, the "How we look" index, the
// home cards and the previous/next links at the foot of every page.
// To drop a page the session could not fill, delete its line here and its
// folder in app/ — an empty page is worse than a missing one.

export type Provenance = "stated" | "inferred" | "assumed";

export type Page = {
  href: string;
  title: string;
  /** One line, shown on index cards. Says what the page settles. */
  blurb: string;
  /** The group label shown on index tiles. Write it in the site's language. */
  section: string;
};

export const pages: Page[] = [
  { href: "/our-brand/", title: "Our brand", section: "Our brand",
    blurb: "Why we exist, who we serve, and the one idea everything else follows." },
  { href: "/how-we-speak/", title: "How we speak", section: "How we speak",
    blurb: "Voice, the words we use and refuse, and the lines we repeat." },
  { href: "/how-we-look/", title: "How we look", section: "How we look",
    blurb: "The visual system, from the organising principle to motion." },
  { href: "/how-we-look/logo/", title: "Logo", section: "How we look",
    blurb: "The lockups, the space around them, and the six ways to break them." },
  { href: "/how-we-look/art-direction/", title: "Art direction", section: "How we look",
    blurb: "How every element is combined, so the work is recognisable without the logo." },
  { href: "/how-we-look/colour/", title: "Colour", section: "How we look",
    blurb: "Roles, ratios and every value, light and dark." },
  { href: "/how-we-look/typography/", title: "Typography", section: "How we look",
    blurb: "The faces, the scale, and where each one is allowed." },
  { href: "/how-we-look/layout/", title: "Layout", section: "How we look",
    blurb: "Grid, spacing, shape and density." },
  { href: "/how-we-look/photography/", title: "Photography", section: "How we look",
    blurb: "What we shoot, how it is lit and graded, and what we never shoot." },
  { href: "/how-we-look/iconography/", title: "Iconography", section: "How we look",
    blurb: "One set, one stroke, one grid." },
  { href: "/how-we-look/illustration/", title: "Illustration", section: "How we look",
    blurb: "Whether we draw, in which language, and who draws the next one." },
  { href: "/how-we-look/motion/", title: "Motion", section: "How we look",
    blurb: "How things move, how long it takes, and when nothing moves at all." },
  { href: "/in-use/", title: "In use", section: "Toolkit",
    blurb: "The system applied to real surfaces, and the mistakes it invites." },
  { href: "/toolkit/", title: "Toolkit", section: "Toolkit",
    blurb: "Tokens, downloads, the wiring for agents, and how this kit is kept true." },
];

/** The top-level entries shown in the header. */
export const primary = [
  { href: "/our-brand/", title: "Our brand" },
  { href: "/how-we-speak/", title: "How we speak" },
  { href: "/how-we-look/", title: "How we look" },
  { href: "/in-use/", title: "In use" },
  { href: "/toolkit/", title: "Toolkit" },
];

export const lookPages = pages.filter((p) => p.href.startsWith("/how-we-look/") && p.href !== "/how-we-look/");

export function neighbours(href: string) {
  const i = pages.findIndex((p) => p.href === href);
  return { prev: i > 0 ? pages[i - 1] : undefined, next: i >= 0 && i < pages.length - 1 ? pages[i + 1] : undefined };
}
