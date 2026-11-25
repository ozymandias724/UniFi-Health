import assert from "node:assert/strict";
import { test } from "node:test";

import { getClusterFinance } from "../src/utils/getClusterFinance.ts";

test("calculates the percentage of institutions below 100", () => {
  assert.deepEqual(getClusterFinance([80, 90, 100, 120]), {
    validCount: 4,
    deficitCount: 2,
    deficitPercentage: 50,
    color: "#eab308",
  });
});

test("excludes missing ratios from the denominator", () => {
  const result = getClusterFinance([80, 120, null, null]);

  assert.equal(result.validCount, 2);
  assert.equal(result.deficitCount, 1);
  assert.equal(result.deficitPercentage, 50);
});

test("excludes invalid financial ratios", () => {
  const result = getClusterFinance([80, 120, NaN, Infinity, -Infinity, -1]);

  assert.equal(result.validCount, 2);
  assert.equal(result.deficitPercentage, 50);
});

test("uses neutral gray when no valid ratios exist", () => {
  for (const ratios of [[], [null, null]]) {
    assert.deepEqual(getClusterFinance(ratios), {
      validCount: 0,
      deficitCount: 0,
      deficitPercentage: null,
      color: "#94a3b8",
    });
  }
});

test("does not classify equal revenue and expenses as a deficit", () => {
  const result = getClusterFinance([100, 100]);

  assert.equal(result.deficitCount, 0);
  assert.equal(result.deficitPercentage, 0);
  assert.equal(result.color, "#16a34a");
});

test("accepts zero revenue ratios", () => {
  const result = getClusterFinance([0]);

  assert.equal(result.validCount, 1);
  assert.equal(result.deficitPercentage, 100);
  assert.equal(result.color, "#dc2626");
});

test("classifies exact cluster color boundaries", () => {
  const cases = [
    [0, "#16a34a"],
    [19, "#16a34a"],
    [20, "#84cc16"],
    [39, "#84cc16"],
    [40, "#eab308"],
    [59, "#eab308"],
    [60, "#f97316"],
    [79, "#f97316"],
    [80, "#dc2626"],
    [100, "#dc2626"],
  ] as const;

  for (const [deficitCount, expected] of cases) {
    const ratios = [
      ...Array(deficitCount).fill(80),
      ...Array(100 - deficitCount).fill(120),
    ];

    assert.equal(getClusterFinance(ratios).color, expected);
  }
});
