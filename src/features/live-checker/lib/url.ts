/**
 * Resolve a user-supplied domain or URL to its robots.txt location.
 * Pure string handling (no IO); part of the fetch boundary.
 */
export interface RobotsTarget {
  /** Absolute URL of the robots.txt file. */
  readonly robotsUrl: string;
  /** The site hostname. */
  readonly domain: string;
}

/** Normalize input to a robots.txt target, or `null` when it isn't a valid host. */
export function toRobotsUrl(input: string): RobotsTarget | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes(".") || url.hostname.startsWith(".")) return null;
    return { robotsUrl: new URL("/robots.txt", url.origin).toString(), domain: url.hostname };
  } catch {
    return null;
  }
}
