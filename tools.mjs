import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HITL_QUEUE = join(__dirname, "hitl-queue.json");

// --- Handlers ---

export function lookup_tax_info({ topic }) {
  const facts = {
    gst: "GST registration threshold: SGD 1,000,000 in taxable turnover over 12 months.",
    income_tax: "Income tax e-filing deadline: 18 April (paper: 15 April). Progressive rates apply.",
    corporate_tax: "Corporate income tax rate: 17% (flat). Partial exemptions apply for qualifying companies.",
    srs: "SRS (Supplementary Retirement Scheme) annual contribution limit: SGD 15,300 for Singapore Citizens/PRs; SGD 35,700 for foreigners.",
  };
  const key = topic.toLowerCase().replace(/\s+/g, "_");
  for (const [k, v] of Object.entries(facts)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return `No specific fact found for "${topic}". Available topics: GST, income tax, corporate tax, SRS.`;
}

export function calculate_tax_estimate({ income, deductions }) {
  const chargeableIncome = Math.max(0, Number(income) - Number(deductions));
  return (
    `Estimated chargeable income: SGD ${chargeableIncome.toLocaleString()}. ` +
    `(Income SGD ${Number(income).toLocaleString()} minus deductions SGD ${Number(deductions).toLocaleString()}.) ` +
    `This is a rough estimate only — actual tax liability depends on reliefs, residency status, and IRAS assessment. ` +
    `Consult a tax professional for personalised advice.`
  );
}

export function escalate_to_human({ reason, original_query }) {
  const queue = existsSync(HITL_QUEUE)
    ? JSON.parse(readFileSync(HITL_QUEUE, "utf8"))
    : [];
  const entry = { id: Date.now(), timestamp: new Date().toISOString(), reason, original_query, status: "pending" };
  queue.push(entry);
  writeFileSync(HITL_QUEUE, JSON.stringify(queue, null, 2));
  return `Your query has been escalated to a human tax advisor (case #${entry.id}). They will follow up with personalised advice. Please do not act on any figures discussed here as final tax advice.`;
}

// --- Tool definitions (MCP/JSON Schema format) ---

export const tools = [
  {
    name: "lookup_tax_info",
    description: "Look up factual information about Singapore tax rules. Use for general questions about GST, income tax, corporate tax rates, or SRS limits.",
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", description: "Tax topic to look up, e.g. 'GST', 'income tax', 'corporate tax', 'SRS'" },
      },
      required: ["topic"],
    },
  },
  {
    name: "calculate_tax_estimate",
    description: "Calculate a rough chargeable income estimate. Always disclose this is an estimate, not a final tax computation.",
    inputSchema: {
      type: "object",
      properties: {
        income: { type: "number", description: "Annual gross income in SGD" },
        deductions: { type: "number", description: "Total deductions/reliefs in SGD" },
      },
      required: ["income", "deductions"],
    },
  },
  {
    name: "escalate_to_human",
    description: "Escalate to a human tax advisor when the query requires personalised advice, involves complex situations, or goes beyond standard FAQ answers.",
    inputSchema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Why this needs human review" },
        original_query: { type: "string", description: "The user's original question verbatim" },
      },
      required: ["reason", "original_query"],
    },
  },
];

// --- Dispatcher ---

export function executeTool(name, input) {
  switch (name) {
    case "lookup_tax_info": return lookup_tax_info(input);
    case "calculate_tax_estimate": return calculate_tax_estimate(input);
    case "escalate_to_human": return escalate_to_human(input);
    default: throw new Error(`Unknown tool: ${name}`);
  }
}
