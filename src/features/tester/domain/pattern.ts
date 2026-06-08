/**
 * robots.txt path-pattern matching.
 *
 * Patterns are prefix matches by default; `*` matches any run of characters and a
 * trailing `$` anchors to the end of the path. An empty pattern matches nothing
 * (the "empty Disallow allows everything" idiom). Pure; `RegExp` is a web standard.
 */

/** Escape regex metacharacters, leaving `*` for the caller to expand. */
function escapeLiteral(segment: string): string {
  return segment.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Compile a robots path pattern into an anchored RegExp, or `null` when the pattern
 * is empty (matches nothing).
 */
export function compilePattern(pattern: string): RegExp | null {
  if (pattern === "") return null;

  let body = pattern;
  let anchored = false;
  if (body.endsWith("$")) {
    anchored = true;
    body = body.slice(0, -1);
  }

  const source = body.split("*").map(escapeLiteral).join(".*");
  return new RegExp(`^${source}${anchored ? "$" : ""}`);
}

/** Does `pattern` match `path`? Empty patterns never match. */
export function matchesPath(pattern: string, path: string): boolean {
  const regex = compilePattern(pattern);
  return regex !== null && regex.test(path);
}
