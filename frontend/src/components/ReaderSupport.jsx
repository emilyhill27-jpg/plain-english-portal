import { useState, createContext, useContext, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Eye, RotateCcw } from "lucide-react";

/* ─── Reader settings context ─── */
const ReaderContext = createContext({});

export function useReader() {
  return useContext(ReaderContext);
}

const TEXT_SIZES = [
  { value: "standard", label: "Aa", fontSize: 12 },
  { value: "medium", label: "Aa", fontSize: 14 },
  { value: "large", label: "Aa", fontSize: 16 },
  { value: "extra-large", label: "Aa", fontSize: 18 },
];

const FONTS = [
  { value: "lexend", label: "Aa", family: "'Lexend', sans-serif", name: "Lexend" },
  { value: "open-sans", label: "Aa", family: "'Open Sans', sans-serif", name: "Open Sans" },
  { value: "simple", label: "Aa", family: "Arial, Helvetica, sans-serif", name: "Simple" },
];

const SPACING = [
  { value: "standard", label: "━━━", lineHeight: "1.0" },
  { value: "relaxed", label: "━━━", lineHeight: "1.4" },
  { value: "extra-relaxed", label: "━━━", lineHeight: "1.9" },
];

const TINTS = [
  { value: "none", color: "#FFFFFF", label: "White" },
  { value: "cream", color: "#FFF9F0", label: "Cream" },
  { value: "blue", color: "#EFF6FF", label: "Blue" },
  { value: "lilac", color: "#F3E8FF", label: "Lilac" },
  { value: "grey", color: "#F3F4F6", label: "Grey" },
];

export function ReaderProvider({ children }) {
  const [textSize, setTextSize] = useState("standard");
  const [font, setFont] = useState("lexend");
  const [lineSpacing, setLineSpacing] = useState("standard");
  const [bgTint, setBgTint] = useState("none");
  const [isOpen, setIsOpen] = useState(false);

  const styles = useMemo(() => {
    const sizes = { standard: 16, medium: 18, large: 20, "extra-large": 23 };
    const lineHeights = { standard: 1.6, relaxed: 1.8, "extra-relaxed": 2.1 };
    const fonts = {
      lexend: "'Lexend', 'Open Sans', Arial, sans-serif",
      "open-sans": "'Open Sans', Arial, sans-serif",
      simple: "Arial, Helvetica, sans-serif",
    };
    const bgs = {
      none: undefined,
      cream: "#FFF9F0",
      blue: "#EFF6FF",
      lilac: "#F3E8FF",
      grey: "#F3F4F6",
    };
    return {
      fontSize: sizes[textSize] || 16,
      lineHeight: lineHeights[lineSpacing] || 1.6,
      fontFamily: fonts[font] || fonts.lexend,
      backgroundColor: bgs[bgTint],
    };
  }, [textSize, font, lineSpacing, bgTint]);

  function reset() {
    setTextSize("standard");
    setFont("lexend");
    setLineSpacing("standard");
    setBgTint("none");
  }

  return (
    <ReaderContext.Provider
      value={{
        textSize, setTextSize,
        font, setFont,
        lineSpacing, setLineSpacing,
        bgTint, setBgTint,
        isOpen, setIsOpen,
        styles, reset,
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
}

/* ─── Toggle button for the nav ─── */
export function ReaderToggle() {
  const { isOpen, setIsOpen } = useReader();

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        isOpen
          ? "bg-accent-light text-accent"
          : "text-ink-soft hover:bg-frame-light hover:text-ink-mid"
      )}
      aria-expanded={isOpen}
      aria-label="Reader support settings"
    >
      <Eye className="h-3.5 w-3.5" />
      Reader support
    </button>
  );
}

/* ─── Settings bar ─── */
export function ReaderBar() {
  const {
    isOpen,
    textSize, setTextSize,
    font, setFont,
    lineSpacing, setLineSpacing,
    bgTint, setBgTint,
    reset,
  } = useReader();

  if (!isOpen) return null;

  return (
    <div className="border-b border-frame bg-frame-bg">
      <div className="page-container flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
        {/* Text size */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-soft">Text size</span>
          <div className="flex gap-1">
            {TEXT_SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setTextSize(s.value)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded text-xs transition-colors",
                  textSize === s.value
                    ? "bg-accent text-white"
                    : "bg-white border border-frame text-ink-mid hover:border-accent/30"
                )}
                style={{ fontSize: s.fontSize }}
                aria-label={`Text size ${s.value}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-soft">Font</span>
          <div className="flex gap-1">
            {FONTS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFont(f.value)}
                className={cn(
                  "flex h-7 items-center justify-center rounded px-2 text-xs transition-colors",
                  font === f.value
                    ? "bg-accent text-white"
                    : "bg-white border border-frame text-ink-mid hover:border-accent/30"
                )}
                style={{ fontFamily: f.family }}
                title={f.name}
                aria-label={`Font: ${f.name}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spacing */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-soft">Spacing</span>
          <div className="flex gap-1">
            {SPACING.map((s) => (
              <button
                key={s.value}
                onClick={() => setLineSpacing(s.value)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded text-[10px] transition-colors",
                  lineSpacing === s.value
                    ? "bg-accent text-white"
                    : "bg-white border border-frame text-ink-mid hover:border-accent/30"
                )}
                style={{ lineHeight: s.lineHeight, letterSpacing: "-1px" }}
                title={s.value}
                aria-label={`Line spacing: ${s.value}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Background tint */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-soft">Background</span>
          <div className="flex gap-1.5">
            {TINTS.map((t) => (
              <button
                key={t.value}
                onClick={() => setBgTint(t.value)}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition-all",
                  bgTint === t.value
                    ? "border-accent scale-110"
                    : "border-frame hover:border-ink-faint"
                )}
                style={{ backgroundColor: t.color }}
                title={t.label}
                aria-label={`Background: ${t.label}`}
              />
            ))}
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-ink-soft transition-colors hover:bg-white hover:text-ink-mid"
          aria-label="Reset reader settings"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
    </div>
  );
}
