import { APP_LOGO_VIEWBOX } from "@zollybot/brand/app-logo-shape";
import { useCallback, useEffect, useRef } from "react";
import {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { haptics } from "@/shared/lib/haptics";
import { useReducedMotion } from "@/shared/lib/motion";

export type AppLogoAnimation = "none" | "blink";

/** How far the eyes move at the end of their idle glance, in logo units. */
const GAZE_RANGE = 7;
/** The antenna leans with the same gaze, in degrees. */
const ANTENNA_TILT = 5;
const BLINK_MIN_DELAY_MS = 2_600;
const BLINK_MAX_DELAY_MS = 6_800;
const BLINK_START_DELAY_MS = 1_900;
const BLINK_HALF_DURATION_MS = 90;
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const WINK_DURATION_MS = 360;
const WINK_CLOSE_DURATION_MS = 137;
const WINK_HOLD_DURATION_MS = 72;
const WINK_OPEN_DURATION_MS = WINK_DURATION_MS - WINK_CLOSE_DURATION_MS - WINK_HOLD_DURATION_MS;
const WINK_RIGHT_REACTION_DURATION_MS = 173;
const WINK_RIGHT_RECOVERY_DURATION_MS = WINK_DURATION_MS - WINK_RIGHT_REACTION_DURATION_MS;

/** One blink. A timer starts each one, so the display does not draw frames between blinks. */
function createBlinkAnimation(): number {
  return withSequence(
    ReduceMotion.Never,
    withTiming(0.08, { duration: BLINK_HALF_DURATION_MS, easing: EASE_IN_OUT }),
    withTiming(1, { duration: BLINK_HALF_DURATION_MS, easing: EASE_IN_OUT }),
  );
}

/** A slow left-right glance with pauses at each end, so the eyes read as looking around. */
function createGazeAnimation(): number {
  return withRepeat(
    withSequence(
      withTiming(0, { duration: 1_100, easing: EASE_IN_OUT }),
      withTiming(-1, { duration: 850, easing: EASE_IN_OUT }),
      withTiming(-1, { duration: 900, easing: EASE_IN_OUT }),
      withTiming(0, { duration: 850, easing: EASE_IN_OUT }),
      withTiming(1, { duration: 850, easing: EASE_IN_OUT }),
      withTiming(1, { duration: 900, easing: EASE_IN_OUT }),
      withTiming(0, { duration: 1_100, easing: EASE_IN_OUT }),
    ),
    -1,
    false,
  );
}

export function useAppLogoMotion({ animation, size }: { animation: AppLogoAnimation; size: number }) {
  const reduceMotion = useReducedMotion();
  const leftEyeScaleY = useSharedValue(1);
  const rightEyeScaleX = useSharedValue(1);
  const rightEyeScaleY = useSharedValue(1);
  const gaze = useSharedValue(0);
  const resumeBlinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doubleBlinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopEyeAnimations = useCallback(() => {
    if (blinkTimer.current) clearTimeout(blinkTimer.current);
    if (doubleBlinkTimer.current) clearTimeout(doubleBlinkTimer.current);
    blinkTimer.current = null;
    doubleBlinkTimer.current = null;
    cancelAnimation(leftEyeScaleY);
    cancelAnimation(rightEyeScaleX);
    cancelAnimation(rightEyeScaleY);
    cancelAnimation(gaze);
  }, [gaze, leftEyeScaleY, rightEyeScaleX, rightEyeScaleY]);

  const resetEyes = useCallback(() => {
    leftEyeScaleY.set(1);
    rightEyeScaleX.set(1);
    rightEyeScaleY.set(1);
    gaze.set(0);
  }, [gaze, leftEyeScaleY, rightEyeScaleX, rightEyeScaleY]);

  const startIdleBlink = useCallback(() => {
    stopEyeAnimations();
    resetEyes();

    if (animation !== "blink" || reduceMotion) return;

    gaze.set(createGazeAnimation());

    const blink = () => {
      leftEyeScaleY.set(createBlinkAnimation());
      rightEyeScaleY.set(createBlinkAnimation());
      if (Math.random() < 0.18) {
        blinkTimer.current = setTimeout(
          () => {
            leftEyeScaleY.set(createBlinkAnimation());
            rightEyeScaleY.set(createBlinkAnimation());
          },
          BLINK_HALF_DURATION_MS * 2 + 120,
        );
      }
      blinkTimer.current = setTimeout(
        blink,
        BLINK_MIN_DELAY_MS + Math.random() * (BLINK_MAX_DELAY_MS - BLINK_MIN_DELAY_MS),
      );
    };
    blinkTimer.current = setTimeout(blink, BLINK_START_DELAY_MS);
  }, [animation, gaze, leftEyeScaleY, reduceMotion, resetEyes, rightEyeScaleY, stopEyeAnimations]);

  useEffect(() => {
    startIdleBlink();

    return () => {
      if (resumeBlinkTimer.current) clearTimeout(resumeBlinkTimer.current);
      stopEyeAnimations();
    };
  }, [startIdleBlink, stopEyeAnimations]);

  const handlePressIn = useCallback(() => {
    void haptics.impact();

    if (resumeBlinkTimer.current) clearTimeout(resumeBlinkTimer.current);
    stopEyeAnimations();
    resetEyes();

    if (!reduceMotion) {
      leftEyeScaleY.set(
        withSequence(
          ReduceMotion.Never,
          withTiming(0.08, { duration: WINK_CLOSE_DURATION_MS, easing: EASE_OUT }),
          withDelay(WINK_HOLD_DURATION_MS, withTiming(0.08, { duration: 0 })),
          withTiming(1, { duration: WINK_OPEN_DURATION_MS, easing: EASE_OUT }),
        ),
      );
      rightEyeScaleX.set(
        withSequence(
          ReduceMotion.Never,
          withTiming(0.96, { duration: WINK_RIGHT_REACTION_DURATION_MS, easing: EASE_OUT }),
          withTiming(1, { duration: WINK_RIGHT_RECOVERY_DURATION_MS, easing: EASE_OUT }),
        ),
      );
      rightEyeScaleY.set(
        withSequence(
          ReduceMotion.Never,
          withTiming(1.08, { duration: WINK_RIGHT_REACTION_DURATION_MS, easing: EASE_OUT }),
          withTiming(1, { duration: WINK_RIGHT_RECOVERY_DURATION_MS, easing: EASE_OUT }),
        ),
      );
    }

    resumeBlinkTimer.current = setTimeout(startIdleBlink, WINK_DURATION_MS);
  }, [leftEyeScaleY, reduceMotion, resetEyes, rightEyeScaleX, rightEyeScaleY, startIdleBlink, stopEyeAnimations]);

  const gazePixels = (size * GAZE_RANGE) / APP_LOGO_VIEWBOX.size;
  const leftEyeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: gaze.get() * gazePixels }, { scaleY: leftEyeScaleY.get() }],
  }));
  const rightEyeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: gaze.get() * gazePixels },
      { scaleX: rightEyeScaleX.get() },
      { scaleY: rightEyeScaleY.get() },
    ],
  }));
  const antennaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${gaze.get() * ANTENNA_TILT}deg` }],
  }));
  return { handlePressIn, antennaAnimatedStyle, leftEyeAnimatedStyle, rightEyeAnimatedStyle };
}
