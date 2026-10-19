#!/usr/bin/env node
/**
 * Compare two manual Google Search Console CSV exports. Dependency-free; no API.
 *
 * Performance (Pages.csv or Queries.csv from the export ZIP):
 *   node scripts/gsc-compare.mjs before/Pages.csv after/Pages.csv [--top 20] [--cohort paths.txt]
 *
 * Indexing drilldown (e.g. "Discovered – currently not indexed" Table.csv):
 *   node scripts/gsc-compare.mjs --urls before/Table.csv after/Table.csv
 *
 * Keys are normalized to paths when they are URLs. `--cohort` takes a file with one
 * path per line and prints that group's totals (e.g. the 37 formerly-discovered URLs).
 * Compare equal-length windows; GSC data lags 2–3 days and anonymizes rare queries.
 */
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const urlsMode = args.includes("--urls");
if (urlsMode) args.splice(args.indexOf("--urls"), 1);
const top = Number(flag("--top") ?? 20);
const cohortFile = flag("--cohort");
const [beforePath, afterPath] = args;
if (!beforePath || !afterPath) {
  console.error(
    "usage: gsc-compare.mjs [--urls] <before.csv> <after.csv> [--top N] [--cohort paths.txt]",
  );
  process.exit(2);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

const keyOf = (v) => {
  try {
    const u = new URL(v);
    return u.pathname.replace(/\/$/, "") || "/";
  } catch {
    return v.trim();
  }
};
const num = (v) => Number(String(v ?? "").replace(/[%,]/g, "")) || 0;

function load(path) {
  const [head, ...rows] = parseCsv(readFileSync(path, "utf8").replace(/^﻿/, ""));
  const col = (re) => head.findIndex((h) => re.test(h));
  return { head, rows, col };
}

if (urlsMode) {
  const read = (p) => {
    const { rows, col } = load(p);
    const i = Math.max(0, col(/url/i));
    return new Set(rows.map((r) => keyOf(r[i])));
  };
  const a = read(beforePath);
  const b = read(afterPath);
  const left = [...a].filter((u) => !b.has(u)).sort();
  const added = [...b].filter((u) => !a.has(u)).sort();
  console.log(`before: ${a.size} URLs, after: ${b.size} URLs`);
  console.log(
    `\nleft this status (${left.length}) — check whether indexed, redirected, or moved to another status:`,
  );
  for (const u of left) console.log(`  - ${u}`);
  console.log(`\nnewly in this status (${added.length}):`);
  for (const u of added) console.log(`  + ${u}`);
  process.exit(0);
}

function perf(path) {
  const { rows, col } = load(path);
  const k = 0;
  const [c, i, p] = [col(/^clicks$/i), col(/^impressions$/i), col(/^position$/i)];
  const map = new Map();
  for (const r of rows)
    map.set(keyOf(r[k]), { clicks: num(r[c]), impressions: num(r[i]), position: num(r[p]) });
  return map;
}
const A = perf(beforePath);
const B = perf(afterPath);
const totals = (m, keys = [...m.keys()]) => {
  let clicks = 0,
    impressions = 0,
    wpos = 0;
  for (const key of keys) {
    const v = m.get(key);
    if (!v) continue;
    clicks += v.clicks;
    impressions += v.impressions;
    wpos += v.position * v.impressions;
  }
  return {
    clicks,
    impressions,
    position: impressions ? wpos / impressions : 0,
    ctr: impressions ? clicks / impressions : 0,
  };
};
const fmt = (t) =>
  `${t.clicks} clicks · ${t.impressions} impr · CTR ${(t.ctr * 100).toFixed(2)}% · pos ${t.position.toFixed(1)}`;

console.log(`before: ${fmt(totals(A))}`);
console.log(`after:  ${fmt(totals(B))}`);
console.log("(rows only — GSC totals include anonymized queries these exports omit)");

if (cohortFile) {
  const cohort = readFileSync(cohortFile, "utf8")
    .split(/\r?\n/)
    .map((l) => keyOf(l.trim()))
    .filter(Boolean);
  const present = cohort.filter((k) => B.has(k)).length;
  console.log(`\ncohort ${cohortFile} (${cohort.length} keys, ${present} with impressions after):`);
  console.log(`  before: ${fmt(totals(A, cohort))}`);
  console.log(`  after:  ${fmt(totals(B, cohort))}`);
}

const keys = new Set([...A.keys(), ...B.keys()]);
const delta = [...keys].map((key) => {
  const a = A.get(key) ?? { clicks: 0, impressions: 0, position: 0 };
  const b = B.get(key) ?? { clicks: 0, impressions: 0, position: 0 };
  return { key, a, b, di: b.impressions - a.impressions, dc: b.clicks - a.clicks };
});
const row = (d) =>
  `${String(d.di).padStart(7)} impr  ${String(d.dc).padStart(4)} clk  pos ${d.a.position ? d.a.position.toFixed(1) : "–"} → ${d.b.position ? d.b.position.toFixed(1) : "–"}  ${d.key}`;
console.log(`\nbiggest gains (top ${top}):`);
for (const d of [...delta].sort((x, y) => y.di - x.di).slice(0, top)) console.log(row(d));
console.log(`\nbiggest losses (top ${top}):`);
for (const d of [...delta].sort((x, y) => x.di - y.di).slice(0, top)) console.log(row(d));
console.log(
  `\nnew keys: ${delta.filter((d) => !A.has(d.key)).length} · lost keys: ${delta.filter((d) => !B.has(d.key)).length}`,
);
