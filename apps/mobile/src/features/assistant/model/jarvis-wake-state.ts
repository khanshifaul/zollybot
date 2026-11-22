import { create } from "zustand";

/** A wake-word detection asks the Jarvis screen to open its listening state. */
export const useJarvisWakeState = create<{ nonce: number; wake: () => void }>((set) => ({
  nonce: 0,
  wake: () => set((state) => ({ nonce: state.nonce + 1 })),
}));
