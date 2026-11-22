import { create } from "zustand";

/** A wake-word detection asks the Jarvis screen to open its listening state. */
export const useJarvisWakeState = create<{
  nonce: number;
  testing: boolean;
  wake: () => void;
  setTesting: (testing: boolean) => void;
}>((set) => ({
  nonce: 0,
  testing: false,
  wake: () => set((state) => ({ nonce: state.nonce + 1 })),
  setTesting: (testing) => set({ testing }),
}));
