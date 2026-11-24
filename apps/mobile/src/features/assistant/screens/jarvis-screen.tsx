import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import ArrowUp from "lucide-react-native/icons/arrow-up";
import Camera from "lucide-react-native/icons/camera";
import FileText from "lucide-react-native/icons/file-text";
import ImageIcon from "lucide-react-native/icons/image";
import Lock from "lucide-react-native/icons/lock";
import MessageSquare from "lucide-react-native/icons/message-square";
import Mic from "lucide-react-native/icons/mic";
import MonitorUp from "lucide-react-native/icons/monitor-up";
import PanelLeft from "lucide-react-native/icons/panel-left";
import PanelRight from "lucide-react-native/icons/panel-right";
import Plus from "lucide-react-native/icons/plus";
import Settings2 from "lucide-react-native/icons/settings-2";
import Square from "lucide-react-native/icons/square";
import Trash2 from "lucide-react-native/icons/trash-2";
import X from "lucide-react-native/icons/x";
import Zap from "lucide-react-native/icons/zap";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ConnectedScreen } from "@/features/agents/screens/connected-screen";
import { hideOverLockScreen } from "@/features/app-lock/model/app-lock-native";
import { JarvisOrb } from "@/features/assistant/components/jarvis-orb";
import { JarvisAgentsSwitch } from "@/features/assistant/components/page-switch";
import { useHuggingFaceModels } from "@/features/assistant/model/huggingface-models";
import { useJarvisConversations } from "@/features/assistant/model/jarvis-conversations";
import { cleanLocalReply, JARVIS_LOCAL_SYSTEM_PROMPT } from "@/features/assistant/model/jarvis-prompt";
import { useJarvisSettings } from "@/features/assistant/model/jarvis-settings";
import { useJarvisWakeState } from "@/features/assistant/model/jarvis-wake-state";
import { planLocalDeviceAction } from "@/features/assistant/model/local-device-actions";
import { loadLocalModelFile, localReply, unloadLocalModel } from "@/features/assistant/model/local-llm";
import { resetJarvisNotification } from "@/features/assistant/native/background-service";
import { deviceActions, deviceActionsAvailable } from "@/features/assistant/native/device-actions";
import { readScreenText } from "@/features/assistant/native/local-screen-context";
import { captureScreen } from "@/features/assistant/native/screen-capture";
import { AttachmentThumbnail } from "@/features/chat/components/attachment-preview";
import { useChatAttachments } from "@/features/chat/components/use-chat-attachments";
import { useVoiceDictation } from "@/features/chat/components/use-voice-dictation";
import { useHomeOnboarding } from "@/features/onboarding/context/home-onboarding-context";
import { useAppDrawer } from "@/features/servers/components/app-drawer-shell";
import { readReply } from "@/features/voice/model/reply-voice";
import { useMobileWorkspace, useMobileWorkspaceActions } from "@/features/workspace/context/mobile-workspace-context";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";

/** The app's main screen: Jarvis. The office-wise agent list lives at `/agents`. */
export default function JarvisScreen({ lock = false }: { lock?: boolean }) {
  const { t } = useText();
  const insets = useSafeAreaInsets();
  const { agents } = useMobileWorkspace();
  const workspace = useMobileWorkspaceActions();
  const { openDrawer } = useAppDrawer();
  const onboarding = useHomeOnboarding();
  const [background, foreground, muted, accent, accentForeground, border] = useThemeColor([
    "background",
    "foreground",
    "muted",
    "accent",
    "accent-foreground",
    "border",
  ]).map(String);
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [localAnswer, setLocalAnswer] = useState("");
  const [localPhase, setLocalPhase] = useState<"idle" | "loading" | "thinking">("idle");
  const [localProgress, setLocalProgress] = useState(0);
  const localSpeech = useRef<(() => void) | null>(null);
  const conversationScroll = useRef<ScrollViewInstance>(null);
  const { width } = useWindowDimensions();
  const [historyOpen, setHistoryOpen] = useState(false);
  const conversations = useJarvisConversations((state) => state.conversations);
  const activeConversationId = useJarvisConversations((state) => state.activeId);
  const loadConversations = useJarvisConversations((state) => state.load);
  const startNewConversation = useJarvisConversations((state) => state.startNew);
  const selectConversation = useJarvisConversations((state) => state.select);
  const appendMessages = useJarvisConversations((state) => state.append);
  const removeConversation = useJarvisConversations((state) => state.remove);
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId);
  const localHistory = activeConversation?.messages ?? [];
  const installedModels = useHuggingFaceModels((state) => state.installed);
  const selectedModelKey = useHuggingFaceModels((state) => state.selectedKey);
  const refreshLocalModels = useHuggingFaceModels((state) => state.refresh);
  const localModel = useMemo(
    () => installedModels.find((model) => model.key === selectedModelKey) ?? null,
    [installedModels, selectedModelKey],
  );
  const [error, setError] = useState<string | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [screenText, setScreenText] = useState<string | null>(null);
  const [screenReading, setScreenReading] = useState(false);
  const [lockSent, setLockSent] = useState(false);
  const wakeNonce = useJarvisWakeState((state) => state.nonce);
  const setCapturing = useJarvisWakeState((state) => state.setCapturing);
  const attachments = useChatAttachments();
  const capture = useVoiceDictation({ enabled: true, onDraft: setDraft });
  const screenContext = useJarvisSettings((state) => state.screenContext);
  const deviceActionsEnabled = useJarvisSettings((state) => state.deviceActions);
  const cloudFallback = useJarvisSettings((state) => state.cloudFallback);
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
    void refreshLocalModels();
    void loadConversations();
  }, [loadConversations, refreshLocalModels]);
  useEffect(() => {
    if (!historyOpen) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setHistoryOpen(false);
      return true;
    });
    return () => subscription.remove();
  }, [historyOpen]);
  useEffect(
    () => () => {
      localSpeech.current?.();
      void unloadLocalModel();
    },
    [],
  );

  useEffect(() => {
    if (wakeNonce > 0) startListeningRef.current();
  }, [wakeNonce]);

  useEffect(
    () => () => {
      setCapturing(false);
      void capture.finish();
      if (lock) {
        void hideOverLockScreen();
        void resetJarvisNotification();
      }
    },
    [capture.finish, setCapturing, lock],
  );

  useEffect(() => {
    if (!lock) return;
    const timer = setTimeout(() => startListeningRef.current(), 400);
    return () => clearTimeout(timer);
  }, [lock]);

  const dismissLockScreen = () => {
    void hideOverLockScreen();
    void resetJarvisNotification();
    if (router.canGoBack()) router.back();
    else router.replace("/connected");
  };
  const butler = useMemo(() => agents.find((agent) => agent.name.toLowerCase() === "butler") ?? agents[0], [agents]);
  const conversationStarted = localHistory.length > 0 || localPhase !== "idle";
  const rightEdgePan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          !historyOpen && gesture.dx < -10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderRelease: (_event, gesture) => {
          if (historyOpen || gesture.dx > -48) return;
          void haptics.selection();
          setHistoryOpen(true);
        },
      }),
    [historyOpen],
  );

  if (onboarding.active && !lock) return <ConnectedScreen />;

  const runLocalDeviceAction = async (input: string): Promise<string | null> => {
    const action = planLocalDeviceAction(input);
    if (!action || !deviceActionsAvailable || !deviceActionsEnabled) return null;
    const confirmed = await new Promise<boolean>((resolve) => {
      Alert.alert(t("mobile.app.jarvis.actions"), input, [
        { text: t("common.cancel"), style: "cancel", onPress: () => resolve(false) },
        { text: t("common.continue"), onPress: () => resolve(true) },
      ]);
    });
    if (!confirmed) return t("mobile.app.jarvis.actionCancelled");
    try {
      if (action.type === "timer") await deviceActions.setTimer(action.seconds, action.label);
      else if (action.type === "settings") await deviceActions.openSettings();
      else if (action.type === "dial") await deviceActions.dial(action.number);
      else {
        const apps = await deviceActions.listApps();
        const wanted = action.name.toLowerCase();
        const app = apps.find(
          (entry) =>
            entry.name.toLowerCase() === wanted ||
            entry.packageName.toLowerCase() === wanted ||
            entry.name.toLowerCase().includes(wanted),
        );
        if (!app) return t("mobile.app.jarvis.actionAppNotFound");
        await deviceActions.openApp(app.packageName);
      }
      return t("mobile.app.jarvis.actionDone");
    } catch (cause) {
      return cause instanceof Error ? cause.message : String(cause);
    }
  };

  const send = async () => {
    const typed = draft.trim();
    const screen = screenText ? `[${t("mobile.app.jarvis.screenShare")}]\n${screenText}` : "";
    const text = [screen, typed].filter(Boolean).join("\n\n");
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
      if (attachments.items.length === 0 && typed) {
        const actionReply = await runLocalDeviceAction(typed);
        if (actionReply !== null) {
          setDraft("");
          setLocalAnswer("");
          appendMessages([
            { id: `user-${Date.now()}`, role: "user", content: typed },
            { id: `assistant-${Date.now()}`, role: "assistant", content: actionReply },
          ]);
          setLocalPhase("idle");
          const reading = readReply(actionReply, {
            onPart: () => undefined,
            onDone: () => {
              localSpeech.current = null;
            },
            onError: () => {
              localSpeech.current = null;
            },
          });
          localSpeech.current = reading.stop;
          return;
        }
      }
      if (
        localModel &&
        attachments.items.length === 0 &&
        localHistory.length === 0 &&
        /^(hi|hello|hey)\b/iu.test(typed)
      ) {
        const greeting = "Hi! I'm Jarvis. How can I help?";
        setDraft("");
        appendMessages([
          { id: `user-${Date.now()}`, role: "user", content: typed },
          { id: `assistant-${Date.now()}`, role: "assistant", content: greeting },
        ]);
        setLocalPhase("idle");
        const reading = readReply(greeting, {
          onPart: () => undefined,
          onDone: () => {
            localSpeech.current = null;
          },
          onError: () => {
            localSpeech.current = null;
          },
        });
        localSpeech.current = reading.stop;
        return;
      }
      if (localModel && attachments.items.length === 0) {
        try {
          localSpeech.current?.();
          setLocalAnswer("");
          setLocalProgress(0);
          setLocalPhase("loading");
          await loadLocalModelFile(localModel.uri, (value) => setLocalProgress(value.percentage));
          setLocalPhase("thinking");
          const userTurn = text;
          const nextHistory = [...localHistory, { id: `user-${Date.now()}`, role: "user" as const, content: userTurn }];
          const rawReply = await localReply(
            [
              {
                role: "system",
                content: JARVIS_LOCAL_SYSTEM_PROMPT,
              },
              ...nextHistory,
            ],
            (token) => setLocalAnswer((current) => current + token),
          );
          const reply = cleanLocalReply(rawReply);
          appendMessages([{ id: `assistant-${Date.now()}`, role: "assistant", content: reply }]);
          setDraft("");
          setScreenText(null);
          setLocalPhase("idle");
          const reading = readReply(reply, {
            onPart: () => undefined,
            onDone: () => {
              localSpeech.current = null;
            },
            onError: () => {
              localSpeech.current = null;
            },
          });
          localSpeech.current = reading.stop;
          return;
        } catch (cause) {
          setLocalPhase("idle");
          if (!cloudFallback) throw cause;
        }
      }
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
      setScreenText(null);
      attachments.clear();
      if (lock) setLockSent(true);
      else router.push({ pathname: "/chat/[agentId]", params: { agentId: butler.id } });
    } catch {
      setError(t("mobile.app.jarvis.sendFailed"));
      setLocalPhase("idle");
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
        {lock ? (
          <>
            <View style={{ width: 40, alignItems: "center" }}>
              <Lock color={muted} size={18} />
            </View>
            <Text style={{ color: foreground, fontSize: 15, fontWeight: "700" }}>{t("mobile.app.jarvis.title")}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common.close")}
              onPress={dismissLockScreen}
              style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
            >
              <X color={foreground} size={21} strokeWidth={2} />
            </Pressable>
          </>
        ) : (
          <>
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
              accessibilityLabel={t("mobile.app.jarvis.conversations")}
              onPress={() => setHistoryOpen(true)}
              style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
            >
              <PanelRight color={foreground} size={21} strokeWidth={2} />
            </Pressable>
          </>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1, paddingHorizontal: 22, paddingBottom: insets.bottom + 18 }}>
          {conversationStarted ? (
            <ScrollView
              ref={conversationScroll}
              style={{ flex: 1 }}
              contentContainerStyle={{ gap: 8, paddingTop: 12, paddingBottom: 12 }}
              onContentSizeChange={() => conversationScroll.current?.scrollToEnd({ animated: true })}
            >
              {localHistory.map((message) => (
                <View
                  key={message.id}
                  style={{
                    alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                    backgroundColor: message.role === "user" ? accent : background,
                    borderColor: message.role === "user" ? accent : border,
                    borderRadius: 16,
                    borderWidth: 1,
                    maxWidth: "86%",
                    paddingHorizontal: 13,
                    paddingVertical: 9,
                  }}
                >
                  <Text
                    style={{
                      color: message.role === "user" ? accentForeground : foreground,
                      fontSize: 14,
                      lineHeight: 20,
                    }}
                  >
                    {message.content}
                  </Text>
                </View>
              ))}
              {localPhase !== "idle" ? (
                <View
                  style={{
                    alignSelf: "flex-start",
                    borderColor: border,
                    borderRadius: 16,
                    borderWidth: 1,
                    maxWidth: "86%",
                    paddingHorizontal: 13,
                    paddingVertical: 9,
                  }}
                >
                  <Text style={{ color: muted, fontSize: 13, lineHeight: 19 }}>
                    {localPhase === "loading"
                      ? t("mobile.app.jarvis.localLoading", { progress: String(Math.round(localProgress)) })
                      : localAnswer || t("mobile.app.jarvis.localThinking")}
                  </Text>
                </View>
              ) : null}
              {lock && (lockSent || !listening) ? (
                <Text style={{ color: accent, fontSize: 12, textAlign: "center" }}>
                  {lockSent ? t("mobile.app.jarvis.lockScreenSent") : t("mobile.app.jarvis.lockScreenActive")}
                </Text>
              ) : null}
            </ScrollView>
          ) : (
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
          )}

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
            {screenText ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  borderRadius: 12,
                  backgroundColor: `${accent}14`,
                }}
              >
                <MonitorUp color={accent} size={15} />
                <Text numberOfLines={1} style={{ color: foreground, flex: 1, fontSize: 12 }}>
                  {t("mobile.app.jarvis.screenShare")} · {t("mobile.app.jarvis.screenContextLocal")}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("mobile.app.jarvis.removeAttachment")}
                  hitSlop={8}
                  onPress={() => setScreenText(null)}
                >
                  <X color={muted} size={14} />
                </Pressable>
              </View>
            ) : null}
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
              {capture.available ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("mobile.chat.composer.dictate")}
                  onPress={() => {
                    void haptics.selection();
                    if (capture.phase !== "idle") void capture.finish();
                    else capture.start(draft);
                  }}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: capture.phase !== "idle" ? `${accent}22` : "transparent",
                  }}
                >
                  {capture.phase !== "idle" ? <Square color={accent} size={14} /> : <Mic color={accent} size={19} />}
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                disabled={sending || listening || (!draft.trim() && !screenText && attachments.items.length === 0)}
                onPress={() => void send()}
                style={({ pressed }) => ({
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: accent,
                  opacity:
                    sending || (!draft.trim() && !screenText && attachments.items.length === 0)
                      ? 0.45
                      : pressed
                        ? 0.75
                        : 1,
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
                    key: "actions",
                    label: t("mobile.app.jarvis.actions"),
                    Icon: Zap,
                    onPress: () => router.push("/jarvis-actions"),
                  },
                  {
                    key: "screen",
                    label: t("mobile.app.jarvis.screenShare"),
                    Icon: MonitorUp,
                    onPress: async () => {
                      if (!screenContext) {
                        Alert.alert(t("mobile.app.jarvis.screenShare"), t("mobile.app.jarvis.screenShareHint"));
                        return;
                      }
                      if (screenReading) return;
                      setScreenReading(true);
                      try {
                        const screenshot = await captureScreen();
                        const text = await readScreenText(screenshot);
                        setScreenText(text);
                        setToolsOpen(false);
                      } catch {
                        Alert.alert(t("mobile.app.jarvis.screenShare"), t("mobile.app.jarvis.screenShareHint"));
                      } finally {
                        setScreenReading(false);
                      }
                    },
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

      {!historyOpen ? (
        <View
          {...rightEdgePan.panHandlers}
          style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 24, zIndex: 2 }}
        />
      ) : null}

      {historyOpen ? (
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
            onPress={() => setHistoryOpen(false)}
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.4)" }]}
          />
          <View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: Math.min(360, width - 52),
              borderTopLeftRadius: 34,
              borderBottomLeftRadius: 34,
              backgroundColor: background,
              elevation: 16,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: -8, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 24,
            }}
          >
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                gap: 12,
                paddingHorizontal: 24,
                paddingTop: insets.top + 18,
                paddingBottom: 22,
              }}
            >
              <Text style={{ color: foreground, flex: 1, fontSize: 24, fontWeight: "700" }}>
                {t("mobile.app.jarvis.conversations")}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("mobile.app.jarvis.newChat")}
                onPress={() => {
                  startNewConversation();
                  setHistoryOpen(false);
                  setLocalAnswer("");
                  setLocalPhase("idle");
                }}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: `${muted}18`,
                  borderRadius: 20,
                  height: 40,
                  justifyContent: "center",
                  opacity: pressed ? 0.6 : 1,
                  width: 40,
                })}
              >
                <Plus color={foreground} size={21} />
              </Pressable>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}>
              {conversations.length === 0 ? (
                <View style={{ alignItems: "center", gap: 8, paddingHorizontal: 24, paddingTop: 48 }}>
                  <View
                    style={{
                      alignItems: "center",
                      backgroundColor: `${muted}14`,
                      borderRadius: 22,
                      height: 44,
                      justifyContent: "center",
                      width: 44,
                    }}
                  >
                    <MessageSquare color={muted} size={20} />
                  </View>
                  <Text style={{ color: muted, fontSize: 13, textAlign: "center" }}>
                    {t("mobile.app.jarvis.noConversations")}
                  </Text>
                </View>
              ) : (
                conversations.map((conversation) => {
                  const selected = conversation.id === activeConversationId;
                  return (
                    <View
                      key={conversation.id}
                      style={{
                        alignItems: "center",
                        flexDirection: "row",
                      }}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => {
                          selectConversation(conversation.id);
                          setHistoryOpen(false);
                          setLocalAnswer("");
                          setLocalPhase("idle");
                        }}
                        style={({ pressed }) => ({
                          alignItems: "center",
                          flex: 1,
                          flexDirection: "row",
                          gap: 10,
                          opacity: pressed ? 0.6 : 1,
                          paddingHorizontal: 12,
                          paddingVertical: 11,
                        })}
                      >
                        <View
                          style={{
                            alignItems: "center",
                            backgroundColor: selected ? `${accent}18` : `${muted}10`,
                            borderRadius: 18,
                            height: 36,
                            justifyContent: "center",
                            width: 36,
                          }}
                        >
                          <MessageSquare color={selected ? accent : muted} size={17} />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              color: selected ? accent : foreground,
                              fontSize: 15,
                              fontWeight: selected ? "600" : "500",
                            }}
                          >
                            {conversation.title}
                          </Text>
                          <Text style={{ color: muted, fontSize: 11 }}>
                            {new Date(conversation.updatedAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("common.delete")}
                        onPress={() => void removeConversation(conversation.id)}
                        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 10 })}
                      >
                        <Trash2 color={muted} size={15} />
                      </Pressable>
                    </View>
                  );
                })
              )}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setHistoryOpen(false);
                router.push("/jarvis-settings");
              }}
              style={({ pressed }) => ({
                alignItems: "center",
                flexDirection: "row",
                gap: 12,
                opacity: pressed ? 0.6 : 1,
                paddingHorizontal: 24,
                paddingTop: 12,
                paddingBottom: insets.bottom + 16,
              })}
            >
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: `${accent}18`,
                  borderRadius: 20,
                  height: 40,
                  justifyContent: "center",
                  width: 40,
                }}
              >
                <Settings2 color={accent} size={19} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={{ color: foreground, fontSize: 15, fontWeight: "600" }}>
                  {t("mobile.app.jarvis.title")}
                </Text>
                <Text numberOfLines={1} style={{ color: muted, fontSize: 11 }}>
                  {t("mobile.app.jarvis.subtitle")}
                </Text>
              </View>
              <Settings2 color={muted} size={18} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
