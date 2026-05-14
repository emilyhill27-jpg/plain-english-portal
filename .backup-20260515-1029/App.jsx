import React from 'react';
import { usePortalStore } from './StateStore';

export default function App() {
  const store = usePortalStore();

  const handleConvertAction = async () => {
    if (!store.focusedRawText) return;
    store.startProcessing();
    try {
      const response = await fetch('http://localhost:8000/api/v1/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: store.focusedRawText, tier: store.readingTier })
      });
      const data = await response.json();
      store.setConvertedText(data.result);
    } catch (err) {
      store.setConvertedText("Failed to convert section. Please try again.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#FFFFFF', borderBottom: '2px solid #E0E0E0' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#111' }}>PLAIN ENGLISH PORTAL</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label style={{ fontWeight: '600', color: '#333' }}>Reading Level:</label>
          <select value={store.readingTier} onChange={(e) => store.setReadingTier(e.target.value)} style={{ padding: '6px 12px', fontSize: '1rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid #999' }}>
            <option value="ADULT">Adult / Original Text</option>
            <option value="HIGHSCHOOL">High School Level</option>
            <option value="INTERMEDIATE">Intermediate School Level</option>
            <option value="PRIMARY">Primary School Level</option>
          </select>
          <button onClick={handleConvertAction} disabled={!store.focusedRawText || store.isProcessing} style={{ padding: '8px 16px', fontSize: '1rem', fontWeight: 'bold', borderRadius: '4px', backgroundColor: store.focusedRawText ? '#0066CC' : '#CCCCCC', color: '#FFF', border: 'none', cursor: store.focusedRawText ? 'pointer' : 'not-allowed' }}>
            {store.isProcessing ? "Processing..." : "Simplify Selection"}
          </button>
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, borderRight: '2px solid #E0E0E0', overflowY: 'auto', padding: '20px', background: '#F9F9F9' }}>
          <h3>Original Document</h3>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Click any document zone below to isolate and convert its text.</p>
          <div onClick={() => store.setActiveBox("block_1", "Pursuant to section 4G of the regulatory framework, the onboarding candidate must fully disclose any preceding fiscal liabilities prior to contract finalization.")} style={{ padding: '16px', margin: '12px 0', border: store.activeBoxId === "block_1" ? '2px solid #0066CC' : '1px solid #CCC', background: store.activeBoxId === "block_1" ? '#E6F2FF' : '#FFF', cursor: 'pointer', borderRadius: '6px' }}>
            <strong>[Section 1: Disclosures]</strong> Pursuant to section 4G of the regulatory framework...
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', backgroundColor: '#F5F5DC', lineHeight: '1.8', letterSpacing: '0.05em' }}>
          {!store.focusedRawText ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#777', textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', maxWidth: '400px' }}>Your reading workspace is clean. <br /><strong>Select a block on the left</strong> to begin reading without distraction.</p>
            </div>
          ) : (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ background: 'rgba(255,255,255,0.6)', padding: '20px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #0066CC' }}>
                <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#666', fontWeight: 'bold' }}>Selected Original Text:</span>
                <p style={{ margin: '8px 0 0 0', fontSize: '1.1rem', color: '#222' }}>{store.focusedRawText}</p>
              </div>
              {store.convertedText && (
                <div style={{ marginTop: '32px' }}>
                  <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#0066CC', fontWeight: 'bold' }}>
                    {store.readingTier === 'PRIMARY' && "Primary School View:"}
                    {store.readingTier === 'INTERMEDIATE' && "Intermediate School View:"}
                    {store.readingTier === 'HIGHSCHOOL' && "High School View:"}
                    {store.readingTier === 'ADULT' && "Original Meaning View:"}
                  </span>
                  <p style={{ marginTop: '12px', fontSize: '1.3rem', color: '#000', fontWeight: '500' }}>{store.convertedText}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
