import { ConnectedRoute } from "@/features/agents/screens/connected-screen";
import JarvisScreen from "@/features/assistant/screens/jarvis-screen";
import { JARVIS_ENABLED } from "@/shared/lib/jarvis-feature";

/** Jarvis is the main screen. With the feature flag off, the office-wise agent list stays home. */
export default function HomeRoute() {
  return JARVIS_ENABLED ? <JarvisScreen /> : <ConnectedRoute />;
}
