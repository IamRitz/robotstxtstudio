import { MODULES } from "@/config/modules";

/**
 * Phase 1 placeholder dashboard. Renders the module registry as static cards
 * so the app boots and the smoke/e2e tests have something real to assert.
 * Phase 10 replaces this with the interactive tabbed dashboard.
 */
export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Robots.txt Studio</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          The all-in-one robots.txt toolkit — generate, validate, test, explain, and manage AI
          crawler permissions.
        </p>
      </header>

      <section aria-label="Modules" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => (
          <article
            key={mod.id}
            className="rounded-[var(--radius)] border border-border bg-muted/40 p-5"
          >
            <h2 className="text-lg font-semibold">{mod.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{mod.tagline}</p>
            <span className="mt-3 inline-block text-xs uppercase tracking-wide text-muted-foreground">
              {mod.status === "ready" ? "Available" : "Coming soon"}
            </span>
          </article>
        ))}
      </section>
    </main>
  );
}
