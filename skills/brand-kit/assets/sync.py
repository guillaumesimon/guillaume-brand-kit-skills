#!/usr/bin/env python3
"""Push tokens.json into theme.css, BRAND.md and DESIGN.md (and a legacy brand.html).

tokens.json is the source of truth: a value is typed once, there. This
script copies values out of it, so no other file ever needs one typed by hand.

  theme.css   every token as a CSS variable, light and dark. Written whole.
  BRAND.md    the brand, in the BRAND.md format (github.com/guillaumesimon/brand.md).
              Its structured blocks (colors, typography, personality, voice,
              messaging, vocabulary, logo, motion) sit between
                  <!-- @sync <name> ... -->  and  <!-- @/sync -->
              markers and are rewritten from tokens.json. Everything else (the
              prose, claims, rules, visuals, imagery, applications) is
              hand-written and never touched. A missing block is inserted at the
              top of its section; a block that is hand-written without markers is
              reported and left alone, because writing it twice would be a
              duplicate-key error.
  DESIGN.md   the interface system, in the DESIGN.md format
              (github.com/google-labs-code/design.md). Its front matter is
              generated whole from tokens.json; its body is hand-written.

BRAND.md and DESIGN.md are looked for in the kit directory first, then in its
parent (a project that keeps BRAND.md at its root). The brand site in site/
reads tokens.json at build time, so it needs no copy: rebuild it instead.

A kit written before the BRAND.md format has a <!--@core--> block in BRAND.md;
it is still refreshed, and the script says the file needs migrating.

    python3 sync.py path/to/brand/        # write
    python3 sync.py path/to/brand/ --check # exit 1 if any copy is stale

No dependencies. Run it after every edit to tokens.json.
"""
import json
import os
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


# ----------------------------------------------------------------- YAML out

_YAML_WORDS = {"yes", "no", "on", "off", "true", "false", "null", "y", "n", "~"}


def _scalar(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return repr(v) if isinstance(v, float) else str(v)
    s = str(v)
    plain = (
        s and s == s.strip()
        and s[0] not in "-?:,[]{}#&*!|>'\"%@`"
        and ": " not in s and " #" not in s and not s.endswith(":")
        and "\n" not in s
        and s.lower() not in _YAML_WORDS
        and not re.fullmatch(r"[-+]?(\d[\d_]*)?(\.\d+)?([eE][-+]?\d+)?", s)
    )
    return s if plain else json.dumps(s, ensure_ascii=False)


def _key(k):
    k = str(k)
    return k if re.fullmatch(r"[A-Za-z_][\w .-]*", k) and k.lower() not in _YAML_WORDS and k == k.strip() else json.dumps(k, ensure_ascii=False)


def to_yaml(obj, indent=0):
    """A small, safe YAML writer: maps, lists, strings, numbers, booleans."""
    pad = "  " * indent
    lines = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, dict) and v:
                lines.append(f"{pad}{_key(k)}:")
                lines.append(to_yaml(v, indent + 1))
            elif isinstance(v, list) and v and any(isinstance(x, (dict, list)) for x in v):
                lines.append(f"{pad}{_key(k)}:")
                lines.append(to_yaml(v, indent + 1))
            elif isinstance(v, list):
                lines.append(f"{pad}{_key(k)}: [" + ", ".join(json.dumps(x, ensure_ascii=False) if isinstance(x, str) else _scalar(x) for x in v) + "]")
            elif isinstance(v, dict):
                lines.append(f"{pad}{_key(k)}: {{}}")
            else:
                lines.append(f"{pad}{_key(k)}: {_scalar(v)}")
    elif isinstance(obj, list):
        for item in obj:
            if isinstance(item, dict) and item:
                first, *rest = to_yaml(item, indent + 1).split("\n")
                lines.append(f"{pad}- {first.lstrip()}")
                lines.extend(rest)
            else:
                lines.append(f"{pad}- {_scalar(item)}")
    return "\n".join(lines)


def public(block):
    """Drop the underscore keys: they are notes for readers of tokens.json."""
    if isinstance(block, dict):
        return {k: public(v) for k, v in block.items() if not str(k).startswith("_")}
    if isinstance(block, list):
        return [public(x) for x in block]
    return block


def resolve(tokens, node, base):
    """A colour entry's value, or the value its _ref points at under `base`."""
    if isinstance(node, dict):
        if node.get("value"):
            return node["value"]
        if node.get("_ref"):
            hit = dig(tokens, f"{base}.{node['_ref']}")
            return hex_of(hit)
        return None
    return node


# ------------------------------------------------------------- BRAND.md

# region name -> (the YAML keys it owns, the section it lives in, the section's aliases)
REGIONS = {
    "personality": (["personality"], ["personality"]),
    "voice": (["voice"], ["voice & tone", "voice and tone", "voice"]),
    "messaging": (["messaging"], ["messaging"]),
    "vocabulary": (["vocabulary"], ["vocabulary", "terminology"]),
    "logo": (["logo"], ["logo"]),
    "colors": (["colors", "required", "print"], ["colors", "colours"]),
    "typography": (["typography"], ["typography", "typefaces"]),
    "motion": (["motion"], ["motion"]),
}

REGION_RE = re.compile(r"(?s)<!-- @sync (\w+)[^>]*-->\n?.*?<!-- @/sync -->")


def face_name(stack):
    parts = [p.strip().strip("'\"") for p in str(stack or "").split(",") if p.strip()]
    return (parts[0] if parts else None), ", ".join(parts[1:]) or None


def brand_blocks(tokens, rel):
    """Each region's YAML, from tokens.json. A region with no source is absent.

    `rel` turns a path relative to the kit directory into one relative to
    BRAND.md, which is where the BRAND.md format resolves files from.
    """
    out = {}
    voice = tokens.get("voice") or {}
    messaging = tokens.get("messaging") or {}

    attrs = voice.get("attributes")
    if attrs:
        out["personality"] = {"personality": [
            {k: a[k] for k in ("is", "not", "means") if a.get(k)} for a in public(attrs)]}

    v = {}
    for src, dst in (("person", "person"), ("capitalisation", "casing"), ("sentence_length", "sentenceLength")):
        if voice.get(src):
            v[dst] = voice[src]
    if voice.get("examples"):
        v["examples"] = [{k: e[k] for k in ("instead", "write", "why") if e.get(k)} for e in public(voice["examples"])]
    if v:
        out["voice"] = {"voice": v}

    m = {}
    tagline = messaging.get("tagline") or dig(tokens, "meta.tagline")
    if tagline:
        m["tagline"] = tagline
    if messaging.get("one_liner"):
        m["oneLiner"] = messaging["one_liner"]
    if messaging.get("boilerplate"):
        m["boilerplate"] = messaging["boilerplate"]
    if messaging.get("pillars"):
        m["pillars"] = [{"claim": p.get("claim") or p.get("name"), "proof": p.get("proof")}
                        for p in public(messaging["pillars"]) if p.get("claim") or p.get("name")]
    cta = public(messaging.get("cta") or {})
    if cta.get("primary") or cta.get("never"):
        m["cta"] = {k: cta[k] for k in ("primary", "never") if cta.get(k)}
    if m:
        out["messaging"] = {"messaging": m}

    vocab = public(voice.get("vocabulary") or {})
    if vocab.get("use") or vocab.get("avoid"):
        use = vocab.get("use") or {}
        if isinstance(use, list):
            use = {w: "Use this word." for w in use}
        out["vocabulary"] = {"vocabulary": {k: x for k, x in (("use", use), ("avoid", vocab.get("avoid"))) if x}}

    variations = public(dig(tokens, "logo.variations") or {})
    if variations:
        for var in variations.values():
            if var.get("animation"):
                var["animation"] = rel(var["animation"])
            for way in (var.get("colorways") or {}).values():
                if way.get("file"):
                    way["file"] = rel(way["file"])
        out["logo"] = {"logo": variations}

    colours, required, printing = {}, [], {}
    for name, node in (dig(tokens, "color.brand") or {}).items():
        if name.startswith("_"):
            continue
        value = resolve(tokens, node, "color")
        if not value:
            continue
        colours[name] = value
        if isinstance(node, dict):
            if node.get("required"):
                required.append(f"{{colors.{name}}}")
            if node.get("print"):
                printing[name] = public(node["print"])
    faces = {}
    for role, fam in (dig(tokens, "type.family") or {}).items():
        if role.startswith("_") or not isinstance(fam, dict):
            continue
        family, fallback = face_name(fam.get("stack") or fam.get("family"))
        if not family:
            continue
        face = {"fontFamily": family}
        if fam.get("weight"):
            face["fontWeight"] = fam["weight"]
        if fallback:
            face["fallback"] = fallback
        licence = fam.get("license") or fam.get("licence")
        if licence:
            face["license"] = licence
        face["licenseVerified"] = bool(fam.get("license_verified") or fam.get("licence_verified"))
        faces[role] = face
        if fam.get("required"):
            required.append(f"{{typography.{role}}}")
    if colours:
        block = {"colors": colours}
        if required:
            block["required"] = required
        if printing:
            block["print"] = printing
        out["colors"] = block
    if faces:
        out["typography"] = {"typography": faces}

    motion = {}
    for name, node in (dig(tokens, "motion.brand") or {}).items():
        if name.startswith("_") or not isinstance(node, dict):
            continue
        dur = node.get("duration")
        ease = node.get("easing") or node.get("timingFunction")
        motion[name] = {
            "duration": dig(tokens, f"motion.duration.{dur}") or dur,
            "delay": dig(tokens, f"motion.duration.{node.get('delay')}") or node.get("delay") or "0ms",
            "timingFunction": dig(tokens, f"motion.easing.{ease}") or ease,
        }
    if motion:
        out["motion"] = {"motion": motion}

    return out


def region_text(name, block):
    return (f"<!-- @sync {name}: written from tokens.json by sync.py. Edit tokens.json, not this block. -->\n"
            f"```yaml\n{to_yaml(block)}\n```\n<!-- @/sync -->")


def yaml_keys_outside_regions(text):
    """Top-level keys defined in front matter or yaml fences, outside @sync regions."""
    bare = REGION_RE.sub("", text)
    chunks = []
    fm = re.match(r"(?s)\A---\n(.*?)\n---\n", bare)
    if fm:
        chunks.append(fm.group(1))
    chunks += re.findall(r"(?s)^```ya?ml\n(.*?)^```", bare, flags=re.M)
    keys = set()
    for chunk in chunks:
        keys.update(re.findall(r"^([A-Za-z_][\w-]*):", chunk, flags=re.M))
    return keys


def sync_brand_md(text, tokens, rel):
    """Return (new text, notes). Regions are replaced, or inserted where missing."""
    notes = []
    blocks = brand_blocks(tokens, rel)
    present = {m.group(1) for m in REGION_RE.finditer(text)}

    def replace(m):
        name = m.group(1)
        if name not in blocks:
            notes.append(f"BRAND.md: @sync {name} has no source in tokens.json, left as it is")
            return m.group(0)
        return region_text(name, blocks[name])

    text = REGION_RE.sub(replace, text)

    hand = yaml_keys_outside_regions(text)
    lines = text.split("\n")
    for name, (keys, sections) in REGIONS.items():
        if name in present or name not in blocks:
            continue
        clash = [k for k in keys if k in hand]
        if clash:
            notes.append(f"BRAND.md: `{clash[0]}` is hand-written; wrap it in <!-- @sync {name} --> … <!-- @/sync --> "
                         f"so it is kept in step with tokens.json, or move the value into tokens.json")
            continue
        at = next((i for i, line in enumerate(lines)
                   if line.startswith("## ") and line[3:].strip().lower() in sections), None)
        if at is None:
            notes.append(f"BRAND.md: no `## {sections[0].title()}` section, so the {name} block was not written")
            continue
        lines[at + 1:at + 1] = ["", *region_text(name, blocks[name]).split("\n")]
    return "\n".join(lines), notes


# ------------------------------------------------------------- DESIGN.md

def design_front_matter(tokens, brand_rel):
    """DESIGN.md's front matter, whole: names follow theme.css without `--color-`."""
    def colours(theme):
        out = {}
        for group, roles in (dig(tokens, f"color.semantic.{theme}") or {}).items():
            if group.startswith("_") or not isinstance(roles, dict):
                continue
            for role, node in roles.items():
                if role.startswith("_"):
                    continue
                v = hex_of(node)
                if v:
                    out[group if role == "base" else f"{group}-{role}"] = v
        return out

    def dim(v):
        s = str(v).strip()
        return s + "px" if re.fullmatch(r"-?\d+(\.\d+)?", s) else s

    fm = {"version": "alpha",
          "name": f"{dig(tokens, 'meta.name') or 'Brand'} interface",
          "description": "The interface system for " + (dig(tokens, "meta.name") or "the brand")
                         + ": colour roles, type scale, spacing, shape, motion and components.",
          "brand": brand_rel}
    light, dark = colours("light"), colours("dark")
    if light:
        fm["colors"] = dict(light, **({"dark": dark} if dark else {}))

    steps = dig(tokens, "type.scale.step") or {}
    fam = dig(tokens, "type.family") or {}
    type_ = {}
    for role, r in (dig(tokens, "type.role") or {}).items():
        if role.startswith("_") or not isinstance(r, dict):
            continue
        t = {}
        family, _ = face_name(dig(fam, f"{r.get('family')}.stack"))
        if family:
            t["fontFamily"] = family
        if r.get("size"):
            t["fontSize"] = dim(steps.get(r["size"], r["size"]))
        if r.get("weight"):
            t["fontWeight"] = r["weight"]
        if r.get("leading") is not None:
            t["lineHeight"] = r["leading"]
        if r.get("tracking") is not None:
            tr = str(r["tracking"])
            t["letterSpacing"] = "0em" if tr in ("0", "0.0") else tr
        type_[role] = t
    if type_:
        fm["typography"] = type_

    rounded = {k: dim(v) for k, v in (tokens.get("radius") or {}).items() if not k.startswith("_") and k != "role"}
    if rounded:
        fm["rounded"] = rounded
    spacing = {k: dim(v) for k, v in (tokens.get("space") or {}).items() if not k.startswith("_") and k != "role"}
    if spacing:
        fm["spacing"] = spacing

    motion = {}
    for role, spec in (dig(tokens, "motion.role") or {}).items():
        if role.startswith("_"):
            continue
        dur, _, ease = str(spec).partition(" ")
        motion[role] = {"duration": dig(tokens, f"motion.duration.{dur}") or dur,
                        "timingFunction": dig(tokens, f"motion.easing.{ease}") or ease or "ease"}
    if motion:
        fm["motion"] = motion

    components = public(tokens.get("component") or {})
    if components:
        fm["components"] = components
    return "---\n" + to_yaml(fm) + "\n---\n"


def sync_design_md(text, tokens, brand_rel):
    fm = design_front_matter(tokens, brand_rel)
    body = re.sub(r"(?s)\A---\n.*?\n---\n", "", text, count=1)
    return fm + body


# ------------------------------------------------------------------ main

def find(root, name):
    for d in (root, root.parent):
        if (d / name).exists():
            return d / name
    return None


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

    stale, notes, writes = [], [], []

    def stage(path, before, after, label):
        if after == before:
            notes.append(f"{label}: up to date")
        elif check:
            stale.append(label)
        else:
            writes.append((path, after))
            notes.append(f"{label}: written")

    css_path = root / "theme.css"
    stage(css_path, css_path.read_text(encoding="utf-8") if css_path.exists() else None, theme_css(tokens), "theme.css")

    brand_md = find(root, "BRAND.md")
    if brand_md is None:
        notes.append("BRAND.md: missing, skipped")
    else:
        label = str(brand_md.relative_to(root.parent)) if brand_md.parent != root else "BRAND.md"
        before = brand_md.read_text(encoding="utf-8")
        after = before
        if "<!--@core-->" in after:
            after = re.sub(r"(?s)<!--@core-->.*?<!--@/core-->",
                           lambda _: "<!--@core-->\n" + core_block(tokens) + "\n<!--@/core-->", after, count=1)
            notes.append("BRAND.md: written before the BRAND.md format (it has a <!--@core--> block); "
                         "migrate it with brand-kit-update → Migrating to the BRAND.md format")
        else:
            def rel(p):
                return os.path.relpath(root / p, brand_md.parent).replace(os.sep, "/")
            after, more = sync_brand_md(after, tokens, rel)
            notes += more
        stage(brand_md, before, after, label)

    design_md = find(root, "DESIGN.md")
    if design_md is not None:
        label = str(design_md.relative_to(root.parent)) if design_md.parent != root else "DESIGN.md"
        brand_rel = "./" + os.path.relpath(brand_md, design_md.parent).replace(os.sep, "/") if brand_md else "./BRAND.md"
        brand_rel = brand_rel.replace("./../", "../")
        before = design_md.read_text(encoding="utf-8")
        stage(design_md, before, sync_design_md(before, tokens, brand_rel), label)

    html = root / "brand.html"   # legacy one-page kits only; silent when absent
    if html.exists():
        before = html.read_text(encoding="utf-8")
        after = re.sub(r'(?s)(<script id="brand-tokens" type="application/json">)(.*?)(</script>)',
                       lambda _: '<script id="brand-tokens" type="application/json">\n' + raw + '\n</script>',
                       before, count=1)
        stage(html, before, after, "brand.html")

    for path, text in writes:
        path.write_text(text, encoding="utf-8")
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
