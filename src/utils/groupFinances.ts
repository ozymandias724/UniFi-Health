/*
 * Organizes IPEDS financial data using the presentation configuration.
 * Configured fields appear in their specified order; unconfigured fields
 * remain visible in fallback groups using the existing category classifier.
 */
import type { FinanceRecord } from "../types/finance.ts";
import type { VariableMetadata } from "../types/metadata.ts";

import {
  financeFields,
  type FinanceSectionConfig,
} from "../config/financeFields.ts";

import { getFinanceCategory } from "./getFinanceCategory.ts";

export type FinanceEntry = [string, number | null];

export interface FinanceGroup {
  title: string;
  description?: string;
  fields: FinanceEntry[];
}

export interface FinanceSection {
  title: string;
  description?: string;
  groups: FinanceGroup[];
}

export function groupFinances(
  finances: FinanceRecord,
  variables: Record<string, VariableMetadata>,
): FinanceSection[] {
  const record: Record<string, number | null> = finances;
  const assigned = new Set<string>();
  const sections: FinanceSection[] = [];
  const configured: Record<string, FinanceSectionConfig> = financeFields;

  for (const [title, config] of Object.entries(configured)) {
    const groups: FinanceGroup[] = [];

    for (const group of config.groups) {
      const fields: FinanceEntry[] = [];

      for (const key of group.fields) {
        if (Object.hasOwn(record, key) && !assigned.has(key)) {
          fields.push([key, record[key]]);
          assigned.add(key);
        }
      }

      if (fields.length > 0) {
        groups.push({
          title: group.title,
          description: group.description,
          fields,
        });
      }
    }

    if (groups.length > 0) {
      sections.push({ title, description: config.description, groups });
    }
  }

  const fallback = new Map<string, FinanceEntry[]>();

  for (const [key, value] of Object.entries(finances)) {
    if (assigned.has(key)) continue;
    const category = getFinanceCategory(key, variables[key]?.label ?? key);
    const fields = fallback.get(category) ?? [];
    fields.push([key, value]);
    fallback.set(category, fields);
  }

  for (const [category, fields] of fallback) {
    const existing = sections.find((section) => section.title === category);
    const group: FinanceGroup = {
      title: existing ? "Other Fields" : category,
      fields,
    };

    if (existing) {
      existing.groups.push(group);
    } else {
      sections.push({ title: category, groups: [group] });
    }
  }

  return sections;
}
