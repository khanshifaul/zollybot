import { Dynamic } from "@solidjs/web";
import { Blocks, BookOpen, Bot, Button } from "@zollybot/ui";
import { useText } from "@zollybot/ui/text";
import { For, Show } from "solid-js";
import type { BrowseLists } from "./MarketplaceBrowse";
import {
  MARKETPLACE_TAB_LABEL,
  MARKETPLACE_TABS,
  type MarketplaceScope,
  type MarketplaceTab,
} from "./marketplace-view";

const TAB_ICON = { apps: Blocks, agents: Bot, skills: BookOpen } as const;

/** The tabs of the Marketplace: the apps, the agents, then the skills. */
export function MarketplaceNav(props: { scope: MarketplaceScope; lists: BrowseLists }) {
  const { t } = useText();
  const nav = () => props.scope.nav;
  const selected = (tab: MarketplaceTab) => nav().state.tab === tab;
  return (
    <aside class="marketplace-nav">
      <h2 class="marketplace-nav-title marketplace-visually-hidden" tabindex="-1">
        {t("marketplace.title")}
      </h2>
      <nav class="marketplace-tabs" aria-label={t("marketplace.kinds")}>
        <For each={MARKETPLACE_TABS}>
          {(tab) => (
            <Button
              type="button"
              variant="ghost"
              class="marketplace-nav-item marketplace-tab"
              aria-current={selected(tab) ? "page" : undefined}
              data-cuelume-tap="select"
              onClick={() => nav().show(tab)}
            >
              <Dynamic component={TAB_ICON[tab]} aria-hidden="true" />
              <span>{t(MARKETPLACE_TAB_LABEL[tab])}</span>
              <Show when={props.lists.searching()}>
                <span class="marketplace-nav-count">{props.lists.countLabel(tab)}</span>
              </Show>
            </Button>
          )}
        </For>
      </nav>
    </aside>
  );
}
