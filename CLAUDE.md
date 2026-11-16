# Seungjun Oh — Personal portfolio

## Product and design

- React + Vite static site, built for GitHub Pages. UI primitives are official shadcn/ui components in `src/components/ui` (Radix, generated with the shadcn CLI).
- Keep the established assets: blue `#0052ff`, cool gray `#f7f8fa`, ink `#0b0d12`, Pretendard for the site, Spectral for the PDF-style CV, and the existing penguin avatar.
- `src/styles.css` is the implemented design source. `Design.md` is the older Coinbase reference, not a requirement to replace the site's assets.
- Main destinations are Home (visible tab and wordmark), Writing, Projects, CV, and History. No Work parent or CV → Detailed Experience hierarchy.
- The website is English-only, with `lang="en"` and no KR/EN switch. Write all visible titles, descriptions, roles, course names, labels, and accessibility text in English. Preserve original source files, cover images, URLs, IDs, and dates. Korean-language documents remain available with English language labels. The book's Korean `originalTitle` is search metadata, not a second visible heading.
- CV has All / Finance / Crypto views. History records external, professional, and extracurricular activities, including minor experiences. Do not add in-class term projects to History; keep them on Projects. Record competition participation or awards instead of separate entries for building the competition project. Preserve existing historical records.
- A book shows its cover, bibliographic information, contribution, and an external bookstore link. Never publish book-body scans or a book PDF.

## Content and architecture

- `data/portfolio-config.json`: profile, reports, publications, projects, and CV. Preserve existing profile wording when doing unrelated edits.
- `publications` and `projects` are canonical records. CV uses `publicationIds` / `projectIds`; History can link to their hash URLs.
- `data/proof-of-work.json`: independent historical events. Preserve all original entries and dates. A retrospective event and a CV role need not have the same description. Do not resolve conflicting legacy dates by guessing.
- BlockHack Korea / DeFi Compass and Block AI*26 are the same competition (user-confirmed): one preliminary-participation event (`history-070`). Exclude Uniswap V3 LP Risk Analysis from History. The approved June–October 2026 activities are now recorded as `history-067` through `history-074`. FBDA research follows the CV's two explicit periods: June–December 2025 (`history-045`) and June 2026 onward (`history-074`). The review and remaining date questions are recorded in `.context/history-audit/history-addition-candidates.md`; do not publish other pending entries automatically.
- `cv.views` explicitly controls section order. Do not reorder sections during unrelated edits. Publication must immediately follow Work in all three views. Finance starts with Education → Research → Work → Publication. All and Crypto start with Work → Publication → Research and end with Education; Education must never sit in the middle. Preserve each configured sequence. Do not add an Expertise section or interests/technical-skills block to the CV.
- Work and Research Experience are shared in full across All / Finance / Crypto: identical records, descriptions, and canonical array order. Never filter or rerank these sections by audience. Other sections may use `audiences` and explicit `order` settings. All includes every regular CV record; the supporting Affiliations line is an explicit Crypto-only exception.
- Keep PDAO, Base Korea's Based Advocate role, and Undergrad AI Study in `cv.extracurricular`. Base Korea belongs here, not in Work experience; PDAO and Base Korea remain visible in both Finance and Crypto. Store NinjaLabsKR, SuperteamKR, and POSTECH CCBR in `cv.affiliations`, preserving their roles, descriptions, dates, and IDs in the data. Render only their organization names in one Affiliations line at the end of Extracurricular, exclusively in Crypto (including print). Do not create a separate Affiliations section or show this line in All or Finance.
- `src/lib/portfolio.mjs`: pure filtering, route parsing, and cross-record lookup.
- Native hash links preserve browser back/forward. `#articles` aliases Writing; `#experience` aliases History. `#cv?view=finance` is shareable.
- PDFs use a lazy-loaded PDF.js modal. Original direct file URLs remain available. Book links always leave for the bookstore.
- CV Print current view prints the same visible document. Only the original English résumé has a PDF link; do not show a Korean PDF link. Preserve the original résumé files rather than replacing them with generated PDFs.
- Use "Outstanding STEM Talent Career Development Scholar" for the 2026 scholarship in both CV and History, as specified by the user.
- No decorative eyebrow labels, slogans, page descriptions, CV summary, or CV sidebar. Use plain headings and chronological lists.
- Do not add decorative arrows to links or featured cards. The header's email action is labeled Contact. Preserve the footer's original hits.sh/seungjun.site views badge and its counter URL.
- Projects: only the three featured projects (LIFT, MintMe, RUN2) use image cards, with actual project assets and a title. Keep the archive below as a chronological list. Exclude 2021–2022 coursework and the course review/quiz sites. Home shows a short background, not selected work.
- Featured covers: LIFT's term-paper cover illustration, MintMe's deployed homepage, and RUN2's existing mascot. Preserve these selections unless asked to replace them.
- Projects archive has All / In-class / Other filters, based on `context.type === 'In-class term project'`; all remaining types are Other. Keep the featured three cards visible. Store the filter in `#projects?type=inclass` or `#projects?type=other` so reload/back work. A project deep link resets the filter to All and reveals/focuses the destination.
- Project subtitles show explicit `context.type` and `context.name`: in-class term project + full English course title, competition + event name, or research/side project + organization. Never substitute a team number or research topic for the course name. Keep award results separate. The 2026 digital-asset fund was IMEN330, Product and Production Process Design II: Capstone Design (confirmed by the user).

## Commands

```sh
npm ci
npm run dev -- --port 8817
npm test
npm run build
npm run test:e2e
```

Node 22.12+ is required. Run `npx playwright install chromium` once for browser checks.
Vite copies `data`, `assets/images`, CNAME, robots.txt, and sitemap.xml into `dist` after building. The root source index is not the deployable artifact.

## Verification and deployment

- Validate content, run unit tests, build, and test the production preview on desktop/mobile before shipping.
- Screenshots and local review artifacts belong in `.context/`.
- The workflow builds/tests PRs and publishes `dist` on main. GitHub Pages must use **GitHub Actions** as its source when this migration is deployed. Do not deploy or change remote settings merely to preview locally.
