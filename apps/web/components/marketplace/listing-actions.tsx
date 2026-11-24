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
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <a className={cn(buttonVariants({ variant: "default" }), "w-full gap-2 sm:w-auto")} href={appUrl}>
        Open in ZollyBot
      </a>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2 sm:w-auto")}
        onClick={() => void copy()}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
