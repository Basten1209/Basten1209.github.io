import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { parseRoute } from '@/lib/portfolio.mjs'
import config from '../data/portfolio-config.json'
import history from '../data/proof-of-work.json'
import Home from '@/pages/Home'
import Writing from '@/pages/Writing'
import Projects from '@/pages/Projects'
import CV from '@/pages/CV'
import History from '@/pages/History'

const PDFViewer = lazy(() => import('@/components/PDFViewer'))
const navigation = [
  ['home', 'Home'],
  ['writing', 'Writing'],
  ['projects', 'Projects'],
  ['cv', 'CV'],
  ['history', 'History'],
]

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  const [menuOpen, setMenuOpen] = useState(false)
  const [pdf, setPDF] = useState(null)
  const pdfTrigger = useRef(null)
  const openPDF = (report) => {
    pdfTrigger.current = document.activeElement
    setPDF(report)
  }
  useEffect(() => {
    const update = () => {
      setRoute(parseRoute(window.location.hash))
      setMenuOpen(false)
      setPDF(null)
    }
    window.addEventListener('hashchange', update)
    if (/^#(articles|experience)(?:$|\/|\?)/.test(location.hash)) {
      location.replace(
        location.hash.replace(/^#articles/, '#writing').replace(/^#experience/, '#history'),
      )
    }
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    if (route.page !== 'projects' || !route.parts[0])
      window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route.page, route.parts[0]])

  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main').focus()
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="wordmark" href="#home" aria-label="Seungjun Oh — Home">
            SEUNGJUN OH
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map(([page, label]) => (
              <a
                href={`#${page}`}
                key={page}
                aria-current={route.page === page ? 'page' : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
          <Button asChild className="contact-button">
            <a href={`mailto:${config.profile.email}`}>Contact</a>
          </Button>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mobile-menu-button"
                aria-label="Open navigation"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="mobile-sheet">
              <SheetHeader>
                <SheetTitle>Seungjun Oh</SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile navigation">
                {navigation.map(([page, label]) => (
                  <a
                    href={`#${page}`}
                    key={page}
                    onClick={() => setMenuOpen(false)}
                    aria-current={route.page === page ? 'page' : undefined}
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <Button asChild>
                <a href={`mailto:${config.profile.email}`}>Contact</a>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main id="main" tabIndex={-1} className={`main-content page-${route.page}`}>
        {route.page === 'home' && <Home config={config} />}
        {route.page === 'writing' && <Writing config={config} route={route} onOpenPDF={openPDF} />}
        {route.page === 'projects' && (
          <Projects config={config} route={route} onOpenPDF={openPDF} />
        )}
        {route.page === 'cv' && <CV config={config} view={route.view} />}
        {route.page === 'history' && <History entries={history} />}
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <a href="#home" className="footer-name">
              Seungjun Oh
            </a>
          </div>
          <div className="footer-links">
            <a href={`mailto:${config.profile.email}`}>Email</a>
            {['github', 'linkedin', 'medium', 'twitter'].map((key) => (
              <a
                key={key}
                href={config.profile.social[key]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {
                  {
                    github: 'GitHub',
                    linkedin: 'LinkedIn',
                    twitter: 'X / Twitter',
                    medium: 'Medium',
                  }[key]
                }
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Seungjun Oh</span>
          <img
            src="https://hits.sh/seungjun.site.svg?style=flat-square&label=views&color=0052ff&labelColor=eef1f5"
            alt="Total site views"
            className="site-views"
            height="20"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </footer>
      {pdf && (
        <Suspense
          fallback={
            <div role="status" className="loading-toast">
              Opening document…
            </div>
          }
        >
          <PDFViewer
            report={pdf}
            onClose={() => setPDF(null)}
            returnFocus={() => pdfTrigger.current?.focus()}
          />
        </Suspense>
      )}
    </>
  )
}
