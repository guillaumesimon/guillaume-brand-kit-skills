# The discovery conversation

The whole skill stands or falls here. A brand kit built on "we're modern, clean and trustworthy" is a template with a logo on it, and everyone can tell. This file is how you get something better out of someone who has never had to describe a brand before.

## The one rule

**Never ask for the abstraction. Ask for the instance, and derive the abstraction yourself.**

"What are your values?" returns *integrity, innovation, excellence* — every time, from everyone — because the question switches people into corporate register and they recite a memorised list. "Tell me about the last time you turned down money" returns a real value, in the only form that is falsifiable. A value the company has never paid a price for is not a value, it is a preference.

The same holds for personality ("what's your brand personality?" → "friendly and approachable", a description of nobody), for audience ("who's your target?" → "anyone who…", because founders are trained to maximise TAM) and for differentiation ("what makes you different?" → the feature list from the sales deck).

## The refuse-the-first-answer loop

When an answer lands on this list, do not accept it and move on. Ask the follow-up. This is the single behaviour that separates this skill from a form.

`integrity · innovation · excellence · trust · quality · passion · customer-centric · seamless · effortless · empowering · transparency · simplicity · authentic · premium · modern · clean · minimal · professional · disruptive · human`

The follow-up is always the same shape: **ask for the time it cost them something.**

- "Integrity" → "Give me the time integrity cost you money. What happened?"
- "We're premium" → "What does someone get from you that they cannot get for less elsewhere? Not a feeling — a thing."
- "Everyone / any business" → "Who bought most recently, and what were they doing the hour before they signed up?"
- "Modern and clean" → "Name a brand you'd be annoyed to be mistaken for. Why that one?"

If there is no instance, the answer does not exist. Drop it rather than documenting it. An empty field is information; a plausible invented one is a lie the user will repeat to their team for a year.

## Capture verbatim

Keep the user's exact words in a scratch file as you go. Do not paraphrase into your own register while capturing.

This matters more than it sounds. The dominant failure mode of a model doing this job is regression to the register mean: everything comes out sounding like a Series B homepage. Founder verbatim is the antidote, and it is the raw material for tone of voice, for the headline and for the About page. Summarising it destroys the only genuinely proprietary asset in the room.

When you write the kit, prefer their sentence to your sentence wherever theirs is usable. Mark it as theirs.

## The sequence

Three moves, about six minutes of the user's attention. Ask **one question per turn**. Never present a numbered list of six questions — it converts a conversation into a form and the answers collapse to one line each.

**This file used to hold seven moves.** Four of them — the competitive frame, the tension, personality by projection, and the fear — were asking the user to describe a feeling or rank an abstraction, and they are now answered by the visual tournament in `references/tournament.md`, which gets a better answer in four minutes without a single abstract question. What survives below is what is concrete and about the user's own business: moves 1, 4 and 5. They are kept in full because people answer them fast and well, and because no amount of looking at websites will tell you what a company refuses to do.

The four retired moves are still documented here, after the three live ones, because their *follow-up questions* remain the best tools available when a live move returns a generic answer.

Use `AskUserQuestion` when the answer space is genuinely small and you can write the options better than the user can write prose (audience priority, ambition level, which of two sacrifices). Use open prose questions for everything where the value is in their words.

### 1 · Offer and audience — 4 min
> "In one sentence, what do you sell and who buys it? Then: tell me about the most recent person or company who bought. What were they doing the hour before they came looking?"

Fishing for: a specific audience and a **category entry point** — the situation in which someone realises they need this at all. This is the highest-variance input in the whole session. Without it, every downstream output regresses to the category mean.

Force one primary audience. If you get three, ask which one, if you lost them tomorrow, would end the company.

### 2 · Frame and enemy — 4 min
> "What do people compare you to today? And what would you rather be compared to?"
> "Who's the enemy? Not a competitor — a behaviour, a belief or a status quo you want dead."

Fishing for: the **competitive frame** (chosen, not inherited — it determines what "different" even means) and the **antagonist**. Push past company names: "Salesforce" is a competitor; "the idea that enterprise software is allowed to be hostile" is an enemy.

### 3 · The tension — 6 min, the heart of it
> "What do you believe about this market that most of your competitors would disagree with?"
> "What's the most annoying *true* thing a customer says about you?"
> "What do customers think the product is, and what are they actually buying?"

Fishing for: **tension** — a place where two true things collide. Observations are cheap ("customers find returns annoying"). Tension is expensive ("the customer most likely to return is the customer most likely to buy again — so every brand is optimising to repel its best customers").

Ask "what happened next?" once more than feels comfortable. The second-layer answer is the real one.

Test what you have with the so-what ladder: observation → so what → so what → so what. Stop when the next "so what" would change a decision. If it arrives at something universal ("people want to feel valued"), it started too shallow.

### 4 · Difference and proof — 5 min
> "When someone chooses you over the obvious alternative, what's the sentence they say to justify it — to their boss, or to themselves?"
> "And why can't the obvious alternative just copy that?"

Fishing for: the point of difference in the customer's language, and a **structural** reason to believe — architecture, business model, data, origin. Not an attitudinal one. "We care more" is not an RTB. "We're paid a percentage of recovered revenue, so a competitor cannot copy this without inverting their own P&L" is.

Stress-test it live with the onliness sentence: *"We are the only [category] that [difference] for [audience], at a moment when [shift]."* If it hedges, go back to move 3.

**If there is no structural RTB, say so.** Write `No structural reason to believe yet` into the kit and give them the three ways to find one. A confident fabricated RTB is the worst thing this skill can produce.

### 5 · Boundaries — 3 min
> "What would you never do, even if it worked?"

Ask it, then ask it twice more. Boundaries define character far more sharply than aspirations. "We'd never do a free tier." "We'd never use fear in marketing." "We'd never let a customer talk to a bot first."

This is load-bearing. A platform with no sacrifice cannot generate decisions, and generating decisions is the entire function of a brand platform. If you get nothing here, the session has not produced a brand yet — go back to move 2.

### 6 · Personality, by projection — 4 min
> "If the brand were a person at a dinner party: what do they do for work, what are they wearing, and what's the thing they say that makes half the table like them and half the table not?"

The divisive clause is the point. Without it you get "friendly and approachable". Same mechanism works with bars ("what bar is this, and who *doesn't* go there?").

Then: "Which brand — any category — do you wish you'd built? And which one would you be annoyed to be mistaken for?" The second is more useful and more uncomfortable; it is the guardrail that prevents a rejected playback.

Convert everything to operable traits, never adjectives:
```
TRAIT: [word]
  More [X] than [Y]   ← positions it against the nearest neighbour
  But never [Z]       ← stops it becoming a caricature
  Sounds like:        ← one real sentence
```

### 7 · The fear — 1 min
> "What are you afraid this will turn you into?"

Cheap, high-yield, and it stops you building a system the user was never going to be able to accept. Founders almost always have a specific fear: "I don't want to sound like a bank", "I don't want to be cute".

## Archetypes

Useful as fast shared vocabulary between strategy and design, and they stop a team arguing about adjectives for a week. Dangerous because there are twelve of them and ten thousand companies: every fintech becomes Sage, every AI startup becomes Magician. They are category-blind, so they converge — and they invite cosplay, where the brand performs Outlaw while the product is a compliance tool.

Use **archetype + deviation**: "Sage, but with a mechanic's hands, not a professor's." Never present the archetype as an answer; it is a shorthand for the traits, which are the answer.

## Provenance

Every field in the kit carries one of three tags, and the kit shows the counts:

- `stated` — the user actually said this. Quote them where you can.
- `inferred` — you derived it from something they said. Defensible, but theirs to confirm.
- `assumed` — you filled it because the kit needed a value. **Visually distinct, countable, and listed on the home page as work to do.**

Never let an `assumed` field masquerade as a finding. The honest version of this skill is more useful than the confident one, and it is the only version a practitioner would respect.

## Before you write anything, run the tests

Apply these to your own draft positioning. These are gates, not advice — if one fails, regenerate rather than proceeding.

1. **Swap test.** Put a competitor's name on the positioning statement. Still plausible? Then it is not a position. Run it on every sentence, not just the headline.
2. **Reversal test.** Is the opposite something a sane company might deliberately choose? "We make returns harder so margins hold" is a real choosable position, so "we make returns pay" is one too. "We're innovative" fails — nobody chooses "we're stagnant."
3. **Monday-morning test.** Name three decisions this changes next week. If you cannot, it is decoration.
4. **Sacrifice test.** What customer, revenue stream or feature does this forbid? If nothing, there is no position.
5. **New-hire test.** Could someone who joined yesterday use this to write a pricing page and reject a bad idea?
6. **Wallpaper test.** Would this language appear on five competitor homepages? *Seamless, empowering, end-to-end, built for scale, effortless, frictionless* — all wallpaper. Ban them from the output.

## What this session is, and is not

Say this plainly in the kit rather than performing a confidence the session has not earned.

The 30-minute version is **a well-formed hypothesis**. A six-week engagement produces **a defended position**. What is missing, specifically: customer evidence (everything here is founder self-report, which is systematically optimistic and over-broad on audience); a category audit, so nobody has checked whether the "difference" is actually the category's wallpaper; and alignment, because a real process interviews twelve people and half its value is that those twelve feel authorship.

So the kit ends with three things: **"this breaks if…"** (three named conditions that would invalidate it), an **expiry** (next funding round, first marketing hire, or 3× revenue — whichever is first), and **three validation tasks** the user can do in an afternoon:

- Read your last 20 closed-lost reasons and check the competitive frame.
- Screenshot five competitor homepages and check the difference is not wallpaper.
- Ask three customers move 4's question, verbatim, and compare their sentence to yours.
