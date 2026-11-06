import { createFileRoute } from "@tanstack/solid-router";
import { LandingPage } from "../components/landing/LandingPage";
import { openBotHomeHead } from "../lib/site-metadata";
import { ZOLLYBOT_SOFTWARE_APPLICATION } from "../lib/software-application";

export const Route = createFileRoute("/")({
  head: ({ match }) => openBotHomeHead(ZOLLYBOT_SOFTWARE_APPLICATION, match.context.siteUrl),
  component: LandingPage,
});
