import { absoluteUrl, siteOrigin } from './site.mjs'
import { writingItems } from './portfolio.mjs'

export function sitePages(config) {
  return [
    { path: '/', title: `${config.profile.name} | Digital Asset Markets & Blockchain Research`, description: config.profile.tagline, type: 'ProfilePage' },
    { path: '/writing/', title: `Writing & Publications | ${config.profile.name}`, description: `Articles, research reports, paper reviews, and a co-authored book by ${config.profile.name}, covering blockchain, digital assets, and financial econometrics.`, type: 'CollectionPage' },
    { path: '/projects/', title: `Research & Projects | ${config.profile.name}`, description: `Explore ${config.profile.name}'s research, software, and coursework projects in quantitative finance, blockchain, digital assets, and AI.`, type: 'CollectionPage' },
    { path: '/cv/', title: `CV | ${config.profile.name}`, description: `${config.profile.name}'s one-page CV: education, work, research, publications, selected awards, and certifications. Download the English resume.`, type: 'ProfilePage' },
    { path: '/cv/all/', title: `Full CV | ${config.profile.name}`, description: `${config.profile.name}'s full curriculum vitae, including education, work and research experience, publications, projects, awards, and qualifications.`, type: 'ProfilePage' },
    { path: '/history/', title: `Experience & Milestones | ${config.profile.name}`, description: `A chronological record of ${config.profile.name}'s professional activities, research, community involvement, competitions, and milestones.`, type: 'CollectionPage' },
    ...config.publications.map((book) => ({ path: `/writing/book/${book.id}/`, title: `${book.title} | ${config.profile.name}`, description: `${book.role}: ${config.profile.name}. ${book.description} Published by ${book.publisher} (${book.date.slice(0, 4)}).`, type: 'WebPage', book })),
  ]
}

export function structuredData(page, config) {
  const url = absoluteUrl(page.path)
  const personId = `${siteOrigin}/#person`
  const websiteId = `${siteOrigin}/#website`
  const graph = [
    {
      '@type': 'Person', '@id': personId, name: config.profile.name,
      alternateName: config.profile.nameKor, url: `${siteOrigin}/`,
      image: absoluteUrl(config.profile.image), description: config.profile.tagline,
      sameAs: Object.values(config.profile.social),
    },
    { '@type': 'WebSite', '@id': websiteId, url: `${siteOrigin}/`, name: config.profile.name, inLanguage: 'en', publisher: { '@id': personId } },
    {
      '@type': page.type, '@id': `${url}#webpage`, url, name: page.title,
      description: page.description, inLanguage: 'en', isPartOf: { '@id': websiteId },
      about: { '@id': personId },
      ...(page.type === 'ProfilePage' ? { mainEntity: { '@id': personId } } : {}),
    },
  ]
  const webpage = graph[2]
  if (page.path !== '/') {
    const parents = page.book ? [['Writing', '/writing/']]
      : page.path === '/cv/all/' ? [['CV', '/cv/']] : []
    const crumbs = [['Home', '/'], ...parents, [page.title.split(' | ')[0], page.path]]
    webpage.breadcrumb = { '@id': `${url}#breadcrumb` }
    graph.push({ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: crumbs.map(([name, path], index) => ({ '@type': 'ListItem', position: index + 1, name, item: absoluteUrl(path) })) })
  }
  if (page.path === '/writing/' || page.path === '/projects/') {
    const items = page.path === '/writing/' ? writingItems(config).map((item) => ({
      name: item.title,
      url: absoluteUrl(item.kind === 'Book' ? `/writing/book/${item.id}/` : item.href),
      description: item.description,
    })) : config.projects.map((project) => ({
      name: project.title, url: `${siteOrigin}/projects/#project-${project.id}`,
      description: project.details || project.description,
    }))
    webpage.mainEntity = { '@id': `${url}#works` }
    graph.push({ '@type': 'ItemList', '@id': `${url}#works`, numberOfItems: items.length, itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, item: { '@type': 'CreativeWork', ...item } })) })
  }
  if (page.book) {
    const book = page.book
    webpage.mainEntity = { '@id': `${url}#book` }
    graph.push({
      '@type': 'Book', '@id': `${url}#book`, name: book.title,
      alternateName: book.originalTitle, isbn: book.isbn, inLanguage: book.language,
      description: book.description, image: absoluteUrl(book.cover), url,
      sameAs: book.url, contributor: { '@id': personId },
      publisher: { '@type': 'Organization', name: book.publisher },
      // Keep the source's month precision; do not fabricate a publication day.
      datePublished: book.date,
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])

export function renderHead(page, config) {
  const title = escapeHtml(page.title)
  const description = escapeHtml(page.description)
  const url = escapeHtml(absoluteUrl(page.path))
  const image = escapeHtml(absoluteUrl(config.profile.image))
  const json = JSON.stringify(structuredData(page, config)).replace(/</g, '\\u003c')
  return `<title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="author" content="${escapeHtml(config.profile.name)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="${page.type === 'ProfilePage' ? 'profile' : 'website'}">
  <meta property="og:site_name" content="${escapeHtml(config.profile.name)}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="en_US">
  <meta property="og:image" content="${image}">
  <meta property="og:image:alt" content="Seungjun Oh’s penguin avatar">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="Seungjun Oh’s penguin avatar">
  <script type="application/ld+json">${json}</script>`
}

export function renderSitemap(config) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitePages(config).map((page) => `  <url><loc>${escapeHtml(absoluteUrl(page.path))}</loc></url>`).join('\n')}\n</urlset>\n`
}
