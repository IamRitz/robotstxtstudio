import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeader } from "@/components/section-header";
import { TOOLS } from "@/config/content";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl py-8">
        <EmptyState
          icon={Compass}
          title="404 — Page not found"
          description="The page you're looking for doesn't exist or may have moved. Try one of the tools below, or head back home."
          action={
            <Link href="/" className={buttonVariants()}>
              Back to home
            </Link>
          }
        />

        <div className="mt-10">
          <SectionHeader className="mb-3">Jump into a tool</SectionHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.values(TOOLS).map((t) => (
              <Link key={t.href} href={t.href} className="group">
                <Card className="flex h-full items-start gap-3 p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
                    <t.icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      {t.title}
                      <ArrowRight
                        className="size-3 text-brand transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {t.description}
                    </span>
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
