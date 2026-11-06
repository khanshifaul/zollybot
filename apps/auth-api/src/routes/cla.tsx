import { createFileRoute } from "@tanstack/solid-router";
import { ClaPage } from "../components/legal/ClaPage";
import { CLA_META, CLA_ROUTE } from "../lib/cla";
import { ZOLLYBOT_SOCIAL_IMAGE_ALT, ZOLLYBOT_SOCIAL_IMAGE_URL, ZOLLYBOT_X_HANDLE } from "../lib/site-metadata";

export const Route = createFileRoute("/cla")({
  head: ({ match }) => {
    const url = new URL(CLA_ROUTE, match.context.siteUrl).toString();
    const { title, description } = CLA_META;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "ZollyBot" },
        { property: "og:locale", content: "en_US" },
        { property: "og:url", content: url },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: ZOLLYBOT_SOCIAL_IMAGE_URL },
        { property: "og:image:alt", content: ZOLLYBOT_SOCIAL_IMAGE_ALT },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: ZOLLYBOT_X_HANDLE },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ZOLLYBOT_SOCIAL_IMAGE_URL },
        { name: "twitter:image:alt", content: ZOLLYBOT_SOCIAL_IMAGE_ALT },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ClaPage,
});
