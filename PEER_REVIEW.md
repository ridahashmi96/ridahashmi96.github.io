# Q+U — Peer Review
**Date:** October 12, 2026 | **Reviewer:** Claude  
**Scope:** The organization website (`index.html`, `src/`) and the strategy it presents, as of commit b7e750b. The scanner fork is reviewed only as it appears on the site.

---

## Executive summary

**Status:** ✓ A credible pre-build company page. The thesis is clear, the evidence is mostly sourced, and the design is distinctive. It is not yet a page a CISO would act on, because there is no way to contact the team other than GitHub.

**Strengths:** One sharp idea (sequence the migration, not just rank the inventory), honest about being pre-build, sourced evidence table, consistent visual system in both themes.  
**Gaps:** No contact route, several claims still awaiting primary sources, strategy material that reads as an internal memo on a public page.  
**Risk:** Publishing competitor assessments and "what we must prove" on a public site hands competitors and prospects a map of the company's doubts. Decide deliberately.

---

## Positioning and argument

**Grade: A−**
- ✓ The hero states the difference in one sentence: today's tools rank, Q+U sequences and carries through.
- ✓ "Your calendar is a security input" is the most memorable and defensible line on the page. Lead with it more.
- ✓ The three-layer engine (risky, matters, required) is easy to repeat, which is what a positioning needs.
- ⚠ "Secure transition sequencing" is a category name nobody is searching for yet. Fine as an eyebrow, but the meta description and first paragraph should also use words buyers use: post-quantum migration planning, crypto-agility, PQC roadmap.
- ⚠ The page argues the migration is risky but never shows a sequenced plan. One illustrative schedule (three systems, a quarter-close freeze, exposure falling) would do more than any paragraph. The hero animation gestures at it; a diagram in The platform would land it.
- ⚠ "Q+U" is explained nowhere on the page. The earlier version had "quantum plus you"; it was lost in the redesign and should come back, probably in the footer or the team section.

## Evidence and claims

**Grade: B+**
- ✓ The stats band and the evidence table cite ISACA 2025, Verizon DBIR 2025/2026 and the UC San Diego phishing study. Each is a real, checkable source.
- ✓ The unsourced pitch figures (ransomware per second, $10.5 trillion) were kept off the page. Keep them off until sourced.
- ⚠ The citations are names, not links. Add the URLs; a security buyer will check.
- ⚠ "In our founding research, many businesses could not say which data mattered most" refers to the NYU thesis but does not say so where the claim is made. Cite it inline.
- ⚠ "Federal migration plans are being aligned to those dates" stands in for EO 14412 and OMB M-26-15, which the strategy doc flags as unconfirmed. Either verify and name them or leave the sentence as is; do not drift back to naming them without the check.
- ⚠ The 2030 and 2035 dates come from a NIST draft (IR 8547 ipd). Say "proposes", as the Why now section does, everywhere the dates appear. The stats band says "deprecates" as if final.
- ⚠ "Incumbents will likely add scheduling within 12 to 24 months" is an estimate presented as a forecast. Fine internally; on a public page, soften or cut.

## What is on a public page

**Grade: C+** (a judgment call, not a defect)
- The competition table names eight vendors with one-line dismissals. Accurate or not, it reads as internal analysis and invites rebuttal from companies with legal teams.
- "What we must prove next" and "Open questions" are excellent discovery discipline and unusual to publish. They may charm an investor and worry a buyer.
- Recommendation: keep the public page to problem, insight, platform, scanner, who it's for, why now, team and contact. Move competition, business model detail, proofs and open questions to a second page that is linked from an investor note, or to the repo's `docs/`. The content is good; the audience is wrong.

## Design and front end

**Grade: A−**
- ✓ The hero does what the Harmoniqs reference does: one colour field, one animated object, tight display type, two buttons. It is recognisably Q+U rather than a copy, because the wave and hoop carry the company's own idea.
- ✓ Light and dark themes are both complete, with tokens on `:root`, a toggle, a session override and a time-of-day fallback. The paper palette in light mode keeps continuity with the earlier version.
- ✓ Sticky section labels with sub-captions give a long page a spine.
- ✓ Reduced-motion users get a still frame and no reveals.
- ⚠ The wave draws about 7,000 points plus a 900-point hoop every frame on the main thread, forever, even when the hero is scrolled away. Pause when the canvas leaves the viewport (an IntersectionObserver is already on the page) and consider halving the grid on narrow screens.
- ⚠ The pill nav hides every link except the CTA below 900px and relies on a hamburger that opens the pill in place. It works, but there is no overlay and no escape key handling. Acceptable for now; note it.
- ⚠ Between about 900 and 1100px the pill can crowd the brand mark. Drop two items at that range or shorten labels.
- ⚠ `color-mix()` is used for hover tints and the vignette. Fine in current browsers; add a plain fallback colour before it for older ones.
- ⚠ Headline contrast is excellent; `--fg-soft` on dark (#A9B4C8 on #0B1426) passes AA for body text but is borderline for the smallest uppercase labels. Check the eyebrow and stat captions.

## Code and repository

**Grade: B+**
- ✓ No build step, three source files, one dependency (Google Fonts). Anyone on the team can edit it.
- ✓ `.nojekyll` is present, which fixed the Pages build failures after the repo was flipped private and back.
- ✓ `?theme=` and `?t=` query parameters make screenshots and reviews reproducible.
- ⚠ Cache-busting is a hand-edited `?v=` suffix on three tags. Easy to forget. A tiny script, or a convention of bumping all three together, would help.
- ⚠ The team photos are committed at 480px JPEG, which is right for the page, but the originals live only on one laptop's Desktop. Keep originals somewhere shared.
- ⚠ No tests, which is reasonable for a static page, but an HTML validity check and a link check in CI would catch the two kinds of breakage that have happened in this repo already (bad build, stale links).

## Scanner section

**Grade: B**
- ✓ Honest framing: a fork of AC Scanner, unmodified, for internal and pilot use, with credit to Qubitac and the AGPL noted.
- ✓ The detect/recognize cards translate the README's algorithm tables into something a non-cryptographer can read.
- ⚠ The section promises "our own public-surface scanner before the platform serves paying customers" with no date or scope. Either add a rough milestone or make it a backlog item rather than a public promise.
- ⚠ The fork's GitHub repo has no README changes, topics or description saying it is a prototype fork. Visitors who click through land on Qubitac's branding.

## Privacy and hosting

- The site is public and must be: GitHub Pages on a free organization plan serves public repos only, and org-member-only Pages needs Enterprise Cloud. The attempt to go private took the site down for about an hour on October 12.
- If a private preview is needed, a password-protected deploy on Netlify or Cloudflare Pages is the practical route, and it can run alongside the public site from the same repo.

---

## Ten things that matter most

1. Add a real contact route (email alias or form). Nothing else on the page converts without it.
2. Decide which sections are public and move the rest to an investor page.
3. Link every citation, and cite the thesis where "founding research" appears.
4. Bring back the one-line explanation of the name.
5. Say "proposes" wherever the 2030 and 2035 dates appear.
6. Add one illustrative sequenced schedule diagram in The platform.
7. Pause the wave when the hero is off screen; reduce the grid on phones.
8. Verify EO 14412 and OMB M-26-15 before naming them, or leave them unnamed.
9. Set a custom domain and Open Graph image before sharing the link widely.
10. Give the scanner fork its own README header, topics and description.
