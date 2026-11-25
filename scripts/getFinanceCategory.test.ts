import assert from "node:assert/strict";
import { test } from "node:test";

import { getFinanceCategory } from "../src/utils/getFinanceCategory.ts";

test("classifies financial summary fields", () => {
  for (const key of [
    "total_revenues_additions",
    "total_expenses_deductions",
    "income_net",
  ]) {
    assert.equal(getFinanceCategory(key, ""), "Financial Summary");
  }
});

test("classifies primary financial field prefixes", () => {
  assert.equal(getFinanceCategory("rev_example", ""), "Revenue");
  assert.equal(getFinanceCategory("exp_example", ""), "Expenditures");
  assert.equal(
    getFinanceCategory("sch_example", ""),
    "Scholarships and Financial Aid",
  );
});

test("classifies fields using metadata labels", () => {
  const cases = [
    ["Endowment balance", "Endowments & Investments"],
    ["Total assets", "Other"],
    ["Assets: Total", "Assets"],
    ["Pension expense", "Pensions"],
    ["Long-term debt", "Liabilities & Debt"],
    ["Accumulated depreciation", "Property & Equipment"],
    ["Ending net position", "Equity & Net Position"],
    ["Full-time equivalent enrollment", "Enrollment"],
    ["Consumer price index", "Economic Indicators"],
  ];

  for (const [label, expected] of cases) {
    assert.equal(getFinanceCategory("example", label), expected);
  }
});

test("classifies institutional and reporting fields", () => {
  assert.equal(getFinanceCategory("unitid", ""), "Institution Information");

  assert.equal(
    getFinanceCategory("parent_unitid", ""),
    "Institution Information",
  );

  assert.equal(
    getFinanceCategory("reporting_form", ""),
    "Reporting & Accounting",
  );

  assert.equal(getFinanceCategory("income_tax_fed", ""), "Taxes");
});

test("preserves unknown fields through the Other category", () => {
  assert.equal(getFinanceCategory("unknown_field", "Unknown field"), "Other");
});
