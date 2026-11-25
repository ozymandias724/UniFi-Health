import assert from "node:assert/strict";
import { test } from "node:test";

import { isRecord, isUnitid, isNullableNumber } from "./utils/validation.ts";

test("isRecord accepts non-array objects", () => {
  assert.equal(isRecord({}), true);
  assert.equal(isRecord({ unitid: 123 }), true);

  for (const value of [null, undefined, [], 123, "text", true]) {
    assert.equal(isRecord(value), false);
  }
});

test("isUnitid accepts positive safe integers", () => {
  assert.equal(isUnitid(1), true);
  assert.equal(isUnitid(166027), true);
  assert.equal(isUnitid(Number.MAX_SAFE_INTEGER), true);

  for (const value of [
    0,
    -1,
    1.5,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    "166027",
    null,
    undefined,
  ]) {
    assert.equal(isUnitid(value), false);
  }
});

test("isNullableNumber accepts finite numbers and null", () => {
  for (const value of [null, 0, -1, 1.5, 100]) {
    assert.equal(isNullableNumber(value), true);
  }

  for (const value of [undefined, NaN, Infinity, -Infinity, "100", true]) {
    assert.equal(isNullableNumber(value), false);
  }
});
