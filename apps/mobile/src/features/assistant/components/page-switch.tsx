import { router } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";

/** Swaps the two main pages: Jarvis and the office-wise Agents list. */
export function JarvisAgentsSwitch({ active }: { active: "jarvis" | "agents" }) {
  const { t } = useText();
  const [muted, border, accent, accentForeground] = useThemeColor([
    "muted",
    "border",
    "accent",
    "accent-foreground",
  ]).map(String);
  const change = (next: "jarvis" | "agents") => {
    if (next === active) return;
    void haptics.selection();
    router.replace(next === "jarvis" ? "/connected" : "/agents");
  };
  return (
    <View
      accessibilityRole="tablist"
      style={{
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        padding: 3,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: "transparent",
      }}
    >
      {(
        [
          ["jarvis", t("mobile.app.jarvis.title")],
          ["agents", t("mobile.app.route.agents")],
        ] as const
      ).map(([key, label]) => {
        const selected = key === active;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => change(key)}
            style={({ pressed }) => ({
              minWidth: 88,
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: selected ? accent : "transparent",
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Text
              style={{
                color: selected ? accentForeground : muted,
                fontSize: 12,
                fontWeight: selected ? "700" : "600",
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Centered over the native header's full width, so the menu button cannot shift it. */
export function JarvisAgentsHeader() {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: insets.top,
      }}
    >
      <JarvisAgentsSwitch active="agents" />
    </View>
  );
}
