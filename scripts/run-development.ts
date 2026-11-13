import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  developmentChildEnvironment,
  developmentSettingsForService,
  loadDevelopmentEnvironment,
  requireDevelopmentValues,
} from "./development-environment";
import { resolvePackageBin } from "./package-bin";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

async function main(): Promise<void> {
  const [mode, ...extra] = process.argv.slice(2).filter((argument) => argument !== "--");
  if (!mode || !["remote", "stripe", "stripe-e2e"].includes(mode)) {
    throw new Error("Choose remote, stripe, or stripe-e2e.");
  }
  const environment = await loadDevelopmentEnvironment(projectRoot);
  const executable = process.execPath;
  let args: string[];
  const cwd = projectRoot;
  if (mode === "remote") {
    args = ["run", "--cwd", join(projectRoot, "remote/api"), "dev", ...extra];
  } else {
    requireDevelopmentValues(environment, ["STRIPE_SECRET_KEY"]);
    args = [
      join(projectRoot, mode === "stripe" ? "scripts/stripe-bootstrap.ts" : "scripts/stripe-flows-e2e.ts"),
      ...extra,
    ];
  }
  const child = spawn(executable, args, {
    cwd,
    env:
      mode === "remote"
        ? developmentChildEnvironment(
            { ...developmentSettingsForService(environment, "remote"), ...process.env },
            "remote",
          )
        : environment,
    stdio: "inherit",
  });
  const terminate = () => child.kill("SIGTERM");
  process.once("SIGINT", terminate);
  process.once("SIGTERM", terminate);
  child.once("error", () => {
    process.stderr.write("Could not start the development command. Check the installed dependencies.\n");
    process.exitCode = 1;
  });
  child.once("exit", (code, signal) => {
    process.removeListener("SIGINT", terminate);
    process.removeListener("SIGTERM", terminate);
    process.exitCode = code ?? (signal ? 1 : 0);
  });
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Development command setup failed.";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
