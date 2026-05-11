import { useState, useEffect, useCallback, useRef } from 'react'

// Find all blocks that overlap the drawn rectangle by ≥25% of their area
function getTextInRegion(pageBlocks, x0, y0, x1, y1) {
  const hits = pageBlocks.filter(b => {
    const ox = Math.min(b.x1, x1) - Math.max(b.x0, x0)
    const oy = Math.min(b.y1, y1) - Math.max(b.y0, y0)
    if (ox <= 0 || oy <= 0) return false
    const blockArea = (b.x1 - b.x0) * (b.y1 - b.y0)
    return blockArea > 0 && (ox * oy) / blockArea >= 0.25
  })

  // Reading order: top-to-bottom, then left-to-right within same row
  hits.sort((a, b) =>
    Math.abs(a.y0 - b.y0) < 0.015 ? a.x0 - b.x0 : a.y0 - b.y0
  )

  return hits.map(b => b.text).join('\n\n')
}

// Single-click: find the block whose bounding box contains the point
function getBlockAtPoint(pageBlocks, x, y) {
  const hit = pageBlocks.find(
    b => x >= b.x0 - 0.005 && x <= b.x1 + 0.005 &&
         y >= b.y0 - 0.005 && y <= b.y1 + 0.005
  )
  return hit ? hit.text : ''
}

export default function PdfViewer({ sessionId, blocks, onTextSelect }) {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(false)
  const [zoom, setZoom] = useState(1.0)
  const [drag, setDrag] = useState(null)       // live rubberband while dragging
  const [committed, setCommitted] = useState(null) // last completed selection
  const [containerWidth, setContainerWidth] = useState(700)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)
    fetch(`/api/render/${sessionId}`)
      .then(r => r.json())
      .then(data => setPages(data.pages || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sessionId])

  const scrollRefCb = useCallback(node => {
    if (node) {
      scrollRef.current = node
      setContainerWidth(node.getBoundingClientRect().width - 40)
    }
  }, [])

  // Group blocks by page index
  const blocksByPage = {}
  for (const b of blocks) {
    if (!blocksByPage[b.page]) blocksByPage[b.page] = []
    blocksByPage[b.page].push(b)
  }

  function displaySize(page) {
    const w = Math.min(containerWidth, page.width) * zoom
    const h = (w / page.width) * page.height
    return { w, h }
  }

  function normCoords(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    }
  }

  function onMouseDown(e, pageIdx) {
    if (e.button !== 0) return
    e.preventDefault()
    const { x, y } = normCoords(e)
    setDrag({ pageIdx, x0: x, y0: y, x1: x, y1: y })
    setCommitted(null)
  }

  function onMouseMove(e, pageIdx) {
    if (!drag || drag.pageIdx !== pageIdx) return
    const { x, y } = normCoords(e)
    setDrag(d => ({ ...d, x1: x, y1: y }))
  }

  function onMouseUp(e, pageIdx) {
    if (!drag || drag.pageIdx !== pageIdx) return

    const rx0 = Math.min(drag.x0, drag.x1)
    const ry0 = Math.min(drag.y0, drag.y1)
    const rx1 = Math.max(drag.x0, drag.x1)
    const ry1 = Math.max(drag.y0, drag.y1)
    const pageBlocks = blocksByPage[pageIdx] || []

    const isClick = rx1 - rx0 < 0.01 && ry1 - ry0 < 0.01
    const text = isClick
      ? getBlockAtPoint(pageBlocks, drag.x0, drag.y0)
      : getTextInRegion(pageBlocks, rx0, ry0, rx1, ry1)

    setCommitted({ pageIdx, x0: rx0, y0: ry0, x1: rx1, y1: ry1 })
    setDrag(null)
    if (text) onTextSelect(text)
  }

  if (!sessionId) return (
    <div className="pdf-empty">
      <p>Open a PDF using the button above to get started.</p>
    </div>
  )

  if (loading) return <div className="pdf-empty">Rendering PDF…</div>

  return (
    <div className="pdf-outer">

      {/* ── Toolbar ── */}
      <div className="pdf-toolbar">
        <button className="zoom-btn" onClick={() => setZoom(z => Math.max(0.3, +(z - 0.25).toFixed(2)))}>−</button>
        <span className="zoom-label">{Math.round(zoom * 100)}%</span>
        <button className="zoom-btn" onClick={() => setZoom(z => Math.min(3.0, +(z + 0.25).toFixed(2)))}>+</button>
        <button className="zoom-btn zoom-reset" onClick={() => setZoom(1.0)}>Fit</button>
        <span className="toolbar-hint">Drag to select a region · Click to select a block</span>
      </div>

      {/* ── Pages ── */}
      <div className="pdf-scroll" ref={scrollRefCb}>
        {pages.map((page, pageIdx) => {
          const { w, h } = displaySize(page)
          const draggingHere   = drag      && drag.pageIdx      === pageIdx
          const committedHere  = committed && committed.pageIdx === pageIdx

          return (
            <div
              key={pageIdx}
              className="pdf-page-wrap"
              style={{ width: w, height: h }}
              onMouseDown={e => onMouseDown(e, pageIdx)}
              onMouseMove={e => onMouseMove(e, pageIdx)}
              onMouseUp={e => onMouseUp(e, pageIdx)}
              onMouseLeave={() => drag?.pageIdx === pageIdx && setDrag(null)}
            >
              <img
                src={page.image}
                style={{ width: '100%', height: '100%' }}
                alt={`Page ${pageIdx + 1}`}
                draggable={false}
              />

              {/* Live rubberband */}
              {draggingHere && (
                <div className="rubberband" style={{
                  left:   `${Math.min(drag.x0, drag.x1) * 100}%`,
                  top:    `${Math.min(drag.y0, drag.y1) * 100}%`,
                  width:  `${Math.abs(drag.x1 - drag.x0) * 100}%`,
                  height: `${Math.abs(drag.y1 - drag.y0) * 100}%`,
                }} />
              )}

              {/* Committed selection */}
              {committedHere && !draggingHere && (
                <div className="rubberband rubberband-done" style={{
                  left:   `${committed.x0 * 100}%`,
                  top:    `${committed.y0 * 100}%`,
                  width:  `${(committed.x1 - committed.x0) * 100}%`,
                  height: `${(committed.y1 - committed.y0) * 100}%`,
                }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
