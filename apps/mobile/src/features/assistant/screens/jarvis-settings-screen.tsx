import { router, useFocusEffect } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppLock } from "@/features/app-lock/model/app-lock";
import { showOverLockScreen } from "@/features/app-lock/model/app-lock-native";
import { appLockEnabled } from "@/features/app-lock/model/app-lock-storage";

import { JARVIS_MODELS, jarvisModel } from "@/features/assistant/model/jarvis-models";
import { loadJarvisSettings, saveJarvisSettings, useJarvisSettings } from "@/features/assistant/model/jarvis-settings";
import { loadVoiceTemplate, voiceMatchSupported } from "@/features/assistant/model/voice-match";
import { WAKE_WORD_CONFIGURED } from "@/features/assistant/native/wake-word";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";

function Row({
  title,
  detail,
  right,
  onPress,
  disabled,
}: {
  title: string;
  detail?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const [foreground, muted, border] = useThemeColor(["foreground", "muted", "border"]).map(String);
  const content = (
    <>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={{ color: foreground, fontSize: 14, fontWeight: "600" }}>{title}</Text>
        {detail ? <Text style={{ color: muted, fontSize: 12, lineHeight: 17 }}>{detail}</Text> : null}
      </View>
      {right}
    </>
  );
  if (!onPress) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: border,
          opacity: disabled ? 0.55 : 1,
        }}
      >
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: border,
        opacity: pressed || disabled ? 0.6 : 1,
      })}
    >
      {content}
    </Pressable>
  );
}

/** Jarvis settings, reached from the drawer like server settings. */
export default function JarvisSettingsScreen() {
  const { t } = useText();
  const insets = useSafeAreaInsets();
  const settings = useJarvisSettings();
  const appLockOn = useAppLock((state) => appLockEnabled(state.config));
  const [background, foreground, muted, border, accent] = useThemeColor([
    "background",
    "foreground",
    "muted",
    "border",
    "accent",
  ]).map(String);
  const selectedModel = jarvisModel(settings.modelId);
  const selectedVision = jarvisModel(settings.visionModelId);
  const [voiceEnrolled, setVoiceEnrolled] = useState(false);

  const previewLockScreen = async () => {
    await showOverLockScreen();
    router.push("/jarvis-lock");
  };

  useEffect(() => {
    void loadJarvisSettings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadVoiceTemplate().then((template) => setVoiceEnrolled(Boolean(template)));
    }, []),
  );

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
            {t("mobile.app.jarvis.settingsRoute")}
          </Text>
          <Text style={{ color: muted, fontSize: 11 }}>{t("mobile.app.jarvis.subtitle")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 32 }}>
        <Text style={{ color: foreground, fontSize: 16, fontWeight: "700", paddingBottom: 8 }}>
          {t("mobile.app.jarvis.deviceControls")}
        </Text>
        <View style={{ borderColor: border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14 }}>
          <Row
            title={t("mobile.app.jarvis.handsFree")}
            detail={
              WAKE_WORD_CONFIGURED
                ? `${t("mobile.app.jarvis.handsFreeHint")}\n${t("mobile.app.jarvis.handsFreeTest")}`
                : t("mobile.app.jarvis.handsFreeKeyMissing")
            }
            onPress={WAKE_WORD_CONFIGURED ? () => router.push("/jarvis-wake-test") : undefined}
            right={
              <Switch
                value={settings.wakeWord}
                disabled={!WAKE_WORD_CONFIGURED}
                onValueChange={(value) => void saveJarvisSettings({ wakeWord: value })}
              />
            }
          />
          <View style={{ marginLeft: 14, borderLeftWidth: 2, borderLeftColor: border, paddingLeft: 10 }}>
            <Row
              title={t("mobile.app.jarvis.voiceMatch")}
              detail={
                !voiceMatchSupported()
                  ? t("mobile.app.jarvis.voiceMatch.androidOnly")
                  : voiceEnrolled
                    ? t("mobile.app.jarvis.voiceMatch.onlyYours")
                    : t("mobile.app.jarvis.voiceMatch.enrollAction")
              }
              right={
                <Switch
                  value={settings.voiceMatch}
                  disabled={!voiceMatchSupported() || !voiceEnrolled}
                  onValueChange={(value) => void saveJarvisSettings({ voiceMatch: value })}
                />
              }
              onPress={() => router.push("/jarvis-voice-match")}
            />
          </View>
          <Row
            title={t("mobile.app.jarvis.lockScreen")}
            detail={appLockOn ? t("mobile.app.jarvis.lockScreenAppLock") : t("mobile.app.jarvis.lockScreenHint")}
            disabled={appLockOn}
            onPress={() => void previewLockScreen()}
            right={
              <Switch
                value={settings.lockScreen}
                disabled={appLockOn}
                onValueChange={(value) => void saveJarvisSettings({ lockScreen: value })}
              />
            }
          />
          <Row
            title={t("mobile.app.jarvis.screenContext")}
            detail={t("mobile.app.jarvis.screenContextHint")}
            disabled
            right={<Switch value={settings.screenContext} disabled />}
          />
          <Row
            title={t("mobile.app.jarvis.automate")}
            detail={t("mobile.app.jarvis.automateHint")}
            disabled
            right={<Switch value={settings.deviceActions} disabled />}
          />
        </View>

        <Text style={{ color: foreground, fontSize: 16, fontWeight: "700", paddingTop: 22, paddingBottom: 8 }}>
          {t("mobile.app.jarvis.assistantSection")}
        </Text>
        <View style={{ borderColor: border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14 }}>
          <Row
            title={t("mobile.app.jarvis.localModel")}
            detail={`${selectedModel.name} · ${selectedModel.parameters}`}
          />
          <Row
            title={t("mobile.app.jarvis.visionModel")}
            detail={`${selectedVision.name} · ${selectedVision.parameters}`}
          />
          <Row
            title={t("mobile.app.jarvis.voice")}
            detail={t("mobile.app.jarvis.voiceValue")}
            right={<ChevronRight color={muted} size={18} />}
            onPress={() => router.push("/settings/voice")}
          />
          <Row
            title={t("mobile.app.jarvis.cloud")}
            detail={t("mobile.app.jarvis.cloudHint")}
            disabled
            right={<Switch value={false} disabled />}
          />
        </View>

        <Text style={{ color: foreground, fontSize: 16, fontWeight: "700", paddingTop: 22 }}>
          {t("mobile.app.jarvis.models")}
        </Text>
        <Text style={{ color: muted, fontSize: 12, lineHeight: 17, paddingTop: 4 }}>
          {t("mobile.app.jarvis.modelsHint")}
        </Text>
        <View style={{ gap: 8, paddingTop: 10 }}>
          {JARVIS_MODELS.map((model) => {
            const selected =
              model.kind === "vision" ? settings.visionModelId === model.id : settings.modelId === model.id;
            return (
              <Pressable
                key={model.id}
                accessibilityRole="button"
                onPress={() => {
                  void haptics.selection();
                  void saveJarvisSettings(
                    model.kind === "vision" ? { visionModelId: model.id } : { modelId: model.id },
                  );
                }}
                style={({ pressed }) => ({
                  borderWidth: 1,
                  borderColor: selected ? accent : border,
                  backgroundColor: selected ? `${accent}10` : background,
                  borderRadius: 14,
                  padding: 12,
                  gap: 2,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ color: foreground, flex: 1, fontSize: 13, fontWeight: "600" }}>{model.name}</Text>
                  <Text style={{ color: muted, fontSize: 10 }}>
                    {t(model.kind === "vision" ? "mobile.app.jarvis.kind.vision" : "mobile.app.jarvis.kind.text")}
                  </Text>
                </View>
                <Text style={{ color: muted, fontSize: 11 }}>
                  {model.family} · {model.parameters} · {model.context} ·{" "}
                  {selected ? t("mobile.app.jarvis.selected") : t("mobile.app.jarvis.notDownloaded")}
                </Text>
                <Text style={{ color: muted, fontSize: 11 }}>{model.use}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
