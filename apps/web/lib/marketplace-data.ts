import type {
  MarketplaceAgentDetail,
  MarketplaceAgentPage,
  MarketplaceAgentQuery,
  MarketplaceAgentSummary,
  MarketplaceSkillDetail,
  MarketplaceSkillPage,
  MarketplaceSkillQuery,
  MarketplaceSkillSummary,
  SkillCategory,
} from "@zollybot/contracts/ipc";
import { isAvatarHue, isReleasedRoutineSchedule, isSkillCategory } from "@zollybot/contracts/ipc";
import agentsFile from "@/data/marketplace/agents.json";
import skillsFile from "@/data/marketplace/skills.json";

const UPDATED_AT = "2026-01-01T00:00:00.000Z";
const rawAgents = agentsFile.agents;
const rawSkills = skillsFile.skills;

function category(value: string): SkillCategory | undefined {
  return isSkillCategory(value) ? value : undefined;
}

function summary(raw: (typeof rawAgents)[number]): MarketplaceAgentSummary {
  return {
    id: raw.id,
    name: raw.name,
    title: raw.title,
    description: raw.description,
    creatorName: "ZollyBot",
    version: raw.version,
    installs: 0,
    featured: raw.featured,
    verified: true,
    avatarSeed: raw.avatarSeed,
    avatarHue: isAvatarHue(raw.avatarHue) ? raw.avatarHue : null,
    avatarUrl: null,
    skillCount: raw.skills.length,
    routineCount: raw.routines.length,
    activeRoutineCount: raw.routines.filter((routine) => routine.active).length,
    updatedAt: UPDATED_AT,
    ...(category(raw.category) ? { category: category(raw.category) } : {}),
  };
}

function detail(raw: (typeof rawAgents)[number]): MarketplaceAgentDetail {
  return {
    ...summary(raw),
    versionId: raw.versionId,
    cardUrl: null,
    skills: raw.skills.map((skill) => ({
      skillId: skill.skillId,
      versionId: skill.versionId,
      slug: skill.slug,
      name: skill.name,
      version: skill.version,
    })),
    routines: raw.routines.flatMap((routine) =>
      isReleasedRoutineSchedule(routine.schedule)
        ? [
            {
              name: routine.name,
              instruction: routine.instruction,
              active: routine.active,
              schedule: routine.schedule,
            },
          ]
        : [],
    ),
  };
}

function skillSummary(raw: (typeof rawSkills)[number]): MarketplaceSkillSummary {
  const skillCategory = category(raw.category);
  if (!skillCategory) throw new Error(`Marketplace skill ${raw.slug} has no valid category.`);
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    category: skillCategory,
    creatorName: "ZollyBot",
    version: raw.version,
    installs: 0,
    featured: raw.featured,
    verified: true,
    iconUrl: null,
    updatedAt: UPDATED_AT,
  };
}

function skillDetail(raw: (typeof rawSkills)[number]): MarketplaceSkillDetail {
  return {
    ...skillSummary(raw),
    versionId: raw.versionId,
    bundleSha256: raw.bundleSha256,
    files: raw.files,
    instructions: "",
    cardUrl: null,
  };
}

function page<T>(
  items: readonly T[],
  cursor: string | undefined,
  limit: number,
): { items: T[]; nextCursor: string | null } {
  const start = Number(cursor ?? 0);
  const offset = Number.isInteger(start) && start > 0 ? start : 0;
  const size = Math.min(Math.max(limit, 1), 100);
  const end = offset + size;
  return { items: items.slice(offset, end), nextCursor: end < items.length ? String(end) : null };
}

function matches(text: string, query: string | undefined): boolean {
  return !query || text.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

export function listAgents(query: MarketplaceAgentQuery = {}): MarketplaceAgentPage {
  const filtered = rawAgents
    .filter((agent) => matches(`${agent.name} ${agent.title} ${agent.description} ZollyBot`, query.query))
    .filter((agent) => !query.category || agent.category === query.category)
    .filter((agent) => query.featured === undefined || agent.featured === query.featured)
    .filter((_agent) => query.verified === undefined || query.verified)
    .map(summary);
  const result = page(filtered, query.cursor, query.limit ?? 24);
  return { agents: result.items, nextCursor: result.nextCursor };
}

export function getAgent(id: string): MarketplaceAgentDetail | null {
  const raw = rawAgents.find((agent) => agent.id === id || agent.slug === id);
  return raw ? detail(raw) : null;
}

export function listSkills(query: MarketplaceSkillQuery = {}): MarketplaceSkillPage {
  const filtered = rawSkills
    .filter((skill) => matches(`${skill.name} ${skill.description} ZollyBot`, query.query))
    .filter((skill) => !query.category || skill.category === query.category)
    .filter((skill) => query.featured === undefined || skill.featured === query.featured)
    .filter((_skill) => query.verified === undefined || query.verified)
    .map(skillSummary);
  if (query.sort === "name") filtered.sort((left, right) => left.name.localeCompare(right.name));
  const result = page(filtered, query.cursor, query.limit ?? 24);
  return { skills: result.items, nextCursor: result.nextCursor };
}

export function getSkill(id: string): MarketplaceSkillDetail | null {
  const raw = rawSkills.find((skill) => skill.id === id);
  return raw ? skillDetail(raw) : null;
}

export function getSkillVersion(id: string, versionId: string): MarketplaceSkillDetail | null {
  const raw = rawSkills.find((skill) => skill.id === id);
  return raw?.versionId === versionId ? skillDetail(raw) : null;
}

/** The public archive of one skill version, or of the newest version when none is named. */
export function getSkillBundle(id: string, versionId?: string): string | null {
  const raw = rawSkills.find((skill) => skill.id === id);
  if (!raw || (versionId !== undefined && raw.versionId !== versionId)) return null;
  return `/${raw.bundle}`;
}

export function getSkillBySlug(slug: string): MarketplaceSkillDetail | null {
  const raw = rawSkills.find((skill) => skill.slug === slug);
  return raw ? skillDetail(raw) : null;
}
