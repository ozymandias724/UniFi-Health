/*
 * Fetch Education Data Portal variable metadata, decode labels, and save it
 * keyed by variable name for the Explorer's financial labels.
 * Run from the project root; the script replaces variables.json.
 */
import { writeJsonAtomic } from "./utils/writeJsonAtomic.ts";
import { requestJson } from "./utils/requestJson.ts";
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

  const data = (await requestJson(API_URL, {
    label: "Variables API",
  })) as APIResponse;

  // Ensure we received the complete dataset
  if (
    data.count === 0 ||
    data.next !== null ||
    data.results.length !== data.count
  ) {
    throw new Error("Empty or incomplete variable definitions response.");
  }

  // Convert the array into an object keyed by variable name
  const variables: Record<string, VariableMetadata> = {};

  for (const item of data.results) {
    if (Object.hasOwn(variables, item.variable)) {
      console.warn(`Duplicate variable definition: ${item.variable}`);
    }

    variables[item.variable] = {
      label: he.decode(item.label),
      format: item.format,
      data_type: item.data_type,
      values: item.values,
      description: item.description === "None" ? null : item.description,
    };
  }

  await writeJsonAtomic(OUTPUT_PATH, variables, 2);

  console.log(
    `Saved ${Object.keys(variables).length} variable definitions to ${OUTPUT_PATH}`,
  );
}

generateVariables().catch((error) => {
  console.error("Variable generation failed:", error);
  process.exitCode = 1;
});
