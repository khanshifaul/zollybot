import { router } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import Search from "lucide-react-native/icons/search";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  formatBytes,
  type HuggingFaceFile,
  type InstalledModel,
  useHuggingFaceModels,
} from "@/features/assistant/model/huggingface-models";
import {
  loadLocalModelFile,
  localModelLoaded,
  localReply,
  unloadLocalModel,
} from "@/features/assistant/model/local-llm";
import { readReply } from "@/features/voice/model/reply-voice";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";

type Phase = "idle" | "loading" | "ready" | "thinking";

/** Hugging Face GGUF models, downloaded to this phone and run through QVAC. */
export default function JarvisHuggingFaceModelsScreen() {
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
  const results = useHuggingFaceModels((state) => state.results);
  const installed = useHuggingFaceModels((state) => state.installed);
  const downloads = useHuggingFaceModels((state) => state.downloads);
  const searching = useHuggingFaceModels((state) => state.searching);
  const error = useHuggingFaceModels((state) => state.error);
  const search = useHuggingFaceModels((state) => state.search);
  const files = useHuggingFaceModels((state) => state.files);
  const download = useHuggingFaceModels((state) => state.download);
  const remove = useHuggingFaceModels((state) => state.remove);
  const refresh = useHuggingFaceModels((state) => state.refresh);
  const [query, setQuery] = useState("Qwen3");
  const [filesFor, setFilesFor] = useState<string | null>(null);
  const [modelFiles, setModelFiles] = useState<HuggingFaceFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [selected, setSelected] = useState<InstalledModel | null>(installed[0] ?? null);
  const [phase, setPhase] = useState<Phase>(localModelLoaded() ? "ready" : "idle");
  const [progress, setProgress] = useState(0);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const stopped = useRef(false);
  const speechStop = useRef<(() => void) | null>(null);

  useEffect(() => {
    void refresh();
    void search("Qwen3");
  }, [refresh, search]);
  useEffect(() => {
    if (!selected && installed[0]) setSelected(installed[0]);
  }, [installed, selected]);
  useEffect(
    () => () => {
      stopped.current = true;
      speechStop.current?.();
      void unloadLocalModel();
    },
    [],
  );

  const openFiles = async (repo: string) => {
    if (filesFor === repo) {
      setFilesFor(null);
      return;
    }
    setFilesFor(repo);
    setFilesLoading(true);
    setModelFiles([]);
    try {
      setModelFiles(await files(repo));
    } catch (cause) {
      Alert.alert(t("mobile.app.jarvis.localModel"), cause instanceof Error ? cause.message : String(cause));
    } finally {
      setFilesLoading(false);
    }
  };

  const load = async (model: InstalledModel) => {
    setSelected(model);
    setPhase("loading");
    setProgress(0);
    try {
      await loadLocalModelFile(model.uri, (value) => setProgress(value.percentage));
      setPhase("ready");
      void haptics.notification("success");
    } catch (cause) {
      setPhase("idle");
      Alert.alert(t("mobile.app.jarvis.localModel"), cause instanceof Error ? cause.message : String(cause));
    }
  };

  const ask = async () => {
    const text = question.trim();
    if (!text || phase !== "ready" || !selected) return;
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
    } catch (cause) {
      Alert.alert(t("mobile.app.jarvis.localModel"), cause instanceof Error ? cause.message : String(cause));
    } finally {
      setPhase("ready");
    }
  };

  const submitSearch = () => {
    void haptics.selection();
    void search(query);
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              alignItems: "center",
              borderColor: border,
              borderRadius: 14,
              borderWidth: 1,
              flex: 1,
              flexDirection: "row",
              gap: 8,
              paddingHorizontal: 12,
            }}
          >
            <Search color={muted} size={16} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={submitSearch}
              placeholder={t("mobile.app.jarvis.searchModels")}
              placeholderTextColor={muted}
              returnKeyType="search"
              style={{ color: foreground, flex: 1, fontSize: 14, paddingVertical: 10 }}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={searching || !query.trim()}
            onPress={submitSearch}
            style={({ pressed }) => ({
              backgroundColor: accent,
              borderRadius: 12,
              opacity: searching || !query.trim() ? 0.4 : pressed ? 0.7 : 1,
              paddingHorizontal: 14,
              paddingVertical: 11,
            })}
          >
            {searching ? (
              <ActivityIndicator color={accentForeground} />
            ) : (
              <Text style={{ color: accentForeground, fontSize: 13, fontWeight: "700" }}>{t("common.search")}</Text>
            )}
          </Pressable>
        </View>
        {error ? <Text style={{ color: accent, fontSize: 12 }}>{error}</Text> : null}

        {results.map((model) => (
          <View key={model.id} style={{ borderColor: border, borderRadius: 14, borderWidth: 1, overflow: "hidden" }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => void openFiles(model.id)}
              style={({ pressed }) => ({ gap: 3, opacity: pressed ? 0.7 : 1, padding: 12 })}
            >
              <Text style={{ color: foreground, fontSize: 13, fontWeight: "600" }}>{model.id}</Text>
              <Text style={{ color: muted, fontSize: 11 }}>
                {t("mobile.app.jarvis.modelStats", {
                  downloads: model.downloads.toLocaleString(),
                  likes: model.likes.toLocaleString(),
                })}
                {model.gated ? ` · ${t("mobile.app.jarvis.gatedModel")}` : ""}
              </Text>
            </Pressable>
            {filesFor === model.id ? (
              <View
                style={{ backgroundColor: `${muted}08`, borderColor: border, borderTopWidth: 1, padding: 10, gap: 6 }}
              >
                {filesLoading ? <ActivityIndicator color={accent} /> : null}
                {!filesLoading && modelFiles.length === 0 ? (
                  <Text style={{ color: muted, fontSize: 11 }}>{t("mobile.app.jarvis.noModelFiles")}</Text>
                ) : null}
                {modelFiles.map((file) => {
                  const key = `${model.id}/${file.name}`;
                  const state = downloads[key];
                  const installedModel = installed.find((item) => item.key === key);
                  const busy = Boolean(state && state.progress > 0 && state.progress < 1);
                  return (
                    <View key={file.name} style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={{ color: foreground, fontSize: 12, fontWeight: "600" }}>
                          {file.quantization} · {formatBytes(file.size)}
                        </Text>
                        <Text numberOfLines={1} style={{ color: muted, fontSize: 10 }}>
                          {file.name}
                        </Text>
                        {!file.sha256 ? (
                          <Text style={{ color: accent, fontSize: 10 }}>{t("mobile.app.jarvis.noChecksum")}</Text>
                        ) : null}
                        {state?.failure ? <Text style={{ color: accent, fontSize: 10 }}>{state.failure}</Text> : null}
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        disabled={busy || model.gated || !file.sha256}
                        onPress={() => {
                          void haptics.selection();
                          void (installedModel ? uninstall(installedModel) : download(model.id, file));
                        }}
                        style={({ pressed }) => ({
                          borderColor: accent,
                          borderRadius: 8,
                          borderWidth: 1,
                          opacity: busy || model.gated || !file.sha256 ? 0.4 : pressed ? 0.65 : 1,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                        })}
                      >
                        <Text style={{ color: accent, fontSize: 11, fontWeight: "600" }}>
                          {installedModel
                            ? t("common.delete")
                            : busy
                              ? `${Math.round((state?.progress ?? 0) * 100)}%`
                              : t("common.download")}
                        </Text>
                      </Pressable>
                      {installedModel ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => void load(installedModel)}
                          style={{
                            borderColor: accent,
                            borderRadius: 8,
                            borderWidth: 1,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                          }}
                        >
                          <Text style={{ color: accent, fontSize: 11, fontWeight: "600" }}>
                            {t("mobile.app.jarvis.use")}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        ))}

        <Text style={{ color: foreground, fontSize: 15, fontWeight: "700", paddingTop: 6 }}>
          {t("mobile.app.jarvis.downloadedModels")}
        </Text>
        {installed.length === 0 ? (
          <Text style={{ color: muted, fontSize: 12 }}>{t("mobile.app.jarvis.modelsHint")}</Text>
        ) : null}
        {installed.map((model) => (
          <View
            key={model.key}
            style={{
              alignItems: "center",
              borderColor: selected?.key === model.key ? accent : border,
              borderRadius: 14,
              borderWidth: 1,
              flexDirection: "row",
              gap: 8,
              padding: 10,
            }}
          >
            <Pressable accessibilityRole="button" onPress={() => void load(model)} style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: foreground, fontSize: 12, fontWeight: "600" }}>{model.name}</Text>
              <Text style={{ color: muted, fontSize: 10 }}>
                {formatBytes(model.size)} ·{" "}
                {selected?.key === model.key ? t("mobile.app.jarvis.selected") : t("mobile.app.jarvis.use")}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => void uninstall(model)}
              style={{
                borderColor: border,
                borderRadius: 8,
                borderWidth: 1,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Text style={{ color: muted, fontSize: 11 }}>{t("common.delete")}</Text>
            </Pressable>
          </View>
        ))}

        {selected ? (
          <>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder={t("mobile.app.jarvis.askPlaceholder")}
              placeholderTextColor={muted}
              editable={phase === "ready"}
              multiline
              style={{
                borderColor: border,
                borderRadius: 16,
                borderWidth: 1,
                color: foreground,
                fontSize: 14,
                minHeight: 90,
                paddingHorizontal: 14,
                paddingVertical: 12,
                textAlignVertical: "top",
              }}
            />
            <Pressable
              accessibilityRole="button"
              disabled={phase !== "ready" || !question.trim()}
              onPress={() => void ask()}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: accent,
                borderRadius: 12,
                opacity: phase !== "ready" || !question.trim() ? 0.45 : pressed ? 0.75 : 1,
                paddingVertical: 12,
              })}
            >
              <Text style={{ color: accentForeground, fontSize: 14, fontWeight: "700" }}>
                {phase === "loading"
                  ? `${t("common.loading")} ${Math.round(progress)}%`
                  : phase === "thinking"
                    ? t("common.loading")
                    : t("mobile.app.jarvis.send")}
              </Text>
            </Pressable>
            {answer ? (
              <View style={{ borderColor: border, borderRadius: 16, borderWidth: 1, padding: 14 }}>
                <Text style={{ color: foreground, fontSize: 14, lineHeight: 20 }}>{answer}</Text>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );

  async function uninstall(model: InstalledModel) {
    await remove(model);
    if (selected?.key === model.key) {
      setSelected(null);
      setPhase("idle");
      await unloadLocalModel();
    }
  }
}
