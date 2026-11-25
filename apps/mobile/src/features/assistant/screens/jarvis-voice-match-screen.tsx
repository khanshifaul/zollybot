import { router } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useJarvisWakeState } from "@/features/assistant/model/jarvis-wake-state";
import {
  averageEmbeddings,
  loadVoiceTemplate,
  saveVoiceTemplate,
  speakerEmbedding,
  voiceMatchSupported,
} from "@/features/assistant/model/voice-match";
import { recordVoiceSample } from "@/features/assistant/native/voice-sample";
import { speakerModel, useSpeakerModel } from "@/features/voice/model/speaker-model";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";

const SAMPLES = 3;

export default function JarvisVoiceMatchScreen() {
  const { t } = useText();
  const insets = useSafeAreaInsets();
  const [background, foreground, muted, border, accent] = useThemeColor([
    "background",
    "foreground",
    "muted",
    "border",
    "accent",
  ]).map(String);
  const model = useSpeakerModel();
  const setTesting = useJarvisWakeState((state) => state.setTesting);
  const [recorded, setRecorded] = useState<number[][]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    setTesting(true);
    void speakerModel.check();
    void loadVoiceTemplate().then((template) => setEnrolled(Boolean(template)));
    return () => setTesting(false);
  }, [setTesting]);

  const record = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const samples = await recordVoiceSample(undefined, setLevel);
      const embedding = await speakerEmbedding(samples);
      const next = [...recorded, embedding];
      setRecorded(next);
      void haptics.notification("success");
      if (next.length >= SAMPLES) {
        await saveVoiceTemplate(averageEmbeddings(next));
        setEnrolled(true);
        void haptics.notification("success");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("mobile.app.jarvis.voiceMatch.failed"));
    } finally {
      setBusy(false);
      setLevel(0);
    }
  };

  const ready = model.phase === "ready";

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
            {t("mobile.app.jarvis.voiceMatch.title")}
          </Text>
          <Text style={{ color: muted, fontSize: 11 }}>{t("mobile.app.jarvis.voiceMatch.subtitle")}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 28 }}>
        {!voiceMatchSupported() ? (
          <Text style={{ color: muted, fontSize: 13, lineHeight: 19 }}>
            {t("mobile.app.jarvis.voiceMatch.androidOnly")}
          </Text>
        ) : (
          <>
            <Text style={{ color: foreground, fontSize: 15, fontWeight: "600" }}>
              {enrolled
                ? t("mobile.app.jarvis.voiceMatch.enrolled")
                : t("mobile.app.jarvis.voiceMatch.enroll", { count: recorded.length, total: SAMPLES })}
            </Text>
            <Text style={{ color: muted, fontSize: 12, lineHeight: 18, paddingTop: 6 }}>
              {t("mobile.app.jarvis.voiceMatch.enrollHint")}
            </Text>
            <View
              style={{
                marginTop: 12,
                borderColor: border,
                borderWidth: 1,
                borderRadius: 14,
                padding: 12,
              }}
            >
              <Text style={{ color: muted, fontSize: 10, fontWeight: "700", paddingBottom: 4 }}>
                {t("mobile.app.jarvis.voiceMatch.readThis")}
              </Text>
              <Text style={{ color: foreground, fontSize: 14, lineHeight: 20 }}>
                {t(
                  recorded.length === 0
                    ? "mobile.app.jarvis.voiceMatch.sample1"
                    : recorded.length === 1
                      ? "mobile.app.jarvis.voiceMatch.sample2"
                      : "mobile.app.jarvis.voiceMatch.sample3",
                )}
              </Text>
            </View>
            {!ready ? (
              <Pressable
                accessibilityRole="button"
                disabled={model.phase === "downloading"}
                onPress={() => void speakerModel.download()}
                style={{
                  marginTop: 16,
                  backgroundColor: accent,
                  borderRadius: 14,
                  paddingVertical: 13,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                  {model.phase === "downloading"
                    ? `${t("mobile.app.jarvis.voiceMatch.downloading")} ${Math.round(model.progress * 100)}%`
                    : t("mobile.app.jarvis.voiceMatch.downloadModel")}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => void record()}
                style={{
                  marginTop: 16,
                  backgroundColor: accent,
                  borderRadius: 14,
                  paddingVertical: 13,
                  alignItems: "center",
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {busy ? (
                  <View style={{ alignItems: "center", gap: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, height: 34 }}>
                      {[0.5, 0.8, 1, 0.75, 0.55].map((weight) => (
                        <View
                          key={weight}
                          style={{
                            width: 5,
                            borderRadius: 3,
                            height: 8 + level * 26 * weight,
                            backgroundColor: "#fff",
                            opacity: 0.75 + weight * 0.25,
                          }}
                        />
                      ))}
                    </View>
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                      {t("mobile.app.jarvis.voiceMatch.listening")}
                    </Text>
                  </View>
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                    {t("mobile.app.jarvis.voiceMatch.record")}
                  </Text>
                )}
              </Pressable>
            )}
            {recorded.length > 0 && !enrolled ? (
              <Text style={{ color: muted, fontSize: 12, paddingTop: 10 }}>
                {t("mobile.app.jarvis.voiceMatch.progress", { count: recorded.length, total: SAMPLES })}
              </Text>
            ) : null}
            {error ? <Text style={{ color: "#dc2626", fontSize: 12, paddingTop: 10 }}>{error}</Text> : null}
            {enrolled ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.back()}
                style={{ marginTop: 18, borderColor: border, borderWidth: 1, borderRadius: 14, paddingVertical: 13 }}
              >
                <Text style={{ color: foreground, textAlign: "center", fontWeight: "600", fontSize: 13 }}>
                  {t("mobile.app.jarvis.voiceMatch.done")}
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
