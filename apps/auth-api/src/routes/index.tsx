import { createFileRoute } from "@tanstack/solid-router";
import { LandingPage } from "../components/landing/LandingPage";
import { zollyBotHomeHead } from "../lib/site-metadata";
import { ZOLLYBOT_SOFTWARE_APPLICATION } from "../lib/software-application";

export const Route = createFileRoute("/")({
  head: ({ match }) => zollyBotHomeHead(ZOLLYBOT_SOFTWARE_APPLICATION, match.context.siteUrl),
  component: LandingPage,
});
