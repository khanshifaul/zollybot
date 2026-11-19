import { CHANNEL_CHATS_CAPABILITY, CHANNEL_TASK_CANCEL_CAPABILITY } from "@zollybot/contracts/ipc";
import { MESSAGE_DELETE_CAPABILITY } from "@zollybot/contracts/team-protocol/message-delete-v1";
import { createContext, type ParentProps, untrack, useContext } from "solid-js";
import { useAgents } from "../agents/agents-context";
import { useDirectMessages } from "../conversation/direct-messages-context";
import { saveRemoteFrameChannels } from "../servers/remote-workspace-frame";
import { serverRoleCanAdminister } from "../servers/server-capabilities";
import { useServers } from "../servers/servers-context";
import { useWindowPage } from "../window/window-page-context";
import { readChannelSelection, writeChannelSelection } from "./channel-selection";
import { type ChannelsController, createChannelsController } from "./channels-controller";
import { channelsPort } from "./channels-port";

const ChannelsContext = createContext<ChannelsController>(undefined, { name: "Channels" });

export function useChannels(): ChannelsController {
  try {
    return useContext(ChannelsContext);
  } catch (cause) {
    throw new Error("Channels is unavailable outside its provider.", { cause });
  }
}

/** Mounts a channels controller that a client built with its own environment. */
export function ChannelsControllerProvider(props: ParentProps<{ controller: ChannelsController }>) {
  return <ChannelsContext value={props.controller}>{props.children}</ChannelsContext>;
}

/** The desktop channels domain: preload is the runtime, and the app's contexts are the environment. */
export function ChannelsProvider(props: ParentProps) {
  const { activeServer, activeServerId, activeServerSupportsCapability } = useServers();
  const { agentList, setAgentSetupOpen } = useAgents();
  const { clearDirectSelection, setDirectTyping } = useDirectMessages();
  const windowPage = useWindowPage();
  const selectionServerId = untrack(activeServerId);
  const accountKey = () => "local";
  const controller = createChannelsController({
    port: channelsPort,
    agents: agentList,
    scopeKey: accountKey,
    readSelection: (account) =>
      account === "loading" || account === "error"
        ? null
        : (readChannelSelection()[account]?.[selectionServerId] ?? null),
    writeSelection: (channelId) => {
      writeChannelSelection(accountKey(), selectionServerId, channelId);
    },
    supported: () => activeServerSupportsCapability(CHANNEL_CHATS_CAPABILITY),
    deletionSupported: () => activeServer()?.kind !== "remote" || serverRoleCanAdminister(activeServer()),
    taskCancelSupported: () => activeServerSupportsCapability(CHANNEL_TASK_CANCEL_CAPABILITY),
    messageDeletionSupported: () => activeServerSupportsCapability(MESSAGE_DELETE_CAPABILITY),
    deletesAnyMessage: () => activeServer()?.kind === "local" || serverRoleCanAdminister(activeServer()),
    // The picture is a file on this computer. Until the server is known, the editor stays hidden.
    pictureSupported: () => activeServer()?.kind === "local",
    beforeOpen: () => {
      setAgentSetupOpen(false);
      // The channel covers the workspace, and a direct conversation left selected under it is read
      // automatically as its messages arrive. Selecting an agent closes the channel in the shared
      // navigation; this is the same exchange the other way round.
      setDirectTyping(false);
      clearDirectSelection();
      windowPage.showAgents();
    },
    // A rail page, such as Usage or Settings, covers the workspace content, so a message that
    // arrives behind it was never seen, however focused the window is. The channel stays
    // selected under the report, which is the state this read has to refuse.
    canMarkRead: () => document.hasFocus() && !windowPage.conversationCovered(),
    // The rows of a joined server's channels go to its frame for the next start.
    onList: (channels) => {
      const server = activeServer();
      // local-only: no account
      if (server?.kind === "remote") saveRemoteFrameChannels("local", server.id, channels);
    },
  });
  return <ChannelsControllerProvider controller={controller}>{props.children}</ChannelsControllerProvider>;
}
