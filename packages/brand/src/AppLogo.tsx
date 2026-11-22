import { createEffect, createSignal, flush, onCleanup } from "solid-js";
import { APP_LOGO_VIEWBOX, ROBOT_ANTENNA, ROBOT_EARS, ROBOT_EYES, ROBOT_HEAD, ROBOT_SMILE } from "./app-logo-shape";

export type AppLogoAnimation = "none" | "blink";
export type AppLogoVariant = "production" | "dev" | "preview";

export interface AppLogoProps {
  variant: AppLogoVariant;
  animation?: AppLogoAnimation;
  interactive?: boolean;
  /**
   * An element around an interactive logo, such as a hero panel. The eyes follow the pointer anywhere
   * on it, and a click on it counts as a click on the logo. The logo stays the one control for the
   * keyboard and for screen readers.
   */
  pointerArea?: HTMLElement | undefined;
  class?: string;
}

/** How far the eyes move, in logo units, when the pointer is at the edge of the logo. */
const EYE_RANGE = 7;
/** A larger area gives the eyes more room: the pointer can be far from the logo. */
const AREA_EYE_RANGE = 11;
/** A blink closes and opens in about 180 ms. The next one comes after a human-looking pause. */
const BLINK_DURATION = 180;
const BLINK_MIN_DELAY = 2_600;
const BLINK_MAX_DELAY = 6_800;
const FIRST_BLINK_DELAY = 1_900;

export function AppLogo(props: AppLogoProps) {
  const [clickReaction, setClickReaction] = createSignal(false);
  const [easterEgg, setEasterEgg] = createSignal(false);
  const [blinking, setBlinking] = createSignal(false);
  const className = () => ["app-logo", props.class].filter(Boolean).join(" ");
  const animation = () => props.animation ?? "none";
  let clickReactionTimer: number | undefined;
  let easterEggTimer: number | undefined;
  let logoElement: SVGSVGElement | undefined;
  let rapidClicks: number[] = [];

  function shouldReduceMotion(): boolean {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }

  function setEyePosition(x: number): void {
    const range = props.pointerArea ? AREA_EYE_RANGE : EYE_RANGE;
    // Logo units: the eyes move by a few units, not by a share of their own small box. The
    // antenna follows the same horizontal value, so it leans with the gaze.
    logoElement?.style.setProperty("--app-logo-eye-x", `${(x * range).toFixed(2)}px`);
    logoElement?.style.setProperty("--app-logo-antenna-tilt", `${(x * 5).toFixed(2)}deg`);
  }

  function resetEyePosition(): void {
    setEyePosition(0);
  }

  /** The eyes look at the pointer. Its distance is measured against the logo, or against the area. */
  function lookAt(event: PointerEvent, area: Element): void {
    if (!props.interactive || shouldReduceMotion()) return;
    if (event.pointerType && event.pointerType !== "mouse") return;
    const logo = logoElement?.getBoundingClientRect();
    if (!logo) return;
    const bounds = area.getBoundingClientRect();
    const centerX = logo.left + logo.width / 2;
    // From the centre of the logo to the far edge of the area is the full range. Only the
    // horizontal position moves the eyes and the antenna; the pointer's height does not.
    const reachX = Math.max(centerX - bounds.left, bounds.right - centerX);
    const x = Math.max(-1, Math.min(1, (event.clientX - centerX) / reachX));
    setEyePosition(x);
  }

  function handlePointerMove(event: PointerEvent): void {
    if (!props.pointerArea && logoElement) lookAt(event, logoElement);
  }

  function handlePointerLeave(): void {
    if (!props.pointerArea) resetEyePosition();
  }

  function triggerClickReaction(): void {
    if (!props.interactive || shouldReduceMotion()) return;
    window.clearTimeout(clickReactionTimer);
    flush(() => setClickReaction(false));
    void logoElement?.getBoundingClientRect();
    flush(() => setClickReaction(true));
    clickReactionTimer = window.setTimeout(() => setClickReaction(false), 360);
  }

  function registerRapidClick(): void {
    if (!props.interactive || shouldReduceMotion()) return;
    const now = performance.now();
    rapidClicks = [...rapidClicks.filter((time) => now - time < 900), now];
    if (rapidClicks.length < 5) return;

    rapidClicks = [];
    window.clearTimeout(easterEggTimer);
    flush(() => setEasterEgg(false));
    void logoElement?.getBoundingClientRect();
    flush(() => setEasterEgg(true));
    easterEggTimer = window.setTimeout(() => setEasterEgg(false), 1200);
  }

  function handleClick(): void {
    triggerClickReaction();
    registerRapidClick();
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    triggerClickReaction();
  }

  createEffect(
    () => props.pointerArea,
    (area) => {
      if (!area) return;
      const handleAreaPointerMove = (event: PointerEvent) => lookAt(event, area);
      // A click on the logo itself already reached `handleClick`.
      const handleAreaClick = (event: MouseEvent) => {
        if (event.target instanceof Node && logoElement?.contains(event.target)) return;
        handleClick();
      };
      area.addEventListener("pointermove", handleAreaPointerMove);
      area.addEventListener("pointerleave", resetEyePosition);
      area.addEventListener("click", handleAreaClick);
      return () => {
        area.removeEventListener("pointermove", handleAreaPointerMove);
        area.removeEventListener("pointerleave", resetEyePosition);
        area.removeEventListener("click", handleAreaClick);
      };
    },
  );

  // A timer starts each blink, so the page draws frames only while the eyes move. The pause is
  // randomized, and now and then the second blink follows at once, as an idle person's does.
  createEffect(
    () => animation() === "blink",
    (blinks) => {
      if (!blinks) return;
      let blinkEndTimer: number | undefined;
      let nextBlinkTimer: number | undefined;
      let doubleBlinkTimer: number | undefined;
      let stopped = false;
      const blink = () => {
        // The reduced-motion setting can change while the logo shows.
        if (stopped || shouldReduceMotion()) return;
        setBlinking(true);
        window.clearTimeout(blinkEndTimer);
        blinkEndTimer = window.setTimeout(() => {
          setBlinking(false);
          blinkEndTimer = undefined;
        }, BLINK_DURATION);
      };
      const schedule = (delay: number) => {
        window.clearTimeout(nextBlinkTimer);
        nextBlinkTimer = window.setTimeout(() => {
          blink();
          if (Math.random() < 0.18) {
            window.clearTimeout(doubleBlinkTimer);
            doubleBlinkTimer = window.setTimeout(blink, BLINK_DURATION + 120);
          }
          schedule(BLINK_MIN_DELAY + Math.random() * (BLINK_MAX_DELAY - BLINK_MIN_DELAY));
        }, delay);
      };
      schedule(FIRST_BLINK_DELAY);
      return () => {
        stopped = true;
        window.clearTimeout(nextBlinkTimer);
        window.clearTimeout(doubleBlinkTimer);
        window.clearTimeout(blinkEndTimer);
        setBlinking(false);
      };
    },
  );

  onCleanup(() => {
    globalThis.clearTimeout(clickReactionTimer);
    globalThis.clearTimeout(easterEggTimer);
  });

  const leftEyeX = ROBOT_EYES.leftCx;
  const rightEyeX = ROBOT_EYES.rightCx;
  const eyeY = ROBOT_EYES.cy;

  return (
    <svg
      ref={(element) => (logoElement = element)}
      class={className()}
      data-animation={animation()}
      data-blink={blinking() ? "" : undefined}
      data-click-reaction={clickReaction() ? "wink" : undefined}
      data-easter-egg={easterEgg() ? "party" : undefined}
      data-interactive={props.interactive ? "true" : undefined}
      data-variant={props.variant}
      viewBox={`${APP_LOGO_VIEWBOX.x} ${APP_LOGO_VIEWBOX.y} ${APP_LOGO_VIEWBOX.size} ${APP_LOGO_VIEWBOX.size}`}
      aria-hidden={props.interactive ? undefined : "true"}
      aria-label={props.interactive ? "Animate ZollyBot logo" : undefined}
      role={props.interactive ? "button" : undefined}
      tabindex={props.interactive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      {/* Antenna (single bent line with ball), swaying from its base */}
      <g class="app-logo-antenna">
        <path
          d={ROBOT_ANTENNA.stemPath}
          fill="none"
          stroke="currentColor"
          stroke-width={ROBOT_ANTENNA.stemWidth}
          stroke-linecap="round"
        />
        <circle cx={ROBOT_ANTENNA.tipCx} cy={ROBOT_ANTENNA.tipCy} r={ROBOT_ANTENNA.tipR} fill="currentColor" />
      </g>
      <rect
        x={ROBOT_EARS.leftX}
        y={ROBOT_EARS.y - ROBOT_EARS.height / 2}
        width={ROBOT_EARS.width}
        height={ROBOT_EARS.height}
        rx={ROBOT_EARS.rx}
        fill="currentColor"
      />
      <rect
        x={ROBOT_EARS.rightX}
        y={ROBOT_EARS.y - ROBOT_EARS.height / 2}
        width={ROBOT_EARS.width}
        height={ROBOT_EARS.height}
        rx={ROBOT_EARS.rx}
        fill="currentColor"
      />

      {/* Head (solid, no white) */}
      <rect
        x={ROBOT_HEAD.cx - ROBOT_HEAD.width / 2}
        y={ROBOT_HEAD.cy - ROBOT_HEAD.height / 2}
        width={ROBOT_HEAD.width}
        height={ROBOT_HEAD.height}
        rx={ROBOT_HEAD.rx}
        fill="currentColor"
      />

      {/* Eyes - bg-colored cutouts on dark head; animatable */}
      <g class="app-logo-eye-motion" style={{ "transform-origin": `${leftEyeX}px ${eyeY}px` }}>
        <g class="app-logo-eye app-logo-eye-left" style={{ "transform-origin": `${leftEyeX}px ${eyeY}px` }}>
          <circle cx={leftEyeX} cy={eyeY} r={ROBOT_EYES.r} class="app-logo-bg-fill" />
        </g>
      </g>
      <g class="app-logo-eye-motion" style={{ "transform-origin": `${rightEyeX}px ${eyeY}px` }}>
        <g class="app-logo-eye app-logo-eye-right" style={{ "transform-origin": `${rightEyeX}px ${eyeY}px` }}>
          <circle cx={rightEyeX} cy={eyeY} r={ROBOT_EYES.r} class="app-logo-bg-fill" />
        </g>
      </g>

      {/* Smile */}
      <path
        d={`M ${ROBOT_SMILE.x1} ${ROBOT_SMILE.y} Q ${ROBOT_HEAD.cx} ${ROBOT_SMILE.y + ROBOT_SMILE.depth} ${ROBOT_SMILE.x2} ${ROBOT_SMILE.y}`}
        fill="none"
        class="app-logo-bg-stroke"
        stroke-width={ROBOT_SMILE.strokeWidth}
        stroke-linecap="round"
      />
    </svg>
  );
}
