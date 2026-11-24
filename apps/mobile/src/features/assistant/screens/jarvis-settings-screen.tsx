import { router, useFocusEffect } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppLock } from "@/features/app-lock/model/app-lock";
import {
  canDrawOverlays,
  isIgnoringBatteryOptimizations,
  openBatteryOptimizationSettings,
  openOverlaySettings,
  showOverLockScreen,
} from "@/features/app-lock/model/app-lock-native";
import { appLockEnabled } from "@/features/app-lock/model/app-lock-storage";
import { formatBytes, useHuggingFaceModels } from "@/features/assistant/model/huggingface-models";
import { loadJarvisSettings, saveJarvisSettings, useJarvisSettings } from "@/features/assistant/model/jarvis-settings";
import { loadVoiceTemplate, voiceMatchSupported } from "@/features/assistant/model/voice-match";
import { WAKE_WORD_AVAILABLE } from "@/features/assistant/native/wake-word";
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
  const installedLocalModels = useHuggingFaceModels((state) => state.installed);
  const selectedLocalKey = useHuggingFaceModels((state) => state.selectedKey);
  const refreshLocalModels = useHuggingFaceModels((state) => state.refresh);
  const appLockOn = useAppLock((state) => appLockEnabled(state.config));
  const [background, foreground, muted, border, accent] = useThemeColor([
    "background",
    "foreground",
    "muted",
    "border",
    "accent",
  ]).map(String);
  const selectedLocalModel = installedLocalModels.find((model) => model.key === selectedLocalKey);
  const [voiceEnrolled, setVoiceEnrolled] = useState(false);
  const [overlayAllowed, setOverlayAllowed] = useState(false);
  const [batteryAllowed, setBatteryAllowed] = useState(false);

  const previewLockScreen = async () => {
    await showOverLockScreen();
    router.push("/jarvis-lock");
  };

  useEffect(() => {
    void loadJarvisSettings();
    void refreshLocalModels();
    if (Platform.OS === "android") {
      void canDrawOverlays().then(setOverlayAllowed);
      void isIgnoringBatteryOptimizations().then(setBatteryAllowed);
    }
  }, [refreshLocalModels]);

  useFocusEffect(
    useCallback(() => {
      void loadVoiceTemplate().then((template) => setVoiceEnrolled(Boolean(template)));
      if (Platform.OS === "android") {
        void canDrawOverlays().then(setOverlayAllowed);
        void isIgnoringBatteryOptimizations().then(setBatteryAllowed);
      }
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
              WAKE_WORD_AVAILABLE
                ? `${t("mobile.app.jarvis.handsFreeHint")}\n${t("mobile.app.jarvis.handsFreeTest")}`
                : t("mobile.app.jarvis.handsFreeKeyMissing")
            }
            onPress={WAKE_WORD_AVAILABLE ? () => router.push("/jarvis-wake-test") : undefined}
            right={
              <Switch
                value={settings.wakeWord}
                disabled={!WAKE_WORD_AVAILABLE}
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
            right={
              <Switch
                value={settings.screenContext}
                onValueChange={(value) => void saveJarvisSettings({ screenContext: value })}
              />
            }
          />
          <Row
            title={t("mobile.app.jarvis.automate")}
            detail={t("mobile.app.jarvis.automateHint")}
            onPress={() => router.push("/jarvis-actions")}
            right={
              <Switch
                value={settings.deviceActions}
                onValueChange={(value) => void saveJarvisSettings({ deviceActions: value })}
              />
            }
          />
        </View>

        <Text style={{ color: foreground, fontSize: 16, fontWeight: "700", paddingTop: 22, paddingBottom: 8 }}>
          {t("mobile.app.jarvis.assistantSection")}
        </Text>
        <View style={{ borderColor: border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14 }}>
          <Row
            title={t("mobile.app.jarvis.localModel")}
            detail={
              selectedLocalModel
                ? `${selectedLocalModel.name} · ${formatBytes(selectedLocalModel.size)}`
                : t("mobile.app.jarvis.noLocalModel")
            }
            onPress={() => router.push("/jarvis-local-model")}
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
            right={
              <Switch
                value={settings.cloudFallback}
                onValueChange={(value) => void saveJarvisSettings({ cloudFallback: value })}
              />
            }
          />
        </View>

        {Platform.OS === "android" ? (
          <>
            <Text style={{ color: foreground, fontSize: 16, fontWeight: "700", paddingTop: 22, paddingBottom: 8 }}>
              {t("mobile.app.jarvis.permissionsSection")}
            </Text>
            <View style={{ borderColor: border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14 }}>
              <Row
                title={t("mobile.app.jarvis.overlayPermission")}
                detail={overlayAllowed ? t("mobile.app.jarvis.allowed") : t("mobile.app.jarvis.overlayHint")}
                right={
                  overlayAllowed ? undefined : (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => void openOverlaySettings()}
                      style={{
                        borderColor: accent,
                        borderRadius: 8,
                        borderWidth: 1,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                      }}
                    >
                      <Text style={{ color: accent, fontSize: 11, fontWeight: "600" }}>
                        {t("mobile.app.jarvis.allow")}
                      </Text>
                    </Pressable>
                  )
                }
              />
              <Row
                title={t("mobile.app.jarvis.batteryPermission")}
                detail={batteryAllowed ? t("mobile.app.jarvis.allowed") : t("mobile.app.jarvis.batteryHint")}
                right={
                  batteryAllowed ? undefined : (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => void openBatteryOptimizationSettings()}
                      style={{
                        borderColor: accent,
                        borderRadius: 8,
                        borderWidth: 1,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                      }}
                    >
                      <Text style={{ color: accent, fontSize: 11, fontWeight: "600" }}>
                        {t("mobile.app.jarvis.allow")}
                      </Text>
                    </Pressable>
                  )
                }
              />
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
