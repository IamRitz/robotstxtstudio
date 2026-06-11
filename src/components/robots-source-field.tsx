"use client";

import { useState, type ReactNode } from "react";
import { Globe } from "lucide-react";
import type { FetchRobotsResponse } from "@/app/api/fetch-robots/route";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/segmented";
import { Callout } from "@/components/callout";
import type { StatusKey } from "@/components/severity";
import { trackFetchRobots } from "@/lib/analytics";

type Mode = "paste" | "fetch";

const FETCH_NOTE: Record<string, { status: StatusKey; title: string }> = {
  "not-found": { status: "warning", title: "No robots.txt found — this site allows all crawlers" },
  "invalid-content-type": { status: "warning", title: "The response was not plain text" },
  "too-large": { status: "warning", title: "robots.txt is large — loaded a portion" },
  timeout: { status: "blocked", title: "Fetching timed out" },
  "network-error": { status: "blocked", title: "Could not fetch robots.txt" },
};

/**
 * robots.txt source input with Paste and "Fetch from URL" tabs. The fetch path
 * reuses /api/fetch-robots and writes the result back into the shared text value.
 * Pass `editor` to replace the default textarea with a richer editing surface
 * (e.g. the Validator's annotated RobotsEditor) — fetch behavior is unchanged.
 */
export function RobotsSourceField({
  value,
  onChange,
  rows = 14,
  label = "robots.txt",
  editor,
}: {
  value: string;
  onChange: (text: string) => void;
  rows?: number;
  label?: string;
  /** Custom paste-mode editing surface; defaults to a plain textarea. */
  editor?: ReactNode;
}) {
  const [mode, setMode] = useState<Mode>("paste");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<{ status: StatusKey; title: string } | null>(null);

  async function fetchFromUrl() {
    const target = domain.trim();
    if (!target) return;
    setLoading(true);
    setNote(null);
    trackFetchRobots("source-field");
    try {
      const res = await fetch("/api/fetch-robots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: target }),
      });
      const data = (await res.json().catch(() => null)) as
        | (FetchRobotsResponse & { error?: string })
        | null;
      if (!res.ok || !data) {
        setNote({ status: "blocked", title: data?.error ?? "Could not fetch robots.txt" });
        return;
      }
      onChange(data.body);
      setMode("paste");
      setNote(FETCH_NOTE[data.status] ?? null);
    } catch {
      setNote({ status: "blocked", title: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Segmented<Mode>
        value={mode}
        onChange={setMode}
        options={[
          { value: "paste", label: "Paste" },
          { value: "fetch", label: "Fetch from URL" },
        ]}
      />

      {mode === "paste" ? (
        (editor ?? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            aria-label={label}
          />
        ))
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void fetchFromUrl();
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3">
            <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              aria-label="Website domain"
              placeholder="example.com"
              className="h-9 w-full bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Fetching…" : "Fetch robots.txt"}
          </Button>
        </form>
      )}

      {note ? <Callout status={note.status} title={note.title} /> : null}
    </div>
  );
}
