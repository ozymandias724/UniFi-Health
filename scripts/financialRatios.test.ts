import assert from "node:assert/strict";
import { test } from "node:test";

import { getRevenueExpenseRatio } from "../src/utils/getRevenueExpenseRatio.ts";
import { getFinanceColor } from "../src/utils/getFinanceColor.ts";

test("calculates revenue as a percentage of expenses", () => {
  assert.equal(getRevenueExpenseRatio(120, 100), 120);
  assert.equal(getRevenueExpenseRatio(100, 100), 100);
  assert.equal(getRevenueExpenseRatio(80, 100), 80);
  assert.equal(getRevenueExpenseRatio(0, 100), 0);
});

test("rejects missing or invalid financial totals", () => {
  assert.equal(getRevenueExpenseRatio(null, 100), null);
  assert.equal(getRevenueExpenseRatio(100, null), null);
  assert.equal(getRevenueExpenseRatio(100, 0), null);
  assert.equal(getRevenueExpenseRatio(100, -1), null);
  assert.equal(getRevenueExpenseRatio(-1, 100), null);
  assert.equal(getRevenueExpenseRatio(NaN, 100), null);
  assert.equal(getRevenueExpenseRatio(100, NaN), null);
  assert.equal(getRevenueExpenseRatio(Infinity, 100), null);
  assert.equal(getRevenueExpenseRatio(100, Infinity), null);
});

test("rejects non-finite calculated ratios", () => {
  assert.equal(
    getRevenueExpenseRatio(Number.MAX_VALUE, Number.MIN_VALUE),
    null,
  );
});

test("classifies ratios at exact color boundaries", () => {
  assert.equal(getFinanceColor(120), "#16a34a");
  assert.equal(getFinanceColor(119.99), "#84cc16");
  assert.equal(getFinanceColor(105), "#84cc16");
  assert.equal(getFinanceColor(104.99), "#eab308");
  assert.equal(getFinanceColor(95), "#eab308");
  assert.equal(getFinanceColor(94.99), "#f97316");
  assert.equal(getFinanceColor(80), "#f97316");
  assert.equal(getFinanceColor(79.99), "#dc2626");
  assert.equal(getFinanceColor(0), "#dc2626");
});

test("uses neutral gray for unavailable or invalid ratios", () => {
  for (const ratio of [null, NaN, Infinity, -Infinity, -1]) {
    assert.equal(getFinanceColor(ratio), "#94a3b8");
  }
});
