/*
 * Organizes IPEDS finance fields for presentation.
 * Labels and values remain sourced from API metadata and records.
 * Fields not listed here continue through the existing fallback grouping.
 * Subtotals and overlapping classifications should not be summed together.
 */

export const financeFields = {
  Revenue: {
    description:
      "Sources of institutional funding, including tuition, government support, gifts, investments, and other income.",
    groups: [
      {
        title: "Tuition & Fees",
        description:
          "Tuition revenue before and after discounts and allowances.",
        fields: ["rev_tuition_fees_net", "rev_tuition_fees_gross"],
      },
      {
        title: "Government Funding",
        description:
          "Revenue received through federal, state, and local government appropriations, grants, and contracts.",
        fields: [
          "rev_fed_approps_grants",
          "rev_state_local_approps_grants",
          "rev_appropriations_fed",
          "rev_appropriations_state",
          "rev_appropriations_local",
          "rev_grants_contracts_federal",
          "rev_grants_contracts_state",
          "rev_grants_contracts_local",
          "rev_capital_approps",
          "rev_capital_grants_gifts",
        ],
      },
      {
        title: "Private Gifts & Grants",
        description:
          "Contributions, grants, and contracts from private sources and affiliated organizations.",
        fields: ["rev_gifts_grants_contracts", "rev_affiliated_entities"],
      },
      {
        title: "Investment & Endowment Income",
        description:
          "Investment returns and income or additions associated with institutional endowments.",
        fields: [
          "rev_investment_return",
          "rev_endowment_income",
          "rev_endowment_additions",
        ],
      },
      {
        title: "Auxiliary & Educational Activities",
        description:
          "Revenue from auxiliary enterprises and educational services.",
        fields: [
          "rev_auxiliary_enterprises_net",
          "rev_auxiliary_enterprises_gross",
          "rev_edu_services_sales",
        ],
      },
      {
        title: "Other Revenue",
        description:
          "Revenue from hospitals, independent operations, and other institutional activities.",
        fields: [
          "rev_hospital",
          "rev_independent_operations",
          "rev_hosp_ind_op_other",
          "rev_other_operating",
          "rev_other_nonoperating",
          "rev_other",
          "rev_other_additions",
        ],
      },
      {
        title: "Revenue Totals",
        description:
          "Reported totals and subtotals; some figures overlap and should not be added together.",
        fields: [
          "rev_total_current",
          "rev_operating",
          "rev_nonoperating",
          "rev_additions",
        ],
      },
    ],
  },
  Expenditures: {
    description:
      "Institutional spending organized by function, natural expense type, and reported totals.",
    groups: [
      {
        title: "Instruction & Research",
        description:
          "Spending on teaching, research, and public service. Salary figures are components of functional totals.",
        fields: [
          "exp_instruc_total",
          "exp_instruc_salaries",
          "exp_research_total",
          "exp_research_salaries",
          "exp_pub_serv_total",
          "exp_pub_serv_salaries",
          "exp_res_pub_serv_total",
          "exp_res_pub_serv_salaries",
        ],
      },
      {
        title: "Academic & Student Support",
        description:
          "Spending on academic support, student services, and institutional administration.",
        fields: [
          "exp_acad_supp_total",
          "exp_acad_supp_salaries",
          "exp_student_serv_total",
          "exp_student_serv_salaries",
          "exp_inst_supp_total",
          "exp_inst_supp_salaries",
          "exp_acad_inst_student_total",
          "exp_acad_inst_student_salaries",
        ],
      },
      {
        title: "Auxiliary & Other Functions",
        description:
          "Spending on auxiliary enterprises, hospitals, independent operations, and other functions.",
        fields: [
          "exp_aux_ent_total",
          "exp_aux_ent_salaries",
          "exp_hospital_total",
          "exp_hospital_salaries",
          "exp_ind_op_total",
          "exp_ind_op_salaries",
          "exp_other_total_funct",
          "exp_other_salaries",
        ],
      },
      {
        title: "Scholarships & Fellowships",
        description:
          "Scholarship and fellowship expenses as reported within institutional expenditures.",
        fields: ["exp_net_grant_aid_total", "exp_net_grant_aid_salaries"],
      },
      {
        title: "Spending by Expense Type",
        description:
          "Natural expense classifications such as salaries, benefits, maintenance, depreciation, and interest. These can overlap with spending by function.",
        fields: [
          "exp_total_salaries",
          "exp_total_benefits",
          "exp_total_opm",
          "exp_total_depr",
          "exp_total_interest",
          "exp_total_other_nat",
        ],
      },
      {
        title: "Expenditure Totals",
        description: "Reported total current expenditures.",
        fields: ["exp_total_current"],
      },
    ],
  },
  "Scholarships and Financial Aid": {
    description:
      "Grants, institutional aid, and discounts or allowances affecting students and reported revenue.",
    groups: [
      {
        title: "Federal, State & Private Grants",
        description:
          "Student grant aid from government and private sources. Combined totals may overlap with individual source figures.",
        fields: [
          "sch_pell_grant",
          "sch_other_federal_grants",
          "sch_grants_state_local",
          "sch_grants_state",
          "sch_grants_local",
          "sch_grants_private",
        ],
      },
      {
        title: "Institutional Grants",
        description:
          "Aid funded by the institution, including restricted and unrestricted amounts.",
        fields: [
          "sch_grants_institutional",
          "sch_restricted_inst_grants",
          "sch_unrestricted_inst_grants",
        ],
      },
      {
        title: "Student Aid Totals",
        description:
          "Reported overall student aid and net scholarship expenses.",
        fields: ["sch_total_student_aid", "sch_exp_net_fellowships"],
      },
      {
        title: "Discounts & Allowances",
        description:
          "Tuition and auxiliary revenue reductions; source-specific totals can overlap with the applied amounts.",
        fields: [
          "sch_allowances_total",
          "sch_allowances_tuition_fees",
          "sch_allowances_aux_enterp",
          "sch_pell_disc",
          "sch_pell_disc_tuition",
          "sch_pell_disc_aux",
          "sch_other_fed_disc",
          "sch_oth_fed_disc_tuition",
          "sch_oth_fed_disc_aux",
          "sch_state_disc",
          "sch_state_disc_tuition",
          "sch_state_disc_aux",
          "sch_local_disc",
          "sch_local_disc_tuition",
          "sch_local_disc_aux",
        ],
      },
    ],
  },
  "Endowments & Investments": {
    description:
      "Endowment values, investment holdings, and related reporting indicators.",
    groups: [
      {
        title: "Endowment",
        description:
          "Reported endowment balances at the beginning and end of the fiscal year.",
        fields: ["endowment_end", "endowment_beg", "own_endowment_assets"],
      },
      {
        title: "Investment Holdings",
        description:
          "Long-term investments and capital-asset investment measures.",
        fields: ["longterm_investments", "invest_capital_assets"],
      },
    ],
  },
  Assets: {
    description:
      "Resources owned by the institution, including capital assets and reported net assets.",
    groups: [
      {
        title: "Asset Totals",
        description: "Overall asset balances and net assets.",
        fields: ["assets", "assets_net"],
      },
      {
        title: "Land, Buildings & Equipment",
        description:
          "Components of property, plant, and equipment; these figures may be included in broader asset totals.",
        fields: [
          "plant_property_equipment",
          "land_improvements",
          "infrastructure",
          "buildings",
          "equipment",
          "construction_in_progress",
          "other_plant_prop_equip",
        ],
      },
      {
        title: "Other Capital Assets",
        description: "Additional capital asset classifications.",
        fields: [
          "intangible_assets_net",
          "capital_assets_other",
          "depr_capital_assets",
        ],
      },
    ],
  },
  "Property & Equipment": {
    description:
      "Depreciation and carrying value of institutional property and equipment.",
    groups: [
      {
        title: "Depreciation & Net Value",
        description:
          "Accumulated depreciation and net property, plant, and equipment balances.",
        fields: ["depreciation_accumulated", "plant_prop_equip_net"],
      },
    ],
  },
  "Liabilities & Debt": {
    description: "Obligations, borrowing, and deferred accounting resources.",
    groups: [
      {
        title: "Liability Totals",
        description: "Reported liabilities and long-term debt.",
        fields: ["liabilities", "longterm_debt", "plant_prop_equip_debt"],
      },
      {
        title: "Deferred Resources",
        description:
          "Deferred inflows and outflows reported under applicable accounting standards.",
        fields: ["def_inflows_resources", "def_outflows_resources"],
      },
    ],
  },
  "Equity & Net Position": {
    description:
      "Institutional net assets or net position and changes across the fiscal year.",
    groups: [
      {
        title: "Equity & Net Assets",
        description: "Reported equity balances and adjustments.",
        fields: [
          "equity_total",
          "equity_beg",
          "net_equity_beg_adjust",
          "equity_end",
          "equity_changes_total",
          "equity_changes_other",
        ],
      },
      {
        title: "Net Position",
        description:
          "Reported net position and adjustments, often used by public institutions.",
        fields: [
          "position_net",
          "net_position_beginning",
          "net_position_adjustments",
          "net_position_change",
          "net_position_end",
        ],
      },
    ],
  },
  "Financial Summary": {
    description:
      "High-level totals for institutional revenue, expenses, and changes in net assets.",
    groups: [
      {
        title: "Annual Financial Results",
        description:
          "Summary figures are reported measures, not sums of the displayed subgroups.",
        fields: [
          "total_revenues_additions",
          "total_expenses_deductions",
          "income_net",
        ],
      },
    ],
  },
  Pensions: {
    description:
      "Pension obligations, expenses, and deferred pension-related resources.",
    groups: [
      {
        title: "Pension Reporting",
        description:
          "Reported pension liabilities, expenses, and accounting adjustments.",
        fields: [
          "pension_info_reported",
          "net_pension_liability",
          "pension_expense",
          "def_inflows_pension",
          "def_outflows_pension",
        ],
      },
    ],
  },
  Taxes: {
    description: "Reported institutional income tax expenses.",
    groups: [
      {
        title: "Income Taxes",
        description: "Federal, state, and local income tax expense.",
        fields: ["income_tax_fed", "income_tax_state"],
      },
    ],
  },
  "Institution Information": {
    description:
      "Identifiers and parent-child reporting relationships for the institution.",
    groups: [
      {
        title: "Institution Identifiers",
        description: "IPEDS identifiers and reporting year.",
        fields: ["unitid", "year", "fips"],
      },
      {
        title: "Parent & Child Reporting",
        description:
          "How the institution participates in consolidated financial reporting.",
        fields: [
          "parent_child_flag",
          "parent_child_system_flag",
          "parent_unitid",
          "parent_child_allocation",
        ],
      },
    ],
  },
  Enrollment: {
    description:
      "Full-time-equivalent enrollment measures reported or estimated for the institution.",
    groups: [
      {
        title: "Full-Time-Equivalent Enrollment",
        description:
          "Alternative FTE estimates may use different calculation methods.",
        fields: ["est_fte", "calc_fte", "rep_fte"],
      },
    ],
  },
  "Reporting & Accounting": {
    description:
      "Reporting forms and accounting treatments used by the institution.",
    groups: [
      {
        title: "Reporting Standards",
        description: "Reporting form and accounting conventions.",
        fields: ["reporting_form", "form_type", "gasb_alternative_accounting"],
      },
      {
        title: "Accounting Treatments",
        description:
          "Specific accounting treatments for grants and athletic expenditures.",
        fields: ["pell_grant_treatment", "athletic_expense_treatment"],
      },
    ],
  },
  "Economic Indicators": {
    description:
      "Price and cost indexes used for contextual financial analysis.",
    groups: [
      {
        title: "Price & Cost Indexes",
        description:
          "General and higher-education-specific price and cost measures.",
        fields: ["cpi", "hepi", "heca"],
      },
    ],
  },
} as const;
