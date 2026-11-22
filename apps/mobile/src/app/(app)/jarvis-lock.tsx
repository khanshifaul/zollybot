import JarvisScreen from "@/features/assistant/screens/jarvis-screen";

/** Jarvis, shown over the phone lock screen after a wake word or the listening notification. */
export default function JarvisLockRoute() {
  return <JarvisScreen lock />;
}
