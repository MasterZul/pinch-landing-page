# Pinch landing page — research notes

Researcher findings for the Pinch landing page (see `SPEC.md`). Part 1 summarises what the research says; Part 2 is the pass/fail checklist the tester uses to audit the finished page and write `REVIEW.md`.

## 1. Findings summary

### Hero clarity
- Visitors decide in roughly **5–10 seconds** whether a page is relevant to them. The hero should say what the product is, who it's for and what you get from it, in plain words, above the fold. Lead with the benefit, then name the feature ("Slash reporting time…" rather than "Advanced dashboards"). [Storylane](https://www.storylane.io/blog/saas-landing-pages-best-practices), [Design Studio](https://www.designstudiouiux.com/blog/saas-landing-page-design/)
- **Show the product** in the hero: a real screenshot or a short animated workflow does better than abstract art. Pinch's live mock kanban `.board` does this job. [Landingi](https://landingi.com/landing-page/saas-best-practices/)
- Treat the page as a **sequenced sales conversation**: each section should answer the next objection a visitor has (what is it → what does it do → how hard is it → what does it cost → doubts (FAQ) → act). [Spike](https://getspike.ai/blog/saas-landing-page-best-practices/)

### CTA placement
- Have **one primary goal** (a single "Start free" action, the self-serve/PLG pattern), repeated at natural decision points: nav, hero, each pricing plan and the final CTA. Secondary actions should look visibly weaker (ghost button). [Landingi](https://landingi.com/landing-page/saas-best-practices/), [Spike](https://getspike.ai/blog/saas-landing-page-best-practices/)
- CTA text should be **action-plus-outcome verbs** ("Start pinching free", not "Submit"). Put reassurance next to the CTA (no credit card needed, free plan forever).
- Unbounce reports **most SaaS landing visits are mobile** (Lovable cites 79%). The CTA must be easy to reach and tap on a narrow screen. [Lovable](https://lovable.dev/guides/saas-website-best-practices), [Unbounce](https://unbounce.com/landing-pages/whats-a-good-conversion-rate/)
- Benchmarks: the median SaaS landing page converts at about 3.8%, and the top quartile at 11.6% or more. [Lovable](https://lovable.dev/guides/saas-website-best-practices)

### Social proof
- Social proof works as a **trust argument, not decoration**. Place it next to the points where conversion is decided (near the CTA and under pricing). "Proof stacking" means combining logos, specific testimonials and usage numbers. Buildium raised trial sign-ups 22% just by improving its testimonial headings. [Lovable](https://lovable.dev/guides/saas-website-best-practices), [VWO](https://vwo.com/conversion-rate-optimization/conversion-rate-optimization-statistics/)
- SPEC has no testimonial section. A light proof line (for example "Loved by 2,000+ tiny teams") in the hero or near the CTA is a cheap win. It is optional and not a fail if missing.

### Pricing patterns
- Use **3 tiers with the middle one highlighted** (decoy/anchor effect), a clear "Most popular" badge, and the price shown big with its period.
- A **monthly/yearly toggle** should show the yearly saving ("Save 20%") and update every price on the page. It should behave as an accessible toggle (`aria-pressed`), and the price change should not shift the layout.
- Plan features belong in a scannable `ul`. Every plan needs its own CTA, and the free tier lowers friction.

### Accessibility (WCAG 2.2 AA essentials)
- **Contrast 1.4.3 / 1.4.11:** text needs 4.5:1 (3:1 for large text, meaning ≥24px, or ≥18.66px bold). UI components and focus rings need 3:1. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- **Palette check (computed):** `--text` on `--bg` ≈ 15:1 ✅. `--muted` on `--bg` ≈ 5.4:1 ✅. `--ink` on `--accent` ≈ 6.9:1 ✅. White on `--accent-dark` ≈ 4.6:1 ✅ (only just).
  - ⚠️ **White on `--accent` (#e8835a) ≈ 2.7:1 ❌**. Primary buttons must use dark text (`--ink`/`--text`) or the `--accent-dark` background.
  - ⚠️ **`--accent` as text on `--bg` ≈ 2.6:1 ❌**.
  - ⚠️ **`--accent-dark` text on `--bg` ≈ 4.4:1**, which passes only for large or bold-large text.
- **Focus visible 2.4.7** plus the new **2.4.11 Focus Not Obscured (AA)**: a focused element must not be hidden behind the sticky `header.nav`. Fix with `scroll-padding-top`. [AudioEye summary](https://www.audioeye.com/post/whats-new-with-wcag-2-2/)
- **Target size 2.5.8 (AA, new):** pointer targets ≥ 24×24 CSS px, or spaced so they don't overlap. 44px is the comfortable choice for the nav toggle and buttons. [W3C Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- **Moving content 2.2.2:** the auto-moving board cards are animation that starts automatically. The page should respect `prefers-reduced-motion` and/or give a way to pause it. Reduced motion should also turn off reveal transitions and smooth scroll.
- **Labels 1.3.1 / 3.3.2 / 4.1.2:** the email input needs a real label (visually hidden is fine), its errors must be announced (`aria-invalid` plus a text message, ideally in an `aria-live` region), and every icon-only button needs a name.
- **Structure:** one `h1`, headings in order (note: the `.board__col` `h4`s sit inside the hero with no h2/h3 before them, which skips levels; consider `aria-hidden` on the decorative board or use `p`/`h3`), landmarks, a skip link, and `lang` on `<html>`.

### Performance basics
- Core Web Vitals targets: **LCP < 2.5s, INP < 200ms, CLS < 0.1** ([web.dev/vitals](https://web.dev/articles/vitals)).
- No framework, so the page should be small:
  - Preconnect to Google Fonts and use `display=swap`, loading only the weights actually used.
  - Load `script.js` with `defer`.
  - Use inline SVG icons (no icon font).
  - Use IntersectionObserver for reveals rather than scroll handlers. Scroll listeners should be passive or throttled.
  - Animate only `transform`/`opacity`.

## 2. Review checklist (tester: mark each PASS / FAIL with a note)

**Hero and conversion**
1. **Hero clarity.** Within the first viewport (1280×800 and 375×812), the `h1.hero__title` plus `p.hero__sub` say what Pinch is (a task tracker), who it's for (small teams) and the benefit. There is exactly one `<mark>` word in the h1.
2. **Primary CTA above the fold.** `.hero__actions` has a visually dominant `a.btn.btn--primary` with action text (not "Submit" or "Click here") and a visibly weaker `a.btn.btn--ghost`. Both are visible without scrolling on mobile.
3. **CTA repetition and consistency.** A primary CTA appears in the nav (`.nav__cta`), the hero, each `article.plan`, and `form.cta__form`. The wording is consistent and every link target resolves (no dead `#` links).
4. **Reassurance near the CTA.** Microcopy such as "free forever / no credit card" sits next to the hero CTA or in `p.cta__note`. Optional social-proof line: note it, but missing it is not a fail.
5. **Section order matches SPEC.** nav → hero → features (6 `article.feature`) → how (3 `li.step` in `ol.steps`) → pricing (3 plans) → faq (5 `details`) → cta → footer containing "©2026 Pinch Co.". All SPEC class names and IDs are present.

**Pricing**
6. **Featured plan.** Only the middle plan has `.plan--featured` and it stands out visually (badge, border or elevation). Each plan shows the amount, `span.plan__period`, a `ul.plan__list` and an `a.btn`.
7. **Billing toggle works.** Clicking `[data-billing=yearly]` updates every `.plan__amount` to its `data-yearly` value, and monthly reverts it. `.is-active` and `aria-pressed="true|false"` move together. The buttons work with the keyboard (Tab plus Enter/Space). The price change causes no layout shift.

**Accessibility**
8. **Text contrast.** All body, muted and button text is ≥ 4.5:1 (large ≥ 3:1). Specifically: primary button text on `--accent` is NOT white (white is ≈ 2.7:1). `--accent` is not used for small text on `--bg`/`--surface`.
9. **Focus visible.** Every interactive element (links, buttons, `summary`, input, nav toggle, billing buttons) shows a clear `:focus-visible` outline with ≥ 3:1 contrast. Fail if any rule uses `outline: none` without a replacement.
10. **Focus not obscured.** When tabbing to in-page targets, nothing is hidden under the sticky nav. `scroll-padding-top` (or an equivalent) is ≥ the nav height.
11. **Keyboard and mobile nav.** `button.nav__toggle` has `aria-label`, toggles `aria-expanded` and `body.nav-open`, and is reachable and usable by keyboard. Escape or a link click closes the menu. There is a skip link to the main content (recommended).
12. **Target size.** Buttons, nav links, the toggle and `summary` rows are ≥ 24×24 CSS px (ideally 44px) at 375px width.
13. **Reduced motion.** With `prefers-reduced-motion: reduce`, the board auto-move stops (or becomes instant or static), `.reveal` content is visible immediately with no transition, and smooth scroll is off. Content must never stay hidden if JS fails or is disabled.
14. **Form labelling and errors.** The email input has an associated `label.visually-hidden` (`for`/`id` match), `autocomplete="email"` and `required`. Bad input sets `aria-invalid="true"` and shows a text error that is announced (live region). A valid submit adds `.cta__note.is-success` with no network request and no page reload.
15. **Semantics.** `<html lang="en">`, a single `h1`, no skipped heading levels in the content (check the board `h4`s), and landmarks (`header`, `nav`, `main`, `footer`). Decorative SVG/crab art has `aria-hidden="true"` and meaningful icons have accessible names. `.visually-hidden` is defined in styles.css using the standard clip pattern, not `display:none`.
16. **FAQ.** 5 native `details.faq__item` with `summary`. They open and close by mouse and keyboard, and any custom marker or chevron still shows the open state.

**Responsive and performance**
17. **Responsive.** No horizontal scroll at 320, 375, 768 and 1280px. The grids collapse (features 3→2→1, pricing 3→1). The board stays readable or is scaled.
18. **Behaviour hooks.** `.nav.is-scrolled` is applied after 10px of scroll. `.reveal` → `.is-visible` uses IntersectionObserver. `.card.is-moving` is applied during board moves, and the board loop doesn't pile up cards or leak timers.
19. **Performance basics.** `script.js` loads with `defer` (or at the end of body). Google Fonts load with `preconnect` and `display=swap`, limited to Space Grotesk and Inter with only the weights used. There are no other external requests and no console errors. Animations use only transform/opacity. Lighthouse (if available): Performance ≥ 90, Accessibility ≥ 95, CLS < 0.1.
20. **Meta and polish.** `<title>`, meta description, `meta viewport` and a favicon (the crab) are present. Visible text has no lorem ipsum, and the playful tone is consistent with SPEC.
