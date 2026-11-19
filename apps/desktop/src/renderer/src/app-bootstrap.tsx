import type { MarketplaceListingLink } from "@zollybot/contracts/marketplace-links";
import { flush, onSettled } from "solid-js";
import { appPort } from "./app-port";
import { useSettings } from "./features/settings/settings-context";

/**
 * Deep links that open the marketplace or an agent install dialog.
 *
 * Invite/join-server links are not handled here.
 */
export function AppBootstrap() {
  const { setPendingAgentTemplateId, setPendingPluginSlug, setPendingMarketplaceListing } = useSettings();

  onSettled(() => {
    const receivePluginSlug = (slug: string) => {
      flush(() => setPendingPluginSlug(slug));
    };
    const unsubscribePlugin = appPort().plugins.onOpenListing((slug) => {
      receivePluginSlug(slug);
    });
    // A Marketplace link opens the agent or skill page. Only Add on that page adds it.
    const receiveMarketplaceListing = (link: MarketplaceListingLink) => {
      flush(() => setPendingMarketplaceListing(link));
    };
    const unsubscribeMarketplace = appPort().marketplace.onOpenListing((link) => {
      receiveMarketplaceListing(link);
    });
    const receiveAgentTemplate = (id: string) => {
      flush(() => setPendingAgentTemplateId(id));
    };
    const unsubscribeAgentTemplate = appPort().agentTemplates.onOpenLink((id) => {
      receiveAgentTemplate(id);
    });
    // Every subscription is in place before any link is asked for, because the first of these
    // requests is what tells main that a window is listening.
    void appPort()
      .plugins.takePendingListing()
      .then((slug) => slug && receivePluginSlug(slug))
      .catch(() => undefined);
    void appPort()
      .marketplace.takePendingListing()
      .then((link) => link && receiveMarketplaceListing(link))
      .catch(() => undefined);
    void appPort()
      .agentTemplates.takePendingLink()
      .then((id) => id && receiveAgentTemplate(id))
      .catch(() => undefined);
    return () => {
      unsubscribePlugin();
      unsubscribeMarketplace();
      unsubscribeAgentTemplate();
    };
  });

  return null;
}
