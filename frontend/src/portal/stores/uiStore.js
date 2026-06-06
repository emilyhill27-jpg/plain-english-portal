import { create } from 'zustand'

export const useUiStore = create((set) => ({
  hasUnsavedChanges: false,
  setUnsavedChanges: (v) => set({ hasUnsavedChanges: v }),
}))
