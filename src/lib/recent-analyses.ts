/**
 * Recent-analyses store (Phase 17C) — session continuity with zero backend.
 *
 * One localStorage key holds the last 10 analyses (LRU by domain, newest first).
 * Each entry carries the dashboard summary (domain, scores, counts, timestamp)
 * AND the robots.txt snapshot + fetch metadata, so a previous analysis can be
 * fully restored — report, queue, working copy — without another network fetch
 * (`buildAnalysisReport` re-derives everything from the snapshot).
 *
 * Privacy: this never leaves the browser. Storage failures (private browsing,
 * quota) are silently ignored — continuity is an enhancement, never a blocker.
 */
import type { FetchResult, FetchStatus, ScoreBand } from "@/types";

const KEY = "rs:recent-analyses:v1";
const MAX_ENTRIES = 10;
/** Snapshots above this are not stored (entry still lists; resume refetches). */
const MAX_SNAPSHOT_CHARS = 100_000;

export interface RecentAnalysis {
  /** Normalized domain (the report's own `domain`) — the LRU key. */
  readonly domain: string;
  /** ISO timestamp of the fetch this entry snapshots. */
  readonly fetchedAt: string;
  readonly visibility: { readonly value: number; readonly band: ScoreBand };
  /** File health (contributing metric). */
  readonly health: number;
  readonly fetchStatus: FetchStatus;
  /** Errors + warnings at last recompute. */
  readonly findingCount: number;
  /** 1-click recoveries still available. */
  readonly safeFixCount: number;
  /** Fetch metadata needed to rebuild the report (body omitted — see `source`). */
  readonly fetch: FetchResult;
  /** The robots.txt as fetched. Absent when oversized → resume refetches. */
  readonly source?: string;
  /** The working copy, when fixes were applied (defaults to `source`). */
  readonly workingText?: string;
  /** Visibility at the PREVIOUS fetch of this domain (powers the ▲/▼ delta). */
  readonly previousVisibility?: number;
}

/** Strip scheme/path/case so user input ("https://Example.com/x") matches a stored domain. */
export function canonicalDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, "")
    .replace(/[/?#].*$/, "");
}

function read(): RecentAnalysis[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentAnalysis[]) : [];
  } catch {
    return [];
  }
}

function write(entries: readonly RecentAnalysis[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // Quota / private browsing — continuity silently degrades to "no history".
  }
}

/** Newest first. */
export function listRecentAnalyses(): RecentAnalysis[] {
  return read();
}

export function getRecentAnalysis(domainInput: string): RecentAnalysis | undefined {
  const domain = canonicalDomain(domainInput);
  return read().find((e) => e.domain === domain);
}

/**
 * Upsert (LRU by domain, cap 10). A NEW fetch of a known domain records the old
 * visibility as `previousVisibility` (the dashboard delta); updates from the same
 * fetch (fix applied → workingText/scores change) keep the existing delta.
 */
export function saveRecentAnalysis(entry: Omit<RecentAnalysis, "previousVisibility">): void {
  const rest = read().filter((e) => e.domain !== entry.domain);
  const existing = read().find((e) => e.domain === entry.domain);
  const previousVisibility =
    existing === undefined
      ? undefined
      : existing.fetchedAt === entry.fetchedAt
        ? existing.previousVisibility
        : existing.visibility.value;
  const source =
    entry.source !== undefined && entry.source.length <= MAX_SNAPSHOT_CHARS
      ? entry.source
      : undefined;
  const workingText =
    source !== undefined &&
    entry.workingText !== undefined &&
    entry.workingText.length <= MAX_SNAPSHOT_CHARS
      ? entry.workingText
      : undefined;
  write([{ ...entry, source, workingText, previousVisibility }, ...rest]);
}

export function removeRecentAnalysis(domain: string): void {
  write(read().filter((e) => e.domain !== domain));
}

export function clearRecentAnalyses(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
