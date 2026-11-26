# The interview

Three minutes of talking, at most. The board does the rest. This file says what to ask, what never to ask, and how to read the brief back.

## Open with what you understood

Read what exists first: the README, the docs, the site, a deck, an older brief, `brand/audit/AUDIT.md`. Every fact you find is a question you do not ask; record it with `source: "documented"`.

Then say what you understood in two sentences and let them correct it:

> "Si je lis bien : [ce que fait le produit, pour qui], et l'idée centrale est [ce qui le distingue]. C'est juste ?"

It costs the user a yes, and a wrong one gets corrected with better data than a question would have returned. Never open with "tell me about your business" or "what should the brand feel like?".

## The three questions

Ask only what the reading left open, one per turn, never more than three. In order of value:

| If you do not know… | Ask | You get |
|---|---|---|
| who really buys | "Who bought most recently, and what were they doing the hour before?" | a real buyer and the moment of need |
| what it replaces | "What do they use today instead? And what does that do *better*?" | the real competitor, and what must be matched |
| what it will not do | "What would you never do, even if it worked?" or "Tell me about the last time you turned down money." | a value, with the instance that proves it |
| why it wins | "When someone picks you over the obvious choice, what sentence do they say?" | the difference, in the customer's words |
| where it is going | "In five years, which is closest?" with three futures you wrote | the ambition, closed |

Skip any of them when the site already answers. A founder whose site says "the judgment stays yours" has answered the third.

## Wording a question

Cheapest form first:

1. **A reformulation to confirm.** "So the buyer is the partner of a search firm, not HR. Right?"
2. **A closed question whose options are your hypotheses about this project.** Three or four answers written from what you read, plus "something else". Use `AskUserQuestion` when it exists.
3. **An open question about an instance**, only for what lives in their words: a story, a refusal, a customer's sentence.

A closed question with generic categories ("SMEs · large companies · individuals") is a form. The options must be things only someone who read this project could have written:

> If you lost one of these tomorrow, which would end the company?
> · Partners of retained search boutiques · In-house talent teams of scale-ups · Recruiting agencies working on volume · Someone else

Record the options offered, not only the answer.

## What is never asked

The first version of this skill asked these, and the user had no answer and lost patience:

- **Where the logo will live, or where it must not fail.** Derive it from the product. A phone app means an app icon. A Chrome extension means a 16 px toolbar icon. A product that writes on LinkedIn means a profile picture. A shop means a sign and a bag. Write each as a logo context with `source: "inferred"` (or `"assumed"` when it is a guess), and show them in the read-back.
- **Formats, reproduction, technical constraints.** Same: derive, then show.
- **"What are your values?", "what is your personality?", "what emotion?"** A subject on the board answers, or an instance does.
- **Anything about taste in words.** "Do you prefer minimal or expressive?" is what the board is for.
- **"Do you like it?"** It has a socially obligatory answer. Ask "what is wrong in this?".

When you are about to ask something, check: could this person answer in ten seconds, without design vocabulary, and would they see why you ask? If not, derive it or drop it.

## Refusing a generic answer

When an answer is on this list, do not write it down and move on:

`integrity · innovation · excellence · trust · quality · passion · seamless · effortless · transparency · simplicity · authentic · premium · modern · clean · professional · human` and their French equivalents.

Ask once for the time it cost something: "Give me the time integrity cost you money." If there is no instance, leave the field empty and say why in `declared_empty`. Do not push twice: the session is short, and an empty field is information.

## "I don't know"

Never repeat the question. Go down one step: open → closed with hypotheses → **assert it yourself with a free undo**:

> "Je tranche : [X], parce que [ce qu'ils ont dit]. Dis-moi si c'est faux."

Record it as `inferred`.

## The read-back

After the board, in chat. Four or five sentences, their words where you can, no jargon, and what you derived without asking:

> "Si je résume : une marque pour [qui], qui doit donner le sentiment de [quoi]. [Sujet 1 en mots simples]. [Sujet 2]. Jamais [ce qu'ils ont refusé]. J'ai supposé que le logo devra vivre [contextes déduits]. Qu'est-ce qui est faux là-dedans, ou trop gentil ?"

Require one correction: a read-back accepted without a word has not been read. Treat "that's interesting", "it's fine", "whatever you think" as a no, and say so: "Ça ressemble à un non. Qu'est-ce qui cloche ?"

When it is confirmed, set `meta.status` to `validated`.

## Founder's taste against the audience's need

What the founder picks on the board is their taste. It becomes a need of the brand only when it serves the buyer. When the two pull apart (a founder drawn to dense, dark developer tools, selling to people who are not developers), say the risk in one sentence, propose a way through, and let them decide. Record it in `preferences.founder_vs_audience` with who decided. Never replace their choice silently.
