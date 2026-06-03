import { useState } from "react";
import ListenControls from "./ListenControls";

export default function SimplifyResult({
  result, renderClickableWords, simpSection, checkSection,
  listenProps,
  handleFormExplain, loading,
  showTranslatePanel, setShowTranslatePanel,
  translateLangs, targetLang, setTargetLang,
  handleTranslate,
}) {
  const [showPrompts, setShowPrompts] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  return (
    <div className="result-outer-box">
      {/* Plain-English version label */}
      <div className="bubble-label">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.6 3.2L12 5l-2.6 2.5.6 3.7L7 9.5l-3 1.7.6-3.7L2 5l3.4-.8L7 1z" fill="#fff" opacity=".9"/></svg>
        Plain-English version
      </div>

      <ListenControls label="Listen to this version" {...listenProps} />

      {/* Inner box — plain-English text */}
      <div className="plain-english-box">
        <div className="result-section">
          <h2 className="r-h">What this is about</h2>
          <div className="r-p">
            {renderClickableWords(result.simplified_text, simpSection?.offset ?? 0)}
          </div>
        </div>
      </div>

      {/* Prompts & examples button */}
      <button className={`prompts-btn${showPrompts ? ' on' : ''}`}
        onClick={() => setShowPrompts(!showPrompts)}>
        <span className="action-btn-icon">💬</span>
        Prompts & examples
        <span style={{ marginLeft:'auto', fontSize:18, color:'var(--muted)' }}>{showPrompts ? '−' : '+'}</span>
      </button>
      {showPrompts && (
        <div className="prompts-content">
          {result?.simplified_text ? (
            <>
              {result.simplified_text.split('\n').filter(line => {
                const t = line.trim().replace(/^[•\-]\s*/, '');
                return /example|for example|could write|could say|might look|might say|strong answer|weak answer/i.test(t);
              }).length > 0 ? (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Examples from the explanation</div>
                  <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {result.simplified_text.split('\n').filter(line => {
                      const t = line.trim().replace(/^[•\-]\s*/, '');
                      return /example|for example|could write|could say|might look|might say|strong answer|weak answer/i.test(t);
                    }).map((line, i) => (
                      <li key={i} style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.6 }}>{line.trim().replace(/^[•\-]\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ color:'var(--muted)', fontStyle:'italic' }}>
                  No specific prompts or examples for this section. The plain English version above has all the guidance.
                </p>
              )}
            </>
          ) : (
            <p style={{ color:'var(--muted)', fontStyle:'italic' }}>
              No prompts available for this selection.
            </p>
          )}
        </div>
      )}

      {/* Important details */}
      {result?.flags && Object.values(result.flags).some(v => v?.length > 0) && (
        <div className="result-section">
          <h2 className="r-h">Important details</h2>
          <div className="flags-row">
            {result.flags.deadlines?.map((d,i) => <span key={i} className="flag-chip">📅 {d}</span>)}
            {result.flags.amounts?.map((a,i) => <span key={i} className="flag-chip">💰 {a}</span>)}
            {result.flags.documents_needed?.map((d,i) => <span key={i} className="flag-chip">{d}</span>)}
          </div>
        </div>
      )}

      {/* Checklist */}
      {result?.checklist?.length > 0 && (
        <div className="result-section">
          <h2 className="r-h">What you need to do</h2>
          <div className="checklist-box">
            <ul className="chk-list">
              {result.checklist.map((item, i) => (
                <li key={i}>
                  <button className={`chk${checkedItems[i] ? ' ticked' : ''}`}
                    onClick={() => setCheckedItems(prev => ({...prev, [i]: !prev[i]}))}
                    type="button" role="checkbox" aria-checked={!!checkedItems[i]}>
                    {checkedItems[i] ? '✓' : ''}
                  </button>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Print */}
      <div className="bottom-actions no-print">
        <button className="action-btn" onClick={() => window.print()}>
          <span className="action-btn-icon">🖨️</span> Print side by side — form + explanation
        </button>
      </div>

      {/* Other tools */}
      <div className="other-tools no-print" style={{ marginTop: 16, padding: '16px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Other tools</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="tool-btn-small" onClick={handleFormExplain} disabled={loading}>
            <span>📋</span> Explain this form
          </button>
          <button className="tool-btn-small" onClick={() => setShowTranslatePanel(p => !p)} disabled={loading}>
            <span>🌍</span> Translate
          </button>
        </div>
        {showTranslatePanel && (
          <div className="translate-picker no-print" style={{ marginTop: 8 }}>
            <select className="translate-lang-select" value={targetLang} disabled={loading}
              onChange={e => { const l = e.target.value; setTargetLang(l); handleTranslate(l); }}>
              {translateLangs.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            <button className="btn btn-primary" style={{ height: 36, fontSize: 13, padding: '0 16px' }}
              onClick={handleTranslate} disabled={loading || !targetLang}>
              {loading ? "Translating…" : "Go"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
