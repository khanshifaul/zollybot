import type { MarketplaceAgentQuery, SkillCategory } from "@zollybot/contracts/ipc";
import { isSkillCategory, SKILL_CATEGORIES, SKILL_CATEGORY_LABELS } from "@zollybot/contracts/ipc";
import type { Metadata } from "next";
import Link from "next/link";
import { AgentCard, MarketplaceState } from "@/components/marketplace/marketplace-ui";
import { Container } from "@/components/ui/container";
import { catalog, loadMarketplace } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agents — ZollyBot Marketplace",
  description: "Browse agents for ZollyBot.",
  alternates: { canonical: "/marketplace/agents" },
};

function category(value: string | string[] | undefined): SkillCategory | undefined {
  return typeof value === "string" && isSkillCategory(value) ? value : undefined;
}

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : undefined;
  const selectedCategory = category(params.category);
  const verified = params.verified === "true" ? true : undefined;
  const cursor = typeof params.cursor === "string" ? params.cursor : undefined;
  const request: MarketplaceAgentQuery = {
    ...(query ? { query } : {}),
    ...(selectedCategory ? { category: selectedCategory } : {}),
    ...(verified ? { verified } : {}),
    ...(cursor ? { cursor } : {}),
    limit: 24,
  };
  const result = await loadMarketplace(catalog.agents.list(request));
  const nextParams = new URLSearchParams();
  if (query) nextParams.set("q", query);
  if (selectedCategory) nextParams.set("category", selectedCategory);
  if (verified) nextParams.set("verified", "true");
  if (result.data?.nextCursor) nextParams.set("cursor", result.data.nextCursor);

  return (
    <Container size="lg" className="space-y-8 py-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Marketplace</p>
        <h1 className="text-3xl font-semibold tracking-tight">Agents</h1>
        <p className="text-muted-foreground">Read a listing, then open it in ZollyBot to add it.</p>
      </header>

      <form
        className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-end"
        action="/marketplace/agents"
      >
        <label className="flex-1 space-y-1 text-sm">
          <span className="font-medium">Search</span>
          <input
            name="q"
            defaultValue={query}
            placeholder="Search agents"
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Category</span>
          <select
            name="category"
            defaultValue={selectedCategory ?? ""}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All</option>
            {SKILL_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {SKILL_CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex h-9 items-center gap-2 text-sm">
          <input type="checkbox" name="verified" value="true" defaultChecked={verified} />
          Verified only
        </label>
        <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">
          Apply
        </button>
      </form>

      {result.error ? <MarketplaceState message={result.error} /> : null}

      {result.data ? (
        result.data.agents.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
            {result.data.nextCursor ? (
              <div className="flex justify-center">
                <Link
                  className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
                  href={`/marketplace/agents?${nextParams}`}
                >
                  Next page
                </Link>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No agents match this search.
          </div>
        )
      ) : null}
    </Container>
  );
}
