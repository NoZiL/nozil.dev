# UX / UI Plan

## Aesthetic Direction

- **Tone**: Clean, typographic, slightly opinionated — not a generic dev portfolio template
- **Inspiration**: Linear.app's homepage density, Paco Coursey's personal site minimalism,
  Rauno Freiberg's attention to micro-detail
- **Not**: Agency hero sections, particle animations, scrolljacking, auto-play videos

## Logo

No logo yet — to be designed. Placeholder: monogram **NZ** in a square frame,
or just the name in the brand font. Revisit once the color palette is locked.
Keep the nav wordmark as plain text until the logo is ready.

## Color System — LOCKED

**Hybrid: Nuit light mode + Dusk dark mode.**

Clean, neutral zinc in the light — legible and professional.
Deep violet in the dark — the brand comes alive, memorable without being garish.

```
Light mode (Nuit):
  Background: zinc-50     (#fafafa)
  Surface:    white       (#ffffff)
  Border:     zinc-200    (#e4e4e7)
  Text:       zinc-900    (#18181b)  — headings
              zinc-600    (#52525b)  — body
              zinc-400    (#a1a1aa)  — muted / metadata
  Accent:     violet-600  (#7c3aed)  — links, CTAs, active nav

Dark mode (Dusk):
  Background: #12082b     (custom near-black violet)
  Surface:    #1e0a40     (approx violet-950)
  Border:     #2e1065     (approx violet-900)
  Text:       violet-100  (#ede9fe)  — headings
              violet-300  (#c4b5fd)  — body
              violet-500  (#8b5cf6)  — muted / metadata
  Accent:     violet-400  (#a78bfa)  — links, CTAs, active nav
```

Tailwind v4 `@theme` tokens in `src/styles/global.css`:

```css
@theme {
  /* Accent — single source used everywhere */
  --color-accent: var(--color-violet-600);
  --color-accent-dark: var(--color-violet-400);

  /* Custom dark-mode surfaces not in Tailwind defaults */
  --color-dusk-bg: #12082b;
  --color-dusk-surface: #1e0a40;
  --color-dusk-border: #2e1065;

  /* Fonts */
  --font-sans: 'Geist', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;
}
```

Dark mode is class-based (`class="dark"` on `<html>`), toggled via a script in `<head>` before
first paint to avoid flash. Preference stored in `localStorage`, falls back to `prefers-color-scheme`.

## Typography

- **Sans**: Geist Sans (variable font, subset via `fontsource` or self-hosted)
- **Mono**: Geist Mono (code snippets, tech labels)
- Scale: xs / sm / base / lg / xl / 2xl / 4xl

## Layout

- Max content width: 768px (prose) / 1024px (portfolio grid)
- Spacing: 8px base unit, Tailwind defaults
- No sidebars — single column on all breakpoints, graceful widescreen centering

## Responsive

Mobile-first: unprefixed Tailwind classes target a 360px viewport, then layer
`sm:`/`md:`/`lg:` (Tailwind defaults: 640 / 768 / 1024) upward. Acceptance criteria for
every feature PR:

- **Nav**: stays a single row at all widths — 3–4 short links, no hamburger menu.
  If the i18n + theme toggles crowd 360px, collapse toggles to icons, not a menu. The
  "Hire me" CTA (links out to Malt) follows the same rule: icon-only below `sm`, full
  label from `sm` up. The wordmark next to the logo mark drops below `sm` for the same
  reason — the icon mark + `aria-label` on the home link carry it on narrow viewports.
- **Home**: hero scales down (`text-3xl md:text-4xl`), skill chips wrap, CTA row stacks
  (`flex-col sm:flex-row`).
- **Work**: role header (company · title · dates) wraps gracefully; tech tags wrap;
  CV download button stays reachable above the timeline on mobile.
- **Portfolio**: grid `grid-cols-1 md:grid-cols-2`; filter chips wrap — no horizontal scroll.
- **Contact**: form fields full width on mobile; touch targets ≥ 44px.
- **Images**: `astro:assets` with explicit dimensions (no layout shift), never wider than
  the container.
- **Test gate**: each feature PR's Playwright specs must assert the layout-critical mobile
  behavior (nav usable, grid collapsed, chips wrapped) in the existing `mobile` project
  (Pixel 7) — not just desktop.

## Page-by-page UX

### Home `/`

```
[nav]
[Hero: name + headline + 2-line bio]
[Skill chips — not exhaustive, just the signal ones]
[2–3 featured project cards]
[CTA row: View CV · See Portfolio · Contact me]
[footer]
```

One scroll, everything essential visible. No "click here to learn more" for the bio.

### Work `/work`

```
[page header: "Work & CV"]
[Download CV button — top right]
[Timeline: roles in reverse-chron, expandable details]
  Each role: company · title · date range · 3–5 bullet points · tech tags
[Skills section: grouped by domain, visual but not gamified]
[Education (brief)]
```

CV download links to `/cv.pdf` (build-time generated) or Google Drive fallback.

### Portfolio `/portfolio`

```
[page header: "Portfolio"]
[filter chips: All · Mobile · Web · OSS]
[project grid: 2-col desktop, 1-col mobile]
  Each card: name · 1-line desc · tech tags · [Live] [GitHub] links
[click → /portfolio/[slug] detail page]
```

Detail page:

```
[hero image or screenshot]
[project name + 1-para summary]
[role: what I built / led]
[tech stack used]
[key decisions or challenges — 2–3 bullets]
[links: live · github · case study]
```

### Contact `/contact`

```
[page header: "Get in touch"]
[Short context: what kind of work, typical engagement]
[Form: name · email · message · send]
[Direct email as fallback link]
[Response time note: "I reply within 2 business days"]
```

## Motion & Interaction

- Page transitions: none (fast is better than animated)
- Hover states: subtle translate-y on cards, underline on links
- Dark mode toggle: stored in localStorage, respects `prefers-color-scheme` on first visit
- No loading spinners — static pages load instantly

## Accessibility

- WCAG 2.1 AA minimum
- Semantic HTML — heading hierarchy, `<main>`, `<nav>`, `<article>`
- All interactive elements keyboard-navigable
- Images: meaningful alt text, decorative ones aria-hidden
