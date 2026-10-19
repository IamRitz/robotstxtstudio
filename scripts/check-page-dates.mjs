#!/usr/bin/env node
/**
 * Lists pages whose source changed in git after the `modified` date recorded in
 * src/config/page-dates.ts, so you can decide whether a lastmod bump is warranted
 * (only bump for real content changes — not link tweaks or refactors). Advisory:
 * always exits 0. Run from the repo root: `node scripts/check-page-dates.mjs`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const src = readFileSync("src/config/page-dates.ts", "utf8");
const recovery = src.match(/const RECOVERY = "([^"]+)"/)?.[1];
const entries = [
  ...src.matchAll(
    /"(\/[^"]*)":\s*\{\s*published:\s*"([^"]+)",\s*modified:\s*(?:"([^"]+)"|RECOVERY)/g,
  ),
].map((m) => ({ path: m[1], modified: m[3] ?? recovery }));

function sourcesFor(path) {
  if (path.startsWith("/crawlers/"))
    return ["src/app/crawlers/[id]/page.tsx", "src/config/crawler-directory.ts"];
  if (path === "/") return ["src/app/page.tsx"];
  return [`src/app${path}/page.tsx`];
}

function lastCommitDate(file) {
  try {
    return execFileSync("git", ["log", "-1", "--format=%as", "--", file], {
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

const dirty = new Set(
  execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" })
    .split("\n")
    .map((l) => l.slice(3).trim())
    .filter(Boolean),
);

let flagged = 0;
for (const { path, modified } of entries) {
  for (const file of sourcesFor(path)) {
    if (!existsSync(file)) {
      console.log(`MISSING  ${path}: ${file} not found`);
      flagged++;
      continue;
    }
    const git = lastCommitDate(file);
    if (dirty.has(file))
      console.log(`CHANGED  ${path}: ${file} has uncommitted edits (recorded ${modified})`);
    else if (git && git > modified)
      console.log(`NEWER    ${path}: ${file} committed ${git} > recorded ${modified}`);
    else continue;
    flagged++;
  }
}
console.log(`\n${entries.length} pages checked, ${flagged} to review.`);
