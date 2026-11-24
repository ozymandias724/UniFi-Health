import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

// Run with: node --experimental-strip-types --test scripts/build-data.test.ts
// Each test runs the real CLI in an isolated temporary working directory.
const SCRIPT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "build-data.ts",
);

type Row = Record<string, unknown>;

function university(unitid: number): Row {
  return {
    unitid,
    inst_name: `University ${unitid}`,
    city: "Example City",
    state_abbr: "ME",
    latitude: 44.4,
    longitude: -69.0,
  };
}

function finance(unitid: number, overrides: Row = {}): Row {
  return {
    unitid,
    year: 2023,
    parent_child_flag: 1,
    parent_child_system_flag: null,
    parent_unitid: null,
    reporting_form: "F",
    total_revenues_additions: 100,
    total_expenses_deductions: 80,
    rev_total_current: null,
    exp_total_current: null,
    assets: null,
    liabilities: null,
    equity_end: null,
    ...overrides,
  };
}

function runBuild(directory: unknown, finances: unknown, publish = false) {
  const root = mkdtempSync(join(tmpdir(), "build-data-test-"));
  const rawDir = join(root, "data", "raw");
  mkdirSync(rawDir, { recursive: true });
  writeFileSync(join(rawDir, "directory-2023.json"), JSON.stringify(directory));
  writeFileSync(join(rawDir, "finances-2023.json"), JSON.stringify(finances));
  const outputDir = join(root, "public", "data", "2023");
  mkdirSync(outputDir, { recursive: true });
  const universitiesPath = join(outputDir, "universities.json");
  const financesPath = join(outputDir, "finances.json");
  writeFileSync(universitiesPath, "original universities");
  writeFileSync(financesPath, "original finances");

  const result = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      SCRIPT,
      "--year",
      "2023",
      ...(publish ? ["--publish"] : []),
    ],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
  const output = `${result.stdout}\n${result.stderr}`;
  return {
    status: result.status,
    output,
    universities: readFileSync(universitiesPath, "utf8"),
    finances: readFileSync(financesPath, "utf8"),
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

function withBuild(
  directory: unknown,
  finances: unknown,
  publish: boolean,
  check: (result: ReturnType<typeof runBuild>) => void,
) {
  const result = runBuild(directory, finances, publish);
  try {
    check(result);
  } finally {
    result.cleanup();
  }
}

test("dry run classifies records and does not modify published files", () => {
  withBuild(
    [1, 2, 3, 4, 5].map(university),
    [
      finance(1),
      finance(2, { parent_child_flag: 3 }),
      finance(3, { total_revenues_additions: null }),
      finance(4, { total_revenues_additions: 0, total_expenses_deductions: 0 }),
    ],
    false,
    (result) => {
      assert.equal(result.status, 0, result.output);
      assert.match(result.output, /Unmatched finance records: 1/);
      assert.match(result.output, /Excluded partial reporting: 1/);
      assert.match(result.output, /Excluded missing totals: 1/);
      assert.match(result.output, /Eligible institutions: 2/);
      assert.equal(result.universities, "original universities");
      assert.equal(result.finances, "original finances");
    },
  );
});

test("publish writes aligned eligible UNITIDs in directory order", () => {
  withBuild(
    [university(3), university(1), university(2)],
    [
      finance(1, { parent_child_flag: null }),
      finance(2, { parent_child_flag: 5 }),
      finance(3),
    ],
    true,
    (result) => {
      assert.equal(result.status, 0, result.output);
      assert.deepEqual(
        JSON.parse(result.universities).map((r: Row) => r.unitid),
        [3, 1],
      );
      assert.deepEqual(
        JSON.parse(result.finances).map((r: Row) => r.unitid),
        [3, 1],
      );
    },
  );
});

const invalidCases: Array<[string, unknown, unknown, RegExp]> = [
  [
    "duplicate directory UNITID",
    [university(1), university(1)],
    [finance(1)],
    /Duplicate directory UNITID: 1/,
  ],
  [
    "invalid directory UNITID",
    [university(0)],
    [],
    /invalid institution or UNITID/i,
  ],
  [
    "invalid directory coordinates",
    [{ ...university(1), latitude: "bad" }],
    [finance(1)],
    /Invalid latitude/,
  ],
  [
    "duplicate finance UNITID",
    [university(1)],
    [finance(1), finance(1)],
    /Duplicate finance UNITID: 1/,
  ],
  [
    "finance UNITID absent from directory",
    [university(1)],
    [finance(2)],
    /missing from directory/,
  ],
  [
    "wrong reporting year",
    [university(1)],
    [finance(1, { year: 2022 })],
    /Unexpected reporting year/,
  ],
  [
    "invalid financial total",
    [university(1)],
    [finance(1, { total_revenues_additions: "100" })],
    /Invalid total_revenues_additions/,
  ],
  [
    "invalid reporting form",
    [university(1)],
    [finance(1, { reporting_form: {} })],
    /Invalid reporting_form/,
  ],
  [
    "invalid finance input shape",
    [university(1)],
    { unexpected: true },
    /Finances must be an array/,
  ],
  ["empty directory", [], [], /Directory must be a nonempty array/],
];

for (const [name, directory, finances, expected] of invalidCases) {
  test(`rejects ${name} without publishing`, () => {
    withBuild(directory, finances, true, (result) => {
      assert.notEqual(result.status, 0, result.output);
      assert.match(result.output, expected);
      assert.equal(result.universities, "original universities");
      assert.equal(result.finances, "original finances");
    });
  });
}
