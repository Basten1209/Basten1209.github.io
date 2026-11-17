import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createServer } from 'vite'
import { renderHead, renderSitemap, sitePages } from '../src/lib/seo.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const config = JSON.parse(await readFile(path.join(root, 'data/portfolio-config.json'), 'utf8'))
const template = await readFile(path.join(root, 'dist/index.html'), 'utf8')
if (!template.includes('<!--seo-head-->') || !template.includes('<div id="root"></div>'))
  throw new Error('Static HTML template markers are missing. Run a fresh Vite build.')

// Use Vite's JSX, aliases, and raw-file transforms without a listening server or
// a browser. The exact same React tree is rendered for crawlers and visitors.
const server = await createServer({ root, server: { middlewareMode: true, watch: null }, appType: 'custom' })
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
  for (const page of sitePages(config)) {
    const directory = path.join(root, 'dist', page.path)
    await mkdir(directory, { recursive: true })
    const html = template
      .replace('<!--seo-head-->', () => renderHead(page, config))
      .replace('<div id="root"></div>', () => `<div id="root">${render(page.path)}</div>`)
    await writeFile(path.join(directory, 'index.html'), html)
  }
  await writeFile(path.join(root, 'dist/sitemap.xml'), renderSitemap(config))
  // GitHub Pages serves this with an actual 404 status; do not turn unknown
  // paths into indexable copies of the homepage via an SPA fallback.
  await writeFile(path.join(root, 'dist/404.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Seungjun Oh</title></head>
<body><main><h1>Page not found</h1><p>This address does not exist. <a href="/">Visit Seungjun Oh’s homepage</a>.</p></main></body></html>`)
  console.log(`Prerendered ${sitePages(config).length} pages and generated sitemap.xml.`)
} finally {
  await server.close()
}
