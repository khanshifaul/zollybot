import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createZollyBotLogger } from "@zollybot/logging";
import { setDevelopmentOverrides } from "./development-secrets";

// Puts an Apple Push Notification service key into this checkout's ignored development state, so
// the local Auth API can send iPhone Live Activity updates. The key text never goes to the output.
//
//   bun run dev:apns-key -- ~/Downloads/AuthKey_ABC1234567.p8 [KEY_ID]
//   bun run dev:apns-key -- ~/Downloads/AuthKey_ABC1234567.p8 --production
//
// The key ID comes from the file name that Apple gives the download, or from the second argument.

const logger = createZollyBotLogger("dev-apns-key");

if (import.meta.main) {
  const args = process.argv.slice(2);
  const [path, keyIdArgument] = args;
  if (!path) throw new Error("Give the path of the .p8 key: bun run dev:apns-key -- <AuthKey_ID.p8> [KEY_ID]");
  const keyId = keyIdArgument ?? /^AuthKey_([A-Z0-9]{10})\.p8$/u.exec(basename(path))?.[1];
  if (!keyId || !/^[A-Z0-9]{10}$/u.test(keyId)) throw new Error("Give the 10-character key ID as the second argument.");
  const privateKey = readFileSync(path, "utf8");
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) throw new Error("The file is not an Apple .p8 key.");
  const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
  setDevelopmentOverrides(projectRoot, {
    APNS_PRIVATE_KEY: privateKey.trim().replaceAll("\n", "\\n"),
    APNS_KEY_ID: keyId,
  });
  logger.info(`Saved the APNs key ${keyId} in local development state. Restart bun run dev to use it.`);
}
