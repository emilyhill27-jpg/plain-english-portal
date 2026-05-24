import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";

function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

/* ─── Design tokens — purple / lavender palette ─── */
const T = {
  purple:      "#7C3AED",
  purpleHover: "#6D28D9",
  purpleLight: "#EDE9FE",
  purplePale:  "#F5F3FF",
  pink:        "#EC4899",
  pinkPale:    "#FDF2F8",
  green:       "#10B981",
  greenLight:  "#D1FAE5",
  cream:       "#FFF9F0",
  yellowPale:  "#FFFBEB",
  bluePale:    "#EFF6FF",
  lilacPale:   "#F3E8FF",
  greyPale:    "#F3F4F6",
  bg:          "#FAFAFA",
  bgHero:      "linear-gradient(135deg, #EDE9FE 0%, #FDF2F8 50%, #FEF3C7 100%)",
  text:        "#1F2937",
  textMid:     "#4B5563",
  textSoft:    "#6B7280",
  border:      "#E5E7EB",
  borderLight: "#F3F4F6",
  white:       "#FFFFFF",
  shadow:      "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:    "0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)",
  shadowLg:    "0 10px 25px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.04)",
  radius:      "12px",
  radiusSm:    "8px",
  radiusLg:    "16px",
  font:        "'Lexend', 'Open Sans', Arial, sans-serif",
};

/* ─── Landing page ─── */
function LandingPage({ onGetStarted, onFileUpload }) {
  const [hovering, setHovering] = useState(false);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .pl-root *, .pl-root *::before, .pl-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pl-root {
          font-family: ${T.font};
          background: ${T.bg};
          color: ${T.text};
          font-size: 16px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }

        /* Nav */
        .pl-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid ${T.border};
          padding: 0 48px;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
        }
        .pl-nav-left { display: flex; align-items: center; gap: 8px; }
        .pl-nav-logo-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: ${T.purple}; color: white;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 16px;
        }
        .pl-nav-logo {
          font-size: 22px; font-weight: 700;
          color: ${T.text}; text-decoration: none;
        }
        .pl-nav-links { display: flex; gap: 28px; align-items: center; }
        .pl-nav-links a {
          font-size: 14px; color: ${T.textSoft};
          text-decoration: none; font-weight: 500;
          transition: color 0.15s;
        }
        .pl-nav-links a:hover { color: ${T.purple}; }
        .pl-nav-links a.active { color: ${T.purple}; }
        .pl-nav-right { display: flex; gap: 12px; align-items: center; }
        .pl-nav-login {
          font-size: 14px; color: ${T.textSoft}; font-weight: 500;
          text-decoration: none; padding: 8px 16px;
        }
        .pl-nav-cta {
          background: ${T.purple}; color: white;
          padding: 10px 22px; border-radius: 20px;
          font-size: 14px; font-weight: 600;
          text-decoration: none; border: none; cursor: pointer;
          transition: background 0.2s; font-family: inherit;
        }
        .pl-nav-cta:hover { background: ${T.purpleHover}; }

        /* Hero */
        .pl-hero {
          background: ${T.bgHero};
          padding: 80px 48px 96px;
          display: grid;
          grid-template-columns: 1fr 480px;
          align-items: center;
          gap: 64px;
        }
        @media (max-width: 960px) {
          .pl-hero { grid-template-columns: 1fr; padding: 60px 24px 72px; gap: 40px; }
          .pl-nav { padding: 0 24px; }
        }
        .pl-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(124,58,237,0.08);
          border: 1px solid rgba(124,58,237,0.15);
          padding: 8px 20px; border-radius: 24px;
          font-size: 15px; color: ${T.purple}; font-weight: 500;
          margin-bottom: 24px;
        }
        .pl-hero h1 {
          font-size: clamp(36px, 4.5vw, 56px);
          font-weight: 700; line-height: 1.12;
          margin-bottom: 20px; color: ${T.text};
          letter-spacing: -0.02em;
        }
        .pl-hero-sub {
          font-size: 17px; color: ${T.textMid};
          line-height: 1.65; max-width: 480px;
          margin-bottom: 32px;
        }
        .pl-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
        .pl-btn-primary {
          background: ${T.purple}; color: white;
          padding: 14px 28px; border-radius: 10px;
          font-size: 16px; font-weight: 600;
          border: none; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          transition: background 0.2s; font-family: inherit;
        }
        .pl-btn-primary:hover { background: ${T.purpleHover}; }
        .pl-btn-secondary {
          background: white; color: ${T.text};
          border: 1px solid ${T.border};
          padding: 14px 28px; border-radius: 10px;
          font-size: 15px; font-weight: 500;
          cursor: pointer; transition: border-color 0.2s; font-family: inherit;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .pl-btn-secondary:hover { border-color: ${T.purple}; color: ${T.purple}; }
        .pl-hero-trust {
          font-size: 13px; color: ${T.textSoft};
          display: flex; align-items: center; gap: 6px;
        }

        /* Demo card — stacked layout */
        .pl-demo-card {
          background: white;
          border-radius: 16px;
          box-shadow: ${T.shadowLg};
          overflow: hidden;
          border: 1px solid ${T.border};
          max-width: 520px;
        }
        .pl-demo-header {
          padding: 14px 20px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid ${T.borderLight};
        }
        .pl-demo-header-left { font-size: 14px; color: ${T.textSoft}; font-weight: 500; }
        .pl-demo-header-right { font-size: 14px; color: ${T.textSoft}; font-weight: 500; }
        .pl-demo-stacked {
          padding: 20px; display: flex; flex-direction: column; gap: 16px;
        }
        .pl-demo-msg-box {
          border: 1.5px solid ${T.border}; border-radius: 12px;
          padding: 16px 18px; background: ${T.bg};
        }
        .pl-demo-msg-box.plain {
          border-color: rgba(124,58,237,0.2);
          background: rgba(124,58,237,0.03);
        }
        .pl-demo-msg-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 600; color: ${T.textMid};
          margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.03em;
        }
        .pl-demo-original-text {
          font-size: 14px; color: ${T.textSoft}; line-height: 1.6;
          font-style: italic;
        }
        .pl-demo-plain-text {
          font-size: 14px; color: ${T.text}; line-height: 1.6;
        }
        .pl-demo-arrow-row {
          display: flex; align-items: center; justify-content: center;
        }
        .pl-demo-arrow-btn {
          width: 32px; height: 32px; border-radius: 50%;
          background: ${T.purpleLight}; border: none; cursor: default;
          display: flex; align-items: center; justify-content: center;
          color: ${T.purple}; font-size: 14px;
        }
        .pl-demo-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 12px;
          font-size: 12px; font-weight: 500;
          margin-top: 10px;
        }
        .pl-demo-tag-hard { background: ${T.greyPale}; color: ${T.textSoft}; }
        .pl-demo-tag-easy { background: ${T.greenLight}; color: #059669; }

        /* Support section */
        .pl-support-section {
          padding: 80px 48px;
          text-align: center;
        }
        .pl-support-icon {
          width: 48px; height: 48px; margin: 0 auto 16px;
          color: ${T.purple};
        }
        .pl-support-section h2 {
          font-size: 32px; font-weight: 700; color: ${T.text};
          margin-bottom: 8px;
        }
        .pl-support-section > p {
          font-size: 16px; color: ${T.textSoft}; max-width: 560px;
          margin: 0 auto 48px;
        }
        .pl-cards-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 20px; max-width: 1100px; margin: 0 auto;
        }
        @media (max-width: 960px) {
          .pl-cards-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .pl-cards-grid { grid-template-columns: 1fr; }
        }
        .pl-feature-card {
          background: white;
          border: 1px solid ${T.border};
          border-radius: ${T.radius};
          padding: 28px 24px;
          text-align: left;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .pl-feature-card:hover {
          box-shadow: ${T.shadowMd};
          border-color: rgba(124,58,237,0.2);
        }
        .pl-feature-card-icon {
          width: 56px; height: 56px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px; font-size: 28px;
        }
        .pl-feature-card h3 {
          font-size: 16px; font-weight: 600; color: ${T.text};
          margin-bottom: 8px;
        }
        .pl-feature-card p {
          font-size: 14px; color: ${T.textSoft}; line-height: 1.55;
          margin-bottom: 16px;
        }
        .pl-feature-card-link {
          font-size: 14px; color: ${T.purple}; font-weight: 500;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .pl-feature-card-link:hover { text-decoration: underline; }

        /* CTA section */
        .pl-cta-section {
          padding: 80px 48px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 48px; align-items: center;
          max-width: 1100px; margin: 0 auto;
        }
        @media (max-width: 800px) {
          .pl-cta-section { grid-template-columns: 1fr; padding: 60px 24px; }
        }
        .pl-cta-section h2 {
          font-size: 32px; font-weight: 700; color: ${T.text};
          line-height: 1.2; margin-bottom: 16px;
        }
        .pl-cta-section > div > p {
          font-size: 16px; color: ${T.textSoft}; line-height: 1.6;
          margin-bottom: 24px;
        }
        .pl-cta-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .pl-cta-link {
          font-size: 15px; color: ${T.purple}; font-weight: 500;
          text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
          padding: 12px 0;
        }
        .pl-cta-link:hover { text-decoration: underline; }
        .pl-cta-illustration {
          display: flex; align-items: center; justify-content: center;
          background: ${T.bgHero};
          border-radius: 20px;
          padding: 40px;
          min-height: 300px;
        }

        /* Footer */
        .pl-footer {
          background: white;
          border-top: 1px solid ${T.border};
          padding: 24px 48px;
        }
        .pl-footer-inner {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
          max-width: 1100px; margin: 0 auto;
        }
        .pl-footer-left {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: ${T.textSoft};
        }
        .pl-footer-right {
          display: flex; gap: 24px; align-items: center;
          font-size: 13px; color: ${T.textSoft};
        }
        .pl-footer-right span {
          display: flex; align-items: center; gap: 6px;
        }

        /* Drag-drop on hero */
        .pl-hero-drop {
          margin-top: 8px;
          border: 2px dashed ${T.border};
          border-radius: ${T.radius};
          padding: 24px;
          text-align: center;
          max-width: 480px;
          transition: border-color 0.2s, background 0.2s;
          cursor: pointer;
        }
        .pl-hero-drop:hover, .pl-hero-drop.dragging {
          border-color: ${T.purple};
          background: rgba(124,58,237,0.03);
        }
        .pl-hero-drop p {
          font-size: 14px; color: ${T.textSoft};
        }
        .pl-hero-drop input { display: none; }
      `}</style>

      <div className="pl-root">
        {/* Nav */}
        <nav className="pl-nav">
          <div className="pl-nav-left">
            <div className="pl-nav-logo-icon">P</div>
            <span className="pl-nav-logo">Plainly</span>
          </div>
          <div className="pl-nav-links">
            <a href="#" className="active">Home</a>
            <a href="#how">How it works</a>
            <a href="#school">For schools</a>
            <a href="#pricing">Pricing</a>
            <a href="#resources">Resources ▾</a>
          </div>
          <div className="pl-nav-right">
            <a href="#" className="pl-nav-login">Log in</a>
            <button className="pl-nav-cta" onClick={onGetStarted}>Get started</button>
          </div>
        </nav>

        {/* Hero */}
        <section className="pl-hero">
          <div>
            <div className="pl-hero-badge">🔒 Completely Free. No Signups. No Data Retention.</div>
            <h1>We turn complicated documents into plain English.</h1>
            <p className="pl-hero-sub">
              We help remove preventable barriers so more people can participate and succeed.
            </p>
            <div className="pl-hero-actions">
              <button className="pl-btn-primary" onClick={onGetStarted}>✦ Try a document today</button>
            </div>
          </div>

          {/* Demo card — stacked */}
          <div className="pl-demo-card">
            <div className="pl-demo-header">
              <span className="pl-demo-header-left">From complicated</span>
              <span style={{ fontSize: 18 }}>🔄</span>
              <span className="pl-demo-header-right">To easier to read</span>
            </div>
            <div className="pl-demo-stacked">
              <div className="pl-demo-msg-box">
                <div className="pl-demo-msg-label">📄 Original</div>
                <p className="pl-demo-original-text">
                  "The tenant shall be liable for all costs of maintenance and repair, notwithstanding any provision to the contrary."
                </p>
                <div className="pl-demo-tag pl-demo-tag-hard">📖 Hard to read</div>
              </div>

              <div className="pl-demo-arrow-row">
                <div className="pl-demo-arrow-btn">↓</div>
              </div>

              <div className="pl-demo-msg-box plain">
                <div className="pl-demo-msg-label">☀️ Plain English</div>
                <p className="pl-demo-plain-text">
                  You pay for all repairs — even if other parts of the agreement say something different.
                </p>
                <div className="pl-demo-tag pl-demo-tag-easy">✅ Easier to read</div>
              </div>
            </div>
          </div>
        </section>

        {/* Support section */}
        <section className="pl-support-section" id="how">
          <div className="pl-support-icon">💜</div>
          <h2>Support that meets you where you are.</h2>
          <p>Plainly is here to make documents easier — at home, at school, and everywhere in between.</p>

          <div className="pl-cards-grid">
            <div className="pl-feature-card">
              <div className="pl-feature-card-icon" style={{ background: T.purplePale }}>📄</div>
              <h3>Simplify documents in seconds</h3>
              <p>Upload any document and get a clear, plain English version that's easier to read and understand.</p>
              <a href="#" className="pl-feature-card-link">Learn more →</a>
            </div>
            <div className="pl-feature-card">
              <div className="pl-feature-card-icon" style={{ background: T.pinkPale }}>🎒</div>
              <h3>Made for students and schools</h3>
              <p>Plainly supports learning by making school forms, policies and letters easier for students and families.</p>
              <a href="#" className="pl-feature-card-link">Learn more →</a>
            </div>
            <div className="pl-feature-card">
              <div className="pl-feature-card-icon" style={{ background: T.bluePale }}>🧑‍🤝‍🧑</div>
              <h3>Accessible for everyone</h3>
              <p>Designed for people who benefit from clearer language, including neurodivergent readers, ESL users and more.</p>
              <a href="#" className="pl-feature-card-link">Learn more →</a>
            </div>
            <div className="pl-feature-card">
              <div className="pl-feature-card-icon" style={{ background: T.pinkPale }}>🛡️</div>
              <h3>Safe, supportive and private</h3>
              <p>Your privacy comes first. We don't store your documents and your information is always safe.</p>
              <a href="#" className="pl-feature-card-link">Learn more →</a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pl-cta-section" id="try">
          <div>
            <h2>Because everyone deserves to feel in the loop.</h2>
            <p>Plainly believes that clarity creates confidence. We're here to help you understand, participate and feel supported every step of the way.</p>
            <div className="pl-cta-actions">
              <button className="pl-btn-primary" onClick={onGetStarted}>💜 See how Plainly can help</button>
              <a href="#how" className="pl-cta-link">How it works →</a>
            </div>
          </div>
          <div className="pl-cta-illustration">
            <div style={{ textAlign: "center", color: T.textSoft }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>📝💜</div>
              <p style={{ fontSize: 14 }}>Making documents clearer for everyone</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pl-footer">
          <div className="pl-footer-inner">
            <div className="pl-footer-left">
              🔒 Plainly is a purpose-led tool created to make information clearer and more inclusive for all.
            </div>
            <div className="pl-footer-right">
              <span>🔒 Private by design</span>
              <span>👥 No data retention</span>
              <span>💜 Human-first technology</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ─── App page — the tool ─── */
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
  const [docMode, setDocMode]       = useState("general");
  const [readingAge, setReadingAge] = useState("7-8");
  const [readingLevel, setReadingLevel] = useState(3);

  // controls
  const [zoom, setZoom]             = useState(1.0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  // reader settings
  const [readerTextSize, setReaderTextSize]     = useState("standard");
  const [readerLineSpacing, setReaderLineSpacing] = useState("standard");
  const [readerFont, setReaderFont]             = useState("lexend");
  const [readerBgTint, setReaderBgTint]         = useState("cream");
  const [readerMoreSpace, setReaderMoreSpace]   = useState(false);
  const [readerReduceMotion, setReaderReduceMotion] = useState(false);
  const [showReaderSettings, setShowReaderSettings] = useState(false);

  // rubber-band selection
  const [selection, setSelection]   = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [dragStart, setDragStart]   = useState(null);
  const [liveRect, setLiveRect]     = useState(null);
  const [screenSel, setScreenSel]   = useState(null);
  const pageImgRefs                 = useRef([]);
  const docViewerRef                = useRef(null);
  const [dragPageIdx, setDragPageIdx] = useState(0);
  const draggingRef                 = useRef(false);
  const dragStartRef                = useRef(null);
  const dragPageIdxRef              = useRef(0);

  // output
  const [result, setResult]         = useState(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showChecklistInline, setShowChecklistInline] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  // audio
  const [audioSpeed, setAudioSpeed]             = useState(1);
  const [isPlaying, setIsPlaying]               = useState(false);
  const [currentCharRange, setCurrentCharRange] = useState(null);
  const utterRef                                = useRef(null);
  const [voices, setVoices]                     = useState([]);
  const [voiceName, setVoiceName]               = useState("");

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

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

  /* Reader settings computed styles */
  const readerStyles = useMemo(() => {
    const sizes = { standard: 16, medium: 18, large: 20, "extra-large": 23 };
    const lineHeights = { standard: 1.6, relaxed: 1.8, "extra-relaxed": 2.1 };
    const fonts = {
      lexend: "'Lexend', 'Open Sans', Arial, sans-serif",
      "open-sans": "'Open Sans', Arial, sans-serif",
      "simple": "Arial, Helvetica, sans-serif",
    };
    const bgs = {
      cream: "#FFF9F0",
      blue: "#EFF6FF",
      lilac: "#F3E8FF",
      grey: "#F3F4F6",
    };
    return {
      fontSize: sizes[readerTextSize] || 16,
      lineHeight: lineHeights[readerLineSpacing] || 1.6,
      fontFamily: fonts[readerFont] || fonts.lexend,
      background: bgs[readerBgTint] || bgs.cream,
      padding: readerMoreSpace ? "28px" : "18px",
      gap: readerMoreSpace ? "24px" : "16px",
    };
  }, [readerTextSize, readerLineSpacing, readerFont, readerBgTint, readerMoreSpace]);

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

  // rubber-band
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

  // client-side crop
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

  // simplify
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

  // speech
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

  // clickable words
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
            style={{ background: isHi ? "#FDE68A" : "transparent", borderRadius: isHi ? 3 : 0 }}>
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

  // Determine current step for progress indicator
  const currentStep = result ? 3 : file ? 2 : 1;

  // left panel
  function renderLeft() {
    if (!file) return (
      <div className="drop-zone"
        onDragEnter={e=>e.preventDefault()} onDragOver={e=>e.preventDefault()}
        onDragLeave={e=>e.preventDefault()} onDrop={handleDrop}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <strong>Drop a document here</strong>
          <p>PDF, JPG or PNG accepted</p>
          <input id="file-input" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={handleBrowse} />
          <label htmlFor="file-input" className="browse-btn">Browse files</label>
        </div>
      </div>
    );

    if (!isPdf) return (
      <div className="doc-page-area">
        <img src={previewUrl} alt="Uploaded document" style={{ width: `${zoom*100}%`, display: "block" }} />
      </div>
    );

    if (loading && pages.length === 0) return <div className="doc-loading">Reading PDF…</div>;
    if (!currentPage) return null;

    return (
      <>
        <div className="doc-toolbar" role="toolbar">
          <button className="btn btn-ghost" style={{ height:32, padding:'0 12px', fontSize:13 }}
            onClick={() => setZoom(z=>Math.max(0.4,+(z-0.2).toFixed(1)))}>−</button>
          <span className="tool-label">{Math.round(zoom*100)}%</span>
          <button className="btn btn-ghost" style={{ height:32, padding:'0 12px', fontSize:13 }}
            onClick={() => setZoom(z=>Math.min(3.0,+(z+0.2).toFixed(1)))}>+</button>
          <div className="tool-sep" />
          <span className="tool-label">{pageIdx+1} / {pages.length}</span>
        </div>

        <div className="doc-body" style={pages.length <= 1 ? { gridTemplateColumns: '1fr' } : undefined}>
          {pages.length > 1 && (
            <div className="thumb-col">
              {pages.map((p, i) => (
                <div key={i} className={`thumb${i === pageIdx ? " active" : ""}`}
                  tabIndex={0}
                  onClick={() => {
                    setPageIdx(i);
                    docViewerRef.current?.querySelectorAll(".page-wrap-outer")[i]?.scrollIntoView({ behavior: "smooth" });
                  }}>
                  <img src={`data:image/png;base64,${p.image_base64}`} alt={`Page ${i+1}`}
                    style={{ width:'100%', display:'block', borderRadius:'6px 6px 0 0' }} />
                  <div className="thumb-n">{i+1}</div>
                </div>
              ))}
            </div>
          )}

          <div className="doc-page-area" ref={docViewerRef}
            onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
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
                <div className="page-wrap" style={{ width: `${zoom * 100}%` }}
                  onMouseDown={e => onMouseDown(e, i)}>
                  <img ref={el => { pageImgRefs.current[i] = el; }}
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
              </div>
            ))}

            {selection && (
              <div className="simplify-float">
                <button className="btn btn-primary" onClick={handleSimplify} disabled={loading}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.6L8 1z" fill="#fff" opacity=".9"/></svg>
                  {loading ? "Simplifying…" : "Simplify this selection"}
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── render ─────────────
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
      <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .app-shell {
          --bg: #eaf1f8; --bg2: #f0eaf8; --shell: #f7f5fa;
          --surface: #ffffff; --panel-doc: #fdfcfb; --panel-result: #fffdf7;
          --border: rgba(90,50,130,.13); --divider: rgba(90,50,130,.10);
          --text: #2b2530; --muted: #6f677a; --faint: #b0a8b8;
          --accent: #8a56b0; --accent-dark: #6e3f96; --accent-soft: #f2e8fa;
          --shadow-sm: 0 1px 4px rgba(60,20,90,.07);
          --shadow-md: 0 4px 18px rgba(60,20,90,.10);
          --shadow-lg: 0 10px 40px rgba(60,20,90,.13);
          --r-sm: 8px; --r-md: 14px; --r-lg: 20px; --r-xl: 26px;
          --font-h: 'Lexend', system-ui, sans-serif;
          --font-b: 'Open Sans', system-ui, sans-serif;
          --green: #2e9e6e;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; }
        html, body, #root { height: 100%; }
        .app-shell {
          display: flex; flex-direction: column; height: 100vh;
          font-family: var(--font-b); font-size: 16px; color: var(--text);
          background: linear-gradient(135deg, var(--bg) 0%, var(--bg2) 100%);
          line-height: 1.55;
        }
        button { font: inherit; cursor: pointer; border: none; background: none; }

        /* TOP NAV */
        /* Main nav (matches landing page) */
        .main-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 36px; height: 56px;
          background: rgba(255,255,255,.95); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(90,50,130,.08);
          flex-shrink: 0; z-index: 201;
        }
        .main-nav-left { display: flex; align-items: center; gap: 8px; text-decoration: none; cursor: pointer; }
        .main-nav-logo {
          width: 30px; height: 30px; border-radius: 8px;
          background: #7C3AED; color: white;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px;
        }
        .main-nav-name { font-family: var(--font-h); font-size: 20px; font-weight: 700; color: var(--text); }
        .main-nav-links { display: flex; gap: 24px; align-items: center; }
        .main-nav-links a {
          font-size: 13.5px; color: var(--muted); text-decoration: none;
          font-weight: 500; transition: color .15s;
        }
        .main-nav-links a:hover { color: var(--accent); }
        .main-nav-right { display: flex; gap: 10px; align-items: center; }
        .main-nav-login {
          font-size: 13.5px; color: var(--muted); font-weight: 500;
          text-decoration: none; padding: 6px 14px;
        }
        .main-nav-cta {
          background: #7C3AED; color: white;
          padding: 8px 18px; border-radius: 18px;
          font-size: 13px; font-weight: 600;
          text-decoration: none; border: none; cursor: pointer;
          font-family: inherit; transition: background .2s;
        }
        .main-nav-cta:hover { background: #6D28D9; }

        .topnav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 56px;
          background: rgba(255,255,255,.9); backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 200; flex-shrink: 0;
        }
        .logo { display: flex; align-items: center; gap: 9px; font-family: var(--font-h); font-weight: 700; font-size: 17px; color: var(--text); text-decoration: none; }
        .logo-mark {
          width: 30px; height: 30px; border-radius: 9px;
          background: linear-gradient(135deg, #c89de0, var(--accent));
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 14px; font-family: var(--font-h);
        }
        .steps { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--muted); }
        .step-dot {
          width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          background: #e8e4ef; color: var(--muted);
        }
        .step-dot.done { background: var(--green); color: #fff; }
        .step-dot.active { background: var(--accent); color: #fff; }
        .step-line-seg { width: 36px; height: 2px; background: var(--divider); border-radius: 2px; }
        .step-line-seg.done { background: var(--green); }
        .nav-actions { display: flex; align-items: center; gap: 8px; }

        /* BUTTON SYSTEM */
        .btn {
          display: inline-flex; align-items: center; gap: 7px;
          height: 36px; padding: 0 16px; border-radius: 999px;
          font-family: var(--font-b); font-size: 13.5px; font-weight: 600;
          transition: background .15s, transform .1s, box-shadow .15s;
          white-space: nowrap;
        }
        .btn:active { transform: scale(.97); }
        .btn-primary { background: var(--accent); color: #fff; border: none; box-shadow: 0 2px 10px rgba(138,86,176,.30); }
        .btn-primary:hover { background: var(--accent-dark); box-shadow: 0 4px 16px rgba(138,86,176,.38); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-soft { background: var(--accent-soft); color: var(--accent); border: 1.5px solid rgba(138,86,176,.25); }
        .btn-soft:hover { background: #e8d8f8; border-color: var(--accent); }
        .btn-ghost { background: transparent; color: var(--muted); border: 1.5px solid var(--border); }
        .btn-ghost:hover { background: #f0ecf5; color: var(--text); border-color: rgba(138,86,176,.3); }

        /* OUTER SHELL */
        .page-pad { padding: 20px 24px 32px; flex: 1; overflow: hidden; display: flex; flex-direction: column; }
        .outer-shell {
          background: var(--shell); border: 1px solid var(--border);
          border-radius: var(--r-xl); box-shadow: var(--shadow-lg);
          display: grid; grid-template-columns: 1fr 1px 1fr;
          flex: 1; overflow: hidden;
        }
        .shell-divider { background: var(--border); align-self: stretch; }

        /* LEFT: DOCUMENT PANEL */
        .doc-panel { display: flex; flex-direction: column; overflow: hidden; }
        .doc-toolbar {
          display: flex; align-items: center; gap: 4px;
          padding: 10px 14px; border-bottom: 1px solid var(--border);
          background: rgba(255,255,255,.6); flex-shrink: 0; flex-wrap: wrap;
        }
        .tool-sep { width: 1px; height: 18px; background: var(--border); margin: 0 2px; }
        .tool-label { font-size: 12.5px; font-weight: 600; color: var(--muted); padding: 0 4px; }
        .doc-body { display: grid; grid-template-columns: 80px 1fr; flex: 1; overflow: hidden; }
        .thumb-col {
          background: rgba(240,235,248,.5); border-right: 1px solid var(--border);
          padding: 10px 8px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto;
        }
        .thumb {
          width: 100%; background: var(--surface); border: 1px solid var(--border);
          border-radius: 7px; cursor: pointer; overflow: hidden; flex-shrink: 0;
          transition: box-shadow .12s, border-color .12s;
        }
        .thumb.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
        .thumb-n { font-size: 10px; font-weight: 600; color: var(--muted); text-align: center; padding: 2px 0; background: rgba(240,235,248,.7); }
        .doc-page-area {
          padding: 28px 26px 100px; overflow-y: auto;
          background: var(--panel-doc); position: relative;
        }
        .page-wrap-outer { display: flex; flex-direction: column; align-items: center; padding: 16px; width: 100%; }
        .page-wrap {
          position: relative; cursor: crosshair; user-select: none;
          background: white; box-shadow: var(--shadow-md);
          border-radius: 4px; overflow: hidden; margin: 0 auto;
        }
        .rubberband {
          position: absolute; border: 2px dashed var(--accent);
          background: rgba(138,86,176,.08); pointer-events: none; border-radius: 2px;
        }
        .rubberband-done { border-style: solid; background: rgba(138,86,176,.12); }
        .simplify-float {
          position: sticky; bottom: 16px;
          display: flex; justify-content: center; padding: 0 20px; pointer-events: none;
        }
        .simplify-float .btn { pointer-events: all; font-size: 14.5px; height: 44px; padding: 0 28px; box-shadow: 0 6px 24px rgba(138,86,176,.35); }

        /* Drop zone */
        .drop-zone {
          flex: 1; display: flex; align-items: center; justify-content: center;
          border: 2px dashed var(--border); margin: 20px; border-radius: var(--r-md);
          background: rgba(255,255,255,.5); text-align: center; padding: 48px 24px;
          transition: border-color 0.2s, background 0.2s;
        }
        .drop-zone:hover { border-color: var(--accent); background: rgba(138,86,176,.03); }
        .drop-zone strong { color: var(--text); font-size: 18px; font-weight: 600; display: block; margin-bottom: 8px; }
        .drop-zone p { color: var(--muted); font-size: 14px; margin-bottom: 20px; }
        .drop-zone input { display: none; }
        .browse-btn {
          display: inline-block; padding: 12px 28px;
          background: var(--accent); color: white; border-radius: 999px;
          cursor: pointer; font-size: 15px; font-weight: 600; font-family: inherit;
          transition: background 0.2s;
        }
        .browse-btn:hover { background: var(--accent-dark); }
        .doc-loading { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--muted); font-size: 16px; }

        /* RIGHT: RESULT PANEL */
        .result-panel { display: flex; flex-direction: column; background: var(--panel-result); overflow: hidden; }
        .result-topbar {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          padding: 12px 18px; border-bottom: 1px solid var(--border);
          background: rgba(255,255,255,.5); flex-shrink: 0;
        }
        .result-topbar-label {
          font-size: 12px; font-weight: 700; color: var(--faint);
          letter-spacing: .06em; text-transform: uppercase; margin-right: auto;
        }
        .result-scroll { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }

        /* Listen inline (under plain-english label) */
        .listen-inline {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 16px;
        }
        .listen-inline-label { font-size: 13px; font-weight: 500; color: var(--muted); white-space: nowrap; }
        .play-btn, .stop-btn {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: background .14s, transform .1s;
        }
        .play-btn { background: var(--accent); border: none; color: #fff; box-shadow: 0 2px 8px rgba(138,86,176,.3); }
        .play-btn:hover { background: var(--accent-dark); }
        .play-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .stop-btn { background: transparent; color: var(--muted); border: 1.5px solid var(--border); }
        .stop-btn:hover { background: #ede8f5; color: var(--text); }
        .stop-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .voice-sel {
          height: 30px; border-radius: 999px; border: 1.5px solid var(--border);
          background: var(--surface); color: var(--text);
          padding: 0 10px; font: inherit; font-size: 12px; cursor: pointer;
          max-width: 120px;
        }

        /* Simplified area */
        .simplified-area { padding: 24px 22px; flex: 1; }
        .bubble-label {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--accent); color: #fff;
          font-family: var(--font-h); font-size: 12px; font-weight: 600;
          padding: 5px 14px 5px 12px; border-radius: 999px 999px 999px 4px;
          margin-bottom: 16px; letter-spacing: .02em;
        }
        .result-section { margin-bottom: 20px; }
        .result-section:last-child { margin-bottom: 0; }
        .r-h { font-family: var(--font-h); font-size: 15px; font-weight: 600; margin-bottom: 8px; color: var(--text); }
        .r-p { font-size: 15.5px; line-height: 1.65; color: var(--text); }

        /* Checklist */
        .checklist-box {
          background: rgba(240,235,248,.55); border: 1px solid rgba(138,86,176,.15);
          border-radius: var(--r-md); padding: 14px 16px; margin-top: 4px;
        }
        .chk-list { list-style: none; padding: 0; display: grid; gap: 9px; }
        .chk-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: var(--text); line-height: 1.5; }
        .chk {
          width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0; margin-top: 1px;
          border: 1.5px solid var(--border); background: var(--surface); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .12s, border-color .12s;
          color: transparent; font-size: 11px; font-weight: 700;
        }
        .chk:hover { border-color: var(--accent); }
        .chk.ticked { background: var(--accent); border-color: var(--accent); color: #fff; }

        /* Flags */
        .flags-row { display: flex; flex-direction: column; gap: 6px; }
        .flag-chip {
          display: inline-flex; align-items: flex-start; gap: 8px;
          padding: 10px 14px; font-size: 14px;
          background: rgba(255,253,247,.8); color: var(--text);
          border: 1px solid rgba(138,86,176,.12); border-radius: var(--r-sm); line-height: 1.5;
        }

        /* Reading support card (top of result panel) */
        .reading-support-card {
          padding: 18px 20px; border-bottom: 1px solid var(--border);
          background: rgba(255,253,240,.6); flex-shrink: 0;
        }
        .rs-card-title {
          font-family: var(--font-h); font-size: 14px; font-weight: 600;
          color: var(--text); margin-bottom: 14px;
        }
        .rs-slider-group { display: flex; flex-direction: column; gap: 14px; }
        .rs-slider-row {
          display: flex; align-items: center; gap: 12px;
        }
        .rs-slider-label {
          font-size: 12.5px; font-weight: 600; color: var(--muted);
          min-width: 95px; flex-shrink: 0;
        }
        .rs-slider-wrap { flex: 1; display: flex; flex-direction: column; gap: 3px; }
        .rs-slider-ticks {
          display: flex; justify-content: space-between;
          font-size: 10.5px; color: var(--faint); padding: 0 2px;
        }
        .rs-slider-tick { text-align: center; }
        .rs-slider-tick.active { color: var(--accent); font-weight: 600; }
        input[type="range"].rs-range {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 6px; border-radius: 3px;
          background: linear-gradient(90deg, var(--accent-soft) 0%, var(--accent-soft) 100%);
          outline: none; cursor: pointer;
        }
        input[type="range"].rs-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--accent); border: 3px solid white;
          box-shadow: 0 1px 4px rgba(90,50,130,.3);
          cursor: pointer; transition: transform .12s;
        }
        input[type="range"].rs-range::-webkit-slider-thumb:hover { transform: scale(1.15); }
        input[type="range"].rs-range::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--accent); border: 3px solid white;
          box-shadow: 0 1px 4px rgba(90,50,130,.3); cursor: pointer;
        }

        /* Outer box around entire result content */
        .result-outer-box {
          border: 1.5px solid var(--border); border-radius: var(--r-lg);
          background: var(--surface); padding: 22px;
        }

        /* Inner box for the plain-English text */
        .plain-english-box {
          border: 1.5px solid rgba(138,86,176,.15); border-radius: var(--r-md);
          background: rgba(250,248,255,.5); padding: 20px;
          margin-bottom: 20px;
        }

        /* Bottom action buttons */
        .bottom-actions {
          display: flex; gap: 8px; flex-wrap: wrap; margin-top: 20px;
          padding-top: 16px; border-top: 1px solid var(--border);
        }
        .action-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 18px; border-radius: 999px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all .15s; border: 1.5px solid var(--border);
          background: var(--surface); color: var(--muted); font-family: inherit;
        }
        .action-btn:hover { border-color: var(--accent); color: var(--accent); }
        .action-btn.on { background: var(--accent); color: #fff; border-color: var(--accent); }
        .action-btn-icon { font-size: 15px; }

        /* Prompts button */
        .prompts-btn {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 12px 16px; border-radius: var(--r-md);
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: all .15s; border: 1.5px solid var(--border);
          background: var(--surface); color: var(--text); font-family: inherit;
          margin-bottom: 20px;
        }
        .prompts-btn:hover { border-color: var(--accent); background: rgba(242,232,250,.3); }
        .prompts-btn.on { border-color: var(--accent); background: rgba(242,232,250,.3); }
        .prompts-content {
          border: 1.5px solid rgba(138,86,176,.15); border-radius: var(--r-md);
          background: rgba(242,232,250,.2); padding: 16px;
          margin-bottom: 20px; font-size: 14px; line-height: 1.6; color: var(--text);
        }

        /* Mode toggle */
        .mode-toggle { display: flex; gap: 2px; background: rgba(240,235,248,.5); padding: 3px; border-radius: 999px; }
        .mode-btn {
          flex: 1; padding: 8px 12px; background: transparent; color: var(--muted);
          border: none; font-size: 13px; font-weight: 500;
          cursor: pointer; border-radius: 999px; transition: all 0.15s; font-family: inherit;
        }
        .mode-btn:hover:not(.mode-active) { background: white; color: var(--text); }
        .mode-active { background: var(--accent) !important; color: white !important; }
        .age-selector {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          padding: 12px; background: var(--accent-soft); border-radius: var(--r-md);
        }
        .age-btn {
          padding: 6px 14px; border: 1px solid var(--border); background: white; color: var(--muted);
          font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 999px;
          transition: all 0.15s; font-family: inherit;
        }
        .age-btn:hover { border-color: var(--accent); color: var(--accent); }
        .age-active { border-color: var(--accent) !important; background: var(--accent) !important; color: white !important; }

        /* Crop preview */
        .crop-preview {
          overflow: hidden; position: relative;
          border: 2px solid var(--accent); border-radius: var(--r-sm); width: 100%;
        }

        /* Empty result */
        .empty-result {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center; padding: 60px 24px; flex: 1;
        }
        .empty-result-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }

        /* Instruction box (settings state) */
        .instruction-box-wrap {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .instruction-box {
          background: var(--accent-soft);
          border: 1.5px solid rgba(138,86,176,.15);
          border-radius: var(--r-lg);
          padding: 40px 32px;
          text-align: center;
          width: 100%; max-width: 460px;
        }
        .instruction-box-icon { font-size: 40px; margin-bottom: 14px; opacity: 0.7; }
        .instruction-box-text {
          font-family: var(--font-h); font-size: 16px; font-weight: 500;
          color: var(--text); line-height: 1.5; margin-bottom: 24px;
        }
        .instruction-box .btn-primary {
          margin: 0 auto;
        }

        /* Word click */
        .word-click { cursor: pointer; transition: background 0.1s; border-radius: 2px; }
        .word-click:hover { text-decoration: underline; text-decoration-color: var(--accent); text-decoration-thickness: 2px; }
        .bullet-line { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
        .bullet-dot { flex-shrink: 0; color: var(--accent); font-size: 20px; line-height: 1.4; }
        .bullet-text { flex: 1; overflow-wrap: break-word; word-break: break-word; }

        /* Reader settings bar */
        .reader-settings-bar {
          background: var(--accent-soft); border-bottom: 1px solid rgba(138,86,176,.18);
          padding: 14px 18px; display: flex; align-items: center; gap: 16px;
          flex-shrink: 0; flex-wrap: wrap;
        }
        .rs-group-label { font-size: 12.5px; font-weight: 600; color: var(--muted); min-width: 56px; }
        .rs-options { display: flex; gap: 2px; }
        .rs-option {
          padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 500;
          border: 1.5px solid var(--border); background: white; color: var(--muted);
          cursor: pointer; font-family: inherit; transition: all 0.15s;
        }
        .rs-option:hover { border-color: var(--accent); }
        .rs-option.active { background: var(--accent); color: white; border-color: var(--accent); }
        .rs-tint {
          width: 28px; height: 28px; border-radius: 50%;
          border: 2px solid var(--border); cursor: pointer; transition: border-color 0.15s;
        }
        .rs-tint:hover { border-color: var(--accent); }
        .rs-tint.active { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(138,86,176,.2); }
        .rs-reset {
          margin-left: auto; font-size: 13px; color: var(--muted);
          background: none; border: none; cursor: pointer; font-family: inherit;
        }
        .rs-reset:hover { color: var(--accent); }

        /* Responsive */
        @media(max-width:1050px) {
          .outer-shell { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
          .shell-divider { height: 1px; width: auto; }
          .doc-panel, .result-panel { min-height: 500px; }
        }
        @media(max-width:600px) {
          .page-pad { padding: 12px; }
          .result-topbar { gap: 6px; }
          .steps { display: none; }
        }
        @media print {
          .no-print { display: none !important; }
          .doc-panel, .shell-divider { display: none !important; }
          .outer-shell { display: block; }
          .result-panel { width: 100%; background: white; overflow: visible; }
          .app-shell { height: auto; }
          .print-warning { display: block !important; border: 2px dashed red; padding: 10px; color: red; font-weight: 700; }
        }
        .print-warning { display: none; }
      `}</style>

      {/* MAIN NAV (same as landing page) */}
      <nav className="main-nav no-print">
        <a className="main-nav-left" href="/" onClick={e => { e.preventDefault(); reset(); setShowLanding(true); }}>
          <div className="main-nav-logo">P</div>
          <span className="main-nav-name">Plainly</span>
        </a>
        <div className="main-nav-links">
          <a href="#" onClick={e => { e.preventDefault(); reset(); setShowLanding(true); }}>Home</a>
          <a href="#how">How it works</a>
          <a href="#schools">For schools</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
        </div>
        <div className="main-nav-right">
          <a href="#" className="main-nav-login">Log in</a>
          <button className="main-nav-cta" onClick={() => { reset(); setShowLanding(true); }}>Get started</button>
        </div>
      </nav>

      {/* APP NAV */}
      <header className="topnav no-print">
        <a href="/" className="logo" onClick={e => { e.preventDefault(); reset(); setShowLanding(true); }}>
          <div className="logo-mark">P</div>
          Plainly
        </a>

        <div className="steps">
          <div className={`step-dot ${currentStep > 1 ? 'done' : currentStep === 1 ? 'active' : ''}`}>
            {currentStep > 1 ? (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : '1'}
          </div>
          <span style={{ fontSize:13, fontWeight: currentStep===1 ? 600 : 400, color: currentStep===1 ? 'var(--text)' : undefined }}>Upload</span>
          <div className={`step-line-seg ${currentStep > 1 ? 'done' : ''}`} />
          <div className={`step-dot ${currentStep > 2 ? 'done' : currentStep === 2 ? 'active' : ''}`}>
            {currentStep > 2 ? (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : '2'}
          </div>
          <span style={{ fontSize:13, fontWeight: currentStep===2 ? 600 : 400, color: currentStep===2 ? 'var(--text)' : undefined }}>Settings</span>
          <div className={`step-line-seg ${currentStep > 2 ? 'done' : ''}`} />
          <div className={`step-dot ${currentStep === 3 ? 'active' : ''}`}>3</div>
          <span style={{ fontSize:13, fontWeight: currentStep===3 ? 600 : 400, color: currentStep===3 ? 'var(--text)' : undefined }}>Result</span>
        </div>

        <div className="nav-actions">
          {error && <span style={{ fontSize:13, color:'#DC2626' }}>⚠ {error}</span>}
          <button className="btn btn-ghost" onClick={() => setShowReaderSettings(!showReaderSettings)}
            style={showReaderSettings ? { background:'var(--accent-soft)', borderColor:'var(--accent)', color:'var(--accent)' } : {}}>
            Reader settings
          </button>
          {file && (
            <button className="btn btn-soft" onClick={reset}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Load new document
            </button>
          )}
        </div>
      </header>

      {/* Reader settings bar */}
      {showReaderSettings && (
        <div className="reader-settings-bar no-print">
          <span className="rs-group-label">Text size</span>
          <div className="rs-options">
            {[["standard","Aa",12],["medium","Aa",14],["large","Aa",16],["extra-large","Aa",18]].map(([val,label,sz]) => (
              <button key={val} className={`rs-option${readerTextSize===val?' active':''}`}
                style={{ fontSize:sz }} onClick={() => setReaderTextSize(val)}>{label}</button>
            ))}
          </div>
          <span className="rs-group-label">Font</span>
          <div className="rs-options">
            <button className={`rs-option${readerFont==='lexend'?' active':''}`}
              style={{ fontFamily:"'Lexend',sans-serif" }} onClick={() => setReaderFont('lexend')}>Aa</button>
            <button className={`rs-option${readerFont==='open-sans'?' active':''}`}
              style={{ fontFamily:"'Open Sans',sans-serif" }} onClick={() => setReaderFont('open-sans')}>Aa</button>
            <button className={`rs-option${readerFont==='simple'?' active':''}`}
              style={{ fontFamily:"Arial,sans-serif" }} onClick={() => setReaderFont('simple')}>Aa</button>
          </div>
          <span className="rs-group-label">Spacing</span>
          <div className="rs-options">
            {[["standard","≡"],["relaxed","≡"],["extra-relaxed","≡"]].map(([val,label]) => (
              <button key={val} className={`rs-option${readerLineSpacing===val?' active':''}`}
                onClick={() => setReaderLineSpacing(val)}>{label}</button>
            ))}
          </div>
          <span className="rs-group-label">Background</span>
          <div className="rs-options" style={{ gap: 6 }}>
            {[["cream","#F5D0C5"],["blue","#C7D2FE"],["lilac","#DDD6FE"],["grey","#D1FAE5"]].map(([val,color]) => (
              <button key={val} className={`rs-tint${readerBgTint===val?' active':''}`}
                style={{ background:color }} onClick={() => setReaderBgTint(val)} />
            ))}
          </div>
          <button className="rs-reset" onClick={() => {
            setReaderTextSize('standard'); setReaderLineSpacing('standard');
            setReaderFont('lexend'); setReaderBgTint('cream');
          }}>↻ Reset</button>
        </div>
      )}

      {/* PAGE */}
      <div className="page-pad">
        <div className="outer-shell">

          {/* LEFT: DOCUMENT */}
          <section className="doc-panel" aria-label="Original document">
            {renderLeft()}
          </section>

          <div className="shell-divider" aria-hidden="true" />

          {/* RIGHT: RESULT */}
          <section className="result-panel" aria-label="Plain-English result">

            {/* Reading support card */}
            {result && (
              <div className="reading-support-card no-print">
                <div className="rs-card-title">Reading support</div>
                <div className="rs-slider-group">
                  <div className="rs-slider-row">
                    <span className="rs-slider-label">Year level</span>
                    <div className="rs-slider-wrap">
                      <input type="range" className="rs-range" min="1" max="4"
                        value={readingAge === "5-6" ? 1 : readingAge === "7-8" ? 2 : readingAge === "9-10" ? 3 : 4}
                        onChange={e => {
                          const v = +e.target.value;
                          setReadingAge(v === 1 ? "5-6" : v === 2 ? "7-8" : v === 3 ? "9-10" : "11-12");
                        }} />
                      <div className="rs-slider-ticks">
                        {["Year 1–2","Year 3–4","Year 5–6","Year 7–8"].map((t,i) => (
                          <span key={i} className={`rs-slider-tick${(readingAge === "5-6" && i===0)||(readingAge === "7-8" && i===1)||(readingAge === "9-10" && i===2)||(readingAge === "11-12" && i===3) ? ' active' : ''}`}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rs-slider-row">
                    <span className="rs-slider-label">Reading level</span>
                    <div className="rs-slider-wrap">
                      <input type="range" className="rs-range" min="1" max="5"
                        value={readingLevel}
                        onChange={e => setReadingLevel(+e.target.value)} />
                      <div className="rs-slider-ticks">
                        {["Simple","Easy","Standard","Detailed","Advanced"].map((t,i) => (
                          <span key={i} className={`rs-slider-tick${readingLevel === i+1 ? ' active' : ''}`}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll container */}
            <div className="result-scroll">

              {/* Main content area */}
              <div className="simplified-area" style={{
                fontFamily: readerStyles.fontFamily,
                fontSize: readerStyles.fontSize,
                lineHeight: readerStyles.lineHeight,
              }}>

                {result ? (
                  <div className="result-outer-box">
                    {/* Plain-English version label */}
                    <div className="bubble-label">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.6 3.2L12 5l-2.6 2.5.6 3.7L7 9.5l-3 1.7.6-3.7L2 5l3.4-.8L7 1z" fill="#fff" opacity=".9"/></svg>
                      Plain-English version
                    </div>

                    {/* Listen controls — inline under label */}
                    <div className="listen-inline no-print" aria-label="Listen controls">
                      <span className="listen-inline-label">Listen to this version</span>
                      <button className="play-btn" onClick={isPlaying ? pauseResume : speak} disabled={!speechInfo.fullText}>
                        {isPlaying ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2" y="1" width="3" height="10" rx="1" fill="#fff"/><rect x="7" y="1" width="3" height="10" rx="1" fill="#fff"/></svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polygon points="2,1 11,6 2,11" fill="#fff"/></svg>
                        )}
                      </button>
                      <button className="stop-btn" onClick={stopSpeech} disabled={!isPlaying}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="8" rx="1.5" fill="currentColor"/></svg>
                      </button>
                      {voices.length > 0 && (
                        <select className="voice-sel" value={voiceName} onChange={e => setVoiceName(e.target.value)}>
                          {voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                        </select>
                      )}
                    </div>

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
                        <p style={{ color:'var(--muted)', fontStyle:'italic' }}>
                          Prompts and examples for this document will appear here.
                        </p>
                      </div>
                    )}

                    {/* Important details */}
                    {result?.flags && Object.values(result.flags).some(v => v?.length > 0) && (
                      <div className="result-section">
                        <h2 className="r-h">Important details</h2>
                        <div className="flags-row">
                          {result.flags.deadlines?.map((d,i) => <span key={i} className="flag-chip">📅 {d}</span>)}
                          {result.flags.amounts?.map((a,i) => <span key={i} className="flag-chip">💰 {a}</span>)}
                          {result.flags.documents_needed?.map((d,i) => <span key={i} className="flag-chip">📄 {d}</span>)}
                        </div>
                      </div>
                    )}

                    {/* Checklist — at bottom */}
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

                    {/* Print — at very bottom */}
                    <div className="bottom-actions no-print">
                      <button className="action-btn" onClick={() => window.print()}>
                        <span className="action-btn-icon">🖨️</span> Print plain-English support copy
                      </button>
                    </div>
                  </div>
                ) : !file ? (
                  <div className="empty-result">
                    <div className="empty-result-icon">📝</div>
                    <p style={{ fontFamily:'var(--font-h)', fontSize:18, fontWeight:600, color:'var(--text)', marginBottom:8 }}>
                      Your plain-English version will appear here.
                    </p>
                    <p style={{ fontSize:14, color:'var(--muted)', marginTop:8 }}>
                      Select the part of the document you want help with, then click Simplify.
                    </p>
                    <div style={{ marginTop:24, display:'flex', flexDirection:'column', gap:8, fontSize:14, color:'var(--muted)' }}>
                      <span>✅ We use clear, everyday language.</span>
                      <span>✅ We keep the meaning the same.</span>
                      <span>✅ You stay in control.</span>
                    </div>
                  </div>
                ) : (
                  <div className="instruction-box-wrap">
                    <div className="instruction-box">
                      <div className="instruction-box-icon">✏️</div>
                      <p className="instruction-box-text">
                        {isPdf && pages.length > 0 && !selection
                          ? "Draw a box around the text you want to simplify."
                          : selection
                            ? "Ready to simplify your selection."
                            : "Draw a box around the text you want to simplify."}
                      </p>
                      {file && (!isPdf || selection) && !result && (
                        <button className="btn btn-primary" style={{ height:48, fontSize:15, padding:'0 32px' }}
                          onClick={handleSimplify} disabled={loading}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.6L8 1z" fill="#fff" opacity=".9"/></svg>
                          {loading ? "Simplifying…" : "Simplify this section"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </section>

        </div>
      </div>

      <div className="print-warning">This is a personal helper note only — do not submit this to any agency.</div>
    </div>
  );
}
