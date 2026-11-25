import assert from "node:assert/strict";
import { test } from "node:test";

import { getRevenueCoverage } from "../src/utils/getRevenueCoverage.ts";

test("calculates expenses below reported revenue", () => {
  assert.deepEqual(getRevenueCoverage(100, 75), {
    revenue: 100,
    expenses: 75,
    expenseShare: 0.75,
    exceededRevenue: false,
    expenseWithinRevenue: 75,
    revenueAboveExpenses: 25,
    overrunShare: 0,
  });
});

test("handles equal revenue and expenses", () => {
  const coverage = getRevenueCoverage(100, 100);

  assert.equal(coverage?.expenseShare, 1);
  assert.equal(coverage?.exceededRevenue, false);
  assert.equal(coverage?.revenueAboveExpenses, 0);
  assert.equal(coverage?.overrunShare, 0);
});

test("calculates expenses exceeding revenue", () => {
  const coverage = getRevenueCoverage(100, 125);

  assert.equal(coverage?.expenseShare, 1.25);
  assert.equal(coverage?.exceededRevenue, true);
  assert.equal(coverage?.expenseWithinRevenue, 100);
  assert.equal(coverage?.revenueAboveExpenses, 0);
  assert.equal(coverage?.overrunShare, 0.25);
});

test("caps the overrun ring without capping expense share", () => {
  const coverage = getRevenueCoverage(100, 225);

  assert.equal(coverage?.expenseShare, 2.25);
  assert.equal(coverage?.overrunShare, 1);
});

test("accepts zero expenses", () => {
  const coverage = getRevenueCoverage(100, 0);

  assert.equal(coverage?.expenseShare, 0);
  assert.equal(coverage?.revenueAboveExpenses, 100);
});

test("rejects missing or invalid financial totals", () => {
  assert.equal(getRevenueCoverage(null, 100), null);
  assert.equal(getRevenueCoverage(100, null), null);
  assert.equal(getRevenueCoverage(0, 100), null);
  assert.equal(getRevenueCoverage(-100, 100), null);
  assert.equal(getRevenueCoverage(100, -100), null);

  for (const value of [NaN, Infinity, -Infinity]) {
    assert.equal(getRevenueCoverage(value, 100), null);
    assert.equal(getRevenueCoverage(100, value), null);
  }
});

test("rejects non-finite calculated percentages", () => {
  assert.equal(getRevenueCoverage(Number.MIN_VALUE, Number.MAX_VALUE), null);
});
