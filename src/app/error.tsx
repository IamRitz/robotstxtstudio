"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ErrorState } from "@/components/error-state";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Route-segment error boundary. Catches render/runtime errors in a page subtree and
 * shows a friendly recovery UI instead of a blank screen. `reset()` retries the
 * segment. `digest` correlates with the server log entry for an unexpected error.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the console / error-tracking sink (wired in 13B).
    console.error(error);
  }, [error]);

  return (
    <AppShell>
      <div className="mx-auto max-w-xl py-8">
        <ErrorState
          title="Something went wrong"
          message="An unexpected error occurred while rendering this page. You can retry, or head back home — your data isn't lost."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={reset}>Try again</Button>
              <Link href="/" className={buttonVariants({ variant: "secondary" })}>
                Back to home
              </Link>
            </div>
          }
        />
        {error.digest ? (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
