"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ListingActions({ appUrl, shareUrl }: { appUrl: string; shareUrl: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // The clipboard can be unavailable in an insecure context; the address is still selectable.
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      <a className={cn(buttonVariants({ variant: "default" }), "gap-2")} href={appUrl}>
        Open in ZollyBot
      </a>
      <button type="button" className={cn(buttonVariants({ variant: "outline" }), "gap-2")} onClick={() => void copy()}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
