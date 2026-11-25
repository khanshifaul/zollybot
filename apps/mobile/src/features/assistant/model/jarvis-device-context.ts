import * as Location from "expo-location";

/**
 * What the model learns about the phone's time and place. Time is always local to the device; a
 * location is added only after the user allows it, and it stays on the phone with the prompt.
 */
const LOCATION_MAX_AGE_MS = 5 * 60_000;
const LOCATION_TIMEOUT_MS = 4_000;

interface CachedLocation {
  readAt: number;
  value: string | null;
}

let cached: CachedLocation | null = null;

async function currentPosition(): Promise<Location.LocationObject | null> {
  try {
    const last = await Location.getLastKnownPositionAsync({ maxAge: LOCATION_MAX_AGE_MS, requiredAccuracy: 5_000 });
    if (last) return last;
    return await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), LOCATION_TIMEOUT_MS)),
    ]);
  } catch {
    return null;
  }
}

async function locationText(): Promise<string | null> {
  const now = Date.now();
  if (cached && now - cached.readAt < LOCATION_MAX_AGE_MS) return cached.value;
  let value: string | null = null;
  try {
    const existing = await Location.getForegroundPermissionsAsync();
    const permission = existing.granted ? existing : await Location.requestForegroundPermissionsAsync();
    if (permission.granted) {
      const position = await currentPosition();
      if (position) {
        const { latitude, longitude, accuracy } = position.coords;
        const place = new Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").at(-1)?.replaceAll("_", " ");
        value = [
          place ? `${place} area` : null,
          `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          typeof accuracy === "number" && Number.isFinite(accuracy) ? `±${Math.round(accuracy)} m` : null,
        ]
          .filter(Boolean)
          .join(" · ");
      }
    }
  } catch {
    value = null;
  }
  cached = { readAt: now, value };
  return value;
}

/** The current time, time zone and, when allowed, the phone's location, as prompt lines. */
export async function jarvisDeviceContext(): Promise<string> {
  const now = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formatted = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(now);
  const location = await locationText();
  return [
    `Current date and time on the phone: ${formatted}.`,
    `Time zone: ${timeZone}.`,
    location ? `Device location: ${location}.` : "Device location: unavailable or not allowed.",
  ].join("\n");
}
