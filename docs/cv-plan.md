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
- **PDF** — `astro-pdf` snapshots `/work` → `dist/cv.pdf` at build time (config in
  `astro.config.mjs`; needs `--no-sandbox` for the devcontainer/CI Chromium). The "Download CV"
  button links to `/cv.pdf`, so page and PDF never drift.
