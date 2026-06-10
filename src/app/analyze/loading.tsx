import { AppShell } from "@/components/app-shell";
import { Breadcrumb } from "@/components/breadcrumb";
import { LoadingCard, LoadingState } from "@/components/loading-state";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level loading UI for the Analyzer. `/analyze` is dynamic (it reads the
 * `domain` search param and server-renders), so this skeleton shows instantly on
 * navigation while the server component resolves. The screen's own post-submit
 * loading state covers the live fetch.
 */
export default function Loading() {
  return (
    <AppShell>
      <Breadcrumb items={["Robots.txt Studio", "Analyze"]} className="mb-3" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 space-y-6">
        <LoadingCard />
        <LoadingState lines={4} />
      </div>
    </AppShell>
  );
}
