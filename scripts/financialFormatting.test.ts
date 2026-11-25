import assert from "node:assert/strict";
import { test } from "node:test";

import { formatFinanceValue } from "../src/utils/formatFinanceValue.ts";
import { formatFinanceLabel } from "../src/utils/formatFinanceLabel.ts";

test("formats financial amounts as currency", () => {
  assert.equal(
    formatFinanceValue("assets", 1234567, "Assets"),
    "$1,234,567",
  );
});

test("distinguishes missing values from zero", () => {
  assert.equal(
    formatFinanceValue("assets", null, "Assets"),
    "N/A",
  );

  assert.equal(
    formatFinanceValue("assets", 0, "Assets"),
    "$0",
  );
});

test("preserves negative financial amounts", () => {
  assert.equal(
    formatFinanceValue("assets", -1, "Assets"),
    "-$1",
  );
});

test("rejects non-finite values", () => {
  for (const value of [NaN, Infinity, -Infinity]) {
    assert.equal(
      formatFinanceValue("assets", value, "Assets"),
      "N/A",
    );
  }
});

test("formats identifiers without thousands separators", () => {
  assert.equal(
    formatFinanceValue("unitid", 166027, "Institution Information"),
    "166027",
  );

  assert.equal(
    formatFinanceValue("year", 2023, "Institution Information"),
    "2023",
  );

  assert.equal(
    formatFinanceValue("parent_unitid", 166027, "Institution Information"),
    "166027",
  );
});

test("preserves source percentage scales", () => {
  assert.equal(
    formatFinanceValue("example_pct", 25.5, "Revenue"),
    "25.5%",
  );

  assert.equal(
    formatFinanceValue("example_pct", 0.25, "Revenue"),
    "0.25%",
  );
});

test("formats ratios without currency symbols", () => {
  assert.equal(
    formatFinanceValue("example_ratio", 1.25, "Revenue"),
    "1.25",
  );
});

test("does not assume unknown fields represent currency", () => {
  assert.equal(
    formatFinanceValue("unknown", 1234.56, "Other"),
    "1,234.56",
  );
});

test("removes redundant category prefixes from labels", () => {
  assert.equal(
    formatFinanceLabel("Revenue: Tuition and fees", "Revenue"),
    "Tuition and fees",
  );

  assert.equal(
    formatFinanceLabel("Assets: Total assets", "Assets"),
    "Total assets",
  );
});

test("preserves labels without matching prefixes", () => {
  assert.equal(
    formatFinanceLabel("Total enrollment", "Enrollment"),
    "Total enrollment",
  );

  assert.equal(
    formatFinanceLabel("Revenue: Tuition", "Assets"),
    "Revenue: Tuition",
  );
});