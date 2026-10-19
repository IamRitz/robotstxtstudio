/**
 * What a fetch outcome lets us conclude about a site's robots.txt policy. Pure.
 *
 * - `verified`   — we read the file; the report reflects its actual rules.
 * - `absent`     — the server answered that there is no usable file (4xx other than
 *                  429, or an HTML page at /robots.txt). RFC 9309 §2.3.1.3 and Google
 *                  both treat this as "no restrictions", so allow-all is a sound
 *                  inference, not a guess.
 * - `unverified` — we could not learn the policy (timeout, network/DNS failure, 5xx,
 *                  429, redirect loop). Google treats a 5xx robots.txt as disallow-all
 *                  for a while, so reporting allow-all here would be wrong. The UI
 *                  must show "unknown" and never a score.
 */
import type { FetchResult, PolicyStatus } from "@/types";

export function policyStatusOf(fetch: FetchResult): PolicyStatus {
  switch (fetch.status) {
    case "ok":
    case "too-large":
      return "verified";
    case "invalid-content-type":
      // A non-HTML body served with the wrong type is still parsed (crawlers ignore
      // the header); an HTML page carries no valid rules.
      return fetch.body !== undefined ? "verified" : "absent";
    case "not-found":
      return "absent";
    case "timeout":
    case "redirect-error":
    case "network-error":
      return "unverified";
  }
}
