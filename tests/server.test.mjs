import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  lookup_tax_info,
  calculate_tax_estimate,
  escalate_to_human,
} from "../tools.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HITL_QUEUE = join(__dirname, "../hitl-queue.json");

test("lookup_tax_info returns GST threshold", () => {
  const result = lookup_tax_info({ topic: "gst" });
  assert.ok(result.includes("1,000,000"), `Expected "1,000,000" in: ${result}`);
});

test("calculate_tax_estimate returns correct chargeable income", () => {
  const result = calculate_tax_estimate({ income: 100000, deductions: 20000 });
  assert.ok(result.includes("80,000"), `Expected "80,000" in: ${result}`);
});

test("escalate_to_human writes to queue and returns case number", () => {
  try {
    const result = escalate_to_human({ reason: "test", original_query: "test query" });
    assert.ok(result.includes("case #"), `Expected "case #" in: ${result}`);
  } finally {
    if (existsSync(HITL_QUEUE)) unlinkSync(HITL_QUEUE);
  }
});
