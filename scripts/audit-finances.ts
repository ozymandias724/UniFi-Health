/**
 * Read-only coverage audit of the generated IPEDS finance summaries.
 * Run from the project root: node scripts/audit-finances.ts
 * Optionally pass another JSON path as the first argument.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { UniversityFinanceSummary } from "../src/types/finance.ts";

const DEFAULT_PATH = "public/data/finances.json";

const FINANCIAL_FIELDS = [
  "total_revenues_additions",
  "total_expenses_deductions",
  "rev_total_current",
  "exp_total_current",
  "assets",
  "liabilities",
  "equity_end",
] as const satisfies readonly (keyof UniversityFinanceSummary)[];

const REPORTING_FIELDS = [
  "parent_child_flag",
  "parent_child_system_flag",
  "parent_unitid",
  "reporting_form",
] as const satisfies readonly (keyof UniversityFinanceSummary)[];

const PAIRS = [
  ["Broad totals", "total_revenues_additions", "total_expenses_deductions"],
  ["Current totals", "rev_total_current", "exp_total_current"],
] as const satisfies readonly [string, keyof UniversityFinanceSummary, keyof UniversityFinanceSummary][];

type RecordRow = Record<string, unknown>;

function isObject(value: unknown): value is RecordRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPopulated(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && ![-1, -2, -3].includes(value);
}

function countBy(rows: RecordRow[], field: string): void {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = row[field];
    const key = isPopulated(value) ? String(value) : "null / missing";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  console.table([...counts.entries()].sort(([a], [b]) =>
    a === "null / missing" ? 1 : b === "null / missing" ? -1 : Number(a) - Number(b)
  ).map(([value, count]) => ({ value, count, percent: percent(count, rows.length) })));
}

function percent(n: number, total: number): string {
  return total === 0 ? "—" : `${(100 * n / total).toFixed(1)}%`;
}

function coverage(rows: RecordRow[]): void {
  console.table([...REPORTING_FIELDS, ...FINANCIAL_FIELDS].map((field) => {
    const populated = rows.filter((row) => isPopulated(row[field])).length;
    const missingKey = rows.filter((row) => !Object.hasOwn(row, field)).length;
    return {
      field,
      populated,
      "coverage": percent(populated, rows.length),
      "null / invalid": rows.length - populated - missingKey,
      "missing key": missingKey,
    };
  }));
  console.log("Revenue/expense pairs (both fields populated):");
  console.table(PAIRS.map(([name, revenue, expense]) => {
    const both = rows.filter((row) => isPopulated(row[revenue]) && isPopulated(row[expense])).length;
    return { pair: name, both, coverage: percent(both, rows.length) };
  }));
}

function isRetained(row: RecordRow): boolean {
  return ![2, 3, 4, 5, 6].includes(row.parent_child_flag as number);
}

export async function auditFinances(path = DEFAULT_PATH): Promise<void> {
  const raw: unknown = JSON.parse(await readFile(path, "utf8"));
  if (!Array.isArray(raw) || !raw.every(isObject)) {
    throw new Error("Expected finances.json to contain an array of objects.");
  }
  const rows: RecordRow[] = raw;
  const retained = rows.filter(isRetained);
  const excluded = rows.filter((row) => !isRetained(row));

  console.log(`\nFINANCE DATA AUDIT — ${path}`);
  console.log(`Total directory entries: ${rows.length}`);
  console.log("\n1. PARENT / CHILD CLASSIFICATIONS (raw IPEDS codes)");
  countBy(rows, "parent_child_flag");
  console.log("Note: null/missing classification is NOT proof of an independent institution.");

  console.log("\n2. COVERAGE — ALL DIRECTORY ENTRIES");
  coverage(rows);
  console.log(`\n3. PROPOSED FILTER: exclude flags 2, 3, 4, 5, 6`);
  console.log(`Retained: ${retained.length} (${percent(retained.length, rows.length)})`);
  console.log(`Excluded: ${excluded.length} (${percent(excluded.length, rows.length)})`);
  console.log("This is a provisional comparison, NOT a validated independent-institution filter.");
  console.log("\nCOVERAGE — RETAINED ENTRIES");
  coverage(retained);
  console.log("\nCOVERAGE — EXCLUDED ENTRIES");
  coverage(excluded);

  console.log("\n4. REPORTING FORM COUNTS — RETAINED ENTRIES");
  countBy(retained, "reporting_form");
  const forms = [...new Set(retained.map((row) => row.reporting_form))]
    .filter(isPopulated).sort((a, b) => a - b);
  console.log("\nREVENUE TOTAL COVERAGE BY REPORTING FORM (retained)");
  console.table(forms.map((form) => {
    const group = retained.filter((row) => row.reporting_form === form);
    const broad = group.filter((row) => isPopulated(row.total_revenues_additions)).length;
    const current = group.filter((row) => isPopulated(row.rev_total_current)).length;
    return {
      reporting_form: form,
      institutions: group.length,
      broad: `${broad} (${percent(broad, group.length)})`,
      current: `${current} (${percent(current, group.length)})`,
    };
  }));
  const unknownForm = retained.filter((row) => !isPopulated(row.reporting_form));
  if (unknownForm.length) {
    console.log(`Retained entries with null/missing reporting form: ${unknownForm.length}`);
  }
  console.log("\nReminder: unmatched API records may appear as all-null summaries; the JSON does not identify them separately.");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  auditFinances(process.argv[2]).catch((error: unknown) => {
    console.error("Finance audit failed:", error);
    process.exitCode = 1;
  });
}
