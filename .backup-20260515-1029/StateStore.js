import { create } from 'zustand';

export const usePortalStore = create((set) => ({
  fileId: null,
  contextType: null,      
  readingTier: 'ADULT',   
  isPlaying: false,
  audioSpeed: 0.7,
  activeBoxId: null,      
  focusedRawText: "",    
  convertedText: "",     
  isProcessing: false,

  switchDocument: (newFileId, newContextType) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    set({
      fileId: newFileId,
      contextType: newContextType,
      readingTier: 'ADULT',
      isPlaying: false,
      audioSpeed: 0.7,
      activeBoxId: null,
      focusedRawText: "",
      convertedText: "",
      isProcessing: false
    });
  },

  setReadingTier: (tier) => set({ readingTier: tier }),
  setActiveBox: (boxId, rawText) => set({ activeBoxId: boxId, focusedRawText: rawText, convertedText: "" }),
  setConvertedText: (text) => set({ convertedText: text, isProcessing: false }),
  startProcessing: () => set({ isProcessing: true })
}));
