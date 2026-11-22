import { parseMobileConnectUrl } from "@zollybot/contracts/mobile-connect";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import QrCode from "lucide-react-native/icons/qr-code";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  type ScrollViewInstance,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import {
  redeemApprovedMobileConnectRequest,
  redeemMobileConnectUrl,
  requestManualMobileConnectApproval,
  waitForManualMobileConnectApproval,
} from "@/features/auth/api/mobile-auth";
import { AppLogo } from "@/features/auth/components/app-logo";
import { useMobileSession } from "@/features/auth/context/mobile-session-context";
import { useText } from "@/shared/lib/text";
import { SPLASH_HANDOFF_DEADLINE_MS, SplashContentReadyContext } from "@/shared/lib/use-splash-gate";

const DEFAULT_PORT = 17420;

function formatHost(hostname: string): string {
  return hostname.includes(":") && !hostname.startsWith("[") ? `[${hostname}]` : hostname;
}

function candidateOrigins(raw: string): string[] {
  const trimmed = raw.trim().replace(/\/+$/u, "");
  if (!trimmed) return [];
  const payload = parseMobileConnectUrl(trimmed);
  if (payload?.apiUrl) return [payload.apiUrl];
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//iu.test(trimmed) ? trimmed : `http://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return [];
    const host = formatHost(url.hostname);
    if (url.port) return [url.origin];
    return [`http://${host}:${DEFAULT_PORT}`, `http://${host}`];
  } catch {
    return [];
  }
}

async function discoverOrigin(origins: string[]): Promise<string | null> {
  for (const origin of origins) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${origin}/v1/mobile-auth/discover`, { signal: controller.signal });
      clearTimeout(t);
      if (!res.ok) continue;
      const body = await res.json().catch(() => null);
      if (body !== null && typeof body === "object" && "ok" in body && body.ok === true) {
        return origin;
      }
    } catch {}
  }
  return null;
}

export default function ConnectScreen() {
  const router = useRouter();
  const { connect } = useMobileSession();
  const { t } = useText();
  const dark = useColorScheme() === "dark";
  const theme = dark
    ? {
        background: "#081114",
        surface: "#101c21",
        field: "#0b171c",
        text: "#eef6f7",
        muted: "#91a6ad",
        border: "#22343b",
        placeholder: "#5f7780",
        accent: "#2dd4bf",
        accentText: "#042f2e",
        info: "#0e2a33",
        infoBorder: "#1d5866",
        error: "#33191b",
        errorBorder: "#6b2b30",
        errorText: "#fecdd3",
      }
    : {
        background: "#f4f7f7",
        surface: "#ffffff",
        field: "#f7fafa",
        text: "#0f1b1e",
        muted: "#5d7178",
        border: "#dbe5e7",
        placeholder: "#94a3b8",
        accent: "#0d9488",
        accentText: "#ffffff",
        info: "#ecfeff",
        infoBorder: "#a5f3fc",
        error: "#fff1f2",
        errorBorder: "#fecdd3",
        errorText: "#9f1239",
      };
  const scrollRef = useRef<ScrollViewInstance>(null);
  const reportContentReady = useContext(SplashContentReadyContext);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    reportContentReady();
    const deadline = setTimeout(reportContentReady, SPLASH_HANDOFF_DEADLINE_MS);
    return () => clearTimeout(deadline);
  }, [reportContentReady]);

  async function handleConnect() {
    const raw = url.trim();
    if (!raw) {
      setError(t("mobile.auth.connect.invalidUrl"));
      return;
    }
    setError(null);
    setConnecting(true);
    try {
      // Full Mobile Connect link/QR payload from desktop (contains ticket) -> redeem directly, no manual token.
      if (parseMobileConnectUrl(raw)?.ticket) {
        const session = await redeemMobileConnectUrl(raw);
        connect(session);
        return;
      }
      const origins = candidateOrigins(raw);
      if (origins.length === 0) {
        setError(t("mobile.auth.connect.invalidUrl"));
        return;
      }
      const found = await discoverOrigin(origins);
      if (!found) {
        const hint = origins.join(", ");
        setError(
          hint ? `${t("mobile.auth.connect.hostUnreachable")} (${hint})` : t("mobile.auth.connect.hostUnreachable"),
        );
        return;
      }
      setError(t("mobile.auth.connect.waitingApproval", { host: found }));
      const approval = await requestManualMobileConnectApproval(found);
      const status = await waitForManualMobileConnectApproval(approval);
      if (status.status === "approved" && status.ticket && status.host) {
        setError(t("mobile.auth.connect.approved"));
        const session = await redeemApprovedMobileConnectRequest(approval, status.ticket, status.host);
        connect(session);
        return;
      }
      if (status.status === "rejected") {
        setError(t("mobile.auth.connect.rejected"));
        return;
      }
      setError(t("mobile.auth.connect.expired"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("mobile.auth.connect.failed"));
    } finally {
      setConnecting(false);
    }
  }

  const active = /waiting|approved|desktop/i.test(error ?? "");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={dark ? "light" : "dark"} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: "100%", maxWidth: 460, alignSelf: "center", gap: 22 }}>
            <View style={{ alignItems: "center", gap: 10 }}>
              <AppLogo animation="blink" size={88} />
              <Text
                style={{
                  color: theme.text,
                  fontSize: 26,
                  fontWeight: "700",
                  letterSpacing: -0.4,
                  textAlign: "center",
                }}
              >
                {t("mobile.auth.connect.title")}
              </Text>
              <Text style={{ color: theme.muted, fontSize: 14, lineHeight: 20, textAlign: "center" }}>
                {t("mobile.auth.connect.subtitle")}
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/scan-qr-code")}
                disabled={connecting}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  backgroundColor: theme.accent,
                  borderRadius: 16,
                  paddingVertical: 15,
                  opacity: connecting ? 0.5 : pressed ? 0.82 : 1,
                })}
              >
                <QrCode color={theme.accentText} size={19} strokeWidth={2} />
                <Text style={{ color: theme.accentText, fontWeight: "700", fontSize: 15 }}>
                  {t("mobile.auth.connect.scanQr")}
                </Text>
              </Pressable>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 2 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
                <Text style={{ color: theme.muted, fontSize: 12 }}>{t("mobile.auth.connect.or")}</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
              </View>

              <View
                style={{
                  backgroundColor: theme.surface,
                  borderColor: error ? theme.errorBorder : theme.border,
                  borderWidth: 1,
                  borderRadius: 18,
                  padding: 12,
                  gap: 10,
                }}
              >
                <TextInput
                  placeholder={t("mobile.auth.connect.urlPlaceholder")}
                  placeholderTextColor={theme.placeholder}
                  value={url}
                  onChangeText={(value) => {
                    setUrl(value);
                    if (error) setError(null);
                  }}
                  onSubmitEditing={() => void handleConnect()}
                  returnKeyType="go"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  editable={!connecting}
                  onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 350)}
                  style={{
                    backgroundColor: theme.field,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 13,
                    minHeight: 48,
                    fontSize: 15,
                    color: theme.text,
                  }}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void handleConnect()}
                  disabled={connecting}
                  style={({ pressed }) => ({
                    backgroundColor: connecting ? theme.muted : pressed ? theme.accentText : theme.text,
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 48,
                    opacity: connecting ? 0.7 : 1,
                  })}
                >
                  {connecting ? (
                    <ActivityIndicator color={dark ? theme.background : theme.surface} />
                  ) : (
                    <Text
                      style={{
                        color: dark ? theme.background : theme.surface,
                        fontWeight: "700",
                        fontSize: 15,
                      }}
                    >
                      {t("mobile.auth.connect.action")}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>

            {error ? (
              <View
                style={{
                  backgroundColor: active ? theme.info : theme.error,
                  borderColor: active ? theme.infoBorder : theme.errorBorder,
                  borderWidth: 1,
                  borderRadius: 14,
                  padding: 12,
                  gap: 3,
                }}
              >
                <Text style={{ color: active ? theme.accent : theme.errorText, fontWeight: "700", fontSize: 13 }}>
                  {t("mobile.auth.scanner.connectFailed")}
                </Text>
                <Text style={{ color: active ? theme.muted : theme.errorText, lineHeight: 19, fontSize: 13 }}>
                  {error}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
