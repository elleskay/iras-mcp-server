# iras-mcp-server

[![CI](https://github.com/elleskay/iras-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/elleskay/iras-mcp-server/actions/workflows/ci.yml)

MCP server exposing IRAS Singapore tax tools — lookup, estimate, and HITL escalation over the Model Context Protocol.

## Architecture

```
MCP Client (Claude Desktop / any client)
        |
       stdio
        |
  iras-mcp-server (server.mjs)
        |
     tools.mjs
   (lookup · estimate · escalate)
```

## Setup

```bash
npm install
node server.mjs   # manual test — press Ctrl+C to exit
```

The server communicates over stdio and produces no visible output until a client connects.

## Claude Desktop Integration

Add the following to your `claude_desktop_config.json` (found at `~/Library/Application Support/Claude/` on macOS or `%APPDATA%\Claude\` on Windows):

```json
{
  "mcpServers": {
    "iras-tax": {
      "command": "node",
      "args": ["ABSOLUTE_PATH_TO/server.mjs"]
    }
  }
}
```

Replace `ABSOLUTE_PATH_TO` with the actual absolute path to this file on disk, e.g. `C:/dev/iras-mcp-server/server.mjs`.

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `lookup_tax_info` | Look up factual Singapore tax rules (GST, income tax, corporate tax, SRS) | `topic` (string) |
| `calculate_tax_estimate` | Estimate chargeable income from gross income and deductions | `income` (number, SGD), `deductions` (number, SGD) |
| `escalate_to_human` | Escalate complex queries to a human tax advisor via hitl-queue.json | `reason` (string), `original_query` (string) |

## Notes

This server is a portfolio demonstration of the MCP server pattern. The tool handlers use hardcoded IRAS data — replace with a live IRAS API integration for production use.
