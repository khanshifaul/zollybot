export interface JarvisPrompt {
  id: string;
  label: string;
  text: string;
}

/** Conversation starters for the Jarvis test page, grouped around the current app's work. */
export const JARVIS_PROMPTS: readonly JarvisPrompt[] = [
  { id: "plate", label: "What’s on my plate?", text: "What’s on my plate right now?" },
  { id: "standup", label: "Move standup to 4pm", text: "Move the standup to 4pm and tell the team." },
  { id: "office", label: "Summarize the Design office", text: "Summarize what the Design office is working on." },
  { id: "tasks", label: "Show waiting tasks", text: "What tasks are waiting for me?" },
  { id: "schedule", label: "What’s next today?", text: "What is next on my schedule today?" },
  { id: "butler", label: "What is Butler doing?", text: "What is Butler working on?" },
  { id: "timer", label: "Set a 10 minute timer", text: "Set a timer for 10 minutes." },
  { id: "brief", label: "Give me the office brief", text: "Give me a short brief of this office." },
];
