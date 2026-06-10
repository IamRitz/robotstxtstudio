# Security Hardening — Phase 15D

The Analyzer and the paste-or-fetch workflows perform **server-side fetches of
user-supplied hosts**. That makes two endpoints a potential SSRF and abuse surface:

- `POST /api/analyze` → `analyze()` → `toRobotsUrl` → `fetchRobots`
- `POST /api/fetch-robots` → `toRobotsUrl` → `fetchRobots`

Both funnel through the single fetch boundary (`src/features/live-checker/lib/`), so
the guard is implemented there once and protects both routes.

---

## 1. Threat model summary

| Threat | Vector | Mitigation |
| --- | --- | --- |
| **SSRF → cloud metadata** | `domain=169.254.169.254` to read `…/latest/meta-data/` (IAM creds) | `isPrivateIp` blocks `169.254.0.0/16`; never fetched |
| **SSRF → loopback / internal services** | `127.0.0.1`, `localhost`, `[::1]`, `*.internal`, `10/8`, `172.16/12`, `192.168/16` | literal-IP + hostname-suffix blocks; DNS resolution + private-range rejection |
| **SSRF via DNS** | public hostname with an `A`/`AAAA` record pointing into private space | host is resolved **before** connecting; request refused if **any** address is private |
| **SSRF via redirect** | public host `302`s to `http://169.254.169.254/…` | redirects are followed **manually**; every hop is re-validated by the guard |
| **IPv6 bypass** | `::1`, `fc00::/7`, `fe80::/10`, `::ffff:127.0.0.1` (mapped) | full IPv6 parser incl. IPv4-mapped addresses |
| **Non-http(s) redirect** | `302` → `file:///etc/passwd`, `gopher://…` | scheme allow-list (http/https only) re-checked every hop |
| **Resource exhaustion / abuse** | hammering the fetch endpoints, large/slow responses | per-IP rate limiting; 8 s timeout; 512 KiB body cap (carried over from before 15D) |
| **Redirect loop** | endless `30x` chain | hard cap of 5 redirect hops |

**Residual risk (documented, accepted):**

- **DNS-rebinding race.** We resolve-then-fetch, so a TOCTOU attacker could in theory
  return a public IP to our lookup and a private IP to the actual connection. Closing
  this fully needs IP-pinned sockets, which the platform `fetch` does not expose. The
  resolve-and-reject check defeats all static/common cases.
- **Rate limiting is per-instance and best-effort** (see §2) — abuse dampening, not a
  hard global quota.

---

## 2. Implementation summary

### SSRF guard — `src/features/live-checker/lib/ssrf.ts` (pure, injectable)

- `isPrivateIp(ip)` — synchronous range check for IPv4 **and** IPv6. The blocked set
  is **intentional and documented inline**:
  - IPv4: `0/8`, `10/8`, `127/8`, `100.64/10` (CGNAT), `169.254/16` (link-local, incl.
    cloud metadata), `172.16/12`, `192.168/16`, `224/4` multicast, `240/4` reserved,
    broadcast — plus the **special-use / non-routable** ranges `192.0.0.0/24`,
    `192.0.2.0/24` (TEST-NET-1), **`198.18.0.0/15`** (benchmarking), `198.51.100.0/24`
    (TEST-NET-2), and `203.0.113.0/24` (TEST-NET-3). A request should never
    legitimately target these, so blocking them removes SSRF footholds without
    affecting real public sites.
  - IPv6: `::1`, `::`, `fc00::/7`, `fe80::/10`, `ff00::/8`, and IPv4-mapped
    (`::ffff:a.b.c.d`) deferring to the IPv4 rules.
- `checkHostAllowed(hostname, lookupFn?)` — operates on a **trimmed, lowercased,
  bracket-stripped** hostname. Blocks `localhost` / `*.localhost` / `*.local` /
  `*.internal` / `metadata.google.internal` and literal private IPs without DNS, then
  resolves the hostname (injectable `lookupFn`, defaults to Node DNS via
  `lookup(host, { all: true })`) and rejects if **any** returned A/AAAA record is
  private. Returns a `{ allowed } | { allowed:false, reason }` result (no throwing in
  the hot path).

`node:dns` is loaded via a `webpackIgnore` dynamic import so the server-only built-in
never enters the client bundle (the live-checker barrel is shared with client code).

### Fetch boundary — `src/features/live-checker/lib/fetch-robots.ts`

- Calls `checkHostAllowed` **before the initial request and after every redirect**.
- `redirect: "manual"` + a redirect loop (max 5) so each `Location` is re-validated.
- **Scheme allow-list:** every hop must be `http:`/`https:`; a redirect to
  `file:`/`gopher:`/`data:`/etc. is refused (`parseHttpUrl`).
- A blocked host returns a normal `FetchResult` with `status:"network-error"` and a
  `"Refused for security: …"` message (never throws; renders through existing UI).
- **Unchanged:** 8 s timeout, 512 KiB size cap, content-type checks, injectable
  `fetchFn`.

### Rate limiting — `src/lib/rate-limit.ts`

- In-memory **fixed-window per-IP** limiter: `20 requests / 60 s` per IP, per endpoint
  (`analyze:` and `fetch-robots:` keyed separately).
- `clientIp(request)` reads `x-forwarded-for` (first hop) → `x-real-ip` → `"unknown"`.
- Both routes return **HTTP 429** with `Retry-After` and JSON
  `{ "error": "Too many requests. Please wait a moment and try again." }`.
- **Caveats are in the file header:** per-instance (effective limit scales with warm
  instances on Vercel), and a fixed window can briefly allow ~2×limit at a boundary.
  This is intentional abuse-dampening without a Redis dependency; swap in a shared
  store later if a hard global quota is needed.

---

## 3. Test coverage report

All required cases are covered; suite is green (**278 unit**, **17 e2e**).

| Requirement | Test |
| --- | --- |
| localhost rejection | `ssrf.test.ts` → "blocks localhost and internal suffixes" |
| private IP rejection | `ssrf.test.ts` → IPv4/IPv6 private ranges; `fetch-robots.test.ts` → "refuses a literal private IP target" |
| metadata endpoint rejection | `ssrf.test.ts` → `169.254.169.254`; `routes.test.ts` → analyze refuses it |
| redirect-to-private-IP rejection | `fetch-robots.test.ts` → "re-checks redirect hops and refuses a redirect onto a private IP" |
| rate-limit behavior | `rate-limit.test.ts` (window/reset/per-key) + `routes.test.ts` (429 + Retry-After + JSON shape at the HTTP boundary) |
| IPv6 incl. mapped | `ssrf.test.ts` → "flags IPv4-mapped IPv6 pointing at private space" |
| DNS resolves-to-private | `ssrf.test.ts` → "blocks a public hostname that resolves to a private address" / "mixed result" |
| redirect budget | `fetch-robots.test.ts` → "stops after too many redirects" |
| non-http(s) redirect | `fetch-robots.test.ts` → "refuses a redirect to a non-http(s) scheme" |
| special-use ranges (198.18/15, TEST-NETs) | `ssrf.test.ts` → "flags special-use / non-routable documentation & benchmarking ranges" |
| no regressions | existing `fetch-robots` / `analyze` tests updated to inject an offline lookup; all pass |

New files: `lib/ssrf.ts` (+`ssrf.test.ts`), `src/lib/rate-limit.ts` (+`rate-limit.test.ts`),
`src/app/api/routes.test.ts`.

---

## 4. Deployment impact assessment

- **Runtime:** both routes already run on the Node.js runtime (`runtime = "nodejs"`),
  which the DNS-based guard requires. No Edge-runtime migration needed.
- **Latency:** one DNS lookup per fetch is added (and one per redirect hop). Lookups
  are cached by the OS/resolver; impact is negligible vs. the 8 s fetch budget. Literal
  IPs and internal names short-circuit without any DNS.
- **Bundle:** `node:dns` is excluded from the client bundle via `webpackIgnore`; client
  JS is unchanged (verified by a clean `next build`).
- **Behavior changes for legitimate users:** none expected. Redirects still work
  (now followed manually, capped at 5). Real sites that legitimately host robots.txt on
  public IPs are unaffected. The only newly-blocked inputs are private/internal targets
  and >20 req/min/IP bursts.
- **False-positive risk:** a public domain that *resolves to* a private IP (e.g. a
  split-horizon staging host) will be refused — this is the intended SSRF protection.
- **Rollback:** isolated to `ssrf.ts`, `rate-limit.ts`, `fetch-robots.ts`, and two route
  files; revertable without touching feature logic.

**CSP / security headers:** unchanged — this phase adds no inline scripts, external
origins, or new client code.
