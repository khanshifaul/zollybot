/**
 * Phase 1 of Jarvis: the UI shell. Visible in development builds and opt-in in production with
 * `EXPO_PUBLIC_JARVIS=1`. The native wake word and local runtime land in later phases.
 */
export const JARVIS_ENABLED =
  process.env.EXPO_PUBLIC_JARVIS === "1" || (__DEV__ && process.env.EXPO_PUBLIC_JARVIS !== "0");
