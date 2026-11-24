#!/usr/bin/env python3
"""Redraw the seven illustration territories on a brand's own scene and palette.

The picker ships with curated artwork. This script is for when a brand wants the
same comparison on a scene of its own — its product, its object, its moment —
rather than the generic one. It will not match the curated set for quality:
those were art-directed and picked from several attempts. Treat what comes out
as a first pass.

The method follows the reference pack: the scene is generated once in Playful
Editorial 3D, which acts as the master image, then each other territory is drawn
from that master so the composition stays constant. Comparing two territories
has to mean comparing the same image twice, or people compare drawings instead
of grammars.

    python3 gen.py check                    # which provider this machine has a key for
    python3 make-samples.py --scene "a florist handing over a bouquet in a shop doorway"
    python3 make-samples.py --only doodle   # redo one card

Cost: 7 calls. On fal, GPT Image 2.5 at medium is $0.09 a run and --model muse is
$0.07 and looser; on OpenRouter the default model is about $0.50 a run. The
provider comes from gen.py. --dry-run prints the prompts and spends nothing.
"""
import argparse, base64, io, json, pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import gen
from gen import as_ref

HERE = pathlib.Path(__file__).resolve().parent
PAGE = HERE / "illustration-styles.html"
OUT = HERE / "illustration-samples"
REFS = HERE / "refs"

MASTER = "editorial3d"          # the territory every new scene is generated in first

# A style the author supplies as an image beats any description. Drop files in
# refs/ and name them here; the prompt then carries only the palette and the
# negatives, and the reference carries the hand.
STYLE_REFS = {}

DEFAULT_PALETTE = {
    "ground": "#FBF7F1", "ink": "#241E1A", "accent": "#1F5D45",
    "soft": "#86B9A4", "warm": "#C8761B", "cool": "#2C5E8A",
}

DEFAULT_SCENE = ("A feature announcement for automatic subtitles: one person on a video call filling a "
                 "screen, a caption bar across the bottom of that screen reading “and that’s how it works”, "
                 "a sound wave to one side, and two small language tags. Just the one person.")

# Constants the whole set obeys, so the cards differ by grammar and nothing else.
COMMON = (" Square format. Light cream or white ground, never a dark ground. No real brand, no logo, no "
          "existing product name anywhere — these models add them to branded objects unprompted.")

# Each territory names its construction, then names what would make it generic.
# The avoid list is the load-bearing half: without it these models converge on
# the same soft shaded mid-tone illustration for all seven.
TERRITORIES = {
    "editorial3d": (
        "Playful Editorial 3D. Everything sculpted in smooth matte clay. Rounded corners everywhere, no sharp "
        "edges. Simplified iconic forms, slightly thick almost toy-like proportions but a refined finish. Soft "
        "diffuse light from the upper left, soft-edged contact shadows, low contrast. Simplified features, dot "
        "eyes, no skin texture. "
        "Avoid: photorealism, product-photography look, realistically textured wood or fruit, leather, brushed "
        "metal, glossy speculars."),
    "geometric": (
        "Playful Geometric. Everything built from geometric primitives: circles, arcs, rounded rectangles, "
        "straight lines. Objects reduced to the most abstract symbol still legible. No outlines at all — form is "
        "defined by colour alone. Strict flat fills, a very restricted palette, often only three or four dominant "
        "colours. No volume, no drop shadow, no gradient, no perspective. Character radically simplified: one "
        "solid shape for the hair, dot eyes, no nose. A lot of empty space, poster calm. "
        "Avoid: 3D, volume, drop shadows, texture, outlines, clutter."),
    "doodle": (
        "Clever Doodle. Black brush ink on cream paper. Strongly variable line weight — every stroke swells in "
        "the middle and tapers at the ends, slightly shaky, human, never even or ruled. Several shapes filled "
        "solid black as graphic accents, used sparingly for contrast. Greys come only from visible ben-day dot "
        "screens and short free hatching. At most one or two flat colours, placed only where they carry meaning, "
        "never as decoration. Character simple and funny: eyes closed in arcs, a small smile, scribbled hair, "
        "slightly wonky proportions. Small expression marks around the subject — speed lines, bursts, asterisks, "
        "spirals. Objects overlap and vary in scale. "
        "Avoid: constant-weight monoline, fine pen, engraving, etching, dense parallel hatching, technical "
        "illustration, vector look, 3D, gradients."),
    "riso": (
        "Happy Riso. Four inks only — fluoro pink, bright blue, sunflower yellow, coral red — on textured cream "
        "paper. Heavy visible grain and paper tooth, apparent halftone screen. Inks overprint and make new "
        "colours where they cross. Deliberate misregistration: fills sit a millimetre off their outlines. Uneven "
        "ink coverage. Flat simplified shapes, no gradient, no shading. Any lettering is hand-drawn and printed "
        "in a single solid ink so it stays legible through the grain. "
        "Avoid: crisp vector edges, digital smoothness, 3D volume, photorealism, illegible text."),
    "cutpaste": (
        "Cut and Paste. A flat photograph of a scene built entirely from real layered paper. Every element is a "
        "piece of paper, scissor-cut or hand-torn, with slightly irregular edges and visible paper fibre. Each "
        "layer casts a soft physical shadow on the one below. A few pieces of masking tape hold parts down. "
        "Graphic simplified shapes, contemporary editorial register, not a craft project. "
        "Avoid: 3D clay render, smooth digital gradients, airbrush shading, vector flatness, childish craft "
        "aesthetics."),
    "cartoon": (
        "New School Cartoon. Thick, even, confident black outlines around every shape. Clean saturated flat "
        "colour, no gradient, no rendering. Very legible massive forms that hold up small, slightly exaggerated "
        "proportions. Any lettering is bold cartoon type outlined in black. Retro mascot energy, modernised. "
        "Avoid: 3D, volume, computed shadows, texture, grain, thin hesitant linework."),
    "isometric": (
        "Realistic Isometric. Strict isometric projection, three-quarter view at thirty degrees, seen from above "
        "— state this explicitly, it is never inferred. The scene sits on a square slab with four right-angled "
        "corners and a visible edge thickness, on a plain studio ground; never legs, never furniture underneath. "
        "Credible varied materials: real wood grain, glazed ceramic, brushed brass, frosted glass, woven linen, "
        "terracotta, paper. Warm soft studio light, realistic shadows, ambient occlusion. Many small credible "
        "details. The subject fills the frame. Any person present is an element of the space, not the subject. "
        "Avoid: front view, flat top-down view, vector, cartoon outlines, matte clay look, toy plastic, "
        "unbalanced composition."),
}


def palette_line(p):
    return (f" Palette: cream ground {p['ground']}, near-black {p['ink']}, accent {p['accent']}, "
            f"soft {p['soft']}, warm {p['warm']}, cool {p['cool']}.")


def prompts(scene, p):
    pal = palette_line(p)
    return {k: f"Style: {spec}{pal}{COMMON}" for k, spec in TERRITORIES.items()}, scene


def keep_line(scene):
    return ("Use the reference image only for the composition, the subject and the framing: " + scene +
            " Keep the same subject, the same layout and the same framing. Discard the rendering entirely "
            "and redraw the whole scene in the style described below.")


def embed(images, merge=False):
    """Fold the samples into the page as data URIs so it stays one openable file."""
    import re
    from PIL import Image
    OUT.mkdir(exist_ok=True)
    samples, total = {}, 0
    for key, raw in images.items():
        im = Image.open(io.BytesIO(raw)).convert("RGB").resize((600, 600), Image.LANCZOS)
        # Grain-heavy territories resist webp, so step the quality down until the
        # card is a sane weight rather than shipping a 160 KB thumbnail.
        for q in (78, 68, 58, 48):
            buf = io.BytesIO(); im.save(buf, "WEBP", quality=q, method=6)
            if len(buf.getvalue()) <= 48_000 or q == 48:
                break
        data = buf.getvalue()
        (OUT / f"{key}.webp").write_bytes(data)
        samples[key] = "data:image/webp;base64," + base64.b64encode(data).decode()
        total += len(data)
        print(f"  {key:12s} q{q} {len(data)//1024:3d} KB")
    print(f"  {'total':12s}     {total//1024:3d} KB")

    t = PAGE.read_text()
    if merge:
        existing = json.loads(re.search(r"var SAMPLES=(\{.*?\});", t, re.S).group(1))
        existing.update(samples)
        samples = existing
    start = t.index("<script>\nvar SAMPLES=")
    end = t.index(";\n</script>", start) + len(";\n</script>")
    t = t[:start] + "<script>\nvar SAMPLES=" + json.dumps(samples, indent=0).replace("\n", "") + ";\n</script>" + t[end:]
    PAGE.write_text(t)
    print(f"  page          {len(t)//1024:3d} KB")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scene", default=DEFAULT_SCENE, help="the one scene every territory draws")
    ap.add_argument("--palette", help="JSON: ground, ink, accent, soft, warm, cool")
    # --quality is fal GPT Image only. Raise it when a territory needs to stay loose: at
    # medium that model tidies a drawing up, which flattens the wobble Clever Doodle lives on.
    gen.add_args(ap)
    ap.add_argument("--only", help="regenerate a single territory, reusing the saved master")
    ap.add_argument("--out", help="working folder: the board is copied there and redrawn there, so a "
                                   "session never rewrites the installed skill")
    a = ap.parse_args()

    global PAGE, OUT
    if a.out:
        import shutil
        dest = pathlib.Path(a.out).resolve(); dest.mkdir(parents=True, exist_ok=True)
        if not (dest / PAGE.name).exists():
            shutil.copy(PAGE, dest / PAGE.name)
        if not (dest / OUT.name).exists() and OUT.exists():
            shutil.copytree(OUT, dest / OUT.name)
        PAGE, OUT = dest / PAGE.name, dest / OUT.name

    p = dict(DEFAULT_PALETTE, **(json.loads(a.palette) if a.palette else {}))
    S, scene = prompts(a.scene, p)
    KEEP = keep_line(scene)

    if a.only and a.only not in S:
        raise SystemExit(f"Unknown territory {a.only!r}. One of: {', '.join(S)}")

    if a.dry_run:
        for k, v in S.items():
            if a.only and k != a.only:
                continue
            print(f"\n--- {k} ---\n{v}")
        n = 1 if a.only else len(S)
        provider, shown, mname, each = gen.plan(a)
        print(f"\n{n} call(s) on {shown} {mname}, ~${n * each:.2f}."
              + ("" if provider else "\nNo key here: hand these prompts to an image tool the session has."))
        return

    gen.need(a.provider)
    provider, shown, mname, _ = gen.plan(a)
    spent = 0

    def shoot(prompt, refs=None):
        nonlocal spent
        raw, cost = gen.image(prompt, "1:1", refs, a.model, a.quality, a.provider)
        spent += cost
        return raw

    def style_refs(name):
        out = []
        for rel in STYLE_REFS.get(name, []):
            f = REFS / rel
            if f.exists():
                out.append(as_ref(f.read_bytes()))
            else:
                print(f"  ! missing style reference {rel}, falling back to the written prompt")
        return out

    def draw(name, master):
        refs = style_refs(name)
        prompt = KEEP + " " + S[name]
        if refs:
            prompt = (KEEP + " Take the drawing style ONLY from the second and later reference images: their "
                      "line quality, their character construction, their colour treatment and their level of "
                      "abstraction. Match that hand exactly. Ignore their subject and composition entirely. "
                      + S[name])
        return shoot(prompt, [master] + refs)

    if a.only:
        saved = OUT / f"{MASTER}.webp"
        if a.only != MASTER and not saved.exists():
            raise SystemExit(f"No saved {MASTER} master. Run a full pass once before using --only.")
        if a.only == MASTER:
            images = {MASTER: shoot(scene + " " + S[MASTER])}
        else:
            print(f"Drawing → {a.only}…")
            images = {a.only: draw(a.only, as_ref(saved.read_bytes()))}
        print("Embedding…")
        embed(images, merge=True)
        print(f"\nDone. 1 image on {shown} {mname}, ${spent:.3f}.")
        return

    print(f"Generating the master in {MASTER}…")
    master_raw = shoot(scene + " " + S[MASTER])
    master = as_ref(master_raw)

    images = {MASTER: master_raw}
    for k in S:
        if k == MASTER:
            continue
        print(f"Drawing → {k}…")
        images[k] = draw(k, master)

    print("Embedding…")
    embed(images)
    print(f"\nDone. {len(images)} images on {shown} {mname}, ${spent:.2f}.")


if __name__ == "__main__":
    main()
