import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { detectOfficeProject } from "./office-profile";

const roots: string[] = [];

async function project(files: Record<string, string>, dirs: string[] = []): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "zollybot-office-profile-"));
  roots.push(root);
  for (const dir of dirs) await mkdir(join(root, dir), { recursive: true });
  for (const [name, content] of Object.entries(files)) await writeFile(join(root, name), content);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("detectOfficeProject", () => {
  it("reads the stack, commands, data, and test state of a TypeScript repository", async () => {
    const root = await project(
      {
        "package.json": JSON.stringify({
          packageManager: "bun@1.3.0",
          scripts: { build: "tsc -p .", test: "vitest run", lint: "biome check ." },
          workspaces: ["apps/*"],
        }),
        "tsconfig.json": "{}",
      },
      ["src", "tests", "data", "migrations"],
    );

    const profile = detectOfficeProject(root, "sample");

    expect(profile.languages).toEqual(expect.arrayContaining(["JavaScript/TypeScript", "TypeScript"]));
    expect(profile.packageManager).toBe("bun");
    expect(profile.commands).toMatchObject({
      install: "bun install",
      build: "bun run build",
      test: "bun run test",
      lint: "bun run lint",
      typecheck: "tsc --noEmit",
    });
    expect(profile.workspaces).toEqual(["apps/*"]);
    expect(profile.entrypoints).toContain("src");
    expect(profile.data).toEqual(expect.arrayContaining(["data", "migrations"]));
    expect(profile.tests).toContain("tests");
    expect(profile.suggestedRoles).toEqual(
      expect.arrayContaining(["office-manager", "foreman", "pr-reviewer", "worker-test", "worker-build"]),
    );
  });

  it("does not invent commands for an empty folder", async () => {
    const root = await project({});
    const profile = detectOfficeProject(root, "empty");

    expect(profile.languages).toEqual([]);
    expect(profile.commands).toEqual({
      install: null,
      dev: null,
      build: null,
      test: null,
      lint: null,
      typecheck: null,
    });
    expect(profile.summary).toContain("Stack: not detected");
  });
});
