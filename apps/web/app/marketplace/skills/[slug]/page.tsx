import { SKILL_CATEGORY_LABELS } from "@zollybot/contracts/ipc";
import {
  createMarketplaceShareUrl,
  createZollyBotMarketplaceUrl,
  isMarketplaceSkillSlug,
} from "@zollybot/contracts/marketplace-links";
import { Check, FileArchive } from "lucide-react";
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

const loadSkill = cache(async (slug: string) => loadMarketplace(catalog.skills.getBySlug(slug)));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isMarketplaceSkillSlug(slug)) return { title: "Skill not found" };
  const result = await loadSkill(slug);
  const skill = result.data;
  if (!skill) return { title: "Skill not found — ZollyBot Marketplace" };
  const card = marketplaceAssetUrl(skill.cardUrl);
  return {
    title: `${skill.name} — ZollyBot Marketplace`,
    description: skill.description,
    alternates: { canonical: `/marketplace/skills/${skill.slug}` },
    openGraph: {
      title: `${skill.name} — ZollyBot Marketplace`,
      description: skill.description,
      type: "article",
      ...(card ? { images: [{ url: card }] } : {}),
    },
  };
}

export default async function SkillListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isMarketplaceSkillSlug(slug)) notFound();
  const result = await loadSkill(slug);
  if (result.error) {
    return (
      <Container size="md" className="py-12">
        <Link className="text-sm text-primary hover:underline" href="/marketplace/skills">
          ← All skills
        </Link>
        <div className="mt-6">
          <MarketplaceState message={result.error} />
        </div>
      </Container>
    );
  }
  if (!result.data) notFound();
  const skill = result.data;
  const shareUrl = createMarketplaceShareUrl({ kind: "skill", id: skill.slug });
  const appUrl = createZollyBotMarketplaceUrl({ kind: "skill", id: skill.slug });
  const icon = marketplaceAssetUrl(skill.iconUrl);
  return (
    <Container size="md" className="space-y-8 py-10">
      <Link className="text-sm text-primary hover:underline" href="/marketplace/skills">
        ← All skills
      </Link>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted">
          {icon ? (
            // biome-ignore lint/performance/noImgElement: the account service supplies this URL.
            <img src={icon} alt="" className="h-16 w-16 object-cover" />
          ) : (
            <FileArchive className="h-7 w-7 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{skill.name}</h1>
            {skill.verified ? (
              <span className="inline-flex items-center gap-1 text-sm text-primary">
                <Check className="h-4 w-4" /> Verified
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            by {skill.creatorName} · v{skill.version} · {skill.installs.toLocaleString()} installs
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{SKILL_CATEGORY_LABELS[skill.category]}</Badge>
            <Badge variant="outline">{skill.files.length} files</Badge>
          </div>
          <ListingActions appUrl={appUrl} shareUrl={shareUrl} />
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">About this skill</h2>
        <p className="whitespace-pre-line text-muted-foreground">{skill.description}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Package files</h2>
        <ul className="divide-y rounded-xl border text-sm">
          {skill.files.map((file) => (
            <li key={file} className="flex items-center gap-2 p-3">
              <FileArchive className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{file}</span>
            </li>
          ))}
        </ul>
      </section>

      {skill.examplePrompt ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Example prompt</h2>
          <pre className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-4 text-sm">{skill.examplePrompt}</pre>
        </section>
      ) : null}

      <section className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        The listing opens in ZollyBot. Nothing is installed until you review it and press Add there.
      </section>
    </Container>
  );
}
