import { create } from "zustand";

export const usePortalStore = create((set, get) => ({
  fileId: null,
  contextType: null,
  isPlaying: false,
  audioSpeed: 0.7,
  boundingBoxes: [],

  switchDocument: (newFileId, newContextType) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    set({
      fileId: newFileId,
      contextType: newContextType,
      isPlaying: false,
      audioSpeed: 0.7,
      boundingBoxes: [],
    });
  },

  setAudioSpeed: (speed) => {
    if (speed >= 0.5 && speed <= 2.0) {
      set({ audioSpeed: speed });
    }
  },

  setIsPlaying: (isPlaying) => set({ isPlaying }),
}));
