import assert from "node:assert/strict";
import { test } from "node:test";

import { getCodeLabel } from "../src/utils/getCodeLabel.ts";

test("resolves numeric categorical codes", () => {
  const values = "{1: 'Yes', 2: 'No'}";

  assert.equal(getCodeLabel(values, 1), "Yes");
  assert.equal(getCodeLabel(values, 2), "No");
});

test("removes repeated numeric prefixes", () => {
  assert.equal(
    getCodeLabel("{1: '1 - Public institution'}", 1),
    "Public institution",
  );
});

test("resolves negative categorical codes", () => {
  assert.equal(
    getCodeLabel("{-2: '-2 - Not applicable'}", -2),
    "Not applicable",
  );
});

test("decodes supported HTML entities", () => {
  assert.equal(
    getCodeLabel("{1: 'Revenue &amp; expenses &mdash; total'}", 1),
    "Revenue & expenses — total",
  );
});

test("handles escaped apostrophes", () => {
  assert.equal(
    getCodeLabel("{1: 'Bachelor\\'s degree'}", 1),
    "Bachelor's degree",
  );
});

test("returns undefined for unavailable or unmatched codes", () => {
  assert.equal(getCodeLabel(undefined, 1), undefined);
  assert.equal(getCodeLabel("", 1), undefined);
  assert.equal(getCodeLabel("{1: 'Yes'}", 2), undefined);
});