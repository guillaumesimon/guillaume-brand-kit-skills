#!/usr/bin/env python3
"""Push tokens.json into theme.css and the core block of BRAND.md (and a legacy brand.html).

tokens.json is the source of truth. BRAND.md carries a twelve-value core
block so an agent that only has BRAND.md in context is still roughly
on-brand; this script regenerates it. The brand site in site/ reads
tokens.json directly at build time, so it needs no copy — rebuild it
instead (cd site && npm run build). Kits made before the site existed
embed tokens in brand.html; that copy is still refreshed when present.

theme.css is every token as a CSS variable, light and dark, for a project
to @import — the same names the site and BRAND.md use.

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
    """Twelve values, for an agent that only has BRAND.md in context.

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


def theme_css(tokens):
    """brand/theme.css: every token as a CSS variable, light and dark.

    Same mapping as the site (site/lib/tokens.ts) and as BRAND.md states it:
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
