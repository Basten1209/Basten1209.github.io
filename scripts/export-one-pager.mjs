import { spawn } from 'node:child_process'
import { writeFile, copyFile, readFile } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium } from '@playwright/test'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

// Run after building. Use a dedicated preview process and always close it.
const port = Number(process.env.ONE_PAGER_PORT || 4187)
const origin = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, [
  'node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1',
  '--port', String(port), '--strictPort',
], { stdio: ['ignore', 'ignore', 'pipe'] })
let serverError = ''
server.stderr.on('data', (chunk) => { serverError += chunk.toString() })
let browser
try {
  for (let attempt = 0; ; attempt++) {
    if (server.exitCode !== null) throw new Error(serverError || 'Preview server stopped')
    try {
      if ((await fetch(origin)).ok) break
    } catch { /* Preview is still starting. */ }
    if (attempt >= 100) throw new Error('Preview server did not become ready')
    await delay(100)
  }
  // Avoid exporting a stale build after editing the shared source.
  const source = await readFile('data/resume/one-pager.md', 'utf8')
  const builtSource = await readFile('dist/data/resume/one-pager.md', 'utf8')
  if (source !== builtSource) throw new Error('Build is stale; run npm run build first')

  browser = await chromium.launch({ headless: true })
  // Keep the desktop viewport wider than the sheet; @page controls PDF dimensions.
  const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } })
  // The résumé fonts are bundled locally. Never increment the real visitor counter.
  await page.route('https://**/*', (route) => route.abort())
  await page.goto(`${origin}/#cv`, { waitUntil: 'networkidle' })
  await page.locator('.onepager').waitFor()
  await page.evaluate(async () => {
    for (const style of ['400', '700', 'italic 400', 'italic 700'])
      await document.fonts.load(`${style} 10pt "Spectral Resume"`)
    await document.fonts.ready
    document.title = 'Seungjun Oh - One-pager CV'
  })
  const screenText = await page.locator('.onepager').innerText()
  const buffer = await page.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true })
  const loadingTask = getDocument({ data: new Uint8Array(buffer) })
  const pdf = await loadingTask.promise
  try {
    if (pdf.numPages !== 1) throw new Error(`One-pager overflow: ${pdf.numPages} pages; adjust print layout`)
    const firstPage = await pdf.getPage(1)
    const { width, height } = firstPage.getViewport({ scale: 1 })
    // Allow sub-point rounding in Chromium's PDF output.
    if (Math.abs(width - 210 * 72 / 25.4) > 1 || Math.abs(height - 297 * 72 / 25.4) > 1)
      throw new Error(`One-pager must be A4 (210 × 297 mm); got ${width} × ${height} pt`)
    const content = await firstPage.getTextContent()
    const pdfText = content.items.map((item) => item.str || '').join(' ')
    const compact = (text) => text.normalize('NFKC').replace(/[\s•●·]/gu, '')
    if (compact(pdfText) !== compact(screenText))
      throw new Error('PDF text differs from the displayed one-pager')
  } finally {
    await loadingTask.destroy()
  }
  await writeFile('data/resume/resume_eng.pdf', buffer)
  await copyFile('data/resume/resume_eng.pdf', 'dist/data/resume/resume_eng.pdf')
  console.log('Exported data/resume/resume_eng.pdf: 1 A4 page, matching the website text')
} finally {
  await browser?.close()
  server.kill('SIGTERM')
}
