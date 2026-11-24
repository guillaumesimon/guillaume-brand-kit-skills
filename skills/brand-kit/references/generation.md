# Generating images

When the session makes pictures, with what, and who pays. The short version: the session never needs a key, a key makes three things better, and the user agrees to the spend once.

## What gets generated, and what never does

**HTML for anything that has type or layout. An image model for pictures only.**

A model that draws a landing page draws a plausible one: the fonts are approximations, the spacing is nobody's scale, and the user ends up judging a rendering instead of the system. The artefact, the boards' frames, the social tile and the app icon are built in HTML from the real tokens and the real faces, always.

| Generated, when a provider is there | Never generated |
|---|---|
| The photography board, re-shot on the brand's own scene | A duel. Duels are real sites (`references/tournament.md`) |
| The illustration board, redrawn on the brand's scene and palette | A page, a screen, a mock-up of the product |
| One or two pictures inside the Act 3 artefact | A logo or a wordmark |
| The brand's own imagery set, in Act 4 | Anything shown as if it were a photograph of the real business |

Quick mode generates nothing (`references/quick.md`).

## Three situations

Find out which one you are in before Act 2, silently:

```bash
python3 assets/gen.py check
```

It prints the provider and where the key came from, never the key, and exits 1 when there is none.

| Situation | What `check` says | What the session does |
|---|---|---|
| **A key** | `fal` or `openrouter` | Everything in the left column above, after one agreement on cost |
| **No key, but an image tool in the session** | `none` | The artefact pictures and the brand set, through that tool. Boards as shipped |
| **Neither** | `none` | Boards as shipped, imagery marked `assumed`, labelled placeholders on the site. A complete session |

**Never open with the key.** A setup step before the first question teaches the user this is an installation, and the first question decides the session (`references/session.md`). Say it once, at the moment it would change something, which is the first board you would otherwise regenerate:

> "Je te montre la planche générique. Avec une clé fal.ai ou OpenRouter dans l'environnement, je pourrais la refaire sur ta propre scène ; ce n'est pas nécessaire pour avancer."

Then carry on with the shipped board. Do not bring it up again.

### The key itself

- It lives in the environment: `FAL_KEY` for fal.ai, `OPENROUTER_API_KEY` for OpenRouter. The scripts read it there and pass it to the request in a header file that is deleted at once.
- **Never ask the user to paste a key into the conversation**, and never write one into a file, a command you show, or the kit. If one is pasted anyway, do not use it from the chat: ask them to set it in their environment, and tell them a key that has been pasted somewhere should be replaced.
- When both are present, fal is used. `--provider openrouter` forces the other.

## The two providers

| | fal.ai | OpenRouter |
|---|---|---|
| Default model | GPT Image 2.5 Flare, `medium` | Gemini 3.1 Flash Image |
| One image | about $0.013 | about $0.07 |
| A board (7 images) | about $0.09 | about $0.50 |
| Other model | `--model muse`: cheaper, looser | `--model gpt`: cheaper |
| Status | the route the prompts were written and tuned on | same prompts; holds a composition from a reference, less tested on the illustration styles |

The figures are estimates and they move. `--dry-run` on any command prints the estimate for the provider this machine would use, and each real run prints what it actually cost. Quote those, not this table.

## One agreement on cost

Generation spends the user's money, so they say yes before the first image. Ask **once, for the session, with a ceiling**, at the first moment a picture is needed:

> "Générer les images de la session (deux planches sur ta scène, deux visuels pour la maquette, puis une dizaine d'images pour le kit) coûte environ 0,40 $ sur fal.ai. Je peux y aller jusqu'à 1 $ sans te redemander ?"

Work the figure out from the dry runs, with the provider you actually have: on OpenRouter the same session is about $2. This is a question about the session, like the choice of mode. It is not one of the twelve brand decisions, and it is the only one of its kind.

After a yes: generate without asking again, say what each batch cost in one line, and stop and ask before going past the ceiling. After a no: the session continues as if there were no provider, and you do not ask again.

Before any run, `--dry-run` it and read the prompts. A prompt is sent to an outside service: it describes a scene, and it carries no company name, no person's name and nothing confidential about the product.

## Where each picture comes from

### The boards, on the brand's scene

`references/photography.md` and `references/illustration.md` have the commands. One scene, generated once as a master, then every other card redrawn from that master, so only the direction varies. Both scripts take `--out "$SCRATCH"` and never rewrite the shipped boards.

Regenerate a board only when the ledger is still open on it and the board is going to be shown. A board that is going to be asserted does not need the brand's scene.

### The artefact, in Act 3

When the imagery slot is not `none`, the artefact should carry a real picture, because a hero with a grey box where the photograph goes is judged as a wireframe. One picture for the site surface, a second for the social tile if it needs its own crop, and no more:

```bash
python3 assets/gen.py image --dry-run --ratio 16:9 --prompt "<the photography recipe, then: Subject: …>"
python3 assets/gen.py image --ratio 16:9 --out "$SCRATCH/artefact/hero.webp" --prompt "…"
```

Write the prompt the way `imagery.py brand` does: the recipe you have just specified (light, lens, casting, colour, and the *never* list), then the subject, taken from the user's own words in Act 1. For an illustrated brand, the style, construction and palette, and `--ref` with the chosen card from the illustration board so the hand carries over.

Look at the picture before the user does. Run it through the any-company test (`references/photography.md`); if it would sit as well on a competitor's page, change the subject, not the adjectives, and regenerate once. Tell the user what it is when you show the artefact, in the same line that says what is being judged:

> "La photo est générée, elle indique une direction, pas un vrai shooting."

Then keep the picture: if the direction survives Act 3, it is the first entry of the brand set.

### The brand set, in Act 4

`python3 assets/imagery.py brand brand/` generates every imagery entry in `tokens.json` that has a prompt and no file yet. It is step 5 of Act 4 in `SKILL.md`, and it is covered by the same agreement.

## No key, but the session has an image tool

Some sessions have an image tool of their own (a connector, a host feature). It replaces the provider for single pictures, not for the boards:

1. Run the command with `--dry-run`. It prints the exact prompts and says there is no key.
2. Give each prompt to the tool, at the ratio printed, and save the result where the command would have written it (the `--out` path, or the entry's `src` under `brand/`).
3. Tell the user if the tool spends their credits, under the same single agreement.

The boards stay as shipped in this situation. Each needs seven pictures redrawn from one master and folded back into the page, which is what the scripts do and a chat tool does not. Do not assemble a board by hand from seven unrelated generations: with the composition varying, people choose the picture they like rather than the direction, which is the failure the boards were built to avoid.

## When a call fails

A provider error, a refusal, a timeout: retry once, then go on without the picture and say so. A missing picture is a labelled placeholder; it is never a reason to stall the session or to substitute a picture from somewhere else.

## What generated imagery is, in the kit

Direction, not evidence. Every generated picture is marked `assumed` on its page until a real shoot or a real illustrator replaces it, and the kit says so on the Photography and Illustration pages (`references/kit-pages.md`). A generated image of a customer who does not exist is never captioned as a customer.
