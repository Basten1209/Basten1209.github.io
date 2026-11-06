import { useEffect, useRef, useState } from 'react'
import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { ChevronLeft, ChevronRight, Download, ExternalLink, LoaderCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { reportHref } from '@/lib/portfolio.mjs'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export default function PDFViewer({ report, onClose, returnFocus }) {
  const [document, setDocument] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(true)
  const canvas = useRef(null)
  const container = useRef(null)
  const [width, setWidth] = useState(700)
  const href = reportHref(report)
  useEffect(() => {
    let live = true
    const task = pdfjs.getDocument({ url: href })
    task.promise
      .then((pdf) => {
        if (live) setDocument(pdf)
      })
      .catch((error) => {
        if (live) {
          console.error('PDF preview failed', error)
          setError(
            'The preview could not be loaded. You can still open or download the original PDF.',
          )
          setBusy(false)
        }
      })
    return () => {
      live = false
      task.destroy()
    }
  }, [href])
  useEffect(() => {
    if (!container.current) return
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(200, entry.contentRect.width - 32)),
    )
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!document || !canvas.current) return
    let live = true,
      renderTask
    setBusy(true)
    document
      .getPage(pageNumber)
      .then((page) => {
        if (!live) return
        const scale = Math.min(width / page.getViewport({ scale: 1 }).width, 1.7)
        const viewport = page.getViewport({ scale })
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const element = canvas.current
        element.width = Math.floor(viewport.width * dpr)
        element.height = Math.floor(viewport.height * dpr)
        element.style.width = `${viewport.width}px`
        element.style.height = `${viewport.height}px`
        renderTask = page.render({
          canvasContext: element.getContext('2d'),
          viewport,
          transform: dpr === 1 ? null : [dpr, 0, 0, dpr, 0, 0],
        })
        return renderTask.promise
      })
      .then(() => {
        if (live) setBusy(false)
      })
      .catch((e) => {
        if (live && e.name !== 'RenderingCancelledException') {
          setError('This page could not be previewed. Open the original PDF below.')
          setBusy(false)
        }
      })
    return () => {
      live = false
      renderTask?.cancel()
    }
  }, [document, pageNumber, width])
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className="pdf-dialog"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          returnFocus?.()
        }}
      >
        <DialogHeader>
          <DialogTitle>{report.title}</DialogTitle>
          <DialogDescription>Document preview</DialogDescription>
        </DialogHeader>
        <div className="pdf-toolbar">
          <div className="pdf-pagination">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous PDF page"
              disabled={!document || pageNumber <= 1}
              onClick={() => setPageNumber((n) => n - 1)}
            >
              <ChevronLeft />
            </Button>
            <span role="status">
              {document
                ? `${pageNumber} / ${document.numPages}`
                : error
                  ? 'Preview unavailable'
                  : 'Loading…'}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next PDF page"
              disabled={!document || pageNumber >= document.numPages}
              onClick={() => setPageNumber((n) => n + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" asChild>
              <a href={href} download aria-label="Download PDF">
                <Download />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open original PDF"
              >
                <ExternalLink />
              </a>
            </Button>
          </div>
        </div>
        <div className="pdf-canvas-container" ref={container}>
          {busy && (
            <p className="pdf-loading" role="status">
              <LoaderCircle className="animate-spin" size={18} />
              Loading page…
            </p>
          )}
          {error ? (
            <p role="alert" className="pdf-error">
              {error}
            </p>
          ) : (
            <canvas ref={canvas} aria-label={`Page ${pageNumber} of ${report.title}`} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
