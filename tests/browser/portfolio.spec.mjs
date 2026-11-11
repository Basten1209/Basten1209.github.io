import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

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
test('CV focus persists on reload and print contains only the chosen CV', async ({ page }) => {
  await page.goto('/#cv')
  await expect(page.locator('.cv-document')).toBeVisible()
  await expect(page.locator('.cv-section').last()).toHaveAttribute('data-section', 'education')
  await expect(
    page.locator('[data-section="experience"] + [data-section="publications"]'),
  ).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Expertise', exact: true })).toHaveCount(0)
  await expect(page.locator('.cv-affiliations')).toHaveCount(0)
  for (const affiliation of config.cv.affiliations) {
    await expect(page.locator('.cv-document')).not.toContainText(affiliation.organization)
  }
  await page.getByRole('tab', { name: 'Finance', exact: true }).click()
  await expect(page).toHaveURL(/view=finance/)
  await page.reload()
  await expect(page.getByRole('tab', { name: 'Finance', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.locator('.cv-document')).toContainText('WorldQuant')
  await expect(page.locator('.cv-document')).toContainText('Base Korea')
  await expect(page.locator('[data-section="experience"]')).not.toContainText('Base Korea')
  await expect(page.locator('[data-section="extracurricular"]')).toContainText('Base Korea')
  await expect(page.getByRole('heading', { name: 'Affiliations', exact: true })).toHaveCount(0)
  await expect(page.locator('.cv-section').first()).toHaveAttribute('data-section', 'education')
  await expect(
    page.locator('[data-section="experience"] + [data-section="publications"]'),
  ).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Expertise', exact: true })).toHaveCount(0)
  await expect(page.locator('.cv-document')).toContainText('PDAO (POSTECH DAO)')
  await expect(page.locator('.cv-document')).not.toContainText('NinjaLabsKR')
  await expect(page.locator('.cv-affiliations')).toHaveCount(0)
  const sharedText = {}
  for (const section of ['experience', 'research']) {
    sharedText[section] = await page.locator(`[data-section="${section}"]`).textContent()
  }
  await expect(page.getByRole('link', { name: 'PDF · English', exact: true })).toHaveAttribute(
    'href',
    'data/resume/resume_eng.pdf',
  )
  await expect(page.getByRole('link', { name: 'PDF · Korean', exact: true })).toHaveCount(0)
  const screenContent = await page.locator('.cv-document').textContent()
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.site-header')).toBeHidden()
  await expect(page.locator('.cv-document')).toBeVisible()
  await expect(page.locator('.cv-document')).toHaveAccessibleName('Finance CV')
  expect(await page.locator('.cv-document').textContent()).toBe(screenContent)
  await page.emulateMedia({ media: 'screen' })
  await page.getByRole('tab', { name: 'Crypto', exact: true }).click()
  await expect(page.locator('.cv-document')).toContainText('Base Korea')
  await expect(page.locator('.cv-document')).toContainText('Brain Platform Consultant')
  for (const section of ['experience', 'research']) {
    expect(await page.locator(`[data-section="${section}"]`).textContent()).toBe(
      sharedText[section],
    )
  }
  await expect(page.locator('.cv-section').first()).toHaveAttribute('data-section', 'experience')
  await expect(page.locator('.cv-section').last()).toHaveAttribute('data-section', 'education')
  await expect(
    page.locator('[data-section="experience"] + [data-section="publications"]'),
  ).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Expertise', exact: true })).toHaveCount(0)
  for (const activity of [
    'PDAO (POSTECH DAO)',
    'Base Korea',
    'NinjaLabsKR',
    'SuperteamKR',
    'POSTECH CCBR',
    'Undergrad AI Study',
  ]) {
    await expect(page.locator('[data-section="extracurricular"]')).toContainText(activity)
  }
  await expect(page.locator('[data-section="extracurricular"]')).toHaveCount(1)
  await expect(page.locator('.cv-affiliations')).toHaveText(
    'Affiliations · NinjaLabsKR · SuperteamKR · POSTECH CCBR',
  )
  await expect(page.locator('[data-section="extracurricular"] .cv-entry')).toHaveCount(4)
  const cryptoContent = await page.locator('.cv-document').textContent()
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.cv-affiliations')).toBeVisible()
  expect(await page.locator('.cv-document').textContent()).toBe(cryptoContent)
  await page.emulateMedia({ media: 'screen' })
  await expect(page.locator('[data-section="experience"]')).not.toContainText('Base Korea')
  await page.reload()
  expect(
    await page
      .locator('.cv-section')
      .evaluateAll((sections) => sections.map((section) => section.dataset.section)),
  ).toEqual(config.cv.views.crypto.sections)
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
