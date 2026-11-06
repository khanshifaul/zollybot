// Slug to guide body, on the same terms as the news bodies: eager, so the prose
// is in the server's HTML rather than arriving after hydration.

import type { ArticleBody } from "../body";
import { AgenticAIDefinition } from "./agentic-ai-definition";
import { AIAgentsExamples } from "./ai-agents-examples";
import { AIAgentsVsAgenticAI } from "./ai-agents-vs-agentic-ai";
import { AIWorkspaceVsChat } from "./ai-workspace-vs-chat";
import { ImportGrokBotAgents } from "./import-grok-bot-agents";
import { ImportHermesAgents } from "./import-hermes-agents";
import { InstallZollyBotVPS } from "./install-zollybot-vps";
import { WhatAreAIAgents } from "./what-are-ai-agents";
import { WtfIsZollyBot } from "./wtf-is-zollybot";
import { ZollyBot101 } from "./zollybot-101";
import { ZollyBotHostedServers } from "./zollybot-hosted-servers";
import { ZollyBotMarketplace } from "./zollybot-marketplace";

export const GUIDE_BODIES: Readonly<Record<string, ArticleBody>> = {
  "ai-workspace-vs-chat": AIWorkspaceVsChat,
  "install-zollybot-vps": InstallZollyBotVPS,
  "import-hermes-agents": ImportHermesAgents,
  "import-grok-bot-agents": ImportGrokBotAgents,
  "ai-agents-examples": AIAgentsExamples,
  "ai-agents-vs-agentic-ai": AIAgentsVsAgenticAI,
  "agentic-ai-definition": AgenticAIDefinition,
  "what-are-ai-agents": WhatAreAIAgents,
  "zollybot-101": ZollyBot101,
  "zollybot-hosted-servers": ZollyBotHostedServers,
  "zollybot-marketplace": ZollyBotMarketplace,
  "wtf-is-zollybot": WtfIsZollyBot,
};
