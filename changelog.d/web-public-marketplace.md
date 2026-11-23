### Added

- The public site now has a real Marketplace at `/marketplace`, with agent and skill catalogs, listing pages, search and category filters, and copy/open-in-ZollyBot actions.
- The canonical production catalog is served by Next.js on `zollybot.vercel.app`, including the public `/v1/marketplace/*` and `/v1/skills/*` routes; no external account API is needed.
- Marketplace share links now use `zollybot.vercel.app`; shared plugin links land on the Marketplace search.
