---
name: zollybot-web-browse
description: Browse the internet and read web pages to learn about a topic or verify a fact. Use when the user asks about something that needs current or external information.
---

# ZollyBot web browsing

Butler can reach outside the local environment to read public web pages and learn from them.

## When to use
- The user asks about a topic, product, person, or event you do not know.
- The user asks to verify a fact, check documentation, or read a page.
- The user asks "what is", "how does", "latest", or "is it true that".

## How to act
1. Identify the best public source: official docs, Wikipedia, a reputable article.
2. Fetch the page and read it.
3. Summarize in plain words; quote only short passages.
4. Cite the source URL.
5. Store durable facts in memory so you do not re-search.

## Constraints
- Never send the user's private data, secrets, or workspace contents to any site.
- Prefer primary sources (official docs, the project's own site) over summaries.
- Do not browse paywalled or login-gated pages.
- Keep requests minimal; do not crawl.