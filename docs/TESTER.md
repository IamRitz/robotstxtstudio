# Robots.txt URL Tester

> The canonical rule-evaluation engine in `src/features/tester/`. The source of truth
> for "can crawler X access URL Y?". Consumes a [`RobotsFile`](./PARSER.md), a URL,
> and a user-agent; produces a `UrlTestResult`. Pure domain logic — reused by the
> Analyzer, AI Manager, Generator previews, and future Monitoring/Compare.
> Companion: [`PRD.md`](./PRD.md).

## API

```ts
testUrl(file, url, crawler): UrlTestResult        // verdict + matched rule + reason + trace
evaluateAccess(file, url, crawler): AccessEvaluation  // trace-free primitive (reuse)
isAllowed(file, url, crawler): boolean            // convenience
```

`UrlTestResult = { url, userAgent, decision, matchedRule?, matchedUserAgent?, reason, trace }`.

## Evaluation algorithm

1. **Normalize the URL** to a path (`pathname + query`); bare paths get a leading `/`.
2. **Select the user-agent group.** Score each group's tokens against the crawler:
   `*` scores 0; a token that is a case-insensitive prefix of the crawler scores its
   length; no match scores −1. The highest score wins, and **all groups sharing that
   score are merged**. Source = `specific` / `default` (`*`) / `none`.
3. **Find matching rules** in the selected rule set (empty patterns match nothing).
4. **Apply precedence** to pick the winner, then map to a decision.

No matching group, or no matching rule → **allowed** (robots.txt default-allow).

## Matching rules

- **Prefix match** by default: `/admin` matches `/admin`, `/admin/x`, `/administrator`.
- **`*`** matches any run of characters (including empty): `/*.pdf`.
- **Trailing `$`** anchors to end of path: `/page$` matches `/page` but not `/page/x`.
- Paths are **case-sensitive**; user-agents are **case-insensitive**.
- An **empty** `Disallow:`/`Allow:` matches nothing (the "allow everything" idiom).

## Precedence rules

| Situation | Outcome |
| --- | --- |
| No group matches the crawler (`source: none`) | **Allowed** (default) |
| Group matches but no rule matches the path | **Allowed** (default) |
| One rule matches | That rule's type decides |
| Several match, different pattern lengths | **Longest** pattern wins |
| Allow vs Disallow, **equal** pattern length | **Allow** wins (least restrictive) |
| Specific group vs `*` group | **Specific** group's rules apply |

"Length" is the path pattern's character count (`*`/`$` included) — a pragmatic,
Google-aligned approximation.

## Compatibility assumptions

- Google-style grouping, longest-match, and Allow-wins-ties precedence.
- User-agent match is a **prefix** of the crawler token (so `Googlebot` matches
  `Googlebot-Image`). No product/version parsing beyond prefixing.
- Pattern length (not a normalized "specificity excluding wildcards") drives ties.
  This matches Google in the common cases; exotic wildcard-length ties may differ.
- Query strings are kept on the path and matched; fragments are dropped by `URL`.

## Trace

`trace: TestTraceStep[]` powers the UI's rule-tracing section (Screen 4):

1. **Match user-agent** — which group was selected (specific / default / none).
2. **Evaluate path rules** — which rules matched the path.
3. **Apply precedence** — the winning rule (omitted when nothing matched).
4. **Decision** — `allowed` / `blocked` with the deciding rule.

## Architecture

```
src/features/tester/
  domain/
    pattern.ts      # compilePattern() / matchesPath() — wildcards, $, prefix
    url.ts          # normalizePath()
    user-agent.ts   # selectRules() — group selection + merge
    evaluate.ts     # evaluateAccess() / isAllowed() — precedence (trace-free)
    test-url.ts     # testUrl() — wraps evaluate with reason + trace
  index.ts          # barrel
```

## Sample output

`testUrl` for `Googlebot` on `/admin/login` against
`User-agent: * / Disallow: /admin/ / Allow: /admin/public/ … User-agent: GPTBot / Disallow: /`:

```jsonc
{
  "url": "/admin/login", "userAgent": "Googlebot", "decision": "blocked",
  "matchedRule": { "type": "disallow", "path": "/admin/", "line": 2 },
  "matchedUserAgent": "*",
  "reason": "\"Googlebot\" is blocked from /admin/login by \"Disallow: /admin/\".",
  "trace": [
    { "step": 1, "label": "Match user-agent", "status": "info",  "detail": "… using the default \"User-agent: *\" group." },
    { "step": 2, "label": "Evaluate path rules", "status": "info", "detail": "1 rule(s) match \"/admin/login\": Disallow: /admin/." },
    { "step": 3, "label": "Apply precedence", "status": "info", "detail": "Longest match wins… Winner: \"Disallow: /admin/\" (line 2)." },
    { "step": 4, "label": "Decision", "status": "blocked", "detail": "Blocked by \"Disallow: /admin/\"." }
  ]
}
```

(The same file blocks `GPTBot` on any path via its specific `Disallow: /` group.)

## Testing

`src/features/tester/domain/*.test.ts` — 28 tests: pattern matching (wildcards, `$`,
prefix, escaping), group selection (specificity, default, merge, case-insensitive),
and end-to-end evaluation (precedence, AI crawlers, multiple groups, full-URL input,
edge cases, trace). Coverage: ~99% of `tester/domain` (gate 80%).
