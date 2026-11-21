/** Starting a PTY that runs one agent's provider CLI in the desktop's terminal pane. */
export interface PtyStartInput {
  agentId: string;
  cols: number;
  rows: number;
}

export interface PtyStartResult {
  readonly ptyId: string;
  /** The provider session the terminal continues, when the conversation already has one. */
  readonly sessionId: string | null;
}

export interface PtyDataEvent {
  readonly ptyId: string;
  readonly data: string;
}

export interface PtyExitEvent {
  readonly ptyId: string;
  readonly code: number | null;
}
