"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCodeCopied } from "@/lib/analytics";

/** Copy-to-clipboard button with transient "Copied" feedback. `context` labels the
 *  copied snippet for analytics (e.g. the code panel's title). */
export function CopyButton({
  value,
  label = "Copy",
  context,
}: {
  value: string;
  label?: string;
  context?: string;
}) {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      trackCodeCopied(context ?? label, pathname ?? "");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={copy} aria-label={label}>
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : label}
    </Button>
  );
}
