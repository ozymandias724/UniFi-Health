import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { generateFinances } from "./generate-finances.ts";

const summaryFields = [
  "parent_child_flag",
  "parent_child_system_flag",
  "parent_unitid",
  "reporting_form",
  "total_revenues_additions",
  "total_expenses_deductions",
  "rev_total_current",
  "exp_total_current",
  "assets",
  "liabilities",
  "equity_end",
] as const;

function expectedSummary(unitid: number, values: Record<string, number | null> = {}) {
  return {
    unitid,
    year: 2023,
    ...Object.fromEntries(summaryFields.map((field) => [field, values[field] ?? null])),
  };
}


async function fixture(t: { after: (fn: () => Promise<void>) => void }) {
  const dir = await mkdtemp(join(tmpdir(), "finance-generator-test-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const directory = join(dir, "universities.json");
  const output = join(dir, "finances.json");
  await writeFile(directory, JSON.stringify([
    { unitid: 101 },
    { unitid: 102 },
    { unitid: 103 },
    { unitid: 104 },
  ]));
  await writeFile(output, "previous output");
  return { directory, output };
}

test("retries, follows pages, normalizes missing values, and retains missing institutions", async (t) => {
  const { directory, output } = await fixture(t);
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    calls++;
    if (calls === 1) return new Response(null, { status: 429 });
    const url = new URL(String(input));
    if (!url.searchParams.has("page")) {
      url.searchParams.set("page", "2");
      return Response.json({
        count: 3,
        next: url.href,
        results: [{ unitid: 101, year: 2023, parent_child_flag: 3, parent_unitid: 167358, rev_total_current: 71758000, exp_total_current: 34476000, total_revenues_additions: -1, total_expenses_deductions: 0 }],
      });
    }
    return Response.json({
      count: 3,
      next: null,
      results: [
        { unitid: 102, year: 2023, parent_child_flag: 1, assets: 0, liabilities: -2, total_revenues_additions: -10, total_expenses_deductions: -3 },
        { unitid: 104, year: 2023, total_revenues_additions: -2, total_expenses_deductions: "100" },
      ],
    });
  });

  await generateFinances(directory, output);
  assert.equal(calls, 3);
  assert.deepEqual(JSON.parse(await readFile(output, "utf8")), [
    expectedSummary(101, {
      parent_child_flag: 3,
      parent_unitid: 167358,
      rev_total_current: 71758000,
      exp_total_current: 34476000,
      total_expenses_deductions: 0,
    }),
    expectedSummary(102, {
      parent_child_flag: 1,
      assets: 0,
      total_revenues_additions: -10,
    }),
    expectedSummary(103),
    expectedSummary(104),
  ]);
});

test("preserves previous output when API retrieval is incomplete", async (t) => {
  const { directory, output } = await fixture(t);
  t.mock.method(globalThis, "fetch", async () => Response.json({
    count: 2,
    next: null,
    results: [{ unitid: 101, year: 2023 }],
  }));
  await assert.rejects(generateFinances(directory, output), /Incomplete finance API response/);
  assert.equal(await readFile(output, "utf8"), "previous output");
});

test("retries a response body interrupted by a network error", async (t) => {
  const { directory, output } = await fixture(t);
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    if (calls === 1) {
      return new Response(new ReadableStream({
        start(controller) {
          controller.error(new TypeError("Connection interrupted"));
        },
      }));
    }
    return Response.json({ count: 0, next: null, results: [] });
  });
  await generateFinances(directory, output);
  assert.equal(calls, 2);
  assert.equal(JSON.parse(await readFile(output, "utf8")).length, 4);
});

test("rejects duplicate directory IDs before requesting data", async (t) => {
  const { directory, output } = await fixture(t);
  await writeFile(directory, JSON.stringify([{ unitid: 101 }, { unitid: 101 }]));
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response());
  await assert.rejects(generateFinances(directory, output), /invalid or duplicate unitid/);
  assert.equal(fetch.mock.callCount(), 0);
  assert.equal(await readFile(output, "utf8"), "previous output");
});

test("rejects duplicate or unexpected API records without replacing output", async (t) => {
  const { directory, output } = await fixture(t);
  for (const results of [
    [{ unitid: 101, year: 2023 }, { unitid: 101, year: 2023 }],
    [{ unitid: 999, year: 2023 }],
    [{ unitid: 101, year: 2022 }],
  ]) {
    const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({
      count: results.length,
      next: null,
      results,
    }));
    await assert.rejects(generateFinances(directory, output), /Unexpected or duplicate finance API record/);
    assert.equal(await readFile(output, "utf8"), "previous output");
    fetch.mock.restore();
  }
});
