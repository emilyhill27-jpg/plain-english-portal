import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";

function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

// ── Dyslexia/neurodivergent design tokens ────────────────────────
// Background: warm off-white (reduces glare), text: near-black (not pure black),
// accent: deep teal (WCAG AA compliant on white), font: Arial (BDA recommended)
const LD = {
  bg:       "#F8F7F2",
  bgWhite:  "#FFFFFF",
  bgHero:   "#EEF6F6",
  text:     "#2C2C2C",
  muted:    "#5A5754",
  border:   "#DDD9D0",
  accent:   "#1B6E6B",
  accentHover: "#145957",
  accentLight: "rgba(27,110,107,0.08)",
  font:     "Arial, Helvetica, sans-serif",
  lineH:    1.75,
};

function AnimatedDemo({ step }) {
  const labels = [
    "Upload your document",
    "Select the confusing part",
    "Simplifying…",
    "Your plain English explanation",
  ];
  const lines = [90, 100, 75, 100, 85, 100, 60, 95, 80];

  return (
    <div style={{ fontFamily: LD.font }}>
      <p style={{ fontSize: 15, color: LD.accent, fontWeight: 700, marginBottom: 14, minHeight: 22 }}>
        {labels[step]}
      </p>

      {/* Mock document */}
      <div style={{ background: LD.bgWhite, borderRadius: 10, padding: "18px 20px", position: "relative", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {lines.map((w, i) => (
            <div key={i} style={{
              height: 10, background: "#E4E1D9", borderRadius: 4, width: `${w}%`,
              opacity: step === 0 ? (i < 4 ? 1 : 0.25) : 1,
              transition: "opacity 0.6s ease",
            }} />
          ))}
        </div>

        {/* Selection box — visible in steps 1, 2, 3 */}
        <div style={{
          position: "absolute", top: 38, left: 16, right: 16, height: 72,
          border: `2.5px dashed ${LD.accent}`,
          borderRadius: 6,
          background: LD.accentLight,
          opacity: step >= 1 ? 1 : 0,
          transition: "opacity 0.5s ease",
          pointerEvents: "none",
        }} />
      </div>

      {/* Simplify button */}
      <div style={{ textAlign: "right", marginTop: 12 }}>
        <span style={{
          display: "inline-block",
          background: step === 2 ? LD.accentHover : LD.accent,
          color: "white",
          padding: "9px 20px",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 700,
          transform: step === 2 ? "scale(0.96)" : "scale(1)",
          transition: "all 0.2s ease",
        }}>
          {step === 2 ? "Simplifying…" : "Simplify ✦"}
        </span>
      </div>

      {/* Results — visible in step 3 */}
      <div style={{
        marginTop: 14,
        background: LD.bgWhite,
        borderRadius: 10,
        padding: 16,
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        opacity: step === 3 ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}>
        <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: LD.accent }}>Plain English explanation</p>
        {[
          "This form asks for all the money you receive.",
          "Include wages, benefits, and any other payments.",
          "You must list every source — even small amounts.",
        ].map((t, i) => (
          <p key={i} style={{ fontSize: 13, color: LD.text, marginBottom: 7, lineHeight: 1.6 }}>• {t}</p>
        ))}
      </div>
    </div>
  );
}

function LandingPage({ onGetStarted, onFileUpload }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const delays = [2500, 1500, 1800, 3000];
    let timer;
    const advance = (s) => {
      timer = setTimeout(() => {
        const next = (s + 1) % 4;
        setStep(next);
        advance(next);
      }, delays[s]);
    };
    advance(0);
    return () => clearTimeout(timer);
  }, []);

  const howSteps = [
    {
      num: 1,
      icon: "📄",
      title: "Upload your document",
      body: "PDF, photo or image. Any form, letter, or paperwork.",
    },
    {
      num: 2,
      icon: "✏️",
      title: "Select the confusing part",
      body: "Draw a box around any section you need help with.",
    },
    {
      num: 3,
      icon: "✅",
      title: "Read it in plain English",
      body: "Get a clear explanation, a checklist, and audio playback.",
    },
  ];

  const nav = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 40px", background: LD.bgWhite,
    borderBottom: `1px solid ${LD.border}`,
    fontFamily: LD.font,
  };

  const btn = {
    background: LD.accent, color: "white", border: "none",
    padding: "12px 26px", borderRadius: 9, fontSize: 17,
    fontWeight: 700, cursor: "pointer", lineHeight: 1,
  };

  const outlineBtn = {
    display: "inline-flex", alignItems: "center",
    padding: "12px 26px", borderRadius: 9,
    border: `2px solid ${LD.border}`, fontSize: 17,
    fontWeight: 600, color: LD.text, textDecoration: "none",
    background: "transparent", cursor: "pointer",
  };

  return (
    <div style={{ fontFamily: LD.font, background: LD.bg, color: LD.text, minHeight: "100vh", lineHeight: LD.lineH }}>

      {/* ── Nav ── */}
      <nav style={nav} aria-label="Main navigation">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: LD.accent, color: "white", padding: "4px 10px", borderRadius: 6, fontWeight: 700, fontSize: 15, letterSpacing: "0.02em" }}>PL</span>
          <span style={{ fontWeight: 800, fontSize: 21, letterSpacing: "-0.3px" }}>Plainly</span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main>
        <section style={{ background: LD.bgHero, borderBottom: `1px solid ${LD.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 64, padding: "72px 64px 64px", maxWidth: 1180, margin: "0 auto" }}>

            {/* Left — headline + CTA */}
            <div style={{ flex: "0 0 46%" }}>
              <p style={{ color: LD.accent, fontWeight: 700, fontSize: 16, marginBottom: 18 }}>
                Free for everyone in New Zealand
              </p>
              <h1 style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.15, marginBottom: 24, letterSpacing: "-0.5px" }}>
                Hard paperwork,<br />made simple.
              </h1>
              <p style={{ fontSize: 19, lineHeight: LD.lineH, color: LD.muted, marginBottom: 36, maxWidth: 400 }}>
                Upload any form or letter.<br />
                Select the part that confuses you.<br />
                Get a plain English explanation straight away.
              </p>
              {/* Upload dropzone */}
              <div
                onDragEnter={e=>e.preventDefault()} onDragOver={e=>e.preventDefault()}
                onDrop={e=>{ e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f){onFileUpload(f);onGetStarted();} }}
                style={{ background: LD.bgHero, border: `2px dashed ${LD.accent}`, borderRadius: 14, padding: "28px 24px", textAlign: "center", cursor: "pointer", maxWidth: 400 }}>
                <p style={{ fontSize: 17, color: LD.muted, marginBottom: 16, lineHeight: 1.6 }}>
                  Drag your document here<br />
                  <span style={{ fontSize: 14 }}>PDF, photo or image</span>
                </p>
                <input id="landing-file" type="file" style={{ display:"none" }}
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  onChange={e=>{ const f=e.target.files?.[0]; if(f){onFileUpload(f);onGetStarted();} }} />
                <label htmlFor="landing-file" style={{ ...btn, fontSize: 17, padding: "13px 28px", display:"inline-block", cursor:"pointer" }}>
                  Upload a document
                </label>
              </div>
              <a href="#how-it-works" style={{ ...outlineBtn, fontSize: 16, padding: "11px 22px", marginTop: 4, display:"inline-flex" }}>
                See how it works
              </a>
            </div>

            {/* Right — animated demo */}
            <div style={{ flex: 1, background: LD.bgWhite, borderRadius: 18, padding: 32, boxShadow: "0 4px 32px rgba(0,0,0,0.08)", minHeight: 400 }}>
              <AnimatedDemo step={step} />
            </div>

          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" style={{ background: LD.bgWhite, padding: "72px 64px", borderBottom: `1px solid ${LD.border}` }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, textAlign: "center", marginBottom: 16 }}>How it works</h2>
            <p style={{ textAlign: "center", fontSize: 18, color: LD.muted, marginBottom: 56 }}>Three simple steps. No login needed.</p>
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              {howSteps.map(s => (
                <div key={s.num} style={{ flex: "1 1 240px", textAlign: "center" }}>
                  <div style={{ fontSize: 46, marginBottom: 14 }}>{s.icon}</div>
                  <div style={{
                    background: LD.accent, color: "white",
                    width: 38, height: 38, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 18, margin: "0 auto 16px",
                  }}>{s.num}</div>
                  <h3 style={{ fontSize: 21, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 17, color: LD.muted, lineHeight: LD.lineH }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who it helps ── */}
        <section style={{ padding: "72px 64px", background: LD.bg }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, marginBottom: 16 }}>Built for everyone</h2>
            <p style={{ fontSize: 18, color: LD.muted, maxWidth: 620, margin: "0 auto 48px", lineHeight: LD.lineH }}>
              Plainly was built by a neurodivergent family who know how hard paperwork can be.
              It is free for individuals and designed to work for everyone.
            </p>
            <div>
              <input id="landing-file2" type="file" style={{ display:"none" }}
                accept="application/pdf,image/png,image/jpeg,image/webp"
                onChange={e=>{ const f=e.target.files?.[0]; if(f){onFileUpload(f);onGetStarted();} }} />
              <label htmlFor="landing-file2" style={{ ...btn, fontSize: 18, padding: "15px 36px", display:"inline-block", cursor:"pointer" }}>
                Upload a document — no login needed
              </label>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ padding: "28px 64px", background: LD.bgWhite, borderTop: `1px solid ${LD.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Plainly</span>
        <span style={{ color: LD.muted, fontSize: 15 }}>tryplainly.co.nz — making paperwork accessible for everyone.</span>
      </footer>

    </div>
  );
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  // file / session
  const [file, setFile]             = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isPdf, setIsPdf]           = useState(false);
  const [sessionId, setSessionId]   = useState(null);
  const [pages, setPages]           = useState([]);
  const [pageIdx, setPageIdx]       = useState(0);

  // document mode
  const [docMode, setDocMode]       = useState("general"); // "general" | "business_plan" | "school"
  const [readingAge, setReadingAge] = useState("7-8");     // school mode reading age

  // controls
  const [zoom, setZoom]             = useState(1.0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  // rubber-band selection
  const [selection, setSelection]   = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [dragStart, setDragStart]   = useState(null);
  const [liveRect, setLiveRect]     = useState(null);
  const [screenSel, setScreenSel]   = useState(null);
  const pageImgRefs                 = useRef([]);
  const docViewerRef                = useRef(null);
  const [dragPageIdx, setDragPageIdx] = useState(0);
  // Refs mirror drag state so onMouseMove/onMouseUp always see current values
  // (React state updates are async — without refs, onMouseMove fires before re-render
  //  and reads the stale dragging=false, causing rubber-band to silently do nothing)
  const draggingRef                 = useRef(false);
  const dragStartRef                = useRef(null);
  const dragPageIdxRef              = useRef(0);

  // output
  const [result, setResult]         = useState(null);
  const [checklistOpen, setChecklistOpen] = useState(false);

  // audio
  const [audioSpeed, setAudioSpeed]             = useState(1);
  const [isPlaying, setIsPlaying]               = useState(false);
  const [currentCharRange, setCurrentCharRange] = useState(null);
  const utterRef                                = useRef(null);
  const [voices, setVoices]                     = useState([]);
  const [voiceName, setVoiceName]               = useState("");

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  // Load system voices and auto-pick the best one
  useEffect(() => {
    function pickBest(list) {
      const en = list.filter(v => v.lang.startsWith("en"));
      const tests = [
        v => v.lang === "en-NZ",
        v => v.lang === "en-AU" && /enhanced|premium|siri/i.test(v.name),
        v => v.lang === "en-AU",
        v => v.lang.startsWith("en") && /enhanced|premium|siri/i.test(v.name),
        v => v.name === "Karen",
        v => v.name === "Samantha",
        v => v.name === "Daniel",
        v => v.name === "Alex",
      ];
      for (const t of tests) { const f = en.find(t); if (f) return f; }
      return en[0] || list[0] || null;
    }
    function load() {
      const list = window.speechSynthesis?.getVoices() || [];
      if (!list.length) return;
      const en = list.filter(v => v.lang.startsWith("en"));
      setVoices(en);
      setVoiceName(n => n || pickBest(list)?.name || "");
    }
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
  }, []);

  function reset() {
    window.speechSynthesis?.cancel();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null); setPreviewUrl(""); setIsPdf(false);
    setSessionId(null); setPages([]); setPageIdx(0);
    setSelection(null); setScreenSel(null); setResult(null); setError("");
    setIsPlaying(false); setCurrentCharRange(null);
  }

  async function handleFile(candidate) {
    if (!candidate) return;
    const ok = ["application/pdf","image/png","image/jpeg","image/webp"];
    if (!ok.includes(candidate.type)) { setError("Only PDF, JPG or PNG accepted."); return; }
    reset();
    setFile(candidate);
    const pdf = candidate.type === "application/pdf";
    setIsPdf(pdf);
    if (!pdf) { setPreviewUrl(URL.createObjectURL(candidate)); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", candidate);
      fd.append("context_type", "GOVERNMENT");
      const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `Upload failed ${res.status}`);
      const data = await res.json();
      setSessionId(data.session_id);
      setPages(data.pages || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const handleDrop   = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); };
  const handleBrowse = (e) => handleFile(e.target.files?.[0]);
  const currentPage  = pages[pageIdx] ?? null;

  // ── rubber-band ──────────────────────────────────────────
  function getImgPos(e, pIdx) {
    const el = pageImgRefs.current[pIdx ?? dragPageIdxRef.current];
    const rect = el?.getBoundingClientRect() ?? { left: 0, top: 0, width: 1, height: 1 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, rect };
  }
  function onMouseDown(e, pIdx) {
    if (!pages[pIdx]) return;
    e.preventDefault();
    setDragPageIdx(pIdx);
    dragPageIdxRef.current = pIdx;
    const { x, y } = getImgPos(e, pIdx);
    draggingRef.current = true;
    dragStartRef.current = { x, y };
    setDragging(true); setDragStart({ x, y });
    setLiveRect({ x, y, w: 0, h: 0 });
    setSelection(null); setScreenSel(null); setResult(null);
  }
  function onMouseMove(e) {
    if (!draggingRef.current || !dragStartRef.current) return;
    const ds = dragStartRef.current;
    const { x, y, rect } = getImgPos(e);
    setLiveRect({ x: Math.min(x, ds.x), y: Math.min(y, ds.y),
      w: clamp(Math.abs(x - ds.x), 0, rect.width),
      h: clamp(Math.abs(y - ds.y), 0, rect.height) });
  }
  function onMouseUp(e) {
    if (!draggingRef.current) return;
    const ds = dragStartRef.current;
    draggingRef.current = false;
    dragStartRef.current = null;
    setDragging(false);
    if (!ds) { setLiveRect(null); return; }
    const { x, y, rect } = getImgPos(e);
    const dragPage = pages[dragPageIdxRef.current];
    if (!dragPage) { setLiveRect(null); return; }
    const scaleX = dragPage.width  / rect.width;
    const scaleY = dragPage.height / rect.height;
    const sx = Math.min(x, ds.x), sy = Math.min(y, ds.y);
    const sw = Math.abs(x - ds.x), sh = Math.abs(y - ds.y);
    if (sw < 8 || sh < 8) { setLiveRect(null); return; }
    setSelection({ x: Math.round(sx*scaleX), y: Math.round(sy*scaleY), w: Math.round(sw*scaleX), h: Math.round(sh*scaleY) });
    setScreenSel({ x: sx, y: sy, w: sw, h: sh, imgW: rect.width });
    setLiveRect(null);
  }

  // ── client-side crop ─────────────────────────────────────
  function cropSelectionToBlob() {
    return new Promise((resolve, reject) => {
      const img = pageImgRefs.current[dragPageIdx];
      if (!screenSel || !img) { reject(new Error("No selection")); return; }
      const { width: dw, height: dh } = img.getBoundingClientRect();
      const sx = Math.round(screenSel.x * img.naturalWidth  / dw);
      const sy = Math.round(screenSel.y * img.naturalHeight / dh);
      const sw = Math.max(1, Math.round(screenSel.w * img.naturalWidth  / dw));
      const sh = Math.max(1, Math.round(screenSel.h * img.naturalHeight / dh));
      const canvas = document.createElement("canvas");
      canvas.width = sw; canvas.height = sh;
      canvas.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("Canvas crop failed")), "image/png");
    });
  }

  // ── simplify ─────────────────────────────────────────────
  async function handleSimplify() {
    if (!file) { setError("Upload a file first."); return; }
    window.speechSynthesis?.cancel();
    setIsPlaying(false); setCurrentCharRange(null);
    setLoading(true); setError(""); setResult(null);
    try {
      const fd = new FormData();
      if (isPdf && screenSel && pageImgRefs.current[dragPageIdx]) {
        fd.append("file", await cropSelectionToBlob(), "selection.png");
      } else {
        fd.append("file", file);
        fd.append("page_num", String(dragPageIdx + 1));
      }
      const profile = docMode === "school" ? `school_${readingAge}` : docMode;
      fd.append("audience_profile", profile);
      const res = await fetch(`${API_BASE}/api/simplify`, { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `Error ${res.status}`);
      setResult(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  // ── speech: build full text across all sections ──────────
  const speechInfo = useMemo(() => {
    if (!result) return { fullText: "", sections: [] };
    const sep = "\n\n";
    const sections = [];
    let offset = 0;
    if (result.simplified_text) {
      sections.push({ key: "simplified", text: result.simplified_text, offset });
      offset += result.simplified_text.length + sep.length;
    }
    if (result.checklist?.length > 0) {
      const text = result.checklist.join("\n");
      sections.push({ key: "checklist", text, offset });
    }
    return { fullText: sections.map(s => s.text).join(sep), sections };
  }, [result]);

  function speakFrom(charStart) {
    if (!speechInfo.fullText || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(speechInfo.fullText.slice(charStart));
    u.rate = audioSpeed;
    if (voiceName) {
      const v = window.speechSynthesis.getVoices().find(v => v.name === voiceName);
      if (v) u.voice = v;
    }
    u.onboundary = (e) => {
      if (e.name !== "word") return;
      const abs = charStart + (e.charIndex || 0);
      setCurrentCharRange({ start: abs, end: abs + (e.charLength || 1) });
    };
    u.onend   = () => { setIsPlaying(false); setCurrentCharRange(null); };
    u.onerror = () => { setIsPlaying(false); setCurrentCharRange(null); };
    utterRef.current = u;
    setIsPlaying(true);
    window.speechSynthesis.speak(u);
  }
  function speak()       { speakFrom(0); }
  function stopSpeech()  { window.speechSynthesis?.cancel(); setIsPlaying(false); setCurrentCharRange(null); }
  function pauseResume() {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setIsPlaying(true); }
    else { window.speechSynthesis.pause(); setIsPlaying(false); }
  }

  // ── render clickable words with highlight ─────────────────
  function renderClickableWords(text, globalOffset) {
    if (!text) return null;
    const lines = text.split("\n");
    let lineCharOffset = 0;
    return lines.map((line, li) => {
      const isBullet = line.trim().startsWith("•");
      const stripped = isBullet ? line.replace(/^\s*•\s*/, "") : line;
      const contentOffset = line.length - line.replace(/^\s*•?\s*/, "").length;
      if (!stripped.trim()) { lineCharOffset += line.length + 1; return null; }

      const tokens = stripped.split(/(\s+)/);
      let tokenOffset = 0;
      const spans = tokens.map((tok, ti) => {
        const isSpace = /^\s+$/.test(tok);
        const cs = globalOffset + lineCharOffset + contentOffset + tokenOffset;
        tokenOffset += tok.length;
        if (isSpace) return <span key={ti}>{tok}</span>;
        const isHi = currentCharRange && cs >= currentCharRange.start && cs < currentCharRange.end;
        return (
          <span key={ti} className="word-click" onClick={() => speakFrom(cs)}
            title="Click to listen from here"
            style={{ background: isHi ? "#ffe599" : "transparent" }}>
            {tok}
          </span>
        );
      });

      lineCharOffset += line.length + 1;

      if (isBullet) return (
        <div key={li} className="bullet-line">
          <span className="bullet-dot">•</span>
          <span className="bullet-text">{spans}</span>
        </div>
      );
      return <p key={li} style={{ marginBottom: 6 }}>{spans}</p>;
    });
  }

  // ── left panel ───────────────────────────────────────────
  function renderLeft() {
    if (!file) return (
      <div className="drop-zone"
        onDragEnter={e=>e.preventDefault()} onDragOver={e=>e.preventDefault()}
        onDragLeave={e=>e.preventDefault()} onDrop={handleDrop}>
        <div>
          <strong>Drop a document here</strong>
          <p>PDF, JPG or PNG accepted</p>
          <input id="file-input" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={handleBrowse} />
          <label htmlFor="file-input" className="browse-btn">Browse files</label>
        </div>
      </div>
    );

    if (!isPdf) return (
      <div className="doc-viewer">
        <img src={previewUrl} alt="Uploaded document" style={{ width: `${zoom*100}%`, display: "block" }} />
      </div>
    );

    if (loading && pages.length === 0) return <div className="doc-loading">Reading PDF…</div>;
    if (!currentPage) return null;

    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

        {/* Toolbar — fixed at top, never scrolls */}
        <div className="page-nav">
          <span style={{ color:"#2C2C2C", fontSize:13, fontWeight:600, minWidth:110 }}>
            Page {pageIdx+1} of {pages.length}
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button className="nav-btn" onClick={() => setZoom(z=>Math.max(0.4,+(z-0.2).toFixed(1)))}>−</button>
            <span style={{ fontSize:12, minWidth:42, textAlign:"center", color:"#2C2C2C" }}>{Math.round(zoom*100)}%</span>
            <button className="nav-btn" onClick={() => setZoom(z=>Math.min(3.0,+(z+0.2).toFixed(1)))}>+</button>
            <button className="nav-btn" onClick={() => setZoom(1.0)} title="Reset zoom">↺</button>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
            <button className="nav-btn" onClick={() => setChecklistOpen(true)} title="Open checklist">
              ✅ Checklist
            </button>
            <button className="nav-btn" onClick={() => window.print()} title="Print">
              🖨 Print
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Thumbnail strip — only shows when PDF has more than 1 page */}
          {pages.length > 1 && (
            <div className="thumb-strip">
              {pages.map((p, i) => (
                <div key={i} className={`thumb-item${i === pageIdx ? " thumb-active" : ""}`}
                  onClick={() => {
                    setPageIdx(i);
                    docViewerRef.current?.querySelectorAll(".page-wrap-outer")[i]?.scrollIntoView({ behavior: "smooth" });
                  }}>
                  <img src={`data:image/png;base64,${p.image_base64}`} alt={`Page ${i+1}`} />
                  <span>Page {i+1}</span>
                </div>
              ))}
            </div>
          )}

          {/* Scrollable viewer — all pages stacked */}
          <div className="doc-viewer" ref={docViewerRef}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onScroll={e => {
              const cRect = e.currentTarget.getBoundingClientRect();
              let bestIdx = 0, bestOverlap = -1;
              e.currentTarget.querySelectorAll(".page-wrap-outer").forEach((el, i) => {
                const r = el.getBoundingClientRect();
                const overlap = Math.min(r.bottom, cRect.bottom) - Math.max(r.top, cRect.top);
                if (overlap > bestOverlap) { bestOverlap = overlap; bestIdx = i; }
              });
              setPageIdx(bestIdx);
            }}>

            {pages.map((p, i) => (
              <div key={i} className="page-wrap-outer">
                <div className="page-wrap"
                  style={{ width: `${zoom * 100}%` }}
                  onMouseDown={e => onMouseDown(e, i)}>
                  <img
                    ref={el => { pageImgRefs.current[i] = el; }}
                    src={`data:image/png;base64,${p.image_base64}`}
                    alt={`Page ${i+1}`} draggable={false}
                    style={{ width:"100%", display:"block", userSelect:"none" }} />
                  {i===dragPageIdx && liveRect && liveRect.w>2 && liveRect.h>2 && (
                    <div className="rubberband" style={{ left:liveRect.x, top:liveRect.y, width:liveRect.w, height:liveRect.h }} />
                  )}
                  {i===dragPageIdx && screenSel && (
                    <div className="rubberband rubberband-done" style={{ left:screenSel.x, top:screenSel.y, width:screenSel.w, height:screenSel.h }} />
                  )}
                </div>
                {i===dragPageIdx && !selection && <p className="drag-hint">☝ Draw a box around the section you want simplified</p>}
                {i===dragPageIdx && selection  && <p className="drag-hint selected">✓ Region selected — press Simplify</p>}
                {i < pages.length-1 && <div className="page-divider">Page {i+2}</div>}
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // ── render ───────────────────────────────────────────────
  if (showLanding) return (
    <LandingPage
      onGetStarted={() => setShowLanding(false)}
      onFileUpload={(f) => { handleFile(f); setShowLanding(false); }}
    />
  );

  const simpSection  = speechInfo.sections.find(s=>s.key==="simplified");
  const checkSection = speechInfo.sections.find(s=>s.key==="checklist");

  return (
    <div className="app-shell">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; font-family: Arial, Helvetica, sans-serif; }
        .app-shell { display: flex; flex-direction: column; height: 100vh; background: #F8F7F2; color: #2C2C2C; }

        /* Header — matches landing page nav */
        .app-header { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 24px; background: #FFFFFF; border-bottom: 1px solid #DDD9D0; color: #2C2C2C; flex-shrink: 0; }
        .logo { font-size: 14px; font-weight: 800; background: #1B6E6B; color: white; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.02em; }
        .logo-name { font-size: 18px; font-weight: 800; flex: 1; color: #2C2C2C; }
        .header-error { font-size: 13px; color: #b91c1c; flex: 1; }
        .hbtn { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 700; }
        .hbtn-blue { background: #1B6E6B; color: white; } .hbtn-blue:hover:not(:disabled) { background: #145957; }
        .hbtn-grey { background: #E8E6E0; color: #2C2C2C; border: 1px solid #DDD9D0; } .hbtn-grey:hover { background: #D8D5CE; }
        .hbtn-ghost { background: transparent; color: #5A5754; border: 1px solid #DDD9D0; } .hbtn-ghost:hover { background: #F0EEE8; }

        /* Split */
        .split { display: flex; flex: 1; overflow: hidden; }
        .split-left  { width: 62%; border-right: 1px solid #DDD9D0; overflow: hidden; display: flex; flex-direction: column; background: #ECEAE4; }
        .split-right { width: 38%; overflow-y: auto; background: #F8F7F2; padding: 20px; display: flex; flex-direction: column; gap: 16px; }

        /* Drop zone */
        .drop-zone { flex: 1; display: flex; align-items: center; justify-content: center; border: 2px dashed #1B6E6B; margin: 24px; border-radius: 14px; background: #FFFFFF; text-align: center; padding: 32px 24px; }
        .drop-zone strong { color: #2C2C2C; font-size: 17px; display: block; margin-bottom: 10px; }
        .drop-zone p { color: #5A5754; font-size: 15px; margin-bottom: 16px; line-height: 1.6; }
        .drop-zone input { display: none; }
        .browse-btn { display: inline-block; padding: 10px 22px; background: #1B6E6B; color: white; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 700; }
        .browse-btn:hover { background: #145957; }

        /* Document viewer */
        .doc-viewer { flex: 1; overflow-y: scroll; overflow-x: auto; min-width: 0; background: #ECEAE4; }
        .doc-loading { flex: 1; display: flex; align-items: center; justify-content: center; color: #5A5754; font-size: 16px; }

        /* Thumbnail strip */
        .thumb-strip { width: 190px; min-width: 190px; flex-shrink: 0; overflow-y: auto; background: #F0EEE8; padding: 12px 10px; display: flex; flex-direction: column; gap: 12px; border-right: 1px solid #DDD9D0; }
        .thumb-item { cursor: pointer; border-radius: 6px; overflow: hidden; border: 3px solid #DDD9D0; transition: border-color 0.15s, box-shadow 0.15s; background: #FFFFFF; box-shadow: 0 1px 4px rgba(0,0,0,0.08); flex-shrink: 0; }
        .thumb-item:hover { border-color: #1B6E6B; box-shadow: 0 2px 8px rgba(27,110,107,0.18); }
        .thumb-item img { width: 100%; aspect-ratio: 1 / 1.414; object-fit: cover; object-position: top center; display: block; background: #e8e5de; }
        .thumb-item span { display: block; text-align: center; font-size: 12px; font-weight: 600; color: #5A5754; padding: 5px 0; background: #F0EEE8; }
        .thumb-active { border-color: #1B6E6B !important; box-shadow: 0 0 0 2px rgba(27,110,107,0.25) !important; }
        .page-wrap-outer { display: flex; flex-direction: column; align-items: center; padding: 20px 16px 0; width: 100%; box-sizing: border-box; }
        .page-wrap { position: relative; cursor: crosshair; user-select: none; background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.10); flex-shrink: 0; margin: 0 auto; }
        .page-divider { width: 100%; background: #DDD9D0; color: #5A5754; font-size: 11px; font-weight: 600; text-align: center; padding: 6px 0; margin-top: 20px; letter-spacing: 0.05em; box-sizing: border-box; }

        /* Toolbar */
        .page-nav { display: flex; align-items: center; gap: 10px; padding: 8px 14px; background: #FFFFFF; border-bottom: 1px solid #DDD9D0; color: #2C2C2C; font-size: 13px; flex-shrink: 0; }
        .nav-btn { padding: 5px 12px; background: #F0EEE8; color: #2C2C2C; border: 1px solid #DDD9D0; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
        .nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .nav-btn:hover:not(:disabled) { background: #E4E1D8; border-color: #C8C4BB; }

        /* Rubber-band */
        .rubberband { position: absolute; border: 2px dashed #1B6E6B; background: rgba(27,110,107,0.1); pointer-events: none; }
        .rubberband-done { border-style: solid; background: rgba(27,110,107,0.15); }
        .drag-hint { padding: 7px 12px; font-size: 13px; color: #5A5754; text-align: center; background: #F0EEE8; border-top: 1px solid #DDD9D0; }
        .drag-hint.selected { color: #1B6E6B; font-weight: 700; }

        /* Mode toggle */
        .mode-toggle { display: flex; gap: 0; border-radius: 8px; overflow: hidden; border: 2px solid #DDD9D0; flex-shrink: 0; }
        .mode-btn { flex: 1; padding: 10px 8px; background: #F0EEE8; color: #5A5754; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s, color 0.15s; }
        .mode-btn:not(:last-child) { border-right: 1px solid #DDD9D0; }
        .mode-btn:hover:not(.mode-active) { background: #E4E1D8; }
        .mode-active { background: #1B6E6B !important; color: white !important; }
        .age-selector { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 10px 12px; background: #EEF6F6; border-radius: 8px; border: 1px solid #C8E0DF; }
        .age-btn { padding: 5px 14px; border-radius: 20px; border: 2px solid #DDD9D0; background: #F0EEE8; color: #5A5754; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .age-btn:hover { border-color: #1B6E6B; color: #1B6E6B; }
        .age-active { border-color: #1B6E6B !important; background: #1B6E6B !important; color: white !important; }

        /* Simplify action */
        .simplify-action { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 8px 0 4px; text-align: center; }
        .simplify-btn { padding: 14px 36px; background: #1B6E6B; color: white; border: none; border-radius: 10px; font-size: 17px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(27,110,107,0.3); transition: background 0.15s, transform 0.1s; }
        .simplify-btn:hover:not(:disabled) { background: #145957; transform: translateY(-1px); }
        .simplify-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .simplify-hint { font-size: 14px; color: #5A5754; max-width: 280px; line-height: 1.6; }

        /* Audio */
        .audio-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 10px 12px; background: #EEF6F6; border-radius: 8px; border: 1px solid #C8E0DF; }
        .audio-bar label { font-size: 12px; color: #3A3A3A; display: flex; align-items: center; gap: 6px; }
        .audio-hint { font-size: 12px; color: #1B6E6B; font-weight: 600; width: 100%; padding-top: 4px; }
        .voice-select { font-size: 12px; border: 1px solid #C8E0DF; border-radius: 6px; padding: 4px 6px; background: white; color: #2C2C2C; cursor: pointer; max-width: 180px; }
        .abtn { padding: 6px 14px; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .abtn:disabled { opacity: 0.4; cursor: not-allowed; }
        .abtn-blue { background: #1B6E6B; color: white; } .abtn-blue:hover:not(:disabled) { background: #145957; }
        .abtn-grey { background: #E8E6E0; color: #2C2C2C; border: 1px solid #DDD9D0; } .abtn-grey:hover:not(:disabled) { background: #D8D5CE; }
        .abtn-red  { background: #dc2626; color: white; } .abtn-red:hover:not(:disabled)  { background: #b91c1c; }
        /* Clickable words */
        .word-click { cursor: pointer; border-radius: 3px; }
        .word-click:hover { text-decoration: underline; text-decoration-color: #1B6E6B; text-decoration-thickness: 2px; }

        /* Result cards */
        .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #5A5754; margin-bottom: 6px; }
        .result-card { background: white; border: 1px solid #DDD9D0; border-radius: 8px; padding: 14px 16px; }
        .result-card h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #5A5754; margin-bottom: 10px; letter-spacing: 0.06em; }
        .placeholder { color: #9CA3AF; font-size: 14px; line-height: 1.6; }

        /* Simplified text box */
        .simplified-box { background: white; border: 1px solid #DDD9D0; border-radius: 8px; padding: 14px 16px; line-height: 1.85; font-size: 15px; color: #2C2C2C; min-height: 80px; overflow-wrap: break-word; word-break: break-word; }
        .bullet-line { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
        .bullet-dot  { flex-shrink: 0; color: #1B6E6B; font-size: 20px; line-height: 1.4; }
        .bullet-text { flex: 1; overflow-wrap: break-word; word-break: break-word; }

        /* Checklist */
        .checklist-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .checklist-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; line-height: 1.6; overflow-wrap: break-word; word-break: break-word; cursor: pointer; }
        .checklist-item:hover { background: rgba(27,110,107,0.05); border-radius: 4px; }
        .check-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: #1B6E6B; color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 1px; }

        /* Flags */
        .flags-row { display: flex; flex-direction: column; gap: 6px; }
        .flag-chip { display: inline-flex; align-items: flex-start; gap: 6px; padding: 6px 10px; border-radius: 8px; font-size: 13px; background: #fef9c3; color: #854d0e; border: 1px solid #fde047; line-height: 1.5; overflow-wrap: break-word; word-break: break-word; }

        /* Crop preview */
        .crop-preview { overflow: hidden; position: relative; border-radius: 6px; border: 2px solid #2563eb; width: 100%; }

        /* Checklist drawer */
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 50; display: grid; place-items: center; padding: 20px; }
        .drawer-panel { width: min(580px, 100%); background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.22); }
        .drawer-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
        .drawer-head h2 { font-size: 18px; }
        .drawer-body { padding: 20px; max-height: 420px; overflow-y: auto; }
        .drawer-body ul { padding-left: 0; list-style: none; }
        .drawer-body li { margin-bottom: 12px; line-height: 1.75; display: flex; gap: 10px; align-items: flex-start; }

        @media print {
          .no-print { display: none !important; }
          .split-left { display: none !important; }
          .split { display: block; }
          .split-right { width: 100%; background: white; overflow: visible; }
          .app-shell { height: auto; }
          .print-only { display: block !important; }
          .print-warning { display: block !important; border: 2px dashed red; padding: 10px; color: red; font-weight: 700; margin-top: 16px; font-size: 13px; }
        }
        .print-warning { display: none; }
      `}</style>

      {/* Header */}
      <header className="app-header no-print">
        <span className="logo">Plainly</span>
        <span className="logo-name">Plain English for everyone</span>
        {error && <span className="header-error">⚠ {error}</span>}
        {file && <button className="hbtn hbtn-ghost" onClick={reset}>↩ New document</button>}
        {result && <button className="hbtn hbtn-grey" onClick={() => setChecklistOpen(true)}>☑ Checklist</button>}
        {result && <button className="hbtn hbtn-grey" onClick={() => window.print()}>🖨 Print</button>}
      </header>

      <div className="split">
        {/* LEFT */}
        <section className="split-left">
          {renderLeft()}
        </section>

        {/* RIGHT */}
        <section className="split-right">

          {/* Document mode toggle */}
          <div className="mode-toggle no-print">
            <button
              className={`mode-btn${docMode === "general" ? " mode-active" : ""}`}
              onClick={() => { setDocMode("general"); setResult(null); }}
            >📄 General</button>
            <button
              className={`mode-btn${docMode === "business_plan" ? " mode-active" : ""}`}
              onClick={() => { setDocMode("business_plan"); setResult(null); }}
            >📋 Business plan</button>
            <button
              className={`mode-btn${docMode === "school" ? " mode-active" : ""}`}
              onClick={() => { setDocMode("school"); setResult(null); }}
            >📚 School</button>
          </div>

          {/* Reading age selector — only shows in School mode */}
          {docMode === "school" && (
            <div className="age-selector no-print">
              <span style={{ fontSize: 13, color: "#1B6E6B", fontWeight: 700, marginRight: 2 }}>Child's reading age:</span>
              {[["5-6","Age 5–6"],["7-8","Age 7–8"],["9-10","Age 9–10"],["11-12","Age 11–12"]].map(([val, label]) => (
                <button key={val}
                  className={`age-btn${readingAge === val ? " age-active" : ""}`}
                  onClick={() => setReadingAge(val)}>
                  {label}
                </button>
              ))}
              <span style={{ fontSize: 12, color: "#5A5754", width: "100%", lineHeight: 1.5, marginTop: 2 }}>
                Pick the age they actually read at — not their school year.
              </span>
            </div>
          )}

          {/* Simplify button */}
          <div className="simplify-action no-print">
            {!file ? (
              <>
                <p className="simplify-hint">Load a document on the left to get started.</p>
                <label htmlFor="file-input-rp" className="hbtn hbtn-blue" style={{ cursor:"pointer", fontSize:15, padding:"12px 28px" }}>
                  Upload a document
                </label>
                <input id="file-input-rp" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={handleBrowse} style={{ display:"none" }} />
              </>
            ) : isPdf && pages.length > 0 && !selection ? (
              <p className="simplify-hint">☝ Draw a box around the section you want, then press Simplify.</p>
            ) : (
              <button className="simplify-btn" onClick={handleSimplify}
                disabled={loading || (isPdf && !selection && pages.length > 0)}>
                {loading ? "Simplifying…" : "✦ Simplify this section"}
              </button>
            )}
          </div>

          {/* Audio bar */}
          {result && (
            <div className="audio-bar no-print">
              <button className="abtn abtn-blue" onClick={speak} disabled={!speechInfo.fullText}>🔊 Play all</button>
              <button className="abtn abtn-grey" onClick={pauseResume} disabled={!isPlaying}>⏸ Pause</button>
              <button className="abtn abtn-red"  onClick={stopSpeech}  disabled={!isPlaying}>⏹ Stop</button>
              <label style={{ marginLeft: "auto" }}>Speed:
                <input type="range" min="0.5" max="1.5" step="0.1" value={audioSpeed}
                  onChange={e => setAudioSpeed(Number(e.target.value))} /> {audioSpeed.toFixed(1)}x
              </label>
              {voices.length > 0 && (
                <select className="voice-select" value={voiceName} onChange={e => setVoiceName(e.target.value)} title="Choose voice">
                  {voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
              )}
              <span className="audio-hint">👆 Click any word below to start listening from that point</span>
            </div>
          )}

          {/* Crop preview */}
          {!result && selection && screenSel && currentPage && (
            <div>
              <p className="section-label">You selected this section:</p>
              <div className="crop-preview" style={{ height: Math.min(220, Math.round(screenSel.h * (460 / screenSel.w))) }}>
                <img src={`data:image/png;base64,${currentPage.image_base64}`} alt="Selected section"
                  style={{ position:"absolute",
                    left:`${-screenSel.x * (460/screenSel.w)}px`,
                    top: `${-screenSel.y * (460/screenSel.w)}px`,
                    width:`${screenSel.imgW * (460/screenSel.w)}px`,
                    display:"block" }} />
              </div>
              <p style={{ fontSize:12, color:"#888", marginTop:4 }}>Not right? Redraw the box on the document.</p>
            </div>
          )}

          {/* Plain English */}
          <div>
            <p className="section-label">Plain English</p>
            <div className="simplified-box">
              {result
                ? renderClickableWords(result.simplified_text, simpSection?.offset ?? 0)
                : <span className="placeholder">
                    {!file ? "Upload a document to get started."
                      : isPdf && pages.length > 0 && !selection ? "Draw a box around the section you want, then press Simplify."
                      : "Press ✦ Simplify to get the plain-English version."}
                  </span>}
            </div>
          </div>

          {/* What you need to do */}
          {result?.checklist?.length > 0 && (
            <div className="result-card">
              <h3>What You Need To Do</h3>
              <ul className="checklist-list">
                {result.checklist.map((item, i) => {
                  const itemOffset = (checkSection?.offset ?? 0) +
                    result.checklist.slice(0,i).join("\n").length + (i > 0 ? 1 : 0);
                  return (
                    <li key={i} className="checklist-item" onClick={() => speakFrom(itemOffset)} title="Tap to play from here">
                      <span className="check-num">{i+1}</span>
                      <span style={{ flex:1 }}>{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Important details */}
          {result?.flags && Object.values(result.flags).some(v => v?.length > 0) && (
            <div className="result-card">
              <h3>Important Details</h3>
              <div className="flags-row">
                {result.flags.deadlines?.map((d,i)        => <span key={i} className="flag-chip">📅 {d}</span>)}
                {result.flags.amounts?.map((a,i)          => <span key={i} className="flag-chip">💰 {a}</span>)}
                {result.flags.documents_needed?.map((d,i) => <span key={i} className="flag-chip">📄 {d}</span>)}
              </div>
            </div>
          )}

        </section>
      </div>

      <div className="print-warning">⚠️ PERSONAL HELPER NOTES ONLY — DO NOT SUBMIT THIS TO WINZ OR ANY AGENCY.</div>

      {checklistOpen && (
        <div className="drawer-overlay" onClick={() => setChecklistOpen(false)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <h2>What You Need To Do</h2>
              <button className="hbtn hbtn-blue" onClick={() => setChecklistOpen(false)}>Close</button>
            </div>
            <div className="drawer-body">
              {result?.checklist?.length > 0
                ? <ul>{result.checklist.map((c,i) =>
                    <li key={i}><span className="check-num" style={{ marginTop:2 }}>{i+1}</span><span>{c}</span></li>
                  )}</ul>
                : <p>Simplify a section first to generate the checklist.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
