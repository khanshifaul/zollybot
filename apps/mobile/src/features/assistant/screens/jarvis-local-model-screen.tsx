import { router } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { loadLocalModel, localModelLoaded, localReply } from "@/features/assistant/model/local-llm";
import { readReply } from "@/features/voice/model/reply-voice";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";

type Phase = "idle" | "loading" | "ready" | "thinking";

/** QVAC's local text model. QVAC does not run on emulators; use a physical phone. */
export default function JarvisLocalModelScreen() {
  const { t } = useText();
  const insets = useSafeAreaInsets();
  const [background, foreground, muted, border, accent, accentForeground] = useThemeColor([
    "background",
    "foreground",
    "muted",
    "border",
    "accent",
    "accent-foreground",
  ]).map(String);
  const [phase, setPhase] = useState<Phase>(localModelLoaded() ? "ready" : "idle");
  const [progress, setProgress] = useState(0);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const stopped = useRef(false);

  useEffect(
    () => () => {
      stopped.current = true;
      speechStop.current?.();
    },
    [],
  );
  const speechStop = useRef<(() => void) | null>(null);

  const load = async () => {
    setPhase("loading");
    setProgress(0);
    try {
      await loadLocalModel((value) => setProgress(value.percentage));
      setPhase("ready");
      void haptics.notification("success");
    } catch (error) {
      setPhase("idle");
      Alert.alert(t("mobile.app.jarvis.localModel"), error instanceof Error ? error.message : String(error));
    }
  };

  const ask = async () => {
    const text = question.trim();
    if (!text || phase !== "ready") return;
    setPhase("thinking");
    setAnswer("");
    stopped.current = false;
    try {
      const reply = await localReply(
        [
          {
            role: "system",
            content: "You are Jarvis, a concise on-device assistant. Answer in short spoken sentences.",
          },
          { role: "user", content: text },
        ],
        (token) => {
          if (!stopped.current) setAnswer((current) => current + token);
        },
      );
      speechStop.current?.();
      const reading = readReply(reply, {
        onPart: () => undefined,
        onDone: () => {
          speechStop.current = null;
        },
        onError: () => {
          speechStop.current = null;
        },
      });
      speechStop.current = reading.stop;
    } catch (error) {
      Alert.alert(t("mobile.app.jarvis.localModel"), error instanceof Error ? error.message : String(error));
    } finally {
      setPhase("ready");
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
            {t("mobile.app.jarvis.localModel")}
          </Text>
          <Text style={{ color: muted, fontSize: 11 }}>{t("mobile.app.jarvis.localModelSubtitle")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 28, gap: 14 }}>
        {phase !== "ready" && phase !== "thinking" ? (
          <View style={{ borderColor: border, borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 }}>
            <Text style={{ color: muted, fontSize: 12, lineHeight: 18 }}>
              {t("mobile.app.jarvis.localModelEmulator")}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={phase === "loading"}
              onPress={() => void load()}
              style={({ pressed }) => ({
                backgroundColor: accent,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                opacity: pressed || phase === "loading" ? 0.7 : 1,
              })}
            >
              {phase === "loading" ? (
                <ActivityIndicator color={accentForeground} />
              ) : (
                <Text style={{ color: accentForeground, fontSize: 14, fontWeight: "700" }}>
                  {t("mobile.app.jarvis.downloadModel")}
                </Text>
              )}
            </Pressable>
            {phase === "loading" ? (
              <Text style={{ color: muted, fontSize: 11, textAlign: "center" }}>{Math.round(progress)}%</Text>
            ) : null}
          </View>
        ) : null}

        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder={t("mobile.app.jarvis.askPlaceholder")}
          placeholderTextColor={muted}
          editable={phase === "ready"}
          multiline
          style={{
            color: foreground,
            borderColor: border,
            borderWidth: 1,
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 12,
            minHeight: 90,
            fontSize: 14,
            textAlignVertical: "top",
          }}
        />
        <Pressable
          accessibilityRole="button"
          disabled={phase !== "ready" || !question.trim()}
          onPress={() => void ask()}
          style={({ pressed }) => ({
            backgroundColor: accent,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
            opacity: phase !== "ready" || !question.trim() ? 0.45 : pressed ? 0.75 : 1,
          })}
        >
          <Text style={{ color: accentForeground, fontSize: 14, fontWeight: "700" }}>
            {phase === "thinking" ? t("common.loading") : t("mobile.app.jarvis.send")}
          </Text>
        </Pressable>

        {answer ? (
          <View style={{ borderColor: border, borderWidth: 1, borderRadius: 16, padding: 14 }}>
            <Text style={{ color: foreground, fontSize: 14, lineHeight: 20 }}>{answer}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
