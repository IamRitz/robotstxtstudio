/**
 * URL inventory consistency (SEO recovery, 2026-10).
 *
 * Source-level guarantees that the route tree, sitemap, redirects, canonicals,
 * page dates, robots.txt, and internal links agree. The rendered-HTML counterpart
 * is `scripts/seo-smoke-audit.mjs`, which runs against a built server.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";
import sitemap, { sitemapPaths } from "@/app/sitemap";
import robots from "@/app/robots";
import { CONSOLIDATED_REDIRECTS, REDIRECTED_PATHS } from "@/config/redirects";
import { PAGE_DATES } from "@/config/page-dates";
import { PROFILE_IDS } from "@/config/crawler-directory";
import { isAllowed } from "@/features/tester";
import { parseRobots } from "@/parser";

const SRC = join(process.cwd(), "src");
const APP = join(SRC, "app");

/** Routes that exist but must never be in the sitemap. */
const NOT_INDEXABLE = new Set(["/dev"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Concrete page routes from the app directory (dynamic segments expanded). */
function routeTree(): Map<string, string> {
  const routes = new Map<string, string>();
  for (const file of walk(APP)) {
    if (!file.endsWith(`${sep}page.tsx`)) continue;
    const dir = relative(APP, file).split(sep).slice(0, -1).join("/");
    if (dir.startsWith("api")) continue;
    if (dir === "crawlers/[id]") {
      for (const id of PROFILE_IDS) routes.set(`/crawlers/${id}`, file);
      continue;
    }
    routes.set(dir === "" ? "/" : `/${dir}`, file);
  }
  return routes;
}

const ROUTES = routeTree();
const SITEMAP = sitemapPaths();
const TODAY = new Date().toISOString().slice(0, 10);

describe("sitemap", () => {
  it("lists every path once", () => {
    expect(new Set(SITEMAP).size).toBe(SITEMAP.length);
  });

  it("lists only real routes", () => {
    const missing = SITEMAP.filter((p) => !ROUTES.has(p));
    expect(missing).toEqual([]);
  });

  it("lists every indexable route (no orphan pages left out)", () => {
    const listed = new Set(SITEMAP);
    const unlisted = [...ROUTES.keys()].filter((p) => !listed.has(p) && !NOT_INDEXABLE.has(p));
    expect(unlisted).toEqual([]);
  });

  it("never lists a redirect source", () => {
    expect(SITEMAP.filter((p) => REDIRECTED_PATHS.has(p))).toEqual([]);
  });

  it("emits absolute URLs, real lastmod dates, and no changefreq/priority", () => {
    for (const entry of sitemap()) {
      expect(entry.url).toMatch(/^https:\/\/[^/]+\//);
      expect(entry).not.toHaveProperty("changeFrequency");
      expect(entry).not.toHaveProperty("priority");
      const path = new URL(entry.url).pathname;
      expect(entry.lastModified, path).toBe(PAGE_DATES[path]?.modified);
    }
  });
});

describe("page dates", () => {
  it("cover every sitemap path", () => {
    expect(SITEMAP.filter((p) => !PAGE_DATES[p])).toEqual([]);
  });

  it("are valid, ordered, and not in the future", () => {
    for (const [path, d] of Object.entries(PAGE_DATES)) {
      for (const date of [d.published, d.modified]) {
        expect(date, path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Number.isNaN(Date.parse(date)), path).toBe(false);
        expect(date <= TODAY, `${path} ${date} is in the future`).toBe(true);
      }
      expect(d.published <= d.modified, path).toBe(true);
    }
  });

  it("don't reference removed routes", () => {
    expect(Object.keys(PAGE_DATES).filter((p) => !ROUTES.has(p))).toEqual([]);
  });
});

describe("redirects", () => {
  it("point at live sitemap pages, with no chains", () => {
    for (const r of CONSOLIDATED_REDIRECTS) {
      expect(SITEMAP, r.source).toContain(r.destination);
      expect(REDIRECTED_PATHS.has(r.destination), `${r.source} chains`).toBe(false);
    }
  });

  it("have no page left behind at the source", () => {
    expect(CONSOLIDATED_REDIRECTS.filter((r) => ROUTES.has(r.source))).toEqual([]);
  });

  it("have unique sources", () => {
    expect(REDIRECTED_PATHS.size).toBe(CONSOLIDATED_REDIRECTS.length);
  });
});

describe("canonicals", () => {
  it("every indexable page declares a self-referencing canonical", () => {
    const wrong: string[] = [];
    for (const [path, file] of ROUTES) {
      if (NOT_INDEXABLE.has(path)) continue;
      const src = readFileSync(file, "utf8");
      if (path.startsWith("/crawlers/")) {
        // Dynamic profile pages build it from the id.
        if (!/canonical:\s*`\/crawlers\/\$\{/.test(src)) wrong.push(path);
        continue;
      }
      const m = src.match(/canonical:\s*"([^"]+)"/);
      if (m?.[1] !== path) wrong.push(`${path} → ${m?.[1] ?? "none"}`);
    }
    expect(wrong).toEqual([]);
  });

  it("the root layout sets no site-wide canonical", () => {
    expect(readFileSync(join(APP, "layout.tsx"), "utf8")).not.toMatch(/alternates\s*:/);
  });
});

describe("robots.txt", () => {
  const rules = robots().rules;
  const list = Array.isArray(rules) ? rules : [rules];
  const text = list
    .map((r) =>
      [
        `User-agent: ${[r.userAgent].flat().join("\nUser-agent: ")}`,
        ...[r.allow ?? []].flat().map((a) => `Allow: ${a}`),
        ...[r.disallow ?? []].flat().map((d) => `Disallow: ${d}`),
      ].join("\n"),
    )
    .join("\n\n");
  const file = parseRobots(text);

  it("does not block any sitemap URL for Googlebot", () => {
    expect(SITEMAP.filter((p) => !isAllowed(file, p, "Googlebot"))).toEqual([]);
  });

  it("still keeps /dev and /api out", () => {
    expect(isAllowed(file, "/dev", "Googlebot")).toBe(false);
    expect(isAllowed(file, "/api/analyze", "Googlebot")).toBe(false);
  });
});

describe("internal links", () => {
  // href="/x", href: "/x", href={"/x"} — static internal links in source.
  const HREF = /href(?:=|:\s*|=\{)\s*["'`](\/[^"'`#?\s]*)/g;
  const files = walk(SRC).filter(
    (f) => /\.(tsx?|mdx?)$/.test(f) && !/\.test\.tsx?$/.test(f) && !f.includes(`${sep}dev${sep}`),
  );
  const links = new Map<string, string[]>();
  for (const f of files) {
    for (const m of readFileSync(f, "utf8").matchAll(HREF)) {
      const href = m[1]!.replace(/\/$/, "") || "/";
      if (href.includes("${")) continue;
      links.set(href, [...(links.get(href) ?? []), relative(SRC, f)]);
    }
  }

  it("are actually discovered by the scanner", () => {
    expect(links.size).toBeGreaterThan(25);
    expect(links.has("/validate")).toBe(true);
  });

  it("never point at a redirected URL", () => {
    const stale = [...links].filter(([h]) => REDIRECTED_PATHS.has(h));
    expect(stale).toEqual([]);
  });

  it("only point at routes that exist", () => {
    const known = new Set([...ROUTES.keys(), "/sitemap.xml", "/robots.txt", "/icon.svg"]);
    const broken = [...links].filter(([h]) => !known.has(h) && !h.startsWith("/api/"));
    expect(broken).toEqual([]);
  });
});
