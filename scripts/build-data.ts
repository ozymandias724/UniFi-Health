/* 
  Build aggregated data for universities and their finances.
  Reads raw directory and finance data, validates it, and outputs
  eligible universities and finance summaries to the public data directory.
*/

import { readFile } from "node:fs/promises";
import { writeJsonAtomic } from "./utils/writeJsonAtomic.ts";

import { SUMMARY_FIELDS } from "../src/config/financeSummaryFields.ts";
import type { UniversityFinanceSummary } from "../src/types/finance.ts";

import { isRecord, isUnitid, isNullableNumber } from "./utils/validation.ts";

import { parseReportingYear } from "./utils/parseReportingYear.ts";
const YEAR = parseReportingYear();

const DIRECTORY_PATH = `data/raw/directory-${YEAR}.json`;
const FINANCES_PATH = `data/raw/finances-${YEAR}.json`;

const OUTPUT_DIR = `public/data/${YEAR}`;

const UNIVERSITIES_OUTPUT = `${OUTPUT_DIR}/universities.json`;
const FINANCES_OUTPUT = `${OUTPUT_DIR}/finances.json`;

const EXCLUDED_FLAGS = new Set([2, 3, 4, 5, 6]);

interface University {
  unitid: number;
  inst_name: string;
  city: string;
  state_abbr: string;
  latitude: number | null;
  longitude: number | null;
}

interface BuildStats {
  total: number;
  unmatched: number;
  partialReporting: number;
  missingTotals: number;
  eligible: number;
}

function validateDirectory(data: unknown): asserts data is University[] {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Directory must be a nonempty array.");
  }

  const seen = new Set<number>();

  for (const university of data) {
    if (!isRecord(university) || !isUnitid(university.unitid)) {
      throw new Error("Directory contains an invalid institution or UNITID.");
    }

    const id = university.unitid;

    if (seen.has(id)) {
      throw new Error(`Duplicate directory UNITID: ${id}`);
    }
    seen.add(id);

    for (const field of ["inst_name", "city", "state_abbr"]) {
      if (typeof university[field] !== "string") {
        throw new Error(`Invalid ${field} for UNITID ${id}`);
      }
    }

    for (const field of ["latitude", "longitude"]) {
      if (!isNullableNumber(university[field])) {
        throw new Error(`Invalid ${field} for UNITID ${id}`);
      }
    }
  }
}

function validateFinances(
  data: unknown,
  directoryIds: Set<number>,
): asserts data is UniversityFinanceSummary[] {
  if (!Array.isArray(data)) {
    throw new Error("Finances must be an array.");
  }

  const seen = new Set<number>();

  const nullableFields = SUMMARY_FIELDS.filter(
    (field) => field !== "reporting_form",
  );

  for (const finance of data) {
    if (!isRecord(finance) || !isUnitid(finance.unitid)) {
      throw new Error("Finances contain an invalid record or UNITID.");
    }

    const id = finance.unitid;

    if (seen.has(id)) {
      throw new Error(`Duplicate finance UNITID: ${id}`);
    }
    if (!directoryIds.has(id)) {
      throw new Error(`Finance UNITID ${id} is missing from directory.`);
    }
    if (finance.year !== YEAR) {
      throw new Error(`Unexpected reporting year for UNITID ${id}`);
    }

    for (const field of nullableFields) {
      if (!isNullableNumber(finance[field])) {
        throw new Error(`Invalid ${field} for UNITID ${id}`);
      }
    }

    if (
      finance.reporting_form !== null &&
      typeof finance.reporting_form !== "string" &&
      !isNullableNumber(finance.reporting_form)
    ) {
      throw new Error(`Invalid reporting_form for UNITID ${id}`);
    }

    seen.add(id);
  }
}

function hasFinancialTotals(finance: UniversityFinanceSummary): boolean {
  return (
    finance.total_revenues_additions !== null &&
    finance.total_expenses_deductions !== null
  );
}

export async function buildData(publish = false): Promise<void> {
  const directoryData: unknown = JSON.parse(
    await readFile(DIRECTORY_PATH, "utf8"),
  );
  validateDirectory(directoryData);
  const directory = directoryData;

  const directoryIds = new Set(
    directory.map((university) => university.unitid),
  );

  const financeData: unknown = JSON.parse(
    await readFile(FINANCES_PATH, "utf8"),
  );
  validateFinances(financeData, directoryIds);
  const finances = financeData;

  const financeMap = new Map(
    finances.map((finance) => [finance.unitid, finance]),
  );

  const eligibleUniversities: University[] = [];
  const eligibleFinances: UniversityFinanceSummary[] = [];

  const stats: BuildStats = {
    total: directory.length,
    unmatched: 0,
    partialReporting: 0,
    missingTotals: 0,
    eligible: 0,
  };

  for (const university of directory) {
    const finance = financeMap.get(university.unitid);

    if (!finance) {
      stats.unmatched++;
      continue;
    }

    if (
      finance.parent_child_flag !== null &&
      EXCLUDED_FLAGS.has(finance.parent_child_flag)
    ) {
      stats.partialReporting++;
      continue;
    }

    if (!hasFinancialTotals(finance)) {
      stats.missingTotals++;
      continue;
    }

    eligibleUniversities.push(university);
    eligibleFinances.push(finance);
    stats.eligible++;
  }

  // Validate that both outputs contain exactly the same institutions.
  const universityIds = eligibleUniversities.map((u) => u.unitid);
  const financeIds = eligibleFinances.map((f) => f.unitid);

  if (
    universityIds.length !== financeIds.length ||
    universityIds.some((id, index) => id !== financeIds[index])
  ) {
    throw new Error("Published datasets contain mismatched UNITIDs.");
  }

  if (
    stats.total !==
    stats.unmatched +
      stats.partialReporting +
      stats.missingTotals +
      stats.eligible
  ) {
    throw new Error("Build statistics do not reconcile.");
  }

  console.log(`Directory institutions: ${stats.total}`);
  console.log(`Unmatched finance records: ${stats.unmatched}`);
  console.log(`Excluded partial reporting: ${stats.partialReporting}`);
  console.log(`Excluded missing totals: ${stats.missingTotals}`);
  console.log(`Eligible institutions: ${stats.eligible}`);

  if (!publish) {
    console.log("Dry run complete. No published files modified.");
    return;
  }
  if (eligibleUniversities.length === 0) {
    throw new Error("Cannot publish an empty institutional dataset.");
  }

  await writeJsonAtomic(UNIVERSITIES_OUTPUT, eligibleUniversities, 2);
  await writeJsonAtomic(FINANCES_OUTPUT, eligibleFinances);

  console.log("Published universities.json and finances.json");
}

const publish = process.argv.includes("--publish");

buildData(publish).catch((error: unknown) => {
  console.error("Data build failed:", error);
  process.exitCode = 1;
});
