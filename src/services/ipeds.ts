/*
 * Shared IPEDS data shapes and fetch functions. The directory, variable
 * metadata, and map summaries are static JSON served from Vite's base URL.
 * Detailed Explorer records are fetched from the Education Data Portal API.
 *
 * Nullable fields represent unavailable values; callers decide how to render
 * or exclude them. Failed HTTP responses throw so pages can report errors.
 */
import type {
  FinanceRecord,
  UniversityFinanceSummary,
} from "../types/finance.ts";
import type { University } from "../types/university.ts";
import type { VariableMetadata } from "../types/metadata.ts";

import { DEFAULT_YEAR } from "../config/reportingYears.ts";
import { fetchJson } from "../utils/fetchJson.ts";

const DATA_URL = `${import.meta.env.BASE_URL}data`;

export function getFinanceSummaries(
  year: number = DEFAULT_YEAR,
  signal?: AbortSignal,
): Promise<UniversityFinanceSummary[]> {
  return fetchJson<UniversityFinanceSummary[]>(
    `${DATA_URL}/${year}/finances.json`,
    "Failed to load financial summaries",
    signal,
  );
}

export function getUniversities(
  year: number = DEFAULT_YEAR,
  signal?: AbortSignal,
): Promise<University[]> {
  return fetchJson<University[]>(
    `${DATA_URL}/${year}/universities.json`,
    "Failed to load university directory",
    signal,
  );
}

export function getVariables(
  signal?: AbortSignal,
): Promise<Record<string, VariableMetadata>> {
  return fetchJson<Record<string, VariableMetadata>>(
    `${DATA_URL}/variables.json`,
    "Failed to load variable metadata",
    signal,
  );
}

export async function getUniversityFinances(
  unitid: number,
  year: number,
  signal?: AbortSignal,
): Promise<FinanceRecord | null> {
  const url = new URL(
    `https://educationdata.urban.org/api/v1/college-university/ipeds/finance/${year}/`,
  );

  url.searchParams.set("unitid", String(unitid));

  const data = await fetchJson<{ results: FinanceRecord[] }>(
    url,
    "Finance API error",
    signal,
  );

  if (!Array.isArray(data?.results)) {
    throw new Error("Finance API returned an invalid response.");
  }

  return data.results[0] ?? null;
}
