import { useThemeColor } from "heroui-native/hooks";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useReducedMotion } from "@/shared/lib/motion";

/** The Jarvis presence: a still centre and two rings that breathe while it listens. */
export function JarvisOrb({ active, size = 148 }: { active: boolean; size?: number }) {
  const reduced = useReducedMotion();
  const accent = String(useThemeColor("accent"));
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (active && !reduced) {
      pulse.set(withRepeat(withTiming(1, { duration: 1_800 }), -1, false));
    } else {
      cancelAnimation(pulse);
      pulse.set(withTiming(0, { duration: 220 }));
    }
    return () => cancelAnimation(pulse);
  }, [active, pulse, reduced]);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.22 * (1 - pulse.get()),
    transform: [{ scale: 1 + pulse.get() * 0.32 }],
  }));
  const innerRingStyle = useAnimatedStyle(() => ({
    opacity: 0.36 * (1 - pulse.get() * 0.6),
    transform: [{ scale: 1 + pulse.get() * 0.16 }],
  }));
  const centred = { position: "absolute" as const, top: size / 2, left: size / 2 };
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          centred,
          {
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: accent,
          },
          ringStyle,
        ]}
      />
      <Animated.View
        style={[
          centred,
          {
            width: size * 0.62,
            height: size * 0.62,
            marginLeft: -(size * 0.62) / 2,
            marginTop: -(size * 0.62) / 2,
            borderRadius: (size * 0.62) / 2,
            backgroundColor: accent,
            opacity: 0.12,
          },
          innerRingStyle,
        ]}
      />
      <View
        style={{
          width: size * 0.36,
          height: size * 0.36,
          borderRadius: (size * 0.36) / 2,
          backgroundColor: accent,
          opacity: 0.24,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: size * 0.14,
            height: size * 0.14,
            borderRadius: (size * 0.14) / 2,
            backgroundColor: accent,
          }}
        />
      </View>
    </View>
  );
}
