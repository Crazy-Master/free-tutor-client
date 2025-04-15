import { create } from "zustand";

interface UiState {
  windowWidth: number;
  setWindowWidth: (width: number) => void;
}

export const useUiStore = create<UiState>((set) => ({
  windowWidth: typeof window !== "undefined" ? window.innerWidth : 1024,
  setWindowWidth: (width) => set({ windowWidth: width }),
}));
