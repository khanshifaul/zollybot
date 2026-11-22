import {
  APP_LOGO_VIEWBOX,
  ROBOT_ANTENNA,
  ROBOT_EARS,
  ROBOT_EYES,
  ROBOT_HEAD,
  ROBOT_SMILE,
} from "@zollybot/brand/app-logo-shape";
import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useCSSVariable } from "uniwind";

import { type AppLogoAnimation, useAppLogoMotion } from "@/features/auth/components/use-app-logo-motion";
import { useText } from "@/shared/lib/text";

export interface AppLogoProps {
  animation?: AppLogoAnimation;
  interactive?: boolean;
  size?: number;
}

const EYE_LEFT_X = ROBOT_EYES.leftCx;
const EYE_RIGHT_X = ROBOT_EYES.rightCx;
const EYE_Y = ROBOT_EYES.cy;
const ANTENNA_BASE_X = 120;
const ANTENNA_BASE_Y = 61;

function resolveColor(value: string | number | undefined, fallback: string): string {
  return String(value ?? fallback);
}

export function AppLogo({ animation = "none", interactive = false, size = 240 }: AppLogoProps) {
  const { t } = useText();
  const viewBox = `${APP_LOGO_VIEWBOX.x} ${APP_LOGO_VIEWBOX.y} ${APP_LOGO_VIEWBOX.size} ${APP_LOGO_VIEWBOX.size}`;
  const layerPoint = (x: number, y: number): [number, number, number] => [
    ((x - APP_LOGO_VIEWBOX.x) * size) / APP_LOGO_VIEWBOX.size,
    ((y - APP_LOGO_VIEWBOX.y) * size) / APP_LOGO_VIEWBOX.size,
    0,
  ];
  const logoColor = resolveColor(useCSSVariable("--zollybot-logo-production"), "#2dd4bf");
  const eyeColor = resolveColor(useCSSVariable("--zollybot-logo-eye"), "#042f2e");
  const { handlePressIn, antennaAnimatedStyle, leftEyeAnimatedStyle, rightEyeAnimatedStyle } = useAppLogoMotion({
    animation,
    size,
  });
  const layerStyle = {
    height: size,
    left: 0,
    position: "absolute" as const,
    top: 0,
    width: size,
  };
  const eyeOrigin = (x: number): [number, number, number] => layerPoint(x, EYE_Y);

  const logo = (
    <View
      style={{ height: size, width: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox={viewBox}>
        <Rect
          x={ROBOT_EARS.leftX}
          y={ROBOT_EARS.y - ROBOT_EARS.height / 2}
          width={ROBOT_EARS.width}
          height={ROBOT_EARS.height}
          rx={ROBOT_EARS.rx}
          fill={logoColor}
        />
        <Rect
          x={ROBOT_EARS.rightX}
          y={ROBOT_EARS.y - ROBOT_EARS.height / 2}
          width={ROBOT_EARS.width}
          height={ROBOT_EARS.height}
          rx={ROBOT_EARS.rx}
          fill={logoColor}
        />
        <Rect
          x={ROBOT_HEAD.cx - ROBOT_HEAD.width / 2}
          y={ROBOT_HEAD.cy - ROBOT_HEAD.height / 2}
          width={ROBOT_HEAD.width}
          height={ROBOT_HEAD.height}
          rx={ROBOT_HEAD.rx}
          fill={logoColor}
        />
        <Path
          d={`M ${ROBOT_SMILE.x1} ${ROBOT_SMILE.y} Q ${ROBOT_HEAD.cx} ${ROBOT_SMILE.y + ROBOT_SMILE.depth} ${ROBOT_SMILE.x2} ${ROBOT_SMILE.y}`}
          fill="none"
          stroke={eyeColor}
          strokeLinecap="round"
          strokeWidth={ROBOT_SMILE.strokeWidth}
        />
      </Svg>

      <Animated.View
        pointerEvents="none"
        style={[
          layerStyle,
          {
            transformOrigin: layerPoint(ANTENNA_BASE_X, ANTENNA_BASE_Y),
          },
          antennaAnimatedStyle,
        ]}
      >
        <Svg width={size} height={size} viewBox={viewBox}>
          <Path
            d={ROBOT_ANTENNA.stemPath}
            fill="none"
            stroke={logoColor}
            strokeLinecap="round"
            strokeWidth={ROBOT_ANTENNA.stemWidth}
          />
          <Circle cx={ROBOT_ANTENNA.tipCx} cy={ROBOT_ANTENNA.tipCy} r={ROBOT_ANTENNA.tipR} fill={logoColor} />
        </Svg>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[layerStyle, { transformOrigin: eyeOrigin(EYE_LEFT_X) }, leftEyeAnimatedStyle]}
      >
        <Svg width={size} height={size} viewBox={viewBox}>
          <Circle cx={EYE_LEFT_X} cy={EYE_Y} r={ROBOT_EYES.r} fill={eyeColor} />
        </Svg>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[layerStyle, { transformOrigin: eyeOrigin(EYE_RIGHT_X) }, rightEyeAnimatedStyle]}
      >
        <Svg width={size} height={size} viewBox={viewBox}>
          <Circle cx={EYE_RIGHT_X} cy={EYE_Y} r={ROBOT_EYES.r} fill={eyeColor} />
        </Svg>
      </Animated.View>
    </View>
  );

  if (!interactive) return logo;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("mobile.auth.logo.animate")}
      accessibilityHint={t("mobile.auth.logo.animateHint")}
      onPressIn={handlePressIn}
      pressRetentionOffset={12}
    >
      {logo}
    </Pressable>
  );
}
