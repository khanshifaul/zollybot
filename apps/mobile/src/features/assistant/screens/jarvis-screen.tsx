import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import ArrowUp from "lucide-react-native/icons/arrow-up";
import Camera from "lucide-react-native/icons/camera";
import FileText from "lucide-react-native/icons/file-text";
import ImageIcon from "lucide-react-native/icons/image";
import MonitorUp from "lucide-react-native/icons/monitor-up";
import PanelLeft from "lucide-react-native/icons/panel-left";
import Plus from "lucide-react-native/icons/plus";
import Settings2 from "lucide-react-native/icons/settings-2";
import X from "lucide-react-native/icons/x";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ConnectedScreen } from "@/features/agents/screens/connected-screen";
import { JarvisOrb } from "@/features/assistant/components/jarvis-orb";
import { JarvisAgentsSwitch } from "@/features/assistant/components/page-switch";
import { useJarvisWakeState } from "@/features/assistant/model/jarvis-wake-state";
import { AttachmentThumbnail } from "@/features/chat/components/attachment-preview";
import { useChatAttachments } from "@/features/chat/components/use-chat-attachments";
import { useVoiceDictation } from "@/features/chat/components/use-voice-dictation";
import { useHomeOnboarding } from "@/features/onboarding/context/home-onboarding-context";
import { useAppDrawer } from "@/features/servers/components/app-drawer-shell";
import { useMobileWorkspace, useMobileWorkspaceActions } from "@/features/workspace/context/mobile-workspace-context";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";

/** The app's main screen: Jarvis. The office-wise agent list lives at `/agents`. */
export default function JarvisScreen() {
  const { t } = useText();
  const insets = useSafeAreaInsets();
  const { agents } = useMobileWorkspace();
  const workspace = useMobileWorkspaceActions();
  const { openDrawer } = useAppDrawer();
  const onboarding = useHomeOnboarding();
  const [background, foreground, muted, accent, accentForeground] = useThemeColor([
    "background",
    "foreground",
    "muted",
    "accent",
    "accent-foreground",
  ]).map(String);
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const wakeNonce = useJarvisWakeState((state) => state.nonce);
  const setCapturing = useJarvisWakeState((state) => state.setCapturing);
  const attachments = useChatAttachments();
  const capture = useVoiceDictation({ enabled: true, onDraft: setDraft });
  const listeningRef = useRef(false);
  listeningRef.current = listening;

  const startListening = () => {
    if (listeningRef.current) return;
    if (!capture.available) {
      setListening(true);
      return;
    }
    if (capture.start(draft)) {
      setListening(true);
      setCapturing(true);
    }
  };

  const stopListening = () => {
    if (!listeningRef.current) return;
    if (!capture.available) {
      setListening(false);
      return;
    }
    void capture.finish().finally(() => {
      setListening(false);
      setCapturing(false);
    });
  };

  const startListeningRef = useRef(startListening);
  startListeningRef.current = startListening;
  useEffect(() => {
    if (wakeNonce > 0) startListeningRef.current();
  }, [wakeNonce]);

  useEffect(
    () => () => {
      setCapturing(false);
      void capture.finish();
    },
    [capture.finish, setCapturing],
  );
  const butler = useMemo(() => agents.find((agent) => agent.name.toLowerCase() === "butler") ?? agents[0], [agents]);

  if (onboarding.active) return <ConnectedScreen />;

  const send = async () => {
    const text = draft.trim();
    if ((!text && attachments.items.length === 0) || sending) return;
    if (!butler) {
      setError(t("mobile.app.jarvis.noAgent"));
      return;
    }
    Keyboard.dismiss();
    void haptics.impact("light");
    setSending(true);
    setError(null);
    try {
      const attachmentIds: string[] = [];
      for (const item of attachments.items) {
        const uploaded = await workspace.uploadAttachment(
          butler.id,
          { name: item.name, mimeType: item.mimeType, base64: item.base64 },
          butler.serverId,
        );
        attachmentIds.push(uploaded.id);
      }
      await workspace.sendMessage(butler.id, text, attachmentIds, null, butler.serverId);
      setDraft("");
      attachments.clear();
      router.push({ pathname: "/chat/[agentId]", params: { agentId: butler.id } });
    } catch {
      setError(t("mobile.app.jarvis.sendFailed"));
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: background }} edges={["top", "left", "right"]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingVertical: 8,
          minHeight: 56,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("mobile.agent.home.openServers")}
          onPress={openDrawer}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
        >
          <PanelLeft color={foreground} size={22} strokeWidth={2} />
        </Pressable>
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <JarvisAgentsSwitch active="jarvis" />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("mobile.app.jarvis.settingsRoute")}
          onPress={() => router.push("/jarvis-settings")}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
        >
          <Settings2 color={foreground} size={21} strokeWidth={2} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1, paddingHorizontal: 22, paddingBottom: insets.bottom + 18 }}>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("mobile.app.jarvis.title")}
              onPress={() => {
                void haptics.selection();
                if (listeningRef.current) stopListening();
                else startListening();
              }}
            >
              <JarvisOrb active={listening} size={168} />
            </Pressable>
            <Text style={{ color: foreground, fontSize: 20, fontWeight: "700" }}>{t("mobile.app.jarvis.title")}</Text>
            <Text style={{ color: muted, fontSize: 12, textAlign: "center", maxWidth: 280 }}>
              {listening
                ? capture.available
                  ? t("mobile.app.jarvis.listeningLive")
                  : t("mobile.app.jarvis.listeningHint")
                : t("mobile.app.jarvis.idleHint")}
            </Text>
          </View>

          <View
            style={{
              borderColor: `${accent}55`,
              borderWidth: 1,
              backgroundColor: `${accent}0D`,
              borderRadius: 20,
              padding: 8,
              gap: 8,
            }}
          >
            {attachments.items.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {attachments.items.map((item) => (
                  <View key={item.id} style={{ width: 74, gap: 3 }}>
                    <AttachmentThumbnail name={item.name} uri={item.uri ?? null} size={74} />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t("mobile.app.jarvis.removeAttachment")}
                      onPress={() => attachments.remove(item.id)}
                      style={{
                        position: "absolute",
                        top: 3,
                        right: 3,
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: "rgba(0,0,0,0.55)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X color="#fff" size={12} />
                    </Pressable>
                    <Text numberOfLines={1} style={{ color: muted, fontSize: 9 }}>
                      {item.mimeType.startsWith("image/") ? t("mobile.app.jarvis.photos") : item.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : null}
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("mobile.app.jarvis.addAttachment")}
                onPress={() => setToolsOpen((current) => !current)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: toolsOpen ? `${accent}22` : "transparent",
                }}
              >
                <Plus color={accent} size={21} />
              </Pressable>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={() => void send()}
                placeholder={t("mobile.app.jarvis.askPlaceholder")}
                placeholderTextColor={muted}
                returnKeyType="send"
                multiline
                editable={!sending}
                style={{
                  color: foreground,
                  backgroundColor: background,
                  borderRadius: 16,
                  paddingHorizontal: 13,
                  paddingVertical: 10,
                  fontSize: 14,
                  flex: 1,
                  maxHeight: 110,
                }}
              />
              <Pressable
                accessibilityRole="button"
                disabled={sending || listening || (!draft.trim() && attachments.items.length === 0)}
                onPress={() => void send()}
                style={({ pressed }) => ({
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: accent,
                  opacity: sending || (!draft.trim() && attachments.items.length === 0) ? 0.45 : pressed ? 0.75 : 1,
                })}
              >
                {sending ? (
                  <ActivityIndicator size="small" color={accentForeground} />
                ) : (
                  <ArrowUp color={accentForeground} size={20} />
                )}
              </Pressable>
            </View>
            {toolsOpen ? (
              <View style={{ flexDirection: "row", gap: 6, paddingHorizontal: 2 }}>
                {[
                  {
                    key: "camera",
                    label: t("mobile.app.jarvis.camera"),
                    Icon: Camera,
                    onPress: async () => {
                      if (!(await attachments.requestCamera())) return;
                      const result = await ImagePicker.launchCameraAsync({ quality: 1 });
                      const asset = result.canceled ? undefined : result.assets[0];
                      if (asset) attachments.addPhoto(asset.uri);
                    },
                  },
                  {
                    key: "photos",
                    label: t("mobile.app.jarvis.photos"),
                    Icon: ImageIcon,
                    onPress: attachments.choosePhotos,
                  },
                  {
                    key: "files",
                    label: t("mobile.app.jarvis.files"),
                    Icon: FileText,
                    onPress: attachments.chooseFiles,
                  },
                  {
                    key: "screen",
                    label: t("mobile.app.jarvis.screenShare"),
                    Icon: MonitorUp,
                    onPress: () =>
                      Alert.alert(t("mobile.app.jarvis.screenShare"), t("mobile.app.jarvis.screenShareHint")),
                  },
                ].map(({ key, label, Icon, onPress }) => (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    onPress={() => void onPress()}
                    style={({ pressed }) => ({
                      flex: 1,
                      alignItems: "center",
                      gap: 4,
                      paddingVertical: 8,
                      borderRadius: 12,
                      backgroundColor: background,
                      opacity: pressed ? 0.65 : 1,
                    })}
                  >
                    <Icon color={accent} size={18} />
                    <Text numberOfLines={1} style={{ color: muted, fontSize: 9 }}>
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
          {error ? <Text style={{ color: "#dc2626", fontSize: 12, paddingTop: 8 }}>{error}</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
