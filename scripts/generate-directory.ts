import { mkdir, writeFile } from "node:fs/promises";

const DIRECTORY_YEAR = 2023;
const OUTPUT_PATH = "public/data/universities.json";

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

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.urban.org/",
    },
  });

  if (!response.ok) {
    throw new Error(`IPEDS API error: ${response.status}`);
  }

  const data = (await response.json()) as IPEDSResponse;

  if (data.next !== null || data.results.length !== data.count) {
    throw new Error("Incomplete IPEDS directory response.");
  }

  const universities: University[] = data.results.map((university) => ({
    unitid: university.unitid,
    inst_name: university.inst_name,
    city: university.city,
    state_abbr: university.state_abbr,
    latitude: university.latitude,
    longitude: university.longitude,
  }));

  await mkdir("public/data", { recursive: true });

  await writeFile(OUTPUT_PATH, JSON.stringify(universities, null, 2), "utf8");

  console.log(`Saved ${universities.length} universities to ${OUTPUT_PATH}`);
}

generateDirectory().catch((error) => {
  console.error("Directory generation failed:", error);
  process.exitCode = 1;
});
