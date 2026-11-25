import assert from "node:assert/strict";
import { test } from "node:test";

import type { FinanceRecord } from "../src/types/finance.ts";
import { groupFinances } from "../src/utils/groupFinances.ts";

function makeRecord(fields: Record<string, number | null>): FinanceRecord {
  return {
    unitid: 123,
    year: 2023,
    ...fields,
  } as FinanceRecord;
}

test("preserves configured field ordering", () => {
  const record = makeRecord({
    rev_tuition_fees_gross: 200,
    rev_tuition_fees_net: 100,
  });

  const sections = groupFinances(record, {});
  const revenue = sections.find((section) => section.title === "Revenue");

  assert.deepEqual(revenue?.groups[0].fields, [
    ["rev_tuition_fees_net", 100],
    ["rev_tuition_fees_gross", 200],
  ]);
});

test("appends unconfigured fields to existing sections", () => {
  const record = makeRecord({
    rev_tuition_fees_net: 100,
    rev_unknown: 200,
  });

  const sections = groupFinances(record, {});
  const revenue = sections.find((section) => section.title === "Revenue");

  assert.deepEqual(revenue?.groups.at(-1), {
    title: "Other Fields",
    fields: [["rev_unknown", 200]],
  });
});

test("creates fallback sections for unknown categories", () => {
  const record = makeRecord({
    unknown_field: 100,
  });

  const sections = groupFinances(record, {});
  const other = sections.find((section) => section.title === "Other");

  assert.deepEqual(other?.groups[0].fields, [["unknown_field", 100]]);
});

test("preserves every record field exactly once", () => {
  const record = makeRecord({
    assets: 100,
    liabilities: null,
    rev_tuition_fees_net: 0,
    rev_unknown: 200,
    unknown_field: -1,
  });

  const entries = groupFinances(record, {}).flatMap((section) =>
    section.groups.flatMap((group) => group.fields),
  );

  assert.equal(entries.length, Object.keys(record).length);
  assert.deepEqual(Object.fromEntries(entries), record);
});

test("omits empty sections and groups", () => {
  const sections = groupFinances(makeRecord({}), {});

  assert.deepEqual(
    sections.map((section) => section.title),
    ["Institution Information"],
  );

  for (const section of sections) {
    assert.ok(section.groups.length > 0);

    for (const group of section.groups) {
      assert.ok(group.fields.length > 0);
    }
  }
});
