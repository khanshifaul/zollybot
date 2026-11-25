import { Image } from "expo-image";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { useCSSVariable } from "uniwind";
import { ConnectedScreen } from "@/features/agents/screens/connected-screen";
import { hideOverLockScreen } from "@/features/app-lock/model/app-lock-native";
import { JarvisOrb } from "@/features/assistant/components/jarvis-orb";
import { JarvisAgentsSwitch } from "@/features/assistant/components/page-switch";
import { useHuggingFaceModels } from "@/features/assistant/model/huggingface-models";
import { keepJarvisAttachments, useJarvisConversations } from "@/features/assistant/model/jarvis-conversations";
import { jarvisDeviceContext } from "@/features/assistant/model/jarvis-device-context";
import { localAttachmentText } from "@/features/assistant/model/jarvis-local-context";
import { recallFromMemory, rememberFromMessage } from "@/features/assistant/model/jarvis-memory";
import { cleanLocalReply, JARVIS_LOCAL_SYSTEM_PROMPT } from "@/features/assistant/model/jarvis-prompt";
import { useJarvisSettings } from "@/features/assistant/model/jarvis-settings";
import { useJarvisWakeState } from "@/features/assistant/model/jarvis-wake-state";
import { planLocalDeviceAction } from "@/features/assistant/model/local-device-actions";
import { loadLocalModelFile, localModelPath, localReply, unloadLocalModel } from "@/features/assistant/model/local-llm";
import { resetJarvisNotification } from "@/features/assistant/native/background-service";
import {
  deviceActions,
  deviceActionsAvailable,
  ensureDevicePermissions,
} from "@/features/assistant/native/device-actions";
import { readScreenText } from "@/features/assistant/native/local-screen-context";
import { captureScreen } from "@/features/assistant/native/screen-capture";
import { AttachmentThumbnail } from "@/features/chat/components/attachment-preview";
import { useChatAttachments } from "@/features/chat/components/use-chat-attachments";
import { useVoiceDictation } from "@/features/chat/components/use-voice-dictation";
import { useHomeOnboarding } from "@/features/onboarding/context/home-onboarding-context";
import { useAppDrawer } from "@/features/servers/components/app-drawer-shell";
import { readReply, streamReply } from "@/features/voice/model/reply-voice";
import { useMobileWorkspace, useMobileWorkspaceActions } from "@/features/workspace/context/mobile-workspace-context";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";

/** The app's main screen: Jarvis. The office-wise agent list lives at `/agents`. */
export default function JarvisScreen({ lock = false }: { lock?: boolean }) {
  const { t } = useText();
  const insets = useSafeAreaInsets();
  const { agents } = useMobileWorkspace();
  const workspace = useMobileWorkspaceActions();
  const { openDrawer, setOpeningBlocked } = useAppDrawer();
  const onboarding = useHomeOnboarding();
  const [background, foreground, muted, themeAccent, themeAccentForeground, border, danger] = useThemeColor([
    "background",
    "foreground",
    "muted",
    "accent",
    "accent-foreground",
    "border",
    "danger",
  ]).map(String);
  const accent = String(useCSSVariable("--zollybot-logo-production") ?? themeAccent);
  const accentForeground = String(useCSSVariable("--zollybot-logo-eye") ?? themeAccentForeground);
  const accentText = String(useCSSVariable("--zollybot-accent-text") ?? accent);
  const surface = String(useCSSVariable("--zollybot-bg-surface") ?? background);
  const control = String(useCSSVariable("--zollybot-bg-control") ?? background);
  const strongBorder = String(useCSSVariable("--zollybot-border-strong") ?? border);
  const [composerFocused, setComposerFocused] = useState(false);
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [localAnswer, setLocalAnswer] = useState("");
  const [localPhase, setLocalPhase] = useState<"idle" | "loading" | "thinking">("idle");
  const [localProgress, setLocalProgress] = useState(0);
  const localSpeech = useRef<(() => void) | null>(null);
  const conversationScroll = useRef<ScrollViewInstance>(null);
  const { width } = useWindowDimensions();
  const historyWidth = Math.min(352, width - 48);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyMounted, setHistoryMounted] = useState(false);
  const historyMotion = useRef(new Animated.Value(0)).current;
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
  const selectedVisionKey = useHuggingFaceModels((state) => state.visionSelectedKey);
  const refreshLocalModels = useHuggingFaceModels((state) => state.refresh);
  const localModel = useMemo(
    () => installedModels.find((model) => model.key === selectedModelKey) ?? null,
    [installedModels, selectedModelKey],
  );
  const visionModel = useMemo(
    () => installedModels.find((model) => model.key === selectedVisionKey) ?? null,
    [installedModels, selectedVisionKey],
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
    setOpeningBlocked(historyMounted);
    return () => setOpeningBlocked(false);
  }, [historyMounted, setOpeningBlocked]);
  useEffect(() => {
    if (Platform.OS !== "android" || !deviceActionsAvailable) return;
    void deviceActions.setRightEdgeGestureExclusion(true).catch(() => undefined);
    return () => {
      void deviceActions.setRightEdgeGestureExclusion(false).catch(() => undefined);
    };
  }, []);
  useEffect(() => {
    if (!historyOpen) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setHistoryOpen(false);
      setHistoryMounted(false);
      historyMotion.setValue(0);
      return true;
    });
    return () => subscription.remove();
  }, [historyMotion, historyOpen]);
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
  const animateHistory = useCallback(
    (open: boolean) => {
      Animated.timing(historyMotion, {
        toValue: open ? 1 : 0,
        duration: open ? 300 : 240,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || open) return;
        setHistoryOpen(false);
        setHistoryMounted(false);
      });
    },
    [historyMotion],
  );

  const openHistory = useCallback(() => {
    setHistoryMounted(true);
    setHistoryOpen(true);
    historyMotion.stopAnimation();
    historyMotion.setValue(0);
    animateHistory(true);
  }, [animateHistory, historyMotion]);

  const closeHistory = useCallback(() => {
    historyMotion.stopAnimation();
    animateHistory(false);
  }, [animateHistory, historyMotion]);

  const rightEdgePan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          !historyOpen && gesture.dx < -8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          historyMotion.stopAnimation();
          setHistoryMounted(true);
          historyMotion.setValue(0);
        },
        onPanResponderMove: (_event, gesture) => {
          if (gesture.dx < 0) historyMotion.setValue(Math.min(1, -gesture.dx / historyWidth));
        },
        onPanResponderRelease: (_event, gesture) => {
          const open = -gesture.dx > historyWidth * 0.28 || gesture.vx < -0.35;
          if (open) void haptics.selection();
          setHistoryOpen(open);
          Animated.timing(historyMotion, {
            toValue: open ? 1 : 0,
            duration: open ? 300 : 220,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished && !open) setHistoryMounted(false);
          });
        },
        onPanResponderTerminate: () => {
          setHistoryOpen(false);
          animateHistory(false);
        },
      }),
    [animateHistory, historyMotion, historyOpen, historyWidth],
  );

  const closeHistoryPan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) => gesture.dx > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onMoveShouldSetPanResponderCapture: (_event, gesture) =>
          gesture.dx > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => historyMotion.stopAnimation(),
        onPanResponderMove: (_event, gesture) => {
          if (gesture.dx > 0) historyMotion.setValue(Math.max(0, 1 - gesture.dx / historyWidth));
        },
        onPanResponderRelease: (_event, gesture) => {
          const open = !(gesture.dx > historyWidth * 0.24 || gesture.vx > 0.4);
          if (!open) void haptics.selection();
          setHistoryOpen(open);
          Animated.timing(historyMotion, {
            toValue: open ? 1 : 0,
            duration: open ? 280 : 220,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished && !open) setHistoryMounted(false);
          });
        },
      }),
    [historyMotion, historyWidth],
  );

  const backdropOpacity = historyMotion.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });
  const drawerTranslate = historyMotion.interpolate({ inputRange: [0, 1], outputRange: [historyWidth, 0] });

  if (onboarding.active && !lock) return <ConnectedScreen />;

  const runLocalDeviceAction = async (input: string): Promise<string | null> => {
    const action = planLocalDeviceAction(input);
    if (!action || !deviceActionsAvailable || !deviceActionsEnabled) return null;
    const numberFor = async (target: string): Promise<string | null> => {
      const cleaned = target.replace(/[^\d+]/gu, "");
      if (/^[+]?\d[\d]{2,}$/u.test(cleaned)) return cleaned;
      const contacts = await deviceActions.readContacts(target, 5);
      return contacts[0]?.number.replace(/[^\d+]/gu, "") ?? null;
    };
    try {
      if (action.type === "call" || action.type === "sms") {
        if (!(await ensureDevicePermissions())) return t("mobile.app.jarvis.actionPermission");
      }
      if (action.type === "timer") await deviceActions.setTimer(action.seconds, action.label);
      else if (action.type === "settings") await deviceActions.openSettings();
      else if (action.type === "dial") await deviceActions.dial(action.number);
      else if (action.type === "call") {
        const number = await numberFor(action.target);
        if (!number) return t("mobile.app.jarvis.actionContactNotFound");
        await deviceActions.call(number);
      } else if (action.type === "sms") {
        const number = await numberFor(action.target);
        if (!number) return t("mobile.app.jarvis.actionContactNotFound");
        await deviceActions.sendSms(number, action.message);
      } else {
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
    const wantsButler = /\b(?:ask|contact|message|tell|send(?:\s+this|\s+it)?\s+to)\s+(?:the\s+)?butler\b/iu.test(
      typed,
    );
    const screen = screenText ? `[${t("mobile.app.jarvis.screenShare")}]\n${screenText}` : "";
    const text = [screen, typed].filter(Boolean).join("\n\n");
    const imageAttachments = attachments.items.filter((item) => item.mimeType.startsWith("image/") && item.uri);
    if ((!text && attachments.items.length === 0) || sending) return;
    if (!localModel && !(imageAttachments.length > 0 && visionModel) && !wantsButler) {
      setError(t("mobile.app.jarvis.noLocalModelError"));
      return;
    }
    if (!localModel && wantsButler && !butler) {
      setError(t("mobile.app.jarvis.noAgent"));
      return;
    }
    Keyboard.dismiss();
    void haptics.impact("light");
    setSending(true);
    setError(null);
    try {
      if (!wantsButler && attachments.items.length === 0 && typed) {
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
        !wantsButler &&
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
      if ((localModel || (imageAttachments.length > 0 && visionModel)) && !wantsButler) {
        try {
          localSpeech.current?.();
          setLocalAnswer("");
          setLocalProgress(0);
          setLocalPhase("loading");
          const useVision = imageAttachments.length > 0 && visionModel !== null;
          const modelToLoad = useVision ? visionModel : localModel;
          if (!modelToLoad) throw new Error(t("mobile.app.jarvis.noLocalModelError"));
          await loadLocalModelFile(modelToLoad.uri, (value) => setLocalProgress(value.percentage));
          setLocalPhase("thinking");
          const textItems = useVision
            ? attachments.items.filter((item) => !item.mimeType.startsWith("image/"))
            : attachments.items;
          const [attachmentContext, deviceContext] = await Promise.all([
            localAttachmentText(textItems),
            jarvisDeviceContext(),
          ]);
          const imagePaths = useVision
            ? imageAttachments.map((item) => ({ path: localModelPath(item.uri ?? "") }))
            : [];
          const userTurn = [text || (useVision ? "Describe this image." : ""), attachmentContext]
            .filter(Boolean)
            .join("\n\n");
          const memory = recallFromMemory(userTurn, conversations, activeConversationId);
          const kept = await keepJarvisAttachments(attachments.items);
          const nextHistory = [
            ...localHistory.map((message) => ({
              role: message.role,
              content: message.modelContent ?? message.content,
              ...(useVision && message.attachments?.length
                ? {
                    attachments: message.attachments
                      .filter((file) => file.mimeType.startsWith("image/"))
                      .map((file) => ({ path: localModelPath(file.uri) })),
                  }
                : {}),
            })),
            {
              role: "user" as const,
              content: userTurn,
              ...(imagePaths.length > 0 ? { attachments: imagePaths } : {}),
            },
          ];
          appendMessages([
            {
              id: `user-${Date.now()}`,
              role: "user",
              content: typed,
              ...(userTurn !== typed ? { modelContent: userTurn } : {}),
              ...(kept.length > 0 ? { attachments: kept } : {}),
            },
          ]);
          let answer = "";
          const reading = streamReply({
            onPart: () => undefined,
            onDone: () => {
              localSpeech.current = null;
            },
            onError: () => {
              localSpeech.current = null;
            },
          });
          localSpeech.current = reading.stop;
          try {
            const rawReply = await localReply(
              [
                {
                  role: "system",
                  content: [JARVIS_LOCAL_SYSTEM_PROMPT, deviceContext, memory].filter(Boolean).join("\n\n"),
                },
                ...nextHistory,
              ],
              (token) => {
                answer += token;
                setLocalAnswer(answer);
                reading.update(cleanLocalReply(answer), false);
              },
            );
            const reply = cleanLocalReply(rawReply);
            reading.update(reply, true);
            appendMessages([{ id: `assistant-${Date.now()}`, role: "assistant", content: reply }]);
            if (typed) void rememberFromMessage(typed).catch(() => undefined);
          } catch (cause) {
            reading.stop();
            throw cause;
          }
          setDraft("");
          setScreenText(null);
          attachments.clear();
          setLocalPhase("idle");
          return;
        } catch (cause) {
          setLocalPhase("idle");
          throw cause;
        }
      }
      if (!butler) {
        setError(t("mobile.app.jarvis.noAgent"));
        return;
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
          paddingVertical: 10,
          minHeight: 60,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: border,
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
              onPress={openHistory}
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
              {localHistory.map((message) => {
                const fromUser = message.role === "user";
                return (
                  <View
                    key={message.id}
                    style={{
                      alignSelf: fromUser ? "flex-end" : "flex-start",
                      alignItems: fromUser ? "flex-end" : "flex-start",
                      gap: 6,
                      maxWidth: "86%",
                    }}
                  >
                    {message.attachments?.map((file) => {
                      const image = file.mimeType.startsWith("image/");
                      const frameWidth = Math.min(232, width * 0.62);
                      const ratio = file.width && file.height ? file.width / file.height : 4 / 3;
                      return image ? (
                        <Image
                          key={file.uri}
                          source={{ uri: file.uri }}
                          contentFit="cover"
                          transition={160}
                          accessibilityLabel={file.name}
                          style={{
                            width: frameWidth,
                            height: Math.min(300, frameWidth / Math.max(0.6, ratio)),
                            borderRadius: 18,
                            borderCurve: "continuous",
                            borderWidth: 1,
                            borderColor: `${foreground}14`,
                            backgroundColor: `${foreground}08`,
                          }}
                        />
                      ) : (
                        <View
                          key={file.uri}
                          style={{
                            alignItems: "center",
                            backgroundColor: `${foreground}08`,
                            borderColor: `${foreground}14`,
                            borderRadius: 16,
                            borderWidth: 1,
                            flexDirection: "row",
                            gap: 9,
                            maxWidth: frameWidth,
                            paddingHorizontal: 11,
                            paddingVertical: 9,
                          }}
                        >
                          <View
                            style={{
                              alignItems: "center",
                              backgroundColor: `${accent}24`,
                              borderRadius: 10,
                              height: 30,
                              justifyContent: "center",
                              width: 30,
                            }}
                          >
                            <FileText color={accent} size={16} />
                          </View>
                          <Text numberOfLines={2} style={{ color: foreground, flexShrink: 1, fontSize: 12 }}>
                            {file.name}
                          </Text>
                        </View>
                      );
                    })}
                    {message.content ? (
                      <View
                        style={{
                          backgroundColor: fromUser ? accent : `${foreground}08`,
                          borderColor: fromUser ? `${accent}00` : `${foreground}12`,
                          borderRadius: 20,
                          borderBottomRightRadius: fromUser ? 6 : 20,
                          borderBottomLeftRadius: fromUser ? 20 : 6,
                          borderCurve: "continuous",
                          borderWidth: 1,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: fromUser ? accentForeground : foreground,
                            fontSize: 14.5,
                            lineHeight: 21,
                          }}
                        >
                          {message.content}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
              {localPhase !== "idle" ? (
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: `${foreground}08`,
                    borderColor: `${foreground}12`,
                    borderRadius: 20,
                    borderBottomLeftRadius: 6,
                    borderWidth: 1,
                    maxWidth: "86%",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      color: localAnswer ? foreground : muted,
                      fontSize: 14.5,
                      lineHeight: 21,
                    }}
                  >
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
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <View
                  style={{
                    position: "absolute",
                    width: 248,
                    height: 248,
                    borderRadius: 124,
                    backgroundColor: `${accent}12`,
                  }}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("mobile.app.jarvis.title")}
                  onPress={() => {
                    void haptics.selection();
                    if (listeningRef.current) stopListening();
                    else startListening();
                  }}
                  style={{ padding: 18 }}
                >
                  <JarvisOrb active={listening} size={168} />
                </Pressable>
              </View>
              <Text style={{ color: foreground, fontSize: 26, fontWeight: "800", letterSpacing: -0.4 }}>
                {t("mobile.app.jarvis.title")}
              </Text>
              <Text
                style={{
                  color: accentText,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                }}
              >
                {t("mobile.app.jarvis.subtitle")}
              </Text>
              <Text style={{ color: muted, fontSize: 13, lineHeight: 19, textAlign: "center", maxWidth: 280 }}>
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
              borderColor: composerFocused ? `${accent}66` : strongBorder,
              borderWidth: 1,
              backgroundColor: surface,
              borderRadius: 24,
              borderCurve: "continuous",
              padding: 8,
              gap: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 14,
              elevation: 2,
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
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: toolsOpen ? `${accent}26` : control,
                }}
              >
                <Plus color={accentText} size={21} />
              </Pressable>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={() => void send()}
                onFocus={() => setComposerFocused(true)}
                onBlur={() => setComposerFocused(false)}
                placeholder={t("mobile.app.jarvis.askPlaceholder")}
                placeholderTextColor={muted}
                returnKeyType="send"
                multiline
                editable={!sending}
                style={{
                  color: foreground,
                  backgroundColor: control,
                  borderRadius: 18,
                  borderCurve: "continuous",
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  fontSize: 15,
                  lineHeight: 20,
                  minHeight: 42,
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
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: capture.phase !== "idle" ? `${accent}26` : control,
                  }}
                >
                  {capture.phase !== "idle" ? (
                    <Square color={accentText} size={14} />
                  ) : (
                    <Mic color={accentText} size={19} />
                  )}
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                disabled={sending || listening || (!draft.trim() && !screenText && attachments.items.length === 0)}
                onPress={() => void send()}
                style={({ pressed }) => {
                  const disabled =
                    sending || listening || (!draft.trim() && !screenText && attachments.items.length === 0);
                  return {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: disabled ? control : accent,
                    opacity: pressed && !disabled ? 0.78 : 1,
                  };
                }}
              >
                {sending ? (
                  <ActivityIndicator size="small" color={accentForeground} />
                ) : (
                  <ArrowUp
                    color={
                      listening || (!draft.trim() && !screenText && attachments.items.length === 0)
                        ? muted
                        : accentForeground
                    }
                    size={20}
                  />
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
                      backgroundColor: `${foreground}06`,
                      opacity: pressed ? 0.65 : 1,
                    })}
                  >
                    <Icon color={accentText} size={18} />
                    <Text numberOfLines={1} style={{ color: muted, fontSize: 9 }}>
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
          {error ? (
            <View
              style={{
                backgroundColor: `${danger}14`,
                borderColor: `${danger}33`,
                borderRadius: 12,
                borderWidth: 1,
                marginTop: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: danger, fontSize: 12, lineHeight: 17 }}>{error}</Text>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>

      {!historyOpen ? (
        <View
          {...rightEdgePan.panHandlers}
          style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 64, zIndex: 2 }}
        ></View>
      ) : null}

      {historyMounted ? (
        <View style={StyleSheet.absoluteFill} {...closeHistoryPan.panHandlers}>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: "#000", opacity: backdropOpacity }]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
            onPress={closeHistory}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: historyWidth,
              borderTopLeftRadius: 30,
              borderBottomLeftRadius: 30,
              borderLeftWidth: StyleSheet.hairlineWidth,
              borderColor: border,
              backgroundColor: background,
              elevation: 16,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: -10, height: 0 },
              shadowOpacity: 0.22,
              shadowRadius: 28,
              transform: [{ translateX: drawerTranslate }],
            }}
          >
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                gap: 12,
                paddingHorizontal: 22,
                paddingTop: insets.top + 20,
                paddingBottom: 18,
              }}
            >
              <Text style={{ color: foreground, flex: 1, fontSize: 26, fontWeight: "800", letterSpacing: -0.4 }}>
                {t("mobile.app.jarvis.conversations")}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("mobile.app.jarvis.newChat")}
                onPress={() => {
                  startNewConversation();
                  closeHistory();
                  setLocalAnswer("");
                  setLocalPhase("idle");
                }}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: accent,
                  borderRadius: 20,
                  height: 40,
                  justifyContent: "center",
                  opacity: pressed ? 0.7 : 1,
                  width: 40,
                })}
              >
                <Plus color={accentForeground} size={21} />
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
                          closeHistory();
                          setLocalAnswer("");
                          setLocalPhase("idle");
                        }}
                        style={({ pressed }) => ({
                          alignItems: "center",
                          backgroundColor: selected ? `${accent}14` : "transparent",
                          borderRadius: 16,
                          flex: 1,
                          flexDirection: "row",
                          gap: 10,
                          opacity: pressed ? 0.6 : 1,
                          paddingHorizontal: 10,
                          paddingVertical: 10,
                        })}
                      >
                        <View
                          style={{
                            alignItems: "center",
                            backgroundColor: selected ? accent : `${muted}12`,
                            borderRadius: 18,
                            height: 36,
                            justifyContent: "center",
                            width: 36,
                          }}
                        >
                          <MessageSquare color={selected ? accentForeground : muted} size={17} />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              color: selected ? accentText : foreground,
                              fontSize: 15,
                              fontWeight: selected ? "700" : "500",
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
                closeHistory();
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
          </Animated.View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
