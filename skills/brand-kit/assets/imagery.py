#!/usr/bin/env python3
"""Generate the photography board, and a brand's own photography and illustration.

Two jobs, one script. The provider comes from gen.py: fal.ai when FAL_KEY is
set, OpenRouter when OPENROUTER_API_KEY is, and --dry-run when neither is.

    # 1 · The photography board: one scene, seven photographic directions.
    #     --out copies the board into a working folder (the session scratchpad)
    #     and writes there; without it the skill's own shipped board is rewritten.
    python3 imagery.py board --out "$SCRATCH" --scene "a florist handing a bouquet across the counter, morning"
    python3 imagery.py board --out "$SCRATCH" --only flash     # redo one card
    python3 imagery.py board --dry-run --scene "…"              # print prompts, spend nothing

    # 2 · The brand's imagery: every entry under tokens.imagery that has a
    #     `prompt` and a `src` whose file does not exist yet.
    python3 imagery.py brand path/to/brand/
    python3 imagery.py brand path/to/brand/ --only hero --force

The board works like the illustration picker: the scene is generated once as
a documentary photograph (the master), then every other direction is re-shot
*from that master*, so composition and subject stay put and only the
photography changes. Comparing two directions has to mean comparing the same
picture twice.

For the brand job, every "do" image is prefixed with the brand's own recipe
(imagery.photography.recipe), so the set obeys the rules the kit states. An
entry with "kind": "dont" is generated from its prompt alone — it is meant to
break them.

Cost on fal: GPT Image 2.5 Flare at medium is ~$0.013 an image (a board ~$0.09),
Muse ~$0.01 and noticeably looser. On OpenRouter the default model is ~$0.07 an
image (a board ~$0.50). A typical brand set is 6–10 images. --dry-run prints
the estimate for the provider this machine would use.
"""
import argparse, base64, json, pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import gen
from gen import as_ref, to_webp

HERE = pathlib.Path(__file__).resolve().parent
PAGE = HERE / "photo-styles.html"
OUT = HERE / "photo-samples"

# A scene needs a person, an object and a place: casting and environment are
# the expensive parts of a photographic system, so a still life tells you little.
DEFAULT_SCENE = ("A woman in her thirties at a small café table by a window in the morning, holding a phone in one "
                 "hand, a cup of coffee and an open paper notebook on the table. Just the one person.")

COMMON = (" A photograph, not an illustration and not a 3D render. No text, no logo, no brand name anywhere, "
          "no watermark. Natural anatomy, natural hands.")

MASTER = "documentary"

# Each direction names its light, its lens and its casting, then what would
# make it generic. The avoid list is the load-bearing half: without it every
# model converges on the same soft, smiling stock photograph.
DIRECTIONS = {
    "documentary": (
        "Documentary reportage. Available window light only, soft and directional, mid-morning. 35mm lens at eye "
        "level, candid — the subject is mid-task and unaware of the camera. Natural colour, true whites, fine film "
        "grain. The place is readable around the person. "
        "Avoid: posing, eye contact with the camera, studio light, shallow creamy bokeh, colour grading, smiles for "
        "the camera."),
    "lifestyle": (
        "Bright lifestyle photography. High-key, airy and sunlit, warm white balance, soft backlight with a gentle "
        "flare. Shallow depth of field, 50mm. The subject is relaxed and smiling, a little aspirational. Clean pastel "
        "surroundings, a plant, light linen. "
        "Avoid: harsh shadows, dark tones, grit, anything that looks like work."),
    "portrait": (
        "Editorial portrait. The subject faces the camera with a direct, calm gaze, deliberately posed. One hard key "
        "light from the side, deep defined shadows, a plain painted backdrop in a muted colour replacing the setting. "
        "85mm, magazine cover framing from the waist up. "
        "Avoid: smiling, candid feel, busy background, soft even light."),
    "colour": (
        "Colour studio. A seamless saturated colour backdrop replacing the setting — one bold flat colour — with a "
        "matching floor. Hard on-axis flash with a crisp shadow behind the subject. The objects from the scene "
        "become props held up proudly, slightly surreal and playful. Punchy, graphic, advertising energy. "
        "Avoid: natural environment, muted colour, soft light, realism."),
    "cinematic": (
        "Cinematic. Low-key, a single practical light source, deep shadows and rich contrast, a teal and amber "
        "colour grade, anamorphic 2.39-feeling framing with negative space. Atmospheric haze. The moment feels like "
        "a still from a film. "
        "Avoid: flat even light, bright high-key exposure, smiling, stock feel."),
    "flash": (
        "Flash snapshot. Direct on-camera flash, hard and flat on the subject, the background falling off dark. "
        "Slightly tilted, imperfect crop, heavy grain, a candid unguarded expression. Feels like a disposable camera "
        "at a party, raw and immediate. "
        "Avoid: polish, studio lighting, retouching, careful composition."),
    "stilllife": (
        "Still life. No person at all — remove them. Only the objects from the scene, arranged deliberately on a "
        "plain surface, shot straight-on or from directly above. One soft "
        "directional light, a long gentle shadow, generous empty space, a restricted palette. Calm, considered, "
        "museum-like. "
        "Avoid: people, hands, clutter, busy patterns, lifestyle staging."),
}


# ---------------------------------------------------------------- board

def board(a):
    global PAGE, OUT
    if a.out:
        # Work on a copy, so a session never rewrites the installed skill.
        import shutil
        dest = pathlib.Path(a.out).resolve(); dest.mkdir(parents=True, exist_ok=True)
        if not (dest / PAGE.name).exists():
            shutil.copy(PAGE, dest / PAGE.name)
        # The shipped samples come too, or --only would rebuild the page with one card.
        if not (dest / OUT.name).exists() and OUT.exists():
            shutil.copytree(OUT, dest / OUT.name)
        PAGE, OUT = dest / PAGE.name, dest / OUT.name
    provider, shown, mname, price = gen.plan(a)
    keep = ("Use the reference image only for the scene, the subject and the composition: " + a.scene +
            " Keep the same subject and the same objects. Re-shoot it entirely as described below; change the "
            "light, the lens, the colour and the casting direction completely.")
    names = [a.only] if a.only else list(DIRECTIONS)
    if a.dry_run:
        for k in names:
            print(f"\n--- {k} ---\n{(a.scene + ' ') if k == MASTER else keep + ' '}{DIRECTIONS[k]}{COMMON}")
        print(f"\n{len(names)} call(s) on {shown} {mname}, ~${len(names) * price:.2f}."
              + ("" if provider else "\nNo key here: hand these prompts to an image tool the session has."))
        return
    gen.need(a.provider)
    spent = 0
    def shoot(prompt, refs=None):
        nonlocal spent
        raw, cost = gen.image(prompt, "1:1", refs, a.model, a.quality, a.provider)
        spent += cost
        return raw
    OUT.mkdir(exist_ok=True)
    saved = OUT / f"{MASTER}.webp"
    images = {}
    if MASTER in names or not saved.exists():
        print(f"Shooting the master ({MASTER})…")
        images[MASTER] = shoot(a.scene + " " + DIRECTIONS[MASTER] + COMMON)
    master = as_ref(images.get(MASTER) or saved.read_bytes())
    for k in names:
        if k == MASTER:
            continue
        print(f"Re-shooting → {k}…")
        images[k] = shoot(keep + " " + DIRECTIONS[k] + COMMON, [master])
    embed(images)
    print(f"\nDone. {len(images)} image(s) on {shown} {mname}, ${spent:.2f}.")


def embed(images):
    """Fold the samples into photo-styles.html as data URIs so it stays one openable file."""
    import re
    samples = {}
    for k, raw in images.items():
        data, q = to_webp(raw, "1:1", 640, 56_000)
        (OUT / f"{k}.webp").write_bytes(data)
        print(f"  {k:12s} q{q} {len(data) // 1024:3d} KB")
    for f in sorted(OUT.glob("*.webp")):
        samples[f.stem] = "data:image/webp;base64," + base64.b64encode(f.read_bytes()).decode()
    t = PAGE.read_text()
    start = t.index("<script>\nvar SAMPLES=")
    end = t.index(";\n</script>", start) + len(";\n</script>")
    t = t[:start] + "<script>\nvar SAMPLES=" + json.dumps(samples, indent=0).replace("\n", "") + ";\n</script>" + t[end:]
    PAGE.write_text(t)
    print(f"  page          {len(t) // 1024:3d} KB")


# ---------------------------------------------------------------- brand

def entries(tokens):
    """Every imagery entry that can be generated: has a prompt and a src."""
    img = tokens.get("imagery", {})
    out = []
    for section in ("photography", "illustration"):
        s = img.get(section, {})
        for group in ("types", "samples", "misuse"):
            for e in s.get(group, []) or []:
                if isinstance(e, dict) and e.get("prompt") and e.get("src"):
                    out.append((section, e))
    return out


def recipe_line(tokens, section):
    s = tokens.get("imagery", {}).get(section, {})
    if section == "photography":
        r = s.get("recipe", {})
        parts = [f"{k.replace('_', ' ')}: {v if isinstance(v, str) else ', '.join(v)}" for k, v in r.items()
                 if not k.startswith("_") and k != "ratios"]
        never = s.get("never", [])
        return ("Brand photography recipe. " + " ".join(p.rstrip(".") + "." for p in parts) +
                (" Never: " + "; ".join(never) + "." if never else ""))
    # illustration: construction, palette and the never list carry the style
    keys = ("style", "construction", "palette", "never")
    return "Brand illustration style. " + " ".join(f"{k}: {s[k]}" for k in keys if s.get(k))


def brand(a):
    root = pathlib.Path(a.brand).resolve()
    tokens = json.loads((root / "tokens.json").read_text())
    todo = [(sec, e) for sec, e in entries(tokens)
            if (not a.only or a.only in e["src"]) and (a.force or not (root / e["src"]).exists())]
    # Several entries may point at the same file (a type card reused in the gallery). Generate once.
    seen, unique = set(), []
    for sec, e in todo:
        if e["src"] not in seen:
            seen.add(e["src"]); unique.append((sec, e))
    provider, shown, mname, price = gen.plan(a)
    spent = 0
    if not unique:
        print("Nothing to generate: every imagery entry with a prompt already has its file. Use --force to redo.")
        return
    for sec, e in unique:
        dont = e.get("kind") == "dont"
        prompt = (e["prompt"] if dont else recipe_line(tokens, sec) + " Subject: " + e["prompt"]) + COMMON
        if a.dry_run:
            print(f"\n--- {e['src']} ({e.get('ratio', '4:5')}{', dont' if dont else ''}) ---\n{prompt}")
            continue
        print(f"Generating {e['src']}…")
        raw, cost = gen.image(prompt, e.get("ratio", "4:5"), None, a.model, a.quality, a.provider)
        spent += cost
        ratio = e.get("ratio", "4:5")
        width = 1800 if e.get("size") in ("wide", "full") or ratio == "16:9" else 1100
        data, q = to_webp(raw, ratio, width, 220_000)
        dest = root / e["src"]; dest.parent.mkdir(parents=True, exist_ok=True); dest.write_bytes(data)
        print(f"  q{q} {len(data) // 1024} KB → {dest.relative_to(root)}")
    n = len(unique)
    print(f"\n{'Would generate' if a.dry_run else 'Generated'} {n} image(s) on {shown} {mname}, "
          f"{'~$%.2f' % (n * price) if a.dry_run else '$%.2f' % spent}."
          + ("\nNo key here: hand these prompts to an image tool the session has." if a.dry_run and not provider else ""))
    if not a.dry_run:
        print("These are direction, not photography of the real business. Mark imagery provenance 'assumed' "
              "until a real shoot replaces them.")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("board", "brand"):
        p = sub.add_parser(name)
        if name == "brand":
            p.add_argument("brand", help="the brand/ directory holding tokens.json")
            p.add_argument("--force", action="store_true", help="regenerate files that already exist")
            p.add_argument("--only", help="only entries whose src contains this string")
        else:
            p.add_argument("--scene", default=DEFAULT_SCENE, help="the one scene every direction re-shoots")
            p.add_argument("--only", choices=sorted(DIRECTIONS), help="redo a single direction")
            p.add_argument("--out", help="working folder: the board is copied there and generated there")
        gen.add_args(p)
    a = ap.parse_args()
    board(a) if a.cmd == "board" else brand(a)


if __name__ == "__main__":
    main()
