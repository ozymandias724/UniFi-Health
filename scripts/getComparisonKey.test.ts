import assert from "node:assert/strict";
import { test } from "node:test";
import { getComparisonKey } from "../src/utils/getComparisonKey.ts";

test("creates a key from UNITID and reporting year", () => {
  assert.equal(
    getComparisonKey({ unitid: 166027, year: 2023 }),
    "166027:2023",
  );
});

test("distinguishes institutions within the same year", () => {
  assert.notEqual(
    getComparisonKey({ unitid: 166027, year: 2023 }),
    getComparisonKey({ unitid: 166683, year: 2023 }),
  );
});

test("distinguishes reporting years for the same institution", () => {
  assert.notEqual(
    getComparisonKey({ unitid: 166027, year: 2023 }),
    getComparisonKey({ unitid: 166027, year: 2022 }),
  );
});