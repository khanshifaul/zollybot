import { router } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { deviceActions, deviceActionsAvailable, type LaunchableApp } from "@/features/assistant/native/device-actions";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad" | "phone-pad";
}) {
  const [foreground, muted, border, background] = useThemeColor(["foreground", "muted", "border", "background"]).map(
    String,
  );
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: muted, fontSize: 11, fontWeight: "600" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={muted}
        keyboardType={keyboardType}
        style={{
          color: foreground,
          borderColor: border,
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: background,
          fontSize: 14,
        }}
      />
    </View>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  const [accent, accentForeground] = useThemeColor(["accent", "accent-foreground"]).map(String);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: accent,
        borderRadius: 12,
        paddingVertical: 11,
        alignItems: "center",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text style={{ color: accentForeground, fontSize: 14, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}

/** Safe Android actions, each behind a confirmation. */
export default function JarvisActionsScreen() {
  const { t } = useText();
  const insets = useSafeAreaInsets();
  const [background, foreground, muted, border] = useThemeColor(["background", "foreground", "muted", "border"]).map(
    String,
  );
  const [minutes, setMinutes] = useState("5");
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [apps, setApps] = useState<LaunchableApp[]>([]);

  useEffect(() => {
    if (!deviceActionsAvailable) return;
    void deviceActions
      .listApps()
      .then((items) => setApps(items.slice(0, 40)))
      .catch(() => undefined);
  }, []);

  const run = (action: () => Promise<void>) => {
    void haptics.selection();
    void action().catch((error: unknown) => {
      Alert.alert(t("mobile.app.jarvis.actions"), error instanceof Error ? error.message : String(error));
    });
  };
  const confirm = (title: string, body: string, action: () => Promise<void>) => {
    Alert.alert(title, body, [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.continue"), onPress: () => run(action) },
    ]);
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
          <Text style={{ color: foreground, fontSize: 18, fontWeight: "700" }}>{t("mobile.app.jarvis.actions")}</Text>
          <Text style={{ color: muted, fontSize: 11 }}>{t("mobile.app.jarvis.actionsSubtitle")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 28, gap: 14 }}>
        {!deviceActionsAvailable ? (
          <Text style={{ color: muted, fontSize: 13 }}>{t("mobile.app.jarvis.actionsUnavailable")}</Text>
        ) : null}

        <View style={{ borderColor: border, borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 }}>
          <Text style={{ color: foreground, fontSize: 15, fontWeight: "700" }}>{t("mobile.app.jarvis.timer")}</Text>
          <Field
            label={t("mobile.app.jarvis.minutes")}
            value={minutes}
            onChangeText={setMinutes}
            keyboardType="number-pad"
          />
          <ActionButton
            label={t("mobile.app.jarvis.setTimer")}
            onPress={() => {
              const seconds = Math.round(Number(minutes) * 60);
              if (!Number.isFinite(seconds) || seconds <= 0) return;
              confirm(t("mobile.app.jarvis.timer"), `${minutes} min`, () =>
                deviceActions.setTimer(seconds, "Jarvis timer"),
              );
            }}
          />
        </View>

        <View style={{ borderColor: border, borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 }}>
          <Text style={{ color: foreground, fontSize: 15, fontWeight: "700" }}>{t("mobile.app.jarvis.call")}</Text>
          <Field
            label={t("mobile.app.jarvis.phoneNumber")}
            value={number}
            onChangeText={setNumber}
            keyboardType="phone-pad"
            placeholder="+1 555 0100"
          />
          <ActionButton
            label={t("mobile.app.jarvis.openDialer")}
            onPress={() => {
              if (!number.trim()) return;
              confirm(t("mobile.app.jarvis.call"), number, () => deviceActions.dial(number.trim()));
            }}
          />
        </View>

        <View style={{ borderColor: border, borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 }}>
          <Text style={{ color: foreground, fontSize: 15, fontWeight: "700" }}>{t("mobile.app.jarvis.message")}</Text>
          <Field
            label={t("mobile.app.jarvis.phoneNumber")}
            value={number}
            onChangeText={setNumber}
            keyboardType="phone-pad"
          />
          <Field
            label={t("mobile.app.jarvis.messageText")}
            value={message}
            onChangeText={setMessage}
            placeholder={t("mobile.app.jarvis.messageText")}
          />
          <ActionButton
            label={t("mobile.app.jarvis.writeMessage")}
            onPress={() => {
              if (!number.trim() || !message.trim()) return;
              confirm(t("mobile.app.jarvis.message"), message, () =>
                deviceActions.composeMessage(number.trim(), message.trim()),
              );
            }}
          />
        </View>

        <View style={{ borderColor: border, borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 }}>
          <Text style={{ color: foreground, fontSize: 15, fontWeight: "700" }}>{t("mobile.app.jarvis.apps")}</Text>
          {apps.map((app) => (
            <Pressable
              key={app.packageName}
              accessibilityRole="button"
              onPress={() =>
                confirm(t("mobile.app.jarvis.openApp"), app.name, () => deviceActions.openApp(app.packageName))
              }
              style={({ pressed }) => ({
                paddingVertical: 10,
                borderBottomColor: border,
                borderBottomWidth: 1,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text style={{ color: foreground, fontSize: 14, fontWeight: "600" }}>{app.name}</Text>
              <Text style={{ color: muted, fontSize: 10 }}>{app.packageName}</Text>
            </Pressable>
          ))}
        </View>

        <ActionButton
          label={t("mobile.app.jarvis.openSettings")}
          onPress={() => confirm(t("mobile.app.jarvis.openSettings"), "", () => deviceActions.openSettings())}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
