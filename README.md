# Seungjun Oh — Personal portfolio

[seungjun.site](https://seungjun.site) · Digital asset markets, blockchain, and financial econometrics.

React + Vite + Tailwind CSS with official shadcn/ui components. The original blue palette, Pretendard body font, and penguin avatar are preserved. CV uses Spectral, matching the existing print résumé.

## Local development

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev -- --port 8817
```

Open http://127.0.0.1:8817. For a production preview:

```sh
npm run build
npm run preview
```

## Destinations

| Page | Purpose |
| --- | --- |
| Home | One-sentence introduction and a concise background list |
| Writing | Searchable articles, reports, paper reviews, and the co-authored book |
| Projects | Three featured projects followed by a chronological archive of research, hackathons, coursework, and personal projects |
| CV | One-pager (default) / All views; matching one-page PDF and printing of the selected view |
| History | Independent chronological record of small experiences and milestones |

Home has an explicit navigation tab; the wordmark also returns to Home. Old `#articles` and `#experience` links still work. Direct links include `#projects/lift`, `#writing/book/digital-asset-era`, and `#cv?view=all`.

All website copy is in English, including content and accessibility labels. Original documents and cover images retain their source languages. The book's Korean title remains searchable as metadata; it is displayed with an English title and a Korean-edition label.

## Content

- `data/portfolio-config.json`: profile, writing, publications, projects, and the All CV archive.
- `data/resume/one-pager.md`: approved English One-pager source, shared by the web view and PDF.
- `assets/fonts/spectral/`: locally bundled résumé fonts and their OFL license.
- `data/profile-intro.md`: retained Korean biography source; not displayed on the concise home.
- `data/proof-of-work.json`: historical events, preserved separately from the selective CV.
- `data/reports/`, `data/resume/`, and `data/projects/`: downloadable documents.
- `assets/images/`: established profile assets and cover images, with source notes in `covers/README.md`.

Publications and projects are stored once and referenced from CV; an optional `cv` object tailors their wording for All without changing Writing or Projects. All starts with Education and preserves the full archive, with shared experience wording and emphasis aligned to the approved One-pager. See [CONTENT_UPDATE_GUIDE.md](CONTENT_UPDATE_GUIDE.md) for One-pager editing, archive ordering, and cross-links.

## Checks

```sh
npm test
npm run build
npx playwright install chromium  # first run only
npm run test:e2e
```

Unit checks cover content integrity, legacy routing, filtering, and shared records. Browser checks use the production build on desktop/mobile and cover navigation, search, book links, project archive deep links, CV views and print styles, History, PDF preview, and viewport overflow.

## Deployment

The deployable artifact is **`dist/`**, not the source repository root. The Vite build copies original data/files, images, `CNAME`, `robots.txt`, and `sitemap.xml` into it.

`.github/workflows/update-portfolio.yml` validates and tests pull requests, then deploys `dist` when main is updated. When deploying this migration, set **Settings → Pages → Build and deployment → Source → GitHub Actions**. Keep the custom domain `seungjun.site`. Local preview does not change the live site or remote Pages settings.

CV **Print current view** prints the selected document. **PDF · One-pager** opens the one-page English résumé generated from the same One-pager web view. All retains the full archive. The Korean PDF remains unchanged and its link is hidden. Legacy Finance/Crypto URLs open One-pager.

After finalizing the One-pager source or print styles, run `npm run export-one-pager`. This builds the site, exports the One-pager through Chromium, and checks that it is one A4 page (210 × 297 mm) with text matching the web view before replacing `data/resume/resume_eng.pdf`. The script uses a temporary local preview server, bundled fonts, and no external requests. Visually inspect the PDF before publishing; normal builds do not regenerate it.
