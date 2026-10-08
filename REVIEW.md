# Pinch landing page: test review

Static audit of `index.html`, `styles.css` and `script.js` against `SPEC.md` and the checklist in `RESEARCH.md`. `node --check script.js` passes. A browser run wasn't possible because the local browser tools block `file://`. So the layout, Lighthouse and keyboard items below are judged from the code, and a human should confirm them in a real browser.

**Result: 16 PASS, 4 FIXED, 0 FAIL** (on the 20 RESEARCH items). All the extra integration checks pass.

## RESEARCH checklist

| # | Item | Status | Note |
|---|------|--------|------|
| 1 | Hero clarity | PASS | The h1, sub-heading and eyebrow say it's a task tracker for teams of 2–20, with a clear benefit. There is exactly one `<mark>` (on "scuttle"). |
| 2 | Primary CTA above the fold | PASS | "Start free — no card" uses `btn--primary` and "See how it works" uses `btn--ghost`. The ghost button is visibly weaker. |
| 3 | CTA repetition and consistency | PASS | Primary CTAs appear in the nav, the hero, every plan and the form, and all of them point to `#cta`, which exists. Wording varies by spot ("Start pinching", "Start free", "Try Pro…", "Talk to us"). |
| 4 | Reassurance near the CTA | PASS | The hero says "no card" and `.cta__note` says "No credit card needed". There's no social-proof line (optional). |
| 5 | Section order and SPEC names | PASS | The order is nav → hero → features (6) → how (3 steps) → pricing (3) → faq (5) → cta → footer "©2026 Pinch Co.". Every SPEC class and ID is present. |
| 6 | Featured plan | PASS | Only the middle plan has `.plan--featured`: dark card, "Most popular" badge (CSS `::before`) and an accent shadow. Every plan has an amount, a period, a list and a `.btn`. |
| 7 | Billing toggle | PASS | JS swaps `data-monthly`/`data-yearly` and keeps `.is-active` and `aria-pressed` in sync. The controls are native buttons, so the keyboard works. Prices use `tabular-nums`. |
| 8 | Text contrast | PASS | `.btn--primary` text is `--ink` on `--accent` (≈6.9:1) and the CTA panel text is `--text`/`--ink` on `--accent`. `--accent` is never used as text colour. |
| 9 | Focus visible | FIXED | The CTA submit button's ring was `--accent-dark` on the `--accent` panel (≈1.7:1). I added `.cta__form .btn:focus-visible { outline-color: var(--ink) }`. Everywhere else, `outline:none` on `:focus` has a `:focus-visible` replacement. |
| 10 | Focus not obscured | PASS | `html { scroll-padding-top: calc(var(--nav-h) + 12px) }`, and the JS anchor scroll also offsets by the nav height. |
| 11 | Keyboard and mobile nav | PASS | The toggle has `aria-label` (JS swaps it to "Close menu"), `aria-expanded` and `aria-controls`. It also toggles `body.nav-open`, and Escape or a link click closes the menu. There's no skip link (recommended, not required). |
| 12 | Target size | PASS | Buttons are ≥48px, the toggle is 46px, billing buttons are 40px, nav links are about 40px tall and `summary` rows are about 60px. |
| 13 | Reduced motion | FIXED | `.reveal` was `opacity:0` with no JS fallback, so content stayed hidden if JS failed. The hidden state is now limited to `html.js`, set by a one-line inline script in `<head>`. With reduced motion, CSS cuts animations and transitions, JS stops the board timer and shows all reveals, and smooth scroll is off. |
| 14 | Form labelling and errors | PASS | The `label.visually-hidden` `for` matches the input `id`, and the input has `autocomplete="email"` and `required`. Bad input sets `aria-invalid="true"` and puts a message in `.cta__note` (`aria-live="polite"`, linked by `aria-describedby`). A good submit adds `.is-success` with `preventDefault` and makes no network request. |
| 15 | Semantics | PASS | `lang="en"`, a single h1, and the landmarks are all there. The board `h4`s sit inside an `aria-hidden` board wrapped in `role="img"` with a label, so assistive tech doesn't see a skipped level. Decorative SVGs and the crab are `aria-hidden`. `.visually-hidden` uses the standard clip pattern. |
| 16 | FAQ | PASS | 5 native `details`/`summary`. The default marker is removed and replaced with a CSS +/− that rotates on `[open]`. |
| 17 | Responsive | PASS (static) | At 960px the hero stacks, features go to 2 columns and pricing to 1. At 820px the nav collapses and steps go to 1 column. At 600px features go to 1 column. `body { overflow-x: hidden }`. Not checked in a browser at 320/375/768/1280. |
| 18 | Behaviour hooks | PASS | `.is-scrolled` is set past 10px (passive, rAF-throttled). Reveal uses IntersectionObserver. `.card.is-moving` is set during each move. There's a single `setInterval`, cleared when the tab is hidden or reduced motion is on. Cards cycle col→col, so the counts stay bounded. |
| 19 | Performance basics | FIXED | Fonts loaded twice (`<link>` in the HTML plus a render-blocking `@import` in the CSS). I removed the `@import`. `script.js` loads with `defer`, the font requests use preconnect and `display=swap`, and icons are inline SVG. |
| 20 | Meta and polish | FIXED | There was no favicon. I added an inline SVG data-URI pixel crab (`--accent` with `--ink` eyes). Title, description and viewport are present, there's no lorem ipsum, and the tone is consistent. |

## Integration checks from the brief

| Check | Status | Note |
|-------|--------|------|
| SPEC classes/hooks in markup, CSS and JS | PASS | Every structural class is in the HTML and styled. The behaviour hooks are wired in JS. |
| Classes used in one file but missing in another | PASS | The JS selectors (`.nav`, `.nav__toggle`, `.nav__links a`, `.nav__cta`, `.reveal`, `.billing-toggle [data-billing]`, `.plan__price/amount/period`, `.board .board__col`, `.card`, `.cta__form`, `.cta__note`) all match the markup. |
| `.nav__toggle` aria-label | PASS | `aria-label="Open menu"`. The CSS hides the inline SVG and draws its own bars, which is cosmetic and not a conflict. |
| Board `.card` pseudo-content conflict | PASS | Cards hold plain text only. CSS `::before` (label pill) and `::after` (avatar) use `content:""`, so nothing collides. |
| `.is-moving`, `.is-visible`, `.is-scrolled`, `body.nav-open`, `[aria-invalid="true"]`, `.cta__note.is-success`, `.visually-hidden` in CSS | PASS | All are defined. |
| Text on `--accent` uses `--ink` | PASS | Primary buttons, `.step__num`, CTA panel text and `::selection` all use dark text. |
| Reduced motion | PASS (after fix 13) | Handled in both CSS and JS. |
| `node --check script.js` | PASS | No syntax errors. |
| In-page anchors | PASS | `#top #features #how #pricing #faq #cta` each have a matching `id`. |

## Left for a human

- **Browser verification:** check items 1–2, 12, 17 and 19 (no horizontal scroll at 320/375/768/1280, Lighthouse, console errors) in a real browser. These were only checked in the code.
- **Skip link:** none exists (recommended by RESEARCH). Adding one needs new markup plus styles.
- **CTA consistency (design call):** the CTA form button is restyled to an ink background with white text, not the accent primary look. The Free and Team plan CTAs are ghost buttons. At ≤400px the nav CTA is hidden and the mobile menu doesn't include it.
- **Yearly period text:** "per user / month, billed yearly" is longer than the monthly text and may wrap, causing a small layout shift. Consider reserving the space or shortening it.
- **Minor contrast:** the placeholder colour `#a08a80` on white is about 3.3:1 (placeholders aren't strictly required to meet 4.5:1).
- **Anchor focus:** the JS anchor scroll calls `preventDefault` and doesn't move focus to the target section, so the next Tab starts from the link, not the section.
- **Minor cleanup:**
  - The JS closes the menu above 900px, but the CSS breakpoint is 820px (harmless).
  - `body.nav-open .nav__links::after { content:none }` targets nothing.
  - A few transitions animate `background-color`/`box-shadow` rather than only transform/opacity.

## Round 2

Fixes for the "Left for a human" items, checked in a browser at 320, 375 and 1280px through the local `http-server` preview. `node --check script.js` passes, every in-page `href="#x"` (`#top #main #features #how #pricing #faq #cta`) has a matching `id`, and the new `.skip-link` class is styled.

| Item | Status | Note |
|------|--------|------|
| Skip link | FIXED | `<a class="skip-link" href="#main">Skip to content</a>` is the first focusable element and `<main>` now has `id="main"`. It sits off-screen (`translateY(-200%)`) and slides in on focus. Tab then Enter moves focus into `main`. |
| Anchor focus | FIXED | After scrolling, the anchor handler in `script.js` adds `tabindex="-1"` to the target (if it has none) and calls `focus({ preventScroll: true })`. CSS hides the outline on focused sections and `main`. |
| Placeholder contrast | FIXED | The placeholder is now `var(--muted)` (`#7a6258`) with `opacity: 1`, about 5.6:1 on white (was about 3.3:1). |
| Nav CTA at ≤400px | FIXED | The CTA stays visible (`display:none` removed). It shrinks to `padding: 8px` and `font-size: 0.75rem`, and the nav gap drops to 8px. At 320px `scrollWidth` is 320 and the CTA ends 8px before the toggle. |
| Yearly price layout shift | FIXED | `.plan__period` has `line-height: 1.3; min-height: 2.6em`, so two lines are always reserved. The price and card heights are the same in monthly and yearly mode at 375 and 1280px. |
| Hero `mark` decoration | NOT TOUCHED | Left as is on purpose, because the user hasn't decided on it. |
| CTA consistency (design call), minor cleanup | OPEN | Out of scope for this round. These still need a design or cleanup decision. |

## Testimonials carousel review (2026-10-09)

I tested this in a real browser (Playwright Chromium) against `python -m http.server 8765`, at 1280×800 (rendered about 930px wide) and 360×740, in light and dark themes, with and without `prefers-reduced-motion: reduce`. I didn't change any code.

| # | Check | Status | Note |
|---|-------|--------|------|
| 1 | Console errors | PASS | 0 errors and 0 warnings across all loads. |
| 2 | Section order | PASS | `main` sections are `top, features, how, love, pricing, faq, cta`. `#love` sits between `#how` and `#pricing`. |
| 3 | "Love" nav link | PASS | Nav order is `#features #how #love #pricing #faq`. Clicking it scrolls to `#love`. The h2 is at y=151 under a 74px nav, so it isn't hidden. Focus moves to `#love` (see bug 3). |
| 4 | Prev/next wraparound | PASS | From 1, Prev goes to 4 (`translateX(-300%)`). From 4, Next goes to 1 (`translateX(0%)`). |
| 5 | Dots | PASS | Dot 3 gives `translateX(-200%)`, and only that dot has `.is-active` and `aria-current="true"`. The other dots have no `aria-current`. |
| 6 | Slide hiding | PASS | Only the current `li.quote` lacks `aria-hidden`/`inert`. The other three have `aria-hidden="true"` and `inert` after every move, and the initial HTML matches this. |
| 7 | Arrow keys | PASS | With focus on a dot, ArrowRight/Left move and wrap (3→4→1→4), and focus follows to the active dot. With focus on Next, ArrowLeft moves the slide and focus stays on the button. |
| 8 | Track transform values | PASS | `translateX(-N*100%)` for N=0..3. Transition is `transform 0.45s` (0s under reduced motion). |
| 9 | Autoplay | PASS | It advances at 6.07s from idle. `aria-live` is `off` while autoplaying and `polite` once paused. |
| 10 | Pause on hover | PASS | With the mouse over the viewport, there was no change in 7s. |
| 11 | Pause on focus | PASS | With focus on a dot, there was no change in 7s. After blur it resumes. |
| 12 | Reduced motion | PASS | There was no change in 13s after load. A manual Next still works and doesn't restart autoplay (no change 7s later). |
| 13 | Swipe (synthetic touch pointer events) | PASS | Swiping left 80px goes to the next slide and right 80px to the previous one. A 25px swipe or a mostly vertical drag is ignored. |
| 14 | Visibility pause | NOT RUN (code only) | `visibilitychange` calls `sync()`, which stops autoplay when the tab is hidden. I didn't toggle tab visibility in the browser. |
| 15 | Dark theme text contrast | PASS | On the card: quote text 14.8:1, name 14.8:1, role 8.1:1, avatar initials (`--on-accent` on `--accent`) 6.8:1, prev/next icon 14.8:1. Light theme: text 16.7:1, role 5.7:1, avatar 6.8:1. |
| 16 | Dot contrast (non-text, WCAG 1.4.11) | FAIL | See bug 1. |
| 17 | 360px: no horizontal scroll | PASS | `documentElement.scrollWidth` is 345 against `innerWidth` 360 (the 15px difference is the scrollbar). No element outside the track overflows. All 4 slides are 332px tall, so there's no jump. |
| 18 | 360px: prev/next ≥44px | PASS | They are 44×44 (48×48 on desktop). |
| 19 | Dot target size | WARN | See bug 2. |
| 20 | Spec markup and ARIA | PASS | `aria-roledescription` on the carousel and slides, `aria-label="N of 4"`, `aria-label` on prev/next/dots, `aria-controls` pointing to the track. The avatar is `aria-hidden` and the decorative quote mark uses `content: "\201C" / ""`. |

### Bugs

1. **Inactive dots are nearly invisible (WCAG 1.4.11)**. Severity: medium.
   - Location: `styles.css:1118`, where the inactive dot is `background: var(--line)`.
   - Measured contrast against the page background: light 1.26:1 (`#f1dccb` on `#fff8f1`), dark 1.43:1. The active dot (`--accent`) is 2.55:1 in light, also under 3:1, though its 28px pill width does convey the state.
   - Repro: open `#love` in either theme. The three inactive dots barely show, especially in light mode (see the screenshot).
   - Suggested fix: use `--muted` for inactive dots, or give them a border.

2. **Dot hit areas are small**. Severity: low.
   - Location: `styles.css:1106-1107` (and `1156` at ≤400px), `height: 24px; padding: 0 5px`.
   - Inactive dots are 20×24px (18×24 at 360px) with no gap between them, so they're under the 24×24 WCAG 2.5.8 minimum.
   - The spec only requires ≥44px for prev/next, but on touch the dots are easy to mis-tap.
   - Suggested fix: `min-width: 24px` (or more), or add a gap.

3. **Autoplay stays paused after using the "Love" nav link**. Severity: low.
   - Location: `script.js:405` (the anchor handler focuses the target section) together with `script.js:311` (`focusin` on `.testimonials` sets `focused = true`).
   - Repro:
     1. Click "Love" in the nav.
     2. `document.activeElement` is now `section#love`, which is the carousel root.
     3. Autoplay doesn't advance (no change in 7s) until the user clicks or tabs somewhere else.
   - This is arguably acceptable (it fails safe), but it's probably not intended. Possible fix: only count focus on `.testimonials__viewport`/`.testimonials__controls` descendants, or ignore focus when `e.target === root`.

4. **No visible pause control for autoplay (WCAG 2.2.2)**. Severity: low, a spec gap.
   - The slides auto-advance indefinitely every 6s. Pausing on hover or focus helps, but WCAG 2.2.2 expects a mechanism to pause/stop auto-moving content, so touch users and users who don't keep focus inside have no way to stop it.
   - The spec doesn't ask for one, so this needs a design call (for example a pause/play button in `.testimonials__controls`).

### Screenshots

The screenshots are in the session scratchpad. Copies are also in `.playwright-mcp/`, created by the test tool.
- `testimonials-light-desktop.png`: light theme, desktop.
- `testimonials-dark-mobile-360.png`: dark theme, 360px.
