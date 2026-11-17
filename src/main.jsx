import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import { legacyHref, routeFromLocation } from './lib/site.mjs'
import { renderHead, sitePages } from './lib/seo.mjs'
import config from '../data/portfolio-config.json'
import './styles.css'

const legacy = legacyHref(window.location.hash)
if (legacy) {
  window.location.replace(legacy)
} else {
  const root = document.getElementById('root')
  // Match the static document first; query filters and anchors apply after hydration.
  const initialRoute = routeFromLocation({ pathname: window.location.pathname })
  const app = <React.StrictMode><App initialRoute={initialRoute} /></React.StrictMode>
  if (root.hasChildNodes()) hydrateRoot(root, app)
  else {
    // Development serves the same shell at every URL. Production metadata is static.
    if (import.meta.env.DEV) {
      const page = sitePages(config).find((page) => page.path === window.location.pathname)
      if (page) {
        document.querySelectorAll('[data-dev-seo]').forEach((node) => node.remove())
        const template = document.createElement('template')
        template.innerHTML = renderHead(page, config)
        for (const node of template.content.children) node.dataset.devSeo = ''
        document.head.append(template.content)
      }
    }
    createRoot(root).render(app)
  }
}
