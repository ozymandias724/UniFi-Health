export interface University {
  unitid: number;
  inst_name: string;
  city: string;
  state_abbr: string;
  latitude: number | null;
  longitude: number | null;
}

// Financial data for one university in one reporting year
export interface FinanceRecord {
  unitid: number;
  year: number;

  // Financial overview
  total_revenues_additions: number | null;
  total_expenses_deductions: number | null;
  income_net: number | null;

  // Assets and liabilities
  assets: number | null;
  liabilities: number | null;
  endowment_end: number | null;

  // Enrollment
  est_fte: number | null;

  // Revenue
  rev_tuition_fees_net: number | null;
  rev_appropriations_state: number | null;
  rev_fed_approps_grants: number | null;
  rev_gifts_grants_contracts: number | null;
  rev_auxiliary_enterprises_net: number | null;
  rev_investment_return: number | null;

  // Expenditures
  exp_instruc_total: number | null;
  exp_research_total: number | null;
  exp_pub_serv_total: number | null;
  exp_acad_supp_total: number | null;
  exp_student_serv_total: number | null;
  exp_inst_supp_total: number | null;
  exp_aux_ent_total: number | null;
}

export interface VariableMetadata {
  label: string;
  format: string;
  data_type: string;
  values: string;
  description: string | null;
}

// Fetch the list of universities from a local JSON file
export async function getUniversities(): Promise<University[]> {
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/universities.json`,
  );

  if (!response.ok) {
    throw new Error(`Failed to load university directory: ${response.status}`);
  }

  return (await response.json()) as University[];
}

export async function getVariables(): Promise<
  Record<string, VariableMetadata>
> {
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/variables.json`,
  );

  if (!response.ok) {
    throw new Error(`Failed to load variable metadata: ${response.status}`);
  }

  return (await response.json()) as Record<string, VariableMetadata>;
}

// Fetch financial data for a specific university and year using the Urban Institute Education Data API
export async function getUniversityFinances(
  unitid: number,
  year: number,
): Promise<FinanceRecord | null> {
  const url = new URL(
    `https://educationdata.urban.org/api/v1/college-university/ipeds/finance/${year}/`,
  );

  url.searchParams.set("unitid", String(unitid));

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Finance API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    results: FinanceRecord[];
  };

  return data.results[0] ?? null;
}
