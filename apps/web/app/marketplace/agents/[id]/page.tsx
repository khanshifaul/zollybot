import { SKILL_CATEGORY_LABELS } from "@zollybot/contracts/ipc";
import {
  createMarketplaceShareUrl,
  createZollyBotMarketplaceUrl,
  isMarketplaceAgentId,
} from "@zollybot/contracts/marketplace-links";
import { Check, Package } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ListingActions } from "@/components/marketplace/listing-actions";
import { MarketplaceState } from "@/components/marketplace/marketplace-ui";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { catalog, loadMarketplace, marketplaceAssetUrl } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

const loadAgent = cache(async (id: string) => loadMarketplace(catalog.agents.getListing(id)));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!isMarketplaceAgentId(id)) return { title: "Agent not found" };
  const result = await loadAgent(id);
  const agent = result.data;
  if (!agent) return { title: "Agent not found — ZollyBot Marketplace" };
  const card = marketplaceAssetUrl(agent.cardUrl);
  return {
    title: `${agent.name} — ZollyBot Marketplace`,
    description: agent.description,
    alternates: { canonical: `/marketplace/agents/${agent.id}` },
    openGraph: {
      title: `${agent.name} — ZollyBot Marketplace`,
      description: agent.description,
      type: "article",
      ...(card ? { images: [{ url: card }] } : {}),
    },
  };
}

export default async function AgentListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isMarketplaceAgentId(id)) notFound();
  const result = await loadAgent(id);
  if (result.error) {
    return (
      <Container size="md" className="py-12">
        <Link className="text-sm text-primary hover:underline" href="/marketplace/agents">
          ← All agents
        </Link>
        <div className="mt-6">
          <MarketplaceState message={result.error} />
        </div>
      </Container>
    );
  }
  if (!result.data) notFound();
  const agent = result.data;
  const shareUrl = createMarketplaceShareUrl({ kind: "agent", id: agent.id });
  const appUrl = createZollyBotMarketplaceUrl({ kind: "agent", id: agent.id });
  const avatar = marketplaceAssetUrl(agent.avatarUrl);
  return (
    <Container size="md" className="space-y-6 py-8 sm:space-y-8 sm:py-10">
      <Link className="text-sm text-primary hover:underline" href="/marketplace/agents">
        ← All agents
      </Link>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <AgentAvatar name={agent.name} image={avatar} />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{agent.name}</h1>
            {agent.verified ? (
              <span className="inline-flex items-center gap-1 text-sm text-primary">
                <Check className="h-4 w-4" /> Verified
              </span>
            ) : null}
            {agent.pending ? <Badge variant="secondary">Pending review</Badge> : null}
          </div>
          <p className="break-words text-base text-muted-foreground sm:text-lg">{agent.title}</p>
          <p className="text-sm text-muted-foreground">
            by {agent.creatorName} · v{agent.version} · {agent.installs.toLocaleString()} installs
          </p>
          <div className="flex flex-wrap gap-2">
            {agent.category ? <Badge variant="outline">{SKILL_CATEGORY_LABELS[agent.category]}</Badge> : null}
            <Badge variant="outline">{agent.skillCount} skills</Badge>
            <Badge variant="outline">{agent.routineCount} routines</Badge>
          </div>
          <ListingActions appUrl={appUrl} shareUrl={shareUrl} />
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">About this agent</h2>
        <p className="whitespace-pre-line break-words text-muted-foreground">{agent.description}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Skills</h2>
        {agent.skills.length ? (
          <ul className="divide-y rounded-xl border">
            {agent.skills.map((skill) => (
              <li key={`${skill.skillId}:${skill.versionId}`} className="flex items-center gap-3 p-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{skill.name}</p>
                  <p className="text-xs text-muted-foreground">v{skill.version}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">This agent does not include skills.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Routines</h2>
        {agent.routines.length ? (
          <ul className="divide-y rounded-xl border">
            {agent.routines.map((routine) => (
              <li key={routine.name} className="p-3">
                <p className="font-medium">{routine.name}</p>
                <p className="text-xs text-muted-foreground">{routine.active ? "Active" : "Paused"}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">This agent does not include routines.</p>
        )}
      </section>

      <section className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        The listing opens in ZollyBot. Nothing is installed until you review it and press Add there.
      </section>
    </Container>
  );
}

function AgentAvatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return (
      // biome-ignore lint/performance/noImgElement: the account service supplies this URL.
      <img src={image} alt="" className="h-20 w-20 shrink-0 rounded-2xl border object-cover" />
    );
  }
  const initials = name
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">
      {initials || "Z"}
    </div>
  );
}
