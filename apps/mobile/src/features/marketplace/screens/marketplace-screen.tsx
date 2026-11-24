import type { SkillCategory } from "@zollybot/contracts/ipc";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Spinner, Typography } from "heroui-native";
import { type ReactNode, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UsageSegments } from "@/features/agents/components/usage-segments";
import { SettingsNote, SettingsSection } from "@/features/settings/components/settings-content";
import { useMobileWorkspaceSelector } from "@/features/workspace/context/mobile-workspace-context";
import { GLASS_CAPSULE_HEIGHT } from "@/shared/components/glass-capsule";
import { LargeTitle, LargeTitleBar, useLargeTitleScroll } from "@/shared/components/large-title";
import { haptics } from "@/shared/lib/haptics";
import { useText } from "@/shared/lib/text";
import { typeScale } from "@/shared/lib/type-scale";
import { AgentCard, AppTile, FeaturedAgent, ListingRow } from "../components/marketplace-parts";
import { MarketplaceSearchBar } from "../components/marketplace-search-bar";
import {
  byPopularity,
  CATEGORY_LABELS,
  isMarketplaceFiltered,
  KIND_LABELS,
  MARKETPLACE_CATEGORIES,
  type MarketplaceFilter,
  type MarketplaceKind,
  type MarketplaceListing,
  matchesFilter,
  NO_MARKETPLACE_FILTER,
} from "../model/marketplace-listings";
import {
  type MarketplaceCatalog,
  type MarketplaceInstalled,
  useMarketplaceCatalog,
  useMarketplaceInstalled,
} from "../model/use-marketplace";

/** The tabs, in the order the desktop Marketplace uses. */
const MARKETPLACE_TABS = [
  { value: "app" as const, label: "mobile.marketplace.kind.apps" as const },
  { value: "agent" as const, label: "mobile.marketplace.kind.agents" as const },
  { value: "skill" as const, label: "mobile.marketplace.kind.skills" as const },
];

/**
 * The Marketplace of one server, from the drawer. The overview shows a featured agent, the popular
 * agents, the apps and the popular skills. The field at the bottom searches, and its filter menu
 * narrows the page to one kind, one category, or what the server already has.
 */
export function MarketplaceScreen() {
  const { t } = useText();
  const { serverId } = useLocalSearchParams<{ serverId: string }>();
  const server = useMobileWorkspaceSelector((workspace) => workspace.servers.find((item) => item.id === serverId));
  const scroll = useLargeTitleScroll();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<MarketplaceKind>("app");
  const [filter, setFilter] = useState<MarketplaceFilter>(NO_MARKETPLACE_FILTER);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const catalog = useMarketplaceCatalog({ serverId, query, filter });
  const installed = useMarketplaceInstalled(serverId);
  const title = t("mobile.app.route.marketplace");
  const listing = (item: MarketplaceListing) => {
    // A connector and an MCP server that the user added open their own pages, as on the desktop.
    if (item.kind === "app" && item.source === "connector") {
      router.push({ pathname: "/server-settings/connector", params: { serverId, id: item.connector } });
      return;
    }
    if (item.kind === "app" && item.source === "custom") {
      router.push({ pathname: "/server-settings/mcp-server", params: { serverId, mcpServerId: item.server.id } });
      return;
    }
    // The name goes along, so the sheet has its title before the listing loads.
    router.push({
      pathname: "/marketplace-listing",
      params: { serverId, kind: item.kind, id: item.id, name: item.name },
    });
  };
  const listMode = isMarketplaceFiltered(filter) || catalog.search.length > 0;
  /** The tab is the kind of every home and every filtered list. The filter menu can switch both. */
  const tabFilter: MarketplaceFilter = { ...filter, kind: tab };
  const changeFilter = (next: MarketplaceFilter) => {
    setFilter(next);
    if (next.kind) setTab(next.kind);
  };

  // The agents and skills did not load. The bundled apps still show under it, with a way to retry.
  const loadFailed =
    server && catalog.failed ? (
      <View className="items-center gap-3 px-6 py-4">
        <Typography.Paragraph align="center" className="text-grouped-secondary">
          {t("mobile.marketplace.loadFailed")}
        </Typography.Paragraph>
        <Button variant="secondary" onPress={() => void catalog.refetch()}>
          <Button.Label>{t("common.tryAgain")}</Button.Label>
        </Button>
      </View>
    ) : null;
  let content: ReactNode;
  if (!server) content = <SettingsNote>{t("mobile.server.unavailable")}</SettingsNote>;
  else if (listMode)
    content = (
      <FilteredList
        listings={catalog.listings.filter((item) => matchesFilter(item, tabFilter, installed.installed))}
        filter={tabFilter}
        pending={catalog.pending}
        more={catalog}
        installed={installed}
        onOpen={listing}
        onClear={() => {
          void haptics.selection();
          setFilter(NO_MARKETPLACE_FILTER);
          setQuery("");
        }}
      />
    );
  else
    content = (
      <KindHome
        kind={tab}
        listings={catalog.listings}
        pending={catalog.pending}
        installed={installed}
        onOpen={listing}
      />
    );

  return (
    <View className="flex-1 bg-sheet">
      <Animated.ScrollView
        className="flex-1"
        // The side insets go outside the scroll view, as in `LargeTitleScrollView`.
        style={{ marginLeft: insets.left, marginRight: insets.right }}
        contentInsetAdjustmentBehavior={scroll.ownsInset ? "never" : "always"}
        // Android has no content inset, so the content starts below the transparent header. The bottom
        // keeps the last row above the field.
        contentContainerStyle={{
          paddingTop: scroll.ownsInset ? scroll.headerHeight : 0,
          paddingBottom: insets.bottom + GLASS_CAPSULE_HEIGHT + 32,
        }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={scroll.onScroll}
      >
        <LargeTitle scroll={scroll} title={title} caption={server?.name} />
        <View className="gap-5 pt-2">
          {loadFailed}
          {server ? (
            <View className="px-4">
              <UsageSegments
                options={MARKETPLACE_TABS.map((option) => ({ value: option.value, label: t(option.label) }))}
                value={tab}
                onChange={setTab}
                accessibilityLabel={MARKETPLACE_TABS.map((option) => t(option.label)).join(", ")}
              />
            </View>
          ) : null}
          {content}
        </View>
      </Animated.ScrollView>
      <LargeTitleBar scroll={scroll} title={title} surface="sheet" />
      {server ? (
        <MarketplaceSearchBar
          query={query}
          onQueryChange={setQuery}
          filter={filter}
          onFilterChange={changeFilter}
          focused={focused}
          onFocusedChange={setFocused}
        />
      ) : null}
    </View>
  );
}

function SectionHeader({ title, onShowAll }: { title: string; onShowAll?: () => void }) {
  const { t } = useText();
  return (
    <View className="flex-row items-baseline justify-between px-5">
      <Typography.Heading type="h4">{title}</Typography.Heading>
      {onShowAll ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("mobile.marketplace.overview.seeAllOf", { name: title })}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
          onPress={onShowAll}
        >
          <Typography.Paragraph className="text-accent-text" style={typeScale.preview}>
            {t("mobile.marketplace.overview.seeAll")}
          </Typography.Paragraph>
        </Pressable>
      ) : null}
    </View>
  );
}

/** A listing's installs. Apps have no install count. */
function installsOf(listing: MarketplaceListing): number {
  return listing.kind === "app" ? 0 : listing.installs;
}

function KindHome({
  kind,
  listings,
  pending,
  installed,
  onOpen,
}: {
  kind: MarketplaceKind;
  listings: MarketplaceListing[];
  pending: boolean;
  installed: MarketplaceInstalled;
  onOpen: (listing: MarketplaceListing) => void;
}) {
  const { t } = useText();
  const items = listings.filter((item) => item.kind === kind).sort(byPopularity);
  if (pending && items.length === 0) return <Spinner className="self-center" />;
  if (items.length === 0) return <SettingsNote>{t("mobile.marketplace.empty")}</SettingsNote>;
  if (kind === "app") return <AppsHome listings={items} installed={installed} onOpen={onOpen} />;
  if (kind === "agent") return <AgentsHome listings={items} installed={installed} onOpen={onOpen} />;
  return <SkillsHome listings={items} installed={installed} onOpen={onOpen} />;
}

function groupsOf(listings: MarketplaceListing[]): { category: SkillCategory; listings: MarketplaceListing[] }[] {
  return MARKETPLACE_CATEGORIES.flatMap((category) => {
    const items = listings.filter((item) => (item.category ?? "other") === category);
    return items.length > 0 ? [{ category, listings: items }] : [];
  });
}

function AppsHome(props: {
  listings: MarketplaceListing[];
  installed: MarketplaceInstalled;
  onOpen: (listing: MarketplaceListing) => void;
}) {
  const { t } = useText();
  return (
    <View className="gap-6">
      {groupsOf(props.listings).map((group) => (
        <View className="gap-1" key={group.category}>
          <SectionHeader title={t(CATEGORY_LABELS[group.category])} />
          <View className="flex-row flex-wrap px-2">
            {group.listings.map((item) => (
              <AppTile
                key={`${item.kind}:${item.id}`}
                listing={item}
                installed={props.installed.installed(item)}
                onPress={() => props.onOpen(item)}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function AgentsHome(props: {
  listings: MarketplaceListing[];
  installed: MarketplaceInstalled;
  onOpen: (listing: MarketplaceListing) => void;
}) {
  const { t } = useText();
  const featured = props.listings.reduce<MarketplaceListing | undefined>(
    (top, item) => (top === undefined || installsOf(item) > installsOf(top) ? item : top),
    undefined,
  );
  const groups = groupsOf(props.listings.filter((item) => item !== featured));
  return (
    <View className="gap-6">
      {featured ? (
        <View className="px-4">
          <FeaturedAgent
            listing={featured}
            installed={props.installed.installed(featured)}
            onPress={() => props.onOpen(featured)}
          />
        </View>
      ) : null}
      {groups.map((group) => (
        <View className="gap-3" key={group.category}>
          <SectionHeader title={t(CATEGORY_LABELS[group.category])} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-4">
            {group.listings.map((item) => (
              <AgentCard
                key={`${item.kind}:${item.id}`}
                listing={item}
                installed={props.installed.installed(item)}
                onPress={() => props.onOpen(item)}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}

function SkillsHome(props: {
  listings: MarketplaceListing[];
  installed: MarketplaceInstalled;
  onOpen: (listing: MarketplaceListing) => void;
}) {
  const { t } = useText();
  return (
    <View className="gap-6">
      {groupsOf(props.listings).map((group) => (
        <View className="gap-1" key={group.category}>
          <SectionHeader title={t(CATEGORY_LABELS[group.category])} />
          <View className="px-4">
            <SettingsSection>
              {group.listings.map((item) => (
                <ListingRow
                  key={`${item.kind}:${item.id}`}
                  listing={item}
                  installed={props.installed.installed(item)}
                  showKind={false}
                  onPress={() => props.onOpen(item)}
                />
              ))}
            </SettingsSection>
          </View>
        </View>
      ))}
    </View>
  );
}

function FilteredList({
  listings,
  filter,
  pending,
  more,
  installed,
  onOpen,
  onClear,
}: {
  listings: MarketplaceListing[];
  filter: MarketplaceFilter;
  pending: boolean;
  /** The next catalog page, as the desktop "Load more". */
  more: Pick<MarketplaceCatalog, "hasMore" | "loadingMore" | "loadMoreFailed" | "loadMore">;
  installed: MarketplaceInstalled;
  onOpen: (listing: MarketplaceListing) => void;
  onClear: () => void;
}) {
  const { t } = useText();
  const parts = [
    filter.kind ? t(KIND_LABELS[filter.kind]) : null,
    filter.category ? t(CATEGORY_LABELS[filter.category]) : null,
    filter.installed ? t("mobile.marketplace.installed") : null,
  ].filter(Boolean);
  return (
    <View className="gap-3 px-4">
      {parts.length > 0 ? (
        <View className="flex-row items-baseline justify-between px-1">
          <Typography.Paragraph
            numberOfLines={1}
            className="min-w-0 flex-1 text-grouped-secondary"
            style={typeScale.preview}
          >
            {parts.join(" · ")}
          </Typography.Paragraph>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onClear}>
            <Typography.Paragraph className="text-accent-text" style={typeScale.preview}>
              {t("mobile.marketplace.filter.clear")}
            </Typography.Paragraph>
          </Pressable>
        </View>
      ) : null}
      {listings.length > 0 ? (
        <SettingsSection>
          {listings.map((item) => (
            <ListingRow
              key={`${item.kind}:${item.id}`}
              listing={item}
              installed={installed.installed(item)}
              showKind={filter.kind === null}
              onPress={() => onOpen(item)}
            />
          ))}
        </SettingsSection>
      ) : pending ? (
        <Spinner className="self-center" />
      ) : (
        <SettingsNote>{t("mobile.marketplace.empty")}</SettingsNote>
      )}
      {more.loadMoreFailed ? <SettingsNote>{t("mobile.marketplace.loadFailed")}</SettingsNote> : null}
      {more.hasMore ? (
        <Button
          variant="secondary"
          className="self-center"
          isDisabled={more.loadingMore}
          onPress={() => void more.loadMore()}
        >
          <Button.Label>{t("mobile.marketplace.loadMore")}</Button.Label>
        </Button>
      ) : null}
    </View>
  );
}
