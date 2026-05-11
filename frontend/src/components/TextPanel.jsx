import { useState, useRef, useEffect, useCallback } from 'react'
import { ACADEMIC_PROMPT, GOVERNMENT_PROMPT } from '../prompts'
import { stopSpeech as masterStop, killSpeech } from '../StateStore'

function splitSentences(text) {
  const parts = []
  const re = /[^.!?\n]+(?:[.!?]+\s*|\n|$)/g
  let m
  while ((m = re.exec(text)) !== null) {
    if (m[0].trim()) parts.push(m[0])
  }
  return parts.length ? parts : [text]
}

function buildPositions(sentences) {
  const pos = []
  let cur = 0
  for (const s of sentences) { pos.push(cur); cur += s.length }
  return pos
}

function pickVoice(voices) {
  const en = voices.filter(v => v.lang.startsWith('en'))
  return (
    en.find(v => /^samantha$/i.test(v.name))               ||
    en.find(v => /google us english/i.test(v.name))        ||
    en.find(v => /microsoft aria/i.test(v.name))           ||
    en.find(v => /google uk english female/i.test(v.name)) ||
    en.find(v => /google.*english/i.test(v.name))          ||
    en.find(v => /microsoft.*natural/i.test(v.name))       ||
    en.find(v => /karen|moana|daniel/i.test(v.name))       ||
    en.find(v => v.localService)                           ||
    en[0] || null
  )
}

const CHECKLIST_PROMPT = `Convert the following text into a simple action checklist.
Format each item as a checkbox line starting with [ ].
Use plain, short language. Maximum 10 words per item.
Only include things the person needs to DO or REMEMBER.
Output only the checklist — no introduction, no explanation.`

export default function TextPanel({ sourceText, documentType, scrollRef }) {
  const [simplified, setSimplified] = useState('')
  const [loading, setLoading]       = useState(false)
  const [checklistLoading, setChecklistLoading] = useState(false)
  const [error, setError]           = useState('')
  const [speaking, setSpeaking]     = useState(false)
  const [paused, setPaused]         = useState(false)
  const [activeIdx, setActiveIdx]   = useState(-1)
  const [voices, setVoices]         = useState([])

  const abortRef     = useRef(null)
  const sentenceRefs = useRef([])
  const utteranceRef = useRef(null)
  const keepAliveRef = useRef(null)
  const panelRef     = useRef(null)
  const synth        = window.speechSynthesis

  // ── Kill switch ──────────────────────────────────────────────
  const stopSpeech = useCallback(() => {
    masterStop({ utteranceRef, keepAliveRef, setSpeaking, setPaused, setActiveIdx })
  }, [])

  // ── Load voices async ────────────────────────────────────────
  useEffect(() => {
    function load() { const v = synth.getVoices(); if (v.length) setVoices(v) }
    load()
    synth.onvoiceschanged = load
    return () => { synth.onvoiceschanged = null }
  }, [synth])

  // ── Stop on unmount ──────────────────────────────────────────
  useEffect(() => () => killSpeech(), [])

  // ── Auto-scroll RIGHT COLUMN to top when new text selected ──
  useEffect(() => {
    killSpeech()
    if (scrollRef?.current) scrollRef.current.scrollTop = 0
  }, [sourceText])               // eslint-disable-line

  // ── Stop + clear simplified when doc type switches ───────────
  useEffect(() => {
    stopSpeech()
    setSimplified('')
  }, [documentType])             // eslint-disable-line

  // ── Stop when simplified regenerates ────────────────────────
  useEffect(() => { stopSpeech() }, [simplified]) // eslint-disable-line

  // ── Spacebar pause / resume ──────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.code !== 'Space') return
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
    e.preventDefault()
    if (synth.paused) { synth.resume(); setPaused(false) }
    else              { synth.pause();  setPaused(true)  }
  }, [synth])

  useEffect(() => {
    if (speaking) document.addEventListener('keydown', handleKeyDown)
    else          document.removeEventListener('keydown', handleKeyDown)
    return ()  => document.removeEventListener('keydown', handleKeyDown)
  }, [speaking, handleKeyDown])

  // ── Simplify ─────────────────────────────────────────────────
  async function streamToState(prompt, setText, setLoad) {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoad(true); setText(''); setError('')
    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText, system: prompt }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') break
          try {
            const { text, error: err } = JSON.parse(payload)
            if (err) throw new Error(err)
            if (text) setText(s => s + text)
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message)
    } finally {
      setLoad(false)
    }
  }

  function handleSimplify() {
    if (!sourceText.trim()) return
    killSpeech(); stopSpeech()
    streamToState(
      documentType === 'academic' ? ACADEMIC_PROMPT : GOVERNMENT_PROMPT,
      setSimplified,
      setLoading
    )
  }

  function handleChecklist() {
    if (!sourceText.trim()) return
    killSpeech(); stopSpeech()
    streamToState(CHECKLIST_PROMPT, setSimplified, setChecklistLoading)
  }

  // ── Speech ───────────────────────────────────────────────────
  function startSpeech(text) {
    killSpeech(); stopSpeech()
    const sentences = splitSentences(text)
    const positions = buildPositions(sentences)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate  = 0.7
    utterance.pitch = 1.0
    const voice = pickVoice(voices.length ? voices : synth.getVoices())
    if (voice) utterance.voice = voice
    utterance.onboundary = (e) => {
      let idx = 0
      for (let i = positions.length - 1; i >= 0; i--) {
        if (e.charIndex >= positions[i]) { idx = i; break }
      }
      setActiveIdx(idx)
      sentenceRefs.current[idx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
    utterance.onend   = () => stopSpeech()
    utterance.onerror = (e) => { if (e.error !== 'canceled') stopSpeech() }
    utteranceRef.current = utterance
    setTimeout(() => { synth.speak(utterance); setSpeaking(true); setPaused(false) }, 0)
    keepAliveRef.current = setInterval(() => {
      if (!synth.speaking) { clearInterval(keepAliveRef.current); return }
      synth.pause(); synth.resume()
    }, 14000)
  }

  function handlePauseResume() {
    if (paused) { synth.resume(); setPaused(false) }
    else        { synth.pause();  setPaused(true)  }
  }

  const sentences = simplified ? splitSentences(simplified) : []

  return (
    <div className="text-panel" ref={panelRef}>

      {/* ── Mode badge ── */}
      <div className={`mode-badge ${documentType === 'academic' ? 'mode-academic' : 'mode-government'}`}>
        {documentType === 'academic' ? '📚 Homework Tutor — Year 5–6' : '📄 Government / Official Document'}
      </div>

      {/* ── Source Text ── */}
      <div className="panel-section">
        <label className="panel-label">Source Text</label>
        <p className="panel-hint">Select text from the PDF or worksheet — it appears here.</p>
        <div className="source-box dyslexia">
          {sourceText || <span className="placeholder">Selected text will appear here…</span>}
        </div>
        <button
          className="simplify-btn"
          onClick={handleSimplify}
          disabled={!sourceText.trim() || loading || checklistLoading}
        >
          {loading ? 'Simplifying…' : '✦ Simplify'}
        </button>
      </div>

      {/* ── Plain English output ── */}
      <div className="panel-section">
        <label className="panel-label">Plain English</label>
        {error && <p className="panel-error">{error}</p>}
        <div className="simplified-box dyslexia">
          {sentences.length > 0
            ? sentences.map((s, i) => (
                <span
                  key={i}
                  ref={el => sentenceRefs.current[i] = el}
                  className={`sentence-chunk ${i === activeIdx ? 'sentence-active' : ''}`}
                >
                  {s}
                </span>
              ))
            : <span className="placeholder">Simplified text will appear here…</span>}
        </div>

        {/* ── Action buttons under Plain English ── */}
        <div className="action-bar">
          <button
            className="action-btn checklist-btn"
            onClick={handleChecklist}
            disabled={!sourceText.trim() || loading || checklistLoading}
          >
            {checklistLoading ? 'Building…' : '☑ Create Checklist'}
          </button>

          {!speaking ? (
            <button
              className="action-btn read-btn"
              onClick={() => simplified && startSpeech(simplified)}
              disabled={!simplified}
            >
              🔊 Read Aloud
            </button>
          ) : (
            <>
              <button className="action-btn read-btn" onClick={handlePauseResume}>
                {paused ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button className="action-btn stop-btn" onClick={stopSpeech}>⏹ Stop</button>
            </>
          )}

          {simplified && (
            <button className="action-btn print-btn" onClick={() => handlePrint(simplified)}>
              🖨 Print
            </button>
          )}
        </div>

        {speaking && (
          <p className="reading-hint">
            {paused ? 'Paused — Space to resume' : 'Reading… Space to pause'}
          </p>
        )}
      </div>
    </div>
  )
}

function handlePrint(text) {
  const html = text.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('')
  const win = window.open('', '_blank', 'width=800,height=600')
  win.document.write(`<!DOCTYPE html><html><head><title>Plain English</title>
<style>body{font-family:Arial,sans-serif;font-size:14pt;line-height:1.5;margin:40px;color:#000}
p{margin:0 0 12px}@media print{body{margin:20mm}}</style>
</head><body>${html}</body></html>`)
  win.document.close(); win.focus(); win.print()
}
