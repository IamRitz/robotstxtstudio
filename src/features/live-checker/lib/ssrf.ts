/**
 * SSRF guard for the fetch boundary (Phase 15D).
 *
 * The Analyzer fetches arbitrary user-supplied hosts server-side, so it must never
 * be tricked into reaching internal infrastructure (loopback, RFC-1918 ranges, the
 * link-local cloud-metadata endpoint, IPv6 ULA/link-local, etc.). This module is
 * pure + injectable: {@link isPrivateIp} is a synchronous range check, and
 * {@link checkHostAllowed} resolves a hostname to its IPs (via an injectable lookup)
 * and blocks the request if ANY resolved address is private/internal.
 *
 * Used by `fetch-robots.ts` before the initial request AND after every redirect hop,
 * which closes the "public host 302-redirects to 169.254.169.254" attack.
 *
 * Best-effort note: we resolve-then-fetch, so a determined attacker could in theory
 * win a DNS-rebinding race (resolve public, reconnect private). Eliminating that
 * fully needs IP-pinned connections, which the platform fetch does not expose. The
 * resolve-and-reject check stops the overwhelmingly common static cases.
 */
/** Resolve a hostname to its addresses. Injectable so tests stay offline. */
export type LookupFn = (hostname: string) => Promise<ReadonlyArray<{ address: string; family: number }>>;

// `node:dns` is server-only. This module is reachable from the live-checker root
// barrel, which client components also import, so the Node built-in is loaded via a
// `webpackIgnore` dynamic import: the client bundle never resolves it, and the
// server (Node runtime route handlers) imports it natively at call time.
const defaultLookup: LookupFn = async (hostname) => {
  const dns = await import(/* webpackIgnore: true */ "node:dns/promises");
  return dns.lookup(hostname, { all: true });
};

/** Result of {@link checkHostAllowed}: allowed, or blocked with a human reason. */
export type HostCheck = { readonly allowed: true } | { readonly allowed: false; readonly reason: string };

/** Hostname suffixes/literals that always denote internal resolution. */
const BLOCKED_HOST_LITERALS = new Set(["localhost", "metadata.google.internal"]);
const BLOCKED_HOST_SUFFIXES = [".localhost", ".local", ".internal"] as const;

// ── IPv4 ────────────────────────────────────────────────────────────────────

/** Parse dotted-quad IPv4 to four octets, or `null` if not a valid literal. */
function parseIPv4(value: string): readonly number[] | null {
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n > 255) return null;
    octets.push(n);
  }
  return octets;
}

/**
 * True for the intentionally-blocked IPv4 set: loopback, RFC-1918 private,
 * link-local (incl. cloud metadata), CGNAT, multicast, reserved, and the
 * special-use / non-routable documentation & benchmarking ranges (RFC 5737/2544/
 * 6890). A request should never legitimately target any of these, so blocking them
 * removes SSRF footholds without affecting real public sites.
 */
function isPrivateIPv4(octets: readonly number[]): boolean {
  const a = octets[0] ?? 0;
  const b = octets[1] ?? 0;
  const c = octets[2] ?? 0;
  if (a === 0) return true; // 0.0.0.0/8 "this network"
  if (a === 10) return true; // 10.0.0.0/8 private
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local (incl. cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
  if (a === 192 && b === 0 && c === 0) return true; // 192.0.0.0/24 IETF protocol assignments
  if (a === 192 && b === 0 && c === 2) return true; // 192.0.2.0/24 TEST-NET-1 (documentation)
  if (a === 192 && b === 168) return true; // 192.168.0.0/16 private
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15 benchmarking
  if (a === 198 && b === 51 && c === 100) return true; // 198.51.100.0/24 TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return true; // 203.0.113.0/24 TEST-NET-3
  if (a >= 224) return true; // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved + 255.255.255.255
  return false;
}

// ── IPv6 ────────────────────────────────────────────────────────────────────

/** Parse an IPv6 literal (incl. `::` and embedded IPv4) to 16 bytes, or `null`. */
function parseIPv6(value: string): Uint8Array | null {
  if (!value.includes(":")) return null;
  let head = value;
  let embeddedV4: readonly number[] | null = null;

  // Trailing dotted-quad form, e.g. ::ffff:192.168.0.1
  const lastColon = head.lastIndexOf(":");
  const tail = head.slice(lastColon + 1);
  if (tail.includes(".")) {
    embeddedV4 = parseIPv4(tail);
    if (!embeddedV4) return null;
    head = head.slice(0, lastColon + 1) + "0:0"; // placeholder; bytes set below
  }

  const halves = head.split("::");
  if (halves.length > 2) return null;

  const toGroups = (s: string): number[] | null => {
    if (s === "") return [];
    const groups: number[] = [];
    for (const g of s.split(":")) {
      if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null;
      groups.push(parseInt(g, 16));
    }
    return groups;
  };

  const left = toGroups(halves[0] ?? "");
  const right = halves.length === 2 ? toGroups(halves[1] ?? "") : [];
  if (left === null || right === null) return null;

  let groups: number[];
  if (halves.length === 2) {
    const fill = 8 - (left.length + right.length);
    if (fill < 0) return null;
    groups = [...left, ...Array<number>(fill).fill(0), ...right];
  } else {
    groups = left;
  }
  if (groups.length !== 8) return null;

  const bytes = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    const group = groups[i] ?? 0;
    bytes[i * 2] = (group >> 8) & 0xff;
    bytes[i * 2 + 1] = group & 0xff;
  }
  if (embeddedV4) {
    bytes[12] = embeddedV4[0] ?? 0;
    bytes[13] = embeddedV4[1] ?? 0;
    bytes[14] = embeddedV4[2] ?? 0;
    bytes[15] = embeddedV4[3] ?? 0;
  }
  return bytes;
}

/** True for loopback / unspecified / ULA / link-local / mapped-private IPv6. */
function isPrivateIPv6(bytes: Uint8Array): boolean {
  const b = (i: number): number => bytes[i] ?? 0;
  const allZeroExceptLast = bytes.slice(0, 15).every((x) => x === 0);
  if (allZeroExceptLast && b(15) === 1) return true; // ::1 loopback
  if (bytes.every((x) => x === 0)) return true; // :: unspecified
  if ((b(0) & 0xfe) === 0xfc) return true; // fc00::/7 unique-local
  if (b(0) === 0xfe && (b(1) & 0xc0) === 0x80) return true; // fe80::/10 link-local
  if (b(0) === 0xff) return true; // ff00::/8 multicast

  // IPv4-mapped (::ffff:a.b.c.d) and IPv4-compatible (::a.b.c.d) — defer to v4 rules.
  const firstTen = bytes.slice(0, 10).every((x) => x === 0);
  if (firstTen && b(10) === 0xff && b(11) === 0xff) {
    return isPrivateIPv4([b(12), b(13), b(14), b(15)]);
  }
  if (bytes.slice(0, 12).every((x) => x === 0) && !(b(14) === 0 && b(15) <= 1)) {
    return isPrivateIPv4([b(12), b(13), b(14), b(15)]);
  }
  return false;
}

/**
 * True when `ip` is a loopback, private, link-local, ULA, reserved, or multicast
 * address (IPv4 or IPv6). Non-IP strings return `false` (host names are handled by
 * {@link checkHostAllowed} after DNS resolution).
 */
export function isPrivateIp(ip: string): boolean {
  const value = ip.trim().replace(/^\[|\]$/g, "");
  const v4 = parseIPv4(value);
  if (v4) return isPrivateIPv4(v4);
  const v6 = parseIPv6(value);
  if (v6) return isPrivateIPv6(v6);
  return false;
}

/**
 * Decide whether a hostname is safe to fetch. Blocks internal literal names,
 * private IP literals, and any hostname that DNS-resolves to a private address.
 * Pure aside from the injected `lookupFn` (defaults to Node DNS).
 */
export async function checkHostAllowed(hostname: string, lookupFn: LookupFn = defaultLookup): Promise<HostCheck> {
  const host = hostname.trim().toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "") return { allowed: false, reason: "empty host" };

  // IP literal — no DNS needed.
  if (parseIPv4(host) || parseIPv6(host)) {
    return isPrivateIp(host)
      ? { allowed: false, reason: `blocked private/internal address (${host})` }
      : { allowed: true };
  }

  // Internal names that should never be reachable from a public fetcher.
  if (BLOCKED_HOST_LITERALS.has(host) || BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s))) {
    return { allowed: false, reason: `blocked internal hostname (${host})` };
  }

  let addresses: ReadonlyArray<{ address: string; family: number }>;
  try {
    addresses = await lookupFn(host);
  } catch {
    return { allowed: false, reason: `could not resolve host (${host})` };
  }
  if (addresses.length === 0) return { allowed: false, reason: `host has no DNS records (${host})` };

  for (const { address } of addresses) {
    if (isPrivateIp(address)) {
      return { allowed: false, reason: `host resolves to a private/internal address (${address})` };
    }
  }
  return { allowed: true };
}
