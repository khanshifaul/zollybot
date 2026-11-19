// The ZollyBot robot mark as plain data, so renderers (SVG, canvas, scripts) draw the same mark.

/** The mark is a square of this side, in its own units. */
export const APP_LOGO_SIZE = 240;

/** Robot head. */
export const ROBOT_HEAD = {
  cx: 120,
  cy: 120,
  width: 136,
  height: 114,
  rx: 38,
} as const;

/** Antenna: single bent line with tip ball. */
export const ROBOT_ANTENNA = {
  stemPath: "M 120 61 Q 134 40 126 30",
  stemWidth: 7,
  tipCx: 126,
  tipCy: 28,
  tipR: 8,
} as const;

/** Side ears. */
export const ROBOT_EARS = {
  width: 24,
  height: 36,
  rx: 12,
  y: 98,
  leftX: 48,
  rightX: 168,
} as const;

/** Eyes. */
export const ROBOT_EYES = {
  leftCx: 90,
  rightCx: 150,
  cy: 110,
  r: 14,
  highlightR: 5,
  highlightDx: -4.5,
  highlightDy: -4.5,
} as const;

/** Smile arc. */
export const ROBOT_SMILE = {
  x1: 100,
  y: 142,
  x2: 140,
  depth: 15,
  strokeWidth: 7,
} as const;

/** Legacy exports kept for compatibility where needed. */
export const APP_LOGO_CORNER = 0;
export const APP_LOGO_EYE_POINTS = {
  left: `${ROBOT_EYES.leftCx - ROBOT_EYES.r} ${ROBOT_EYES.cy} ${ROBOT_EYES.leftCx + ROBOT_EYES.r} ${ROBOT_EYES.cy}`,
  right: `${ROBOT_EYES.rightCx - ROBOT_EYES.r} ${ROBOT_EYES.cy} ${ROBOT_EYES.rightCx + ROBOT_EYES.r} ${ROBOT_EYES.cy}`,
} as const;
