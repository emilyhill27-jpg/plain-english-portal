export const CONTEXT_TYPES = {
  ACADEMIC: {
    id: "ACADEMIC",
    label: "School worksheet",
    description: "Homework, assignments, school forms",
    color: "#5b9bd5",
  },
  GOVERNMENT: {
    id: "GOVERNMENT",
    label: "Government / official form",
    description: "MSD, IRD, Waka Kotahi, lease, employment",
    color: "#c75b39",
  },
};

export const TTS_VOICE_PREFERENCES = {
  preferredNames: ["Samantha", "Google UK English Female"],
  fallbackLangs: ["en-NZ", "en-AU", "en-GB", "en-US"],
};

export function pickVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  for (const name of TTS_VOICE_PREFERENCES.preferredNames) {
    const v = voices.find((x) => x.name === name);
    if (v) return v;
  }
  for (const lang of TTS_VOICE_PREFERENCES.fallbackLangs) {
    const v = voices.find((x) => x.lang.startsWith(lang));
    if (v) return v;
  }
  return voices[0];
}

export const READING_STYLE = {
  background: "#F5F5DC",
  color: "#1a1a1a",
  fontFamily: "OpenDyslexic, Arial, Helvetica, sans-serif",
  fontSize: "1.125rem",
  lineHeight: 1.8,
  letterSpacing: "0.02em",
};

export const HEADING_STYLE = {
  fontFamily: READING_STYLE.fontFamily,
  letterSpacing: READING_STYLE.letterSpacing,
};
