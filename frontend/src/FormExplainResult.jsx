import { useRef } from "react";
import ListenControls from "./ListenControls";

export default function FormExplainResult({
  formExplainResult, renderClickableText,
  setExplainPageIdx, resultScrollRef,
  listenProps,
  showTranslatePanel, setShowTranslatePanel,
  translateLangs, targetLang, setTargetLang,
  handleTranslate, loading,
  handleValidate, validating, validationResult,
}) {
  return (
    <div className="result-outer-box">
      <div className="bubble-label" style={{ background: 'linear-gradient(135deg, #8c52ff 0%, #6366F1 100%)' }}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.6 3.2L12 5l-2.6 2.5.6 3.7L7 9.5l-3 1.7.6-3.7L2 5l3.4-.8L7 1z" fill="#fff" opacity=".9"/></svg>
        Form explained
      </div>

      {formExplainResult.title && (
        <div style={{ padding: '16px 18px 0', fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>
          {formExplainResult.title}
        </div>
      )}

      <ListenControls label="Listen to this explanation" {...listenProps} />

      {/* Gather first */}
      {formExplainResult.gather_first?.length > 0 && (
        <div className="result-section" style={{ padding: '16px 18px' }}>
          <h2 className="r-h" style={{ color: '#8c52ff' }}>Before you start — gather these</h2>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {formExplainResult.gather_first.map((item, i) => (
              <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-mid)' }}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Fields */}
      <div className="plain-english-box" style={{ padding: '16px 18px' }}>
        <h2 className="r-h">Every field explained</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {formExplainResult.fields?.map((field, i) => (
            field.type === 'page_break' ? (
              <PageBreak key={i} field={field} setExplainPageIdx={setExplainPageIdx} resultScrollRef={resultScrollRef} />
            ) : (
            <div key={i} style={{
              padding: '12px 14px',
              background: field.type === 'office_only' ? '#f9fafb' : '#fff',
              border: '1px solid var(--border)',
              borderRadius: 10,
              opacity: field.type === 'office_only' ? 0.7 : 1,
            }}>
              {field.section_heading && (
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8c52ff', marginBottom: 4 }}>{field.section_heading}</div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 14, opacity: 0.6 }}>
                  <FieldIcon type={field.type} />
                </span>
                <strong style={{ fontSize: 14, color: 'var(--text)' }}>{field.label}</strong>
              </div>
              {field.original_text && field.original_text !== field.label && (
                <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.5, borderLeft: '2px solid #E5E7EB', paddingLeft: 8 }}>"{field.original_text}"</p>
              )}
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.6 }}>{renderClickableText(field.explanation)}</p>
              {field.tip && (
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#8c52ff', lineHeight: 1.5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8c52ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:4}}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5C8.26 12.26 8.72 13.02 8.91 14"/></svg> {renderClickableText(field.tip)}
                </p>
              )}
            </div>
            )
          ))}
        </div>
      </div>

      {/* Important details / flags */}
      {formExplainResult.flags && Object.values(formExplainResult.flags).some(v => v?.length > 0) && (
        <div className="result-section" style={{ padding: '16px 18px' }}>
          <h2 className="r-h">Important details</h2>
          <div className="flags-row">
            {formExplainResult.flags.deadlines?.map((d,i) => <span key={i} className="flag-chip">📅 {d}</span>)}
            {formExplainResult.flags.amounts?.map((a,i) => <span key={i} className="flag-chip">💰 {a}</span>)}
            {formExplainResult.flags.documents_needed?.map((d,i) => <span key={i} className="flag-chip">{d}</span>)}
          </div>
        </div>
      )}

      {/* Print + Validate */}
      <div className="bottom-actions no-print">
        <button className="action-btn" onClick={() => window.print()}>
          <span className="action-btn-icon">🖨️</span> Print side by side — form + explanation
        </button>
        <button className="action-btn" onClick={handleValidate} disabled={validating} style={{ marginTop: 8 }}>
          <span className="action-btn-icon">✅</span> {validating ? "Checking…" : "Check quality"}
        </button>
      </div>

      {validationResult && <ValidationDisplay result={validationResult} />}

      {/* Other tools */}
      <div className="other-tools no-print" style={{ marginTop: 16, padding: '16px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Other tools</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="tool-btn-small" onClick={() => setShowTranslatePanel(p => !p)} disabled={loading}>
            <span>🌍</span> Translate
          </button>
        </div>
        {showTranslatePanel && (
          <TranslatePicker
            translateLangs={translateLangs} targetLang={targetLang} setTargetLang={setTargetLang}
            handleTranslate={handleTranslate} loading={loading}
          />
        )}
      </div>
    </div>
  );
}

function PageBreak({ field, setExplainPageIdx, resultScrollRef }) {
  const ref = useRef(null);
  return (
    <div ref={el => {
        ref.current = el;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) setExplainPageIdx(field._page);
        }, { root: resultScrollRef?.current, threshold: 0.5 });
        obs.observe(el);
      }}
      className="form-explain-page-break" data-page={field._page}
      onClick={() => setExplainPageIdx(field._page)}
      style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '10px 14px', margin: '8px -18px 0',
        background: 'linear-gradient(135deg, #7c3aed, #6366F1)',
        color: 'white', fontWeight: 700, fontSize: 14,
        borderRadius: 8, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      {field.label}
      <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8, marginLeft: 'auto' }}>Click to jump to this page</span>
    </div>
  );
}

function FieldIcon({ type }) {
  if (type === 'checkbox') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>;
  if (type === 'section') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
  if (type === 'instruction') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
  if (type === 'office_only') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="9" y1="18" x2="15" y2="18"/></svg>;
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}

function ValidationDisplay({ result }) {
  const pass = result.pass;
  return (
    <div className="result-section no-print" style={{
      padding: '16px 18px', margin: '0 0 8px',
      background: pass ? '#F0FDF4' : '#FEF2F2',
      border: `1.5px solid ${pass ? '#BBF7D0' : '#FECACA'}`,
      borderRadius: 10,
    }}>
      <h2 className="r-h" style={{ color: pass ? '#166534' : '#991B1B' }}>
        {pass ? 'Quality check passed' : 'Quality check — issues found'}
      </h2>
      {result.missing_information?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <strong style={{ fontSize: 13, color: '#991B1B' }}>Missing information:</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
            {result.missing_information.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
      {result.added_information?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <strong style={{ fontSize: 13, color: '#991B1B' }}>Added information (should be removed):</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
            {result.added_information.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
      {result.order_problems?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <strong style={{ fontSize: 13, color: '#92400E' }}>Order or structure issues:</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
            {result.order_problems.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
      {result.language_problems?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <strong style={{ fontSize: 13, color: '#92400E' }}>Language or accessibility issues:</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
            {result.language_problems.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function TranslatePicker({ translateLangs, targetLang, setTargetLang, handleTranslate, loading }) {
  return (
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
  );
}
