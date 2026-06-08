/**
 * Reduce a user-supplied URL or path to the path string robots.txt matches
 * against (`pathname` + query). Tolerant: accepts full URLs and bare paths.
 */
export function normalizePath(input: string): string {
  const trimmed = input.trim();

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return (url.pathname || "/") + url.search;
    } catch {
      // fall through to path handling
    }
  }

  if (trimmed === "") return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
