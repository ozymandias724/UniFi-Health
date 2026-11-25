import assert from "node:assert/strict";
import { test } from "node:test";

import { hasExcludedReportingFlag } from "./utils/institutionEligibility.ts";

test("identifies excluded parent-child reporting flags", () => {
  for (const flag of [2, 3, 4, 5, 6]) {
    assert.equal(hasExcludedReportingFlag(flag), true);
  }
});

test("does not exclude parent or unclassified institutions", () => {
  for (const flag of [1, null, undefined]) {
    assert.equal(hasExcludedReportingFlag(flag), false);
  }
});

test("does not coerce invalid reporting flag values", () => {
  for (const flag of ["2", "3", true, {}, NaN]) {
    assert.equal(hasExcludedReportingFlag(flag), false);
  }
});
