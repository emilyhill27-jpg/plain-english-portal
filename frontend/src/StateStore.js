// Plain English Portal — global state store
// Zero-dependency, Zustand-style hook built on useSyncExternalStore.
import { useSyncExternalStore } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const initialState = {
  inputText: "",
  tier: "HIGHSCHOOL",
  result: "",
  loading: false,
  error: null,
};

let state = { ...initialState };
const listeners = new Set();

function setState(patch) {
  state =
    typeof patch === "function"
      ? { ...state, ...patch(state) }
      : { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export const actions = {
  setInputText: (inputText) => setState({ inputText }),
  setTier: (tier) => setState({ tier }),
  reset: () => setState({ ...initialState }),

  async translate() {
    const { inputText, tier } = state;
    if (!inputText.trim()) {
      setState({ error: "Please paste some text first.", result: "" });
      return;
    }
    setState({ loading: true, error: null, result: "" });
    try {
      const res = await fetch(`${API_BASE}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, tier }),
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Server ${res.status}: ${detail}`);
      }
      const data = await res.json();
      setState({ result: data.result, loading: false });
    } catch (err) {
      setState({ error: err.message, loading: false });
    }
  },
};

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, () => initialState);
}
