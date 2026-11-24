import type { MarketplaceAgentSummary, MarketplaceSkillSummary } from "@zollybot/contracts/ipc";
import { SKILL_CATEGORY_LABELS } from "@zollybot/contracts/ipc";
import { Check, Download, Package, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export function MarketplaceHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
      <Container size="lg" className="flex h-14 items-center justify-between gap-2 sm:gap-4">
        <Link href="/marketplace" className="flex min-w-0 items-center gap-2 font-semibold tracking-tight">
          <Image
            src="/brand/zollybot-logo.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 dark:hidden"
          />
          <Image
            src="/brand/zollybot-logo-dark.png"
            alt=""
            width={28}
            height={28}
            className="hidden h-7 w-7 shrink-0 dark:block"
          />
          <span className="truncate">Marketplace</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-0.5 text-sm sm:gap-1" aria-label="Marketplace">
          <Link
            className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground sm:px-3"
            href="/marketplace/agents"
          >
            Agents
          </Link>
          <Link
            className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground sm:px-3"
            href="/marketplace/skills"
          >
            Skills
          </Link>
          <Link
            className="hidden rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground sm:block"
            href="/"
          >
            ZollyBot
          </Link>
          <ThemeToggle />
        </nav>
      </Container>
    </header>
  );
}

export function MarketplaceFooter() {
  return (
    <footer className="border-t border-border/60 py-8">
      <Container
        size="lg"
        className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
      >
        <p>Agents and skills for ZollyBot. Installation happens in the app.</p>
        <div className="flex gap-4">
          <Link className="hover:text-foreground" href="/">
            ZollyBot
          </Link>
          <Link className="hover:text-foreground" href="/docs">
            Docs
          </Link>
        </div>
      </Container>
    </footer>
  );
}

export function MarketplaceState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">The marketplace could not be loaded.</p>
      <p className="mt-2">{message}</p>
    </div>
  );
}

export function AgentCard({ agent }: { agent: MarketplaceAgentSummary }) {
  return (
    <Link href={`/marketplace/agents/${agent.id}`} className="group block h-full">
      <Card className="h-full transition-colors group-hover:border-primary/50">
        <CardHeader className="gap-3 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <AgentAvatar name={agent.name} seed={agent.avatarSeed} hue={agent.avatarHue} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="truncate text-base">{agent.name}</CardTitle>
                {agent.verified ? (
                  <span title="Verified by ZollyBot" className="text-primary">
                    <Check className="h-4 w-4" />
                  </span>
                ) : null}
              </div>
              <p className="truncate text-xs text-muted-foreground">{agent.title}</p>
            </div>
            {agent.featured ? (
              <Badge variant="secondary" className="shrink-0">
                Featured
              </Badge>
            ) : null}
          </div>
          <p className="line-clamp-3 text-sm text-muted-foreground">{agent.description}</p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 p-4 pt-0 text-xs text-muted-foreground sm:gap-3 sm:p-6 sm:pt-0">
          {agent.category ? <Badge variant="outline">{SKILL_CATEGORY_LABELS[agent.category]}</Badge> : null}
          <span>v{agent.version}</span>
          <span className="inline-flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            {agent.installs.toLocaleString()}
          </span>
          <span>{agent.skillCount} skills</span>
          <span>{agent.routineCount} routines</span>
        </CardContent>
      </Card>
    </Link>
  );
}

export function SkillCard({ skill }: { skill: MarketplaceSkillSummary }) {
  const icon = skill.iconUrl;
  return (
    <Link href={`/marketplace/skills/${skill.slug}`} className="group block h-full">
      <Card className="h-full transition-colors group-hover:border-primary/50">
        <CardHeader className="gap-3 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
              {icon ? (
                // biome-ignore lint/performance/noImgElement: the account service supplies this URL.
                <img src={icon} alt="" className="h-10 w-10 object-cover" />
              ) : (
                <Package className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="truncate text-base">{skill.name}</CardTitle>
                {skill.verified ? (
                  <span title="Verified by ZollyBot" className="text-primary">
                    <Check className="h-4 w-4" />
                  </span>
                ) : null}
              </div>
              <p className="truncate text-xs text-muted-foreground">{skill.creatorName}</p>
            </div>
            {skill.featured ? (
              <Badge variant="secondary" className="shrink-0">
                Featured
              </Badge>
            ) : null}
          </div>
          <p className="line-clamp-3 text-sm text-muted-foreground">{skill.description}</p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 p-4 pt-0 text-xs text-muted-foreground sm:gap-3 sm:p-6 sm:pt-0">
          <Badge variant="outline">{SKILL_CATEGORY_LABELS[skill.category]}</Badge>
          <span>v{skill.version}</span>
          <span className="inline-flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            {skill.installs.toLocaleString()}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

export function FeaturedEmpty() {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      <Sparkles className="mx-auto mb-3 h-5 w-5" />
      No marketplace listings are available yet.
    </div>
  );
}

function AgentAvatar({ name, seed, hue }: { name: string; seed: string; hue: number | null }) {
  const initials = name
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold text-primary-foreground"
      style={{ backgroundColor: `hsl(${hue ?? seed.length * 37} 55% 42%)` }}
    >
      {initials || "Z"}
    </div>
  );
}
