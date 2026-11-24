#!/usr/bin/env python3
"""Push tokens.json into theme.css and the front matter of DESIGN.md.

tokens.json is the source of truth. DESIGN.md is the one file agents read:
its YAML front matter holds the design tokens in the DESIGN.md format
(github.com/google-labs-code/design.md), and its body holds the numbered
rules. This script regenerates the front matter only; the body is authored.
Token names in the front matter are the CSS variable names without their
prefix: colors.surface-page is --color-surface-page.

The brand site in site/ reads tokens.json directly at build time, so it
needs no copy: rebuild it instead (cd site && npm run build). Older kits
have BRAND.md with a core block, or tokens embedded in brand.html; those
copies are still refreshed when present.

theme.css is every token as a CSS variable, light and dark, for a project
to @import, with the same names the site and DESIGN.md use.

Check the result with the DESIGN.md linter (contrast, broken references):
    npx @google/design.md lint DESIGN.md

    python3 sync.py path/to/brand/        # write
    python3 sync.py path/to/brand/ --check # exit 1 if either copy is stale

No dependencies. Run it after every edit to tokens.json.
"""
import json
import re
import sys
from pathlib import Path


def dig(obj, path):
    for key in path.split("."):
        if not isinstance(obj, dict):
            return None
        obj = obj.get(key)
    return obj


def hex_of(node):
    return node.get("value") if isinstance(node, dict) else node


def core_block(tokens):
    """Twelve values for the core block of a legacy BRAND.md (kits made before DESIGN.md).

    Terse on purpose: this is a cheat sheet, not documentation. Everything here
    is also in tokens.json, which is where it is authored.
    """
    light = dig(tokens, "color.semantic.light") or {}
    fam = dig(tokens, "type.family") or {}
    role = dig(tokens, "type.role") or {}
    step = dig(tokens, "type.scale.step") or {}
    radius = tokens.get("radius", {})
    voice = tokens.get("voice", {})

    def face(key, *weights):
        stack = dig(fam, key + ".stack") or ""
        name = stack.split(",")[0].strip().strip("'\"") or "—"
        w = sorted({str(dig(role, r + ".weight")) for r in weights if dig(role, r + ".weight")})
        return f"{name} {'/'.join(w)}" if w else name

    def colour(path):
        return hex_of(dig(light, path)) or "—"

    def radius_for(role_name, fallback):
        ref = str(dig(tokens, f"radius.role.{role_name}") or "").split(".")[-1]
        return radius.get(ref, radius.get(fallback, "—"))

    body = role.get("body", {})
    size = step.get(body.get("size"), body.get("size", "—"))

    # The voice line is authored, not derived: truncating prose loses the rule
    # that matters most, which is usually the one about punctuation.
    tail = voice.get("core") or " · ".join(
        x for x in (voice.get("locale", "").split(".")[0].strip(),
                    voice.get("capitalisation", "").split(".")[0].strip()) if x)

    return "\n".join([
        f'Accent `{colour("accent.base")}` · Ink `{colour("ink.base")}` · '
        f'Page `{colour("surface.page")}` · Raised `{colour("surface.raised")}` · '
        f'Hairline `{colour("border.hairline")}`',
        f'Display: {face("display", "h1", "display")} · Text: {face("text", "body", "h3")} · '
        f'Mono: {face("mono")}',
        f'Base spacing {dig(tokens, "space._base_px")}px · Body {size}/{body.get("leading", "—")} · '
        f'Button radius {radius_for("button", "md")} · Card radius {radius_for("card", "lg")}',
        tail,
    ])


def _q(v):
    """A YAML scalar, always double-quoted: hex, dimensions and references all need it."""
    return '"' + str(v).replace("\\", "\\\\").replace('"', '\\"') + '"'


def _dim(v):
    """DESIGN.md dimensions need px, em or rem. A bare 0 becomes 0px."""
    v = str(v).strip()
    return "0px" if v in ("0", "0rem", "0em") else v


def _first_face(stack):
    return (stack or "").split(",")[0].strip().strip("'\"")


def design_front_matter(tokens):
    """The YAML front matter of DESIGN.md, in the DESIGN.md format (version alpha).

    colors       light semantic roles (group-role, as in theme.css: --color-accent-base
                 is accent-base), the aliases primary, surface, on-surface and error,
                 then the dark roles prefixed dark-
                 (the format has no themes; groups break its Tailwind export)
    typography   every type role, sizes resolved to rem
    rounded      the radius scale and its roles
    spacing      the space scale, its roles, and the grid
    components   text-on-background pairs built from the semantic roles, so the
                 linter checks contrast for every surface, action and state,
                 light and dark. Borders and the focus ring are not text, so
                 the linter reports them as orphaned tokens: that is expected.
    Motion, shadows, icons and imagery are not in the format: they stay in
    tokens.json and theme.css, and the body of DESIGN.md states the rules.
    """
    def val(n):
        return n.get("value") if isinstance(n, dict) else n

    def pub(block, skip=()):
        return [(k, v) for k, v in (block or {}).items()
                if not str(k).startswith("_") and k not in skip]

    def scale_ref(ref, group):
        """space.5 -> the value of space.5, for role tables that point into a scale."""
        if isinstance(ref, str) and ref.startswith(group + "."):
            return dig(tokens, ref)
        return ref

    meta = tokens.get("meta", {})
    lines = ["version: alpha", f"name: {_q(meta.get('name', 'Brand'))}"]
    desc = " ".join(x.strip().rstrip(".") + "." for x in (meta.get("category"), meta.get("tagline")) if x)
    if desc:
        lines.append(f"description: {_q(desc)}")

    names = {}
    for theme, prefix in (("light", ""), ("dark", "dark-")):
        rows = []
        for group, roles in pub(dig(tokens, f"color.semantic.{theme}")):
            if not isinstance(roles, dict):
                continue
            for role, node in pub(roles):
                if val(node):
                    rows.append((f"{prefix}{group}-{role}", val(node)))
        names[theme] = {k for k, _ in rows}
        if rows:
            if theme == "light":
                lines.append("colors:")
                if "accent-base" in names["light"]:
                    lines.append('  primary: "{colors.accent-base}"')
                if "surface-page" in names["light"]:
                    lines.append('  surface: "{colors.surface-page}"')
                if "ink-base" in names["light"]:
                    lines.append('  on-surface: "{colors.ink-base}"')
                if "state-danger" in names["light"]:
                    lines.append('  error: "{colors.state-danger}"')
            lines += [f"  {k}: {_q(v)}" for k, v in rows]

    steps = dig(tokens, "type.scale.step") or {}
    fams = dig(tokens, "type.family") or {}
    roles = pub(dig(tokens, "type.role"))
    if roles:
        lines.append("typography:")
        for k, r in roles:
            props = []
            face = _first_face(dig(fams, f"{r.get('family')}.stack"))
            if face:
                props.append(f"fontFamily: {_q(face)}")
            size = steps.get(r.get("size"), r.get("size"))
            if size:
                props.append(f"fontSize: {_q(_dim(size))}")
            if r.get("weight") is not None:
                props.append(f"fontWeight: {r['weight']}")
            if r.get("leading") is not None:
                props.append(f"lineHeight: {r['leading']}")
            if r.get("tracking") is not None:
                props.append(f"letterSpacing: {_q(_dim(r['tracking']).replace('0px', '0em'))}")
            if r.get("features"):
                props.append(f"fontFeature: {_q(r['features'])}")
            lines.append(f"  {k}: {{ " + ", ".join(props) + " }")

    radius = pub(tokens.get("radius"), ("role",))
    if radius:
        lines.append("rounded:")
        lines += [f"  {k}: {_q(_dim(v))}" for k, v in radius]
        lines += [f"  {k}: {_q(_dim(scale_ref(v, 'radius')))}" for k, v in pub(dig(tokens, "radius.role"))]

    space = pub(tokens.get("space"), ("role",))
    if space:
        lines.append("spacing:")
        lines += [f"  {_q(k)}: {_q(_dim(v))}" for k, v in space]
        lines += [f"  {k}: {_q(_dim(scale_ref(v, 'space')))}" for k, v in pub(dig(tokens, "space.role"))]
        grid = dig(tokens, "layout.grid") or {}
        if grid.get("columns"):
            lines.append(f"  grid-columns: {grid['columns']}")
        if grid.get("gutter"):
            lines.append(f"  grid-gutter: {_q(_dim(scale_ref(grid['gutter'], 'space')))}")
        for k, v in pub(dig(tokens, "layout.container")):
            lines.append(f"  container-{k}: {_q(_dim(v))}")

    # Components: background/text pairs from the semantic roles. Each one exists
    # so the linter checks its contrast; a pair whose roles are missing is skipped.
    have_r = {k for k, _ in radius} | {k for k, _ in pub(dig(tokens, "radius.role"))}
    have_s = {k for k, _ in pub(dig(tokens, "space.role"))}
    have_t = {k for k, _ in roles}
    recipes = [
        ("page", "surface-page", "ink-base", None, None, "body"),
        ("heading", "surface-page", "ink-strong", None, None, "h1"),
        ("page-muted", "surface-page", "ink-muted", None, None, "caption"),
        ("card", "surface-raised", "ink-base", "card", "card-padding", "body"),
        ("well", "surface-sunken", "ink-base", None, None, "body"),
        ("inverse", "surface-inverse", "ink-inverse", None, None, "body"),
        ("button-primary", "accent-base", "accent-on", "button", "control-y", "button"),
        ("button-primary-hover", "accent-hover", "accent-on", None, None, None),
        ("tag", "accent-subtle", "ink-base", "tag", None, "label"),
        ("link", "surface-page", "accent-base", None, None, None),
        ("alert-info", "surface-page", "state-info", None, None, None),
        ("alert-success", "surface-page", "state-success", None, None, None),
        ("alert-warning", "surface-page", "state-warning", None, None, None),
        ("alert-danger", "surface-page", "state-danger", None, None, None),
    ]
    comps = []
    for theme, prefix in (("light", ""), ("dark", "dark-")):
        for name, bg, fg, rnd, pad, typo in recipes:
            if bg not in names["light"] or fg not in names["light"]:
                continue
            if prefix and (prefix + bg not in names["dark"] or prefix + fg not in names["dark"]):
                continue
            props = [f'backgroundColor: "{{colors.{prefix}{bg}}}"',
                     f'textColor: "{{colors.{prefix}{fg}}}"']
            if not prefix:
                if rnd in have_r:
                    props.append(f'rounded: "{{rounded.{rnd}}}"')
                if pad in have_s:
                    props.append(f'padding: "{{spacing.{pad}}}"')
                if typo in have_t:
                    props.append(f'typography: "{{typography.{typo}}}"')
            comps.append(f"  {name}{'-dark' if prefix else ''}: {{ " + ", ".join(props) + " }")
    if comps:
        lines.append("components:")
        lines += comps

    head = (f"# {meta.get('name', 'Brand')} v{meta.get('version', '?')}. "
            "Generated from tokens.json by sync.py: edit tokens.json, not this block.")
    return "---\n" + head + "\n" + "\n".join(lines) + "\n---\n"


FRONT_MATTER = re.compile(r"(?s)\A---\n.*?\n---\n")


def with_front_matter(text, fm):
    """Replace DESIGN.md's front matter, or put one on top if there is none."""
    if FRONT_MATTER.match(text):
        return FRONT_MATTER.sub(lambda _: fm, text, count=1)
    return fm + "\n" + text.lstrip("\n")


def theme_css(tokens):
    """brand/theme.css: every token as a CSS variable, light and dark.

    Same mapping as the site (site/lib/tokens.ts) and as DESIGN.md states it:
    drop `semantic.<theme>.`, join with `-`, prefix `--`.
    """
    def val(n):
        return n.get("value") if isinstance(n, dict) else n

    def pub(block, skip=()):
        return [(k, v) for k, v in (block or {}).items() if not k.startswith("_") and k not in skip]

    def ref(r):
        hit = dig(tokens, r) if isinstance(r, str) else None
        return hit if hit is not None and not isinstance(hit, dict) else val(r)

    def colours(theme):
        out = []
        for group, roles in pub(dig(tokens, f"color.semantic.{theme}")):
            for role, node in pub(roles):
                out.append((f"--color-{group}-{role}", val(node)))
            if isinstance(roles, dict) and "base" in roles:
                out.append((f"--color-{group}", val(roles["base"])))
        return out

    rows = []
    for k, f in pub(dig(tokens, "type.family")):
        rows.append((f"--font-{k}", f.get("stack")))
    steps = dig(tokens, "type.scale.step") or {}
    for k, v in pub(steps):
        rows.append((f"--step-{k}", v))
    for k, r in pub(dig(tokens, "type.role")):
        rows += [(f"--text-{k}", steps.get(r.get("size"), r.get("size"))), (f"--leading-{k}", r.get("leading")),
                 (f"--tracking-{k}", r.get("tracking", 0)), (f"--weight-{k}", r.get("weight"))]
    for k, v in pub(tokens.get("space"), ("role",)):
        rows.append((f"--space-{k}", v))
    for k, v in pub(tokens.get("radius"), ("role",)):
        rows.append((f"--radius-{k}", v))
    for k, v in pub(dig(tokens, "radius.role")):
        rows.append((f"--radius-{k}", ref(v)))
    for k, v in pub(tokens.get("shadow"), ("role", "dark_note")):
        rows.append((f"--shadow-{k}", v))
    for k, v in pub(dig(tokens, "motion.duration")):
        rows.append((f"--duration-{k}", v))
    for k, v in pub(dig(tokens, "motion.easing")):
        rows.append((f"--ease-{k}", v))
    for k, v in pub(dig(tokens, "layout.container")):
        rows.append((f"--container-{k}", v))

    def block(sel, pairs, indent="  "):
        return sel + " {\n" + "\n".join(f"{indent}{k}: {v};" for k, v in pairs if v is not None) + "\n" + indent[:-2] + "}"

    dark = colours("dark")
    name = dig(tokens, "meta.name") or "brand"
    head = (f"/* {name} v{dig(tokens, 'meta.version') or '?'} — generated from tokens.json by sync.py. Do not edit. */\n")
    parts = [head + block(":root", rows + colours("light"))]
    if dark:
        parts.append("@media (prefers-color-scheme: dark) {\n" + block('  :root:not([data-theme="light"])', dark, "    ") + "\n}")
        parts.append(block(':root[data-theme="dark"]', dark))
    return "\n\n".join(parts) + "\n"


def rewrite(path, pattern, replacement, label):
    """Substitute once, reporting whether anything would change."""
    if not path.exists():
        return None, f"{label}: missing, skipped"
    before = path.read_text(encoding="utf-8")
    after, count = pattern.subn(lambda _: replacement, before, count=1)
    if not count:
        return None, f"{label}: marker not found, skipped"
    return (after if after != before else None), label


def main(argv):
    args = [a for a in argv[1:] if not a.startswith("-")]
    check = "--check" in argv
    root = Path(args[0] if args else ".").resolve()

    tokens_path = root / "tokens.json"
    if not tokens_path.exists():
        sys.exit(f"No tokens.json in {root}")
    raw = tokens_path.read_text(encoding="utf-8").rstrip()
    try:
        tokens = json.loads(raw)
    except json.JSONDecodeError as err:
        sys.exit(f"tokens.json is not valid JSON: {err}")

    jobs = [
        (root / "brand.html",
         re.compile(r'(?s)(<script id="brand-tokens" type="application/json">)(.*?)(</script>)'),
         lambda: '<script id="brand-tokens" type="application/json">\n' + raw + '\n</script>',
         "brand.html"),
        (root / "BRAND.md",
         re.compile(r"(?s)<!--@core-->.*?<!--@/core-->"),
         lambda: "<!--@core-->\n" + core_block(tokens) + "\n<!--@/core-->",
         "BRAND.md"),
    ]

    stale, notes = [], []

    design_path = root / "DESIGN.md"
    if design_path.exists():
        before = design_path.read_text(encoding="utf-8")
        after = with_front_matter(before, design_front_matter(tokens))
        if after == before:
            notes.append("DESIGN.md: up to date")
        elif check:
            stale.append("DESIGN.md")
        else:
            design_path.write_text(after, encoding="utf-8")
            notes.append("DESIGN.md: front matter written")
    elif (root / "BRAND.md").exists():
        notes.append("DESIGN.md: missing. This kit still uses BRAND.md; brand-kit-update migrates it.")
    else:
        notes.append("DESIGN.md: missing, skipped")

    css_path = root / "theme.css"
    css = theme_css(tokens)
    if css_path.exists() and css_path.read_text(encoding="utf-8") == css:
        notes.append("theme.css: up to date")
    elif check:
        stale.append("theme.css")
    else:
        css_path.write_text(css, encoding="utf-8")
        notes.append("theme.css: written")

    for path, pattern, build, label in jobs:
        updated, note = rewrite(path, pattern, build(), label)
        if note != label:
            if label == "BRAND.md" and not (root / "BRAND.md").exists():
                continue                # current kits have DESIGN.md instead
            if label != "brand.html":   # legacy one-page kits only; silence when absent
                notes.append(note)
            continue
        if updated is None:
            notes.append(f"{label}: up to date")
            continue
        if check:
            stale.append(label)
        else:
            path.write_text(updated, encoding="utf-8")
            notes.append(f"{label}: written")

    for note in notes:
        print(note)
    if stale:
        print("\nStale: " + ", ".join(stale) + f"\nRun: python3 {Path(__file__).name} {root}", file=sys.stderr)
        return 1
    version = dig(tokens, "meta.version") or "?"
    print(f"\n{dig(tokens, 'meta.name') or 'brand'} v{version} — " + ("in sync" if check else "synced"))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
