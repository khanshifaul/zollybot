import { parseMobileConnectUrl } from "@zollybot/contracts/mobile-connect";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import {
  redeemApprovedMobileConnectRequest,
  redeemMobileConnectUrl,
  requestManualMobileConnectApproval,
  waitForManualMobileConnectApproval,
} from "@/features/auth/api/mobile-auth";
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ maxWidth: 520, width: "100%", alignSelf: "center", gap: 14 }}>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 30, fontWeight: "700", color: "#111827" }}>{t("mobile.auth.connect.title")}</Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: "#4b5563" }}>{t("mobile.auth.connect.subtitle")}</Text>
          </View>

          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 18,
              padding: 16,
              gap: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>{t("mobile.auth.connect.scanQr")}</Text>
            <Text style={{ fontSize: 14, lineHeight: 20, color: "#4b5563" }}>{t("mobile.auth.connect.help")}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/scan-qr-code")}
              disabled={connecting}
              style={({ pressed }) => ({
                backgroundColor: pressed || connecting ? "#374151" : "#111827",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
              })}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{t("mobile.auth.connect.scanQr")}</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: "#d1d5db" }} />
            <Text style={{ color: "#6b7280", fontSize: 13 }}>{t("mobile.auth.connect.or")}</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#d1d5db" }} />
          </View>

          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 18,
              padding: 16,
              gap: 10,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>{t("mobile.auth.connect.action")}</Text>
            <Text style={{ fontSize: 13, lineHeight: 18, color: "#6b7280" }}>
              {t("mobile.auth.connect.urlPlaceholder")}
            </Text>
            <TextInput
              placeholder={t("mobile.auth.connect.urlPlaceholder")}
              placeholderTextColor="#9ca3af"
              value={url}
              onChangeText={(value) => {
                setUrl(value);
                if (error) setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              editable={!connecting}
              multiline
              style={{
                borderWidth: 1,
                borderColor: error ? "#fca5a5" : "#d1d5db",
                backgroundColor: "#f9fafb",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
                minHeight: 56,
                color: "#111827",
              }}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => void handleConnect()}
              disabled={connecting}
              style={({ pressed }) => ({
                backgroundColor: connecting ? "#9ca3af" : pressed ? "#1f2937" : "#374151",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
              })}
            >
              {connecting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                  {connecting ? t("mobile.auth.connect.connecting") : t("mobile.auth.connect.action")}
                </Text>
              )}
            </Pressable>
          </View>

          {error ? (
            <View
              style={{
                backgroundColor: /waiting|approved|desktop/i.test(error) ? "#eff6ff" : "#fef2f2",
                borderColor: /waiting|approved|desktop/i.test(error) ? "#bfdbfe" : "#fecaca",
                borderWidth: 1,
                borderRadius: 14,
                padding: 12,
                gap: 4,
              }}
            >
              <Text
                style={{ color: /waiting|approved|desktop/i.test(error) ? "#1e3a8a" : "#991b1b", fontWeight: "600" }}
              >
                {t("mobile.auth.scanner.connectFailed")}
              </Text>
              <Text style={{ color: /waiting|approved|desktop/i.test(error) ? "#1d4ed8" : "#b91c1c", lineHeight: 20 }}>
                {error}
              </Text>
              {/code|link|ticket|expired|used|restart|different desktop|identity/i.test(error) &&
              !/waiting|approved/i.test(error) ? (
                <Text style={{ color: "#7f1d1d", fontSize: 12, lineHeight: 18 }}>
                  {t("mobile.auth.error.codeExpired")}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
