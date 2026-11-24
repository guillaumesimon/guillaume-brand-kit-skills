#!/usr/bin/env python3
"""One image, from whichever provider this machine has a key for.

The session works without any key: the boards ship with artwork and the kit
marks its imagery `assumed`. A key adds three things, and only these: the
photography and illustration boards redrawn on the brand's own scene, a real
picture in the artefact the user reacts to, and the brand's own imagery set.
See references/generation.md.

    python3 gen.py check                       # which provider, without ever printing a key
    python3 gen.py image --prompt "…" --out "$SCRATCH/hero.webp" --ratio 16:9
    python3 gen.py image --prompt "…" --out x.webp --ref master.webp   # redraw from a reference
    python3 gen.py image --prompt "…" --out x.webp --dry-run           # print it, spend nothing

Two providers, looked for in this order:

    fal.ai       FAL_KEY in the environment (or the macOS Keychain, service "fal.ai").
                 The route the boards and their prompts were tuned on.
    OpenRouter   OPENROUTER_API_KEY (or OPEN_ROUTER_KEY) in the environment.
                 Same prompts, different models: expect a looser match to a reference.

Force one with --provider or BRAND_KIT_PROVIDER. imagery.py and make-samples.py
import this file, so all three behave the same way.

A key is read from the environment and handed to curl in a header file that
is deleted straight after. It is never printed, logged or written anywhere
else. Never ask a user to paste one into the conversation.
"""
import argparse, base64, io, json, os, pathlib, subprocess, sys, tempfile

# model name → what to call, and roughly what one image costs in dollars.
# The prices are estimates for the dry run; OpenRouter reports the real cost
# of each call and that is what gets printed after it.
FAL = {
    "gpt":  {"t2i": "https://fal.run/openai/gpt-image-2.5/flare/text-to-image",
             "edit": "https://fal.run/openai/gpt-image-2.5/flare/edit", "price": 0.013},
    "muse": {"t2i": "https://fal.run/meta/muse-image/text-to-image",
             "edit": "https://fal.run/meta/muse-image/edit", "price": 0.01},
}
OPENROUTER = {
    "gemini": {"id": "google/gemini-3.1-flash-image", "price": 0.07},
    "gpt":    {"id": "openai/gpt-5-image-mini", "price": 0.02},
}
CATALOGUE = {"fal": FAL, "openrouter": OPENROUTER}
DEFAULT = {"fal": "gpt", "openrouter": "gemini"}
QUALITIES = ["low", "medium", "high", "xhigh", "max"]


def find(want=None):
    """(provider, key, where the key came from), or (None, None, None)."""
    want = want or os.environ.get("BRAND_KIT_PROVIDER")
    found = []
    if os.environ.get("FAL_KEY"):
        found.append(("fal", os.environ["FAL_KEY"], "FAL_KEY"))
    elif sys.platform == "darwin":
        k = subprocess.run(["security", "find-generic-password", "-s", "fal.ai", "-a", "FAL_KEY", "-w"],
                           capture_output=True, text=True).stdout.strip()
        if k:
            found.append(("fal", k, "macOS Keychain"))
    for name in ("OPENROUTER_API_KEY", "OPEN_ROUTER_KEY"):
        if os.environ.get(name):
            found.append(("openrouter", os.environ[name], name)); break
    for f in found:
        if not want or f[0] == want:
            return f
    return (None, None, None)


NO_KEY = ("No image provider on this machine. The session does not need one: show the boards as shipped\n"
          "and mark the imagery `assumed`. To generate, set one of these in the environment (never in chat):\n"
          "  export FAL_KEY=…             # fal.ai, the route the boards were tuned on\n"
          "  export OPENROUTER_API_KEY=…  # OpenRouter\n"
          "Or run the same command with --dry-run and hand the prompts to an image tool the session already has.")


def need(want=None):
    p = find(want)
    if not p[0]:
        raise SystemExit(NO_KEY)
    return p


def model_for(provider, model=None):
    cat = CATALOGUE[provider]
    name = model or DEFAULT[provider]
    if name not in cat:
        raise SystemExit(f"--model {name} is not a {provider} model here. Choose from: {', '.join(sorted(cat))}.")
    return name, cat[name]


def price(provider, model=None):
    return model_for(provider, model)[1]["price"]


def as_ref(raw):
    """Image bytes → a data URL small enough to send as a reference."""
    from PIL import Image
    im = Image.open(io.BytesIO(raw)); im.thumbnail((1024, 1024), Image.LANCZOS)
    buf = io.BytesIO(); im.convert("RGB").save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def to_webp(raw, ratio, width, budget):
    """Crop to the exact ratio, resize, and step quality down until under budget."""
    from PIL import Image
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    w, h = (int(x) for x in ratio.split(":"))
    target = w / h
    if im.width / im.height > target:
        nw = int(im.height * target); im = im.crop(((im.width - nw) // 2, 0, (im.width - nw) // 2 + nw, im.height))
    else:
        nh = int(im.width / target); im = im.crop((0, (im.height - nh) // 2, im.width, (im.height - nh) // 2 + nh))
    im = im.resize((width, int(width / target)), Image.LANCZOS)
    for q in (82, 74, 66, 58, 50):
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=q, method=6)
        if len(buf.getvalue()) <= budget or q == 50:
            return buf.getvalue(), q


def _post(url, body, auth):
    """POST JSON with curl. The key travels in a header file, not on the command line."""
    d = tempfile.mkdtemp()
    hdr, req, out = (os.path.join(d, n) for n in ("h", "req.json", "out.json"))
    try:
        fd = os.open(hdr, os.O_WRONLY | os.O_CREAT, 0o600)
        with os.fdopen(fd, "w") as f:
            f.write(f"Authorization: {auth}\nContent-Type: application/json\n")
        with open(req, "w") as f:
            json.dump(body, f)
        r = subprocess.run(["curl", "-s", "--max-time", "600", url, "-H", "@" + hdr,
                            "--data-binary", "@" + req, "-o", out], capture_output=True, text=True)
        if r.returncode:
            raise SystemExit(f"Could not reach {url.split('/')[2]} (curl exit {r.returncode}). "
                             "Check the network policy allows that host.")
        try:
            return json.load(open(out))
        except Exception:
            raise SystemExit(f"{url.split('/')[2]} did not answer with JSON: " + open(out, errors="replace").read()[:300])
    finally:
        for f in (hdr, req, out):
            if os.path.exists(f):
                os.unlink(f)
        os.rmdir(d)


def _fal_size(model, ratio):
    if model == "gpt":
        return {"image_size": {"1:1": "square_hd", "4:5": "portrait_4_3", "3:4": "portrait_4_3",
                               "9:16": "portrait_16_9", "16:9": "landscape_16_9", "3:2": "landscape_4_3",
                               "4:3": "landscape_4_3"}.get(ratio, "square_hd")}
    return {"aspect_ratio": ratio if ratio in ("1:1", "4:3", "3:4", "16:9", "9:16")
            else {"4:5": "3:4", "3:2": "4:3", "2:3": "3:4"}.get(ratio, "1:1")}


def image(prompt, ratio="1:1", refs=None, model=None, quality="medium", provider=None):
    """Generate one image. `refs` are data URLs (see as_ref); with them the call
    is a redraw from those references. Returns (bytes, dollars)."""
    name, key, _ = need(provider)
    mname, m = model_for(name, model)
    if name == "fal":
        body = {"prompt": prompt, "num_images": 1, "output_format": "png", **_fal_size(mname, ratio)}
        if refs:
            body["image_urls"] = list(refs)
        if mname == "gpt":
            body["quality"] = quality
        payload = _post(m["edit"] if refs else m["t2i"], body, f"Key {key}")
        if "images" not in payload:
            raise SystemExit("fal.ai error: " + json.dumps(payload)[:400])
        raw = subprocess.run(["curl", "-sL", "--max-time", "300", payload["images"][0]["url"]],
                             check=True, capture_output=True).stdout
        return raw, m["price"]
    # OpenRouter: an image model answers a chat completion with the picture attached.
    ratios = ("1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9")
    content = [{"type": "text", "text": prompt}] + [{"type": "image_url", "image_url": {"url": r}} for r in refs or []]
    body = {"model": m["id"], "modalities": ["image", "text"], "usage": {"include": True},
            "messages": [{"role": "user", "content": content}],
            "image_config": {"aspect_ratio": ratio if ratio in ratios else "1:1"}}
    payload = _post("https://openrouter.ai/api/v1/chat/completions", body, f"Bearer {key}")
    try:
        url = payload["choices"][0]["message"]["images"][0]["image_url"]["url"]
    except (KeyError, IndexError, TypeError):
        err = payload.get("error") or payload.get("choices", [{}])[0].get("message", {}).get("content") or payload
        raise SystemExit("OpenRouter returned no image: " + json.dumps(err)[:400])
    cost = (payload.get("usage") or {}).get("cost")
    return base64.b64decode(url.split(",", 1)[1]), (cost if isinstance(cost, (int, float)) else m["price"])


def add_args(p):
    """The provider flags every generating script shares."""
    p.add_argument("--provider", choices=sorted(CATALOGUE), help="force one; default is fal when it has a key, else OpenRouter")
    p.add_argument("--model", help="fal: gpt (default) or muse · OpenRouter: gemini (default) or gpt")
    p.add_argument("--quality", default="medium", choices=QUALITIES, help="fal gpt only")
    p.add_argument("--dry-run", action="store_true", help="print the prompts and the estimate, spend nothing")


def plan(a):
    """(provider or None, model name, price per image) for a dry run or a real one."""
    name = find(a.provider)[0]
    shown = name or a.provider or "fal"
    mname, m = model_for(shown, a.model)
    return name, shown, mname, m["price"]


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("check", help="say which provider is available; exit 1 when none")
    c.add_argument("--provider", choices=sorted(CATALOGUE))
    i = sub.add_parser("image", help="generate one image")
    i.add_argument("--prompt", required=True)
    i.add_argument("--out", required=True, help="where to write it (.webp, or .png to keep it raw)")
    i.add_argument("--ratio", default="16:9")
    i.add_argument("--width", type=int, default=1600)
    i.add_argument("--ref", action="append", default=[], help="an image to redraw from; repeatable")
    add_args(i)
    a = ap.parse_args()

    if a.cmd == "check":
        name, _, where = find(a.provider)
        if not name:
            print("none\n" + NO_KEY); raise SystemExit(1)
        mname, m = model_for(name)
        print(f"{name}  (key from {where}; default model {mname}, about ${m['price']:.2f} an image)")
        return

    name, shown, mname, each = plan(a)
    if a.dry_run:
        print(f"{a.prompt}\n\n1 call on {shown} {mname}, ratio {a.ratio}, about ${each:.2f}."
              + ("" if name else "\nNo key here: hand this prompt to an image tool the session has."))
        return
    refs = [as_ref(pathlib.Path(r).read_bytes()) for r in a.ref]
    raw, cost = image(a.prompt, a.ratio, refs, a.model, a.quality, a.provider)
    out = pathlib.Path(a.out); out.parent.mkdir(parents=True, exist_ok=True)
    if out.suffix.lower() == ".webp":
        raw, _ = to_webp(raw, a.ratio, a.width, 320_000)
    out.write_bytes(raw)
    print(f"{out}  {len(raw) // 1024} KB  {name} {mname}  ${cost:.3f}")


if __name__ == "__main__":
    main()
