# Taste calibration

Run this before the kit is written. It is a gate, not advice: a system that fails these does not go out.

The separation between a visual system that looks like a studio made it and one that looks like a template is almost entirely checkable. Most of it is counting.

## The counts

1. **Typefaces: 1 or 2.** Three only if the third is a mono with a job. Four is a template.
2. **Weights: 3.** Four maximum. Five is a template.
3. **Hues: one brand hue plus neutrals is ideal.** Two is fine. Three needs a written reason. A palette page with eight swatches of different hues is the loudest template signal that exists.
4. **Brand colour surface share in product: 2–5%.** If a screenshot is more than 10% brand colour, it is wrong.
5. **Radius values: one scale, 3 values maximum** (e.g. 4/8/16). Mixed radii across components is the fastest way to look assembled.
6. **Shadow levels: 0 or 3.** Never "some shadows, roughly".
7. **Accent colours per screen: 1.** Two competing accents means no hierarchy.
8. **Display-weight headlines per page: 1.** If everything is the hero, nothing is.

## The measurements

9. **Every spacing value is on the scale.** A single `padding: 22px` is detectable and reads as sloppy. Audit for off-scale values.
10. **The ratio between the largest type and the body is ≥4:1** on a marketing page. Timid hierarchy — an h1 at 28px above 16px body — is the most common amateur signal after inconsistent spacing.
11. **Display leading ≤1.1.** A 64px headline at 1.5 line-height is an immediate, unmissable tell.
12. **Display tracking is negative.** Zero tracking at 72px looks loose and unfinished.
13. **Body measure 60–75 characters.** Full-width body text on a 1440px screen is a tell.
14. **All body text ≥4.5:1, computed and asserted.** Grey-on-grey at 3:1 is the "designed by a developer" signature.
15. **Section padding ≥ 3× the largest internal padding.** Pages where sections run together read as flat.
16. **Inner gaps at least two scale steps smaller than outer gaps.**

## The judgement calls

17. **Restraint beats expression.** The reliable diagnosis of an amateur system is that it contains *too much*: too many colours, gradients, shadows, weights, icons, illustrations, animations. Removal is almost always the correct edit. Forcing function: **delete the third most prominent element on every screen.**

18. **Specificity of choice.** Studio systems contain values nobody would arrive at by accident — a ground of `#FAF8F3` rather than `#FFFFFF`, a text colour of `#1A1C1E` rather than `#000000`, a radius of 6px rather than 8px, a display tracking of −0.034em. **Rounded-to-the-default values everywhere are a template signature.** Avoid pure black, pure white and 50% grey entirely.

19. **The one weird detail.** Every system that looks like a studio made it contains exactly one decision that is slightly strange and completely committed to: an unexpectedly wide tracking on one label style; a colour used in only one place; an off-grid element on every page; a serif italic inside an otherwise sans system; a rule that extends past the content edge; one number set in mono among sans.
**One.** Two is a style. Three is chaos. Zero is a template. Generate it deliberately and write it into the kit as a rule, so nobody "fixes" it later.

20. **Asymmetry somewhere.** At least one intentional off-centre relationship. Perfect symmetry everywhere reads as a page builder.

21. **Nothing looks default.** Audit for: Tailwind blue `#3B82F6` · a `0.5rem` radius with no rationale · default `box-shadow` values · default `ease` transitions · Helvetica, Arial or `system-ui` visible anywhere · Heroicons at default size · a purple-to-blue gradient. Any one is a tell; two together is diagnostic.

## The five renders

22. **Greyscale.** Render the system without colour. If the hierarchy still works, it is built on structure. If it collapses, colour is carrying work that size, weight and space should be doing.
23. **Squint.** Blur the page to 20px. You should see three or four clear blocks with an obvious reading order. Even grey mush means no hierarchy.
24. **16px.** Wordmark, icons and device at 16px in one colour. If anything disappears, it is not finished.
25. **Cover the logo.** If two artefacts are not recognisably from the same company, you have assets, not an identity.
26. **The sombre test.** Render one artefact carrying bad news — an outage notice, a price rise, a condolence. If the system cannot be serious, it is a costume.

27. **Real copy, never lorem ipsum.** Placeholder text hides every hierarchy problem and every measure problem. A system presented with lorem ipsum has not been tested.

28. **Consistency of decision, not of appearance.** The mark of a real system is that two artefacts which look quite different are obviously governed by the same rules. Templates achieve consistency by making everything the same; systems achieve it by making everything obey.

---

**The sentence to hold on to:** a real identity is not a collection of nice-looking things. It is a small set of firmly held rules, applied without exception, one of which is slightly strange.
