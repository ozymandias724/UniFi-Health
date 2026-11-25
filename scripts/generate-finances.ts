/*
 * Generate map finance summaries for institutions in the selected
 * reporting year's raw directory.
 * Requests are batched and paginated, with retries for transient failures.
 * Missing/suppressed values are normalized to null, and output is validated
 * before replacing the previous file. See generate-finances.test.ts for
 * failure and data-normalization cases.
 */

import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { UniversityFinanceSummary } from "../src/types/finance.ts";

import { isRecord, isUnitid } from "./utils/validation.ts";
import { parseReportingYear } from "./utils/parseReportingYear.ts";
import { writeJsonAtomic } from "./utils/writeJsonAtomic.ts";

const YEAR = parseReportingYear();

const API_URL = `https://educationdata.urban.org/api/v1/college-university/ipeds/finance/${YEAR}/`;
const DIRECTORY_PATH = `data/raw/directory-${YEAR}.json`;
const OUTPUT_PATH = `data/raw/finances-${YEAR}.json`;
const BATCH_SIZE = 300;
const MAX_ATTEMPTS = 3;

import { SUMMARY_FIELDS } from "../src/config/financeSummaryFields.ts";

function makeSummary(
  unitid: number,
  record: Record<string, unknown> = {},
): UniversityFinanceSummary {
  const summary = { unitid, year: YEAR } as UniversityFinanceSummary;
  for (const field of SUMMARY_FIELDS) {
    summary[field] = financeValue(record[field]);
  }
  return summary;
}

interface RequestCounter {
  count: number;
}

function financeValue(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value !== -1 &&
    value !== -2 &&
    value !== -3
    ? value
    : null;
}

async function requestPage(
  url: string,
  requests: RequestCounter,
): Promise<unknown> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response: Response;
    try {
      requests.count++;
      response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://www.urban.org/",
        },
        signal: AbortSignal.timeout(60000),
      });
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(
          `Finance API request failed after ${attempt} attempts`,
          {
            cause: error,
          },
        );
      }
      console.warn(
        `Finance API request failed; retrying (attempt ${attempt + 1}/${MAX_ATTEMPTS}).`,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, 500 * 2 ** (attempt - 1)),
      );
      continue;
    }

    if (response.ok) {
      try {
        return await response.json();
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error("Finance API returned invalid JSON.", {
            cause: error,
          });
        }
        if (attempt === MAX_ATTEMPTS) {
          throw new Error(
            `Finance API response failed after ${attempt} attempts`,
            {
              cause: error,
            },
          );
        }
        console.warn(
          `Finance API response failed; retrying (attempt ${attempt + 1}/${MAX_ATTEMPTS}).`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * 2 ** (attempt - 1)),
        );
        continue;
      }
    }
    if (
      (response.status === 429 || response.status >= 500) &&
      attempt < MAX_ATTEMPTS
    ) {
      console.warn(
        `Finance API returned ${response.status}; retrying (attempt ${attempt + 1}/${MAX_ATTEMPTS}).`,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, 500 * 2 ** (attempt - 1)),
      );
      continue;
    }
    throw new Error(
      `Finance API error: ${response.status} ${response.statusText}`,
    );
  }
  throw new Error("Finance API request exhausted its retries.");
}

async function fetchBatch(
  unitids: number[],
  records: Map<number, UniversityFinanceSummary>,
  requests: RequestCounter,
): Promise<void> {
  const url = new URL(API_URL);
  const filter = unitids.join(",");
  url.searchParams.set("unitid", filter);
  const requested = new Set(unitids);
  const visited = new Set<string>();
  let next: string | null = url.href;
  let expectedCount: number | null = null;
  let received = 0;

  while (next !== null) {
    const pageUrl = new URL(next, API_URL);
    if (
      pageUrl.origin !== url.origin ||
      pageUrl.pathname !== url.pathname ||
      pageUrl.searchParams.get("unitid") !== filter ||
      visited.has(pageUrl.href)
    ) {
      throw new Error("Invalid or repeated finance API pagination URL.");
    }
    visited.add(pageUrl.href);

    const data = await requestPage(pageUrl.href, requests);
    if (
      !isRecord(data) ||
      typeof data.count !== "number" ||
      !Number.isSafeInteger(data.count) ||
      data.count < 0 ||
      !Array.isArray(data.results) ||
      (data.next !== null && typeof data.next !== "string")
    ) {
      throw new Error("Unexpected finance API response.");
    }
    if (expectedCount === null) expectedCount = data.count;
    if (data.count !== expectedCount || expectedCount > unitids.length) {
      throw new Error("Inconsistent finance API record count.");
    }

    for (const record of data.results) {
      if (
        !isRecord(record) ||
        !isUnitid(record.unitid) ||
        !requested.has(record.unitid) ||
        record.year !== YEAR ||
        records.has(record.unitid)
      ) {
        throw new Error("Unexpected or duplicate finance API record.");
      }
      records.set(record.unitid, makeSummary(record.unitid, record));
    }

    received += data.results.length;
    if (
      received > expectedCount ||
      (data.results.length === 0 && data.next !== null)
    ) {
      throw new Error("Incomplete or inconsistent finance API pagination.");
    }
    next = data.next;
  }

  if (received !== expectedCount) {
    throw new Error("Incomplete finance API response.");
  }
}

function validateSummaries(
  summaries: UniversityFinanceSummary[],
  unitids: number[],
): void {
  const expected = new Set(unitids);
  const seen = new Set<number>();
  const fields = ["unitid", "year", ...SUMMARY_FIELDS];
  for (const summary of summaries) {
    if (
      !isUnitid(summary.unitid) ||
      !expected.has(summary.unitid) ||
      seen.has(summary.unitid) ||
      summary.year !== YEAR ||
      Object.keys(summary).length !== fields.length ||
      fields.some((field) => !Object.hasOwn(summary, field)) ||
      SUMMARY_FIELDS.some(
        (field) =>
          summary[field] !== null &&
          financeValue(summary[field]) !== summary[field],
      )
    ) {
      throw new Error("Invalid financial summary.");
    }
    seen.add(summary.unitid);
  }
  if (seen.size !== summaries.length) {
    throw new Error("Duplicate financial summaries detected.");
  }
}

export async function generateFinances(
  directoryPath = DIRECTORY_PATH,
  outputPath = OUTPUT_PATH,
): Promise<void> {
  const directory: unknown = JSON.parse(await readFile(directoryPath, "utf8"));
  if (!Array.isArray(directory) || directory.length === 0) {
    throw new Error("University directory must be a nonempty array.");
  }
  const unitids: number[] = [];
  const seen = new Set<number>();
  for (const university of directory) {
    if (
      !isRecord(university) ||
      !isUnitid(university.unitid) ||
      seen.has(university.unitid)
    ) {
      throw new Error(
        "University directory contains an invalid or duplicate unitid.",
      );
    }
    unitids.push(university.unitid);
    seen.add(university.unitid);
  }

  const records = new Map<number, UniversityFinanceSummary>();
  const requests = { count: 0 };
  for (let offset = 0; offset < unitids.length; offset += BATCH_SIZE) {
    const batch = unitids.slice(offset, offset + BATCH_SIZE);
    console.log(
      `Fetching finance records for ${offset + 1}-${offset + batch.length} of ${unitids.length} universities...`,
    );
    await fetchBatch(batch, records, requests);
  }

  const summaries = unitids
    .filter((unitid) => records.has(unitid))
    .map((unitid) => records.get(unitid)!);

  if (summaries.length === 0) {
    throw new Error("No financial records returned for the reporting year.");
  }

  validateSummaries(summaries, unitids);

  const bytes = await writeJsonAtomic(outputPath, summaries);

  const usable = summaries.filter(
    (summary) =>
      summary.total_revenues_additions !== null &&
      summary.total_expenses_deductions !== null,
  ).length;
  console.log(`Universities processed: ${unitids.length}`);
  console.log(`Financial records matched: ${records.size}`);
  console.log(
    `Universities without financial records: ${unitids.length - records.size}`,
  );
  console.log(`Universities with usable revenue and expense data: ${usable}`);
  console.log(`API requests: ${requests.count}`);
  console.log(`Saved ${outputPath} (${bytes} bytes)`);
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  generateFinances().catch((error: unknown) => {
    console.error("Finance generation failed:", error);
    process.exitCode = 1;
  });
}
