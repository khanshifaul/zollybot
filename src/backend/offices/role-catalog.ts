/**
 * The job descriptions the building knows. A role is not a person and has no
 * chats; an employment puts a role to work in one office (or in the building).
 * Names match the agents a fresh install seeds, so an existing profile maps onto
 * the catalog without a migration.
 */
export type RoleScope = "office" | "building";

export interface Role {
  key: string;
  name: string;
  title: string;
  description: string;
  scope: RoleScope;
  /** Several workers of this role may hold desks in one office. */
  multiInstance?: boolean;
}

export const ROLE_CATALOG: readonly Role[] = [
  {
    key: "butler",
    name: "Butler",
    title: "Concierge",
    description:
      "The building's concierge and the founder's first agent. The user teaches Butler about themself, business, work, and environment. Butler learns from that teaching, keeps its own instructions up to date, and can change its provider, model, and reasoning effort when the user asks. Butler knows offices, can create/open offices and help hire agents, and never reads office chats or approves gates.",
    scope: "building",
  },
  {
    key: "zolly",
    name: "Zolly",
    title: "Manager",
    description:
      "The founder's manager for one office. Greets, triages each instruction, writes the brief, keeps the ledger and the gate list. Writes no code.",
    scope: "office",
  },
  {
    key: "foreman",
    name: "Foreman",
    title: "Team leader",
    description: "Runs one task at a time in one office: worktree, one worker, the result, the review. Writes no code.",
    scope: "office",
  },
  {
    key: "hr",
    name: "HR",
    title: "Hiring",
    description: "Turns a hire request into a worker persona and a receipt. Does no product work.",
    scope: "office",
  },
  {
    key: "pr-reviewer",
    name: "PR Reviewer",
    title: "Merge gate",
    description:
      "Reads a result and diff, runs the verification, and merges on PASS or objects. The office's only door.",
    scope: "office",
  },
  {
    key: "worker-research",
    name: "Worker: Research",
    multiInstance: true,
    title: "Read-only investigator",
    description: "Investigates and returns findings with paths and numbers. Reads only.",
    scope: "office",
  },
  {
    key: "worker-build",
    name: "Worker: Build",
    multiInstance: true,
    title: "Implementer",
    description: "Implements one bounded change, proves it, and writes the result file.",
    scope: "office",
  },
  {
    key: "worker-test",
    name: "Worker: Test",
    multiInstance: true,
    title: "Verifier",
    description: "Reproduces a fault, proves the fix, and reports the command and its output.",
    scope: "office",
  },
] as const;

const BY_NAME: Record<string, Role> = Object.fromEntries(ROLE_CATALOG.map((role) => [role.name.toLowerCase(), role]));
const BY_KEY: Record<string, Role> = Object.fromEntries(ROLE_CATALOG.map((role) => [role.key, role]));

/** The role an existing agent's name belongs to; `undefined` means a custom agent. */
export function roleForAgentName(name: string): Role | undefined {
  return BY_NAME[name.trim().toLowerCase()];
}

export function roleByKey(key: string): Role | undefined {
  return BY_KEY[key];
}
