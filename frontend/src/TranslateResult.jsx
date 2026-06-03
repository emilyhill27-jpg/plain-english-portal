import ListenControls from "./ListenControls";

export default function TranslateResult({
  translateResult, isPdf, currentPage, previewUrl, pageIdx,
  listenProps,
}) {
  return (
    <div className="result-outer-box">
      <div className="bubble-label" style={{ background: 'linear-gradient(135deg, #8c52ff 0%, #6366F1 100%)' }}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.6 3.2L12 5l-2.6 2.5.6 3.7L7 9.5l-3 1.7.6-3.7L2 5l3.4-.8L7 1z" fill="#fff" opacity=".9"/></svg>
        Translated to {translateResult.target_language}
      </div>

      {translateResult.title && (
        <div style={{ padding: '16px 18px 0', fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: 20, color: 'var(--text)' }}>
          {translateResult.title}
        </div>
      )}

      <ListenControls label="Listen to translation" {...listenProps} />

      {/* Side-by-side print layout: original + translation */}
      <div className="translate-print-layout" style={{ display: 'none' }}>
        <div className="translate-print-original">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B7280', marginBottom: 8 }}>Original worksheet</div>
          {isPdf && currentPage ? (
            <img src={`data:image/png;base64,${currentPage.image_base64}`} alt="Original worksheet" />
          ) : previewUrl ? (
            <img src={previewUrl} alt="Original worksheet" />
          ) : null}
        </div>
        <div className="translate-print-translated">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8c52ff', marginBottom: 8 }}>Translated — {translateResult.target_language}</div>
          {translateResult.title && (
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{translateResult.title}</div>
          )}
          {translateResult.sections?.map((sec, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              {sec.number && <span style={{ fontWeight: 700, marginRight: 4 }}>{sec.number}.</span>}
              {sec.type === "heading" ? (
                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 8 }}>{sec.translated}</div>
              ) : sec.type === "image_note" ? (
                <div style={{ fontSize: 11, color: '#6B7280', fontStyle: 'italic' }}>{sec.translated}</div>
              ) : (
                <span style={{ fontSize: 13, lineHeight: 1.6 }}>{sec.translated}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* On-screen: translation only */}
      <div className="plain-english-box no-print" style={{ marginTop: 8 }}>
        {translateResult.sections?.map((sec, i) => (
          <div key={i} className="translate-section" style={{ marginBottom: 14 }}>
            {sec.number && <span style={{ fontWeight: 700, color: 'var(--purple)', marginRight: 6 }}>{sec.number}.</span>}
            {sec.type === "heading" ? (
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '12px 0 4px' }}>{sec.translated}</h3>
            ) : sec.type === "image_note" ? (
              <div style={{ padding: '8px 12px', background: '#F3F4F6', borderRadius: 8, fontSize: 13, color: '#6B7280', fontStyle: 'italic' }}>
                {sec.translated}
              </div>
            ) : (
              <p style={{ margin: 0, lineHeight: 1.7 }}>{sec.translated}</p>
            )}
            {sec.original && sec.type !== "image_note" && (
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>{sec.original}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bottom-actions no-print">
        <button className="action-btn" onClick={() => window.print()}>
          <span className="action-btn-icon">🖨️</span> Print side-by-side (original + translation)
        </button>
      </div>
    </div>
  );
}
