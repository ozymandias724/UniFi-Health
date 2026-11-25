/**
 * Fetch the annual directory of active, degree-granting,
 * four-year institutions and save a source snapshot to data/raw.
 *
 * Run from the project root.
 * Does not modify the application's published university directory.
 */
import { writeJsonAtomic } from "./utils/writeJsonAtomic.ts";
import { parseReportingYear } from "./utils/parseReportingYear.ts";

import { requestJson } from "./utils/requestJson.ts";

const DIRECTORY_YEAR = parseReportingYear();

const OUTPUT_PATH = `data/raw/directory-${DIRECTORY_YEAR}.json`;

interface University {
  unitid: number;
  inst_name: string;
  city: string;
  state_abbr: string;
  latitude: number | null;
  longitude: number | null;
}

interface IPEDSResponse {
  count: number;
  next: string | null;
  results: University[];
}

async function generateDirectory(): Promise<void> {
  const url = new URL(
    `https://educationdata.urban.org/api/v1/college-university/ipeds/directory/${DIRECTORY_YEAR}/`,
  );

  url.searchParams.set("degree_granting", "1");
  url.searchParams.set("currently_active_ipeds", "1");
  url.searchParams.set("institution_level", "4");

  console.log(`Fetching IPEDS directory for ${DIRECTORY_YEAR}...`);

  const data = (await requestJson(url, {
    label: "IPEDS API",
  })) as IPEDSResponse;

  if (
    data.count === 0 ||
    data.next !== null ||
    data.results.length !== data.count
  ) {
    throw new Error("Empty or incomplete IPEDS directory response.");
  }

  const universities: University[] = data.results.map((university) => ({
    unitid: university.unitid,
    inst_name: university.inst_name,
    city: university.city,
    state_abbr: university.state_abbr,
    latitude: university.latitude,
    longitude: university.longitude,
  }));

  await writeJsonAtomic(OUTPUT_PATH, universities, 2);

  console.log(`Saved ${universities.length} universities to ${OUTPUT_PATH}`);
}

generateDirectory().catch((error) => {
  console.error("Directory generation failed:", error);
  process.exitCode = 1;
});
