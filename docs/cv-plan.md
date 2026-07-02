# Work / CV Page — Reference

The `/work` page (`src/pages/work.astro`) is **implemented**. This doc is the lean reference for
maintaining it; the original build plan lived here and is now the code itself.

## Source of truth (check before editing work content)

The canonical CV data lives in personal export files committed in `public/` (intentionally
public — they are served alongside the site and double as downloadable CVs):

- **`linkedin_profile_*.pdf`** — the primary, most detailed source. Always check the
  latest-dated one first when adding or correcting roles, dates, or stacks.
- **`nicolas_zilli_resume_intl.docx`** and **`nicolas_zilli_cv_fr.docx`** — complementary
  sources (the curated EN/FR résumés). Use them to cross-check phrasing and the skills
  taxonomy; they intentionally omit minor roles the LinkedIn export keeps.

When these disagree, the LinkedIn export wins on facts (dates, titles); the résumés win on
curated wording.

## How it's built

- **Roles** — one Markdown file per role in `src/content/work/`, typed by the `work` collection
  schema in `src/content.config.ts` (`title`, `company`, `companyUrl?`, `via?`, `startDate`,
  `endDate` nullable = present, `location`, `type`, `technologies[]`, `featured`). Reverse-chron,
  current roles float to top. Bullets are the Markdown body.
- **Skills, Earlier experience, Education** — typed inline arrays in `work.astro` (not collections;
  they have no Markdown body). Education splits `degree` / `major` / `equivalency` / `school`.
- **Logos** — company & school logos in `src/assets/logos/`, looked up by entry id / school slug
  with a monogram fallback. See that folder's README.
- **Downloads** — two CTAs on `/work` (and their `/fr/work` equivalents), both locale-aware
  (`WorkBody.astro` picks the href from `lang`):
  - _primary_ **Download CV (DOCX)** → `public/nicolas_zilli_resume_intl.docx` (EN) /
    `public/nicolas_zilli_cv_fr.docx` (FR) — hand-curated 1-pagers, served statically.
  - _secondary_ **Download as PDF** → `public/cv.pdf` (EN) / `public/cv_fr.pdf` (FR).
- **PDF generation** — `astro-pdf` snapshots `/work` → `cv.pdf` and `/fr/work` → `cv_fr.pdf`, but
  it's **opt-in** (gated behind `GENERATE_PDF` in `astro.config.mjs`) because headless Chromium is
  flaky to provision in CI. Regenerate locally and commit when `/work` or `/fr/work` changes:

  ```bash
  pnpm cv:pdf   # rm old PDFs → GENERATE_PDF=1 astro build → copies dist/client/{cv.pdf,cv_fr.pdf} to public/
  ```

  The script deletes the previously committed PDFs before building: `public/` is copied into
  `dist/client` verbatim ahead of the astro-pdf step, so a stale `cv.pdf` already sitting there
  causes astro-pdf to detect a "file already exists" collision and write the fresh snapshot to
  `cv-1.pdf` instead — silently leaving the stale PDF in place. Removing the old files first
  guarantees astro-pdf writes straight to `cv.pdf` / `cv_fr.pdf`.

  Normal `pnpm build` (CI + deploy) skips astro-pdf entirely and serves the committed
  `public/cv.pdf` / `public/cv_fr.pdf` — no browser dependency, no flakiness.
