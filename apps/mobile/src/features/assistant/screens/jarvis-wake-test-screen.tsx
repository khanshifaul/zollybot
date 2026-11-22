import { router } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { JarvisOrb } from "@/features/assistant/components/jarvis-orb";
import { JARVIS_PROMPTS } from "@/features/assistant/model/jarvis-prompts";
import { useJarvisWakeState } from "@/features/assistant/model/jarvis-wake-state";
import {
  createJarvisWakeManager,
  type JarvisWakeManager,
  WAKE_WORD_AVAILABLE,
} from "@/features/assistant/native/wake-word";
import { useMobileWorkspace, useMobileWorkspaceActions } from "@/features/workspace/context/mobile-workspace-context";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";

type TestPhase = "idle" | "starting" | "listening" | "error";

/** Wake-word recognition test and a set of conversation starters for the full Jarvis path. */
export default function JarvisWakeTestScreen() {
  const { t } = useText();
  const insets = useSafeAreaInsets();
  const { agents } = useMobileWorkspace();
  const workspace = useMobileWorkspaceActions();
  const setTesting = useJarvisWakeState((state) => state.setTesting);
  const [background, foreground, muted, border, accent] = useThemeColor([
    "background",
    "foreground",
    "muted",
    "border",
    "accent",
  ]).map(String);
  const [phase, setPhase] = useState<TestPhase>("idle");
  const [detections, setDetections] = useState<number[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const manager = useRef<JarvisWakeManager | null>(null);
  const butler = useMemo(() => agents.find((agent) => agent.name.toLowerCase() === "butler") ?? agents[0], [agents]);

  const stop = async () => {
    const current = manager.current;
    manager.current = null;
    setPhase("idle");
    if (!current) return;
    try {
      await current.stop();
    } catch {}
    current.delete();
  };

  const start = async () => {
    if (!WAKE_WORD_AVAILABLE || phase === "starting" || phase === "listening") return;
    setPhase("starting");
    try {
      const created = await createJarvisWakeManager(() => {
        void haptics.notification("success");
        setDetections((current) => [Date.now(), ...current].slice(0, 20));
      });
      manager.current = created;
      setPhase("listening");
    } catch {
      setPhase("error");
    }
  };

  useEffect(() => {
    setTesting(true);
    return () => {
      setTesting(false);
      const current = manager.current;
      manager.current = null;
      if (current) {
        try {
          void current.stop();
        } catch {}
        current.delete();
      }
    };
  }, [setTesting]);

  const send = async (text: string, id: string) => {
    if (!butler || sending) return;
    setSending(id);
    try {
      await workspace.sendMessage(butler.id, text, [], null, butler.serverId);
      router.push({ pathname: "/chat/[agentId]", params: { agentId: butler.id } });
    } finally {
      setSending(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: background }} edges={["top", "left", "right"]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 10 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          onPress={() => router.back()}
          style={{ width: 38, height: 38, alignItems: "center", justifyContent: "center" }}
        >
          <ChevronLeft color={foreground} size={24} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ color: foreground, fontSize: 18, fontWeight: "700" }}>
            {t("mobile.app.jarvis.wakeTest.title")}
          </Text>
          <Text style={{ color: muted, fontSize: 11 }}>{t("mobile.app.jarvis.wakeTest.subtitle")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 28 }}>
        {!WAKE_WORD_AVAILABLE ? (
          <View style={{ borderColor: border, borderWidth: 1, borderRadius: 16, padding: 14, gap: 6 }}>
            <Text style={{ color: foreground, fontSize: 14, fontWeight: "600" }}>
              {t("mobile.app.jarvis.wakeTest.keyMissingTitle")}
            </Text>
            <Text style={{ color: muted, fontSize: 12, lineHeight: 18 }}>
              {t("mobile.app.jarvis.wakeTest.keyMissingBody")}
            </Text>
          </View>
        ) : (
          <View
            style={{
              borderColor: phase === "listening" ? accent : border,
              borderWidth: 1,
              borderRadius: 18,
              padding: 16,
              alignItems: "center",
              gap: 10,
            }}
          >
            <JarvisOrb active={phase === "listening"} size={132} />
            <Text style={{ color: foreground, fontSize: 15, fontWeight: "700" }}>
              {phase === "listening"
                ? t("mobile.app.jarvis.wakeTest.listening")
                : phase === "starting"
                  ? t("mobile.app.jarvis.wakeTest.starting")
                  : phase === "error"
                    ? t("mobile.app.jarvis.wakeTest.error")
                    : t("mobile.app.jarvis.wakeTest.idle")}
            </Text>
            <Text style={{ color: muted, fontSize: 12, textAlign: "center" }}>
              {t("mobile.app.jarvis.wakeTest.phrases")}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void (phase === "listening" ? stop() : start())}
              style={({ pressed }) => ({
                backgroundColor: accent,
                borderRadius: 12,
                paddingHorizontal: 20,
                paddingVertical: 10,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                {phase === "listening" ? t("mobile.app.jarvis.wakeTest.stop") : t("mobile.app.jarvis.wakeTest.start")}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 22, paddingBottom: 8 }}>
          <Text style={{ color: foreground, flex: 1, fontSize: 16, fontWeight: "700" }}>
            {t("mobile.app.jarvis.wakeTest.detections")}
          </Text>
          <Text style={{ color: muted, fontSize: 12 }}>{detections.length}</Text>
          {detections.length > 0 ? (
            <Pressable accessibilityRole="button" onPress={() => setDetections([])}>
              <Text style={{ color: accent, fontSize: 12, paddingLeft: 12 }}>
                {t("mobile.app.jarvis.wakeTest.reset")}
              </Text>
            </Pressable>
          ) : null}
        </View>
        {detections.length === 0 ? (
          <Text style={{ color: muted, fontSize: 12 }}>{t("mobile.app.jarvis.wakeTest.noDetections")}</Text>
        ) : (
          <View style={{ gap: 6 }}>
            {detections.map((at) => (
              <View
                key={at}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  borderColor: border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                }}
              >
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: accent }} />
                <Text style={{ color: foreground, flex: 1, fontSize: 12 }}>
                  {t("mobile.app.jarvis.wakeTest.detected")}
                </Text>
                <Text style={{ color: muted, fontSize: 11 }}>
                  {new Date(at).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={{ color: foreground, fontSize: 16, fontWeight: "700", paddingTop: 24 }}>
          {t("mobile.app.jarvis.wakeTest.conversation")}
        </Text>
        <Text style={{ color: muted, fontSize: 12, lineHeight: 17, paddingTop: 4 }}>
          {t("mobile.app.jarvis.wakeTest.conversationHint")}
        </Text>
        <View style={{ gap: 8, paddingTop: 10 }}>
          {JARVIS_PROMPTS.map((prompt) => (
            <Pressable
              key={prompt.id}
              accessibilityRole="button"
              disabled={!butler || sending !== null}
              onPress={() => void send(prompt.text, prompt.id)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                borderColor: border,
                borderWidth: 1,
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 11,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: foreground, fontSize: 13, fontWeight: "600" }}>{prompt.label}</Text>
                <Text style={{ color: muted, fontSize: 11 }}>{prompt.text}</Text>
              </View>
              {sending === prompt.id ? (
                <ActivityIndicator color={accent} />
              ) : (
                <Text style={{ color: accent, fontSize: 12, fontWeight: "600" }}>
                  {t("mobile.app.jarvis.wakeTest.send")}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
