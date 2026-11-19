import type { BillingPlanId, BillingServerPlan } from "@zollybot/contracts/billing";
import type { ServerSummary } from "@zollybot/contracts/ipc";
import { ServerUpgradeDialog } from "@zollybot/ui/features/servers/ServerUpgradeDialog";
import type { SidebarStorageLevel } from "@zollybot/ui/features/sidebar/SidebarStorageCard";
import { createEffect, createStore, Show } from "solid-js";

interface StorageCard {
  level: SidebarStorageLevel;
  serverId: string;
  freeBytes: number;
  totalBytes: number;
}

interface Offer {
  card: StorageCard;
  serverName: string;
  plan: BillingServerPlan;
  nextPlan: BillingPlanId;
}

/**
 * Billing UI removed: server upgrade offers are unavailable without billing APIs.
 */
export function ServerUpgradeOffer(props: {
  card: StorageCard | null;
  server: ServerSummary | undefined;
  /** Another dialog is open, such as Server settings. The offer waits. */
  blocked: boolean;
  onFreeUpSpace: (serverId: string) => void;
}) {
  const [state, setState] = createStore<{ offer: Offer | null; pending: boolean; error: string | null }>({
    offer: null,
    pending: false,
    error: null,
  });

  /** The offer of the selected server only. The plan change applies to the server that the dialog names. */
  const shown = () => (state.offer?.card.serverId === props.server?.id ? state.offer : null);

  createEffect(
    () => [props.card, props.server, props.blocked],
    () => {
      setState((draft) => {
        draft.offer = null;
        draft.pending = false;
        draft.error = null;
      });
    },
  );

  function close(): void {
    setState((draft) => {
      draft.offer = null;
    });
  }

  async function upgrade(_offer: Offer): Promise<void> {
    close();
  }

  /** The disk as the card reads it now, or as it was when the offer opened. */
  const disk = (offer: Offer) => (props.card?.serverId === offer.card.serverId ? props.card : offer.card);

  return (
    <Show when={shown()}>
      {(offer) => (
        <ServerUpgradeDialog
          serverName={offer().serverName}
          level={disk(offer()).level}
          freeBytes={disk(offer()).freeBytes}
          totalBytes={disk(offer()).totalBytes}
          plan={offer().plan.plan}
          nextPlan={offer().nextPlan}
          interval={offer().plan.interval}
          currency={offer().plan.currency}
          amount={offer().plan.amount}
          pending={state.pending}
          error={state.error}
          onUpgrade={() => void upgrade(offer())}
          onFreeUpSpace={() => {
            const { serverId } = offer().card;
            close();
            props.onFreeUpSpace(serverId);
          }}
          onClose={close}
        />
      )}
    </Show>
  );
}
