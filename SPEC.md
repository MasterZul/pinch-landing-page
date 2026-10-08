# Pinch landing page — shared contract

Product: **Pinch**, a tiny, friendly task tracker for small teams ("grab your to-dos before they scuttle away"). Mascot: a pixel-art orange crab. Tone: playful, clear, confident.
Files: `index.html` + `script.js` (developer), `styles.css` (designer), `RESEARCH.md` (researcher), `REVIEW.md` (tester). No frameworks, no build step. Google Fonts allowed: "Space Grotesk" (display) + "Inter" (body).

## Palette (CSS custom properties on :root, warm light theme)
--bg #fff8f1, --surface #ffffff, --surface-2 #ffeede, --text #2a1a14, --muted #7a6258, --accent #e8835a, --accent-dark #b85a3a, --ink #14141a, --line #f1dccb, --radius 16px

## Sections & class names (exactly these)
- `header.nav` > `.nav__inner` > `a.nav__logo` (contains `span.crab-mark` + "Pinch"), `nav.nav__links` (#features #how #pricing #faq), `a.btn.btn--primary.nav__cta`, `button.nav__toggle[aria-label][aria-expanded]`
- `section.hero#top` > `.hero__inner` > `.hero__copy` (`p.eyebrow`, `h1.hero__title` with `<mark>` on one word, `p.hero__sub`, `.hero__actions` with `a.btn.btn--primary` + `a.btn.btn--ghost`) and `.hero__visual` > `.board` (a mock kanban: 3× `.board__col` each with `h4` and 2–3 `.card` items; script makes cards in the first column move to the next every few seconds)
- `section.features#features` > `h2.section-title`, `.features__grid` > 6× `article.feature` (`.feature__icon` inline SVG, `h3`, `p`)
- `section.how#how` > `h2.section-title`, `ol.steps` > 3× `li.step` (`span.step__num`, `h3`, `p`)
- `section.pricing#pricing` > `h2.section-title`, `.billing-toggle` (buttons `[data-billing=monthly|yearly]`, `.is-active`, `aria-pressed`), `.pricing__grid` > 3× `article.plan` (middle `.plan--featured`), `p.plan__price` > `span.plan__amount[data-monthly][data-yearly]` + `span.plan__period`, `ul.plan__list`, `a.btn`
- `section.faq#faq` > `h2.section-title`, `.faq__list` > 5× `details.faq__item` > `summary` + `p`
- `section.cta#cta` > `h2`, `p`, `form.cta__form` (`label.visually-hidden`, `input[type=email]`, `button.btn.btn--primary`), `p.cta__note`
- `footer.footer` > `.footer__inner`, ©2026 Pinch Co.

## Behaviour hooks
`.reveal` → `.is-visible` on scroll; `body.nav-open`; `.nav.is-scrolled` after 10px; `.card.is-moving` during a board move; email `aria-invalid="true"` on bad input; `.cta__note.is-success` after submit (no network). `.visually-hidden` must be defined in styles.css.

## Small touches
- Yearly billing button carries `span.billing-toggle__save` ("Save 17%"), a pill on `--accent` with `--on-accent` text.
- FAQ is an accordion: opening one `details.faq__item` closes the others (script.js, `toggle` event).

## Scroll progress
- `div.scroll-progress[aria-hidden="true"]` > `span.scroll-progress__bar`, right after `.skip-link`. Fixed 4px bar at the top in `--accent`, above the nav. Script sets `transform: scaleX(0…1)` from scroll position (same rAF-throttled scroll handler as `.nav.is-scrolled`). No transition under reduced motion.

## Theme (added after launch)
- `button.theme-toggle` in `.nav__inner` (before `.nav__cta`), containing `svg.icon-moon` + `svg.icon-sun`; `aria-label` says the theme it switches to, `aria-pressed="true"` in dark.
- `<html data-theme="light|dark">`, set by an inline script in `<head>` before first paint: saved choice (`localStorage['pinch-theme']`) → else system `prefers-color-scheme`. Follows live system changes until the visitor picks.
- Dark tokens live under `:root[data-theme="dark"]`. Text on `--accent` always uses `--on-accent` (dark in both themes); text on an `--ink` background uses `--on-ink` / `--on-ink-muted`.

## Testimonials (feature 2)
- New `section.testimonials#love.reveal` between `#how` and `#pricing`; add `#love` ("Love") to `nav.nav__links` between How and Pricing.
- Markup: `h2.section-title`, `.testimonials__viewport[aria-roledescription="carousel"][aria-label]` > `ul.testimonials__track` > 4× `li.quote[aria-roledescription="slide"][aria-label="N of 4"]` > `blockquote` > `p` + `footer.quote__author` (`span.quote__avatar` initials, `span.quote__name`, `span.quote__role`). Below: `.testimonials__controls` with `button.testimonials__prev[aria-label]`, `.testimonials__dots` (4× `button.testimonials__dot[aria-label="Go to slide N"]`, current one `.is-active` + `aria-current="true"`), `button.testimonials__next[aria-label]`.
- Behaviour (script.js): one slide visible at a time; track moves via `transform: translateX(-N*100%)`. Prev/next wrap around. Autoplay every 6s; pauses on hover, on focus within, and when the tab is hidden; no autoplay under `prefers-reduced-motion: reduce`. Arrow Left/Right keys work when focus is in the carousel. Swipe (pointer events, >40px) on touch. Non-current slides get `aria-hidden="true"` + `inert`.
- Styles (styles.css): uses existing tokens only, works in both themes; slides are cards on `--surface` with `--line` border and `--radius`; big decorative quote mark in `--accent`; avatar is a circle on `--accent` with `--on-accent` text; dots 10px, active dot wider pill in `--accent`; track transition 450ms ease, disabled under reduced motion; ≥44px tap targets for prev/next.
