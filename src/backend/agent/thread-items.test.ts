import { describe, expect, it } from "vitest";
import { refusedSessionFailure } from "./thread-items";

describe("refusedSessionFailure", () => {
  it("treats a missing Claude session as a refused session", () => {
    const failure = refusedSessionFailure(
      "claude",
      "No conversation found with session ID: 4b1f0c2e-1a2b-4c3d-9e8f-001122334455",
    );

    expect(failure).not.toBeNull();
  });

  it("does not attribute the Claude message to another provider", () => {
    expect(refusedSessionFailure("codex", "No conversation found with session ID: 4b1f0c2e")).toBeNull();
  });

  it("leaves an unrelated Claude failure alone", () => {
    expect(refusedSessionFailure("claude", "rate limit exceeded")).toBeNull();
  });
});
