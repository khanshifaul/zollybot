// The one list of published guides. Same shape as the news registry, and read by
// the same pages, feed, sitemap and image generator.
//
// The public guides explain how ZollyBot works and how to use it. Contributor
// instructions for adding a guide live in CONTRIBUTING.md instead.

import { type ContentCollection, publishedFirst } from "./content-collection";
import { NEWS_AUTHOR } from "./news";

export const GUIDES_COLLECTION: ContentCollection<"guides"> = {
  id: "guides",
  indexRoute: "/guides",
  articleRoute: "/guides/$slug",
  name: "Guides",
  indexTitle: "ZollyBot Guides: How to Run a Team of AI Agents",
  indexDescription:
    "How ZollyBot works and how to run a team of AI agents. Start with how to set up your first agent, then explore practical guides to models, agents, and the Marketplace.",
  indexSocialImage: {
    path: "/social/guides.jpg",
    alt: "From idea to done. ZollyBot agents on a folded paper path",
  },
  feedTitle: "ZollyBot guides",
  backLabel: "All guides",
  moreTitle: "More guides",
  imageEyebrow: "OPENBOT · GUIDES",
  articles: publishedFirst([
    {
      slug: "ai-workspace-vs-chat",
      title: "AI Agent Workspace vs Chat History: What Changes in Practice?",
      description:
        "Compare an AI agent workspace with chat history in ZollyBot. See how saved files, shared work and model changes affect an ongoing research task.",
      publishedAt: "2026-11-03",
      author: NEWS_AUTHOR,
    },
    {
      slug: "install-zollybot-vps",
      title: "How to Install ZollyBot on a VPS: Ubuntu and Docker Guide",
      description:
        "Install ZollyBot on a VPS with Ubuntu or Docker. Connect the server to your account, set up an AI provider, and manage updates, logs and backups.",
      publishedAt: "2026-10-30",
      author: NEWS_AUTHOR,
    },
    {
      slug: "import-hermes-agents",
      title: "How to Import Hermes Agents into ZollyBot",
      description:
        "Import your Hermes Agent profiles into ZollyBot. Choose what to bring over, review instructions, memories and skills, and check your agents after import.",
      publishedAt: "2026-10-27",
      author: NEWS_AUTHOR,
    },
    {
      slug: "import-grok-bot-agents",
      title: "How to Import Grok Bot Agents into ZollyBot",
      description:
        "Move your Grok Bot agents into ZollyBot with one ZIP export. Follow the steps for instructions, skills, memories, routines and optional files.",
      publishedAt: "2026-10-23",
      author: NEWS_AUTHOR,
    },
    {
      slug: "ai-agents-examples",
      title: "20 Real AI Agent Examples for Work and Business",
      description:
        "Explore 20 practical AI agent examples for research, content, coding and daily operations. Each ZollyBot task ends with a result you can review.",
      publishedAt: "2026-10-20",
      author: NEWS_AUTHOR,
    },
    {
      slug: "ai-agents-vs-agentic-ai",
      title: "AI Agents vs Agentic AI: What Is the Difference?",
      description:
        "AI agents vs agentic AI, explained with a simple ZollyBot example. See what an agent is, what makes its work agentic, and when one agent is enough.",
      publishedAt: "2026-10-16",
      author: NEWS_AUTHOR,
    },
    {
      slug: "agentic-ai-definition",
      title: "Agentic AI Definition: How It Differs From Chatbots",
      description:
        "What is agentic AI? Compare ZollyBot agents with a typical chatbot: ongoing tasks, saved files, source checking and handoffs between agents.",
      publishedAt: "2026-10-13",
      author: NEWS_AUTHOR,
    },
    {
      slug: "zollybot-hosted-servers",
      title: "ZollyBot Hosted Servers: Plans, Pricing, and How They Work",
      description:
        "Compare ZollyBot hosted server plans, pricing, storage, and team limits. Learn how to set one up and when self-hosting may suit you better.",
      publishedAt: "2026-10-07",
      author: NEWS_AUTHOR,
    },
    {
      slug: "zollybot-marketplace",
      title: "How to Use the ZollyBot Marketplace: Agents, Skills, and Plugins",
      description:
        "Browse the ZollyBot Marketplace, install agents, plugins, and skills, and submit your own agent for review.",
      publishedAt: "2026-09-29",
      author: NEWS_AUTHOR,
    },
    {
      slug: "what-are-ai-agents",
      title: "What Are AI Agents? How They Work and When to Use Them",
      description:
        "What are AI agents, how do they work, and when are they useful? A practical guide to their tools, use cases, and limits.",
      publishedAt: "2026-09-24",
      author: NEWS_AUTHOR,
    },
    {
      slug: "zollybot-101",
      title: "How to Use ZollyBot: Set Up Your First AI Agent",
      description:
        "What ZollyBot is, what an agent keeps between runs, and how to get one doing real work on your computer. Start here if you have not opened the app yet.",
      publishedAt: "2026-09-12",
      author: NEWS_AUTHOR,
    },
    {
      slug: "wtf-is-zollybot",
      title: "What Is ZollyBot? Models, Providers and Agents Explained",
      description:
        "A practical explanation of models, providers, agents, and the local-first workspace that brings them together.",
      publishedAt: "2026-09-15",
      author: NEWS_AUTHOR,
    },
  ]),
};
