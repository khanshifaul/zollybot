export type LocalDeviceAction =
  | { type: "timer"; seconds: number; label: string }
  | { type: "open-app"; name: string }
  | { type: "settings" }
  | { type: "dial"; number: string }
  | { type: "call"; target: string }
  | { type: "sms"; target: string; message: string };

const TIMER = /\b(?:set|start)\s+(?:a\s+)?timer\s+(?:for\s+)?(\d+)\s*(second|minute|hour)s?\b/iu;
const OPEN_APP = /\b(?:open|launch|start)\s+(?:the\s+)?(.+?)\s*(?:app)?$/iu;
const SMS = /\b(?:text|message|send\s+(?:a\s+)?(?:text|message)\s+to)\s+(.+?)\s+(?:saying|that|about|with|:)\s*(.+)$/iu;
const CALL = /\b(?:call|phone)\s+(.+?)\s*$/iu;
const DIAL = /\b(?:dial)\s+([+\d][\d\s()-]{2,})/iu;
const SETTINGS = /\bopen\s+(?:the\s+)?settings\b/iu;

/** A small on-device router for safe device commands, before the local model sees the prompt. */
export function planLocalDeviceAction(input: string): LocalDeviceAction | null {
  const text = input.trim();
  const timer = TIMER.exec(text);
  if (timer) {
    const amount = Number(timer[1]);
    const unit = timer[2]?.toLowerCase();
    const multiplier = unit === "hour" ? 3600 : unit === "minute" ? 60 : 1;
    if (Number.isFinite(amount) && amount > 0 && amount <= 24 * 3600)
      return { type: "timer", seconds: amount * multiplier, label: "Jarvis timer" };
  }
  if (SETTINGS.test(text)) return { type: "settings" };
  const sms = SMS.exec(text);
  if (sms?.[1] && sms[2]) return { type: "sms", target: sms[1].trim(), message: sms[2].trim() };
  const call = CALL.exec(text);
  if (call?.[1]) return { type: "call", target: call[1].trim() };
  const dial = DIAL.exec(text);
  if (dial?.[1]) return { type: "dial", number: dial[1].replace(/[^\d+]/gu, "") };
  const open = OPEN_APP.exec(text);
  if (open?.[1]) return { type: "open-app", name: open[1].trim() };
  return null;
}
