import { getAgent, getSkill, getSkillBySlug, listAgents, listSkills } from "./marketplace-data";

export type MarketplaceLoad<T> = { data: T; error: null } | { data: null; error: string };

/**
 * The public marketplace catalog is built from the canonical production catalog and served by this
 * Next app. Reads stay local to the deployment; no account credential or external API is needed.
 */
export const catalog = {
  agents: {
    list: async (query = {}) => listAgents(query),
    get: async (id: string) => {
      const agent = getAgent(id);
      if (!agent) throw new Error("Agent not found.");
      return agent;
    },
    getListing: async (id: string) => {
      const agent = getAgent(id);
      if (!agent) throw new Error("Agent not found.");
      return agent;
    },
  },
  skills: {
    list: async (query = {}) => listSkills(query),
    get: async (id: string) => {
      const skill = getSkill(id);
      if (!skill) throw new Error("Skill not found.");
      return skill;
    },
    getBySlug: async (slug: string) => {
      const skill = getSkillBySlug(slug);
      if (!skill) throw new Error("Skill not found.");
      return skill;
    },
  },
};

/** Runs one catalog read and turns a missing listing into a page-level message. */
export async function loadMarketplace<T>(operation: Promise<T>): Promise<MarketplaceLoad<T>> {
  try {
    return { data: await operation, error: null };
  } catch (cause) {
    return {
      data: null,
      error: cause instanceof Error ? cause.message : "The marketplace is unavailable.",
    };
  }
}

export function marketplaceAssetUrl(value: string | null | undefined): string | null {
  return value ?? null;
}

export function marketplaceSearchParams(input: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string" && value.trim()) params.set(key, value.trim());
  }
  return params;
}
