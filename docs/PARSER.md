# Robots.txt Parser

> The shared, dependency-free parser in `src/parser/`. Single source of truth for
> the Validator, URL Tester, Explainer, Analyzer, and (future) Compare. Produces the
> canonical [`RobotsFile`](./PRD.md#15-domain-models) AST defined in Phase 2.
> Companion: [`PRD.md`](./PRD.md), [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).

## Design goals

Correctness, **fidelity**, and maintainability over speed. The parser:

- **Never throws** — every input yields a `RobotsFile`.
- **Never silently discards** — every source line is preserved in document order.
- **Emits no judgements** — `ValidationIssue`s are the Validator's job (Phase 5). The
  parser only represents the file faithfully.

## Module layout

| File | Responsibility |
| --- | --- |
| `fields.ts` | Directive-name recognition (+ aliases), path metadata, crawl-delay parsing. Pure helpers. |
| `tokenizer.ts` | Lexer: one source line → one `Token` (blank / comment / field / unknown). Handles BOM, LF/CRLF/CR, inline comments. |
| `parser.ts` | Grouping semantics + AST conversion → `RobotsFile`. |
| `index.ts` | Public API: `parseRobots(input)` (+ `tokenize` and helpers for tooling). |
| `fixtures.ts` | Real-world samples for the compatibility tests (not public API). |

Pipeline: `text → tokenize() → Token[] → parseRobots() → RobotsFile`.

## AST structure

`RobotsFile` is a **lossless backbone plus structured views**:

- **`directives: Directive[]`** — every source line, in order, with `line` numbers
  and original `raw` text. Includes `blank`, `comment`, and `unknown` lines. This is
  the fidelity record; duplicates and ordering are fully preserved here.
- **`groups: RobotsGroup[]`** — semantic view. Each group has `userAgents`, `rules`
  (`CrawlRule` with `type`, `path`, `hasWildcard`, `hasEndAnchor`), an optional
  numeric `crawlDelay`, and a `lineRange`.
- **`sitemaps: Sitemap[]`** — file-level `Sitemap:` declarations (`url` + `line`).
- **`host?`** — first `Host:` value.
- **`unknownDirectives: Directive[]`** — index of lines needing attention:
  unsupported/vendor fields, malformed (no-colon) lines, and rules before any
  `User-agent` (orphans).
- **`lineCount`**, **`source`**.

**Round-trip invariant:** `directives.map((d) => d.raw).join("\n") === source`
(for inputs without a BOM).

### Example

Input:

```text
# Block AI training
User-agent: GPTBot
Disallow: /

User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
```

Parsed (abridged — the full `directives` backbone has one entry per line):

```jsonc
{
  "groups": [
    {
      "userAgents": ["GPTBot"],
      "rules": [{ "type": "disallow", "path": "/", "hasWildcard": false, "hasEndAnchor": false, "line": 3 }],
      "lineRange": { "start": 2, "end": 3 }
    },
    {
      "userAgents": ["*"],
      "rules": [{ "type": "allow", "path": "/", "hasWildcard": false, "hasEndAnchor": false, "line": 6 }],
      "lineRange": { "start": 5, "end": 6 }
    }
  ],
  "sitemaps": [{ "url": "https://example.com/sitemap.xml", "line": 7 }],
  "unknownDirectives": [],
  "lineCount": 7
  // ...plus "directives": [ {comment,1}, {user-agent,2}, {disallow,3}, {blank,4}, {user-agent,5}, {allow,6}, {sitemap,7} ]
}
```

## Parsing decisions

- **Recognized fields** (case-insensitive): `user-agent`, `allow`, `disallow`,
  `sitemap`, `crawl-delay`, `host`. Aliases: `useragent`, `crawldelay`. Extend in
  `FIELD_ALIASES`.
- **Grouping (Google-style):** consecutive `User-agent` lines accumulate into one
  group; the first rule record (`allow`/`disallow`/`crawl-delay`) ends the
  user-agent run, so the next `User-agent` opens a **new** group. Blank/comment lines
  do not break a run.
- **`Sitemap` / `Host` are file-level** regardless of where they appear; they do not
  affect grouping. `host` keeps the first value.
- **Inline comments:** a `#` in a value starts a comment; the value is stored without
  it, but the full line is preserved in `raw` (and the comment text on the token).
- **Values preserve case** (paths, URLs, user-agent tokens). Only field *names* are
  normalized for classification. User-agent *matching* case-insensitivity is the
  tester's concern, not the parser's.
- **Path metadata** is precomputed: `hasWildcard` (`*` present), `hasEndAnchor`
  (`$` suffix).
- **`crawl-delay`** is parsed to a non-negative number for the convenience
  `group.crawlDelay`; the raw directive always remains in `directives`.

## Recovery behavior

| Input | Behavior |
| --- | --- |
| Empty file | `RobotsFile` with empty `directives`/`groups`, `lineCount: 0`. |
| Comments only | Zero groups; comments preserved in `directives`. |
| Unsupported/vendor directive (`Clean-param:`) | Token `unknown`; kept in `directives` **and** `unknownDirectives`. |
| Malformed line (no colon) | Token `unknown` (`hasColon: false`); preserved. |
| Rule before any `User-agent` | Recorded in `directives` with its real field **and** flagged in `unknownDirectives` (orphan). |
| Duplicate `Disallow` | Both kept as separate `CrawlRule`s (no de-dup). |
| Duplicate `Host`/`crawl-delay` | Convenience field keeps the first; **all** occurrences remain in `directives`. |
| Non-numeric `crawl-delay` | `group.crawlDelay` left unset; directive preserved for the Validator. |
| BOM / CRLF / CR | BOM stripped; all line endings split correctly. |
| Empty value (`Disallow:`) | Kept as a rule with `path: ""`; semantics are the tester's concern. |

## Known limitations

- **Round-trip excludes a stripped BOM.** `source` retains the original bytes, but
  `directives[].raw` reflect the BOM-stripped text.
- **`group.crawlDelay` / `host` are first-wins convenience views.** Duplicate values
  are not lost (they live in `directives`), but the Validator must scan `directives`
  to detect them.
- **`#` always starts a comment in a value.** A literal `#` inside a path (rare) is
  treated as a comment, matching Google's behavior.
- **No semantic validation.** Conflicts, duplicates, and bad practices are detected
  by the Validator, not here — by design.
- **Alias set is intentionally small.** Only `useragent`/`crawldelay` are tolerated;
  other misspellings become `unknown` (and the Validator can flag them).

## Testing

`src/parser/*.test.ts` — 56 tests across tokenizer, parser (happy path, real-world
tolerance, edge cases, fidelity), and compatibility (Google / publisher / AI-crawler
/ large multi-group fixtures, all round-tripped). Coverage: ~96% statements / ~93%
branches on `src/parser/**` (gate: 80%).
