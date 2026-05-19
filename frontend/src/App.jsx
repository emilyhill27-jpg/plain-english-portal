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

function AnimatedDemo({ step, accent = "#7C3AED", accentLight = "rgba(124,58,237,0.08)", accentHover = "#6D28D9" }) {
  const labels = [
    "Upload your document",
    "Select the confusing part",
    "Simplifying…",
    "Your plain English explanation",
  ];
  const lines = [90, 100, 75, 100, 85, 100, 60, 95, 80];

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <p style={{ fontSize: 15, color: accent, fontWeight: 700, marginBottom: 14, minHeight: 22 }}>
        {labels[step]}
      </p>

      {/* Mock document */}
      <div style={{ background: "#FFFFFF", borderRadius: 10, padding: "18px 20px", position: "relative", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {lines.map((w, i) => (
            <div key={i} style={{
              height: 10, background: "#E5E7EB", borderRadius: 4, width: `${w}%`,
              opacity: step === 0 ? (i < 4 ? 1 : 0.25) : 1,
              transition: "opacity 0.6s ease",
            }} />
          ))}
        </div>

        {/* Selection box — visible in steps 1, 2, 3 */}
        <div style={{
          position: "absolute", top: 38, left: 16, right: 16, height: 72,
          border: `2.5px dashed ${accent}`,
          borderRadius: 6,
          background: accentLight,
          opacity: step >= 1 ? 1 : 0,
          transition: "opacity 0.5s ease",
          pointerEvents: "none",
        }} />
      </div>

      {/* Simplify button */}
      <div style={{ textAlign: "right", marginTop: 12 }}>
        <span style={{
          display: "inline-block",
          background: step === 2 ? accentHover : accent,
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
        background: "#FFFFFF",
        borderRadius: 10,
        padding: 16,
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        opacity: step === 3 ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}>
        <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: accent }}>Plain English explanation</p>
        {[
          "This form asks for all the money you receive.",
          "Include wages, benefits, and any other payments.",
          "You must list every source — even small amounts.",
        ].map((t, i) => (
          <p key={i} style={{ fontSize: 13, color: "#111827", marginBottom: 7, lineHeight: 1.6 }}>• {t}</p>
        ))}
      </div>
    </div>
  );
}

function LandingPage({ onGetStarted, onFileUpload }) {
  const [activeTab, setActiveTab] = useState(0);
  const [hovering, setHovering] = useState(false);

  const samples = [
    {
      orig: '"Pursuant to section 102, you are required to provide evidence of accommodation costs within 10 working days, failing which your entitlement may be reviewed."',
      plain: 'They need proof of your rent or mortgage. Send it within <strong>10 working days</strong> (about 2 weeks). If you don\'t, they might change or stop your payment.',
      ex: 'A photo of your tenancy agreement, or a bank statement showing your rent payment.',
      tab: "WINZ letter",
    },
    {
      orig: '"We are writing to advise that a discrepancy has been identified in your income tax assessment for the period ending 31 March. You are required to substantiate your declared income."',
      plain: 'IRD found something that doesn\'t match in your tax return. They want you to prove how much money you earned that year.',
      ex: 'Payslips, a letter from your employer, or bank statements showing your income.',
      tab: "IRD notice",
    },
    {
      orig: '"Please indicate consent for your child to participate in the EOTC excursion. A non-refundable deposit is required by the due date specified herein."',
      plain: 'The school wants to take your child on a trip. You need to say yes or no, and pay a deposit by the date on the form. The deposit won\'t be given back if you cancel.',
      ex: 'Tick yes or no, sign the form, and return it with the payment before the date shown.',
      tab: "School form",
    },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,900;1,400;1,600&family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`
        .pl-root *, .pl-root *::before, .pl-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pl-root {
          --ink:       #1c1710;
          --ink-mid:   #3a2f22;
          --ink-soft:  #6b5c48;
          --cream:     #f6f0e6;
          --cream-mid: #ede4d4;
          --warm:      #fdfaf5;
          --terra:     #bf5030;
          --terra-mid: #d96b44;
          --terra-pale:#f5e8e2;
          --sage:      #4a6b4c;
          --gold:      #b07c20;
          --line:      #ddd0bb;
          --hero-bg:   #bf5030;
          --dark-bg:   #3D5C40;
          font-family: 'Atkinson Hyperlegible', system-ui, sans-serif;
          background: #ede4d4;
          color: var(--ink);
          font-size: 17px;
          line-height: 1.7;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }
        .pl-shell {
          max-width: 1400px;
          margin: 0 auto;
          background: #ffffff;
          box-shadow: 0 0 80px rgba(0,0,0,0.07);
          overflow: hidden;
        }
        .pl-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(253,250,245,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--line);
          padding: 0 48px;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
        }
        .pl-nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 900;
          color: var(--ink); text-decoration: none;
          letter-spacing: -0.02em;
        }
        .pl-nav-logo span { color: var(--terra); }
        .pl-nav-links { display: flex; gap: 32px; align-items: center; }
        .pl-nav-links a {
          font-size: 14px; color: var(--ink-soft);
          text-decoration: none; font-weight: 400;
          letter-spacing: 0.01em; transition: color 0.15s;
        }
        .pl-nav-links a:hover { color: var(--ink); }
        .pl-nav-cta {
          background: var(--ink) !important;
          color: var(--cream) !important;
          padding: 10px 22px !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          letter-spacing: 0.03em !important;
        }
        .pl-nav-cta:hover { background: var(--terra) !important; }

        .pl-hero {
          background: var(--hero-bg);
          color: var(--cream);
          padding: 96px 48px 80px;
          position: relative;
          overflow: hidden;
          min-height: 92vh;
          display: grid;
          grid-template-columns: 1fr 420px;
          align-items: center;
          gap: 64px;
        }
        .pl-hero::before {
          content: '';
          position: absolute; top: -200px; right: -200px;
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,0,0,0.12) 0%, transparent 65%);
          pointer-events: none;
        }
        .pl-hero-eyebrow {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(246,240,230,0.8);
          margin-bottom: 24px;
          display: flex; align-items: center; gap: 12px;
        }
        .pl-hero-eyebrow::before {
          content: ''; display: block;
          width: 32px; height: 1px;
          background: rgba(246,240,230,0.8);
        }
        .pl-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(44px, 5.5vw, 72px);
          font-weight: 900; line-height: 1.04;
          margin-bottom: 28px; letter-spacing: -0.02em;
        }
        .pl-hero h1 em { font-style: italic; color: var(--cream); opacity: 0.75; }
        .pl-hero-sub {
          font-size: 18px; font-weight: 400;
          color: rgba(246,240,230,0.82);
          line-height: 1.65; max-width: 540px;
          margin-bottom: 44px;
        }
        .pl-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
        .pl-btn-primary {
          background: var(--ink);
          color: var(--cream);
          padding: 16px 32px;
          font-size: 16px; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          letter-spacing: 0.02em;
          display: inline-flex; align-items: center; gap: 8px;
          transition: background 0.2s;
          font-family: inherit;
        }
        .pl-btn-primary:hover { background: var(--ink-mid); }
        .pl-btn-ghost {
          background: transparent;
          color: var(--cream);
          border: 1px solid rgba(246,240,230,0.35);
          padding: 16px 28px;
          font-size: 15px; font-weight: 400;
          text-decoration: none; cursor: pointer;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .pl-btn-ghost:hover { border-color: rgba(246,240,230,0.7); }
        .pl-hero-trust {
          margin-top: 40px; font-size: 12px;
          color: rgba(246,240,230,0.5);
          letter-spacing: 0.05em;
          display: flex; gap: 24px; flex-wrap: wrap;
        }
        .pl-hero-trust span { display: flex; align-items: center; gap: 6px; }
        .pl-hero-trust span::before { content: '✓'; color: rgba(246,240,230,0.8); font-weight: 700; }

        .pl-demo-card {
          background: var(--cream);
          color: var(--ink);
          position: relative; z-index: 1;
          overflow: hidden;
          box-shadow: 0 32px 64px rgba(0,0,0,0.25);
        }
        .pl-demo-card-header {
          background: var(--ink-mid);
          padding: 12px 16px;
          display: flex; gap: 6px; align-items: center;
        }
        .pl-demo-dot { width: 10px; height: 10px; border-radius: 50%; }
        .pl-demo-card-label {
          margin-left: auto; font-size: 11px;
          color: rgba(246,240,230,0.4);
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .pl-demo-body { padding: 24px; }
        .pl-demo-section-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--ink-soft); margin-bottom: 10px;
        }
        .pl-demo-original {
          background: var(--cream-mid);
          border-left: 3px solid var(--line);
          padding: 14px 16px; font-size: 13px;
          color: var(--ink-soft); line-height: 1.55;
          font-style: italic; margin-bottom: 20px;
        }
        .pl-demo-arrow {
          text-align: center; color: var(--terra);
          font-size: 18px; margin-bottom: 16px; font-weight: 700;
        }
        .pl-demo-plain-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--terra); margin-bottom: 10px;
        }
        .pl-demo-plain {
          background: var(--warm);
          border-left: 3px solid var(--terra);
          padding: 14px 16px; font-size: 14px;
          line-height: 1.6; color: var(--ink-mid); margin-bottom: 14px;
        }
        .pl-demo-plain strong { color: var(--ink); }
        .pl-demo-example {
          background: var(--terra-pale);
          padding: 10px 14px; font-size: 12.5px;
          color: var(--ink-mid); line-height: 1.5;
          border-top: 1px solid #e8c4b4;
        }
        .pl-demo-example span {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--terra); display: block; margin-bottom: 4px;
        }
        .pl-demo-tabs { display: flex; gap: 2px; margin-bottom: 20px; }
        .pl-demo-tab {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase;
          padding: 6px 12px;
          background: var(--cream-mid);
          color: var(--ink-soft);
          border: none; cursor: pointer; transition: all 0.15s;
          font-family: inherit;
        }
        .pl-demo-tab.active { background: var(--terra); color: var(--cream); }

        .pl-ticker {
          background: var(--terra); color: var(--cream);
          padding: 14px 0; overflow: hidden; white-space: nowrap;
        }
        .pl-ticker-inner {
          display: inline-flex; gap: 0;
          animation: pl-ticker 28s linear infinite;
        }
        .pl-ticker-item {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 0 40px; font-size: 13px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .pl-ticker-item::after { content: '·'; color: rgba(246,240,230,0.4); font-size: 20px; }
        @keyframes pl-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .pl-stats-bar {
          background: var(--cream);
          border-bottom: 1px solid var(--line);
          padding: 48px;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;
        }
        .pl-stat-item {
          padding: 20px 28px;
          border-right: 1px solid var(--line);
          text-align: center;
        }
        .pl-stat-item:last-child { border-right: none; }
        .pl-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 44px; font-weight: 900;
          color: var(--terra); line-height: 1; margin-bottom: 6px;
        }
        .pl-stat-desc { font-size: 13px; color: var(--ink-soft); line-height: 1.4; }
        .pl-stat-source { font-size: 10px; color: var(--line); margin-top: 6px; letter-spacing: 0.05em; }

        .pl-section { padding: 96px 48px; }
        .pl-section-alt { background: var(--cream); }
        .pl-section-dark { background: var(--dark-bg); color: var(--cream); }

        .pl-eyebrow {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--terra); margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .pl-eyebrow::after { content: ''; flex: 0 0 32px; height: 1px; background: var(--terra); }
        .pl-section-dark .pl-eyebrow { color: var(--terra-mid); }
        .pl-section-dark .pl-eyebrow::after { background: var(--terra-mid); }

        h2.pl-display {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 900; line-height: 1.1;
          letter-spacing: -0.02em; margin-bottom: 20px;
        }
        h2.pl-display em { font-style: italic; color: var(--terra); }
        .pl-section-dark h2.pl-display em { color: var(--terra-mid); }
        .pl-lead {
          font-size: 19px; font-weight: 400;
          color: var(--ink-soft); line-height: 1.65;
          max-width: 640px; margin-bottom: 56px;
        }
        .pl-section-dark .pl-lead { color: rgba(246,240,230,0.7); }

        .pl-steps-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 2px; background: var(--line); border: 1px solid var(--line);
        }
        .pl-step { background: var(--warm); padding: 40px 36px; position: relative; }
        .pl-step-num {
          font-family: 'Playfair Display', serif;
          font-size: 64px; font-weight: 900;
          color: var(--cream-mid); line-height: 1; margin-bottom: 16px; display: block;
        }
        .pl-step h3 {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          color: var(--ink); margin-bottom: 12px; line-height: 1.2;
        }
        .pl-step p { font-size: 15px; color: var(--ink-soft); line-height: 1.6; }

        .pl-modules-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .pl-module-card {
          border: 1px solid var(--line); background: var(--warm);
          padding: 32px 28px; transition: border-color 0.2s;
        }
        .pl-module-card:hover { border-color: var(--terra); }
        .pl-module-card.featured { background: var(--ink); border-color: var(--ink); color: var(--cream); }
        .pl-module-icon {
          width: 44px; height: 44px; background: var(--terra-pale);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 20px;
        }
        .pl-module-card.featured .pl-module-icon { background: rgba(191,80,48,0.2); }
        .pl-module-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 10px; line-height: 1.2;
        }
        .pl-module-card.featured h3 { color: var(--cream); }
        .pl-module-card p { font-size: 14px; color: var(--ink-soft); line-height: 1.6; }
        .pl-module-card.featured p { color: rgba(246,240,230,0.72); }
        .pl-module-tag {
          display: inline-block; margin-top: 16px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--terra); border-top: 2px solid var(--terra); padding-top: 8px;
        }
        .pl-module-card.featured .pl-module-tag { color: var(--terra-mid); border-color: var(--terra-mid); }

        .pl-school-feature { display: grid; grid-template-columns: 1fr 1fr; gap: 0; background: var(--line); }
        .pl-school-left { background: var(--ink); color: var(--cream); padding: 72px 56px; }
        .pl-school-left h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3vw, 42px); font-weight: 900; line-height: 1.1;
          letter-spacing: -0.02em; margin-bottom: 24px;
        }
        .pl-school-left h2 em { font-style: italic; color: var(--terra-mid); }
        .pl-school-left p { font-size: 16px; color: rgba(246,240,230,0.72); line-height: 1.65; margin-bottom: 16px; }
        .pl-school-highlight {
          margin-top: 32px; padding: 20px 24px;
          background: rgba(191,80,48,0.15);
          border-left: 3px solid var(--terra);
          font-size: 15px; color: var(--cream); line-height: 1.5;
        }
        .pl-school-right { background: var(--cream); padding: 72px 56px; }
        .pl-school-right h3 {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: var(--ink); margin-bottom: 24px;
        }
        .pl-reading-label {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--ink-soft); margin-bottom: 8px;
        }
        .pl-reading-bar { height: 8px; background: var(--line); position: relative; margin-bottom: 4px; }
        .pl-reading-bar-fill { height: 100%; background: var(--terra); }
        .pl-reading-bar-label { font-size: 11px; color: var(--ink-soft); display: flex; justify-content: space-between; }
        .pl-ws-before {
          background: var(--cream-mid); border-left: 2px solid var(--line);
          padding: 16px 18px; font-size: 13px; line-height: 1.55;
          color: var(--ink-soft); font-style: italic; margin-bottom: 4px;
        }
        .pl-ws-after {
          background: var(--terra-pale); border-left: 2px solid var(--terra);
          padding: 16px 18px; font-size: 13px; line-height: 1.55;
          color: var(--ink-mid); margin-bottom: 4px;
        }
        .pl-ws-after strong { color: var(--terra); font-weight: 700; }
        .pl-ws-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; margin-bottom: 8px; display: block;
        }
        .pl-ws-label.before { color: var(--ink-soft); }
        .pl-ws-label.after { color: var(--terra); }

        .pl-ai-section { display: grid; grid-template-columns: 1fr 400px; gap: 80px; align-items: center; }
        .pl-ai-badge {
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(176,124,32,0.12);
          border: 1px solid rgba(176,124,32,0.3);
          padding: 10px 16px; margin-bottom: 32px;
        }
        .pl-ai-badge-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--gold);
          animation: pl-pulse 2s infinite;
        }
        @keyframes pl-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pl-ai-badge span {
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold);
        }
        .pl-ai-features { list-style: none; margin-top: 32px; }
        .pl-ai-features li {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 16px 0; border-bottom: 1px solid rgba(246,240,230,0.1);
          font-size: 15px; color: rgba(246,240,230,0.75); line-height: 1.5;
        }
        .pl-ai-features li:last-child { border-bottom: none; }
        .pl-ai-check {
          width: 20px; height: 20px; background: rgba(191,80,48,0.2);
          color: var(--terra-mid); display: flex; align-items: center;
          justify-content: center; font-size: 11px; font-weight: 700;
          flex-shrink: 0; margin-top: 1px;
        }
        .pl-ai-card {
          background: rgba(246,240,230,0.05);
          border: 1px solid rgba(246,240,230,0.1); padding: 32px;
        }
        .pl-ai-card-header {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--terra-mid); margin-bottom: 20px;
          padding-bottom: 16px; border-bottom: 1px solid rgba(246,240,230,0.1);
        }
        .pl-ai-privacy-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 0; border-bottom: 1px solid rgba(246,240,230,0.08);
          font-size: 13px; color: rgba(246,240,230,0.65); line-height: 1.4;
        }
        .pl-ai-privacy-row:last-child { border-bottom: none; }
        .pl-ai-privacy-row strong { display: block; color: rgba(246,240,230,0.9); font-weight: 700; margin-bottom: 2px; }
        .pl-ai-icon {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(191,80,48,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0;
        }

        .pl-promises {
          background: var(--cream); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
          padding: 56px 48px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;
        }
        .pl-promise { padding: 24px 28px; border-right: 1px solid var(--line); text-align: center; }
        .pl-promise:last-child { border-right: none; }
        .pl-promise-icon { font-size: 28px; margin-bottom: 12px; }
        .pl-promise h4 {
          font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700;
          color: var(--ink); margin-bottom: 8px;
        }
        .pl-promise p { font-size: 13px; color: var(--ink-soft); line-height: 1.5; }

        .pl-cta-section {
          background: var(--terra); color: var(--cream);
          padding: 96px 48px; text-align: center; position: relative; overflow: hidden;
        }
        .pl-cta-section::before {
          content: ''; position: absolute; top: -150px; left: 50%;
          transform: translateX(-50%); width: 600px; height: 600px; border-radius: 50%;
          background: rgba(0,0,0,0.08);
        }
        .pl-cta-section h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 56px); font-weight: 900; line-height: 1.1;
          letter-spacing: -0.02em; margin-bottom: 20px; position: relative;
        }
        .pl-cta-section h2 em { font-style: italic; color: rgba(246,240,230,0.6); }
        .pl-cta-section p { font-size: 18px; color: rgba(246,240,230,0.75); margin-bottom: 40px; position: relative; }
        .pl-btn-cta-white {
          background: var(--cream); color: var(--terra);
          padding: 18px 40px; font-size: 17px; font-weight: 700;
          text-decoration: none; letter-spacing: 0.02em; border: none; cursor: pointer;
          display: inline-flex; align-items: center; gap: 10px; position: relative;
          transition: background 0.2s; font-family: inherit;
        }
        .pl-btn-cta-white:hover { background: var(--warm); }

        footer.pl-footer { background: var(--ink-mid); color: rgba(246,240,230,0.55); padding: 56px 48px 36px; }
        .pl-footer-grid {
          display: grid; grid-template-columns: 280px 1fr 1fr 1fr;
          gap: 48px; margin-bottom: 48px;
        }
        .pl-footer-brand p { font-size: 14px; color: rgba(246,240,230,0.5); line-height: 1.6; margin-top: 12px; }
        .pl-footer-logo {
          font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900;
          color: var(--cream); letter-spacing: -0.02em;
        }
        .pl-footer-logo span { color: var(--terra-mid); }
        .pl-footer-col h5 {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(246,240,230,0.35); margin-bottom: 16px;
        }
        .pl-footer-col a {
          display: block; font-size: 14px; color: rgba(246,240,230,0.6);
          text-decoration: none; padding: 5px 0; transition: color 0.15s;
        }
        .pl-footer-col a:hover { color: var(--cream); }
        .pl-footer-bottom {
          border-top: 1px solid rgba(246,240,230,0.08); padding-top: 28px;
          display: flex; justify-content: space-between; align-items: center; font-size: 12px;
        }
        .pl-footer-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(191,80,48,0.15); border: 1px solid rgba(191,80,48,0.25);
          padding: 6px 14px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--terra-mid);
        }

        /* Upload drop zone on hero */
        .pl-upload-zone {
          border: 2px dashed rgba(246,240,230,0.5);
          padding: 14px 20px; text-align: center;
          cursor: pointer; transition: all 0.2s; margin-top: 16px;
        }
        .pl-upload-zone:hover { border-color: var(--cream); background: rgba(246,240,230,0.08); }
        .pl-upload-label { cursor: pointer; }

        @media (max-width: 960px) {
          .pl-hero { grid-template-columns: 1fr; }
          .pl-demo-card { display: none; }
          .pl-stats-bar { grid-template-columns: 1fr 1fr; }
          .pl-steps-grid { grid-template-columns: 1fr; }
          .pl-modules-grid { grid-template-columns: 1fr; }
          .pl-school-feature { grid-template-columns: 1fr; }
          .pl-ai-section { grid-template-columns: 1fr; }
          .pl-promises { grid-template-columns: 1fr 1fr; }
          .pl-footer-grid { grid-template-columns: 1fr 1fr; }
          .pl-nav { padding: 0 24px; }
          .pl-section { padding: 64px 24px; }
        }
      `}</style>

      <div className="pl-root">
      <div className="pl-shell">

        {/* NAV */}
        <nav className="pl-nav">
          <span className="pl-nav-logo">Plain<span>ly</span></span>
          <div className="pl-nav-links">
            <a href="#how">How it works</a>
            <a href="#modules">What it reads</a>
            <a href="#school">For schools</a>
            <button onClick={onGetStarted} className="pl-nav-links pl-nav-cta" style={{ border: "none", cursor: "pointer", fontFamily: "inherit" }}>Try it free →</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="pl-hero" id="top">
          <div>
            <div className="pl-hero-eyebrow">Free · No sign-up · Built in Aotearoa</div>
            <h1>Any document.<br /><em>Plain English.</em><br />Right now.</h1>
            <p className="pl-hero-sub">Drop in a WINZ letter, IRD notice, insurance policy, tenancy agreement — anything. Get back clear, plain language that tells you exactly what it means and what to do next.</p>
            <div className="pl-hero-actions">
              <button onClick={onGetStarted} className="pl-btn-primary">Drop your document →</button>
              <a href="#how" className="pl-btn-ghost">See how it works</a>
            </div>
            <div className="pl-hero-trust">
              <span>No advice or opinion</span>
              <span>Just plain English</span>
              <span>Your document stays yours</span>
              <span>Always free</span>
            </div>
            {/* File upload shortcut */}
            <div className="pl-upload-zone" style={{ marginTop: 32 }}
              onDragEnter={e => { e.preventDefault(); setHovering(true); }}
              onDragOver={e => { e.preventDefault(); setHovering(true); }}
              onDragLeave={() => setHovering(false)}
              onDrop={e => { e.preventDefault(); setHovering(false); const f = e.dataTransfer.files?.[0]; if (f) { onFileUpload(f); onGetStarted(); } }}>
              <input id="lp-upload" type="file" style={{ display: "none" }}
                accept="application/pdf,image/png,image/jpeg,image/webp"
                onChange={e => { const f = e.target.files?.[0]; if (f) { onFileUpload(f); onGetStarted(); } }} />
              <label htmlFor="lp-upload" className="pl-upload-label" style={{ color: "rgba(246,240,230,0.8)", fontSize: 14, display: "block" }}>
                📎 Or drag a file here to go straight in
              </label>
            </div>
          </div>

          {/* Demo card */}
          <div className="pl-demo-card">
            <div className="pl-demo-card-header">
              <div className="pl-demo-dot" style={{ background: "#ff5f57" }}></div>
              <div className="pl-demo-dot" style={{ background: "#febc2e" }}></div>
              <div className="pl-demo-dot" style={{ background: "#28c840" }}></div>
              <div className="pl-demo-card-label">Plainly · Live demo</div>
            </div>
            <div className="pl-demo-body">
              <div className="pl-demo-tabs">
                {samples.map((s, i) => (
                  <button key={i} className={`pl-demo-tab${activeTab === i ? " active" : ""}`} onClick={() => setActiveTab(i)}>{s.tab}</button>
                ))}
              </div>
              <div className="pl-demo-section-label">Original text</div>
              <div className="pl-demo-original">{samples[activeTab].orig}</div>
              <div className="pl-demo-arrow">↓ Simplified</div>
              <div className="pl-demo-plain-label">In plain English</div>
              <div className="pl-demo-plain" dangerouslySetInnerHTML={{ __html: samples[activeTab].plain }} />
              <div className="pl-demo-example">
                <span>For example</span>
                {samples[activeTab].ex}
              </div>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <div className="pl-ticker">
          <div className="pl-ticker-inner">
            {["WINZ forms","IRD letters","Insurance policies","Tenancy agreements","Hospital paperwork","School worksheets","ACC claims","Property contracts","Court documents","Any document",
              "WINZ forms","IRD letters","Insurance policies","Tenancy agreements","Hospital paperwork","School worksheets","ACC claims","Property contracts","Court documents","Any document"].map((t, i) => (
              <span key={i} className="pl-ticker-item">{t}</span>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div className="pl-stats-bar">
          <div className="pl-stat-item">
            <div className="pl-stat-num">851K</div>
            <div className="pl-stat-desc">New Zealanders living with a disability</div>
            <div className="pl-stat-source">Stats NZ · 2023</div>
          </div>
          <div className="pl-stat-item">
            <div className="pl-stat-num">26%</div>
            <div className="pl-stat-desc">of NZ adults read at literacy Level 1 or below</div>
            <div className="pl-stat-source">OECD · 2023</div>
          </div>
          <div className="pl-stat-item">
            <div className="pl-stat-num">1 in 5</div>
            <div className="pl-stat-desc">WINZ calls go unanswered every year</div>
            <div className="pl-stat-source">MSD · 2023/24</div>
          </div>
          <div className="pl-stat-item">
            <div className="pl-stat-num">15–20%</div>
            <div className="pl-stat-desc">of people are neurodivergent — ADHD, autism, dyslexia</div>
            <div className="pl-stat-source">ERO Report · 2024</div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section className="pl-section" id="how">
          <div className="pl-eyebrow">How it works</div>
          <h2 className="pl-display">Three steps.<br /><em>That's it.</em></h2>
          <p className="pl-lead">No account. No payment. No complex setup. Paste or upload your document and get plain language back in seconds.</p>
          <div className="pl-steps-grid">
            <div className="pl-step">
              <span className="pl-step-num">01</span>
              <h3>Drop your document</h3>
              <p>Paste text, upload a PDF, or take a photo. WINZ letters, IRD notices, contracts, school worksheets — anything that's making your head hurt.</p>
            </div>
            <div className="pl-step">
              <span className="pl-step-num">02</span>
              <h3>Get plain English back</h3>
              <p>Plainly breaks the document into clear sections. Each part explained simply — what it says, what it means, what you might need to do next.</p>
            </div>
            <div className="pl-step">
              <span className="pl-step-num">03</span>
              <h3>Move on with your day</h3>
              <p>No jargon. No legalese. No opinion or advice. Just the words of the document, made clear. Download or copy it whenever you're ready.</p>
            </div>
          </div>
        </section>

        {/* MODULES */}
        <section className="pl-section pl-section-alt" id="modules">
          <div className="pl-eyebrow">What Plainly reads</div>
          <h2 className="pl-display">Every document<br /><em>you've ever dreaded</em></h2>
          <p className="pl-lead">If it's written in language that locks people out, Plainly makes it clear. No opinions, no advice — just the document, in plain English.</p>
          <div className="pl-modules-grid">
            <div className="pl-module-card">
              <div className="pl-module-icon">📄</div>
              <h3>Government Forms</h3>
              <p>WINZ, IRD, ACC, StudyLink, courts. The forms that determine your income, your healthcare, your housing — explained clearly, section by section.</p>
              <div className="pl-module-tag">WINZ · IRD · ACC · StudyLink</div>
            </div>
            <div className="pl-module-card featured">
              <div className="pl-module-icon">✍️</div>
              <h3>Contracts & Legal</h3>
              <p>Tenancy agreements, property contracts, insurance policies, employment contracts. Know what you're signing — in plain language, before you sign it.</p>
              <div className="pl-module-tag">Insurance · Property · Employment</div>
            </div>
            <div className="pl-module-card">
              <div className="pl-module-icon">🏥</div>
              <h3>Medical & Health</h3>
              <p>Hospital consent forms, discharge instructions, ACC paperwork, GP referrals. Medical documents explained clearly — no clinical jargon.</p>
              <div className="pl-module-tag">Hospitals · ACC · GP Letters</div>
            </div>
          </div>
        </section>

        {/* SCHOOL FEATURE */}
        <div className="pl-school-feature" id="school">
          <div className="pl-school-left">
            <div className="pl-eyebrow" style={{ color: "var(--terra-mid)" }}>The school module</div>
            <h2>The language<br />is the barrier —<br /><em>not the concept</em></h2>
            <p>A Year 6 child reading at a Year 2 level receives Year 6 worksheets. The idea is within reach. The words aren't.</p>
            <p>Plainly takes any school worksheet and simplifies it into plain English at the child's actual reading level — not their year group. Same learning objective. Language they can access.</p>
            <div className="pl-school-highlight">
              46% of young disabled New Zealanders aged 15–24 are not in education, employment or training. Educational difficulty starts with documents they couldn't access.
            </div>
          </div>
          <div className="pl-school-right">
            <h3>See it in action</h3>
            <div style={{ marginBottom: 24 }}>
              <div className="pl-reading-label">Child's year group</div>
              <div className="pl-reading-bar"><div className="pl-reading-bar-fill" style={{ width: "75%" }}></div></div>
              <div className="pl-reading-bar-label"><span>Year 1</span><span style={{ color: "var(--terra)", fontWeight: 700 }}>Year 6</span><span>Year 13</span></div>
            </div>
            <div style={{ marginBottom: 28 }}>
              <div className="pl-reading-label">Actual reading level</div>
              <div className="pl-reading-bar"><div className="pl-reading-bar-fill" style={{ width: "25%", background: "var(--sage)" }}></div></div>
              <div className="pl-reading-bar-label"><span>Year 1</span><span style={{ color: "var(--sage)", fontWeight: 700 }}>Year 2</span><span>Year 13</span></div>
            </div>
            <div>
              <span className="pl-ws-label before">Original worksheet (Year 6)</span>
              <div className="pl-ws-before">"Identify the key protagonist's psychological motivations and evaluate how internal conflict drives narrative progression in the text."</div>
              <div className="pl-demo-arrow" style={{ color: "var(--terra)", margin: "8px 0" }}>↓ Plainly simplifies</div>
              <span className="pl-ws-label after">Simplified to Year 2 reading level</span>
              <div className="pl-ws-after"><strong>What to do:</strong> Think about the main character. What do they want? What are they worried about? How does that change the story?</div>
            </div>
          </div>
        </div>

        {/* AI SECTION */}
        <section className="pl-section pl-section-dark">
          <div className="pl-ai-section">
            <div>
              <div className="pl-eyebrow">The technology</div>
              <h2 className="pl-display">Powered by<br /><em>world-class AI</em></h2>
              <div className="pl-ai-badge">
                <div className="pl-ai-badge-dot"></div>
                <span>Anthropic Claude · Constitutional AI</span>
              </div>
              <p style={{ fontSize: 17, color: "rgba(246,240,230,0.72)", lineHeight: 1.65, maxWidth: 520 }}>
                Plainly is built on Claude — Anthropic's large language model, and one of the most capable and safety-focused AI systems in the world. Backed by Google and Amazon. Trusted by researchers, governments, and organisations globally.
              </p>
              <ul className="pl-ai-features">
                <li><div className="pl-ai-check">✓</div>Exceptional at simplifying complex language without changing the meaning</li>
                <li><div className="pl-ai-check">✓</div>Will not add opinions, advice, or interpretation — only plain language</li>
                <li><div className="pl-ai-check">✓</div>Constitutional AI: built-in safety guardrails for legal and medical content</li>
                <li><div className="pl-ai-check">✓</div>Handles multi-part documents, extracts each section individually</li>
                <li><div className="pl-ai-check">✓</div>Reads to any target comprehension level for the school module</li>
              </ul>
            </div>
            <div className="pl-ai-card">
              <div className="pl-ai-card-header">Privacy & security</div>
              <div className="pl-ai-privacy-row">
                <div className="pl-ai-icon">🔒</div>
                <div><strong>Session-only processing</strong>Documents are processed and immediately discarded. Nothing is stored.</div>
              </div>
              <div className="pl-ai-privacy-row">
                <div className="pl-ai-icon">🚫</div>
                <div><strong>No training on your data</strong>Your documents are never used to train or improve any AI model.</div>
              </div>
              <div className="pl-ai-privacy-row">
                <div className="pl-ai-icon">👤</div>
                <div><strong>No account required</strong>Nothing is linked to you. Close the tab and it's gone.</div>
              </div>
              <div className="pl-ai-privacy-row">
                <div className="pl-ai-icon">💬</div>
                <div><strong>No opinions added</strong>Plainly only simplifies what's there. It does not interpret, advise, or fill in gaps.</div>
              </div>
            </div>
          </div>
        </section>

        {/* PROMISES */}
        <div className="pl-promises">
          <div className="pl-promise">
            <div className="pl-promise-icon">🆓</div>
            <h4>Free, full stop</h4>
            <p>No premium tier. No trial period. No upsell. The whole thing, for everyone, always.</p>
          </div>
          <div className="pl-promise">
            <div className="pl-promise-icon">🔒</div>
            <h4>Your document stays yours</h4>
            <p>We don't store, sell, or train on anything you upload. When you close the tab, it's gone.</p>
          </div>
          <div className="pl-promise">
            <div className="pl-promise-icon">🧠</div>
            <h4>Built for neurodivergent minds</h4>
            <p>Calm design, readable fonts, reduced-motion support. No flashing, no pop-ups, no dark patterns.</p>
          </div>
          <div className="pl-promise">
            <div className="pl-promise-icon">💬</div>
            <h4>Plain language only</h4>
            <p>No advice. No opinion. Just the document's words — made clear, clean, and plain.</p>
          </div>
        </div>

        {/* CTA */}
        <section className="pl-cta-section" id="try">
          <h2>You shouldn't need a degree<br />to read <em>a letter.</em></h2>
          <p>Drop your document in. No sign-up. No cost. No catch.</p>
          <button onClick={onGetStarted} className="pl-btn-cta-white">Start with a document →</button>
        </section>

        {/* FOOTER */}
        <footer className="pl-footer">
          <div className="pl-footer-grid">
            <div className="pl-footer-brand">
              <div className="pl-footer-logo">Plain<span>ly</span></div>
              <p>A free tool that turns any complex document into plain English. Built in Aotearoa New Zealand.</p>
              <div className="pl-footer-badge" style={{ marginTop: 20 }}>🇳🇿 Made in NZ</div>
            </div>
            <div className="pl-footer-col">
              <h5>The tool</h5>
              <a href="#modules">Government forms</a>
              <a href="#modules">Contracts & legal</a>
              <a href="#modules">Medical documents</a>
              <a href="#school">School worksheets</a>
            </div>
            <div className="pl-footer-col">
              <h5>About</h5>
              <a href="#how">How it works</a>
              <a href="#">Privacy policy</a>
              <a href="#">Accessibility</a>
              <a href="#">Contact</a>
            </div>
            <div className="pl-footer-col">
              <h5>Built with</h5>
              <a href="#">Anthropic Claude</a>
              <a href="#">For organisations</a>
              <a href="#school">For schools</a>
            </div>
          </div>
          <div className="pl-footer-bottom">
            <span>© 2026 Plainly. Free. Always.</span>
            <span>No advice · No opinions · Just plain English</span>
          </div>
        </footer>

      </div>{/* /pl-shell */}
      </div>
    </>
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Atkinson+Hyperlegible:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; font-family: 'Atkinson Hyperlegible', system-ui, sans-serif; }
        .app-shell { display: flex; flex-direction: column; height: 100vh; background: #ede4d4; color: #1c1710; }

        /* Header — matches landing page nav */
        .app-header {
          display: flex; flex-wrap: wrap; align-items: center; gap: 16px;
          padding: 0 32px; height: 64px;
          background: #fdfaf5;
          border-bottom: 1px solid #ddd0bb;
          color: #1c1710; flex-shrink: 0;
        }
        .logo {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 900;
          color: #1c1710; letter-spacing: -0.02em;
          text-decoration: none;
        }
        .logo span { color: #bf5030; }
        .header-tagline { font-size: 13px; color: #9a8878; border-left: 1px solid #ddd0bb; padding-left: 16px; display: none; }
        @media (min-width: 700px) { .header-tagline { display: block; } }
        .header-spacer { flex: 1; }
        .header-error { font-size: 13px; color: #b91c1c; }
        .hbtn { padding: 8px 18px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; font-family: inherit; letter-spacing: 0.02em; }
        .hbtn-blue { background: #bf5030; color: #f6f0e6; } .hbtn-blue:hover:not(:disabled) { background: #a8452a; }
        .hbtn-grey { background: transparent; color: #6b5c48; border: 1px solid #ddd0bb; } .hbtn-grey:hover { background: #f6f0e6; }
        .hbtn-ghost { background: transparent; color: #6b5c48; border: 1px solid #ddd0bb; } .hbtn-ghost:hover { background: #f6f0e6; }

        /* Split */
        .split { display: flex; flex: 1; overflow: hidden; padding: 20px; gap: 16px; }
        .split-left  { flex: 0 0 58%; overflow: hidden; display: flex; flex-direction: column; background: #fdfaf5; border: 1px solid #ddd0bb; }
        .split-right { flex: 1; overflow-y: auto; background: #f6f0e6; padding: 24px; display: flex; flex-direction: column; gap: 16px; border: 1px solid #ddd0bb; }

        /* Drop zone */
        .drop-zone { flex: 1; display: flex; align-items: center; justify-content: center; border: 2px dashed #c8b8a2; margin: 20px; background: #ffffff; text-align: center; padding: 48px 24px; flex-direction: column; }
        .drop-zone strong { color: #1c1710; font-size: 20px; font-family: 'Playfair Display', serif; font-weight: 700; display: block; margin-bottom: 10px; }
        .drop-zone p { color: #6b5c48; font-size: 16px; margin-bottom: 22px; line-height: 1.75; }
        .drop-zone input { display: none; }
        .browse-btn { display: inline-block; padding: 13px 28px; background: #bf5030; color: #f6f0e6; cursor: pointer; font-size: 15px; font-weight: 700; letter-spacing: 0.02em; font-family: inherit; }
        .browse-btn:hover { background: #a8452a; }

        /* Document viewer */
        .doc-viewer { flex: 1; overflow-y: scroll; overflow-x: auto; min-width: 0; background: #f0ebe3; }
        .doc-loading { flex: 1; display: flex; align-items: center; justify-content: center; color: #6b5c48; font-size: 16px; }

        /* Thumbnail strip */
        .thumb-strip { width: 180px; min-width: 180px; flex-shrink: 0; overflow-y: auto; background: #fdfaf5; padding: 12px 10px; display: flex; flex-direction: column; gap: 10px; border-right: 1px solid #ddd0bb; }
        .thumb-item { cursor: pointer; overflow: hidden; border: 2px solid #ddd0bb; transition: border-color 0.15s, box-shadow 0.15s; background: #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.06); flex-shrink: 0; }
        .thumb-item:hover { border-color: #bf5030; box-shadow: 0 2px 8px rgba(191,80,48,0.15); }
        .thumb-item img { width: 100%; aspect-ratio: 1 / 1.414; object-fit: cover; object-position: top center; display: block; background: #ddd0bb; }
        .thumb-item span { display: block; text-align: center; font-size: 12px; font-weight: 700; color: #6b5c48; padding: 5px 0; background: #fdfaf5; letter-spacing: 0.05em; }
        .thumb-active { border-color: #bf5030 !important; box-shadow: 0 0 0 2px rgba(191,80,48,0.2) !important; }
        .page-wrap-outer { display: flex; flex-direction: column; align-items: center; padding: 20px 16px 0; width: 100%; box-sizing: border-box; }
        .page-wrap { position: relative; cursor: crosshair; user-select: none; background: white; box-shadow: 0 2px 16px rgba(0,0,0,0.09); flex-shrink: 0; margin: 0 auto; }
        .page-divider { width: 100%; background: #ede4d4; color: #6b5c48; font-size: 11px; font-weight: 700; text-align: center; padding: 6px 0; margin-top: 20px; letter-spacing: 0.08em; text-transform: uppercase; box-sizing: border-box; }

        /* Toolbar */
        .page-nav { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #ffffff; border-bottom: 1px solid #ddd0bb; color: #1c1710; font-size: 13px; flex-shrink: 0; }
        .nav-btn { padding: 5px 14px; background: #f6f0e6; color: #bf5030; border: 1px solid #ddd0bb; cursor: pointer; font-size: 13px; font-weight: 700; font-family: inherit; }
        .nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .nav-btn:hover:not(:disabled) { background: #ede4d4; border-color: #bf5030; }

        /* Rubber-band */
        .rubberband { position: absolute; border: 2px dashed #bf5030; background: rgba(191,80,48,0.08); pointer-events: none; }
        .rubberband-done { border-style: solid; background: rgba(191,80,48,0.12); }
        .drag-hint { padding: 8px 12px; font-size: 13px; color: #6b5c48; text-align: center; background: #fdfaf5; border-top: 1px solid #ddd0bb; }
        .drag-hint.selected { color: #bf5030; font-weight: 700; }

        /* Mode toggle */
        .mode-toggle { display: flex; gap: 2px; flex-shrink: 0; background: #ede4d4; padding: 3px; }
        .mode-btn { flex: 1; padding: 9px 10px; background: transparent; color: #6b5c48; border: none; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; font-family: inherit; letter-spacing: 0.01em; }
        .mode-btn:hover:not(.mode-active) { background: #f6f0e6; color: #3a2f22; }
        .mode-active { background: #bf5030 !important; color: #f6f0e6 !important; }

        .age-selector { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 12px 14px; background: #fdfaf5; border: 1px solid #ddd0bb; }
        .age-btn { padding: 5px 14px; border: 1px solid #ddd0bb; background: #f6f0e6; color: #6b5c48; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .age-btn:hover { border-color: #bf5030; color: #bf5030; }
        .age-active { border-color: #bf5030 !important; background: #bf5030 !important; color: #f6f0e6 !important; }

        /* Simplify action */
        .simplify-action { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 8px 0 4px; text-align: center; }
        .simplify-btn { padding: 14px 36px; background: #bf5030; color: #f6f0e6; border: none; font-size: 17px; font-weight: 700; cursor: pointer; transition: background 0.15s, transform 0.1s; font-family: inherit; letter-spacing: 0.02em; }
        .simplify-btn:hover:not(:disabled) { background: #a8452a; transform: translateY(-1px); }
        .simplify-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .simplify-hint { font-size: 15px; color: #6b5c48; max-width: 280px; line-height: 1.7; }

        /* Audio */
        .audio-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 12px 14px; background: #fdfaf5; border: 1px solid #ddd0bb; }
        .audio-bar label { font-size: 12px; color: #3a2f22; display: flex; align-items: center; gap: 6px; }
        .audio-hint { font-size: 12px; color: #bf5030; font-weight: 700; width: 100%; padding-top: 4px; }
        .voice-select { font-size: 12px; border: 1px solid #ddd0bb; padding: 4px 6px; background: white; color: #1c1710; cursor: pointer; max-width: 180px; font-family: inherit; }
        .abtn { padding: 6px 14px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
        .abtn:disabled { opacity: 0.4; cursor: not-allowed; }
        .abtn-blue { background: #bf5030; color: #f6f0e6; } .abtn-blue:hover:not(:disabled) { background: #a8452a; }
        .abtn-grey { background: #f6f0e6; color: #6b5c48; border: 1px solid #ddd0bb; } .abtn-grey:hover:not(:disabled) { background: #ede4d4; }
        .abtn-red  { background: #dc2626; color: white; } .abtn-red:hover:not(:disabled) { background: #b91c1c; }

        /* Clickable words */
        .word-click { cursor: pointer; }
        .word-click:hover { text-decoration: underline; text-decoration-color: #bf5030; text-decoration-thickness: 2px; }

        /* Result cards */
        .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #bf5030; margin-bottom: 6px; }
        .result-card { background: white; border: 1px solid #ddd0bb; padding: 16px 18px; }
        .result-card h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #bf5030; margin-bottom: 10px; letter-spacing: 0.1em; }
        .placeholder { color: #6b5c48; font-size: 15px; line-height: 1.75; }

        /* Simplified text box */
        .simplified-box { background: white; border: 1px solid #ddd0bb; border-left: 3px solid #bf5030; padding: 18px 20px; line-height: 1.85; font-size: 15px; color: #1c1710; min-height: 80px; overflow-wrap: break-word; word-break: break-word; }
        .bullet-line { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
        .bullet-dot  { flex-shrink: 0; color: #bf5030; font-size: 20px; line-height: 1.4; }
        .bullet-text { flex: 1; overflow-wrap: break-word; word-break: break-word; }

        /* Checklist */
        .checklist-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .checklist-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; line-height: 1.7; overflow-wrap: break-word; word-break: break-word; cursor: pointer; padding: 4px 6px; }
        .checklist-item:hover { background: rgba(191,80,48,0.05); }
        .check-num { flex-shrink: 0; width: 22px; height: 22px; background: #bf5030; color: #f6f0e6; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 1px; }

        /* Flags */
        .flags-row { display: flex; flex-direction: column; gap: 6px; }
        .flag-chip { display: inline-flex; align-items: flex-start; gap: 6px; padding: 7px 12px; font-size: 13px; background: #fdfaf5; color: #3a2f22; border: 1px solid #ddd0bb; border-left: 3px solid #b07c20; line-height: 1.5; overflow-wrap: break-word; word-break: break-word; }

        /* Crop preview */
        .crop-preview { overflow: hidden; position: relative; border: 2px solid #bf5030; width: 100%; }

        /* Checklist drawer */
        .drawer-overlay { position: fixed; inset: 0; background: rgba(28,23,16,0.5); z-index: 50; display: grid; place-items: center; padding: 20px; }
        .drawer-panel { width: min(580px, 100%); background: white; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.18); }
        .drawer-head { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; border-bottom: 1px solid #ddd0bb; background: #f6f0e6; }
        .drawer-head h2 { font-family: 'Playfair Display', serif; font-size: 20px; color: #1c1710; font-weight: 700; }
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
        <a href="/" className="logo">Plain<span>ly</span></a>
        <span className="header-tagline">Plain language, instantly.</span>
        <span className="header-spacer" />
        {error && <span className="header-error">⚠ {error}</span>}
        {file && <button className="hbtn hbtn-blue" onClick={reset}>↩ New document</button>}
        {result && <button className="hbtn hbtn-grey" onClick={() => setChecklistOpen(true)}>☑ Checklist</button>}
        {result && <button className="hbtn hbtn-grey" onClick={() => window.print()}>🖨 Print</button>}
        <a href="/" className="hbtn hbtn-ghost" style={{ textDecoration: "none" }}>← Home</a>
      </header>

      <div className="split">
        {/* LEFT */}
        <section className="split-left">
          {renderLeft()}
        </section>

        {/* RIGHT */}
        <section className="split-right">

          {/* Controls card — mode + simplify */}
          <div className="no-print" style={{ background: "white", padding: "18px 18px 20px", border: "1px solid #ddd0bb", display: "flex", flexDirection: "column", gap: 12 }}>

            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#bf5030", marginBottom: 2 }}>
              Choose how you want it explained
            </p>

            <div className="mode-toggle">
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

            {docMode === "school" && (
              <div className="age-selector">
                <span style={{ fontSize: 13, color: "#bf5030", fontWeight: 700, marginRight: 2 }}>Child's reading age:</span>
                {[["5-6","Age 5–6"],["7-8","Age 7–8"],["9-10","Age 9–10"],["11-12","Age 11–12"]].map(([val, label]) => (
                  <button key={val}
                    className={`age-btn${readingAge === val ? " age-active" : ""}`}
                    onClick={() => setReadingAge(val)}>
                    {label}
                  </button>
                ))}
                <span style={{ fontSize: 12, color: "#6B7280", width: "100%", lineHeight: 1.5, marginTop: 2 }}>
                  Pick the age they actually read at — not their school year.
                </span>
              </div>
            )}

            <div className="simplify-action" style={{ paddingTop: 4 }}>
              {!file ? (
                <>
                  <p className="simplify-hint">Upload a document on the left to get started.</p>
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

          {/* Done banner — close and go back */}
          {result && (
            <div className="no-print" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#3D5C40", color: "#f6f0e6",
              padding: "12px 18px", gap: 12
            }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>✓ Done — your plain English version is ready</span>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={reset} style={{
                  background: "transparent", color: "#f6f0e6", border: "1px solid rgba(246,240,230,0.4)",
                  padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
                }}>↩ New doc</button>
                <a href="/" style={{
                  background: "#f6f0e6", color: "#3D5C40",
                  padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  textDecoration: "none", display: "inline-block"
                }}>← Home</a>
              </div>
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
