import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { cvEntries, cvPeriod } from '../../src/lib/portfolio.mjs'
import { inlineText } from '../../src/lib/one-pager.mjs'

const config = JSON.parse(
  readFileSync(new URL('../../data/portfolio-config.json', import.meta.url)),
)
const history = JSON.parse(readFileSync(new URL('../../data/proof-of-work.json', import.meta.url)))

// Browser checks must not add automated visits to the site's real counter.
test.beforeEach(async ({ page }) => {
  await page.route('https://hits.sh/seungjun.site.svg?*', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="20"><text x="4" y="15">views</text></svg>',
    }),
  )
})

test('navigation preserves history and mobile navigation closes after use', async ({
  page,
  isMobile,
}) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Seungjun Oh', exact: true })).toBeVisible()
  if (isMobile) await page.getByRole('button', { name: 'Open navigation' }).click()
  const contact = isMobile ? page.getByRole('dialog') : page.locator('.site-header')
  await expect(contact.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute(
    'href',
    `mailto:${config.profile.email}`,
  )
  await expect(
    page
      .getByRole('navigation', {
        name: isMobile ? 'Mobile navigation' : 'Main navigation',
        exact: true,
      })
      .getByRole('link', { name: 'Home', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
  await page
    .getByRole('navigation', {
      name: isMobile ? 'Mobile navigation' : 'Main navigation',
      exact: true,
    })
    .getByRole('link', { name: 'Writing', exact: true })
    .click()
  await expect(page).toHaveURL(/#writing$/)
  if (isMobile) await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Seungjun Oh', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})
test('writing filters include the book, search, and empty-state recovery', async ({ page }) => {
  await page.goto('/#writing')
  await page.getByRole('tab', { name: /Books/ }).click()
  await expect(page.locator('.book-meta')).toContainText('Korean edition')
  await expect(
    page.getByRole('heading', { name: 'The Digital Asset Era Is Coming', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Book details & purchase', exact: true }),
  ).toHaveAttribute('href', 'https://product.kyobobook.co.kr/detail/S000209213039')
  await page.getByRole('tab', { name: /^All/ }).click()
  await page.getByRole('textbox', { name: 'Search writing' }).fill('doesnotexist123')
  await expect(page.getByText('No matches found.')).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText(
    `${config.reports.length + config.publications.length} works`,
  )
  await page.getByRole('textbox', { name: 'Search writing' }).fill('copula')
  await expect(page.getByRole('status')).toHaveText('1 work')
})
test('featured projects link to the chronological archive and book deep links work', async ({
  page,
}) => {
  await page.goto('/#projects')
  await expect(page.locator('.featured-projects li')).toHaveCount(3)
  const covers = page.locator('.featured-projects img')
  await expect(covers).toHaveCount(3)
  await expect
    .poll(() =>
      covers.evaluateAll((images) =>
        images.every((img) => img.complete && img.naturalWidth > 0 && img.alt.length > 0),
      ),
    )
    .toBe(true)
  expect(
    await page
      .locator('.featured-projects a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
  ).toEqual(config.featuredProjectIds.map((id) => `#projects/${id}`))
  await expect(page.locator('.project-entry')).toHaveCount(config.projects.length)
  await expect(page.locator('#project-uniswap-lp-risk .project-context')).toHaveText(
    'Side project · POSTECH FBDA Lab',
  )
  const expected = [...config.projects]
    .sort((a, b) => (b.date || b.year).localeCompare(a.date || a.year))
    .map((p) => `project-${p.id}`)
  expect(
    await page.locator('.project-entry').evaluateAll((rows) => rows.map((row) => row.id)),
  ).toEqual(expected)
  await page.locator('.featured-projects').getByRole('link', { name: /^LIFT/ }).click()
  await expect(page.locator('#project-lift')).toBeInViewport()
  await page.reload()
  const project = page.locator('#project-lift')
  await expect(project.getByRole('heading', { name: 'LIFT', exact: true })).toBeVisible()
  await expect(project.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute(
    'href',
    'https://github.com/Basten1209/LIFT_FDBAProject1',
  )
  await expect(project).toBeFocused()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.goto('/#writing/book/digital-asset-era')
  await expect(page.getByRole('tab', { name: /Books/ })).toHaveAttribute('aria-selected', 'true')
})
test('project filters preserve chronology, reload, history, and featured deep links', async ({
  page,
}) => {
  await page.goto('/#projects')
  const sorted = [...config.projects].sort((a, b) =>
    (b.date || b.year).localeCompare(a.date || a.year),
  )
  for (const [label, filter] of [
    ['In-class', 'inclass'],
    ['Other', 'other'],
  ]) {
    await page.getByRole('tab', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`#projects\\?type=${filter}$`))
    const expected = sorted
      .filter((p) => (p.context.type === 'In-class term project') === (filter === 'inclass'))
      .map((p) => `project-${p.id}`)
    await expect(page.locator('.project-entry')).toHaveCount(expected.length)
    expect(
      await page.locator('.project-entry').evaluateAll((rows) => rows.map((r) => r.id)),
    ).toEqual(expected)
    await expect(page.locator('.featured-projects li')).toHaveCount(3)
  }
  await page.reload()
  await expect(page.getByRole('tab', { name: 'Other', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.locator('#project-lift')).toHaveCount(0)
  await page.goBack()
  await expect(page.getByRole('tab', { name: 'In-class', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.goForward()
  await expect(page.getByRole('tab', { name: 'Other', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.locator('.featured-projects').getByRole('link', { name: 'LIFT', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'All', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.locator('#project-lift')).toBeFocused()
  await expect(page.locator('#project-lift')).toBeInViewport()
  await expect(page.locator('.project-entry')).toHaveCount(config.projects.length)
})
test('One-pager is the default CV and its PDF contains the same content on one page', async ({ page, request }) => {
  await page.goto('/#cv')
  const document = page.getByRole('article', { name: 'One-pager CV', exact: true })
  await expect(document).toBeVisible()
  await expect(page.getByRole('tab')).toHaveText(['One-pager', 'All'])
  await expect(page.getByRole('tab', { name: 'One-pager', exact: true })).toHaveAttribute('aria-selected', 'true')
  expect(await document.locator('.onepager-section').evaluateAll((sections) =>
    sections.map((section) => section.dataset.section),
  )).toEqual(['summary', 'education', 'experience', 'publications', 'research', 'extracurricular', 'awards', 'certifications'])
  await expect(document.locator('[data-section="summary"] li')).toHaveCount(0)
  await expect(document.locator('[data-section="summary"] > p')).toHaveCount(1)
  const work = document.locator('[data-section="experience"]')
  await expect(work.locator('.onepager-entry')).toHaveCount(4)
  await expect(work.locator('.onepager-entry').first().locator('h3')).toHaveText('B-Harvest TechBD · Technical Writer (Internship); Researcher (Freelance)')
  await expect(work.locator('.onepager-entry').first().locator('em')).toHaveText(['Technical Writer', 'Researcher'])
  await expect(work.locator('strong').filter({ hasText: /^3rd Place in 2025 IQC Korea Final$/ })).toHaveCount(1)
  await expect(work).not.toContainText('Base Korea')
  await expect(document.locator('[data-section="extracurricular"]')).toContainText('Base Korea')
  await expect(document.locator('[data-section="research"]')).toContainText('Scholar (12M KRW) by BrainKorea21')
  await expect(document.locator('.onepager-section > h2').first()).toHaveCSS('text-transform', 'none')
  await expect(page.getByRole('link', { name: 'PDF · One-pager', exact: true })).toHaveAttribute('href', 'data/resume/resume_eng.pdf')
  await expect(page.getByRole('link', { name: 'PDF · Korean', exact: true })).toHaveCount(0)
  const screenContent = await document.innerText()
  const response = await request.get('/data/resume/resume_eng.pdf')
  expect(response.ok()).toBe(true)
  const loadingTask = getDocument({ data: new Uint8Array(await response.body()) })
  const pdf = await loadingTask.promise
  try {
    expect(pdf.numPages).toBe(1)
    const text = await (await pdf.getPage(1)).getTextContent()
    const normalize = (value) => value.normalize('NFKC').replace(/[\s•●·]/gu, '')
    expect(normalize(text.items.map((item) => item.str || '').join(' '))).toBe(normalize(screenContent))
  } finally {
    await loadingTask.destroy()
  }
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.site-header')).toBeHidden()
  await expect(page.locator('.cv-toolbar')).toBeHidden()
  await expect(page.locator('.cv-downloads')).toBeHidden()
  await expect(document).toBeVisible()
  expect(await document.innerText()).toBe(screenContent)
})

test('All CV preserves the archive and supports reload, browser history, and printing', async ({ page }) => {
  await page.goto('/#cv')
  await page.getByRole('tab', { name: 'All', exact: true }).click()
  await expect(page).toHaveURL(/#cv\?view=all$/)
  await page.reload()
  await expect(page.getByRole('tab', { name: 'All', exact: true })).toHaveAttribute('aria-selected', 'true')
  const document = page.locator('.cv-document')
  await expect(document).toHaveAccessibleName('All CV')
  await expect(page.locator('.onepager')).toHaveCount(0)
  expect(await document.locator('.cv-section').evaluateAll((sections) =>
    sections.map((section) => section.dataset.section),
  )).toEqual(config.cv.views.all.sections)
  for (const section of config.cv.views.all.sections.filter((section) => section !== 'certificates')) {
    const entries = cvEntries(config, section)
    const displayed = document.locator(`[data-section="${section}"]`)
    await expect(displayed.locator('.cv-entry')).toHaveCount(entries.length)
    for (const entry of entries) {
      for (const text of [entry.role, entry.focus, entry.description, ...(entry.highlightsByView?.all || entry.highlights || [])].filter(Boolean))
        await expect(displayed).toContainText(inlineText(text))
      await expect(displayed.locator(`[data-entry="${entry.id}"] .cv-period`)).toContainText(
        cvPeriod(entry.period || entry.date || entry.year),
      )
    }
  }
  const certificates = Object.values(config.cv.certificates).flat()
  await expect(document.locator('.cv-qualifications li')).toHaveCount(certificates.length)
  for (const item of certificates) await expect(document).toContainText(item.name)
  await expect(document.locator('.cv-affiliations')).toHaveCount(0)
  for (const affiliation of config.cv.affiliations)
    await expect(document).not.toContainText(affiliation.organization)
  await expect(document.locator('.cv-section > h2').first()).toHaveText('Education')
  await expect(document.locator('.cv-section > h2').first()).toHaveCSS('text-transform', 'none')
  const bithumb = document.locator('[data-entry="experience-6"]')
  await expect(bithumb.locator('li strong')).toHaveText(['8 reports', 'Independently authored', '2023 ETH Upgrade'])
  await expect(bithumb.locator('.cv-role em')).toHaveText('Researcher')
  await expect(bithumb.locator('.cv-role')).toContainText('Research Center · Researcher (Internship)')
  await expect(document.locator('[data-entry="experience-3"] .cv-period')).toHaveText('Dec 2025 - May 2026')
  await expect(document.locator('[data-entry="digital-asset-era"] li strong')).toHaveText('Bitcoin and Blockchain')
  await expect(document.locator('[data-entry="events-9"] .cv-role')).toHaveText('Co-host')
  await expect(document.locator('[data-entry="awards-2"] li')).toHaveCount(3)
  await expect(document.locator('[data-entry="awards-3"]')).toContainText('Funding period: Mar 2026 - Feb 2027')
  await expect(document.locator('[data-entry="awards-3"] .cv-period')).toHaveText('Selected Sep 2026')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  const screenContent = await document.innerText()
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.site-header')).toBeHidden()
  await expect(document).toBeVisible()
  expect(await document.innerText()).toBe(screenContent)
  await page.emulateMedia({ media: 'screen' })
  await page.goBack()
  await expect(page.getByRole('tab', { name: 'One-pager', exact: true })).toHaveAttribute('aria-selected', 'true')
  await page.goForward()
  await expect(page.getByRole('tab', { name: 'All', exact: true })).toHaveAttribute('aria-selected', 'true')
  for (const legacy of ['finance', 'crypto']) {
    await page.goto(`/#cv?view=${legacy}`)
    await expect(page.getByRole('article', { name: 'One-pager CV', exact: true })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'One-pager', exact: true })).toHaveAttribute('aria-selected', 'true')
  }
})
test('personal history retains the archive and links back to the book', async ({ page }) => {
  await page.goto('/#experience')
  await expect(page).toHaveURL(/#history$/)
  await expect(page.locator('.history-entry')).toHaveCount(history.length)
  await page.getByRole('textbox', { name: 'Search history' }).fill('Co-authored')
  await expect(page.locator('.history-entry')).toHaveCount(1)
  await page.getByRole('link', { name: 'View work' }).click()
  await expect(page).toHaveURL(/#writing\/book\/digital-asset-era/)
  await expect(
    page.getByRole('heading', { name: 'The Digital Asset Era Is Coming', exact: true }),
  ).toBeVisible()
})
test('PDF preview renders, pages forward, and restores the writing list', async ({ page }) => {
  await page.goto('/#articles')
  await page.getByRole('textbox', { name: 'Search writing' }).fill('CRYPTO NOTES 1')
  await page.locator('.writing-row').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('canvas')).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Next PDF page' })).toBeEnabled({
    timeout: 20000,
  })
  await expect
    .poll(async () => dialog.locator('canvas').evaluate((c) => c.width))
    .toBeGreaterThan(300)
  await expect(dialog.locator('.pdf-loading')).toHaveCount(0, { timeout: 20000 })
  await expect(dialog.getByRole('alert')).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Next PDF page' }).click()
  await expect(dialog.locator('.pdf-pagination [role="status"]')).toContainText('2 /')
  await expect(dialog.locator('.pdf-loading')).toHaveCount(0, { timeout: 20000 })
  await expect(dialog.getByRole('alert')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('.writing-row')).toHaveCount(1)
})
test('all pages fit the viewport and required static assets resolve', async ({ page, request }) => {
  for (const hash of ['home', 'writing', 'projects', 'cv', 'history']) {
    await page.goto(`/#${hash}`)
    await expect(page.locator('main h1')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    expect(await page.locator('body').innerText()).not.toMatch(/\p{Script=Hangul}/u)
    const accessibleText = await page
      .locator('[aria-label], [alt], [title], [placeholder]')
      .evaluateAll((elements) =>
        elements
          .flatMap((el) =>
            ['aria-label', 'alt', 'title', 'placeholder'].map(
              (attr) => el.getAttribute(attr) || '',
            ),
          )
          .join(' '),
      )
    expect(accessibleText).not.toMatch(/\p{Script=Hangul}/u)
    await expect(page.locator('.lucide-arrow-up-right')).toHaveCount(0)
    const counter = page.getByRole('img', { name: 'Total site views', exact: true })
    await expect(counter).toHaveAttribute(
      'src',
      'https://hits.sh/seungjun.site.svg?style=flat-square&label=views&color=0052ff&labelColor=eef1f5',
    )
    await expect(counter).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  }
  for (const file of [
    'assets/images/covers/digital-asset-era.jpg',
    'data/resume/resume_eng.pdf',
    ...config.projects.flatMap((p) =>
      p.links.map((l) => l.url).filter((url) => url.startsWith('data/projects/')),
    ),
    'CNAME',
  ])
    expect((await request.get(`/${file}`)).status()).toBe(200)
})
