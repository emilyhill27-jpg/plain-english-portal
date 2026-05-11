import { useState, useRef } from 'react'
import PdfViewer from './components/PdfViewer'
import TextPanel from './components/TextPanel'
import { resetAll, killSpeech } from './StateStore'
import './App.css'

export default function App() {
  const [sessionId, setSessionId]       = useState(null)
  const [blocks, setBlocks]             = useState([])
  const [uploadedImage, setUploadedImage] = useState(null)
  const [documentType, setDocumentType] = useState('government')
  const [sourceText, setSourceText]     = useState('')
  const rightColRef = useRef(null)
  const [loading, setLoading]           = useState(false)
  const [ocrLoading, setOcrLoading]     = useState(false)
  const [error, setError]               = useState('')

  // ── Single source of truth for clearing everything ──────────
  function resetAppState() {
    killSpeech()                     // line 1: kill before anything else
    resetAll({ setSessionId, setBlocks, setUploadedImage, setSourceText, setError })
  }

  // ── Open PDF ─────────────────────────────────────────────────
  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file || file.type !== 'application/pdf') return
    e.target.value = ''

    resetAppState()
    setDocumentType('government')   // always plain-English mode for PDFs
    setLoading(true)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) {
        const { detail } = await res.json().catch(() => ({}))
        throw new Error(detail || `Server error ${res.status}`)
      }
      const data = await res.json()
      setSessionId(data.session_id)
      setBlocks(data.blocks || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Upload Worksheet (JPG) ────────────────────────────────────
  async function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''

    resetAppState()
    setDocumentType('academic')     // always homework-tutor mode for worksheets
    setOcrLoading(true)

    // Show image immediately — OCR result arrives shortly after
    setUploadedImage(URL.createObjectURL(file))

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/ocr', { method: 'POST', body: form })
      if (!res.ok) {
        const { detail } = await res.json().catch(() => ({}))
        throw new Error(detail || `Server error ${res.status}`)
      }
      const { text } = await res.json()
      setSourceText(text)
    } catch (err) {
      setError(err.message)
    } finally {
      setOcrLoading(false)
    }
  }

  // ── Left column ───────────────────────────────────────────────
  function renderLeftColumn() {
    if (uploadedImage) {
      return (
        <div className="image-viewer">
          {ocrLoading && (
            <div className="image-ocr-banner">
              Reading worksheet… text will appear on the right shortly.
            </div>
          )}
          <img src={uploadedImage} alt="Uploaded worksheet" style={{ width: '100%' }} />
        </div>
      )
    }
    if (sessionId) {
      return (
        <PdfViewer
          sessionId={sessionId}
          blocks={blocks}
          onTextSelect={setSourceText}
        />
      )
    }
    return (
      <div className="pdf-empty">
        <p>Open a PDF or upload a worksheet image to get started.</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="logo-mark">PE</span>
        <span className="logo-name">Plain English</span>
        {error && <span className="header-error">{error}</span>}

        <label className={`upload-btn upload-btn-secondary ${ocrLoading ? 'upload-btn-loading' : ''}`}>
          {ocrLoading ? 'Reading image…' : 'Upload Worksheet (JPG)'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={ocrLoading || loading}
            hidden
          />
        </label>

        <label className={`upload-btn ${loading ? 'upload-btn-loading' : ''}`}>
          {loading ? 'Reading PDF…' : 'Open PDF'}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={loading || ocrLoading}
            hidden
          />
        </label>
      </header>

      <div className="split">
        <section className="split-left">
          {renderLeftColumn()}
        </section>
        <section className="split-right" ref={rightColRef}>
          <TextPanel sourceText={sourceText} documentType={documentType} scrollRef={rightColRef} />
        </section>
      </div>
    </div>
  )
}
