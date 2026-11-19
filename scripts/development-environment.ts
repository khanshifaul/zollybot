import { readDevelopmentState } from "./development-secrets";

const LOCAL_IDENTITY_KEYS = [
  "REMOTE_TICKET_PRIVATE_JWK",
  "REMOTE_TICKET_PUBLIC_JWKS",
  "REMOTE_AUTH_WEBHOOK_SECRET",
  "SITE_REPORT_HASH_SECRET",
  "COMPANY_SIGN_IN_SECRET",
  "SKILLS_ADMIN_TOKEN",
] as const;

export function withoutDecryptionKeys(environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return Object.fromEntries(Object.entries(environment).filter(([key]) => !key.startsWith("DOTENV_")));
}

export async function loadSharedDevelopmentEnvironment(
  _projectRoot: string,
  _environment: NodeJS.ProcessEnv = process.env,
): Promise<Record<string, string>> {
  return {};
}

export async function loadDevelopmentEnvironment(
  projectRoot: string,
  environment: NodeJS.ProcessEnv = process.env,
): Promise<NodeJS.ProcessEnv> {
  const state = readDevelopmentState(projectRoot);
  const shared = await loadSharedDevelopmentEnvironment(projectRoot, environment);
  // Shared service credentials must not change the identity of an existing local instance.
  for (const key of LOCAL_IDENTITY_KEYS) delete shared[key];
  return withoutDecryptionKeys({
    ...state.defaults,
    ...shared,
    ...state.overrides,
    ...definedEnvironment(environment),
  });
}

function definedEnvironment(environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return Object.fromEntries(Object.entries(environment).filter(([, value]) => value !== undefined));
}

export function requireDevelopmentValues(environment: NodeJS.ProcessEnv, names: string[]): void {
  const missing = names.filter((name) => !environment[name]?.trim() || environment[name]?.startsWith("encrypted:"));
  if (missing.length) throw new Error(`Missing development settings: ${missing.join(", ")}.`);
}

const ACCOUNT_SETTINGS =
  /^(?:STRIPE_|BOAT_|HOSTED_SERVERS_|HOSTED_SERVER_TEMPLATE$|EMAIL_|SITE_REPORT_HASH_SECRET$|COMPANY_SIGN_IN_SECRET$|SKILLS_ADMIN_TOKEN$|APNS_|FCM_|GITHUB_APP_|GITHUB_WEBHOOK_SECRET$|SLACK_|DISCORD_|TELEGRAM_|REMOTE_TICKET_|REMOTE_AUTH_WEBHOOK_SECRET$|OPENPANEL_)/u;
const SIGNAL_SETTINGS = new Set([
  "REMOTE_TICKET_PUBLIC_JWKS",
  "REMOTE_TICKET_PUBLIC_KEYS",
  "REMOTE_TICKET_JWKS_URL",
  "REMOTE_AUTH_WEBHOOK_SECRET",
  "SLACK_SIGNING_SECRET",
  "GITHUB_WEBHOOK_SECRET",
  "DISCORD_BOT_TOKEN",
  "DISCORD_APPLICATION_ID",
  "TELEGRAM_BOT_TOKENS",
  "TELEGRAM_WEBHOOK_SECRET",
  "TELEGRAM_WEBHOOK_ORIGIN",
  // Remote service configuration
  "REMOTE_CONTROL_PLANE_URL",
  "REMOTE_AUTH_WEBHOOK_URL",
  "REMOTE_SIGNAL_URL",
  "REMOTE_SIGNAL_HOST",
  "REMOTE_TLS_DISABLED",
  "REMOTE_HEALTH_HOST",
  "REMOTE_HEALTH_PORT",
  "REMOTE_SIGNAL_PORT",
  "REMOTE_SESSION_SECRET",
  "TURN_SHARED_SECRET",
  "TURN_HOST",
  "TURN_PORT",
  "TURN_TLS_PORT",
  "TURN_EXTRA_HOSTS",
  "REMOTE_MAX_CONNECTIONS_PER_USER",
  "REMOTE_MAX_CONNECTIONS_PER_IP",
  "REMOTE_MAX_MESSAGES_PER_MINUTE",
  "REMOTE_TRUST_PROXY",
  "REMOTE_METRICS_TOKEN",
  "REMOTE_SIGNAL_HOMES",
  "REMOTE_AUTH_WEBHOOK_URLS",
]);

export function developmentChildEnvironment(
  environment: NodeJS.ProcessEnv,
  service: "api" | "remote" | "app" | "test-client",
): NodeJS.ProcessEnv {
  const child = withoutDecryptionKeys(environment);
  delete child.ZOLLYBOT_DEV_SLACK_SIGNING_SECRET;
  for (const key of Object.keys(child)) {
    if (!ACCOUNT_SETTINGS.test(key)) continue;
    if (service === "api") continue;
    if (service === "remote" && SIGNAL_SETTINGS.has(key)) continue;
    delete child[key];
  }
  if (service === "app" || service === "test-client" || service === "api") {
    delete child.REMOTE_SESSION_SECRET;
    delete child.TURN_SHARED_SECRET;
    delete child.REMOTE_METRICS_TOKEN;
  }
  return child;
}

/** Only the API receives the full account configuration. Signal receives its verification values. */
export function developmentSettingsForService(
  environment: NodeJS.ProcessEnv,
  service: "api" | "remote" | "app" | "test-client",
): NodeJS.ProcessEnv {
  if (service === "api") return withoutDecryptionKeys(environment);
  if (service !== "remote") return {};
  return Object.fromEntries(Object.entries(environment).filter(([key]) => SIGNAL_SETTINGS.has(key)));
}
