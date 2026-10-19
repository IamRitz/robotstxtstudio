#!/usr/bin/env node
/**
 * Post-build SEO smoke audit (SEO recovery, 2026-10). Dependency-free.
 *
 *   pnpm build && pnpm start &          # or any running server
 *   node scripts/seo-smoke-audit.mjs                       # http://localhost:3000
 *   node scripts/seo-smoke-audit.mjs https://robotstxtstudio.com   # read-only, ~150 requests
 *
 * For every URL in /sitemap.xml it checks: 200 with no redirect, no noindex
 * (meta or X-Robots-Tag), not blocked by /robots.txt, exactly one self-referencing
 * canonical, a title, a meta description, an H1, and JSON-LD that parses. It then
 * checks every internal link and #anchor found on those pages, and that each
 * consolidated URL in src/config/redirects.ts permanently redirects to its target
 * and is neither in the sitemap nor linked. Duplicate titles/descriptions are
 * reported as warnings. No word-count or link-count quotas: those aren't quality.
 *
 * Exit code 1 when any error is found.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = (process.argv[2] ?? process.env.SEO_AUDIT_BASE ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
const CONCURRENCY = 4;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

async function get(path, { follow = false } = {}) {
  const res = await fetch(BASE + path, {
    redirect: follow ? "follow" : "manual",
    headers: { "user-agent": "RobotsTxtStudio-SEO-Smoke/1.0" },
  });
  const body = res.status >= 300 && res.status < 400 ? "" : await res.text();
  return { status: res.status, headers: res.headers, body };
}

async function pool(items, fn) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) await fn(queue.shift());
    }),
  );
}

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");
const textOf = (html) =>
  decode(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

/** Consolidated redirects, read from the TS source so there's one list. */
function redirectMap() {
  const src = readFileSync(join(ROOT, "src/config/redirects.ts"), "utf8");
  return [...src.matchAll(/source:\s*"([^"]+)",\s*destination:\s*"([^"]+)"/g)].map((m) => ({
    source: m[1],
    destination: m[2],
  }));
}

/** Minimal robots.txt reading for the `*` group (prefix + `*`/`$` matching). */
function robotsDisallows(text) {
  const lines = text.split(/\r?\n/).map((l) => l.replace(/#.*/, "").trim());
  const rules = [];
  let inStar = false;
  let lastWasUa = false;
  for (const line of lines) {
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const [, field, value] = m;
    if (/^user-agent$/i.test(field)) {
      inStar = lastWasUa ? inStar || value === "*" : value === "*";
      lastWasUa = true;
      continue;
    }
    lastWasUa = false;
    if (inStar && /^(allow|disallow)$/i.test(field) && value)
      rules.push({ allow: /^allow$/i.test(field), path: value });
  }
  const toRe = (p) =>
    new RegExp(
      "^" +
        p
          .replace(/[.+?^{}()|[\]\\]/g, "\\$&")
          .replace(/\*/g, ".*")
          .replace(/\\\$$|\$$/, "$"),
    );
  return (path) => {
    let best = null;
    for (const r of rules) {
      if (!toRe(r.path).test(path)) continue;
      if (
        !best ||
        r.path.length > best.path.length ||
        (r.path.length === best.path.length && r.allow)
      )
        best = r;
    }
    return best ? !best.allow : false;
  };
}

async function main() {
  console.log(`SEO smoke audit → ${BASE}\n`);

  // robots.txt
  const robots = await get("/robots.txt");
  if (robots.status !== 200) err("/robots.txt", `HTTP ${robots.status}`);
  if (!/text\/plain/.test(robots.headers.get("content-type") ?? ""))
    err("/robots.txt", "not text/plain");
  if (!/^sitemap:\s*https:\/\//im.test(robots.body)) err("/robots.txt", "no absolute Sitemap line");
  const isBlocked = robotsDisallows(robots.body);

  // sitemap
  const sm = await get("/sitemap.xml");
  if (sm.status !== 200) {
    err("/sitemap.xml", `HTTP ${sm.status}`);
    return report();
  }
  const locs = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (/<changefreq>|<priority>/.test(sm.body))
    warn("/sitemap.xml", "contains changefreq/priority (ignored by Google)");
  const lastmods = [...sm.body.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  if (lastmods.length > 5 && new Set(lastmods).size === 1)
    warn(
      "/sitemap.xml",
      "every <lastmod> is identical — likely a build timestamp, not real content dates",
    );
  const origin = locs[0] ? new URL(locs[0]).origin : "";
  const paths = locs.map((l) => new URL(l).pathname);
  if (new Set(paths).size !== paths.length) err("/sitemap.xml", "duplicate <loc> entries");
  console.log(`sitemap: ${paths.length} URLs (canonical origin ${origin})`);

  const redirects = redirectMap();
  const redirectSources = new Set(redirects.map((r) => r.source));
  const pages = new Map(); // path → { ids:Set, links:Set }
  const titles = new Map();
  const descriptions = new Map();

  await pool(paths, async (path) => {
    const where = path;
    if (redirectSources.has(path)) err(where, "redirect source listed in sitemap");
    if (isBlocked(path)) err(where, "blocked by robots.txt but listed in sitemap");
    const res = await get(path);
    if (res.status !== 200) {
      err(
        where,
        `HTTP ${res.status}${res.headers.get("location") ? ` → ${res.headers.get("location")}` : ""}`,
      );
      return;
    }
    if (/noindex/i.test(res.headers.get("x-robots-tag") ?? "")) err(where, "X-Robots-Tag noindex");
    const html = res.body;
    const headEnd = html.indexOf("</head>");
    const head = headEnd === -1 ? html : html.slice(0, headEnd);

    const robotsMeta = [...head.matchAll(/<meta[^>]+name="robots"[^>]*>/gi)].map(
      (m) => attr(m[0], "content") ?? "",
    );
    if (robotsMeta.some((c) => /noindex/i.test(c))) err(where, "meta robots noindex");

    const canon = [...head.matchAll(/<link[^>]+rel="canonical"[^>]*>/gi)].map((m) =>
      attr(m[0], "href"),
    );
    if (canon.length !== 1) err(where, `${canon.length} canonical tags`);
    else if (canon[0] !== origin + (path === "/" ? "" : path) && canon[0] !== origin + path)
      err(where, `canonical ${canon[0]} ≠ ${origin + path}`);

    const title = textOf(head.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    if (!title) err(where, "missing <title>");
    else titles.set(title, [...(titles.get(title) ?? []), path]);

    const desc = attr(head.match(/<meta[^>]+name="description"[^>]*>/i)?.[0] ?? "", "content");
    if (!desc) err(where, "missing meta description");
    else descriptions.set(desc, [...(descriptions.get(desc) ?? []), path]);

    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)]
      .map((m) => textOf(m[1]))
      .filter(Boolean);
    if (h1s.length === 0) err(where, "no H1 in server HTML");
    else if (h1s.length > 1) warn(where, `${h1s.length} H1s`);

    for (const m of html.matchAll(
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    )) {
      try {
        const data = JSON.parse(m[1]);
        if (!data["@context"] || !data["@type"]) err(where, "JSON-LD block without @context/@type");
      } catch (e) {
        err(where, `JSON-LD parse error: ${e.message}`);
      }
    }

    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const links = new Set();
    for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
      const href = decode(m[1]);
      if (href.startsWith("#")) {
        if (href.length > 1 && !ids.has(href.slice(1)))
          err(where, `broken same-page anchor ${href}`);
      } else if (href.startsWith("/") && !href.startsWith("//")) {
        links.add(href);
      }
    }
    pages.set(path, { ids, links });
  });

  // Internal links found on any page.
  const targets = new Map(); // href → [pages]
  for (const [path, { links }] of pages)
    for (const l of links) targets.set(l, [...(targets.get(l) ?? []), path]);
  const statusCache = new Map();
  await pool(
    [...new Set([...targets.keys()].map((h) => h.split("#")[0].split("?")[0] || "/"))],
    async (p) => {
      if (pages.has(p)) return statusCache.set(p, 200);
      const res = await get(p);
      statusCache.set(p, res.status);
      if (res.status === 200)
        pages.set(p, {
          ids: new Set([...res.body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])),
          links: new Set(),
        });
    },
  );
  for (const [href, from] of targets) {
    const [pathPart, frag] = href.split("#");
    const p = pathPart.split("?")[0] || "/";
    const status = statusCache.get(p);
    const sample = from.slice(0, 3).join(", ") + (from.length > 3 ? ` +${from.length - 3}` : "");
    if (redirectSources.has(p)) err(`link ${href}`, `points at a redirected URL (from ${sample})`);
    else if (status !== 200) err(`link ${href}`, `HTTP ${status} (from ${sample})`);
    else if (frag && !pages.get(p)?.ids.has(frag))
      err(`link ${href}`, `anchor #${frag} not found (from ${sample})`);
  }
  console.log(`internal links: ${targets.size} distinct targets checked`);

  // Consolidated redirects.
  await pool(redirects, async ({ source, destination }) => {
    const res = await get(source);
    const loc = res.headers.get("location");
    if (res.status !== 301 && res.status !== 308)
      err(source, `expected permanent redirect, got HTTP ${res.status}`);
    else if (!loc || new URL(loc, BASE).pathname !== destination)
      err(source, `redirects to ${loc}, expected ${destination}`);
  });
  console.log(`redirects: ${redirects.length} checked`);

  for (const [t, ps] of titles)
    if (ps.length > 1) warn("duplicate title", `"${t}" on ${ps.join(", ")}`);
  for (const [d, ps] of descriptions)
    if (ps.length > 1) warn("duplicate description", `"${d.slice(0, 60)}…" on ${ps.join(", ")}`);

  report();
}

function report() {
  console.log("");
  for (const w of warnings) console.log(`WARN  ${w}`);
  for (const e of errors) console.log(`ERROR ${e}`);
  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exitCode = errors.length > 0 ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
