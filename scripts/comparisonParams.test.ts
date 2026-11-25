import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseComparisonSelections,
  serializeComparisonSelections,
} from "../src/utils/comparisonParams.ts";

test("serializes an empty selection list", () => {
  assert.equal(serializeComparisonSelections([]), "");
});

test("serializes a single selection", () => {
  assert.equal(
    serializeComparisonSelections([{ unitid: 166027, year: 2023 }]),
    "166027:2023",
  );
});

test("serializes multiple selections in order", () => {
  assert.equal(
    serializeComparisonSelections([
      { unitid: 166027, year: 2023 },
      { unitid: 166683, year: 2022 },
    ]),
    "166027:2023,166683:2022",
  );
});

test("parses a single selection", () => {
  assert.deepEqual(parseComparisonSelections("166027:2023"), [
    { unitid: 166027, year: 2023 },
  ]);
});

test("parses multiple selections in order", () => {
  assert.deepEqual(parseComparisonSelections("166683:2022,166027:2023"), [
    { unitid: 166683, year: 2022 },
    { unitid: 166027, year: 2023 },
  ]);
});

test("allows the same institution across different years", () => {
  assert.deepEqual(parseComparisonSelections("166027:2023,166027:2022"), [
    { unitid: 166027, year: 2023 },
    { unitid: 166027, year: 2022 },
  ]);
});

test("removes duplicate selections", () => {
  assert.deepEqual(parseComparisonSelections("166027:2023,166027:2023"), [
    { unitid: 166027, year: 2023 },
  ]);
});

test("removes equivalent selections with leading zeros", () => {
  assert.deepEqual(parseComparisonSelections("0166027:2023,166027:2023"), [
    { unitid: 166027, year: 2023 },
  ]);
});

test("ignores invalid entries while preserving valid selections", () => {
  assert.deepEqual(
    parseComparisonSelections("garbage,166027:2023,0:2023,166683:2022"),
    [
      { unitid: 166027, year: 2023 },
      { unitid: 166683, year: 2022 },
    ],
  );
});

test("limits comparisons to four unique valid selections", () => {
  assert.deepEqual(
    parseComparisonSelections(
      "garbage,166027:2023,166027:2023,166027:2022,166027:2021,166683:2023,166683:2022",
    ),
    [
      { unitid: 166027, year: 2023 },
      { unitid: 166027, year: 2022 },
      { unitid: 166027, year: 2021 },
      { unitid: 166683, year: 2023 },
    ],
  );
});

const invalidCases: Array<[string, string | null]> = [
  ["missing input", null],
  ["empty input", ""],
  ["malformed input", "garbage"],
  ["missing year", "166027"],
  ["missing UNITID", ":2023"],
  ["negative UNITID", "-1:2023"],
  ["zero UNITID", "0:2023"],
  ["fractional UNITID", "166027.5:2023"],
  ["unsafe integer UNITID", "9007199254740992:2023"],
  ["unsupported year", "166027:1900"],
  ["malformed year", "166027:23"],
  ["extra separator", "166027:2023:2022"],
];

for (const [name, value] of invalidCases) {
  test(`rejects ${name}`, () => {
    assert.deepEqual(parseComparisonSelections(value), []);
  });
}

test("preserves selections through serialization and parsing", () => {
  const selections = [
    { unitid: 166027, year: 2023 },
    { unitid: 166027, year: 2022 },
    { unitid: 166683, year: 2023 },
  ];

  assert.deepEqual(
    parseComparisonSelections(serializeComparisonSelections(selections)),
    selections,
  );
});

test("preserves selections through URL parameter encoding", () => {
  const selections = [
    { unitid: 166027, year: 2023 },
    { unitid: 166683, year: 2022 },
  ];

  const params = new URLSearchParams();

  params.set("items", serializeComparisonSelections(selections));

  const decoded = new URLSearchParams(params.toString());

  assert.deepEqual(parseComparisonSelections(decoded.get("items")), selections);
});
