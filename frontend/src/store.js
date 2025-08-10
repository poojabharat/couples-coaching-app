import { create } from 'zustand'

export const useAppStore = create((set) => ({
  coupleId: localStorage.getItem('coupleId') || null,
  label: localStorage.getItem('label') || null,
  setCouple: (coupleId, label) => {
    if (coupleId) localStorage.setItem('coupleId', coupleId);
    if (label) localStorage.setItem('label', label);
    set({ coupleId, label })
  },
  clearCouple: () => {
    localStorage.removeItem('coupleId');
    localStorage.removeItem('label');
    set({ coupleId: null, label: null })
  }
}))
