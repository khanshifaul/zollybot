import { describe, expect, it } from "vitest";
import { commandProblems } from "./check-commands";

describe("package command audit", () => {
  it("accepts local files and aliases that exist", () => {
    expect(
      commandProblems(
        {
          scripts: {
            build: "bun run prepare && bun scripts/build.ts",
            prepare: "bun scripts/prepare.ts",
          },
        },
        (path) => path === "scripts/build.ts" || path === "scripts/prepare.ts",
      ),
    ).toEqual([]);
  });

  it("reports a missing file and an unknown alias", () => {
    expect(
      commandProblems(
        {
          scripts: {
            release: "bun scripts/missing-release.ts && bun run missing-step",
          },
        },
        () => false,
      ),
    ).toEqual([
      "package.json script release runs missing scripts/missing-release.ts",
      "package.json script release runs unknown script missing-step",
    ]);
  });

  it("ignores external tools", () => {
    expect(commandProblems({ scripts: { lint: "biome check . && bunx tsc --noEmit" } }, () => false)).toEqual([]);
  });
});
