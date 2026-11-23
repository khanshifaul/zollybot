# Web Marketplace Plan

> Public pages for ZollyBot agents and skills, built on the account server that already backs the
> desktop and mobile Marketplace.

## Goal

`zollybot.shifaul.dev/marketplace` becomes the shareable catalog for agents and skills. A visitor can
browse, search, and read a listing without an account; **Add** opens that listing in ZollyBot, where the
existing authenticated install flow runs. The web never downloads a package or installs anything by
itself.

This matches the URL contract already in `packages/contracts/src/marketplace-links.ts`:

- `/marketplace/agents/<id>`
- `/marketplace/skills/<slug>`
- `zollybot://marketplace/agents/<id>`
- `zollybot://marketplace/skills/<slug>`

## Existing data and actions

| Source                                                            | Used by           | Notes                           |
| ----------------------------------------------------------------- | ----------------- | ------------------------------- |
| `GET /v1/marketplace/agents/?query&category&verified&sort&cursor` | agent catalog     | returns `MarketplaceAgentPage`  |
| `GET /v1/marketplace/agents/<id>`                                 | listing           | `MarketplaceAgentDetail`        |
| `GET /v1/marketplace/agents/<id>/listing`                         | share link        | approved version, else pending  |
| `GET /v1/skills/?query&category&sort&cursor`                      | skill catalog     | returns `MarketplaceSkillPage`  |
| `GET /v1/skills/<id>` and `/v1/skills/slug/<slug>`                | listing           | `MarketplaceSkillDetail`        |
| `GET /v1/marketplace/agents/mine`, `GET /v1/skills/mine`          | creator dashboard | requires account sign-in        |
| App install/receipt flow                                          | **Add**           | stays in the desktop/mobile app |

The current desktop services call these routes with the account token (`agent-marketplace-service.ts`,
`skill-marketplace-service.ts`). The web needs **public read routes** for the catalog and details, or a
server-side proxy with a scoped server credential. Do not send a user token to the browser for public
browsing.

## Page and route design

| Route                        | Kind                 | Content                                                                        |
| ---------------------------- | -------------------- | ------------------------------------------------------------------------------ |
| `/marketplace`               | server page          | Featured agents, featured skills, categories, search                           |
| `/marketplace/agents`        | server page          | Agent grid, category/verified filters, cursor pagination                       |
| `/marketplace/agents/[id]`   | server page          | Agent detail: avatar, creator, version, skills, routines, installs, share card |
| `/marketplace/skills`        | server page          | Skill grid, category filter, cursor pagination                                 |
| `/marketplace/skills/[slug]` | server page          | Skill detail: version, creator, files summary, installs                        |
| `/marketplace/search`        | server page or query | Combined results grouped by kind                                               |
| `/marketplace/submit`        | client page, later   | Creator submission links to the app                                            |

Use the existing listing URL builders rather than hand-building these paths. Add the public route
redirect `/plugins/<slug>` to the matching Marketplace skill page where the catalog knows the mapping.

### Listing page contract

Agent page:

- title, description, creator, category, version, installs, verified/pending state;
- avatar and share card (`cardUrl`) with a safe fallback;
- skills with links to their skill pages;
- routines only as names/counts, never their instructions;
- **Open in ZollyBot** using `createZollyBotMarketplaceUrl`;
- **Copy link** using `createMarketplaceShareUrl`;
- install CTA docs: “ZollyBot opens this listing; press Add there.”

Skill page:

- name, slug, category, version, description, creator, installs;
- file count and package size only; no bundle download;
- **Open in ZollyBot** and **Copy link**;
- agents that use the skill (from catalog data when available).

No page may accept an `install=1` query or perform a side effect on GET. Installation remains an
authenticated app action with the host's receipt flow.

## Rendering and caching on Vercel

- Use React Server Components for listing pages so search engines get full HTML.
- Fetch through a server-only data module (`apps/web/lib/marketplace.ts`), not directly in client code.
- Cache catalog pages with `revalidate` (5 minutes for lists, 10 minutes for details). Revalidate a
  detail by tag after a creator publishes.
- Pagination uses the existing cursors; do not load the whole catalog.
- Use `next/image` with explicit dimensions and the account server's allowed image origins, or proxy
  avatars/icons through a cached route. Validate MIME and size.
- Add `generateMetadata` for title, description, canonical URL, and Open Graph image per listing.
- Add `sitemap.ts` that enumerates public listings with a bounded page count.
- Add `robots.ts` allowing catalog pages and disallowing `/marketplace/submit` until it exists.

## Search and filters

- Server-side search delegates to the account API; no local index in the first version.
- Filters: agent category, verified, sort by installs; skill category, sort by installs.
- Debounce the client search input and update the URL query (`?q=&category=&verified=`); a shared link
  reproduces the result.
- Empty, loading, offline, and API-error states use the same cards and copy as the desktop Marketplace.

## Creator and submission flow

Phase 2, after public browsing:

1. `/marketplace/submit` explains the app flow and links to `zollybot://marketplace/submit`.
2. If web submission is required, add account sign-in with the existing account service, then reuse
   the agent/skill submit multipart contracts. This is a separate authenticated surface; never expose
   creator tokens in the public catalog.
3. `/marketplace/mine` lists submissions and their review status.
4. Moderation and abuse controls live on the account service, not in Vercel.

## Security and policy

- Public pages expose only data the catalog already marks public; never skill bundles, secrets, agent
  instructions, routine instructions, or private creator emails.
- Escape/sanitize all catalog text; do not render arbitrary HTML from a listing.
- Validate ids/slugs with the existing contract predicates before a request.
- Rate-limit proxy routes; cache to reduce load.
- The app remains the only installer. The web cannot add an agent to a host or mint an install receipt.
- Add CSP, `Referrer-Policy`, and `X-Content-Type-Options` headers in `vercel.json`.

## Implementation sequence

1. Add public read endpoints or a server-only catalog client and contract decoders.
2. Build `/marketplace` and the two index pages against fixtures.
3. Add agent and skill detail pages, share metadata, and deep links.
4. Add search/filter URL state and pagination.
5. Wire `/plugins/[slug]` to skill pages and update share links.
6. Add sitemap, robots, JSON-LD, and Open Graph validation.
7. Add creator sign-in/submission only after the public catalog is stable.

## Tests

- Contract decoding tests for every catalog/detail fixture and malformed payload.
- Route tests for invalid agent id/slug, 404 listing, pending listing, and API error.
- Playwright: search → filter → detail → copy link; deep link scheme is present; keyboard navigation;
  light/dark screenshots at 390 px and 1440 px.
- Metadata: canonical, title, description, OG image, JSON-LD, sitemap entries.
- Security: no bundle path in HTML; no write action on GET; invalid query does not reach upstream.

## Definition of done

- The three marketplace URLs in `marketplace-links.ts` render on `zollybot.shifaul.dev`.
- Every listing has a canonical URL, share card, and a working `zollybot://` button.
- Search and filters are reproducible from the URL.
- No package download or install side effect exists on the web.
- Catalog pages render from cached server data and pass light/dark visual checks.
