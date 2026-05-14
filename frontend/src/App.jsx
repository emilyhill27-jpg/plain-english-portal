import { useStore, actions } from "./StateStore";
import "./index.css";

const TIERS = [
  { id: "ELEMENTARY", label: "Elementary (age ~9)" },
  { id: "HIGHSCHOOL", label: "High school" },
  { id: "ADULT", label: "Adult plain English" },
];

export default function App() {
  const { inputText, tier, result, loading, error } = useStore();

  return (
    <main
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "2rem 1rem",
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        color: "#1a1a1a",
        lineHeight: 1.6,
      }}
    >
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", margin: "0 0 .25rem 0" }}>
          Plain English Portal
        </h1>
        <p style={{ color: "#555", margin: 0 }}>
          Paste any contract, policy, or legal text. Choose a reading level.
          We rewrite it in plain English using Claude 3.5 Sonnet.
        </p>
      </header>

      <label
        htmlFor="source"
        style={{ display: "block", fontWeight: 600, marginBottom: ".5rem" }}
      >
        Text to translate
      </label>
      <textarea
        id="source"
        value={inputText}
        onChange={(e) => actions.setInputText(e.target.value)}
        placeholder="Paste a clause, contract, or policy here..."
        rows={10}
        aria-describedby="source-hint"
        style={{
          width: "100%",
          padding: "0.75rem",
          fontSize: "1rem",
          fontFamily: "inherit",
          borderRadius: 8,
          border: "1px solid #ccc",
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />
      <p
        id="source-hint"
        style={{ fontSize: ".875rem", color: "#666", margin: ".25rem 0 0" }}
      >
        Up to 20,000 characters.
      </p>

      <fieldset
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: "1rem",
          margin: "1.25rem 0",
        }}
      >
        <legend style={{ fontWeight: 600, padding: "0 .5rem" }}>
          Reading level
        </legend>
        {TIERS.map((t) => (
          <label
            key={t.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".4rem",
              marginRight: "1.25rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="tier"
              value={t.id}
              checked={tier === t.id}
              onChange={() => actions.setTier(t.id)}
            />
            {t.label}
          </label>
        ))}
      </fieldset>

      <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => actions.translate()}
          disabled={loading || !inputText.trim()}
          style={{
            padding: "0.6rem 1.25rem",
            fontSize: "1rem",
            fontWeight: 600,
            color: "white",
            background: loading ? "#888" : "#0b66ff",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Translating…" : "Translate"}
        </button>
        <button
          type="button"
          onClick={() => actions.reset()}
          style={{
            padding: "0.6rem 1rem",
            fontSize: "1rem",
            background: "transparent",
            border: "1px solid #ccc",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: "1.25rem",
            padding: "0.75rem 1rem",
            background: "#fff3f3",
            border: "1px solid #f1b0b0",
            borderRadius: 8,
            color: "#7a1f1f",
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <section
          aria-live="polite"
          style={{
            marginTop: "1.5rem",
            padding: "1rem 1.25rem",
            background: "#f6fbff",
            border: "1px solid #cfe4ff",
            borderRadius: 8,
            whiteSpace: "pre-wrap",
          }}
        >
          <h2 style={{ margin: "0 0 .5rem", fontSize: "1.15rem" }}>
            Plain English version
          </h2>
          {result}
        </section>
      )}
    </main>
  );
}
