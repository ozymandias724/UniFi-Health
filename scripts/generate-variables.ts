import { mkdir, writeFile } from "node:fs/promises";
import * as he from "he";

const API_URL = "https://educationdata.urban.org/api/v1/api-variables";
const OUTPUT_PATH = "public/data/variables.json";

// One variable definition returned by Urban Institute
interface APIVariable {
  variable: string;
  label: string;
  format: string;
  data_type: string;
  values: string;
  string_length: string;
  is_filter: string;
  description: string;
}

// API response structure
interface APIResponse {
  count: number;
  next: string | null;
  results: APIVariable[];
}

// Metadata we want to save
interface VariableMetadata {
  label: string;
  format: string;
  data_type: string;
  values: string;
  description: string | null;
}

async function generateVariables(): Promise<void> {
  console.log("Fetching Urban Institute variable definitions...");

  const response = await fetch(API_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.urban.org/",
    },
  });

  if (!response.ok) {
    throw new Error(`Variables API error: ${response.status}`);
  }

  const data = (await response.json()) as APIResponse;

  // Ensure we received the complete dataset
  if (data.next !== null || data.results.length !== data.count) {
    throw new Error("Incomplete variable definitions response.");
  }

  // Convert the array into an object keyed by variable name
  const variables: Record<string, VariableMetadata> = {};

  for (const item of data.results) {
    variables[item.variable] = {
      label: he.decode(item.label),
      format: item.format,
      data_type: item.data_type,
      values: item.values,
      description: item.description === "None" ? null : item.description,
    };
  }

  await mkdir("public/data", { recursive: true });

  await writeFile(OUTPUT_PATH, JSON.stringify(variables, null, 2), "utf8");

  console.log(
    `Saved ${Object.keys(variables).length} variable definitions to ${OUTPUT_PATH}`,
  );
}

generateVariables().catch((error) => {
  console.error("Variable generation failed:", error);
  process.exitCode = 1;
});
