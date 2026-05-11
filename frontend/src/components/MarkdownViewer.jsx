import { useState } from 'react'

function parseBlocks(markdown) {
  const blocks = []
  const rawBlocks = markdown.split(/\n{2,}/)

  for (const raw of rawBlocks) {
    const trimmed = raw.trim()
    if (!trimmed) continue

    if (trimmed === '---') {
      blocks.push({ type: 'divider', text: '' })
    } else if (/^#{1,6}\s/.test(trimmed)) {
      const level = trimmed.match(/^(#{1,6})\s/)[1].length
      const text = trimmed.replace(/^#{1,6}\s/, '')
      blocks.push({ type: 'heading', level, text })
    } else if (/^[-*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      // List — keep as one clickable block
      const text = trimmed
        .split('\n')
        .map(l => l.replace(/^[-*]\s|^\d+\.\s/, '').trim())
        .join('\n')
      blocks.push({ type: 'list', text, raw: trimmed })
    } else {
      // Plain paragraph — collapse internal newlines
      const text = trimmed.replace(/\n/g, ' ')
      blocks.push({ type: 'paragraph', text })
    }
  }
  return blocks
}

export default function MarkdownViewer({ markdown, onBlockSelect }) {
  const [activeIdx, setActiveIdx] = useState(null)

  if (!markdown) {
    return (
      <div className="pdf-empty">
        <p>Open a PDF using the button above to get started.</p>
      </div>
    )
  }

  const blocks = parseBlocks(markdown)

  function handleClick(block, idx) {
    if (block.type === 'divider') return
    setActiveIdx(idx)
    onBlockSelect(block.text)
  }

  return (
    <div className="md-viewer">
      {blocks.map((block, idx) => {
        if (block.type === 'divider') {
          return <hr key={idx} className="md-page-break" />
        }

        const isActive = activeIdx === idx
        const Tag = block.type === 'heading' ? `h${block.level}` : 'div'

        return (
          <Tag
            key={idx}
            className={`md-block md-${block.type} ${isActive ? 'md-block-active' : ''}`}
            onClick={() => handleClick(block, idx)}
            title="Click to send to Source Text"
          >
            {block.type === 'list'
              ? block.raw.split('\n').map((line, i) => (
                  <div key={i} className="md-list-item">
                    {line.replace(/^[-*]\s|^\d+\.\s/, '')}
                  </div>
                ))
              : block.text}
          </Tag>
        )
      })}
    </div>
  )
}
