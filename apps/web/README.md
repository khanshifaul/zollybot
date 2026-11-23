# `apps/web`

Web/marketing site app for ZollyBot in this checkout.

- **Stack:** Next.js (App Router), React, Tailwind CSS, `next-themes`.
- **Location:** `apps/web/app/` (pages/layout/styles/route handlers), `apps/web/components/`, `apps/web/lib/`.
- **Scripts:** `bun run --cwd apps/web dev|build|start`.
- **Brand assets:** `apps/web/app/icon.png`, `apple-icon.png`, `opengraph-image.png`, and `apps/web/public/brand/`.

## Vercel

Create the project from this repository with **Root Directory** set to `apps/web`. The checked-in
`vercel.json` installs from the repository root (`cd ../.. && bun install --frozen-lockfile`) and
runs `bun run build` here. Node 24 matches `.nvmrc` and the workspace toolchain.

The app is deployed as a Next.js server, not a static export. That is what serves `/latest`,
`/install.sh`, `/changelog`, `/docs`, `/cla`, and the compatibility bridge at
`/releases/0.62.10/*`. Release binaries stay on GitHub; `/releases/*` redirects there.

The Vercel project is `zollybot` and its production domain is `zollybot.vercel.app`. The older
`zollybot.shifaul.dev` domain may remain as an alias while the Cloudflare DNS record is migrated.

This workspace is separate from the Electron desktop app and from deployment-specific
account/browser-client services described elsewhere in repository docs.
