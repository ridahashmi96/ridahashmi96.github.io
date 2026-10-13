# Backlog

Open work for the Q+U website and the material it presents. Ticked items are done; the rest is in rough priority order within each section. `PEER_REVIEW.md` has the reasoning behind most of these.

## Discovery (before any code)
- [ ] 8 to 10 conversations with CISOs, integration leads and MSPs at regional banks, insurers and health systems (owners: Brianna, Carolina)
- [ ] One design partner for a thin end-to-end slice: audit, first sequenced plan, one cutover
- [ ] Confirm the starting point is real: buyers say they don't know what to protect first and would pay to find out
- [ ] Confirm transition risk is a distinct, payable problem rather than "something the platform vendor handles"
- [ ] Confirm what access organizations will grant to inventory and systems, and under what security and contract terms
- [ ] Freedom-to-operate check against risk-based patch-sequencing patents
- [ ] Market size with a source, before any external use
- [ ] Pricing hypotheses for audit, deployment stages and subscription tiers; target services/subscription mix

## Content and claims on the site
- [ ] Verify Executive Order 14412 and OMB M-26-15 against the primary texts, then name them in "Why now" (currently described only as "federal migration plans are being aligned")
- [ ] Source or drop the elevator-pitch cost figures (ransomware per hour, $10.5 trillion cybercrime, $53,000 downtime per hour, 91% without a PQC roadmap, half of enterprises unprepared); none are on the site yet
- [ ] Source the "founding research" line in The problem (it refers to the NYU thesis; link or cite it there)
- [ ] Confirm the ISACA 2025 figures (5%, 55%, 30%) and the DBIR 2026 figures (62%, 48%, 15 techniques) against the reports and add links
- [ ] Decide whether competition, business model, "what we must prove next" and open questions belong on a public site or in an investor page
- [ ] Settle the name: Q+U is live; Q+U+Bit, Qrypto and Enqrypt were also proposed
- [ ] Team bios: confirm each person's wording; add Daniel's university if wanted
- [x] Team photos and LinkedIn links
- [x] American spelling throughout

## Website
- [x] Harmoniqs-style hero on a canvas; light/dark theme following system preference and time of day
- [x] Particle wave with a hoop as the migration front
- [ ] Real contact route: a form or an email alias instead of "open an issue" on GitHub (needs a domain or a form service)
- [ ] Custom domain (decide: qplusu.com, qplusu.ai or other) and HTTPS via Pages
- [ ] Open Graph and Twitter card images, so links unfurl with the wave rather than a blank card
- [ ] Favicon set beyond the SVG mark (PNG fallbacks, apple-touch-icon)
- [ ] Mobile pass on a real phone: hero height, wave density and the pill menu; headless screenshots only approximate it
- [ ] Performance budget: the sequencing disc pauses when scrolled off screen (IntersectionObserver); still cap the frame rate on battery
- [ ] Accessibility pass: contrast of `--fg-soft` on both themes, focus order through the pill nav, skip link target
- [ ] Analytics decision (none today); if added, cookie-free
- [ ] Privacy: if the site must be org-only, move to a password-protected host (Netlify or Cloudflare Pages); GitHub Pages cannot restrict viewers below Enterprise Cloud
- [ ] Nav wraps at some widths between 900 and 1100px; consider dropping "Next" and "Model" from the pill at that range

## Scanner
- [ ] Decide what Q+U changes in the fork, or keep upstream unmodified for pilots as the site states
- [ ] Define the Q+U inventory format and write the converter from AC Scanner's CBOM output
- [ ] Plan the Q+U public-surface scanner on permissively licensed components, required before serving paying customers (AGPL on the upstream)
- [ ] The fork is public and cannot be made private as a fork; if it must be private, recreate it as a fresh repo
- [ ] Add topics and a description to `q-u-scanner-prototype` that say it is a prototype fork

## Platform (after discovery)
- [ ] Inventory schema and dependency map
- [ ] Engine v1: exposure-minimization objective over inventory, dependencies and team capacity
- [ ] Business and calendar layer from the audit
- [ ] Obligations library for one sector, likely banking
- [ ] Playbook modules written down as fixed-scope services
- [ ] Research design with an academic collaborator: one partner, one milestone, one measure
