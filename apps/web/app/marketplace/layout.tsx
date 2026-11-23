import type { ReactNode } from "react";
import { MarketplaceFooter, MarketplaceHeader } from "@/components/marketplace/marketplace-ui";

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketplaceHeader />
      <main>{children}</main>
      <MarketplaceFooter />
    </div>
  );
}
