import { test, expect } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const origin = 'https://seungjun.site'
const pages = [
  ['/', 'Seungjun Oh', 'Background'],
  ['/writing/', 'Writing', 'CRYPTO NOTES 1'],
  ['/projects/', 'Projects', 'LIFT'],
  ['/cv/', 'CV', 'Selected Certifications'],
  ['/cv/all/', 'CV', 'Qualifications'],
  ['/history/', 'History', 'PDAO'],
  ['/writing/book/digital-asset-era/', 'Writing', 'The Digital Asset Era Is Coming'],
]

test.beforeEach(async ({ page }) => {
  // No live counter visits or dependency on third-party font services.
  await page.route('https://**/*', (route) => route.abort())
})

test('every public URL serves full HTML, unique metadata, and working local assets', async ({ page, request }) => {
  const titles = new Set()
  const descriptions = new Set()
  for (const [url, heading, content] of pages) {
    const response = await request.get(url)
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toContain(content)
    expect(html).toContain('<h1')
    expect(html).not.toContain('<!--seo-head-->')
    // Assert these are real deployable files, not Vite's SPA fallback.
    expect(existsSync(path.join('dist', url, 'index.html'))).toBe(true)
    await page.goto(url)
    await expect(page.locator('main h1')).toHaveText(heading)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}${url}`)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${origin}${url}`)
    expect(await page.title()).toContain('Seungjun Oh')
    titles.add(await page.title())
    descriptions.add(await page.locator('meta[name="description"]').getAttribute('content'))
    const data = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())
    expect(data['@graph'].find((item) => item['@type'] === 'Person').alternateName).toBe('오승준')
    const links = await page.locator('a[href], img[src], script[src], link[rel="stylesheet"]').evaluateAll((elements) => elements.map((element) => element.getAttribute('href') || element.getAttribute('src')))
    for (const href of links.filter((href) => href.startsWith('/'))) {
      const target = new URL(href, origin).pathname
      const file = target.endsWith('/') ? `${target}index.html` : decodeURIComponent(target)
      expect(existsSync(path.join('dist', file)), `Missing local resource: ${href} on ${url}`).toBe(true)
    }
  }
  expect(titles.size).toBe(pages.length)
  expect(descriptions.size).toBe(pages.length)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
  expect(urls.sort()).toEqual(pages.map(([url]) => `${origin}${url}`).sort())
  expect(sitemap).not.toMatch(/<lastmod>|<changefreq>|<priority>/)
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toContain('Sitemap: https://seungjun.site/sitemap.xml')
  expect(robots).toMatch(/User-agent: OAI-SearchBot\s+Allow: \//)
  expect(readFileSync('dist/404.html', 'utf8')).toContain('content="noindex"')
})

test('content, page navigation, and documents remain readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  await context.route('https://**/*', (route) => route.abort())
  const page = await context.newPage()
  try {
    for (const [url, heading, content] of pages) {
      await page.goto(`http://127.0.0.1:4173${url}`)
      await expect(page.locator('main h1')).toHaveText(heading)
      await expect(page.locator('main')).toContainText(content)
    }
    await page.goto('http://127.0.0.1:4173/')
    await page.getByRole('navigation', { name: 'Navigation without JavaScript', exact: true }).getByRole('link', { name: 'CV', exact: true }).click()
    await expect(page.locator('.onepager')).toBeVisible()
    await page.getByRole('tab', { name: 'All', exact: true }).click()
    await expect(page.locator('.cv-document')).toBeVisible()
    const response = await page.request.get(await page.getByRole('link', { name: 'PDF · One-pager', exact: true }).getAttribute('href'))
    expect(response.headers()['content-type']).toContain('application/pdf')
  } finally {
    await context.close()
  }
})

test('direct page loads hydrate without errors and retain page metadata during interaction', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error' && /hydration|hydrating|react error/i.test(message.text())) errors.push(message.text()) })
  for (const [url] of pages) {
    await page.goto(url)
    await expect(page.locator('main h1')).toBeVisible()
  }
  await page.goto('/projects/?type=inclass')
  await expect(page.getByRole('tab', { name: 'In-class', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}/projects/`)
  await page.goto('/#cv?view=all')
  await expect(page).toHaveURL(/\/cv\/all\/$/)
  await expect(page).toHaveTitle('Full CV | Seungjun Oh')
  expect(errors).toEqual([])
})
