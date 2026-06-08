/**
 * Monitoring model (PRD §18, future).
 *
 * Monitoring sits entirely on top of existing concepts: it snapshots
 * {@link AnalysisReport}s over time and emits change events described by a
 * {@link RobotsDiff}. No new core domain concepts are introduced — this is the
 * architecture-validation proof for the roadmap's furthest item.
 */
import type { RobotsDiff } from "./compare";

/** How often a site is re-audited. */
export type MonitorSchedule = "daily" | "weekly" | "manual";

/** A site enrolled in monitoring. */
export interface MonitoredSite {
  readonly id: string;
  readonly domain: string;
  readonly schedule: MonitorSchedule;
  /** ISO-8601 creation timestamp. */
  readonly createdAt: string;
  /** ISO-8601 timestamp of the most recent snapshot, if any. */
  readonly lastCheckedAt?: string;
}

/** A lightweight point-in-time record used for change detection. */
export interface MonitorSnapshot {
  /** ISO-8601 timestamp. */
  readonly takenAt: string;
  /** Hash of the raw robots.txt, for cheap change detection. */
  readonly fileHash: string;
  /** Visibility score value (0–100) at snapshot time. */
  readonly visibilityScore: number;
  /** Health score value (0–100) at snapshot time. */
  readonly healthScore: number;
}

/** The kind of change a monitor detected. */
export type MonitorChangeType =
  | "robots-changed"
  | "crawler-policy-changed"
  | "score-dropped";

/** A detected change between two snapshots. */
export interface MonitorChangeEvent {
  readonly siteId: string;
  /** ISO-8601 timestamp. */
  readonly detectedAt: string;
  readonly type: MonitorChangeType;
  readonly before: MonitorSnapshot;
  readonly after: MonitorSnapshot;
  /** The structural diff, when the robots.txt content changed. */
  readonly diff?: RobotsDiff;
}
