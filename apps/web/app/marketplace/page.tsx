import type { Metadata } from "next";
import Link from "next/link";
import { AgentCard, FeaturedEmpty, MarketplaceState, SkillCard } from "@/components/marketplace/marketplace-ui";
import { Container } from "@/components/ui/container";
import { catalog, loadMarketplace } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ZollyBot Marketplace — agents and skills",
  description: "Browse agents and skills for ZollyBot. Add them in the app, with your data on your machine.",
  alternates: { canonical: "/marketplace" },
};

export default async function MarketplacePage() {
  const [agents, skills] = await Promise.all([
    loadMarketplace(catalog.agents.list({ featured: true, limit: 6 })),
    loadMarketplace(catalog.skills.list({ featured: true, limit: 6 })),
  ]);
  const error = agents.error ?? skills.error;
  return (
    <Container size="lg" className="space-y-12 py-12">
      <section className="max-w-3xl space-y-4">
        <p className="text-sm font-medium text-primary">ZollyBot Marketplace</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Agents and skills, ready to add.</h1>
        <p className="text-lg text-muted-foreground">
          Browse what people have built for ZollyBot. Opening a listing starts in the app, where you review it before
          anything is installed.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link className="rounded-md border px-3 py-1.5 hover:bg-accent" href="/marketplace/agents">
            Browse agents
          </Link>
          <Link className="rounded-md border px-3 py-1.5 hover:bg-accent" href="/marketplace/skills">
            Browse skills
          </Link>
        </div>
      </section>

      {error ? <MarketplaceState message={error} /> : null}

      {!error ? (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Featured agents</h2>
              <p className="text-sm text-muted-foreground">Complete teams you can inspect before adding.</p>
            </div>
            <Link className="text-sm text-primary hover:underline" href="/marketplace/agents">
              All agents
            </Link>
          </div>
          {agents.data?.agents.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {agents.data.agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <FeaturedEmpty />
          )}
        </section>
      ) : null}

      {!error ? (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Featured skills</h2>
              <p className="text-sm text-muted-foreground">Small, focused abilities for any agent.</p>
            </div>
            <Link className="text-sm text-primary hover:underline" href="/marketplace/skills">
              All skills
            </Link>
          </div>
          {skills.data?.skills.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.data.skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <FeaturedEmpty />
          )}
        </section>
      ) : null}
    </Container>
  );
}
