import { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const PROFILE_OPTIONS = [
  { value: "WINZ Forms / General Support", label: "WINZ Forms / General Support" },
  { value: "Tenancy & Real Estate Contracts", label: "Tenancy & Real Estate Contracts" },
  { value: "NZ Curriculum Level 1-2 (Years 1-4)", label: "NZ Curriculum Level 1-2 (Years 1-4)" },
  { value: "NZ Curriculum Level 3-4 (Years 5-8)", label: "NZ Curriculum Level 3-4 (Years 5-8)" },
  { value: "NZ Curriculum Level 5-8 (Years 9-13)", label: "NZ Curriculum Level 5-8 (Years 9-13)" },
];

function App() {
  const [file, setFile]                   = useState(null);
  const [previewUrl, setPreviewUrl]       = useState("");
  const [isPdf, setIsPdf]                 = useState(false);
  const [profile, setProfile]             = useState(PROFILE_OPTIONS[0].value);
  const [pageNumber, setPageNumber]       = useState(1);
  const [simplification, setSimplification] = useState(null);
  const [checklist, setChecklist]         = useState(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [dragActive, setDragActive]       = useState(false);
  const [audioSpeed, setAudioSpeed]       = useState(1);
  const [isPlaying, setIsPlaying]         = useState(false);
  const [currentWord, setCurrentWord]     = useState(0);
  const utteranceRef = useRef(null);

  useEffect(() => {
    return () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); };
  }, []);

  const resetState = () => {
    setSimplification(null); setChecklist(null); setError(""); setCurrentWord(0);
  };

  const handleFileSelection = (candidate) => {
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setError("Only PDF, JPG or PNG files are accepted."); return;
    }
    // revoke old URL
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(candidate);
    resetState();
    const url = URL.createObjectURL(candidate);
    setPreviewUrl(url);
    setIsPdf(candidate.type === "application/pdf");
  };

  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); handleFileSelection(e.dataTransfer.files?.[0]); };
  const handleBrowse = (e) => handleFileSelection(e.target.files?.[0]);

  const fetchApi = async (path, formData) => {
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", body: formData });
    if (!res.ok) { const t = await res.text(); throw new Error(t || `Error ${res.status}`); }
    return res.json();
  };

  const handleSimplify = async () => {
    if (!file) { setError("Please upload a file first."); return; }
    setLoading(true); setError(""); setSimplification(null); setChecklist(null); setCurrentWord(0);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("audience_profile", profile);
      fd.append("page_num", String(pageNumber));
      const data = await fetchApi("/api/simplify", fd);
      setSimplification(data); setCurrentWord(0);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleChecklist = async () => {
    if (!file) { setError("Upload a file first."); return; }
    setChecklistOpen(true);
    if (checklist) return;
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("audience_profile", profile);
      const data = await fetchApi("/api/checklist", fd);
      setChecklist(data.checklist_markdown || "No checklist available.");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const speak = () => {
    if (!simplification?.simplified_text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(simplification.simplified_text);
    u.rate = audioSpeed;
    u.onboundary = (e) => {
      const before = simplification.simplified_text.slice(0, e.charIndex || 0);
      setCurrentWord(Math.max(0, before.trim().split(/\s+/).filter(Boolean).length - 1));
    };
    u.onend = () => { setIsPlaying(false); setCurrentWord(-1); };
    utteranceRef.current = u;
    setIsPlaying(true);
    window.speechSynthesis.speak(u);
  };
  const stopSpeech = () => { window.speechSynthesis?.cancel(); setIsPlaying(false); setCurrentWord(-1); };
  const pauseResumeSpeech = () => {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setIsPlaying(true); }
    else { window.speechSynthesis.pause(); setIsPlaying(false); }
  };

  const renderedSimplified = useMemo(() => {
    if (!simplification?.simplified_text) return null;
    let idx = -1;
    return simplification.simplified_text.split(/(\s+)/).map((token, i) => {
      if (/^\s+$/.test(token)) return token;
      idx++;
      return (
        <span key={i} style={{ background: idx === currentWord ? "#ffe599" : "transparent", borderRadius: idx === currentWord ? 3 : 0 }}>
          {token}
        </span>
      );
    });
  }, [simplification, currentWord]);

  return (
    <div className="app-shell">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; font-family: system-ui, sans-serif; }
        .app-shell { display: flex; flex-direction: column; height: 100vh; background: #f7f8fb; color: #1f2937; }

        /* ── Header ── */
        .app-header {
          display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
          padding: 10px 16px; background: #111827; color: white; flex-shrink: 0;
        }
        .logo { font-size: 14px; font-weight: 700; background: #2563eb; padding: 3px 8px; border-radius: 4px; }
        .logo-name { font-size: 16px; font-weight: 600; flex: 1; }
        .header-btn {
          padding: 7px 14px; border: none; border-radius: 6px; cursor: pointer;
          font-size: 13px; font-weight: 600;
        }
        .btn-primary { background: #2563eb; color: white; }
        .btn-primary:hover:not(:disabled) { background: #1d4ed8; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary { background: #374151; color: white; }
        .btn-secondary:hover { background: #4b5563; }
        .header-error { font-size: 13px; color: #fca5a5; flex: 1; }

        /* ── Toolbar (below header) ── */
        .toolbar {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          padding: 8px 16px; background: #1f2937; border-bottom: 1px solid #374151;
          flex-shrink: 0;
        }
        .toolbar label { font-size: 12px; color: #9ca3af; display: flex; align-items: center; gap: 6px; }
        .toolbar select, .toolbar input[type="number"] {
          background: #374151; color: white; border: 1px solid #4b5563;
          border-radius: 6px; padding: 5px 8px; font-size: 13px; font-family: inherit;
        }
        .toolbar input[type="number"] { width: 64px; }

        /* ── Split layout ── */
        .split { display: flex; flex: 1; overflow: hidden; }
        .split-left {
          width: 55%; border-right: 2px solid #374151; overflow: hidden;
          display: flex; flex-direction: column; background: #111;
        }
        .split-right {
          width: 45%; overflow-y: auto; background: #F5F5DC;
          font-family: Arial, sans-serif; padding: 20px;
        }

        /* ── Drop zone (shown when no file) ── */
        .drop-zone {
          flex: 1; display: flex; align-items: center; justify-content: center;
          border: 2px dashed #4b5563; margin: 20px; border-radius: 12px;
          background: #1f2937; text-align: center; padding: 24px; cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .drop-zone.active { border-color: #2563eb; background: #1e3a8a20; }
        .drop-zone p { color: #9ca3af; font-size: 14px; margin-top: 8px; }
        .drop-zone strong { color: white; font-size: 15px; }
        .drop-zone input { display: none; }
        .browse-btn {
          margin-top: 12px; padding: 8px 18px; background: #2563eb; color: white;
          border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;
        }
        .browse-btn:hover { background: #1d4ed8; }

        /* ── Document viewer ── */
        .doc-viewer { flex: 1; overflow: auto; }
        .doc-viewer embed { width: 100%; height: 100%; display: block; }
        .doc-viewer img { width: 100%; display: block; }

        /* ── Right panel ── */
        .output-section { display: flex; flex-direction: column; gap: 16px; }
        .section-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #555; margin-bottom: 4px;
        }
        .audio-bar {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          padding: 10px 12px; background: #e8e4d4; border-radius: 8px;
          border: 1px solid #d0c9b0;
        }
        .audio-bar label { font-size: 12px; color: #555; display: flex; align-items: center; gap: 6px; }
        .audio-bar input[type="range"] { width: 100px; }
        .audio-btn {
          padding: 6px 14px; border: none; border-radius: 6px;
          font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .audio-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-play   { background: #2563eb; color: white; }
        .btn-pause  { background: #6b7280; color: white; }
        .btn-stop   { background: #dc2626; color: white; }
        .simplified-box {
          background: white; border: 1px solid #d0c9b0; border-radius: 8px;
          padding: 14px 16px; line-height: 1.8; font-size: 15px; white-space: pre-wrap; color: #222;
          min-height: 120px;
        }
        .placeholder { color: #aaa; font-style: italic; font-size: 14px; }
        .error-box { padding: 10px 14px; border-radius: 8px; background: #fee2e2; color: #991b1b; font-size: 13px; }
        .result-card { background: white; border: 1px solid #d0c9b0; border-radius: 8px; padding: 14px 16px; }
        .result-card h3 { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #555; margin-bottom: 8px; letter-spacing: 0.06em; }
        .result-card pre { white-space: pre-wrap; font-size: 14px; line-height: 1.7; font-family: Arial, sans-serif; color: #333; }

        /* ── Checklist drawer ── */
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: grid; place-items: center; padding: 20px; }
        .drawer-panel { width: min(600px, 100%); background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.2); }
        .drawer-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
        .drawer-head h2 { font-size: 18px; }
        .drawer-close { padding: 6px 14px; background: #111827; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .drawer-body { padding: 20px; max-height: 400px; overflow-y: auto; }
        .drawer-body ul { padding-left: 20px; }
        .drawer-body li { margin-bottom: 10px; line-height: 1.7; }

        @media print {
          .no-print { display: none !important; }
          .split { display: block; }
          .split-right { width: 100%; background: white; }
          .print-warning { display: block !important; border: 2px dashed red; padding: 10px; color: red; font-weight: 700; margin-top: 20px; }
        }
        .print-warning { display: none; }
      `}</style>

      {/* ── Header ── */}
      <header className="app-header no-print">
        <span className="logo">PE</span>
        <span className="logo-name">Plain English</span>
        {error && <span className="header-error">{error}</span>}
        <button className="header-btn btn-secondary" onClick={handleChecklist}>☑ Checklist</button>
        <button className="header-btn btn-secondary" onClick={() => window.print()}>🖨 Print</button>
      </header>

      {/* ── Toolbar ── */}
      <div className="toolbar no-print">
        <label>
          Profile:
          <select value={profile} onChange={e => setProfile(e.target.value)}>
            {PROFILE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label>
          Page:
          <input type="number" min="1" value={pageNumber} onChange={e => setPageNumber(Math.max(1, Number(e.target.value) || 1))} />
        </label>
        <button className="header-btn btn-primary" onClick={handleSimplify} disabled={loading || !file}>
          {loading ? "Simplifying…" : "✦ Simplify"}
        </button>
      </div>

      {/* ── Split ── */}
      <div className="split">

        {/* LEFT — original document */}
        <section className="split-left">
          {!file ? (
            <div
              className={`drop-zone ${dragActive ? "active" : ""}`}
              onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
              onDrop={handleDrop}
            >
              <div>
                <strong>Drop your document here</strong>
                <p>PDF, JPG or PNG accepted</p>
                <input id="file-input" type="file" accept="application/pdf,image/png,image/jpeg" onChange={handleBrowse} />
                <label htmlFor="file-input" className="browse-btn">Browse files</label>
              </div>
            </div>
          ) : (
            <div className="doc-viewer">
              {isPdf
                ? <embed src={previewUrl} type="application/pdf" width="100%" height="100%" />
                : <img src={previewUrl} alt="Uploaded document" />
              }
            </div>
          )}
        </section>

        {/* RIGHT — simplified output */}
        <section className="split-right">
          <div className="output-section">

            {/* Audio controls */}
            {simplification && (
              <div className="audio-bar no-print">
                <label>Speed: <input type="range" min="0.5" max="1.5" step="0.1" value={audioSpeed} onChange={e => setAudioSpeed(Number(e.target.value))} /> {audioSpeed.toFixed(1)}x</label>
                <button className="audio-btn btn-play" onClick={speak} disabled={!simplification?.simplified_text}>🔊 Play</button>
                <button className="audio-btn btn-pause" onClick={pauseResumeSpeech} disabled={!isPlaying}>⏸ Pause</button>
                <button className="audio-btn btn-stop" onClick={stopSpeech} disabled={!isPlaying}>⏹ Stop</button>
              </div>
            )}

            {/* Simplified text */}
            <div>
              <p className="section-label">Plain English</p>
              <div className="simplified-box">
                {simplification
                  ? (renderedSimplified || simplification.simplified_text)
                  : <span className="placeholder">{file ? "Press ✦ Simplify to get the plain-English version." : "Upload a document to get started."}</span>
                }
              </div>
            </div>

            {/* Guiding questions */}
            {simplification?.guiding_questions?.length > 0 && (
              <div className="result-card">
                <h3>Guiding Questions</h3>
                <pre>{simplification.guiding_questions.join("\n")}</pre>
              </div>
            )}

            {/* Checklist */}
            {simplification?.checklist?.length > 0 && (
              <div className="result-card">
                <h3>What You Need To Do</h3>
                <pre>{simplification.checklist.join("\n")}</pre>
              </div>
            )}

            {/* Flags */}
            {simplification?.flags && (
              Object.entries(simplification.flags).some(([, v]) => v?.length > 0) && (
                <div className="result-card">
                  <h3>Important Details</h3>
                  {simplification.flags.deadlines?.length > 0 && <pre>📅 Deadlines: {simplification.flags.deadlines.join(", ")}</pre>}
                  {simplification.flags.amounts?.length > 0 && <pre>💰 Amounts: {simplification.flags.amounts.join(", ")}</pre>}
                  {simplification.flags.documents_needed?.length > 0 && <pre>📄 Documents needed: {simplification.flags.documents_needed.join(", ")}</pre>}
                </div>
              )
            )}

          </div>
        </section>
      </div>

      <div className="print-warning">⚠️ PERSONAL HELPER NOTES ONLY — DO NOT SUBMIT THIS TO WINZ, SCHOOL, OR ANY AGENCY.</div>

      {/* Checklist drawer */}
      {checklistOpen && (
        <div className="drawer-overlay" onClick={() => setChecklistOpen(false)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <h2>Checklist</h2>
              <button className="drawer-close" onClick={() => setChecklistOpen(false)}>Close</button>
            </div>
            <div className="drawer-body">
              {loading && <p>Loading…</p>}
              {!loading && checklist && (
                <ul>{checklist.split("\n").filter(l => l.trim().startsWith("- ")).map((l, i) => <li key={i}>{l.replace(/^-\s*/, "")}</li>)}</ul>
              )}
              {!loading && !checklist && <p>No checklist yet — click Simplify first.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
