/**
 * StateStore.js — Master Reset
 * All state-clearing and speech-stopping logic lives here.
 * Import { resetAll, stopSpeech } and call them from any button.
 */

// ── Kill switch — browser-level cancel, always first ─────────
export function killSpeech() {
  window.speechSynthesis.cancel()   // line 1: kill immediately
  window.speechSynthesis.pause()    // line 2: belt-and-suspenders for Chrome
  window.speechSynthesis.cancel()   // line 3: second cancel after pause (Opera fix)
}

// ── Full speech stop — kill + clear refs + reset UI ──────────
export function stopSpeech({ utteranceRef, keepAliveRef, setSpeaking, setPaused, setActiveIdx }) {
  killSpeech()                      // always the very first thing
  if (keepAliveRef?.current) {
    clearInterval(keepAliveRef.current)
    keepAliveRef.current = null
  }
  if (utteranceRef?.current) {
    utteranceRef.current.onend      = null
    utteranceRef.current.onerror    = null
    utteranceRef.current.onboundary = null
    utteranceRef.current = null
  }
  setSpeaking?.(false)
  setPaused?.(false)
  setActiveIdx?.(-1)
}

// ── App-level reset (Open PDF + Upload Worksheet) ────────────
export function resetAll({
  setSessionId,
  setBlocks,
  setUploadedImage,
  setSourceText,
  setError,
  utteranceRef,
  keepAliveRef,
  setSpeaking,
  setPaused,
  setActiveIdx,
}) {
  killSpeech()                      // always the very first thing
  if (keepAliveRef?.current) {
    clearInterval(keepAliveRef.current)
    keepAliveRef.current = null
  }
  if (utteranceRef?.current) {
    utteranceRef.current.onend      = null
    utteranceRef.current.onerror    = null
    utteranceRef.current.onboundary = null
    utteranceRef.current = null
  }
  setSessionId?.(null)
  setBlocks?.([])
  setUploadedImage?.(null)
  setSourceText?.('')
  setError?.('')
  setSpeaking?.(false)
  setPaused?.(false)
  setActiveIdx?.(-1)
}
