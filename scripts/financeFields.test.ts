import assert from "node:assert/strict";
import { test } from "node:test";

import { financeFields } from "../src/config/financeFields.ts";

test("configured financial fields are unique", () => {
  const assigned = new Set<string>();

  for (const section of Object.values(financeFields)) {
    for (const group of section.groups) {
      for (const field of group.fields) {
        assert.ok(!assigned.has(field), `Duplicate configured field: ${field}`);

        assigned.add(field);
      }
    }
  }
});

test("configured sections contain groups", () => {
  for (const [title, section] of Object.entries(financeFields)) {
    assert.ok(section.groups.length > 0, `Empty section: ${title}`);
  }
});

test("configured groups contain fields", () => {
  for (const section of Object.values(financeFields)) {
    for (const group of section.groups) {
      assert.ok(group.fields.length > 0, `Empty group: ${group.title}`);
    }
  }
});
