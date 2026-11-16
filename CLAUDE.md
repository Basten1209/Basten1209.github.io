# Seungjun Oh — Personal portfolio

## Product and design

- React + Vite static site, built for GitHub Pages. UI primitives are official shadcn/ui components in `src/components/ui` (Radix, generated with the shadcn CLI).
- Keep the established assets: blue `#0052ff`, cool gray `#f7f8fa`, ink `#0b0d12`, Pretendard for the site, Spectral for the PDF-style CV, and the existing penguin avatar.
- `src/styles.css` is the implemented design source. `Design.md` is the older Coinbase reference, not a requirement to replace the site's assets.
- Main destinations are Home (visible tab and wordmark), Writing, Projects, CV, and History. No Work parent or CV → Detailed Experience hierarchy.
- The website is English-only, with `lang="en"` and no KR/EN switch. Write all visible titles, descriptions, roles, course names, labels, and accessibility text in English. Preserve original source files, cover images, URLs, IDs, and dates. Korean-language documents remain available with English language labels. The book's Korean `originalTitle` is search metadata, not a second visible heading.
- CV has One-pager (default) and All views; Finance and Crypto are retired. History records external, professional, and extracurricular activities, including minor experiences. Do not add in-class term projects to History; keep them on Projects. Record competition participation or awards instead of separate entries for building the competition project. Preserve existing historical records.
- A book shows its cover, bibliographic information, contribution, and an external bookstore link. Never publish book-body scans or a book PDF.

## Content and architecture

- `data/portfolio-config.json`: profile, reports, publications, projects, and CV. Preserve existing profile wording when doing unrelated edits.
- `publications` and `projects` are canonical records. CV uses `publicationIds` / `projectIds`; History can link to their hash URLs.
- `data/proof-of-work.json`: independent historical events. Preserve all original entries and dates. A retrospective event and a CV role need not have the same description. Do not resolve conflicting legacy dates by guessing.
- BlockHack Korea / DeFi Compass and Block AI*26 are the same competition (user-confirmed): one preliminary-participation event (`history-070`). Exclude Uniswap V3 LP Risk Analysis from History. The approved June–October 2026 activities are now recorded as `history-067` through `history-074`. FBDA research follows the CV's two explicit periods: June–December 2025 (`history-045`) and June 2026 onward (`history-074`). The review and remaining date questions are recorded in `.context/history-audit/history-addition-candidates.md`; do not publish other pending entries automatically.
- `data/resume/one-pager.md` is the approved source for the One-pager web view and English PDF. Keep its concise wording, bold keywords, italic roles, and bullets without terminal periods. Body text stays at 10pt on desktop and in print; leave the remaining space for future content instead of enlarging the type. The order is Summary → Education → Work → Publication → Research → Extracurricular → Selected Awards → Selected Certifications. The selected awards are Four Pillars Research Challenge (MetaMask Track 1st Place only, topic: Guardrail for Agent Wallet), Digital Twin AI Agent Hackathon, and Monad Blitz Seoul. Keep Selected Awards to three single-line bullets on desktop and in print, using award · competition · topic with bold award results and bold, right-aligned year-only dates; do not display a pipe before the years. Publication puts the italic Co-Author role beside the book title/ISBN and the publication date on the right, without a location or separate role row. Preserve the user-provided topics in the source. The user excluded AI·Blockchain Business Model Competition from the One-pager; preserve its All archive record. Company, role, and dates share one row on desktop and in print; small screens may wrap for readability.
- Work headers use company followed by department/program · italic role (plain-text employment type), with a small visual gap after the company name instead of a pipe, and bold dates aligned right. B-Harvest pairs Technical Writer (Internship); Researcher (Freelance) under TechBD. WorldQuant uses BRAIN Platform · Consultant (Freelance); R.O.K.A.F. uses Logistics Command · System Developer (Military service); Bithumb uses Research Center · Researcher (Internship). Do not mix roles and employment types with a slash.
- One-pager renders internal ` | ` separators (including Publication, PDAO, and Base Korea headers) as a small inline gap, never a visible pipe. Keep the Markdown separators for parsing and the right-aligned date column. This spacing preference does not remove section rules or middle-dot separators.
- Bithumb distinguishes research assistance on 8 reports on macroeconomics and cryptocurrency markets from sole authorship of 2 blockchain research reports, reviewed by a senior colleague. Use Assisted with research for … for the RA contribution and Independently authored … with review from a senior colleague for the Researcher contribution. Omit the unfamiliar report series names Crypto Insights and CRYPTO NOTES from those bullets. Limit Bithumb bullet emphasis to 8 reports, Independently authored, and 2023 ETH Upgrade; keep Crypto Insight offline meetup and official YouTube content in regular weight. Publication emphasizes Bitcoin and Blockchain.
- The heading is Selected Certifications (10+ total). Use two single-line bullets in regular weight, with issuers in parentheses: Certified Accounting Manager (Samil PwC) · Certified Investment Manager (KOFIA) · Financial Planner (KBI), then SQL Developer (K-DATA) · Industrial Engineer Information Processing (HRD Korea) · ADsP (K-DATA). Keep ADsP abbreviated without expansion. Do not bold the certificate names. Do not repeat Hold or including in the body. Do not call the entire collection government-accredited private certifications: it contains national technical qualifications, accredited private qualifications, and registered private qualifications. Use the Q-net English name for 정보처리산업기사, without adding Craftsman.
- All preserves the full archive in `data/portfolio-config.json`, with shared experience wording aligned to the approved One-pager. `cv.views.all.sections` controls its order: Education → Work → Publication → Research → Projects → Awards → Extracurricular → Events → Qualifications. Do not replace All with the curated One-pager or add a Summary to All.
- All uses natural capitalization, italic roles, separate plain-text teams/employment types, and right-aligned bold dates formatted as Mon YYYY. Keep B-Harvest's two contract periods and PDAO's two role periods. Preserve all awards, all three Four Pillars tracks, projects, and qualifications. Base Korea ends May 2026; AI x Web3 in 2026 | Seoul Summit is the fifth hosting event, specifically Co-host. BK21 selection (Sep 2026) and funding coverage (Mar 2026–Feb 2027) are distinct.
- All CV descriptions support the same safe inline Markdown emphasis as the One-pager. Shared publications/projects may carry a `cv` object with CV-specific title, description, or highlights; `cvEntries` applies it only in All so Writing/Projects copy remains unchanged. Keep the common ID, links, and bibliography on the original record.
- All shows every regular CV record. Work and Research retain canonical array order; other sections respect `order.all`. Legacy `audiences`, Finance/Crypto ordering, and Finance/Crypto highlights remain as unused metadata. All still uses `highlightsByView.all` when present outside Work and Research.
- PDAO, Base Korea, and Undergrad AI Study remain in `cv.extracurricular`. Supporting `cv.affiliations` data (NinjaLabsKR, SuperteamKR, POSTECH CCBR) is preserved but not displayed. Do not add an Expertise section or technical-skills sidebar.
- `src/lib/portfolio.mjs`: pure filtering, route parsing, and cross-record lookup.
- Native hash links preserve browser back/forward. `#articles` aliases Writing; `#experience` aliases History. `#cv` opens One-pager and `#cv?view=all` opens All. Legacy Finance/Crypto links fall back to One-pager.
- PDFs use a lazy-loaded PDF.js modal. Original direct file URLs remain available. Book links always leave for the bookstore.
- CV Print current view prints the selected document. PDF · One-pager opens `data/resume/resume_eng.pdf`, generated from the same web view with `npm run export-one-pager`. Export only when the copy is finalized or the user requests it; the command verifies one page and matching text before replacing the PDF. Visually review the result. Keep the Korean PDF unchanged and its link hidden.
- Use "Outstanding STEM Talent Career Development Scholar" for the 2026 scholarship in both CV and History, as specified by the user.
- No decorative eyebrow labels, slogans, page descriptions, or CV sidebar. One-pager keeps the original first Summary sentence as one paragraph without a bullet; physical line wrapping is allowed. PDAO leadership evidence is under Extracurricular in two single-line bullets: launch/operations since Jan 2025, then grants and offline events. Use plain headings and chronological lists.
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
npm run export-one-pager # after finalizing one-pager copy/layout
npm run test:e2e
```

Node 22.12+ is required. Run `npx playwright install chromium` once for browser checks.
Vite copies `data`, `assets/images`, CNAME, robots.txt, and sitemap.xml into `dist` after building. The root source index is not the deployable artifact.

## Verification and deployment

- Validate content, run unit tests, build, and test the production preview on desktop/mobile before shipping.
- Screenshots and local review artifacts belong in `.context/`.
- The workflow builds/tests PRs and publishes `dist` on main. GitHub Pages must use **GitHub Actions** as its source when this migration is deployed. Do not deploy or change remote settings merely to preview locally.
