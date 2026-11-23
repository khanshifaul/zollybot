import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@zollybot/contracts", "@zollybot/team-client", "@zollybot/i18n", "@zollybot/user-errors"],
};
export default nextConfig;
